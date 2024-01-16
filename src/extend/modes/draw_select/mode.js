import * as Constants from '../../../constants';
import * as lib from '../../../lib';
import { highlightPropertyName } from './constants';

const defaultOptions = { highlightColor: '#73d13d' };

const SelectMode = {};

SelectMode.onSetup = function (opt) {
  const { selectHighlightColor, onSelect, onCancel } = opt;
  const state = {};
  state.hoveredFeatureID = null;
  state.selectedFeatureID = null;
  state.onSelect = onSelect;
  state.onCancel = onCancel;
  state.api = this._ctx.api;
  const { selectHighlightColor: defaultSelectHighlightColor = defaultOptions.highlightColor } = this._ctx.options;
  state.options = {
    selectHighlightColor: selectHighlightColor || defaultSelectHighlightColor,
  };

  return state;
};

SelectMode.onMouseMove = function (state, e) {
  const { api } = state;
  const { featureTarget } = e;
  // this.originOnMouseMove(state, e);

  if (featureTarget) {
    this.updateUIClasses({ mouse: Constants.cursors.POINTER });
    const hoveringFeatureID = featureTarget.properties.id;
    if (state.hoveredFeatureID !== null && state.hoveredFeatureID !== hoveringFeatureID) {
      api.setFeatureProperty(state.hoveredFeatureID, highlightPropertyName, undefined);
    }
    state.hoveredFeatureID = hoveringFeatureID;
    api.setFeatureProperty(state.hoveredFeatureID, highlightPropertyName, state.options.selectHighlightColor);
  } else {
    if (state.hoveredFeatureID) api.setFeatureProperty(state.hoveredFeatureID, highlightPropertyName, undefined);
    state.hoveredFeatureID = null;
  }
};

SelectMode.onClick = function (state, e) {
  state.selectedFeatureID = state.hoveredFeatureID;
  this.onStop(state, e);
};

SelectMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

SelectMode.onKeyUp = function (state, e) {
  if (CommonSelectors.isEscapeKey(e)) {
    // this.changeMode(Constants.modes.SIMPLE_SELECT);
    if (typeof state.onCancel === 'function') setTimeout(state.onCancel, 0);
  }
};

SelectMode.onStop = function (state) {
  this.updateUIClasses({ mouse: Constants.cursors.NONE });
  lib.doubleClickZoom.enable(this);
  this.activateUIButton();

  if (state.selectedFeatureID) {
    if (typeof state.onSelect === 'function') setTimeout(state.onSelect.bind(null, state.selectedFeatureID), 0);
    else
      this.map.fire('draw.SelectMode.select', {
        featureID: state.selectedFeatureID,
      });

    state.selectedFeatureID = null;
    // this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  } else {
    /// Call `onCancel` if exists.
    if (typeof state.onCancel === 'function') setTimeout(state.onCancel, 0);
  }

  if (state.hoveredFeatureID) {
    this._ctx.api.setFeatureProperty(state.hoveredFeatureID, highlightPropertyName, undefined);
    state.hoveredFeatureID = null;
  }
};

export default SelectMode;
