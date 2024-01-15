import draw_point from '../../modes/draw_point';
import * as Constants from '../../constants';

const { onSetup: originOnSetup, onClick: originOnClick, ...restOriginMethods } = draw_point;

const DrawPoint = { originOnSetup, originOnClick, ...restOriginMethods };

DrawPoint.onSetup = function (opt) {
  const state = this.originOnSetup();
  const { onDraw, onCancel } = opt;
  state.onDraw = onDraw;
  state.onCancel = onCancel;
  return this.setState(state);
};

DrawPoint.onTap = DrawPoint.onClick = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.MOVE });
  state.point.updateCoordinate('', e.lngLat.lng, e.lngLat.lat);

  if (typeof state.onDraw === 'function') state.onDraw(state.point.toGeoJSON());
  else this.map.fire('draw.passing-create', { features: [state.point.toGeoJSON()] });

  this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
};

DrawPoint.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  state.point.updateCoordinate(e.lngLat.lng, e.lngLat.lat);
};

DrawPoint.onStop = function (state) {
  const f = state.point;
  const drawnFeature = this.getFeature(f.id);
  if (drawnFeature === undefined) {
    if (typeof state.onCancel === 'function') state.onCancel();
    return;
  }

  this.activateUIButton();
  this.deleteFeature([state.point.id], { silent: true });
};

export default DrawPoint;
