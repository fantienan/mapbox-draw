import * as Constants from '../constants';
import * as images from './images';

function getEventData(modeInstance, eventData) {
  const draw = modeInstance.getCtx().api;
  const data = { ...eventData, draw, mode: draw.getMode(), state: modeInstance.getState() };
  return { data };
}

export function mapFireOnAdd(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.ADD, getEventData(modeInstance, eventData));
}

export function mapFireRedoUndo(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.REDO_UNDO, getEventData(modeInstance, eventData));
}

export function mapFireByClickOnVertex(modeInstance, evetnData) {
  modeInstance.map.fire(Constants.events.CLICK_ON_VERTEX, getEventData(modeInstance, evetnData));
}

export function mapFireByOnMidpoint(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.ON_MIDPOINT, getEventData(modeInstance, eventData));
}

export function mapFireByDragVertex(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.DRAG_VERTEX, getEventData(modeInstance, eventData));
}

export function mapFireClickOrOnTab(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.CLICK_OR_TAB, getEventData(modeInstance, eventData));
}

export function mapFireDrag(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.DRAG, getEventData(modeInstance, eventData));
}

export function mapClearSelectedCoordinates(modeInstance) {
  modeInstance.map.fire(Constants.events.CLEAR_SELECTED_COORDINATES);
}

export function mapFireAddPoint(modeInstance, eventData) {
  modeInstance.map.fire(Constants.events.ADD_POINT, getEventData(modeInstance, eventData));
}

/**
 * Returns GeoJSON for a Point representing the
 * vertex of another feature.
 *
 * @param {string} parentId
 * @param {Array<number>} coordinates
 * @param {string} path - Dot-separated numbers indicating exactly
 *   where the point exists within its parent feature's coordinates.
 * @param {boolean} selected
 * @param {boolean} isLast
 * @return {GeoJSON} Point
 */
export function createLastOrSecondToLastPoint(parentId, coordinates, path, selected, isLast, mode) {
  return {
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      meta: isLast ? Constants.meta.LAST_POINT : Constants.meta.SECOND_TO_LAST_POINT,
      parent: parentId,
      coord_path: path,
      active: selected ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE,
      mode,
    },
    geometry: {
      type: Constants.geojsonTypes.POINT,
      coordinates,
    },
  };
}

/** 是否禁止双击落点或者落点与其它节点重合时触发完成绘制 */
export function isDisabledClickOnVertexWithCtx(ctx) {
  return ctx.options.disabledClickOnVertex;
}

/** 受否忽略双击落点或者落点与其它节点重合的检测 */
export function isIgnoreClickOnVertexWithCtx(ctx) {
  return ctx.options.ignoreClickOnVertex;
}

/** 点击地图未命中feature时什么也不做 */
export function isClickOnMissAndDoNothing(ctx) {
  return ctx.options.clickOnMissAndDoNothing;
}

/** 当点击源的元素有selector时，阻止触发高亮图斑点击事件 */
export function isStopPropagationClickActiveFeature(ctx, e) {
  try {
    if (ctx.options.disableSelect) return true;
    const className = ctx.options.stopPropagationClickActiveFeatureHandlerClassName;
    return (
      e.originalEvent.target &&
      typeof e.originalEvent.target.className === 'string' &&
      className &&
      e.originalEvent.target.className.includes(className)
    );
  } catch (e) {
    return false;
  }
}

/** 编辑模式下点击图形以外部分不退出编辑模式 */
export function isClickNotthingNoChangeMode(ctx) {
  return ctx.options.clickNotthingNoChangeMode;
}

/** simple_select mode 时禁止拖拽节点 */
export function isDisabledDragVertexWithSimpleSelectMode(ctx) {
  return ctx.options.disabledDragVertexWithSimpleSelectMode;
}

export function isDisabledDragVertexUi(ctx, feature, classes) {
  const isSimpleSelect = ctx.api.getMode() === Constants.modes.SIMPLE_SELECT;
  const isPoint = feature.geometry.type === Constants.geojsonTypes.POINT;
  const disabledDragVertex = isDisabledDragVertexWithSimpleSelectMode(ctx);
  const isActive = feature.properties.active === Constants.activeStates.ACTIVE;
  if (disabledDragVertex && isSimpleSelect && isPoint) {
    classes.mouse = isActive ? Constants.cursors.NONE : Constants.cursors.POINTER;
  }
}

/** 是否禁止移动多边形 */
export function isDisabledMovePolgon(ctx, state) {
  return ctx.options.disabledMovePolgon && state.selectedCoordPaths.length === 0;
}

/** 触屏设备双指缩放时是否允许拖拽节点 */
export function isDisabledDragVertexWithTwoFingersZoom(ctx, e) {
  if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length === 2) {
    return ctx.options.disabledDragVertexWithTwoFingersZoom;
  }
  return false;
}

function loadIconImage(map, iconImage) {
  return new Promise((resolve, reject) => {
    map.loadImage(iconImage.url, (error, image) => {
      if (error) {
        reject(error);
      } else if (!map.hasImage(iconImage.id)) {
        resolve({ ...iconImage, image });
      }
    });
  });
}

export function batchLoadImages(map, iconImages) {
  return new Promise((resolve, reject) => {
    const promises = [];
    iconImages.forEach((iconImage) => {
      promises.push(loadIconImage(map, iconImage));
    });
    Promise.all(promises)
      .then((res) => {
        res.forEach((iconImage) => {
          map.addImage(iconImage.id, iconImage.image);
        });
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function loadIconImageByTheme(map) {
  const icon2 = { url: images.icon1, id: 'gl-draw-icon1' };
  const icon1 = { url: images.icon2, id: 'gl-draw-icon2' };
  const icon3 = { url: images.icon3, id: 'gl-draw-icon3' };
  batchLoadImages(map, [{ ...icon1 }, { ...icon2 }, { ...icon3 }]);
}
