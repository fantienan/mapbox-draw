import * as Constants from './constants';

export default function render(e) {
  // eslint-disable-next-line no-invalid-this
  const store = this;
  const mapExists = store.ctx.map && store.ctx.map.getSource(Constants.sources.HOT) !== undefined;
  if (!mapExists) return cleanup();

  const mode = store.ctx.events.currentModeName();

  store.ctx.ui.queueMapClasses({ mode });

  let newHotIds = [];
  let newColdIds = [];

  if (store.isDirty) {
    newColdIds = store.getAllIds();
  } else {
    newHotIds = store.getChangedIds().filter((id) => store.get(id) !== undefined);
    newColdIds = store.sources.hot
      .filter((geojson) => {
        return geojson.properties.id && newHotIds.indexOf(geojson.properties.id) === -1 && store.get(geojson.properties.id) !== undefined;
      })
      .map((geojson) => geojson.properties.id);
  }

  store.sources.hot = [];
  const lastColdCount = store.sources.cold.length;
  store.sources.cold = store.isDirty
    ? []
    : store.sources.cold.filter((geojson) => {
        const id = geojson.properties.id || geojson.properties.parent;
        return newHotIds.indexOf(id) === -1;
      });

  const coldChanged = lastColdCount !== store.sources.cold.length || newColdIds.length > 0;
  newHotIds.forEach((id) => renderFeature(id, 'hot'));
  newColdIds.forEach((id) => renderFeature(id, 'cold'));

  function renderFeature(id, source) {
    const feature = store.get(id);
    const featureInternal = feature.internal(mode);
    store.ctx.events.currentModeRender(featureInternal, (geojson) => {
      store.sources[source].push(geojson);
    });
  }

  if (coldChanged) {
    store.ctx.map.getSource(Constants.sources.COLD).setData({
      type: Constants.geojsonTypes.FEATURE_COLLECTION,
      features: store.sources.cold,
    });
  }

  store.ctx.map.getSource(Constants.sources.HOT).setData({
    type: Constants.geojsonTypes.FEATURE_COLLECTION,
    features: store.sources.hot,
  });

  // extend start
  if (store._emitSelectionChange || !e || e.type !== 'mousemove') {
    const modeInstance = store.ctx.events.getModeInstance();
    const isSimpleSelectMode = mode === Constants.modes.SIMPLE_SELECT;
    const isDirectSelectMode = mode === Constants.modes.DIRECT_SELECT;
    const isCutMode = mode.includes('cut');
    const disabledCut = isSimpleSelectMode ? !store.getSelected().length : isCutMode ? modeInstance.getWaitCutFeatures().length : true;
    const disableFinish = isSimpleSelectMode || isDirectSelectMode || !modeInstance.feature.isValid();
    store.ctx.ui.setDisableButtons((buttonStatus) => {
      buttonStatus.cut_polygon = { disabled: disabledCut };
      buttonStatus.cut_line = { disabled: disabledCut };
      buttonStatus.draw_center = { disabled: isSimpleSelectMode };
      buttonStatus.finish = { disabled: disableFinish };
      buttonStatus.cancel = { disabled: isSimpleSelectMode || isDirectSelectMode };
      buttonStatus.undo = { disabled: modeInstance.redoUndo.undoStack.length === 0 };
      buttonStatus.redo = { disabled: modeInstance.redoUndo.redoStack.length === 0 };
      return buttonStatus;
    });
  }
  // extend end

  if (store._emitSelectionChange) {
    store.ctx.map.fire(Constants.events.SELECTION_CHANGE, {
      features: store.getSelected().map((feature) => feature.toGeoJSON()),
      points: store.getSelectedCoordinates().map((coordinate) => ({
        type: Constants.geojsonTypes.FEATURE,
        properties: {},
        geometry: {
          type: Constants.geojsonTypes.POINT,
          coordinates: coordinate.coordinates,
        },
      })),
    });
    store._emitSelectionChange = false;
  }

  if (store._deletedFeaturesToEmit.length) {
    const geojsonToEmit = store._deletedFeaturesToEmit.map((feature) => feature.delete().toGeoJSON());
    store._deletedFeaturesToEmit = [];
    store.ctx.map.fire(Constants.events.DELETE, { features: geojsonToEmit });
  }

  cleanup();
  store.ctx.map.fire(Constants.events.RENDER, {});
  // extend start
  store.emitCallbacks();
  // extend end

  function cleanup() {
    store.isDirty = false;
    store.clearChangedIds();
  }
}
