import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import draw_polygon from '../../modes/draw_polygon';
import xtend from 'xtend';
import polygonsplitter from 'polygon-splitter';

const getDefaultOptions = () => ({
  featureIds: [],
  highlightColor: '#73d13d',
  continuous: true,
  lineWidth: 0.001,
  lineWidthUnit: 'kilometers',
});

const styles = ['inactive-fill-color', 'inactive-fill-outline-color', 'inactive-line-color'];

const highlightFieldName = 'wait-cut';

const {
  onSetup: originOnSetup,
  onMouseMove: originOnMouseMove,
  clickOnVertex: originClickOnVertex,
  onStop: originOnStop,
  onTrash: originOnTrash,
  onKeyUp: originOnKeyUp,
  ...restOriginMethods
} = draw_polygon;

const polyTypes = [Constants.geojsonTypes.POLYGON, Constants.geojsonTypes.MULTI_POLYGON];

const lineTypes = [Constants.geojsonTypes.LINE_STRING, Constants.geojsonTypes.MULTI_LINE_STRING];

const geojsonTypes = [...polyTypes, ...lineTypes];

const CutPolygonMode = {
  originOnSetup,
  originOnKeyUp,
  originOnMouseMove,
  originClickOnVertex,
  originOnStop,
  originOnTrash,
  ...restOriginMethods,
};

CutPolygonMode.onSetup = function (opt) {
  const options = xtend(getDefaultOptions(), opt);
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
  this.originOnStop(state, () => {
    this._cancelCut();
    this.deleteFeature([state.polygon.id], { silent: true });
  });
};

CutPolygonMode.onKeyUp = function (state, e) {
  this._cancelCut();
  this.originOnKeyUp(state, e);
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

CutPolygonMode.onTrash = function (state) {
  this.originOnTrash(state);
  this._cancelCut();
};

CutPolygonMode.fireUpdate = function (newF) {
  this.map.fire(Constants.events.UPDATE, {
    action: Constants.updateActions.CHANGE_COORDINATES,
    features: newF.toGeoJSON(),
  });
};

CutPolygonMode.getWaitCutFeatures = function () {
  return JSON.parse(JSON.stringify(this._features));
};

CutPolygonMode.undo = function () {
  const { type, stack } = this.redoUndo.undo() || {};
  if (type !== 'cut') return;

  this.beforeRender(() => {
    const state = this.getState();
    const redoStack = { geoJson: stack.geoJson };
    stack.collection.forEach((item) => {
      const combine = turf.combine(item.difference);
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

CutPolygonMode._setButtonStatus = function (params) {
  const p = { undo: !this._undoStack.length, redo: !this._redoStack.length, ...params };
  this._ctx.ui.setDisableButtons((buttonStatus) => {
    buttonStatus.undo = { disabled: p.undo };
    buttonStatus.redo = { disabled: p.redo };
    return buttonStatus;
  });
};

CutPolygonMode._execMeasure = function (feature) {
  const api = this._ctx.api;
  if (feature && api.options.measureOptions) {
    feature.measure.setOptions(api.options.measureOptions);
    feature.execMeasure();
  }
};

CutPolygonMode._setHighlight = function (id, color) {
  const api = this._ctx.api;
  styles.forEach((style) => api.setFeatureProperty(id, style, color));
  api.setFeatureProperty(id, highlightFieldName, color ? true : undefined);
};

CutPolygonMode._cut = function (cuttingpolygon) {
  const { store, api } = this._ctx;
  const { highlightColor } = this._options;
  const undoStack = { geoJson: cuttingpolygon, collection: [] };
  this._features.forEach((feature) => {
    if (geojsonTypes.includes(feature.geometry.type)) {
      store.get(feature.id).measure.delete();
      if (lineTypes.includes(feature.geometry.type)) {
        const splitter = turf.polygonToLine(cuttingpolygon);
        const cuted = turf.lineSplit(feature, splitter);
        cuted.features.sort((a, b) => turf.length(a) - turf.length(b));
        cuted.features[0].id = feature.id;
        api.add(cuted).forEach((id, i) => (cuted.features[i].id = id), { silent: true });
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

CutPolygonMode._continuous = function (cb) {
  if (this._options.continuous) {
    cb();
    this._updateFeatures();
  }
};

CutPolygonMode._updateFeatures = function () {
  this._features = this._ctx.store
    .getAll()
    .filter((f) => f.getProperty(highlightFieldName))
    .map((f) => f.toGeoJSON());
};

CutPolygonMode._cancelCut = function () {
  if (this._features.length) {
    this._batchHighlight(this._features);
    this._features = [];
  }
};

CutPolygonMode._batchHighlight = function (features, color) {
  if (features.length) features.forEach((feature) => this._setHighlight(feature.id, color));
};

CutPolygonMode._resetState = function (coord) {
  const state = this.getState();
  state.currentVertexPosition = 0;
  state.polygon.setCoordinates([[]]);
};

export function genCutPolygonMode(modes) {
  return {
    ...modes,
    [Constants.modes.CUT_POLYGON]: CutPolygonMode,
  };
}
