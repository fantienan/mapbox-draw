import * as CommonSelectors from '../../lib/common_selectors';
import * as Constants from '../../constants';

export const polyTypes = [Constants.geojsonTypes.POLYGON, Constants.geojsonTypes.MULTI_POLYGON];

export const lineTypes = [Constants.geojsonTypes.LINE_STRING, Constants.geojsonTypes.MULTI_LINE_STRING];

export const geojsonTypes = [...polyTypes, ...lineTypes];

export const getCutDefaultOptions = () => ({
  featureIds: [],
  highlightColor: '#73d13d',
  continuous: true,
  // lineWidth: 0,
  lineWidth: 0.001,
  lineWidthUnit: 'kilometers',
});
export const highlightFieldName = 'wait-cut';

const Cut = {
  _styles: ['inactive-fill-color', 'inactive-fill-outline-color', 'inactive-line-color'],
};

Cut._execMeasure = function (feature) {
  const api = this._ctx.api;
  if (feature && api.options.measureOptions) {
    feature.measure.setOptions(api.options.measureOptions);
    feature.execMeasure();
  }
};

Cut._continuous = function (cb) {
  if (this._options.continuous) {
    cb();
    this._updateFeatures();
  }
};

Cut._updateFeatures = function () {
  this._features = this._ctx.store
    .getAll()
    .filter((f) => f.getProperty(highlightFieldName))
    .map((f) => f.toGeoJSON());
};

Cut._cancelCut = function () {
  if (this._features.length) {
    this._batchHighlight(this._features);
    this._features = [];
  }
};

Cut._setHighlight = function (id, color) {
  const api = this._ctx.api;
  this._styles.forEach((style) => api.setFeatureProperty(id, style, color));
  api.setFeatureProperty(id, highlightFieldName, color ? true : undefined);
};

Cut._batchHighlight = function (features, color) {
  if (features.length) features.forEach((feature) => this._setHighlight(feature.id, color));
};

Cut.getWaitCutFeatures = function () {
  return JSON.parse(JSON.stringify(this._features));
};

Cut.onTrash = function (state) {
  this.originOnTrash(state);
  this._cancelCut();
};

Cut.onKeyUp = function (state, e) {
  this.originOnKeyUp(state, e);
  if (CommonSelectors.isEscapeKey(e)) this._cancelCut();
};

export default Cut;
