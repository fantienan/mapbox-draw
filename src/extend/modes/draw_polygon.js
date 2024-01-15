import draw_polygon from '../../modes/draw_polygon';
import doubleClickZoom from '../../lib/double_click_zoom';
import * as Constants from '../../constants';

const { onSetup: originOnSetup, onMouseMove: originOnMouseMove, ...restOriginMethods } = draw_polygon;

const DrawPolygon = { originOnSetup, originOnMouseMove, ...restOriginMethods };

DrawPolygon.onSetup = function (opt) {
  const state = this.originOnSetup();
  const { onDraw, onCancel } = opt;
  state.onDraw = onDraw;
  state.onCancel = onCancel;
  return this.setState(state);
};

DrawPolygon.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.originOnMouseMove(state, e);
};

DrawPolygon.onStop = function (state) {
  const f = state.polygon;

  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  doubleClickZoom.enable(this);
  this.activateUIButton();
  const drawnFeature = this.getFeature(f.id);
  if (drawnFeature === undefined) {
    if (typeof state.onCancel === 'function') state.onCancel();
    return;
  }
  f.removeCoordinate(`${state.currentVertexPosition}`);

  if (f.isValid()) {
    if (typeof state.onDraw === 'function') state.onDraw(f.toGeoJSON());
    else this.map.fire('draw.passing-create', { features: [f.toGeoJSON()] });
  }
  this.deleteFeature([f.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
};

export default DrawPolygon;
