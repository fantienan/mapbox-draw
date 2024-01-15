/* eslint-disable import/no-unresolved */
import { Marker } from 'mapbox-gl';
import * as turf from '@turf/turf';
import * as Constants from '../constants';
import Feature from './feature';

const LineString = function (ctx, geojson) {
  Feature.call(this, ctx, geojson);
};

LineString.prototype = Object.create(Feature.prototype);

LineString.prototype.isValid = function () {
  return this.coordinates.length > 1;
};

LineString.prototype.addCoordinate = function (path, lng, lat) {
  this.changed();
  const id = parseInt(path, 10);
  this.coordinates.splice(id, 0, [lng, lat]);
  this.execMeasure();
};

LineString.prototype.getCoordinate = function (path) {
  const id = parseInt(path, 10);
  return JSON.parse(JSON.stringify(this.coordinates[id]));
};

LineString.prototype.removeCoordinate = function (path, deleteCount = 1) {
  this.changed();
  this.execMeasure();
  return this.coordinates.splice(parseInt(path, 10), deleteCount);
};

LineString.prototype.updateCoordinate = function (path, lng, lat) {
  const id = parseInt(path, 10);
  this.coordinates[id] = [lng, lat];
  this.changed();
  this.execMeasure();
};

// extend start
LineString.prototype.execMeasure = function () {
  if (!this.measure.enabled || !this.isValid()) return;
  this.ctx.store.afterRender(() => {
    const { unit, precision } = this.measure.options;
    const markers = this.measure.markers;
    this.getCoordinates().forEach((coord, index) => {
      if (index === 0) return;
      const marker = markers[index] || new Marker();
      markers[index] = marker;
      marker.setLngLat(coord).addTo(this.ctx.map);
      const dom = marker.getElement();
      const coordinates = this.getCoordinates().slice(0, index + 1);
      const value = turf.length(turf.lineString(coordinates), { units: unit.line });
      marker.setLngLat(coord);
      dom.innerHTML = value ? `${value.toFixed(precision)}` : '';
      dom.classList.add(Constants.classes.MEASURE_MARKER);
    });
    markers.splice(this.coordinates.length, markers.length - this.coordinates.length).forEach((marker) => {
      marker.remove();
    });
  });
};
// extend end

export default LineString;
