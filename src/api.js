import isEqual from 'lodash.isequal';
import normalize from '@mapbox/geojson-normalize';
import hat from 'hat';
import featuresAt from './lib/features_at';
import stringSetsAreEqual from './lib/string_sets_are_equal';
import * as Constants from './constants';
import StringSet from './lib/string_set';

import Polygon from './feature_types/polygon';
import LineString from './feature_types/line_string';
import Point from './feature_types/point';
import MultiFeature from './feature_types/multi_feature';
import { genStyles } from './options';
import { mapFireOnDeleteAll } from './extend';

const featureTypes = {
  Polygon,
  LineString,
  Point,
  MultiPolygon: MultiFeature,
  MultiLineString: MultiFeature,
  MultiPoint: MultiFeature,
};

export default function (ctx, api) {
  api.modes = Constants.modes;

  api.getFeatureIdsAt = function (point) {
    const features = featuresAt.click({ point }, null, ctx);
    return features.map((feature) => feature.properties.id);
  };

  api.getSelectedIds = function () {
    return ctx.store.getSelectedIds();
  };

  api.getSelected = function () {
    return {
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: ctx.store
        .getSelectedIds()
        .map((id) => ctx.store.get(id))
        .map((feature) => feature.toGeoJSON()),
    };
  };

  api.getSelectedPoints = function () {
    return {
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: ctx.store.getSelectedCoordinates().map((coordinate) => ({
        type: Constants.geojsonTypes.FEATURE,
        properties: {},
        geometry: {
          type: Constants.geojsonTypes.POINT,
          coordinates: coordinate.coordinates,
        },
      })),
    };
  };

  api.set = function (featureCollection) {
    if (
      featureCollection.type === undefined ||
      featureCollection.type !== Constants.geojsonTypes.FEATURE_COLLECTION ||
      !Array.isArray(featureCollection.features)
    ) {
      throw new Error('Invalid FeatureCollection');
    }
    const renderBatch = ctx.store.createRenderBatch();
    let toDelete = ctx.store.getAllIds().slice();
    const newIds = api.add(featureCollection);
    const newIdsLookup = new StringSet(newIds);

    toDelete = toDelete.filter((id) => !newIdsLookup.has(id));
    if (toDelete.length) {
      api.delete(toDelete);
    }

    renderBatch();
    return newIds;
  };

  api.add = function (geojson, options = { silent: false }) {
    const featureCollection = JSON.parse(JSON.stringify(normalize(geojson)));

    const ids = featureCollection.features.map((feature) => {
      feature.id = feature.id || hat();

      if (feature.geometry === null) {
        throw new Error('Invalid geometry: null');
      }
      let internalFeature;

      if (ctx.store.get(feature.id) === undefined || ctx.store.get(feature.id).type !== feature.geometry.type) {
        // If the feature has not yet been created ...
        const Model = featureTypes[feature.geometry.type];
        if (Model === undefined) {
          throw new Error(`Invalid geometry type: ${feature.geometry.type}.`);
        }
        internalFeature = new Model(ctx, feature);
        ctx.store.add(internalFeature);
      } else {
        // If a feature of that id has already been created, and we are swapping it out ...
        internalFeature = ctx.store.get(feature.id);
        internalFeature.properties = feature.properties;
        if (!isEqual(internalFeature.getCoordinates(), feature.geometry.coordinates)) {
          internalFeature.incomingCoords(feature.geometry.coordinates);
        }
      }

      if (internalFeature && api.options.measureOptions) {
        internalFeature.measure.setOptions(api.options.measureOptions);
        internalFeature.execMeasure();
      }
      return feature.id;
    });
    if (!options.silent) ctx.store.render();
    return ids;
  };

  api.get = function (id) {
    const feature = ctx.store.get(id);
    if (feature) {
      return feature.toGeoJSON();
    }
  };

  api.getAll = function () {
    return {
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: ctx.store.getAll().map((feature) => feature.toGeoJSON()),
    };
  };

  api.delete = function (featureIds) {
    ctx.store.delete(featureIds, { silent: true });
    // If we were in direct select mode and our selected feature no longer exists
    // (because it was deleted), we need to get out of that mode.
    if (api.getMode() === Constants.modes.DIRECT_SELECT && !ctx.store.getSelectedIds().length) {
      ctx.events.changeMode(Constants.modes.SIMPLE_SELECT, undefined, { silent: true });
    } else {
      ctx.store.render();
    }

    return api;
  };

  api.deleteAll = function () {
    ctx.store.delete(ctx.store.getAllIds(), { silent: true });
    // If we were in direct select mode, now our selected feature no longer exists,
    // so escape that mode.
    if (api.getMode() === Constants.modes.DIRECT_SELECT) {
      ctx.events.changeMode(Constants.modes.SIMPLE_SELECT, undefined, { silent: true });
    } else {
      ctx.store.render();
    }

    const modeInstance = ctx.events.getModeInstance();
    modeInstance.afterRender(() => mapFireOnDeleteAll(modeInstance, {}));
    return api;
  };

  api.changeMode = function (mode, modeOptions = {}) {
    // Avoid changing modes just to re-select what's already selected
    if (mode === Constants.modes.SIMPLE_SELECT && api.getMode() === Constants.modes.SIMPLE_SELECT) {
      if (stringSetsAreEqual(modeOptions.featureIds || [], ctx.store.getSelectedIds())) return api;
      // And if we are changing the selection within simple_select mode, just change the selection,
      // instead of stopping and re-starting the mode
      ctx.store.setSelected(modeOptions.featureIds, { silent: true });
      ctx.store.render();
      return api;
    }

    if (
      mode === Constants.modes.DIRECT_SELECT &&
      api.getMode() === Constants.modes.DIRECT_SELECT &&
      modeOptions.featureId === ctx.store.getSelectedIds()[0]
    ) {
      return api;
    }

    ctx.events.changeMode(mode, modeOptions, { silent: true });
    return api;
  };

  api.getMode = function () {
    return ctx.events.getMode();
  };

  api.trash = function () {
    ctx.events.trash({ silent: true });
    return api;
  };

  api.combineFeatures = function () {
    ctx.events.combineFeatures({ silent: true });
    return api;
  };

  api.uncombineFeatures = function () {
    ctx.events.uncombineFeatures({ silent: true });
    return api;
  };

  api.setFeatureProperty = function (featureId, property, value) {
    ctx.store.setFeatureProperty(featureId, property, value);
    return api;
  };

  api.getFeatureTypeById = function (id) {
    return ctx.store.get(id);
  };

  // extend start
  api.undo = function () {
    ctx.events.undo();
    return api;
  };
  api.redo = function () {
    ctx.events.redo();
    return api;
  };
  api.finish = function (m) {
    ctx.events.finish(m);
    return api;
  };
  api.cancel = function (m) {
    ctx.events.cancel(m);
    return api;
  };
  api.drawByCenter = function () {
    ctx.events.drawByCoordinate(ctx.map.getCenter().toArray());
    return api;
  };
  api.drawByCoordinate = function (coord) {
    ctx.events.drawByCoordinate(coord);
    return api;
  };
  api.setStyle = function (styles) {
    ctx.options.styles.forEach((style) => {
      if (ctx.map.getLayer(style.id)) ctx.map.removeLayer(style.id);
    });
    ctx.options.styles = genStyles(styles).map((style) => {
      ctx.map.addLayer(style);
      return style;
    });
    return api;
  };
  api.edit = function (geojson) {
    const ids = api.add(geojson);
    const type = geojson.type;
    const feature =
      type === Constants.geojsonTypes.FEATURE
        ? geojson
        : Constants.GEOMETRYS.includes(type)
        ? { type: Constants.geojsonTypes.FEATURE, properties: {}, geometry: geojson }
        : null;
    if (!feature) {
      console.warn('only support edit feature or geometry');
      return api;
    }
    if (feature.geometry.type === Constants.geojsonTypes.POINT) {
      api.changeMode('simple_select', { featureIds: ids });
    } else {
      api.changeMode('direct_select', { featureId: ids[0] });
    }
    return api;
  };
  api.setMeasureOptions = function (options) {
    ctx.events.setMeasureOptions(options);
    return api;
  };
  api.getCtx = function () {
    return ctx;
  };
  // extend end
  return api;
}
