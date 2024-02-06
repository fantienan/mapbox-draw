import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import polygonSplitter from 'polygon-splitter';
import hat from 'hat';
import cut, { getCutDefaultOptions, lineTypes } from './utils';
import draw_line_string from '../../modes/draw_line_string';
import xtend from 'xtend';

const {
  onSetup: originOnSetup,
  onMouseMove: originOnMouseMove,
  clickOnVertex: originClickOnVertex,
  onStop: originOnStop,
  onKeyUp: originOnKeyUp,
  onTrash: originOnTrash,
  ...restOriginMethods
} = draw_line_string;
const CutLineMode = {
  originOnTrash,
  originOnSetup,
  originOnKeyUp,
  originOnStop,
  originOnMouseMove,
  originClickOnVertex,
  ...restOriginMethods,
  ...cut,
};
CutLineMode.onSetup = function (opt) {
  const options = xtend(getCutDefaultOptions(), opt);
  const { featureIds, highlightColor } = options;

  if (options.bufferOptions.width > 0 && !options.bufferOptions.unit) {
    throw new Error('Please provide a valid bufferOptions.unit');
  }

  let features = [];
  if (featureIds.length) {
    features = featureIds.map((id) => this.getFeature(id).toGeoJSON());
  } else {
    features = this.getSelected().map((f) => f.toGeoJSON());
  }

  if (!features.length) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon or LineString or MultiLineString) to split!');
  }
  this._options = options;
  this._features = features;
  const state = this.originOnSetup({ button: Constants.modes.CUT_LINE });
  this._batchHighlight(features, highlightColor);
  return this.setState(state);
};

CutLineMode.clickOnVertex = function (state) {
  this.originClickOnVertex(state, () => {
    const cuttingLineString = state.line.toGeoJSON();
    cuttingLineString.geometry.coordinates[0].splice(state.currentVertexPosition, 1);
    this._cut(cuttingLineString);
    if (this._options.continuous) {
      this._resetState();
    } else {
      this.deleteFeature([state.line.id], { silent: true });
    }
  });
};

