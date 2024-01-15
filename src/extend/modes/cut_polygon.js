import * as turf from '@turf/turf';
import * as Constants from '../../constants';
import { default as drawPolygon } from './draw_polygon';

const defaultOptions = { highlightColor: '#73d13d', lineWidth: 0.001, lineWidthUnit: 'kilometers' };

const CutPolygonMode = {};

CutPolygonMode.onSetup = function (opt) {
  const { highlightColor = defaultOptions.highlightColor } = opt || {};

  const features = this.getSelected()
    .filter((f) => f.type === 'Polygon' || f.type === 'MultiPolygon')
    .map((f) => f.toGeoJSON());

  if (features.length < 1) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon) to split!');
  }

  const { store, api } = this._ctx;
  this.afterRender(() => {
    this.changeMode(Constants.modes.CUT_DRAW_POLYGON, {
      onDraw: (cuttingpolygon) => {
        features.forEach((feature) => {
          if (feature.geometry.type === Constants.geojsonTypes.POLYGON || feature.geometry.type === Constants.geojsonTypes.MULTI_POLYGON) {
            const afterCut = turf.difference(feature, cuttingpolygon);
            const newFeature = this.newFeature(afterCut);
            store.get(feature.id).measure.delete();
            if (newFeature.features) {
              const [f, ...rest] = newFeature.features.sort((a, b) => turf.area(a) - turf.area(b));
              f.id = feature.id;
              this.addFeature(f);
              api.add(turf.featureCollection(rest.map((v) => v.toGeoJSON())));
              this._execMeasure(f);
            } else {
              newFeature.id = feature.id;
              this.addFeature(newFeature);
              this._execMeasure(newFeature);
            }
            // this.deleteFeature(feature.id);
            // this.fireUpdate(newFeature);
          } else {
            console.info('The feature is not Polygon/MultiPolygon!');
          }
        });
      },
      onCancel: () => {
        if (features.length) features.forEach((feature) => this.setHighlight(feature.id));
      },
    });
  });

  if (features.length) features.forEach((feature) => this.setHighlight(feature.id, highlightColor));

  return {
    features,
  };
};

CutPolygonMode._execMeasure = function (feature) {
  const api = this._ctx.api;

  if (feature && api.options.measureOptions) {
    feature.measure.setOptions(api.options.measureOptions);
    feature.execMeasure();
  }
};

CutPolygonMode.setHighlight = function (id, color) {
  const api = this._ctx.api;
  api.setFeatureProperty(id, 'inactive-fill-color', color);
  api.setFeatureProperty(id, 'inactive-fill-outline-color', color);
  api.setFeatureProperty(id, 'inactive-line-color', color);
};

CutPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

CutPolygonMode.fireUpdate = function (newF) {
  this.map.fire(Constants.events.UPDATE, {
    action: Constants.updateActions.CHANGE_COORDINATES,
    features: newF.toGeoJSON(),
  });
};

export function genCutPolygonMode(modes) {
  return {
    ...modes,
    [Constants.modes.CUT_DRAW_POLYGON]: drawPolygon,
    [Constants.modes.CUT_POLYGON]: CutPolygonMode,
  };
}
