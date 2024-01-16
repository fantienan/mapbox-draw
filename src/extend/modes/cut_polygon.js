import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import draw_polygon from '../../modes/draw_polygon';
import xtend from 'xtend';
import { mapFireRedoUndo } from '../utils';

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
  ...restOriginMethods
} = draw_polygon;

const CutPolygonMode = { originOnSetup, originOnMouseMove, originClickOnVertex, originOnStop, originOnTrash, ...restOriginMethods };

CutPolygonMode.onSetup = function (opt) {
  const options = xtend(getDefaultOptions(), opt);
  const { highlightColor, featureIds } = options;
  let features = [];
  if (featureIds.length) {
    features = featureIds.map((id) => this.getFeature(id).toGeoJSON());
  } else {
    features = this.getSelected().map((f) => f.toGeoJSON());
  }
  features = features.filter(
    (f) => f.geometry.type === Constants.geojsonTypes.POLYGON || f.geometry.type === Constants.geojsonTypes.MULTI_POLYGON,
  );
  if (features.length < 1) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon) to split!');
  }
  this._features = features;
  this._options = options;
  this._undoStack = [];
  this._redoStack = [];
  this._redoType = '';
  this._undoType = '';

  this._batchHighlight(features, highlightColor);
  const state = this.originOnSetup({ button: Constants.modes.CUT_POLYGON });
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

CutPolygonMode.clickOnVertex = function (state) {
  this.originClickOnVertex(state, () => {
    const geoJson = state.polygon.toGeoJSON();
    geoJson.geometry.coordinates[0].splice(state.currentVertexPosition, 1);
    this._cutEffect(geoJson);
    if (this._options.continuous) {
      state.currentVertexPosition = 0;
      state.polygon.setCoordinates([[]]);
      this.redoUndo.reset();
      this._emitRedoUndo({ type: 'clear' });
    } else {
      this.deleteFeature([state.polygon.id], { silent: true });
    }
  });
};

CutPolygonMode._cutEffect = function (geoJson) {
  this._setRedoUndoStack(({ undoStack }) => ({
    undoStack: [...undoStack, { geoJson, type: 'draw' }],
  }));

  this._cut(geoJson);
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
  const state = this.getState();
  if (this._undoType === 'draw') {
    this._redoType = 'draw';
    if (state.currentVertexPosition !== 0) {
      return this.redoUndo.undo({
        cb: () => {
          if (state.currentVertexPosition === 0) this._setButtonStatus();
        },
      });
    }
  }

  const stacks = this._undoStack.splice(-2);
  this._undoType = (stacks[0] || {}).type;
  if (stacks.length < 2) return;
  this.beforeRender(() => {
    stacks.forEach((stack) => {
      if (stack.type === 'cut') {
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
        this._redoStack.push({ type: 'cut', cuttingpolygon: stack.cuttingpolygon });
      } else if (stack.type === 'draw') {
        state.currentVertexPosition = stack.geoJson.geometry.coordinates[0].length - 1;
        state.polygon.setCoordinates(stack.geoJson.geometry.coordinates);
        this._redoStack.push({ type: 'draw', geoJson: stack.geoJson });
      }
    });
    this._updateFeatures();
    this._setButtonStatus({ undo: false, redo: false });
  });
};

CutPolygonMode.redo = function () {
  const state = this.getState();
  if (this._redoType === 'draw') {
    this._undoType = 'draw';
    const res = this.redoUndo.redo({
      cb: (r) => {
        if (!r.redoStack.length) this._setButtonStatus({ undo: false });
      },
    });
    if (res.coord) return;
  }
  const stacks = this._redoStack.splice(-2);
  this._redoType = (stacks[0] || {}).type;
  if (stacks.length < 2) return;

  this.beforeRender(() => {
    stacks.forEach((stack) => {
      if (stack.type === 'cut') {
        this._cutEffect(stack.cuttingpolygon, stack.cuttingpolygon.geometry.coordinates[0].length - 1);

        state.currentVertexPosition = 0;
        state.polygon.setCoordinates([[]]);
        this._setButtonStatus({ undo: false, redo: false });
      } else if (stack.type === 'draw') {
        state.currentVertexPosition = stack.geoJson.geometry.coordinates[0].length - 1;
        state.polygon.setCoordinates(stack.geoJson.geometry.coordinates);
      }
    });
  });
};

CutPolygonMode._emitRedoUndo = function (event) {
  const e = xtend({ undoStack: this._undoStack, redoStack: this._redoStack }, event);
  this._setButtonStatus();
  mapFireRedoUndo(this._ctx.events.getModeInstance(), JSON.parse(JSON.stringify(e)));
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
  const stack = { type: 'cut', cuttingpolygon: JSON.parse(JSON.stringify(cuttingpolygon)), collection: [] };
  this._features.forEach((feature) => {
    if (feature.geometry.type === Constants.geojsonTypes.POLYGON || feature.geometry.type === Constants.geojsonTypes.MULTI_POLYGON) {
      const afterCut = turf.difference(feature, cuttingpolygon);
      if (!afterCut) return;
      const newFeature = this.newFeature(afterCut);
      store.get(feature.id).measure.delete();
      const item = {
        intersect: turf.intersect(feature, cuttingpolygon),
      };
      if (newFeature.features) {
        const [f, ...rest] = newFeature.features.sort((a, b) => turf.area(a) - turf.area(b));
        f.id = feature.id;
        this.addFeature(f);
        api.add(turf.featureCollection(rest.map((v) => v.toGeoJSON())));
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
      if (item.intersect && item.difference) stack.collection.push(item);
    } else {
      console.info('The feature is not Polygon/MultiPolygon!');
    }
  });

  this._setRedoUndoStack(({ undoStack }) => ({ undoStack: [...undoStack, stack] }));
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

CutPolygonMode._setRedoUndoStack = function (cb) {
  const { undoStack, redoStack } = cb({ undoStack: this._undoStack, redoStack: this._redoStack });
  if (Array.isArray(undoStack)) this._undoStack = undoStack;
  if (Array.isArray(redoStack)) this._redoStack = redoStack;
};

export function genCutPolygonMode(modes) {
  return {
    ...modes,
    [Constants.modes.CUT_POLYGON]: CutPolygonMode,
  };
}
