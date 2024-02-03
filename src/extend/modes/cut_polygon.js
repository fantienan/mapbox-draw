import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import draw_polygon from '../../modes/draw_polygon';
import xtend from 'xtend';
import cut, { geojsonTypes, getCutDefaultOptions, lineTypes } from './utils';

const {
  onSetup: originOnSetup,
  onMouseMove: originOnMouseMove,
  clickOnVertex: originClickOnVertex,
  onStop: originOnStop,
  onTrash: originOnTrash,
  onKeyUp: originOnKeyUp,
  ...restOriginMethods
} = draw_polygon;

const CutPolygonMode = {
  originOnSetup,
  originOnKeyUp,
  originOnMouseMove,
  originClickOnVertex,
  originOnStop,
  originOnTrash,
  ...restOriginMethods,
  ...cut,
};

CutPolygonMode.onSetup = function (opt) {
  const options = xtend(getCutDefaultOptions(), opt);
  const { highlightColor, featureIds } = options;

  let features = [];
  if (featureIds.length) {
    features = featureIds.map((id) => this.getFeature(id).toGeoJSON());
  } else {
    features = this.getSelected().map((f) => f.toGeoJSON());
  }

  features = features.filter((f) => geojsonTypes.includes(f.geometry.type));
  if (!features.length) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon or LineString or MultiLineString) to split!');
  }

  this._features = features;
  this._options = options;
  this._undoStack = [];
  this._redoStack = [];
  this._redoType = '';
  this._undoType = '';
  this._batchHighlight(features, highlightColor);
  const state = this.originOnSetup({ button: Constants.modes.CUT_POLYGON });
  window.state = state;
  window.p = this;
  return this.setState(state);
};

CutPolygonMode.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.originOnMouseMove(state, e);
};

CutPolygonMode.onStop = function (state) {
  const featureIds = this._features.map((v) => v.id);
  this.originOnStop(state, () => {
    this._cancelCut();
    this.deleteFeature([state.polygon.id], { silent: true });
  });
  return { featureIds };
};

CutPolygonMode.clickOnVertex = function (state) {
  this.originClickOnVertex(state, () => {
    const cuttingpolygon = state.polygon.toGeoJSON();
    cuttingpolygon.geometry.coordinates[0].splice(state.currentVertexPosition, 1);
    this._cut(cuttingpolygon);
    if (this._options.continuous) {
      this._resetState();
    } else {
      this.deleteFeature([state.polygon.id], { silent: true });
    }
  });
};

CutPolygonMode.undo = function () {
  const { type, stack } = this.redoUndo.undo() || {};
  if (type !== 'cut') return;

  this.beforeRender(() => {
    const state = this.getState();
    const redoStack = { geoJson: stack.geoJson };
    stack.collection.forEach((item) => {
      // 将features合并为一个feature
      const combine = turf.combine(item.difference);
      // 将两个feature合并为一个feature
      const nuion = turf.union(item.intersect, combine.features[0]);
      const nuionFeature = this.newFeature(nuion);
      const [f, ...rest] = item.difference.features;
      nuionFeature.id = f.id;
      item.difference.features.forEach((f) => this._ctx.store.get(f.id).measure.delete());
      rest.forEach((v) => this.deleteFeature(v.id));
      this.addFeature(nuionFeature);
      this._execMeasure(nuionFeature);
      this._setHighlight(nuionFeature.id, this._options.highlightColor);
    });
    stack.lines.forEach(({ cuted, line }) => {
      const [f] = cuted.features;
      const lineFeature = this.newFeature(line);
      cuted.features.forEach((v) => this.deleteFeature(v.id));
      lineFeature.id = f.id;
      this.addFeature(lineFeature);
      this._execMeasure(lineFeature);
      this._setHighlight(lineFeature.id, this._options.highlightColor);
    });

    state.currentVertexPosition = stack.geoJson.geometry.coordinates[0].length - 1;
    state.polygon.setCoordinates(stack.geoJson.geometry.coordinates);
    this.redoUndo.setRedoUndoStack(({ redoStack: r }) => ({ redoStack: [...r, redoStack] }));
    this._updateFeatures();
  });
};

CutPolygonMode.redo = function () {
  const res = this.redoUndo.redo() || {};
  const { type, stack } = res;
  if (type !== 'cut') return;
  this.beforeRender(() => {
    this._cut(stack.geoJson);
    this._resetState();
  });
};

CutPolygonMode._cut = function (cuttingpolygon) {
  const { store, api } = this._ctx;
  const { highlightColor } = this._options;
  const undoStack = { geoJson: cuttingpolygon, collection: [], lines: [] };

  this._features.forEach((feature) => {
    if (geojsonTypes.includes(feature.geometry.type)) {
      store.get(feature.id).measure.delete();
      if (lineTypes.includes(feature.geometry.type)) {
        const splitter = turf.polygonToLine(cuttingpolygon);
        const cuted = turf.lineSplit(feature, splitter);
        undoStack.lines.push({ cuted, line: feature });
        cuted.features.sort((a, b) => turf.length(a) - turf.length(b));
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach((id, i) => (cuted.features[i].id = id));
        this._continuous(() => this._batchHighlight(cuted.features, highlightColor));
        return;
      }
      const afterCut = turf.difference(feature, cuttingpolygon);
      if (!afterCut) return;
      const newFeature = this.newFeature(afterCut);
      const item = { intersect: turf.intersect(feature, cuttingpolygon) };
      if (newFeature.features) {
        const [f, ...rest] = newFeature.features.sort((a, b) => turf.area(a) - turf.area(b));
        f.id = feature.id;
        this.addFeature(f);
        api.add(turf.featureCollection(rest.map((v) => v.toGeoJSON())), { silent: true });
        this._execMeasure(f);
        this._continuous(() => this._batchHighlight(newFeature.features, highlightColor));
        if (item.intersect) {
          item.difference = turf.featureCollection(newFeature.features.map((v) => v.toGeoJSON()));
        }
      } else {
        newFeature.id = feature.id;
        this.addFeature(newFeature);
        this._execMeasure(newFeature);
        this._continuous(() => this._setHighlight(newFeature.id, highlightColor));
        if (item.intersect) item.difference = turf.featureCollection([newFeature.toGeoJSON()]);
      }
      if (item.intersect && item.difference) undoStack.collection.push(item);
    } else {
      console.info('The feature is not Polygon/MultiPolygon!');
    }
  });
  this.redoUndo.setRedoUndoStack(({ undoStack: u }) => ({ undoStack: [...u, undoStack] }));
  store.setDirty();
};

CutPolygonMode._resetState = function () {
  const state = this.getState();
  state.currentVertexPosition = 0;
  state.polygon.setCoordinates([[]]);
};

export default CutPolygonMode;
