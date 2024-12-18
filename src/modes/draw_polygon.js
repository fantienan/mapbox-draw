import * as CommonSelectors from '../lib/common_selectors';
import doubleClickZoom from '../lib/double_click_zoom';
import * as Constants from '../constants';
import isEventAtCoordinates from '../lib/is_event_at_coordinates';
import createVertex from '../lib/create_vertex';
import {
  createLastOrSecondToLastPoint,
  isDisabledClickOnVertexWithCtx,
  isIgnoreClickOnVertexWithCtx,
  mapFireAddPoint,
  mapFireByClickOnVertex,
} from '../extend';

const DrawPolygon = {};

DrawPolygon.onSetup = function (opt = {}) {
  const polygon = this.newFeature(
    {
      type: Constants.geojsonTypes.FEATURE,
      properties: {},
      geometry: {
        type: Constants.geojsonTypes.POLYGON,
        coordinates: [[]],
      },
    },
    { declareFeature: true },
  );

  this.addFeature(polygon);
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(opt.button || Constants.types.POLYGON);
  this.setActionableState({ trash: true });

  // extend start
  return this.setState({ polygon, currentVertexPosition: 0 });
  // extend end
};

DrawPolygon.clickAnywhere = function (state, e) {
  if (state.currentVertexPosition > 0 && isEventAtCoordinates(e, state.polygon.coordinates[0][state.currentVertexPosition - 1])) {
    // extend start
    if (isIgnoreClickOnVertexWithCtx(this._ctx)) return;
    // extend end
    return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
  }

  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
  state.currentVertexPosition++;
  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
  // extend start
  this.afterRender(() => mapFireAddPoint(this, { e }));
  // extend end
};

DrawPolygon.clickOnVertex = function (state, e) {
  // extend start
  if (isDisabledClickOnVertexWithCtx(this._ctx)) return;
  if (typeof e === 'function') return e();
  this.afterRender(() => mapFireByClickOnVertex(this, { e }));
  // extend end
  return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
};

DrawPolygon.onMouseMove = function (state, e) {
  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
  if (CommonSelectors.isVertex(e)) {
    this.updateUIClasses({ mouse: Constants.cursors.POINTER });
  }
};

DrawPolygon.onTap = DrawPolygon.onClick = function (state, e) {
  // extend start
  if (isIgnoreClickOnVertexWithCtx(this._ctx)) return this.clickAnywhere(state, e);
  // extend end
  if (CommonSelectors.isVertex(e)) return this.clickOnVertex(state, e);
  return this.clickAnywhere(state, e);
};

DrawPolygon.onKeyUp = function (state, e) {
  if (CommonSelectors.isEscapeKey(e)) {
    this.deleteFeature([state.polygon.id], { silent: true });
    this.changeMode(Constants.modes.SIMPLE_SELECT);
  } else if (CommonSelectors.isEnterKey(e)) {
    this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
  }
};

DrawPolygon.onStop = function (state, cb) {
  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  doubleClickZoom.enable(this);
  this.activateUIButton();
  this.destroy();

  // check to see if we've deleted this feature
  if (this.getFeature(state.polygon.id) === undefined) return;
  //remove last added coordinate

  state.polygon.removeCoordinate(`0.${state.currentVertexPosition}`);
  if (typeof cb === 'function') return cb(state);
  if (state.polygon.isValid()) {
    this.map.fire(Constants.events.CREATE, { features: [state.polygon.toGeoJSON()] });
  } else {
    this.deleteFeature([state.polygon.id], { silent: true });
    // this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

DrawPolygon.toDisplayFeatures = function (state, geojson, display) {
  const isActivePolygon = geojson.properties.id === state.polygon.id;
  geojson.properties.active = isActivePolygon ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  if (!isActivePolygon) return display(geojson);

  // Don't render a polygon until it has two positions
  // (and a 3rd which is just the first repeated)
  if (geojson.geometry.coordinates.length === 0) return;

  const coordinateCount = geojson.geometry.coordinates[0].length;
  // 2 coordinates after selecting a draw type
  // 3 after creating the first point
  if (coordinateCount < 3) {
    return;
  }
  geojson.properties.meta = Constants.meta.FEATURE;
  display(createVertex(state.polygon.id, geojson.geometry.coordinates[0][0], '0.0', false, undefined, Constants.modes.DRAW_POLYGON));
  if (coordinateCount > 3) {
    // Add a start position marker to the map, clicking on this will finish the feature
    // This should only be shown when we're in a valid spot
    const endPos = geojson.geometry.coordinates[0].length - 3;
    // extend start
    if (endPos > 0) {
      geojson.geometry.coordinates[0].slice(1, endPos).forEach((coordinate, index) => {
        display(createVertex(state.polygon.id, coordinate, `0.${index + 1}`, false, false, Constants.modes.DRAW_POLYGON));
      });
    }
    // extend end
    display(
      createVertex(state.polygon.id, geojson.geometry.coordinates[0][endPos], `0.${endPos}`, false, true, Constants.modes.DRAW_POLYGON),
    );
    // extend start
    display(
      createLastOrSecondToLastPoint(
        state.polygon.id,
        geojson.geometry.coordinates[0][endPos],
        `0.${endPos}`,
        false,
        false,
        Constants.modes.DRAW_POLYGON,
      ),
    );
    display(
      createLastOrSecondToLastPoint(
        state.polygon.id,
        geojson.geometry.coordinates[0][endPos],
        `0.${endPos + 1}`,
        false,
        true,
        Constants.modes.DRAW_POLYGON,
      ),
    );
    // extend end
  }
  if (coordinateCount <= 4) {
    // If we've only drawn two positions (plus the closer),
    // make a LineString instead of a Polygon
    const lineCoordinates = [
      [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]],
      [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]],
    ];
    // create an initial vertex so that we can track the first point on mobile devices
    display({
      type: Constants.geojsonTypes.FEATURE,
      properties: geojson.properties,
      geometry: {
        coordinates: lineCoordinates,
        type: Constants.geojsonTypes.LINE_STRING,
      },
    });
    if (coordinateCount === 3) {
      return;
    }
  }
  // render the Polygon
  return display(geojson);
};

DrawPolygon.onTrash = function (state) {
  this.deleteFeature([state.polygon.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT);
};

DrawPolygon.drawByCoordinate = function (coord) {
  const state = this.getState();
  state.polygon.addCoordinate(`0.${state.currentVertexPosition++}`, coord[0], coord[1]);
  this.afterRender(() => mapFireAddPoint(this), true);
};

export default DrawPolygon;
