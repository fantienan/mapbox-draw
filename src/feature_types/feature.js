import hat from 'hat';
import * as Constants from '../constants';
import { Measure } from '../extend';

const Feature = function (ctx, geojson) {
  this.ctx = ctx;
  this.properties = geojson.properties || {};
  this.coordinates = geojson.geometry.coordinates;
  this.id = geojson.id || hat();
  this.type = geojson.geometry.type;
  // extend start
  this.measure = new Measure({ ctx });
  // extend end
};

Feature.prototype.changed = function () {
  this.ctx.store.featureChanged(this.id);
};

Feature.prototype.incomingCoords = function (coords) {
  this.setCoordinates(coords);
};

Feature.prototype.setCoordinates = function (coords) {
  this.coordinates = coords;
  this.changed();
  return this;
};

Feature.prototype.getCoordinates = function () {
  return JSON.parse(JSON.stringify(this.coordinates));
};

Feature.prototype.setProperty = function (property, value) {
  this.properties[property] = value;
  if (value === void 0) delete this.properties[property];
};

Feature.prototype.getProperty = function (property) {
  return this.properties[property];
};

Feature.prototype.toGeoJSON = function () {
  return JSON.parse(
    JSON.stringify({
      id: this.id,
      type: Constants.geojsonTypes.FEATURE,
      properties: this.properties,
      geometry: {
        coordinates: this.getCoordinates(),
        type: this.type,
      },
    }),
  );
};

Feature.prototype.internal = function (mode) {
  const properties = {
    id: this.id,
    meta: Constants.meta.FEATURE,
    'meta:type': this.type,
    active: Constants.activeStates.INACTIVE,
    mode,
  };

  if (this.ctx.options.userProperties) {
    for (const name in this.properties) {
      properties[`user_${name}`] = this.properties[name];
    }
  }

  return {
    type: Constants.geojsonTypes.FEATURE,
    properties,
    geometry: {
      coordinates: this.getCoordinates(),
      type: this.type,
    },
  };
};

// extend start
Feature.prototype.delete = function () {
  this.measure.delete();
  return this;
};
Feature.prototype.move = function () {
  this.execMeasure();
  return this;
};
Feature.prototype.execMeasure = function () {
  throw new Error('execMeasure method must be implemented');
};
// extend end

export default Feature;
