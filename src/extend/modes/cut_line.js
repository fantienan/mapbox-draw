import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import cut, { getCutDefaultOptions, highlightFieldName, polygonCut, polygonCutWithSpacing } from './utils';
import draw_line_string from '../../modes/draw_line_string';
import xtend from 'xtend';

const {
  onSetup: originOnSetup,
  onMouseMove: originOnMouseMove,
  clickOnVertex: originClickOnVertex,
  onStop: originOnStop,
  onKeyUp: originOnKeyUp,
  ...restOriginMethods
} = draw_line_string;
const CutLineMode = { originOnSetup, originOnKeyUp, originOnStop, originOnMouseMove, originClickOnVertex, ...restOriginMethods, ...cut };

CutLineMode.onSetup = function (opt) {
  const options = xtend(getCutDefaultOptions(), opt);
  const { featureIds, highlightColor } = options;

  let features = [];
  if (featureIds.length) {
    features = featureIds.map((id) => this.getFeature(id).toGeoJSON());
  } else {
    features = this.getSelected().map((f) => f.toGeoJSON());
  }

  if (!features.length) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon or LineString or MultiLineString) to split!');
  }
  this._api = this._ctx.api;
  this._options = options;
  this._features = features;
  const state = this.originOnSetup();
  this._batchHighlight(features, highlightColor);
  return this.setState(state);
};

CutLineMode.clickOnVertex = function (state) {
  this.originClickOnVertex(state, () => {
    this._cut(state);
  });
};

CutLineMode._cut = function (state) {
  const cuttingLineString = state.line.toGeoJSON();
  const { lineWidth, lineWidthUnit } = this._options;

  const newPolygons = [];
  this._features.forEach((el) => {
    if (turf.booleanDisjoint(el, cuttingLineString)) {
      console.info(`Line was outside of Polygon ${el.id}`);
      newPolygons.push(el);
      return;
    } else if (lineWidth === 0) {
      const polycut = polygonCut(el.geometry, cuttingLineString.geometry);
      polycut.id = el.id;
      this._api.add(polycut);
      newPolygons.push(polycut);
    } else {
      const polycut = polygonCutWithSpacing(el.geometry, cuttingLineString.geometry, {
        line_width: lineWidth,
        line_width_unit: lineWidthUnit,
      });
      polycut.id = el.id;
      this._api.add(polycut);
      newPolygons.push(polycut);
    }
  });
};

CutLineMode.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.originOnMouseMove(state, e);
};

CutLineMode.onStop = function (state) {
  this.originOnStop(state, () => {
    this._cancelCut();
    this.deleteFeature([state.polygon.id], { silent: true });
  });
};

export default CutLineMode;
