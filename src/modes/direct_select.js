import { noTarget, isOfMetaType, isActiveFeature, isInactiveFeature, isShiftDown } from '../lib/common_selectors';
import createSupplementaryPoints from '../lib/create_supplementary_points';
import constrainFeatureMovement from '../lib/constrain_feature_movement';
import doubleClickZoom from '../lib/double_click_zoom';
import * as Constants from '../constants';
import moveFeatures from '../lib/move_features';
import {
  mapFireDrag,
  isDisabledDragVertexWithTwoFingersZoom,
  mapFireClickOrOnTab,
  mapFireByClickOnVertex,
  mapFireByDragVertex,
  mapFireByOnMidpoint,
  isStopPropagationClickActiveFeature,
  isClickNotthingNoChangeMode,
  isDisabledMovePolgon,
} from '../extend';

const isVertex = isOfMetaType(Constants.meta.VERTEX);
const isMidpoint = isOfMetaType(Constants.meta.MIDPOINT);

const DirectSelect = {};

// INTERNAL FUCNTIONS

DirectSelect.fireUpdate = function () {
  this.map.fire(Constants.events.UPDATE, {
    action: Constants.updateActions.CHANGE_COORDINATES,
    features: this.getSelected().map((f) => f.toGeoJSON()),
  });
};

DirectSelect.fireActionable = function (state) {
  this.setActionableState({
    combineFeatures: false,
    uncombineFeatures: false,
    trash: state.selectedCoordPaths.length > 0,
  });
};

DirectSelect.startDragging = function (state, e) {
  this.map.dragPan.disable();
  // extend start
  this.map.dragRotate.disable();
  this.map.touchPitch.disable();
  this.map.touchZoomRotate.disable();
  // extend end
  if (!isDisabledMovePolgon(this._ctx, state)) state.canDragMove = true;
  state.dragMoveLocation = e.lngLat;
};

DirectSelect.stopDragging = function (state) {
  this.map.dragPan.enable();
  this.map.dragRotate.enable();
  this.map.touchPitch.enable();
  this.map.touchZoomRotate.enable();
  state.dragMoving = false;
  state.canDragMove = false;
  state.dragMoveLocation = null;
};

DirectSelect.onVertex = function (state, e) {
  this.startDragging(state, e);
  const about = e.featureTarget.properties;
  const selectedIndex = state.selectedCoordPaths.indexOf(about.coord_path);
  if (!isShiftDown(e) && selectedIndex === -1) {
    state.selectedCoordPaths = [about.coord_path];
  } else if (isShiftDown(e) && selectedIndex === -1) {
    state.selectedCoordPaths.push(about.coord_path);
  }
  const selectedCoordinates = this.pathsToCoordinates(state.featureId, state.selectedCoordPaths);
  this.setSelectedCoordinates(selectedCoordinates);
  // extend start
  this.afterRender(() => mapFireByClickOnVertex(this, { e }));
  // extend end
};

DirectSelect.onMidpoint = function (state, e) {
  this.startDragging(state, e);
  const about = e.featureTarget.properties;
  // extend start
  this.afterRender(() => mapFireByOnMidpoint(this, { e }));
  this._reodUndoAdd({ selectedCoordPaths: state.selectedCoordPaths });
  // extend end
  state.feature.addCoordinate(about.coord_path, about.lng, about.lat);
  this.fireUpdate();
  state.selectedCoordPaths = [about.coord_path];
};

DirectSelect.pathsToCoordinates = function (featureId, paths) {
  return paths.map((coord_path) => ({ feature_id: featureId, coord_path }));
};

DirectSelect.onFeature = function (state, e) {
  if (state.selectedCoordPaths.length === 0) this.startDragging(state, e);
  else this.stopDragging(state);
};

DirectSelect.dragFeature = function (state, e, delta) {
  moveFeatures(this.getSelected(), delta, this);
  state.dragMoveLocation = e.lngLat;
};