CutLineMode._cut = function (cuttingLineString) {
  let splitter;
  let buffered;
  const { bufferOptions, highlightColor } = this._options;
  const { width: lineWidth, unit: lineWidthUnit } = bufferOptions;
  const { store, api } = this._ctx;
  const endCoord = cuttingLineString.geometry.coordinates[cuttingLineString.geometry.coordinates.length - 1];
  const startPoint = turf.point(cuttingLineString.geometry.coordinates[0]);
  const endPoint = turf.point(endCoord);
  const undoStack = { geoJson: cuttingLineString, polygons: [], lines: [] };

  this._features.forEach((feature) => {
    if (turf.booleanDisjoint(feature, cuttingLineString)) {
      console.warn(`Line was outside of Polygon ${feature.id}`);
      return;
    }

    if (!(turf.booleanDisjoint(feature, startPoint) && turf.booleanDisjoint(feature, endPoint))) {
      console.warn(`The start and end points of the line must be outside of the poly`);
      return;
    }
    store.get(feature.id).measure.delete();
    if (lineTypes.includes(feature.geometry.type)) {
      if (!lineWidth) {
        const cuted = turf.lineSplit(feature, cuttingLineString);
        cuted.features.sort((a, b) => turf.length(a) - turf.length(b));
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach((id, i) => (cuted.features[i].id = id));
        this._continuous(() => this._batchHighlight(cuted.features, highlightColor));
        undoStack.lines.push({ cuted, line: feature });
      } else {
        if (!splitter) {
          buffered = turf.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit });
          splitter = turf.polygonToLine(buffered);
        }
        let cuted = turf.lineSplit(feature, splitter);
        // cuted.features = cuted.features.reduce((prev, curr) => {
        //   if (!turf.booleanWithin(curr, buffered)) prev.push({ ...curr, id: hat() });
        //   return prev;
        // }, []);
        const intersecting = turf.featureCollection([]);
        cuted.features.forEach((v) => (v.id = hat()));
        const intersectPoints = turf.lineIntersect(feature, cuttingLineString);
        intersectPoints.features.forEach((p) => {
          const buffered = turf.buffer(p, 0.1, { units: 'meters' });
          cuted.features = cuted.features.filter((f) => turf.booleanDisjoint(buffered, f));
        });
        cuted.features.sort((a, b) => turf.length(a) - turf.length(b));
        if (cuted.features.length !== 0) {
          cuted.features[0].id = feature.id;
          api.add(cuted, { silent: true });
          undoStack.lines.push({ cuted, line: feature });
          this._continuous(() => this._batchHighlight(cuted.features, highlightColor));
        } else {
          api.delete(feature.id, { silent: true });
          undoStack.lines.push({ cuted: turf.featureCollection([feature]), line: feature });
          this._continuous();
        }
      }
      return;
    }

    let afterCut;
    const item = {};
    if (!lineWidth) {
      afterCut = polygonSplitter(feature.geometry, cuttingLineString.geometry);
    } else {
      const buffered = turf.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit });
      item.intersect = turf.intersect(feature, buffered);
      afterCut = turf.difference(feature.geometry, buffered);
    }
    if (afterCut) {
      const newFeature = this.newFeature(afterCut);
      const [f, ...rest] = newFeature.features.sort((a, b) => turf.area(a) - turf.area(b));
      f.id = feature.id;
      api.add(turf.featureCollection(rest.map((v) => v.toGeoJSON())), { silent: true });
      this.addFeature(f);
      this._execMeasure(f);
      this._continuous(() => this._batchHighlight(newFeature.features, highlightColor));
      item.cuted = turf.featureCollection([f.toGeoJSON(), ...rest.map((v) => v.toGeoJSON())]);
    } else {
      api.delete(feature.id, { silent: true });
      this._continuous();
      item.cuted = turf.featureCollection([feature]);
    }
    if (item.cuted) {
      if (item.intersect) item.intersect = turf.featureCollection([item.intersect]);
      undoStack.polygons.push(item);
    }
  });

  this.redoUndo.setRedoUndoStack(({ undoStack: u }) => ({ undoStack: [...u, undoStack] }));
  store.setDirty();
};

CutLineMode.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.originOnMouseMove(state, e);
};

CutLineMode.onStop = function (state) {
  const featureIds = this._features.map((v) => v.id);
  this.originOnStop(state, () => {
    this._cancelCut();
    this.deleteFeature([state.line.id], { silent: true });
  });
  return { featureIds };
};

CutLineMode.undo = function () {
  const { type, stack } = this.redoUndo.undo() || {};

  if (type !== 'cut') return;
  const { store } = this._ctx;
  this.beforeRender(() => {
    const state = this.getState();
    const redoStack = { geoJson: stack.geoJson };
    stack.polygons.forEach((item) => {
      if (item.intersect) item.cuted.features.push(...item.intersect.features);
      // 将features合并为一个feature
      const f = item.cuted.features.shift();
      store.get(f.id).measure.delete();
      const combine = turf.combine(item.cuted);
      // 将两个feature合并为一个feature
      const nuionFeature = this.newFeature(turf.union(f, combine.features[0]));
      nuionFeature.id = f.id;
      item.cuted.features.forEach((v) => this.deleteFeature(v.id));
      this.addFeature(nuionFeature);
      this._execMeasure(nuionFeature);
      this._setHighlight(nuionFeature.id, this._options.highlightColor);
    });
    this._undoByLines(stack);

    state.currentVertexPosition = stack.geoJson.geometry.coordinates.length - 1;
    state.line.setCoordinates(stack.geoJson.geometry.coordinates);
    this.redoUndo.setRedoUndoStack(({ redoStack: r }) => ({ redoStack: [...r, redoStack] }));
    this._updateFeatures();
  });
};

CutLineMode.redo = function () {
  const res = this.redoUndo.redo() || {};
  const { type, stack } = res;
  if (type !== 'cut') return;
  this.beforeRender(() => {
    this._cut(stack.geoJson);
    this._resetState();
  });
};

CutLineMode._resetState = function () {
  const state = this.getState();
  state.currentVertexPosition = 0;
  state.line.setCoordinates([]);
};

export default CutLineMode;
