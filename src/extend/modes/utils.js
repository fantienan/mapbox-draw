import * as Constants from '../../constants';

export const getCutDefaultOptions = () => ({
  featureIds: [],
  highlightColor: '#73d13d',
  continuous: true,
  lineWidth: 0.001,
  lineWidthUnit: 'kilometers',
});

export const highlightFieldName = 'wait-cut';

export function polygonCut(poly, line) {
  return polygonSplitter(poly, line);
}

/// https://gis.stackexchange.com/a/344277/145409
export function polygonCutWithSpacing(poly, line, options) {
  const { line_width, line_width_unit } = options || {};

  const offsetLine = [];
  const retVal = null;
  let i, j, intersectPoints, forCut, forSelect;
  let thickLineString, thickLinePolygon, clipped;

  if (
    typeof line_width === 'undefined' ||
    typeof line_width_unit === 'undefined' ||
    (poly.type != Constants.geojsonTypes.POLYGON && poly.type != Constants.geojsonTypes.MULTI_POLYGON) ||
    line.type != Constants.geojsonTypes.LINE_STRING
  ) {
    return retVal;
  }

  /// if line and polygon don't intersect return.
  if (turf.booleanDisjoint(line, poly)) {
    return retVal;
  }

  intersectPoints = turf.lineIntersect(poly, line);
  if (intersectPoints.features.length === 0) {
    return retVal;
  }

  /// Creating two new lines at sides of the splitting turf.lineString
  offsetLine[0] = turf.lineOffset(line, line_width, {
    units: line_width_unit,
  });
  offsetLine[1] = turf.lineOffset(line, -line_width, {
    units: line_width_unit,
  });

  for (i = 0; i <= 1; i++) {
    forCut = i;
    forSelect = (i + 1) % 2;
    const polyCoords = [];
    for (j = 0; j < line.coordinates.length; j++) {
      polyCoords.push(line.coordinates[j]);
    }
    for (j = offsetLine[forCut].geometry.coordinates.length - 1; j >= 0; j--) {
      polyCoords.push(offsetLine[forCut].geometry.coordinates[j]);
    }
    polyCoords.push(line.coordinates[0]);

    thickLineString = turf.lineString(polyCoords);
    thickLinePolygon = turf.lineToPolygon(thickLineString);
    clipped = turf.difference(poly, thickLinePolygon);
  }

  return clipped;
}

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
  this._cancelCut();
  this.originOnKeyUp(state, e);
};

export default Cut;