DirectSelect.dragVertex = function (state, e, delta) {
  if (isDisabledDragVertexWithTwoFingersZoom(this._ctx, e)) return;
  const selectedCoords = state.selectedCoordPaths.map((coord_path) => state.feature.getCoordinate(coord_path));
  const selectedCoordPoints = selectedCoords.map((coords) => ({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POINT,
      coordinates: coords,
    },
  }));

  const constrainedDelta = constrainFeatureMovement(selectedCoordPoints, delta);
  for (let i = 0; i < selectedCoords.length; i++) {
    const coord = selectedCoords[i];
    state.feature.updateCoordinate(state.selectedCoordPaths[i], coord[0] + constrainedDelta.lng, coord[1] + constrainedDelta.lat);
  }
  // extend start
  e.state = state;
  this.afterRender(() => mapFireByDragVertex(this, { e }));
  // extend end
};

DirectSelect.clickNoTarget = function () {
  this.changeMode(Constants.modes.SIMPLE_SELECT);
};

DirectSelect.clickInactive = function () {
  this.changeMode(Constants.modes.SIMPLE_SELECT);
};

DirectSelect.clickActiveFeature = function (state) {
  state.selectedCoordPaths = [];
  this.clearSelectedCoordinates();
  state.feature.changed();
};

// EXTERNAL FUNCTIONS

DirectSelect.onSetup = function (opts) {
  const featureId = opts.featureId;
  const feature = this.getFeature(featureId);

  if (!feature) {
    throw new Error('You must provide a featureId to enter direct_select mode');
  }

  if (feature.type === Constants.geojsonTypes.POINT) {
    throw new TypeError("direct_select mode doesn't handle point features");
  }

  const state = {
    featureId,
    feature,
    dragMoveLocation: opts.startPos || null,
    dragMoving: false,
    canDragMove: false,
    selectedCoordPaths: opts.coordPath ? [opts.coordPath] : [],
  };

  this.setSelectedCoordinates(this.pathsToCoordinates(featureId, state.selectedCoordPaths));
  this.setSelected(featureId);
  doubleClickZoom.disable(this);
  this.setActionableState({ trash: true });
  // extend start
  return this.setState(state);
  // extend end
};

DirectSelect.onStop = function () {
  doubleClickZoom.enable(this);
  this.clearSelectedCoordinates();
  this.destroy();
};

DirectSelect.toDisplayFeatures = function (state, geojson, push) {
  if (state.featureId === geojson.properties.id) {
    geojson.properties.active = Constants.activeStates.ACTIVE;
    push(geojson);
    createSupplementaryPoints(
      geojson,
      {
        map: this.map,
        midpoints: true,
        selectedPaths: state.selectedCoordPaths,
      },
      undefined,
      Constants.modes.DIRECT_SELECT,
    ).forEach(push);
  } else {
    geojson.properties.active = Constants.activeStates.INACTIVE;
    push(geojson);
  }
  this.fireActionable(state);
};

DirectSelect.onTrash = function (state) {
  // Uses number-aware sorting to make sure '9' < '10'. Comparison is reversed because we want them
  // in reverse order so that we can remove by index safely.
  state.selectedCoordPaths.sort((a, b) => b.localeCompare(a, 'en', { numeric: true })).forEach((id) => state.feature.removeCoordinate(id));
  this.fireUpdate();
  state.selectedCoordPaths = [];
  this.clearSelectedCoordinates();
  this.fireActionable(state);
  if (state.feature.isValid() === false) {
    this.deleteFeature([state.featureId]);
    this.changeMode(Constants.modes.SIMPLE_SELECT, {});
  }
};

DirectSelect.onMouseMove = function (state, e) {
  // On mousemove that is not a drag, stop vertex movement.
  const isFeature = isActiveFeature(e);
  const onVertex = isVertex(e);
  const isMidPoint = isMidpoint(e);
  const noCoords = state.selectedCoordPaths.length === 0;
  if (isFeature && noCoords) this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  else if (onVertex && !noCoords) this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  else this.updateUIClasses({ mouse: Constants.cursors.NONE });

  const isDraggableItem = onVertex || isFeature || isMidPoint;
  if (isDraggableItem && state.dragMoving) this.fireUpdate();

  this.stopDragging(state);

  // Skip render
  return true;
};

DirectSelect.onMouseOut = function (state) {
  // As soon as you mouse leaves the canvas, update the feature
  if (state.dragMoving) this.fireUpdate();
  // Skip render
  return true;
};

