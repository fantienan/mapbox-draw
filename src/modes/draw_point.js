import * as CommonSelectors from '../lib/common_selectors';
import * as Constants from '../constants';
import { mapFireAddPoint } from '../extend';

const DrawPoint = {};

DrawPoint.onSetup = function () {
  const point = this.newFeature(
    {
      type: Constants.geojsonTypes.FEATURE,
      properties: {},
      geometry: {
        type: Constants.geojsonTypes.POINT,
        coordinates: [],
      },
    },
    { declareFeature: true },
  );

  this.addFeature(point);

  this.clearSelectedFeatures();
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POINT);

  this.setActionableState({
    trash: true,
  });

  // extend start
  return this.setState({ point });
  // extend end
};

DrawPoint.stopDrawingAndRemove = function (state) {
  this.deleteFeature([state.point.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT);
};

DrawPoint.onTap = DrawPoint.onClick = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  state.point.updateCoordinate('', e.lngLat.lng, e.lngLat.lat);
  // extend start
  this.afterRender(() => mapFireAddPoint(this, { e }));
  // extend end
  this.map.fire(Constants.events.CREATE, {
    features: [state.point.toGeoJSON()],
  });
  this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.point.id] });
};

DrawPoint.onStop = function (state) {
  this.activateUIButton();
  this.destroy();
  if (!state.point.getCoordinate().length) {
    this.deleteFeature([state.point.id], { silent: true });
  }
};

DrawPoint.toDisplayFeatures = function (state, geojson, display) {
  // Never render the point we're drawing
  const isActivePoint = geojson.properties.id === state.point.id;
  geojson.properties.active = isActivePoint ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  if (!isActivePoint) return display(geojson);
};

DrawPoint.onTrash = DrawPoint.stopDrawingAndRemove;

DrawPoint.onKeyUp = function (state, e) {
  if (CommonSelectors.isEscapeKey(e) || CommonSelectors.isEnterKey(e)) {
    return this.stopDrawingAndRemove(state, e);
  }
};

DrawPoint.drawByCoordinate = function (coord) {
  this.onClick(this.getState(), { lngLat: { lng: coord[0], lat: coord[1] } });
};

export default DrawPoint;
