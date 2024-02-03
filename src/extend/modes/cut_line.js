import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import polygonSplitter from 'polygon-splitter';
import cut, { getCutDefaultOptions, lineTypes } from './utils';
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
  this._options = options;
  this._features = features;
  const state = this.originOnSetup();
  this._batchHighlight(features, highlightColor);
  return this.setState(state);
};

CutLineMode.clickOnVertex = function (state) {
  this.originClickOnVertex(state, () => {
    this._cut(state);
    if (this._options.continuous) {
      this._resetState();
    } else {
      this.deleteFeature([state.line.id], { silent: true });
    }
  });
};

CutLineMode._cut = function (state) {
  let splitter;
  const cuttingLineString = state.line.toGeoJSON();
  const { lineWidth, lineWidthUnit, highlightColor } = this._options;
  const { store, api } = this._ctx;
  const endCoord = cuttingLineString.geometry.coordinates[cuttingLineString.geometry.coordinates.length - 1];
  const startPoint = turf.point(cuttingLineString.geometry.coordinates[0]);
  const endPoint = turf.point(endCoord);
  const oneMeters = turf.convertLength(1, 'meters', lineWidthUnit);
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
      if (lineWidth === 0) {
        const cuted = turf.lineSplit(feature, cuttingLineString);
        cuted.features.sort((a, b) => turf.length(a) - turf.length(b));
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach((id, i) => (cuted.features[i].id = id));
        this._continuous(() => this._batchHighlight(cuted.features, highlightColor));
      } else {
        if (!splitter) splitter = turf.polygonToLine(turf.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit }));
        const fc = turf.featureCollection([]);
        const cuted = turf.lineSplit(feature, splitter);
        const intersectPoints = turf.lineIntersect(feature.geometry, cuttingLineString.geometry);
        intersectPoints.features.forEach((f) => {
          const buffered = turf.buffer(f, lineWidth + oneMeters, { units: lineWidthUnit });
          fc.features.push(...cuted.features.filter((v) => !turf.booleanContains(buffered, v)));
        });
        fc.features.sort((a, b) => {
          delete a.id;
          delete b.id;
          return turf.length(a) - turf.length(b);
        });
        fc.features[0].id = feature.id;
        api.add(fc, { silent: true }).forEach((id, i) => (fc.features[i].id = id));
        this._continuous(() => this._batchHighlight(fc.features, highlightColor));
      }
      return;
    }
    let afterCut;
    if (lineWidth === 0) {
      afterCut = polygonSplitter(feature.geometry, cuttingLineString.geometry);
    } else {
      const intersectPoints = turf.lineIntersect(feature.geometry, cuttingLineString.geometry);
      const intersectLine = turf.lineString(intersectPoints.features.map((f) => f.geometry.coordinates));
      const buffered = turf.buffer(intersectLine, lineWidth, { units: lineWidthUnit });
      afterCut = turf.difference(feature.geometry, buffered);
    }
    const newFeature = this.newFeature(afterCut);
    const [f, ...rest] = newFeature.features.sort((a, b) => turf.area(a) - turf.area(b));
    f.id = feature.id;
    api.add(turf.featureCollection(rest.map((v) => v.toGeoJSON())), { silent: true });
    this.addFeature(f);
    this._execMeasure(f);
    this._continuous(() => this._batchHighlight(newFeature.features, highlightColor));
  });
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

CutLineMode._resetState = function () {
  const state = this.getState();
  state.currentVertexPosition = 0;
  state.line.setCoordinates([]);
};

export default CutLineMode;
