import * as CommonSelectors from '../lib/common_selectors';
import isEventAtCoordinates from '../lib/is_event_at_coordinates';
import doubleClickZoom from '../lib/double_click_zoom';
import * as Constants from '../constants';
import createVertex from '../lib/create_vertex';
import {
  createLastOrSecondToLastPoint,
  isDisabledClickOnVertexWithCtx,
  isIgnoreClickOnVertexWithCtx,
  mapFireAddPoint,
  mapFireByClickOnVertex,
} from '../extend';

const DrawLineString = {};

DrawLineString.onSetup = function (opts) {
  opts = opts || {};
  const featureId = opts.featureId;

  let line, currentVertexPosition;
  let direction = 'forward';
  if (featureId) {
    line = this.getFeature(featureId);
    if (!line) {
      throw new Error('Could not find a feature with the provided featureId');
    }
    let from = opts.from;
    if (from && from.type === 'Feature' && from.geometry && from.geometry.type === 'Point') {
      from = from.geometry;
    }
    if (from && from.type === 'Point' && from.coordinates && from.coordinates.length === 2) {
      from = from.coordinates;
    }
    if (!from || !Array.isArray(from)) {
      throw new Error('Please use the `from` property to indicate which point to continue the line from');
    }
    const lastCoord = line.coordinates.length - 1;
    if (line.coordinates[lastCoord][0] === from[0] && line.coordinates[lastCoord][1] === from[1]) {
      currentVertexPosition = lastCoord + 1;
      // add one new coordinate to continue from
      line.addCoordinate(currentVertexPosition, ...line.coordinates[lastCoord]);
    } else if (line.coordinates[0][0] === from[0] && line.coordinates[0][1] === from[1]) {
      direction = 'backwards';
      currentVertexPosition = 0;
      // add one new coordinate to continue from
      line.addCoordinate(currentVertexPosition, ...line.coordinates[0]);
    } else {
      throw new Error('`from` should match the point at either the start or the end of the provided LineString');
    }
  } else {
    line = this.newFeature(
      {
        type: Constants.geojsonTypes.FEATURE,
        properties: {},
        geometry: {
          type: Constants.geojsonTypes.LINE_STRING,
          coordinates: [],
        },
      },
      { declareFeature: true },
    );
    currentVertexPosition = 0;
    this.addFeature(line);
  }
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(opts.button || Constants.types.LINE);
  this.setActionableState({
    trash: true,
  });
  // extend start
  return this.setState({ line, currentVertexPosition, direction });
  // extend end
};

DrawLineString.clickAnywhere = function (state, e) {
  if (
    (state.currentVertexPosition > 0 && isEventAtCoordinates(e, state.line.coordinates[state.currentVertexPosition - 1])) ||
    (state.direction === 'backwards' && isEventAtCoordinates(e, state.line.coordinates[state.currentVertexPosition + 1]))
  ) {
    // extend start
    if (isIgnoreClickOnVertexWithCtx(this._ctx)) return;
    // extend end
    return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.line.id] });
  }
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  if (state.direction === 'forward') {
    state.currentVertexPosition++;
    state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  } else {
    state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
  }
  // extend start
  this.afterRender(() => mapFireAddPoint(this, { e }));
  // extend end
};

DrawLineString.clickOnVertex = function (state, e) {
  // extend start
  if (isDisabledClickOnVertexWithCtx(this._ctx)) return;
  if (typeof e === 'function') return e();
  this.afterRender(() => mapFireByClickOnVertex(this, { e }));
  // extend end
  return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.line.id] });
};

DrawLineString.onMouseMove = function (state, e) {
  state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  if (CommonSelectors.isVertex(e)) {
    this.updateUIClasses({ mouse: Constants.cursors.POINTER });
  }
};

DrawLineString.onTap = DrawLineString.onClick = function (state, e) {
  // extend start
  if (isIgnoreClickOnVertexWithCtx(this._ctx)) return this.clickAnywhere(state, e);
  // extend end
  if (CommonSelectors.isVertex(e)) return this.clickOnVertex(state, e);
  this.clickAnywhere(state, e);
};

DrawLineString.onKeyUp = function (state, e) {
  if (CommonSelectors.isEnterKey(e)) {
    this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.line.id] });
  } else if (CommonSelectors.isEscapeKey(e)) {
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode(Constants.modes.SIMPLE_SELECT);
  }
};

DrawLineString.onStop = function (state, cb) {
  doubleClickZoom.enable(this);
  this.activateUIButton();
  this.destroy();

  // check to see if we've deleted this feature
  if (this.getFeature(state.line.id) === undefined) return;
  //remove last added coordinate
  state.line.removeCoordinate(`${state.currentVertexPosition}`);
  if (typeof cb === 'function') return cb();
  if (state.line.isValid()) {
    this.map.fire(Constants.events.CREATE, {
      features: [state.line.toGeoJSON()],
    });
  } else {
    this.deleteFeature([state.line.id], { silent: true });
    // this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

DrawLineString.onTrash = function (state) {
  this.deleteFeature([state.line.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT);
};

DrawLineString.toDisplayFeatures = function (state, geojson, display) {
  const isActiveLine = geojson.properties.id === state.line.id;
  geojson.properties.active = isActiveLine ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  if (!isActiveLine) return display(geojson);
  // Only render the line if it has at least one real coordinate
  if (geojson.geometry.coordinates.length < 2) return;
  geojson.properties.meta = Constants.meta.FEATURE;
  // extend start
  geojson.geometry.coordinates.forEach((coordinate, index) => {
    const i = `${index + 1}`;
    if (index === geojson.geometry.coordinates.length - 1) {
      display(createLastOrSecondToLastPoint(state.line.id, coordinate, i, false, true, Constants.modes.DRAW_LINE_STRING));
    } else {
      const secondLast = index === geojson.geometry.coordinates.length - 2;
      if (secondLast) {
        display(createLastOrSecondToLastPoint(state.line.id, coordinate, i, false, false, Constants.modes.DRAW_LINE_STRING));
      }
      display(createVertex(state.line.id, coordinate, i, false, secondLast, Constants.modes.DRAW_LINE_STRING));
    }
  });
  // extend-end

  // display(createVertex(
  //   state.line.id,
  //   geojson.geometry.coordinates[state.direction === 'forward' ? geojson.geometry.coordinates.length - 2 : 1],
  //   `${state.direction === 'forward' ? geojson.geometry.coordinates.length - 2 : 1}`,
  //   false
  // ));

  display(geojson);
};

DrawLineString.drawByCoordinate = function (coord) {
  const state = this.getState();
  state.line.addCoordinate(state.currentVertexPosition++, coord[0], coord[1]);
  this.afterRender(() => mapFireAddPoint(this), true);
};

export default DrawLineString;
