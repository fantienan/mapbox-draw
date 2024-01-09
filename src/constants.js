export const classes = {
  CONTROL_BASE: 'mapboxgl-ctrl',
  CONTROL_PREFIX: 'mapboxgl-ctrl-',
  CONTROL_BUTTON: 'mapbox-gl-draw_ctrl-draw-btn',
  CONTROL_BUTTON_LINE: 'mapbox-gl-draw_line',
  CONTROL_BUTTON_POLYGON: 'mapbox-gl-draw_polygon',
  CONTROL_BUTTON_POINT: 'mapbox-gl-draw_point',
  CONTROL_BUTTON_TRASH: 'mapbox-gl-draw_trash',
  CONTROL_BUTTON_COMBINE_FEATURES: 'mapbox-gl-draw_combine',
  CONTROL_BUTTON_UNCOMBINE_FEATURES: 'mapbox-gl-draw_uncombine',
  CONTROL_GROUP: 'mapboxgl-ctrl-group',
  ATTRIBUTION: 'mapboxgl-ctrl-attrib',
  ACTIVE_BUTTON: 'active',
  BOX_SELECT: 'mapbox-gl-draw_boxselect',
  /** extend start */
  CONTROL_BUTTON_UNDO: 'mapbox-gl-draw_undo',
  CONTROL_BUTTON_REDO: 'mapbox-gl-draw_redo',
  CONTROL_BUTTON_FINISH: 'mapbox-gl-draw_finish',
  CONTROL_BUTTON_CANCEL: 'mapbox-gl-draw_cancel',
  CONTROL_BUTTON_DRAW_CENTER: 'mapbox-gl-draw_draw-center',
  MEASURE_MARKER: 'mapbox-gl-draw-measure'
  /** extend end */
};

export const sources = {
  HOT: 'mapbox-gl-draw-hot',
  COLD: 'mapbox-gl-draw-cold'
};

export const cursors = {
  ADD: 'add',
  MOVE: 'move',
  DRAG: 'drag',
  POINTER: 'pointer',
  NONE: 'none'
};

export const types = {
  POLYGON: 'polygon',
  LINE: 'line_string',
  POINT: 'point'
};

export const geojsonTypes = {
  FEATURE: 'Feature',
  POLYGON: 'Polygon',
  LINE_STRING: 'LineString',
  POINT: 'Point',
  FEATURE_COLLECTION: 'FeatureCollection',
  MULTI_PREFIX: 'Multi',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon'
};

export const modes = {
  DRAW_LINE_STRING: 'draw_line_string',
  DRAW_POLYGON: 'draw_polygon',
  DRAW_POINT: 'draw_point',
  SIMPLE_SELECT: 'simple_select',
  DIRECT_SELECT: 'direct_select',
  STATIC: 'static'
};

export const events = {
  CREATE: 'draw.create',
  DELETE: 'draw.delete',
  UPDATE: 'draw.update',
  SELECTION_CHANGE: 'draw.selectionchange',
  MODE_CHANGE: 'draw.modechange',
  ACTIONABLE: 'draw.actionable',
  RENDER: 'draw.render',
  COMBINE_FEATURES: 'draw.combine',
  UNCOMBINE_FEATURES: 'draw.uncombine',
  // extend start
  REDO_UNDO: "draw.redoUndo",
  CLICK_ON_VERTEX: "draw.clickOnVertex",
  ON_MIDPOINT: "draw.onMidpoint",
  DRAG_VERTEX: "draw.dragVertex",
  CLICK_OR_TAB: "draw.clickOrTab",
  DRAG: "draw.drag",
  CLEAR_SELECTED_COORDINATES: 'draw.clearSelectedCoordinates',
  ADD_POINT: 'draw.addPoint',
  ADD: 'draw.onAdd',
  // extend end
};

export const updateActions = {
  MOVE: 'move',
  CHANGE_COORDINATES: 'change_coordinates'
};

export const meta = {
  FEATURE: 'feature',
  MIDPOINT: 'midpoint',
  VERTEX: 'vertex',
  LAST_POINT: 'last_point',
  SECOND_TO_LAST_POINT: 'second_to_last_point'
};

export const activeStates = {
  ACTIVE: 'true',
  INACTIVE: 'false'
};

export const interactions = [
  'scrollZoom',
  'boxZoom',
  'dragRotate',
  'dragPan',
  'keyboard',
  'doubleClickZoom',
  'touchZoomRotate'
];

export const LAT_MIN = -90;
export const LAT_RENDERED_MIN = -85;
export const LAT_MAX = 90;
export const LAT_RENDERED_MAX = 85;
export const LNG_MIN = -270;
export const LNG_MAX = 270;

export const GEOMETRYS = [ "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection" ];
