import polygonSplitter from 'polygon-splitter';
import * as turf from '@turf/turf';
import * as Constants from '../../../constants';
import { modeName, passingModeName, highlightPropertyName, defaultOptions } from './constants';

const defaultOptions = {
  highlightColor: '#73d13d',
  lineWidth: 0,
  lineWidthUnit: 'kilometers',
  onSelectFeatureRequest() {
    throw new Error('no Feature is selected to split.');
  },
};

const SplitPolygonMode = {};

SplitPolygonMode.onSetup = function (opt) {
  const {
    featureIds = [],
    highlightColor = defaultOptions.highlightColor,
    lineWidth = defaultOptions.lineWidth,
    lineWidthUnit = defaultOptions.lineWidthUnit,
    onSelectFeatureRequest = defaultOptions.onSelectFeatureRequest,
  } = opt || {};

  const api = this._ctx.api;

  const featuresToSplit = [];
  const selectedFeatures = this.getSelected();

  if (featureIds.length !== 0) {
    featuresToSplit.push.apply(
      featuresToSplit,
      featureIds.map((id) => api.get(id)),
    );
  } else if (selectedFeatures.length !== 0) {
    featuresToSplit.push.apply(
      featuresToSplit,
      selectedFeatures
        .filter((f) => f.type === Constants.geojsonTypes.POLYGON || f.type === Constants.geojsonTypes.MULTI_POLYGON)
        .map((f) => f.toGeoJSON()),
    );
  } else {
    return onSelectFeatureRequest();
  }

  const state = {
    options: {
      highlightColor,
      lineWidth,
      lineWidthUnit,
    },
    featuresToSplit,
    api,
  };
  this.afterRender(() => this.drawAndSplit.bind(this, state));
  this.highlighFeatures(state);
  return this.setState(state);
};

SplitPolygonMode.drawAndSplit = function (state) {
  const { api, options } = state;
  const { lineWidth, lineWidthUnit } = options;

  try {
    this.changeMode(passingModeName, {
      onDraw: (cuttingLineString) => {
        const newPolygons = [];
        state.featuresToSplit.forEach((el) => {
          if (turf.booleanDisjoint(el, cuttingLineString)) {
            console.info(`Line was outside of Polygon ${el.id}`);
            newPolygons.push(el);
            return;
          } else if (lineWidth === 0) {
            const polycut = polygonCut(el.geometry, cuttingLineString.geometry);
            polycut.id = el.id;
            api.add(polycut);
            newPolygons.push(polycut);
          } else {
            const polycut = polygonCutWithSpacing(el.geometry, cuttingLineString.geometry, {
              line_width: lineWidth,
              line_width_unit: lineWidthUnit,
            });
            polycut.id = el.id;
            api.add(polycut);
            newPolygons.push(polycut);
          }
        });

        this.fireUpdate(newPolygons);
        this.highlighFeatures(state, false);
      },
      onCancel: () => {
        this.highlighFeatures(state, false);
      },
    });
  } catch (err) {
    console.error('🚀 ~ file: mode.js ~ line 116 ~ err', err);
  }
};

SplitPolygonMode.highlighFeatures = function (state, shouldHighlight = true) {
  const color = shouldHighlight ? state.options.highlightColor : undefined;

  state.featuresToSplit.forEach((f) => {
    state.api.setFeatureProperty(f.id, highlightPropertyName, color);
  });
};

SplitPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

SplitPolygonMode.fireUpdate = function (newF) {
  this.map.fire(Constants.events.UPDATE, {
    action: modeName,
    features: newF,
  });
};

// SplitPolygonMode.onStop = function ({ main }) {
//   console.log("🚀 ~ file: mode.js ~ line 60 ~ onStop");
// };

export default SplitPolygonMode;

/// Note: currently has some issues, but generally is a better approach
function polygonCut(poly, line) {
  return polygonSplitter(poly, line);
}

/// Adopted from https://gis.stackexchange.com/a/344277/145409
function polygonCutWithSpacing(poly, line, options) {
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

export function getCutLineMode(modes) {
  return {
    ...SelectFeatureMode(modes),
    [passingModeName]: passing_draw_line_string,
    [modeName]: splitPolygonMode,
  };
}