DirectSelect.onTouchStart = DirectSelect.onMouseDown = function (state, e) {
  if (isVertex(e)) return this.onVertex(state, e);
  if (isActiveFeature(e)) return this.onFeature(state, e);
  if (isMidpoint(e)) return this.onMidpoint(state, e);
};

DirectSelect.onDrag = function (state, e) {
  if (state.canDragMove !== true) return;
  // extend start
  if (state.dragMoving === false) this._reodUndoAdd({ selectedCoordPaths: state.selectedCoordPaths });
  // extend end
  state.dragMoving = true;
  e.originalEvent.stopPropagation();
  let type = 'null';

  const delta = {
    lng: e.lngLat.lng - state.dragMoveLocation.lng,
    lat: e.lngLat.lat - state.dragMoveLocation.lat,
  };
  if (state.selectedCoordPaths.length > 0) {
    this.dragVertex(state, e, delta);
    type = 'dragVertex';
  } else {
    this.dragFeature(state, e, delta);
    type = 'dragFeature';
  }
  state.dragMoveLocation = e.lngLat;
  // extend start
  this.afterRender(() => mapFireDrag(this, { e, type }));
  // extend end
};

DirectSelect.onClick = function (state, e) {
  // extend start
  if (isStopPropagationClickActiveFeature(this._ctx, e)) return;
  // extend end
  if (noTarget(e)) {
    // extend start
    this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'clickNoTarget' }));
    if (isClickNotthingNoChangeMode(this._ctx, e)) {
      return;
    }
    // extend end
    return this.clickNoTarget(state, e);
  }
  if (isActiveFeature(e)) {
    // extend start
    this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'clickActiveFeature' }));
    // extend end
    return this.clickActiveFeature(state, e);
  }
  if (isInactiveFeature(e)) {
    // extend start
    this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'clickInactiveFeature' }));
    // extend end
    return this.clickInactive(state, e);
  }

  this.stopDragging(state);
  // extend start
  this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'null' }));
  // extend end
};

DirectSelect.onTap = function (state, e) {
  if (isStopPropagationClickActiveFeature(this._ctx, e)) return;
  if (noTarget(e)) {
    // extend start
    this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'clickNoTarget' }));
    if (isClickNotthingNoChangeMode(this._ctx, e)) {
      return; //this.clickActiveFeature(state, e);
    }
    // extend end
    return this.clickNoTarget(state, e);
  }
  if (isActiveFeature(e)) {
    // extend start
    this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'clickActiveFeature' }));
    // extend end
    return this.clickActiveFeature(state, e);
  }
  if (isInactiveFeature(e)) {
    // extend start
    this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'clickInactiveFeature' }));
    // extend end
    return this.clickInactive(state, e);
  }
  // extend start
  this.afterRender(() => mapFireClickOrOnTab(this, { e, type: 'null' }));
  // extend end
};

DirectSelect.onTouchEnd = DirectSelect.onMouseUp = function (state) {
  if (state.dragMoving) {
    this.fireUpdate();
  }
  this.stopDragging(state);
};

// extend start
DirectSelect._reodUndoAdd = function (item) {
  const stack = JSON.parse(JSON.stringify({ ...item, coordinates: this.getState().feature.getCoordinates() }));
  this.redoUndo.undoStack.push(stack);
  this.redoUndo.fireChange({ type: 'add' });
};

DirectSelect._redoOrUndo = function (type) {
  if (!type) return;
  const item = this.redoUndo[`${type}Stack`].pop();
  if (item) {
    const state = this.getState();
    this.redoUndo[type === 'undo' ? 'redoStack' : 'undoStack'].push({
      coordinates: state.feature.getCoordinates(),
      selectedCoordPaths: state.selectedCoordPaths,
    });
    if (state.selectedCoordPaths) state.selectedCoordPaths = item.selectedCoordPaths;
    state.feature.setCoordinates(item.coordinates);
    state.feature.execMeasure();
    this._ctx.store.render();
    this.afterRender(() => this.redoUndo.fireChange({ type }));
  }
};

DirectSelect.undo = function () {
  this._redoOrUndo('undo');
};

DirectSelect.redo = function () {
  this._redoOrUndo('redo');
};
// extend end

export default DirectSelect;
