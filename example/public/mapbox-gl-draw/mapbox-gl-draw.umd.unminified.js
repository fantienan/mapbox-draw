(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('mapbox-gl'), require('@turf/turf')) :
typeof define === 'function' && define.amd ? define(['mapbox-gl', '@turf/turf'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MapboxDraw = factory(global.mapboxgl, global.turf));
})(this, (function (mapboxGl, turf) { 'use strict';

function _interopNamespace(e) {
if (e && e.__esModule) return e;
var n = Object.create(null);
if (e) {
Object.keys(e).forEach(function (k) {
if (k !== 'default') {
var d = Object.getOwnPropertyDescriptor(e, k);
Object.defineProperty(n, k, d.get ? d : {
enumerable: true,
get: function () { return e[k]; }
});
}
});
}
n["default"] = e;
return Object.freeze(n);
}

var turf__namespace = /*#__PURE__*/_interopNamespace(turf);

var ModeHandler = function (mode, DrawContext) {
  var handlers = {
    drag: [],
    click: [],
    mousemove: [],
    mousedown: [],
    mouseup: [],
    mouseout: [],
    keydown: [],
    keyup: [],
    touchstart: [],
    touchmove: [],
    touchend: [],
    tap: [],
  };

  var ctx = {
    on: function on(event, selector, fn) {
      if (handlers[event] === undefined) {
        throw new Error(("Invalid event type: " + event));
      }
      handlers[event].push({
        selector: selector,
        fn: fn,
      });
    },
    render: function render(id) {
      DrawContext.store.featureChanged(id);
    },
  };

  var delegate = function (eventName, event) {
    var handles = handlers[eventName];
    var iHandle = handles.length;
    while (iHandle--) {
      var handle = handles[iHandle];
      if (handle.selector(event)) {
        var skipRender = handle.fn.call(ctx, event);
        if (!skipRender) {
          DrawContext.store.render(event);
        }
        DrawContext.ui.updateMapClasses();
        // ensure an event is only handled once
        // we do this to let modes have multiple overlapping selectors
        // and relay on order of oppertations to filter
        break;
      }
    }
  };

  mode.start.call(ctx);
  return {
    render: mode.render,
    stop: function stop() {
      if (mode.stop) { return mode.stop(); }
    },
    trash: function trash() {
      if (mode.trash) {
        mode.trash();
        DrawContext.store.render();
      }
    },
    combineFeatures: function combineFeatures() {
      if (mode.combineFeatures) {
        mode.combineFeatures();
      }
    },
    uncombineFeatures: function uncombineFeatures() {
      if (mode.uncombineFeatures) {
        mode.uncombineFeatures();
      }
    },
    drag: function drag(event) {
      delegate('drag', event);
    },
    click: function click(event) {
      delegate('click', event);
    },
    mousemove: function mousemove(event) {
      delegate('mousemove', event);
    },
    mousedown: function mousedown(event) {
      delegate('mousedown', event);
    },
    mouseup: function mouseup(event) {
      delegate('mouseup', event);
    },
    mouseout: function mouseout(event) {
      delegate('mouseout', event);
    },
    keydown: function keydown(event) {
      delegate('keydown', event);
    },
    keyup: function keyup(event) {
      delegate('keyup', event);
    },
    touchstart: function touchstart(event) {
      delegate('touchstart', event);
    },
    touchmove: function touchmove(event) {
      delegate('touchmove', event);
    },
    touchend: function touchend(event) {
      delegate('touchend', event);
    },
    tap: function tap(event) {
      delegate('tap', event);
    },
    // extend start
    undo: function undo() {
      mode.undo();
    },
    redo: function redo() {
      mode.redo();
    },
    finish: function finish() {
      mode.finish();
    },
    cancel: function cancel() {
      mode.cancel();
    },
    drawByCoordinate: function drawByCoordinate(coord) {
      mode.drawByCoordinate(coord);
    },
    getModeInstance: function getModeInstance() {
      return mode.getModeInstance();
    },
    setMeasureOptions: function setMeasureOptions(options) {
      mode.setMeasureOptions(options);
    },

    // extend end
  };
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getDefaultExportFromNamespaceIfPresent (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') ? n['default'] : n;
}

function getDefaultExportFromNamespaceIfNotNamed (n) {
	return n && Object.prototype.hasOwnProperty.call(n, 'default') && Object.keys(n).length === 1 ? n['default'] : n;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
				var args = [null];
				args.push.apply(args, arguments);
				var Ctor = Function.bind.apply(f, args);
				return new Ctor();
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var geojsonArea = {};

var wgs84$1 = {};

var RADIUS = wgs84$1.RADIUS = 6378137;
var FLATTENING = wgs84$1.FLATTENING = 1/298.257223563;
var POLAR_RADIUS = wgs84$1.POLAR_RADIUS = 6356752.3142;

var wgs84 = wgs84$1;

var geometry_1 = geojsonArea.geometry = geometry$1;
var ring = geojsonArea.ring = ringArea;

function geometry$1(_) {
    var area = 0, i;
    switch (_.type) {
        case 'Polygon':
            return polygonArea(_.coordinates);
        case 'MultiPolygon':
            for (i = 0; i < _.coordinates.length; i++) {
                area += polygonArea(_.coordinates[i]);
            }
            return area;
        case 'Point':
        case 'MultiPoint':
        case 'LineString':
        case 'MultiLineString':
            return 0;
        case 'GeometryCollection':
            for (i = 0; i < _.geometries.length; i++) {
                area += geometry$1(_.geometries[i]);
            }
            return area;
    }
}

function polygonArea(coords) {
    var area = 0;
    if (coords && coords.length > 0) {
        area += Math.abs(ringArea(coords[0]));
        for (var i = 1; i < coords.length; i++) {
            area -= Math.abs(ringArea(coords[i]));
        }
    }
    return area;
}

/**
 * Calculate the approximate area of the polygon were it projected onto
 *     the earth.  Note that this area will be positive if ring is oriented
 *     clockwise, otherwise it will be negative.
 *
 * Reference:
 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
 *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
 *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
 *
 * Returns:
 * {float} The approximate signed geodesic area of the polygon in square
 *     meters.
 */

function ringArea(coords) {
    var p1, p2, p3, lowerIndex, middleIndex, upperIndex, i,
    area = 0,
    coordsLength = coords.length;

    if (coordsLength > 2) {
        for (i = 0; i < coordsLength; i++) {
            if (i === coordsLength - 2) {// i = N-2
                lowerIndex = coordsLength - 2;
                middleIndex = coordsLength -1;
                upperIndex = 0;
            } else if (i === coordsLength - 1) {// i = N-1
                lowerIndex = coordsLength - 1;
                middleIndex = 0;
                upperIndex = 1;
            } else { // i = 0 to N-3
                lowerIndex = i;
                middleIndex = i+1;
                upperIndex = i+2;
            }
            p1 = coords[lowerIndex];
            p2 = coords[middleIndex];
            p3 = coords[upperIndex];
            area += ( rad(p3[0]) - rad(p1[0]) ) * Math.sin( rad(p2[1]));
        }

        area = area * wgs84.RADIUS * wgs84.RADIUS / 2;
    }

    return area;
}

function rad(_) {
    return _ * Math.PI / 180;
}

var classes = {
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
  MEASURE_MARKER: 'mapbox-gl-draw-measure',
  CONTROL_BUTTON_CUT_LINE: 'mapbox-gl-draw_cut-line',
  CONTROL_BUTTON_CUT_POLYGON: 'mapbox-gl-draw_cut-polygon',
  CONTROL_POPOVER: 'mapbox-gl-draw-popover',
  /** extend end */
};

var sources = {
  HOT: 'mapbox-gl-draw-hot',
  COLD: 'mapbox-gl-draw-cold',
};

var cursors = {
  ADD: 'add',
  MOVE: 'move',
  DRAG: 'drag',
  POINTER: 'pointer',
  NONE: 'none',
};

var types$1 = {
  POLYGON: 'polygon',
  LINE: 'line_string',
  POINT: 'point',
};

var geojsonTypes$1 = {
  FEATURE: 'Feature',
  POLYGON: 'Polygon',
  LINE_STRING: 'LineString',
  POINT: 'Point',
  FEATURE_COLLECTION: 'FeatureCollection',
  MULTI_PREFIX: 'Multi',
  MULTI_POINT: 'MultiPoint',
  MULTI_LINE_STRING: 'MultiLineString',
  MULTI_POLYGON: 'MultiPolygon',
};

var modes$1 = {
  DRAW_LINE_STRING: 'draw_line_string',
  DRAW_POLYGON: 'draw_polygon',
  DRAW_POINT: 'draw_point',
  SIMPLE_SELECT: 'simple_select',
  DIRECT_SELECT: 'direct_select',
  STATIC: 'static',
  // extend start
  CUT_POLYGON: 'cut_polygon',
  CUT_LINE: 'cut_line',
  // extend end
};

var events$1 = {
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
  REDO_UNDO: 'draw.redoUndo',
  CLICK_ON_VERTEX: 'draw.clickOnVertex',
  ON_MIDPOINT: 'draw.onMidpoint',
  DRAG_VERTEX: 'draw.dragVertex',
  CLICK_OR_TAB: 'draw.clickOrTab',
  DRAG: 'draw.drag',
  CLEAR_SELECTED_COORDINATES: 'draw.clearSelectedCoordinates',
  ADD_POINT: 'draw.addPoint',
  ADD: 'draw.onAdd',
  POLYTON_CUT_CREATE: 'draw.polygonCutCreate',
  // extend end
};

var updateActions = {
  MOVE: 'move',
  CHANGE_COORDINATES: 'change_coordinates',
};

var meta = {
  FEATURE: 'feature',
  MIDPOINT: 'midpoint',
  VERTEX: 'vertex',
  LAST_POINT: 'last_point',
  SECOND_TO_LAST_POINT: 'second_to_last_point',
};

var activeStates = {
  ACTIVE: 'true',
  INACTIVE: 'false',
};

var interactions = ['scrollZoom', 'boxZoom', 'dragRotate', 'dragPan', 'keyboard', 'doubleClickZoom', 'touchZoomRotate'];

var LAT_MIN$1 = -90;
var LAT_RENDERED_MIN$1 = -85;
var LAT_MAX$1 = 90;
var LAT_RENDERED_MAX$1 = 85;
var LNG_MIN$1 = -270;
var LNG_MAX$1 = 270;

var GEOMETRYS = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'];

var Constants = /*#__PURE__*/Object.freeze({
__proto__: null,
classes: classes,
sources: sources,
cursors: cursors,
types: types$1,
geojsonTypes: geojsonTypes$1,
modes: modes$1,
events: events$1,
updateActions: updateActions,
meta: meta,
activeStates: activeStates,
interactions: interactions,
LAT_MIN: LAT_MIN$1,
LAT_RENDERED_MIN: LAT_RENDERED_MIN$1,
LAT_MAX: LAT_MAX$1,
LAT_RENDERED_MAX: LAT_RENDERED_MAX$1,
LNG_MIN: LNG_MIN$1,
LNG_MAX: LNG_MAX$1,
GEOMETRYS: GEOMETRYS
});

var FEATURE_SORT_RANKS = {
  Point: 0,
  LineString: 1,
  MultiLineString: 1,
  Polygon: 2
};

function comparator(a, b) {
  var score = FEATURE_SORT_RANKS[a.geometry.type] - FEATURE_SORT_RANKS[b.geometry.type];

  if (score === 0 && a.geometry.type === geojsonTypes$1.POLYGON) {
    return a.area - b.area;
  }

  return score;
}

// Sort in the order above, then sort polygons by area ascending.
function sortFeatures(features) {
  return features.map(function (feature) {
    if (feature.geometry.type === geojsonTypes$1.POLYGON) {
      feature.area = geojsonArea.geometry({
        type: geojsonTypes$1.FEATURE,
        property: {},
        geometry: feature.geometry
      });
    }
    return feature;
  }).sort(comparator).map(function (feature) {
    delete feature.area;
    return feature;
  });
}

/**
 * Returns a bounding box representing the event's location.
 *
 * @param {Event} mapEvent - Mapbox GL JS map event, with a point properties.
 * @return {Array<Array<number>>} Bounding box.
 */
function mapEventToBoundingBox(mapEvent, buffer) {
  if ( buffer === void 0 ) buffer = 0;

  return [
    [mapEvent.point.x - buffer, mapEvent.point.y - buffer],
    [mapEvent.point.x + buffer, mapEvent.point.y + buffer]
  ];
}

function StringSet(items) {
  this._items = {};
  this._nums = {};
  this._length = items ? items.length : 0;
  if (!items) { return; }
  for (var i = 0, l = items.length; i < l; i++) {
    this.add(items[i]);
    if (items[i] === undefined) { continue; }
    if (typeof items[i] === 'string') { this._items[items[i]] = i; }
    else { this._nums[items[i]] = i; }

  }
}

StringSet.prototype.add = function(x) {
  if (this.has(x)) { return this; }
  this._length++;
  if (typeof x === 'string') { this._items[x] = this._length; }
  else { this._nums[x] = this._length; }
  return this;
};

StringSet.prototype.delete = function(x) {
  if (this.has(x) === false) { return this; }
  this._length--;
  delete this._items[x];
  delete this._nums[x];
  return this;
};

StringSet.prototype.has = function(x) {
  if (typeof x !== 'string' && typeof x !== 'number') { return false; }
  return this._items[x] !== undefined || this._nums[x] !== undefined;
};

StringSet.prototype.values = function() {
  var this$1$1 = this;

  var values = [];
  Object.keys(this._items).forEach(function (k) {
    values.push({ k: k, v: this$1$1._items[k] });
  });
  Object.keys(this._nums).forEach(function (k) {
    values.push({ k: JSON.parse(k), v: this$1$1._nums[k] });
  });

  return values.sort(function (a, b) { return a.v - b.v; }).map(function (a) { return a.k; });
};

StringSet.prototype.clear = function() {
  this._length = 0;
  this._items = {};
  this._nums = {};
  return this;
};

var META_TYPES = [
  meta.FEATURE,
  meta.MIDPOINT,
  meta.VERTEX
];

// Requires either event or bbox
var featuresAt = {
  click: featuresAtClick,
  touch: featuresAtTouch
};

function featuresAtClick(event, bbox, ctx) {
  return featuresAt$1(event, bbox, ctx, ctx.options.clickBuffer);
}

function featuresAtTouch(event, bbox, ctx) {
  return featuresAt$1(event, bbox, ctx, ctx.options.touchBuffer);
}

function featuresAt$1(event, bbox, ctx, buffer) {
  if (ctx.map === null) { return []; }

  var box = (event) ? mapEventToBoundingBox(event, buffer) : bbox;

  var queryParams = {};
  if (ctx.options.styles) { queryParams.layers = ctx.options.styles.map(function (s) { return s.id; }); }

  var features = ctx.map.queryRenderedFeatures(box, queryParams)
    .filter(function (feature) { return META_TYPES.indexOf(feature.properties.meta) !== -1; });

  var featureIds = new StringSet();
  var uniqueFeatures = [];
  features.forEach(function (feature) {
    var featureId = feature.properties.id;
    if (featureIds.has(featureId)) { return; }
    featureIds.add(featureId);
    uniqueFeatures.push(feature);
  });

  return sortFeatures(uniqueFeatures);
}

var icon1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAApCAYAAAAmukmKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ4MDgwMUNENTg0ODExRUVBNjUwODMyMzhEQjFEMDY2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ4MDgwMUNFNTg0ODExRUVBNjUwODMyMzhEQjFEMDY2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDgwODAxQ0I1ODQ4MTFFRUE2NTA4MzIzOERCMUQwNjYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDgwODAxQ0M1ODQ4MTFFRUE2NTA4MzIzOERCMUQwNjYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5YUW5BAAAD0UlEQVR42uyXWUwTURRA70xbptQCATW2QllEFlkEoxGi4o+iBkQNJiSIcfnwR+VLY2IixESMS2L8MfEPl2iMGCNLJO5GiUZMRDbZoyCr7KVQW7qM97ZIgtCZAYv+cJOX6bx355zO65t5t4w9LgOEgq0qYPGQhC1VI1duDue8wrxlCm8aG7FZRprMhuYeq+ktnj7GVoY8uxCPcSVEkRwPh1cpvXMO+Abrdvv4QyTnNWNug9kARfpOuD3U2l5vGsnDrnzkWiULURatU6jundVEx6IMZAwDUsLG83BnqA1ye2pr2y3GTGTXigpRtmuHl+b+rcAE5VI5B3OJPqsZDn4vNz8x9GQgv3gK/09Zlm/Qo+KQpDnLKOhaZHD7kUXMGYU4EJPirS24qVvPyiVOoVAQ4wayUpFJ7ClCWiD4m91HGSdzg+x3EOumLoEL9FAVTCzCyTs8cl4bG7XkL6bRVSyWe0CeJnYVORyLhqQxSp+OyohtWhYYmI+wAw/xjc+6a036ALrNLQf8gqXJgrTAZKUAxIY5z2uagb9bCtDWLfzyQDY5TnVVbZXhefY1/7WJdOuCkZwIzPUzAHHhuAx9nS06FJj0LSjsAvjaIbJylXCtv3mADVB4bgrj1MKygGXA5B0D4BTTx7CPOXfUkSMU5PBXeG5kQzzUK8VmksnYhmCBGVByzhyRCPVQh7E+MoVaNDMiGNyRgy99NcsDbxfNtFrBHTnkYges48OiiRX14I4ccrGNZkM9PSeCUfAc4MeA63EaoxyRZ5Fc7JBt/E2FcUhYaBgDPvsSQGfv9DHs47MvOnKEghzkoge/8KG+I3edyk9Y2tQGfPoJgO0bgIle4ZzGL18Bnr4HMI+LTic66FDk2A91dSWVjZEpcSpWNi+vNqPdBhENpVXtUWnxjpd3p+VnztW+JpivIDY5JncLvMuSy731j+tMI26XYY0DyC4lx5QN2GC3Ht7X9uFHP5YH7gpiZSIT2Yem7fj4DfqqTcPJO7+V6fvcICUGsYhJ7BlrGhyo+WgcTExqedVabhyYswwZQAxiEdNlETUhbcDiNm5zy+v8450VPP7YkkWUS9egLJ8YxJJcCE/UOms8WdnpFC/tnjSf5YqNi5ZAsGLRZJ1KdWirZQzejfVDib7LgmVh4ZjdegGZn2ddef8hprcC7rSQoGRkWcbVezXUr6p+2GPibXfxYzm2l8gaFK3mJNUkTtADaiiPpP8Z1I+yTzh2clblIwKkF0Ou/4dIZrDwj2NBuCBcEP5/oXwO14xiUTnqqGudx3kXXklsfrH89+fZXvxLgAEAlgiiMDyIpU8AAAAASUVORK5CYII=";
var icon2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAiCAYAAABIiGl0AAAFVklEQVRYhZ1XfWxTVRT/vdfRbiN10cCqMAdqZzL52CKICH84YehIRf/QFcYWh/9IggIKfiQmwkIiCUJQIJCIkpHAlkj0rzHCx5QZI9OB+7CWOcYmllUZlhIt3dqtfdec9t55+/r6gTc5eR/3nN/v3XvOPec8hTGGdENRFEWaViSRB5NEjLTAOakmJEKVk6mSiA+ARKhJIp6R6gOSiCVCQWbievLVpCOOconorpoEnfgBtNVCpJUQsBlAPoACANPLy8tnd3d3v+n3+0+Hw+FhTdPGo9FoMBQKDdI7miMd0uU2+RzDZOSeSR9LKxUrmsIN8wYGBjbYZ81+H1//CJy/BPT9BvhuA1NygML7gIeLgGcWAsufxNXfr+0sKSk5BGAMwDiACWlHJleuJ1b5dhKhpampaUFFRcWrM9ye1Th0Arg+kiok4uNBG7DBiT/mFH/R3t7eWFtb+xOAMP+ACP7zf5yYkyoSae7evXvnvLV5czvbdRT4qi09oX68VAnlvXX4eN++ii1btrgBhCTyWDDKxMKvuQCsHo/no6Ivv3Wy4613Ryp8WOfA8MtPnyguLn4XQEAipy1nqrTFwq95/f39W4v6hp3s2EmKvv8lZFt0+bqTsAiTY5vE8ZSj2EKRWFZWVtjTefGX6PMbgb9uJy+l+AGom9ZCWTwv9sh+cEHb3wx4/kzWnX4vTCcPoHzRE3N7e3tvAhjlPo+qXEWs2Hzw4MEX2NkOsBE/mMYShEhNxz+EsnwRMDUvJnRP72hOrx/DONsBwpSOlgpdVooFlt1uX6F905lwvoUoG2sA69TklVmnxuaMbAiLMDlxjuDM0WWoKVar1a5d8cAoh6uL56cMJnVJGSIGNpp7EAUFBaV6H4uUKfxsslgs0yI3fQDTkkAy5H0wAxt28xbMZvM0XapVVF3FUXkWTfaXxhDt+DklafT7HkObWGzER0LqVPUAoVDoFkWjkb8mPjkOFggmryoQjM8Z2BBWOBz26W1UfVnz+/2DyqOzwDQtSbSrHoSr30aUoj44FhO6p3c0Z2SjzLXD5/P9KhKH8Jfwsailka6urvOOZ5+qiJz6znhLh4YRfWNnGk8nDtOKxeju7m6XCkU8ZfJVixJ4j81mu//G8HDHaOV6aN4MRSHDUGfakH/uUxQ9NHuJ1+ulDPMPTyLjqrTNlMAnRkZG7lzo7Dxs/uC1uJ8Mti8rYQyEceFi52Gv1xvg5XGyQong0vg2UDobW7p06ZG+wvxT5o1rDQMmGyFbwiAsXpvDclcitzCKnMmGhoaurTuwaw0LhRG55L6rLbasr0bu1ldQX1//zuDg4A0Ad3TVCSqLpyjRN01wheCZM2eu1dbV1fU99/g5y+trUp5RvZAu2ZAtYRAWx5yQg0tu9oSfx3kAmJqbm/sCgUBjQ0ODUgpUhqgKpRm5m9bi8rL5bQ3btze2tLT08zo8qutAYiNGTKvmLZdY9WQ2a2lpuaJp2pEdO3aglKFybH+TIXPe5jr0LZvXtm3btiOtra0DAP6WtnhCf46NOswcXputAGwA7AAWOhyONV1dXWdHdzeyWzOXJ8jonqOM5lauXLmadLmNjWNYOGZip5mivTUiX+BwOKp7enpOB3c3Mt+MZTGhe3pXVVVVTTpZkeqJM5A/AqB81apVL7rd7pNEGNxzlNE9vaM5rpOZ1Ig4DXkhAGrYH6upqVnhcrk+d7lcnzmdzkoApXyuMCtSua9Omkhu8M0c0Cy1MSIgx7mEpbOa0MBnTWxArvIuIkfunaSsF+HRq2UizUisI9f/LcrE+r/FtKRZEevIY48pflOz/jfOmjjNR8gjeyAA/wLyQavmRr/R2AAAAABJRU5ErkJggg==";
var icon3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAABRCAYAAAB/nZ57AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkVEMzUxQkYyNUNDQzExRUVBNEM2QTgxMTYxRUNEMEIxIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkVEMzUxQkYzNUNDQzExRUVBNEM2QTgxMTYxRUNEMEIxIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RUQzNTFCRjA1Q0NDMTFFRUE0QzZBODExNjFFQ0QwQjEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RUQzNTFCRjE1Q0NDMTFFRUE0QzZBODExNjFFQ0QwQjEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4I43SmAAAIDUlEQVR42uxbaXATZRj+sg29NqWQlnZSjiJQWm4EyiUjFMotVIcZQA5RkEGUQ0UFf4ACKjiIF+CIMiACIoz8EUGghSKWUg6Ruy1ngR6WpoG2SUnSNvF5262ThlybbNvUyTvzzJfufvvt8+x37Pu+31ZmNpuZJzbmoNbyTw6IBxKAfkBnoDXAC+d1QB5wHTgHpAJnD41TmJgEJvNUzOgaMW2AN4DpQFuRTdwHdgGbDo9T5DaamNG/a8NQrAJeBfw9fLBGYAuw4vBYRXGDihl1SDuZniYQzqQ1NbDgyBjFnnoXM/KQVo5iA/Aaq1/7FliYPEZRWS9iRh7WBqOgJ/Ycaxj7DZiSPFpRLqmYxCPVPbIPmMga1n4FJqWMct5DnKstmmVsIzARYA0MuudGyXpmeLJ2CoqfbZ3zww0Ht5KzPko/pgqqeTYFj03svKaKpRdVsiqzZD007dhIxW6PxCSkVC+/WbZWrdBmMja3kz9rHWy7g/PKTez7m0ZWUiGJIg0Ql5qoKHJ7mKGLPwLCrbufw5VzY+wLIaNzVMePk2S4KYHVbs+Zoce07dDAHFuN09BqHeR8ylGdQagr0fyZTZzcEmOSsflAM4BZg+aIqySorq023ABxmS9azJDjWg5EZtgj2DbY5YWQtUFdCVe3GcRNlBhcFA+0sduoiJlLK5qEYohTvFgxwx01eh/LLwlyBfl6k9TvngRbnOUOxPR19LTPllSx9rxrQ43qEgkJrZ+onsFEi3U0GU9oKlmu3nlMlYc6VFeiBaAWsWKHmcpRV1egzsa7RnZfb3+4kdgNqFPBJHdxVOKGGcdCnD31h5jZa+4Y2FClnA0IhTsTILgzBhM7jaH1h0ZwZzgmtYWInTMuGbmyR0GaYNthajj3Wm5/zsjKUIQx77QysT1T4MViCsSKyUbR3UvFZIscZuwvivC8VMw5sT2TyrzXUsWKOUOvCiHB501GnM6Kemle6cObIGhnI8T8zrCTuImOZ3DhJsDoRUKIyya3grNrvflcLARbJParPMFW4uR2QiP2ki5MWAob+51D+efY7J58sdsJDboYXbvAC4bYIkdCRGU0Y67oKPc7r5F65bsb3Xmn95aLyGguQqFqpPTsQskT5x2v6Shx/gswtoGEHAAm3+rKu5Q4FxVpUKOQngRsdjX+9wB0jxdcFSK6ZyytQ6ZuKqvZp6mPzaZFt7vwu8Ve6NE24FNZOhJCKdPZTJptwK3A8jtxvNqdBjzeoG2fpWOC/7YAmMFqdpfFGO0+76SUQk4c33gbtNVisnXWc5ASdMOBvnEB3KSCSjPTmWruwXMyppLLWJbBRJtWFGIcI6cxJ5b3jq3z6Lpi6tjdWN5s5xqZRR3JJpvHYpy9nlgDpjk49j8ynxifGJ8YnxifGJ8YnxifGJ8YnxifGJ8YEUb552FMmi9phzEP89nVkeaQYyqXKqcNL6DERSIwAhgIdKo9hzZkVnUdRprW90T92ro3gQzgKJCCerkucnOenkWlVqzms3jKk/W3DHkNJr26SJ+fWWjIpxsOZjXf/FPWMwAkOEHQE4Zz9IG3AaAEHyURSnLLb//ZKjCqSwAX2El4SJTpMaMN2sHbC+zAdUWOuModiOiC4n2AbhxAx8qrtLnXy66kn3+YduP4gwOFt3VZBotLxOxMt7A+MDXjGUo3sQ58XMCwiPGRfVoOiYlRdBvEy0MG4DDhE3AiUWsgKtOlYYYLKLH3KfAyzSk8fc2FRxkH9uVuvZyuTi4RM4bR1mY7PePybsLgsMTmk9rO6dm7xcDx6DUlDlFa6gdgKdpR2x1mODAexXaaiPqqx0WpD/bv/frGiitllSWmxlqh0otTSoG0EHlo+qKYVd0SIiZMCfQLogxqEvjOgqADT6xmOLEYxX6T2RR6Un1k2/Mne6/4OHPxJU+EVJiMOleOuWLEA3wuEy/iRzyJL3i/WUcMDsxF8WWFqaJ0/fVlK5dempWhrSz1uDcySy9kWB+7XHI2zZM2iRfxI57EF4e+EPhXz5lolFlQKl+b9fYHBwv2qKUaIpi88s967ZoUF9KLlnGWVXYx452L0/fpKssqpWh/nGpK+LK4z1dyMo7a60JiaCv69dPFqTuWXJyWxpqYre/105ABYQkz8fMbGmbV/z7y492v/m6KLowF73Ekpp0wlnVNUQzee4+Fn1Ek5h796hEazzdFMZ1DugcJP/NJDP33EHspevHTTVGMBe+DJGYdoI9XDn2RVoemJIT4Em/iTzpITA6wGMub/N3Yde8ltZ4Z0RSEEE/iS7yJP+n4zzfDi+ctWunwvqk6VZyyY/W1hWekeHFKbQp5c2551w39B4UlzoQQPxxaAv704qzraOLABBTbLHyzPfDNrjamb1Zr8M24BTEfdhsRkUS+GYUl9B3NK+C+v9bRtOU1U8W11l7z3nubL57WHC9raBEDlMNCJreb18vKa94ueM1Fll6z3UjTVjwDN+T+De3VU+c0J66j1wrvlt80Sk0+OriTPzzjyH7KZzsjnhkIl6j2P5kMQpBmM55xKMaqp2YKoupEmvqq8kK14Z9sijRzy+88yHucU1qgv6cr1OcbNcYHFehV00Ojuqq2fkv/cD88XU7pH9EsMjDKXxXYjo8Kig5pG9whMjIgqk14gCoOQ8hyAaJQmr7H3OMs0nRJjI0cwEghBzCIAsN6GFm3gVNCDiBZTA7A061zyqb0ALoCHQXXiL7QUApoZhUiP2I1/+ChEZAneCC3gGvkVQkT2y37V4ABAEkB+U9EUz7pAAAAAElFTkSuQmCC";

function getEventData(modeInstance, eventData) {
  var draw = modeInstance.getCtx().api;
  var data = Object.assign({}, eventData, {draw: draw, mode: draw.getMode(), state: modeInstance.getState()});
  return { data: data };
}

function mapFireOnAdd(modeInstance, eventData) {
  modeInstance.map.fire(events$1.ADD, getEventData(modeInstance, eventData));
}

function mapFireRedoUndo(modeInstance, eventData) {
  modeInstance.map.fire(events$1.REDO_UNDO, getEventData(modeInstance, eventData));
}

function mapFireByClickOnVertex(modeInstance, evetnData) {
  modeInstance.map.fire(events$1.CLICK_ON_VERTEX, getEventData(modeInstance, evetnData));
}

function mapFireByOnMidpoint(modeInstance, eventData) {
  modeInstance.map.fire(events$1.ON_MIDPOINT, getEventData(modeInstance, eventData));
}

function mapFireByDragVertex(modeInstance, eventData) {
  modeInstance.map.fire(events$1.DRAG_VERTEX, getEventData(modeInstance, eventData));
}

function mapFireClickOrOnTab(modeInstance, eventData) {
  modeInstance.map.fire(events$1.CLICK_OR_TAB, getEventData(modeInstance, eventData));
}

function mapFireDrag(modeInstance, eventData) {
  modeInstance.map.fire(events$1.DRAG, getEventData(modeInstance, eventData));
}

function mapClearSelectedCoordinates(modeInstance) {
  modeInstance.map.fire(events$1.CLEAR_SELECTED_COORDINATES);
}

function mapFireAddPoint(modeInstance, eventData) {
  modeInstance.map.fire(events$1.ADD_POINT, getEventData(modeInstance, eventData));
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
function createLastOrSecondToLastPoint(parentId, coordinates, path, selected, isLast, mode) {
  return {
    type: geojsonTypes$1.FEATURE,
    properties: {
      meta: isLast ? meta.LAST_POINT : meta.SECOND_TO_LAST_POINT,
      parent: parentId,
      coord_path: path,
      active: selected ? activeStates.ACTIVE : activeStates.INACTIVE,
      mode: mode,
    },
    geometry: {
      type: geojsonTypes$1.POINT,
      coordinates: coordinates,
    },
  };
}

/** 是否禁止双击落点或者落点与其它节点重合时触发完成绘制 */
function isDisabledClickOnVertexWithCtx(ctx) {
  return ctx.options.disabledClickOnVertex;
}

/** 受否忽略双击落点或者落点与其它节点重合的检测 */
function isIgnoreClickOnVertexWithCtx(ctx) {
  return ctx.options.ignoreClickOnVertex;
}

/** 点击地图未命中feature时什么也不做 */
function isClickOnMissAndDoNothing(ctx) {
  return ctx.options.clickOnMissAndDoNothing;
}

/** 当点击源的元素有selector时，阻止触发高亮图斑点击事件 */
function isStopPropagationClickActiveFeature(ctx, e) {
  try {
    if (ctx.options.disableSelect) { return true; }
    var className = ctx.options.stopPropagationClickActiveFeatureHandlerClassName;
    return (
      e.originalEvent.target &&
      typeof e.originalEvent.target.className === 'string' &&
      className &&
      e.originalEvent.target.className.includes(className)
    );
  } catch (e$1) {
    return false;
  }
}

/** 编辑模式下点击图形以外部分不退出编辑模式 */
function isClickNotthingNoChangeMode(ctx) {
  return ctx.options.clickNotthingNoChangeMode;
}

/** simple_select mode 时禁止拖拽节点 */
function isDisabledDragVertexWithSimpleSelectMode(ctx) {
  return ctx.options.disabledDragVertexWithSimpleSelectMode;
}

function isDisabledDragVertexUi(ctx, feature, classes) {
  var isSimpleSelect = ctx.api.getMode() === modes$1.SIMPLE_SELECT;
  var isPoint = feature.geometry.type === geojsonTypes$1.POINT;
  var disabledDragVertex = isDisabledDragVertexWithSimpleSelectMode(ctx);
  var isActive = feature.properties.active === activeStates.ACTIVE;
  if (disabledDragVertex && isSimpleSelect && isPoint) {
    classes.mouse = isActive ? cursors.NONE : cursors.POINTER;
  }
}

/** 是否禁止移动多边形 */
function isDisabledMovePolgon(ctx, state) {
  return ctx.options.disabledMovePolgon && state.selectedCoordPaths.length === 0;
}

/** 触屏设备双指缩放时是否允许拖拽节点 */
function isDisabledDragVertexWithTwoFingersZoom(ctx, e) {
  if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length === 2) {
    return ctx.options.disabledDragVertexWithTwoFingersZoom;
  }
  return false;
}

function loadIconImage(map, iconImage) {
  return new Promise(function (resolve, reject) {
    map.loadImage(iconImage.url, function (error, image) {
      if (error) {
        reject(error);
      } else if (!map.hasImage(iconImage.id)) {
        resolve(Object.assign({}, iconImage, {image: image}));
      }
    });
  });
}

function batchLoadImages(map, iconImages) {
  return new Promise(function (resolve, reject) {
    var promises = [];
    iconImages.forEach(function (iconImage) {
      promises.push(loadIconImage(map, iconImage));
    });
    Promise.all(promises)
      .then(function (res) {
        res.forEach(function (iconImage) {
          map.addImage(iconImage.id, iconImage.image);
        });
        resolve(res);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function loadIconImageByTheme(map) {
  var icon2$1 = { url: icon1, id: 'gl-draw-icon1' };
  var icon1$1 = { url: icon2, id: 'gl-draw-icon2' };
  var icon3$1 = { url: icon3, id: 'gl-draw-icon3' };
  batchLoadImages(map, [Object.assign({}, icon1$1), Object.assign({}, icon2$1), Object.assign({}, icon3$1)]);
}

function objectWithoutProperties$3 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var RedoUndo = function RedoUndo(options) {
  this._modeInstance = options.modeInstance;
  this._ctx = options.ctx;
  this._api = options.ctx.api;
  this.undoStack = [];
  this.redoStack = [];
  this._addPointEvent = this._drawAddPointEvent.bind(this);
  this._bindEvent();
};

RedoUndo.prototype._bindEvent = function _bindEvent () {
  this._unbindEvent();
  this._ctx.map.on(events$1.ADD_POINT, this._addPointEvent);
};

RedoUndo.prototype._unbindEvent = function _unbindEvent () {
  this._ctx.map.off(events$1.ADD_POINT, this._addPointEvent);
};

RedoUndo.prototype._drawAddPointEvent = function _drawAddPointEvent () {
  this.undoStack = [];
  this.redoStack = [];
  this.fireChange({ type: 'add' });
};

RedoUndo.prototype._fireChangeAndRender = function _fireChangeAndRender (eventData) {
    var this$1$1 = this;

  this._modeInstance.afterRender(function () { return this$1$1.fireChange(eventData); }, true);
};

RedoUndo.prototype.fireChange = function fireChange (ref) {
    var cb = ref.cb;
    var rest = objectWithoutProperties$3( ref, ["cb"] );
    var eventData = rest;

  var undoStack = this.undoStack;
  var modeName = this._api.getMode();
  var modes = modes$1;
  if (modeName === modes.DRAW_LINE_STRING) {
    undoStack = this._modeInstance.feature.getCoordinates();
    undoStack.pop();
  } else if (modeName === modes.DRAW_POLYGON) {
    undoStack = this._modeInstance.feature.getCoordinates()[0] || [];
    if (undoStack.length < 3) { undoStack = []; }
  }
  this.undoStack = undoStack;
  var e = JSON.parse(JSON.stringify(Object.assign({}, eventData, {undoStack: undoStack, redoStack: this.redoStack})));
  mapFireRedoUndo(this._modeInstance, e);
  typeof cb === 'function' && cb();
};

RedoUndo.prototype.undo = function undo (cb) {
    var assign, assign$1;

    if ( cb === void 0 ) cb = function () {};
  var coord = null;
  var state = this._modeInstance.getState();
  var pos = state.currentVertexPosition - 1;
  var position = Math.max(0, pos);
  if (state.line) {
    (assign = state.line.removeCoordinate(("" + position)), coord = assign[0]);
  } else if (state.polygon) {
    (assign$1 = state.polygon.removeCoordinate(("0." + position), true), coord = assign$1[0]);
  }

  if (coord) {
    state.currentVertexPosition--;
    if (state.currentVertexPosition < 0) { return; }
    this.redoStack.push(coord);
    this._fireChangeAndRender({ type: 'undo', cb: cb });
  }
};

RedoUndo.prototype.redo = function redo (cb) {
    if ( cb === void 0 ) cb = function () {};

  var state = this._modeInstance.getState();
  var coord = this.redoStack.pop();
  if (!coord) { return; }
  if (state.line) {
    state.line.addCoordinate(state.currentVertexPosition++, coord[0], coord[1]);
  } else if (state.polygon) {
    state.polygon.addCoordinate(("0." + (state.currentVertexPosition++)), coord[0], coord[1]);
  }
  this._fireChangeAndRender({ type: 'redo', cb: cb });
};

RedoUndo.prototype.destroy = function destroy () {
  this._unbindEvent();
  this.reset();
};

RedoUndo.prototype.reset = function reset () {
  this.undoStack = [];
  this.redoStack = [];
};

function objectWithoutProperties$2 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var RedoUndoCut = function RedoUndoCut(options) {
  this._modeInstance = options.modeInstance;
  this._ctx = options.ctx;
  this._api = options.ctx.api;
  this.undoStack = [];
  this.redoStack = [];
  this._addPointEvent = this._drawAddPointEvent.bind(this);
  this._bindEvent();
};

RedoUndoCut.prototype._bindEvent = function _bindEvent () {
  this._unbindEvent();
  this._ctx.map.on(events$1.ADD_POINT, this._addPointEvent);
};

RedoUndoCut.prototype._unbindEvent = function _unbindEvent () {
  this._ctx.map.off(events$1.ADD_POINT, this._addPointEvent);
};

RedoUndoCut.prototype._drawAddPointEvent = function _drawAddPointEvent (e) {
  this.redoStack = [];
  var coord = e.data.e.lngLat.toArray();
  this.undoStack.push(coord);
  this._fireChange({ type: 'add' });
};

RedoUndoCut.prototype._fireChangeAndRender = function _fireChangeAndRender (eventData) {
    var this$1$1 = this;

  this._modeInstance.afterRender(function () { return this$1$1._fireChange(eventData); }, true);
};

RedoUndoCut.prototype._genStacks = function _genStacks (stacks) {
  return stacks.map(function (v) { return ({ type: Array.isArray(v) ? 'draw' : 'cut', stack: v }); });
};

RedoUndoCut.prototype._fireChange = function _fireChange (ref) {
    var cb = ref.cb;
    var rest = objectWithoutProperties$2( ref, ["cb"] );
    var eventData = rest;

  var e = Object.assign({}, eventData, {undoStack: this._genStacks(this.undoStack), redoStack: this._genStacks(this.redoStack)});
  mapFireRedoUndo(this._modeInstance, JSON.parse(JSON.stringify(e)));
  typeof cb === 'function' && cb();
};

RedoUndoCut.prototype.setRedoUndoStack = function setRedoUndoStack (cb) {
  var ref = cb({ undoStack: this.undoStack, redoStack: this.redoStack });
    var undoStack = ref.undoStack;
    var redoStack = ref.redoStack;
  if (Array.isArray(undoStack)) { this.undoStack = JSON.parse(JSON.stringify(undoStack)); }
  if (Array.isArray(redoStack)) { this.redoStack = JSON.parse(JSON.stringify(redoStack)); }
  this._fireChangeAndRender({ type: 'cut' });
};

RedoUndoCut.prototype.undo = function undo (cb) {
    var assign, assign$1;

    if ( cb === void 0 ) cb = function () {};
  var coord = null;

  debugger;
  var state = this._modeInstance.getState();
  var pos = state.currentVertexPosition - 1;
  var position = Math.max(0, pos);
  var stack = this.undoStack.pop();

  if (Array.isArray(stack)) {
    if (state.line) {
      (assign = state.line.removeCoordinate(("" + position)), coord = assign[0]);
    } else if (state.polygon) {
      (assign$1 = state.polygon.removeCoordinate(("0." + position), true), coord = assign$1[0]);
    }

    if (coord) {
      if (state.currentVertexPosition !== 0) { state.currentVertexPosition--; }
      this.redoStack.push(coord);
      this._fireChangeAndRender({ type: 'undo', cb: cb });
    }
  }
  return this._genStacks([stack])[0];
};

RedoUndoCut.prototype.redo = function redo (cb) {
    if ( cb === void 0 ) cb = function () {};

  var state = this._modeInstance.getState();
  var coord = this.redoStack.pop();
  if (Array.isArray(coord)) {
    if (state.line) {
      state.line.addCoordinate(state.currentVertexPosition++, coord[0], coord[1]);
    } else if (state.polygon) {
      if (state.polygon.coordinates[0].length === 0) {
        state.polygon.updateCoordinate(("0." + (state.currentVertexPosition)), coord[0], coord[1]);
      }
      state.polygon.addCoordinate(("0." + (state.currentVertexPosition++)), coord[0], coord[1]);
    }
    this.undoStack.push(coord);
    this._fireChangeAndRender({ type: 'redo', cb: cb });
  }
  return this._genStacks([coord])[0];
};

RedoUndoCut.prototype.destroy = function destroy () {
  this._unbindEvent();
  this.reset();
};

RedoUndoCut.prototype.reset = function reset () {
  this.undoStack = [];
  this.redoStack = [];
};

var installRedoUndo = function (options) {
  return options.ctx.events.getMode().includes('cut') ? new RedoUndoCut(options) : new RedoUndo(options);
};

var theme1 = [
  {
    id: "gl-draw-polygon-fill-inactive",
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': ['coalesce', ['get', 'user_inactive-fill-color'], '#E1361B'],
      'fill-outline-color': ['coalesce', ['get', 'user_inactive-fill-outline-color'], '#E1361B'],
      'fill-opacity': 0.1,
    },
  },
  {
    id: "gl-draw-polygon-fill-active",
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#E1361B',
      'fill-outline-color': '#E1361B',
      'fill-opacity': 0.1,
    },
  },
  {
    id: "gl-draw-polygon-midpoint",
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#E1361B',
    },
  },
  {
    id: "gl-draw-polygon-stroke-inactive",
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#E1361B'],
      'line-width': 2,
    },
  },
  {
    id: "gl-draw-polygon-stroke-active",
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#E1361B',
      'line-width': 2,
    },
  },
  {
    id: "gl-draw-line-inactive",
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#E1361B'],
      'line-width': 2,
    },
  },
  {
    id: "gl-draw-line-active",
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#E1361B',
      'line-width': 2,
    },
  },

  {
    id: "gl-draw-polygon-and-line-vertex-stroke-ringlike-inactive",
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 8,
      'circle-color': '#E1361B',
    },
  },
  {
    id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#fff',
    },
  },
  {
    id: "gl-draw-polygon-and-line-vertex-inactive",
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 4,
      'circle-color': '#E1361B',
    },
  },
  {
    id: "gl-draw-point-point-stroke-inactive",
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: "gl-draw-point-inactive",
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#E1361B',
    },
  },
  {
    id: "gl-draw-point-stroke-ringlike-active",
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint'], ['!has', 'user__edit-point']],
    paint: {
      'circle-radius': 9,
      'circle-color': '#E1361B',
    },
  },
  {
    id: "gl-draw-point-stroke-active",
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint'], ['!has', 'user__edit-point']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#fff',
    },
  },
  {
    id: "gl-draw-point-active",
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true'], ['!has', 'user__edit-point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#E1361B',
    },
  },
  {
    id: "gl-draw-polygon-fill-static",
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: "gl-draw-polygon-stroke-static",
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: "gl-draw-line-static",
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: "gl-draw-point-static",
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  },
  {
    id: "gl-draw-point-active-symbol",
    type: 'symbol',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true'], ['==', 'user__edit-point', 'true']],
    layout: {
      'icon-anchor': ['coalesce', ['get', 'user__edit-point-icon-anchor'], 'bottom'],
      'icon-image': ['coalesce', ['get', 'user__edit-point-icon-image'], 'gl-draw-icon2'],
      // 'icon-anchor': 'bottom',
      'icon-allow-overlap': true, // 允许图标重叠
      'text-ignore-placement': true, // 忽略文字的碰撞
      'icon-ignore-placement': true, // 忽略图标的碰撞
      'icon-size': ['coalesce', ['get', 'user__edit-point-icon-size'], 1],
      'icon-offset': ['coalesce', ['get', 'user__edit-point-icon-offset'], [0, 4]],
    },
  },
  {
    id: "gl-draw-line-second-to-last-point-symbol",
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'second_to_last_point'],
      ['==', '$type', 'Point'],
      ['any', ['==', 'mode', 'draw_line_string'], ['==', 'mode', 'draw_polygon']] ],
    layout: {
      'icon-anchor': 'bottom',
      'icon-image': 'gl-draw-icon2',
      'icon-allow-overlap': true, // 允许图标重叠
      'text-ignore-placement': true, // 忽略文字的碰撞
      'icon-ignore-placement': true, // 忽略图标的碰撞
      'icon-size': 0.7,
    },
  } ];

var theme2 = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': ['coalesce', ['get', 'user_inactive-fill-color'], '#E1361B'],
      'fill-outline-color': ['coalesce', ['get', 'user_inactive-fill-outline-color'], '#E1361B'],
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#E1361B',
      'fill-outline-color': '#E1361B',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#E1361B'],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#FFCF56',
      'line-width': 2,
      'line-dasharray': [4, 3],
    },
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#E1361B'],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#FFCF56',
      'line-width': 2,
      'line-dasharray': [4, 3],
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-ringlike-symbol-inactive',
    type: 'symbol',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    layout: {
      'icon-anchor': 'bottom',
      'icon-image': 'gl-draw-icon3',
      'icon-size': 0.45,
      'icon-offset': [0, 16],
      'icon-allow-overlap': true,
      'text-ignore-placement': true,
      'icon-ignore-placement': true,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-symbol-inactive',
    type: 'symbol',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    layout: {
      'icon-anchor': 'bottom',
      'icon-image': 'gl-draw-icon3',
      'icon-size': 0.45,
      'icon-offset': [0, 16],
      'icon-allow-overlap': true,
      'text-ignore-placement': true,
      'icon-ignore-placement': true,
    },
  },

  {
    id: 'gl-draw-polygon-and-line-vertex-symbol-inactive',
    type: 'symbol',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    layout: {
      'icon-anchor': 'bottom',
      'icon-image': 'gl-draw-icon3',
      'icon-size': 0.45,
      'icon-offset': [0, 16],
      'icon-allow-overlap': true,
      'text-ignore-placement': true,
      'icon-ignore-placement': true,
    },
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-point-stroke-ringlike-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint'], ['!has', 'user__edit-point']],
    paint: {
      'circle-radius': 9,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint'], ['!has', 'user__edit-point']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true'], ['!has', 'user__edit-point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  },
  {
    id: 'gl-draw-point-symbol-active',
    type: 'symbol',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true'], ['==', 'user__edit-point', 'true']],
    layout: {
      'icon-anchor': ['coalesce', ['get', 'user__edit-point-icon-anchor'], 'bottom'],
      'icon-image': ['coalesce', ['get', 'user__edit-point-icon-image'], '_edit-point-icon-image'],
      'icon-allow-overlap': true,
      'text-ignore-placement': true,
      'icon-ignore-placement': true,
      'icon-size': ['coalesce', ['get', 'user__edit-point-icon-size'], 1],
      'icon-offset': ['coalesce', ['get', 'user__edit-point-icon-offset'], [0, 4]],
    },
  } ];

var theme3 = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': ['coalesce', ['get', 'user_inactive-fill-color'], '#E1361B'],
      'fill-outline-color': ['coalesce', ['get', 'user_inactive-fill-outline-color'], '#E1361B'],
      'fill-opacity': ['coalesce', ['get', 'user_inactive-fill-opacity'], 0.1],
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#E1361B',
      'fill-outline-color': '#E1361B',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#E1361B'],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#E1361B',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#E1361B'],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#E1361B',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#E1361B',
    },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  } ];

var immutable = extend;

var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

function extend() {
    var arguments$1 = arguments;

    var target = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments$1[i];

        for (var key in source) {
            if (hasOwnProperty$1.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target
}

var xtend = /*@__PURE__*/getDefaultExportFromCjs(immutable);

var getDefaultOptions = function () { return ({
  unit: { line: 'meters', area: 'meters' },
  precision: 2,
}); };

var Measure = function Measure(options) {
  this.ctx = options.ctx;
  this.markers = [];
  this.enabled = false;
};

Measure.prototype.setOptions = function setOptions (options) {
  this.options = xtend(getDefaultOptions(), options);
  this[options.enable ? 'enable' : 'cancel']();
};

Measure.prototype.enable = function enable () {
  this.enabled = true;
};

Measure.prototype.cancel = function cancel () {
  this.markers.forEach(function (marker) { return marker.remove(); });
  this.markers = [];
  this.enabled = false;
};

Measure.prototype.destroy = function destroy () {
  this.cancel();
};

Measure.prototype.delete = function delete$1 () {
  this.cancel();
};

function getFeatureAtAndSetCursors(event, ctx) {
  var features = featuresAt.click(event, null, ctx);
  var classes = { mouse: cursors.NONE };

  if (features[0]) {
    classes.mouse = features[0].properties.active === activeStates.ACTIVE ? cursors.MOVE : cursors.POINTER;
    classes.feature = features[0].properties.meta;
    // extend start
    isDisabledDragVertexUi(ctx, features[0], classes);
    // extend end
  }

  var modeName = ctx.events.currentModeName();
  if (modeName.includes('draw') || modeName.includes('cut')) {
    classes.mouse = cursors.ADD;
  }

  ctx.ui.queueMapClasses(classes);
  ctx.ui.updateMapClasses();

  return features[0];
}

function euclideanDistance(a, b) {
  var x = a.x - b.x;
  var y = a.y - b.y;
  return Math.sqrt((x * x) + (y * y));
}

var FINE_TOLERANCE = 4;
var GROSS_TOLERANCE = 12;
var INTERVAL = 500;

function isClick(start, end, options) {
  if ( options === void 0 ) options = {};

  var fineTolerance = (options.fineTolerance != null) ? options.fineTolerance : FINE_TOLERANCE;
  var grossTolerance = (options.grossTolerance != null) ? options.grossTolerance : GROSS_TOLERANCE;
  var interval = (options.interval != null) ? options.interval : INTERVAL;

  start.point = start.point || end.point;
  start.time = start.time || end.time;
  var moveDistance = euclideanDistance(start.point, end.point);

  return moveDistance < fineTolerance ||
    (moveDistance < grossTolerance && (end.time - start.time) < interval);
}

var TAP_TOLERANCE = 25;
var TAP_INTERVAL = 250;

function isTap(start, end, options) {
  if ( options === void 0 ) options = {};

  var tolerance = (options.tolerance != null) ? options.tolerance : TAP_TOLERANCE;
  var interval = (options.interval != null) ? options.interval : TAP_INTERVAL;

  start.point = start.point || end.point;
  start.time = start.time || end.time;
  var moveDistance = euclideanDistance(start.point, end.point);

  return moveDistance < tolerance && (end.time - start.time) < interval;
}

var hat$2 = {exports: {}};

var hat_1 = hat$2.exports;

var hat = hat$2.exports = function (bits, base) {
    if (!base) { base = 16; }
    if (bits === undefined) { bits = 128; }
    if (bits <= 0) { return '0'; }
    
    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
    for (var i = 2; digits === Infinity; i *= 2) {
        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
    }
    
    var rem = digits - Math.floor(digits);
    
    var res = '';
    
    for (var i = 0; i < Math.floor(digits); i++) {
        var x = Math.floor(Math.random() * base).toString(base);
        res = x + res;
    }
    
    if (rem) {
        var b = Math.pow(base, rem);
        var x = Math.floor(Math.random() * b).toString(base);
        res = x + res;
    }
    
    var parsed = parseInt(res, base);
    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
        return hat(bits, base)
    }
    else { return res; }
};

hat.rack = function (bits, base, expandBy) {
    var fn = function (data) {
        var iters = 0;
        do {
            if (iters ++ > 10) {
                if (expandBy) { bits += expandBy; }
                else { throw new Error('too many ID collisions, use more bits') }
            }
            
            var id = hat(bits, base);
        } while (Object.hasOwnProperty.call(hats, id));
        
        hats[id] = data;
        return id;
    };
    var hats = fn.hats = {};
    
    fn.get = function (id) {
        return fn.hats[id];
    };
    
    fn.set = function (id, value) {
        fn.hats[id] = value;
        return fn;
    };
    
    fn.bits = bits || 128;
    fn.base = base || 16;
    return fn;
};

var hatExports = hat$2.exports;
var hat$1 = /*@__PURE__*/getDefaultExportFromCjs(hatExports);

var Feature = function (ctx, geojson) {
  this.ctx = ctx;
  this.properties = geojson.properties || {};
  this.coordinates = geojson.geometry.coordinates;
  this.id = geojson.id || hat$1();
  this.type = geojson.geometry.type;
  // extend start
  this.measure = new Measure({ ctx: ctx });
  // extend end
};

Feature.prototype.changed = function () {
  this.ctx.store.featureChanged(this.id);
};

Feature.prototype.incomingCoords = function (coords) {
  this.setCoordinates(coords);
};

Feature.prototype.setCoordinates = function (coords) {
  this.coordinates = coords;
  this.changed();
  return this;
};

Feature.prototype.getCoordinates = function () {
  return JSON.parse(JSON.stringify(this.coordinates));
};

Feature.prototype.setProperty = function (property, value) {
  this.properties[property] = value;
  if (value === void 0) { delete this.properties[property]; }
};

Feature.prototype.getProperty = function (property) {
  return this.properties[property];
};

Feature.prototype.toGeoJSON = function () {
  return JSON.parse(
    JSON.stringify({
      id: this.id,
      type: geojsonTypes$1.FEATURE,
      properties: this.properties,
      geometry: {
        coordinates: this.getCoordinates(),
        type: this.type,
      },
    })
  );
};

Feature.prototype.internal = function (mode) {
  var properties = {
    id: this.id,
    meta: meta.FEATURE,
    'meta:type': this.type,
    active: activeStates.INACTIVE,
    mode: mode,
  };

  if (this.ctx.options.userProperties) {
    for (var name in this.properties) {
      properties[("user_" + name)] = this.properties[name];
    }
  }

  return {
    type: geojsonTypes$1.FEATURE,
    properties: properties,
    geometry: {
      coordinates: this.getCoordinates(),
      type: this.type,
    },
  };
};

// extend start
Feature.prototype.delete = function () {
  this.measure.delete();
  return this;
};
Feature.prototype.move = function () {
  this.execMeasure();
  return this;
};
Feature.prototype.execMeasure = function () {
  throw new Error('execMeasure method must be implemented');
};

var Point$3 = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);
};

Point$3.prototype = Object.create(Feature.prototype);

Point$3.prototype.isValid = function() {
  return typeof this.coordinates[0] === 'number' &&
    typeof this.coordinates[1] === 'number';
};

Point$3.prototype.updateCoordinate = function(pathOrLng, lngOrLat, lat) {
  if (arguments.length === 3) {
    this.coordinates = [lngOrLat, lat];
  } else {
    this.coordinates = [pathOrLng, lngOrLat];
  }
  this.changed();
};

Point$3.prototype.getCoordinate = function() {
  return this.getCoordinates();
};

// extend start
Point$3.prototype.execMeasure = function() {};

/* eslint-disable import/no-unresolved */

var LineString = function (ctx, geojson) {
  Feature.call(this, ctx, geojson);
};

LineString.prototype = Object.create(Feature.prototype);

LineString.prototype.isValid = function () {
  return this.coordinates.length > 1;
};

LineString.prototype.addCoordinate = function (path, lng, lat) {
  this.changed();
  var id = parseInt(path, 10);
  this.coordinates.splice(id, 0, [lng, lat]);
  this.execMeasure();
};

LineString.prototype.getCoordinate = function (path) {
  var id = parseInt(path, 10);
  return JSON.parse(JSON.stringify(this.coordinates[id]));
};

LineString.prototype.removeCoordinate = function (path, deleteCount) {
  if ( deleteCount === void 0 ) deleteCount = 1;

  this.changed();
  this.execMeasure();
  return this.coordinates.splice(parseInt(path, 10), deleteCount);
};

LineString.prototype.updateCoordinate = function (path, lng, lat) {
  var id = parseInt(path, 10);
  this.coordinates[id] = [lng, lat];
  this.changed();
  this.execMeasure();
};

// extend start
LineString.prototype.execMeasure = function () {
  var this$1$1 = this;

  if (!this.measure.enabled || !this.isValid()) { return; }
  this.ctx.store.afterRender(function () {
    var ref = this$1$1.measure.options;
    var unit = ref.unit;
    var precision = ref.precision;
    var markers = this$1$1.measure.markers;
    this$1$1.getCoordinates().forEach(function (coord, index) {
      if (index === 0) { return; }
      var marker = markers[index] || new mapboxGl.Marker();
      markers[index] = marker;
      marker.setLngLat(coord).addTo(this$1$1.ctx.map);
      var dom = marker.getElement();
      var coordinates = this$1$1.getCoordinates().slice(0, index + 1);
      var value = turf__namespace.length(turf__namespace.lineString(coordinates), { units: unit.line });
      marker.setLngLat(coord);
      dom.innerHTML = value ? ("" + (value.toFixed(precision))) : '';
      dom.classList.add(classes.MEASURE_MARKER);
    });
    markers.splice(this$1$1.coordinates.length, markers.length - this$1$1.coordinates.length).forEach(function (marker) {
      marker.remove();
    });
  });
};

/* eslint-disable import/no-unresolved */

var Polygon = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);
  this.coordinates = this.coordinates.map(function (ring) { return ring.slice(0, -1); });
};

Polygon.prototype = Object.create(Feature.prototype);

Polygon.prototype.isValid = function() {
  if (this.coordinates.length === 0) { return false; }
  return this.coordinates.every(function (ring) { return ring.length > 2; });
};

// Expects valid geoJSON polygon geometry: first and last positions must be equivalent.
Polygon.prototype.incomingCoords = function(coords) {
  this.coordinates = coords.map(function (ring) { return ring.slice(0, -1); });
  this.changed();
};

// Does NOT expect valid geoJSON polygon geometry: first and last positions should not be equivalent.
Polygon.prototype.setCoordinates = function(coords) {
  this.coordinates = coords;
  this.changed();
};

Polygon.prototype.addCoordinate = function(path, lng, lat) {
  this.changed();
  var ids = path.split('.').map(function (x) { return parseInt(x, 10); });
  var ring = this.coordinates[ids[0]];
  ring.splice(ids[1], 0, [lng, lat]);
  this.execMeasure();
};

Polygon.prototype.removeCoordinate = function(path, ignore) {
  this.changed();
  var ids = path.split('.').map(function (x) { return parseInt(x, 10); });
  var ring = this.coordinates[ids[0]];
  if (ring) {
    this.execMeasure();
    var coord = ring.splice(ids[1], 1);
    if (!ignore && ring.length < 3) {
      this.coordinates.splice(ids[0], 1);
    }
    return coord;
  }
};

Polygon.prototype.getCoordinate = function(path) {
  var ids = path.split('.').map(function (x) { return parseInt(x, 10); });
  var ring = this.coordinates[ids[0]];
  return JSON.parse(JSON.stringify(ring[ids[1]]));
};

Polygon.prototype.getCoordinates = function() {
  return this.coordinates.map(function (coords) { return coords.concat([coords[0]]); });
};

Polygon.prototype.updateCoordinate = function(path, lng, lat) {
  this.changed();
  var parts = path.split('.');
  var ringId = parseInt(parts[0], 10);
  var coordId = parseInt(parts[1], 10);
  if (this.coordinates[ringId] === undefined) {
    this.coordinates[ringId] = [];
  }
  this.coordinates[ringId][coordId] = [lng, lat];

  this.execMeasure();
};

// extend start
Polygon.prototype.execMeasure = function()  {
  var this$1$1 = this;

  if (!this.measure.enabled || !this.isValid()) { return; }
  var markers = this.measure.markers;
  this.ctx.store.afterRender(function () {
    var ref = this$1$1.measure.options;
    var unit = ref.unit;
    var precision = ref.precision;
    var geoJson = this$1$1.toGeoJSON();
    var value = turf__namespace.area(geoJson, {units: unit.area});
    var marker = markers[0] || new mapboxGl.Marker();
    markers[0] = marker;
    var center = turf__namespace.center(geoJson).geometry.coordinates;
    marker.setLngLat(center).addTo(this$1$1.ctx.map);
    var dom = marker.getElement();
    dom.innerHTML = value ? ("" + (value.toFixed(precision))) : '';
    dom.classList.add(classes.MEASURE_MARKER);
  });
};

var models = {
  MultiPoint: Point$3,
  MultiLineString: LineString,
  MultiPolygon: Polygon
};

var takeAction = function (features, action, path, lng, lat) {
  var parts = path.split('.');
  var idx = parseInt(parts[0], 10);
  var tail = (!parts[1]) ? null : parts.slice(1).join('.');
  return features[idx][action](tail, lng, lat);
};

var MultiFeature = function(ctx, geojson) {
  Feature.call(this, ctx, geojson);

  delete this.coordinates;
  this.model = models[geojson.geometry.type];
  if (this.model === undefined) { throw new TypeError(((geojson.geometry.type) + " is not a valid type")); }
  this.features = this._coordinatesToFeatures(geojson.geometry.coordinates);
};

MultiFeature.prototype = Object.create(Feature.prototype);

MultiFeature.prototype._coordinatesToFeatures = function(coordinates) {
  var this$1$1 = this;

  var Model = this.model.bind(this);
  return coordinates.map(function (coords) { return new Model(this$1$1.ctx, {
    id: hat$1(),
    type: geojsonTypes$1.FEATURE,
    properties: {},
    geometry: {
      coordinates: coords,
      type: this$1$1.type.replace('Multi', '')
    }
  }); });
};

MultiFeature.prototype.isValid = function() {
  return this.features.every(function (f) { return f.isValid(); });
};

MultiFeature.prototype.setCoordinates = function(coords) {
  this.features = this._coordinatesToFeatures(coords);
  this.changed();
};

MultiFeature.prototype.getCoordinate = function(path) {
  return takeAction(this.features, 'getCoordinate', path);
};

MultiFeature.prototype.getCoordinates = function() {
  return JSON.parse(JSON.stringify(this.features.map(function (f) {
    if (f.type === geojsonTypes$1.POLYGON) { return f.getCoordinates(); }
    return f.coordinates;
  })));
};

MultiFeature.prototype.updateCoordinate = function(path, lng, lat) {
  takeAction(this.features, 'updateCoordinate', path, lng, lat);
  this.changed();
};

MultiFeature.prototype.addCoordinate = function(path, lng, lat) {
  takeAction(this.features, 'addCoordinate', path, lng, lat);
  this.changed();
};

MultiFeature.prototype.removeCoordinate = function(path) {
  takeAction(this.features, 'removeCoordinate', path);
  this.changed();
};

MultiFeature.prototype.getFeatures = function() {
  return this.features;
};


// extend start
MultiFeature.prototype.execMeasure = function() {};

function ModeInterface(ctx) {
  this.map = ctx.map;
  this.drawConfig = JSON.parse(JSON.stringify(ctx.options || {}));
  this._ctx = ctx;
  // extend start
  this._state = {};
  this.feature = null;
  this.redoUndo = installRedoUndo({ ctx: ctx, modeInstance: this });
  // extend end
}

/**
 * Sets Draw's interal selected state
 * @name this.setSelected
 * @param {DrawFeature[]} - whats selected as a [DrawFeature](https://github.com/mapbox/mapbox-gl-draw/blob/main/src/feature_types/feature.js)
 */
ModeInterface.prototype.setSelected = function (features) {
  return this._ctx.store.setSelected(features);
};

/**
 * Sets Draw's internal selected coordinate state
 * @name this.setSelectedCoordinates
 * @param {Object[]} coords - a array of {coord_path: 'string', feature_id: 'string'}
 */
ModeInterface.prototype.setSelectedCoordinates = function (coords) {
  var this$1$1 = this;

  this._ctx.store.setSelectedCoordinates(coords);
  coords.reduce(function (m, c) {
    if (m[c.feature_id] === undefined) {
      m[c.feature_id] = true;
      this$1$1._ctx.store.get(c.feature_id).changed();
    }
    return m;
  }, {});
};

/**
 * Get all selected features as a [DrawFeature](https://github.com/mapbox/mapbox-gl-draw/blob/main/src/feature_types/feature.js)
 * @name this.getSelected
 * @returns {DrawFeature[]}
 */
ModeInterface.prototype.getSelected = function () {
  return this._ctx.store.getSelected();
};

/**
 * Get the ids of all currently selected features
 * @name this.getSelectedIds
 * @returns {String[]}
 */
ModeInterface.prototype.getSelectedIds = function () {
  return this._ctx.store.getSelectedIds();
};

/**
 * Check if a feature is selected
 * @name this.isSelected
 * @param {String} id - a feature id
 * @returns {Boolean}
 */
ModeInterface.prototype.isSelected = function (id) {
  return this._ctx.store.isSelected(id);
};

/**
 * Get a [DrawFeature](https://github.com/mapbox/mapbox-gl-draw/blob/main/src/feature_types/feature.js) by its id
 * @name this.getFeature
 * @param {String} id - a feature id
 * @returns {DrawFeature}
 */
ModeInterface.prototype.getFeature = function (id) {
  return this._ctx.store.get(id);
};

/**
 * Add a feature to draw's internal selected state
 * @name this.select
 * @param {String} id
 */
ModeInterface.prototype.select = function (id) {
  return this._ctx.store.select(id);
};

/**
 * Remove a feature from draw's internal selected state
 * @name this.delete
 * @param {String} id
 */
ModeInterface.prototype.deselect = function (id) {
  return this._ctx.store.deselect(id);
};

/**
 * Delete a feature from draw
 * @name this.deleteFeature
 * @param {String} id - a feature id
 */
ModeInterface.prototype.deleteFeature = function (id, opts) {
  if ( opts === void 0 ) opts = {};

  return this._ctx.store.delete(id, opts);
};

/**
 * Add a [DrawFeature](https://github.com/mapbox/mapbox-gl-draw/blob/main/src/feature_types/feature.js) to draw.
 * See `this.newFeature` for converting geojson into a DrawFeature
 * @name this.addFeature
 * @param {DrawFeature} feature - the feature to add
 */
ModeInterface.prototype.addFeature = function (feature) {
  return this._ctx.store.add(feature);
};

/**
 * Clear all selected features
 */
ModeInterface.prototype.clearSelectedFeatures = function () {
  return this._ctx.store.clearSelected();
};

/**
 * Clear all selected coordinates
 */
ModeInterface.prototype.clearSelectedCoordinates = function () {
  return this._ctx.store.clearSelectedCoordinates();
};

/**
 * Indicate if the different action are currently possible with your mode
 * See [draw.actionalbe](https://github.com/mapbox/mapbox-gl-draw/blob/main/API.md#drawactionable) for a list of possible actions. All undefined actions are set to **false** by default
 * @name this.setActionableState
 * @param {Object} actions
 */
ModeInterface.prototype.setActionableState = function (actions) {
  if ( actions === void 0 ) actions = {};

  var newSet = {
    trash: actions.trash || false,
    combineFeatures: actions.combineFeatures || false,
    uncombineFeatures: actions.uncombineFeatures || false,
  };
  return this._ctx.events.actionable(newSet);
};

/**
 * Trigger a mode change
 * @name this.changeMode
 * @param {String} mode - the mode to transition into
 * @param {Object} opts - the options object to pass to the new mode
 * @param {Object} eventOpts - used to control what kind of events are emitted.
 */
ModeInterface.prototype.changeMode = function (mode, opts, eventOpts) {
  if ( opts === void 0 ) opts = {};
  if ( eventOpts === void 0 ) eventOpts = {};

  return this._ctx.events.changeMode(mode, opts, eventOpts);
};

/**
 * Update the state of draw map classes
 * @name this.updateUIClasses
 * @param {Object} opts
 */
ModeInterface.prototype.updateUIClasses = function (opts) {
  return this._ctx.ui.queueMapClasses(opts);
};

/**
 * If a name is provided it makes that button active, else if makes all buttons inactive
 * @name this.activateUIButton
 * @param {String?} name - name of the button to make active, leave as undefined to set buttons to be inactive
 */
ModeInterface.prototype.activateUIButton = function (name) {
  return this._ctx.ui.setActiveButton(name);
};

/**
 * Get the features at the location of an event object or in a bbox
 * @name this.featuresAt
 * @param {Event||NULL} event - a mapbox-gl event object
 * @param {BBOX||NULL} bbox - the area to get features from
 * @param {String} bufferType - is this `click` or `tap` event, defaults to click
 */
ModeInterface.prototype.featuresAt = function (event, bbox, bufferType) {
  if ( bufferType === void 0 ) bufferType = 'click';

  if (bufferType !== 'click' && bufferType !== 'touch') { throw new Error('invalid buffer type'); }
  return featuresAt[bufferType](event, bbox, this._ctx);
};

/**
 * Create a new [DrawFeature](https://github.com/mapbox/mapbox-gl-draw/blob/main/src/feature_types/feature.js) from geojson
 * @name this.newFeature
 * @param {GeoJSONFeature} geojson
 * @returns {DrawFeature}
 */
ModeInterface.prototype.newFeature = function (geojson, options) {
  if ( options === void 0 ) options = {};

  var type = geojson.geometry.type;
  var feature;
  if (type === geojsonTypes$1.POINT) {
    feature = new Point$3(this._ctx, geojson);
  } else if (type === geojsonTypes$1.LINE_STRING) {
    feature = new LineString(this._ctx, geojson);
  } else if (type === geojsonTypes$1.POLYGON) {
    feature = new Polygon(this._ctx, geojson);
  } else {
    feature = new MultiFeature(this._ctx, geojson);
  }
  if (options.declareFeature) { this.feature = feature; }
  return feature;
};

/**
 * Check is an object is an instance of a [DrawFeature](https://github.com/mapbox/mapbox-gl-draw/blob/main/src/feature_types/feature.js)
 * @name this.isInstanceOf
 * @param {String} type - `Point`, `LineString`, `Polygon`, `MultiFeature`
 * @param {Object} feature - the object that needs to be checked
 * @returns {Boolean}
 */
ModeInterface.prototype.isInstanceOf = function (type, feature) {
  if (type === geojsonTypes$1.POINT) { return feature instanceof Point$3; }
  if (type === geojsonTypes$1.LINE_STRING) { return feature instanceof LineString; }
  if (type === geojsonTypes$1.POLYGON) { return feature instanceof Polygon; }
  if (type === 'MultiFeature') { return feature instanceof MultiFeature; }
  throw new Error(("Unknown feature class: " + type));
};

/**
 * Force draw to rerender the feature of the provided id
 * @name this.doRender
 * @param {String} id - a feature id
 */
ModeInterface.prototype.doRender = function (id) {
  return this._ctx.store.featureChanged(id);
};

// extend start
ModeInterface.prototype.getCtx = function () {
  return this._ctx;
};

ModeInterface.prototype.getState = function () {
  return this._state;
};
ModeInterface.prototype.setState = function (state) {
  this._state = state;
  return this._state;
};

ModeInterface.prototype.undo = function () {
  this.redoUndo.undo();
};

ModeInterface.prototype.redo = function () {
  this.redoUndo.redo();
};

ModeInterface.prototype.finish = function (mode) {
  if ( mode === void 0 ) mode = modes$1.SIMPLE_SELECT;

  if (this.isDrawing()) { this._ctx.api.changeMode(mode); }
};

ModeInterface.prototype.cancel = function (mode) {
  if ( mode === void 0 ) mode = modes$1.SIMPLE_SELECT;

  if (this.isDrawing()) {
    var ids = this._ctx.store.getAllIds();
    if (ids.length) { this._ctx.api.delete(ids[ids.length - 1]); }
    this._ctx.api.changeMode(mode);
  }
};

ModeInterface.prototype.isDrawing = function () {
  return this._ctx.api.getMode().startsWith('draw');
};

ModeInterface.prototype.afterRender = function (cb, render) {
  this._ctx.store.afterRender(cb, render);
};

ModeInterface.prototype.beforeRender = function (cb) {
  this._ctx.store.beforeRender(cb);
};

ModeInterface.prototype.setMeasureOptions = function (options) {
  if (this.feature) { this.feature.measure.setOptions(options); }
};

ModeInterface.prototype.destroy = function () {
  this.redoUndo.destroy();
};

ModeInterface.prototype.render = function () {
  this._ctx.store.render();
};

// extend end

/**
 * Triggered while a mode is being transitioned into.
 * @param opts {Object} - this is the object passed via `draw.changeMode('mode', opts)`;
 * @name MODE.onSetup
 * @returns {Object} - this object will be passed to all other life cycle functions
 */
ModeInterface.prototype.onSetup = function() {};

/**
 * Triggered when a drag event is detected on the map
 * @name MODE.onDrag
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onDrag = function() {};

/**
 * Triggered when the mouse is clicked
 * @name MODE.onClick
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onClick = function() {};

/**
 * Triggered with the mouse is moved
 * @name MODE.onMouseMove
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onMouseMove = function() {};

/**
 * Triggered when the mouse button is pressed down
 * @name MODE.onMouseDown
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onMouseDown = function() {};

/**
 * Triggered when the mouse button is released
 * @name MODE.onMouseUp
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onMouseUp = function() {};

/**
 * Triggered when the mouse leaves the map's container
 * @name MODE.onMouseOut
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onMouseOut = function() {};

/**
 * Triggered when a key up event is detected
 * @name MODE.onKeyUp
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onKeyUp = function() {};

/**
 * Triggered when a key down event is detected
 * @name MODE.onKeyDown
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onKeyDown = function() {};

/**
 * Triggered when a touch event is started
 * @name MODE.onTouchStart
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onTouchStart = function() {};

/**
 * Triggered when one drags thier finger on a mobile device
 * @name MODE.onTouchMove
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onTouchMove = function() {};

/**
 * Triggered when one removes their finger from the map
 * @name MODE.onTouchEnd
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onTouchEnd = function() {};

/**
 * Triggered when one quicly taps the map
 * @name MODE.onTap
 * @param state {Object} - a mutible state object created by onSetup
 * @param e {Object} - the captured event that is triggering this life cycle event
 */
ModeInterface.prototype.onTap = function() {};

/**
 * Triggered when the mode is being exited, to be used for cleaning up artifacts such as invalid features
 * @name MODE.onStop
 * @param state {Object} - a mutible state object created by onSetup
 */
ModeInterface.prototype.onStop = function() {};

/**
 * Triggered when [draw.trash()](https://github.com/mapbox/mapbox-gl-draw/blob/main/API.md#trash-draw) is called.
 * @name MODE.onTrash
 * @param state {Object} - a mutible state object created by onSetup
 */
ModeInterface.prototype.onTrash = function() {};

/**
 * Triggered when [draw.combineFeatures()](https://github.com/mapbox/mapbox-gl-draw/blob/main/API.md#combinefeatures-draw) is called.
 * @name MODE.onCombineFeature
 * @param state {Object} - a mutible state object created by onSetup
 */
ModeInterface.prototype.onCombineFeature = function() {};

/**
 * Triggered when [draw.uncombineFeatures()](https://github.com/mapbox/mapbox-gl-draw/blob/main/API.md#uncombinefeatures-draw) is called.
 * @name MODE.onUncombineFeature
 * @param state {Object} - a mutible state object created by onSetup
 */
ModeInterface.prototype.onUncombineFeature = function() {};

/**
 * Triggered per feature on render to convert raw features into set of features for display on the map
 * See [styling draw](https://github.com/mapbox/mapbox-gl-draw/blob/main/API.md#styling-draw) for information about what geojson properties Draw uses as part of rendering.
 * @name MODE.toDisplayFeatures
 * @param state {Object} - a mutible state object created by onSetup
 * @param geojson {Object} - a geojson being evaulated. To render, pass to `display`.
 * @param display {Function} - all geojson objects passed to this be rendered onto the map
 */
ModeInterface.prototype.toDisplayFeatures = function() {
  throw new Error('You must overwrite toDisplayFeatures');
};

var eventMapper = {
  drag: 'onDrag',
  click: 'onClick',
  mousemove: 'onMouseMove',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mouseout: 'onMouseOut',
  keyup: 'onKeyUp',
  keydown: 'onKeyDown',
  touchstart: 'onTouchStart',
  touchmove: 'onTouchMove',
  touchend: 'onTouchEnd',
  tap: 'onTap',
};

var eventKeys = Object.keys(eventMapper);

function objectToMode (modeObject) {
  var modeObjectKeys = Object.keys(modeObject);
  return function (ctx, startOpts) {
    if ( startOpts === void 0 ) startOpts = {};

    var state = {};
    var mode = modeObjectKeys.reduce(function (m, k) {
      m[k] = modeObject[k];
      return m;
    }, new ModeInterface(ctx));
    function wrapper(eh) {
      return function (e) { return mode[eh](state, e); };
    }

    return {
      start: function start() {
        var this$1$1 = this;

        state = mode.onSetup(startOpts); // this should set ui buttons
        if (ctx.options.measureOptions) {
          var modeName = ctx.api.getMode();
          if (modeName !== modes$1.CUT_LINE && modeName !== modes$1.CUT_POLYGON) {
            mode.setMeasureOptions(ctx.options.measureOptions);
          }
        }
        // Adds event handlers for all event options
        // add sets the selector to false for all
        // handlers that are not present in the mode
        // to reduce on render calls for functions that
        // have no logic
        eventKeys.forEach(function (key) {
          var modeHandler = eventMapper[key];
          var selector = function () { return false; };
          if (modeObject[modeHandler]) {
            selector = function () { return true; };
          }
          this$1$1.on(key, selector, wrapper(modeHandler));
        });
      },
      stop: function stop() {
        return mode.onStop(state);
      },
      trash: function trash() {
        mode.onTrash(state);
      },
      combineFeatures: function combineFeatures() {
        mode.onCombineFeatures(state);
      },
      uncombineFeatures: function uncombineFeatures() {
        mode.onUncombineFeatures(state);
      },
      render: function render(geojson, push) {
        mode.toDisplayFeatures(state, geojson, push);
      },
      // extend start
      undo: function undo() {
        mode.undo();
      },
      redo: function redo() {
        mode.redo();
      },
      finish: function finish(m) {
        mode.finish(m);
      },
      cancel: function cancel(m) {
        mode.cancel(m);
      },
      drawByCoordinate: function drawByCoordinate(coord) {
        mode.drawByCoordinate(coord);
      },
      getModeInstance: function getModeInstance() {
        return mode;
      },
      setMeasureOptions: function setMeasureOptions(options) {
        mode.setMeasureOptions(options);
      },
      // extend end
    };
  };
}

function events (ctx) {
  var modes = Object.keys(ctx.options.modes).reduce(function (m, k) {
    m[k] = objectToMode(ctx.options.modes[k]);
    return m;
  }, {});
  var mouseDownInfo = {};
  var touchStartInfo = {};
  var events = {};
  var currentModeName = null;
  var currentMode = null;

  events.drag = function (event, isDrag) {
    if (
      isDrag({
        point: event.point,
        time: new Date().getTime(),
      })
    ) {
      ctx.ui.queueMapClasses({ mouse: cursors.DRAG });
      currentMode.drag(event);
    } else {
      event.originalEvent.stopPropagation();
    }
  };

  events.mousedrag = function (event) {
    events.drag(event, function (endInfo) { return !isClick(mouseDownInfo, endInfo); });
  };

  events.touchdrag = function (event) {
    events.drag(event, function (endInfo) { return !isTap(touchStartInfo, endInfo); });
  };

  events.mousemove = function (event) {
    var button = event.originalEvent.buttons !== undefined ? event.originalEvent.buttons : event.originalEvent.which;
    if (button === 1) {
      return events.mousedrag(event);
    }

    var target = getFeatureAtAndSetCursors(event, ctx);
    event.featureTarget = target;
    currentMode.mousemove(event);
  };

  events.mousedown = function (event) {
    mouseDownInfo = {
      time: new Date().getTime(),
      point: event.point,
    };
    var target = getFeatureAtAndSetCursors(event, ctx);
    event.featureTarget = target;
    currentMode.mousedown(event);
  };

  events.mouseup = function (event) {
    var target = getFeatureAtAndSetCursors(event, ctx);
    // extend start
    if (event._defaultPrevented) { return; }
    // extend end
    if (!target) {
      if (isClickOnMissAndDoNothing(ctx)) { return; }
    }
    // mapbox end
    event.featureTarget = target;

    if (
      isClick(mouseDownInfo, {
        point: event.point,
        time: new Date().getTime(),
      })
    ) {
      currentMode.click(event);
    } else {
      currentMode.mouseup(event);
    }
  };

  events.mouseout = function (event) {
    currentMode.mouseout(event);
  };

  events.touchstart = function (event) {
    // Prevent emulated mouse events because we will fully handle the touch here.
    // This does not stop the touch events from propogating to mapbox though.
    try {
      event.originalEvent.preventDefault();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    if (!ctx.options.touchEnabled) {
      return;
    }

    touchStartInfo = {
      time: new Date().getTime(),
      point: event.point,
    };
    var target = featuresAt.touch(event, null, ctx)[0];
    event.featureTarget = target;
    currentMode.touchstart(event);
  };

  events.touchmove = function (event) {
    try {
      event.originalEvent.preventDefault();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    if (!ctx.options.touchEnabled) {
      return;
    }

    currentMode.touchmove(event);
    return events.touchdrag(event);
  };

  events.touchend = function (event) {
    try {
      event.originalEvent.preventDefault();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    if (!ctx.options.touchEnabled) {
      return;
    }

    var target = featuresAt.touch(event, null, ctx)[0];

    // extend start
    if (event._defaultPrevented) { return; }
    if (!target) {
      if (isClickOnMissAndDoNothing(ctx)) { return; }
    }
    // extend end
    event.featureTarget = target;
    if (
      isTap(touchStartInfo, {
        time: new Date().getTime(),
        point: event.point,
      })
    ) {
      currentMode.tap(event);
    } else {
      currentMode.touchend(event);
    }
  };

  // 8 - Backspace
  // 46 - Delete
  var isKeyModeValid = function (code) { return !(code === 8 || code === 46 || (code >= 48 && code <= 57)); };

  events.keydown = function (event) {
    var isMapElement = (event.srcElement || event.target).classList.contains('mapboxgl-canvas');
    if (!isMapElement) { return; } // we only handle events on the map

    if ((event.keyCode === 8 || event.keyCode === 46) && ctx.options.controls.trash) {
      event.preventDefault();
      currentMode.trash();
    } else if (isKeyModeValid(event.keyCode)) {
      currentMode.keydown(event);
    } else if (event.keyCode === 49 && ctx.options.controls.point) {
      changeMode(modes$1.DRAW_POINT);
    } else if (event.keyCode === 50 && ctx.options.controls.line_string) {
      changeMode(modes$1.DRAW_LINE_STRING);
    } else if (event.keyCode === 51 && ctx.options.controls.polygon) {
      changeMode(modes$1.DRAW_POLYGON);
    }
  };

  events.keyup = function (event) {
    if (isKeyModeValid(event.keyCode)) {
      currentMode.keyup(event);
    }
  };

  events.zoomend = function () {
    ctx.store.changeZoom();
  };

  events.data = function (event) {
    if (event.dataType === 'style') {
      var setup = ctx.setup;
      var map = ctx.map;
      var options = ctx.options;
      var store = ctx.store;
      var hasLayers = options.styles.some(function (style) { return map.getLayer(style.id); });
      if (!hasLayers) {
        setup.addLayers();
        store.setDirty();
        store.render();
      }
    }
  };

  function changeMode(modename, nextModeOptions, eventOptions) {
    if ( eventOptions === void 0 ) eventOptions = {};

    var result = currentMode.stop();

    var modebuilder = modes[modename];
    if (modebuilder === undefined) {
      throw new Error((modename + " is not valid"));
    }
    currentModeName = modename;
    var mode = modebuilder(ctx, result && result.featureIds ? Object.assign({}, {featureIds: result.featureIds}, nextModeOptions) : nextModeOptions);
    currentMode = ModeHandler(mode, ctx);

    if (!eventOptions.silent) {
      ctx.map.fire(events$1.MODE_CHANGE, { mode: modename });
    }

    ctx.store.setDirty();
    ctx.store.render();
  }

  var actionState = {
    trash: false,
    combineFeatures: false,
    uncombineFeatures: false,
  };

  function actionable(actions) {
    var changed = false;
    Object.keys(actions).forEach(function (action) {
      if (actionState[action] === undefined) { throw new Error('Invalid action type'); }
      if (actionState[action] !== actions[action]) { changed = true; }
      actionState[action] = actions[action];
    });
    if (changed) { ctx.map.fire(events$1.ACTIONABLE, { actions: actionState }); }
  }

  var api = {
    start: function start() {
      currentModeName = ctx.options.defaultMode;
      currentMode = ModeHandler(modes[currentModeName](ctx), ctx);
    },
    changeMode: changeMode,
    actionable: actionable,
    currentModeName: function currentModeName$1() {
      return currentModeName;
    },
    currentModeRender: function currentModeRender(geojson, push) {
      return currentMode.render(geojson, push);
    },
    fire: function fire(name, event) {
      if (events[name]) {
        events[name](event);
      }
    },
    addEventListeners: function addEventListeners() {
      ctx.map.on('mousemove', events.mousemove);
      ctx.map.on('mousedown', events.mousedown);
      ctx.map.on('mouseup', events.mouseup);
      ctx.map.on('data', events.data);

      ctx.map.on('touchmove', events.touchmove);
      ctx.map.on('touchstart', events.touchstart);
      ctx.map.on('touchend', events.touchend);

      ctx.container.addEventListener('mouseout', events.mouseout);

      if (ctx.options.keybindings) {
        ctx.container.addEventListener('keydown', events.keydown);
        ctx.container.addEventListener('keyup', events.keyup);
      }
    },
    removeEventListeners: function removeEventListeners() {
      ctx.map.off('mousemove', events.mousemove);
      ctx.map.off('mousedown', events.mousedown);
      ctx.map.off('mouseup', events.mouseup);
      ctx.map.off('data', events.data);

      ctx.map.off('touchmove', events.touchmove);
      ctx.map.off('touchstart', events.touchstart);
      ctx.map.off('touchend', events.touchend);

      ctx.container.removeEventListener('mouseout', events.mouseout);

      if (ctx.options.keybindings) {
        ctx.container.removeEventListener('keydown', events.keydown);
        ctx.container.removeEventListener('keyup', events.keyup);
      }
    },
    trash: function trash(options) {
      currentMode.trash(options);
    },
    combineFeatures: function combineFeatures() {
      currentMode.combineFeatures();
    },
    uncombineFeatures: function uncombineFeatures() {
      currentMode.uncombineFeatures();
    },
    getMode: function getMode() {
      return currentModeName;
    },
    // extend start
    undo: function undo() {
      currentMode.undo();
    },
    redo: function redo() {
      currentMode.redo();
    },
    finish: function finish(m) {
      currentMode.finish(m);
    },
    cancel: function cancel(m) {
      currentMode.cancel(m);
    },
    drawByCoordinate: function drawByCoordinate(coord) {
      currentMode.drawByCoordinate(coord);
    },
    getModeInstance: function getModeInstance() {
      return currentMode.getModeInstance();
    },
    setMeasureOptions: function setMeasureOptions(options) {
      currentMode.setMeasureOptions(options);
    },
    // extend end
  };

  return api;
}

/**
 * Derive a dense array (no `undefined`s) from a single value or array.
 *
 * @param {any} x
 * @return {Array<any>}
 */
function toDenseArray(x) {
  return [].concat(x).filter(function (y) { return y !== undefined; });
}

function render(e) {
  // eslint-disable-next-line no-invalid-this
  var store = this;
  var mapExists = store.ctx.map && store.ctx.map.getSource(sources.HOT) !== undefined;
  if (!mapExists) { return cleanup(); }

  var mode = store.ctx.events.currentModeName();

  store.ctx.ui.queueMapClasses({ mode: mode });

  var newHotIds = [];
  var newColdIds = [];

  if (store.isDirty) {
    newColdIds = store.getAllIds();
  } else {
    newHotIds = store.getChangedIds().filter(function (id) { return store.get(id) !== undefined; });
    newColdIds = store.sources.hot
      .filter(function (geojson) {
        return geojson.properties.id && newHotIds.indexOf(geojson.properties.id) === -1 && store.get(geojson.properties.id) !== undefined;
      })
      .map(function (geojson) { return geojson.properties.id; });
  }

  store.sources.hot = [];
  var lastColdCount = store.sources.cold.length;
  store.sources.cold = store.isDirty
    ? []
    : store.sources.cold.filter(function (geojson) {
        var id = geojson.properties.id || geojson.properties.parent;
        return newHotIds.indexOf(id) === -1;
      });

  var coldChanged = lastColdCount !== store.sources.cold.length || newColdIds.length > 0;
  newHotIds.forEach(function (id) { return renderFeature(id, 'hot'); });
  newColdIds.forEach(function (id) { return renderFeature(id, 'cold'); });

  function renderFeature(id, source) {
    var feature = store.get(id);
    var featureInternal = feature.internal(mode);
    store.ctx.events.currentModeRender(featureInternal, function (geojson) {
      store.sources[source].push(geojson);
    });
  }

  if (coldChanged) {
    store.ctx.map.getSource(sources.COLD).setData({
      type: geojsonTypes$1.FEATURE_COLLECTION,
      features: store.sources.cold,
    });
  }

  store.ctx.map.getSource(sources.HOT).setData({
    type: geojsonTypes$1.FEATURE_COLLECTION,
    features: store.sources.hot,
  });

  // extend start
  if (store._emitSelectionChange || !e || e.type !== 'mousemove') {
    var modeInstance = store.ctx.events.getModeInstance();
    var isSimpleSelectMode = mode === modes$1.SIMPLE_SELECT;
    var isDirectSelectMode = mode === modes$1.DIRECT_SELECT;
    var isCutMode = mode.includes('cut');
    var disabledCut = isSimpleSelectMode ? !store.getSelected().length : isCutMode ? modeInstance.getWaitCutFeatures().length : true;
    var disableFinish = isSimpleSelectMode || isDirectSelectMode || !modeInstance.feature.isValid();
    store.ctx.ui.setDisableButtons(function (buttonStatus) {
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
    store.ctx.map.fire(events$1.SELECTION_CHANGE, {
      features: store.getSelected().map(function (feature) { return feature.toGeoJSON(); }),
      points: store.getSelectedCoordinates().map(function (coordinate) { return ({
        type: geojsonTypes$1.FEATURE,
        properties: {},
        geometry: {
          type: geojsonTypes$1.POINT,
          coordinates: coordinate.coordinates,
        },
      }); }),
    });
    store._emitSelectionChange = false;
  }

  if (store._deletedFeaturesToEmit.length) {
    var geojsonToEmit = store._deletedFeaturesToEmit.map(function (feature) { return feature.delete().toGeoJSON(); });
    store._deletedFeaturesToEmit = [];
    store.ctx.map.fire(events$1.DELETE, { features: geojsonToEmit });
  }

  cleanup();
  store.ctx.map.fire(events$1.RENDER, {});
  // extend start
  store.emitCallbacks();
  // extend end

  function cleanup() {
    store.isDirty = false;
    store.clearChangedIds();
  }
}

function Store(ctx) {
  var this$1$1 = this;

  this._features = {};
  this._featureIds = new StringSet();
  this._selectedFeatureIds = new StringSet();
  this._selectedCoordinates = [];
  this._changedFeatureIds = new StringSet();
  this._deletedFeaturesToEmit = [];
  this._emitSelectionChange = false;
  this._mapInitialConfig = {};
  this.ctx = ctx;
  // extend start
  this._emitCallbacks = [];
  // extend end
  this.sources = {
    hot: [],
    cold: [],
  };

  // Deduplicate requests to render and tie them to animation frames.
  var renderRequest;
  this.render = function (e) {
    if (!renderRequest) {
      renderRequest = requestAnimationFrame(function () {
        renderRequest = null;
        render.call(this$1$1, e);
      });
    }
  };
  this.isDirty = false;
}

/**
 * Delays all rendering until the returned function is invoked
 * @return {Function} renderBatch
 */
Store.prototype.createRenderBatch = function () {
  var this$1$1 = this;

  var holdRender = this.render;
  var numRenders = 0;
  this.render = function () {
    numRenders++;
  };

  return function () {
    this$1$1.render = holdRender;
    if (numRenders > 0) {
      this$1$1.render();
    }
  };
};

/**
 * Sets the store's state to dirty.
 * @return {Store} this
 */
Store.prototype.setDirty = function () {
  this.isDirty = true;
  return this;
};

/**
 * Sets a feature's state to changed.
 * @param {string} featureId
 * @return {Store} this
 */
Store.prototype.featureChanged = function (featureId) {
  this._changedFeatureIds.add(featureId);
  return this;
};

/**
 * Gets the ids of all features currently in changed state.
 * @return {Store} this
 */
Store.prototype.getChangedIds = function () {
  return this._changedFeatureIds.values();
};

/**
 * Sets all features to unchanged state.
 * @return {Store} this
 */
Store.prototype.clearChangedIds = function () {
  this._changedFeatureIds.clear();
  return this;
};

/**
 * Gets the ids of all features in the store.
 * @return {Store} this
 */
Store.prototype.getAllIds = function () {
  return this._featureIds.values();
};

/**
 * Adds a feature to the store.
 * @param {Object} feature
 *
 * @return {Store} this
 */
Store.prototype.add = function (feature) {
  this.featureChanged(feature.id);
  this._features[feature.id] = feature;
  this._featureIds.add(feature.id);
  return this;
};

/**
 * Deletes a feature or array of features from the store.
 * Cleans up after the deletion by deselecting the features.
 * If changes were made, sets the state to the dirty
 * and fires an event.
 * @param {string | Array<string>} featureIds
 * @param {Object} [options]
 * @param {Object} [options.silent] - If `true`, this invocation will not fire an event.
 * @return {Store} this
 */
Store.prototype.delete = function (featureIds, options) {
  var this$1$1 = this;
  if ( options === void 0 ) options = {};

  toDenseArray(featureIds).forEach(function (id) {
    if (!this$1$1._featureIds.has(id)) { return; }
    this$1$1._featureIds.delete(id);
    this$1$1._selectedFeatureIds.delete(id);
    if (!options.silent) {
      if (this$1$1._deletedFeaturesToEmit.indexOf(this$1$1._features[id]) === -1) {
        this$1$1._deletedFeaturesToEmit.push(this$1$1._features[id]);
      }
    } else {
      // extend start
      this$1$1._features[id].delete();
      // extend end
    }
    delete this$1$1._features[id];
    this$1$1.isDirty = true;
  });
  refreshSelectedCoordinates(this, options);
  return this;
};

/**
 * Returns a feature in the store matching the specified value.
 * @return {Object | undefined} feature
 */
Store.prototype.get = function (id) {
  return this._features[id];
};

/**
 * Returns all features in the store.
 * @return {Array<Object>}
 */
Store.prototype.getAll = function () {
  var this$1$1 = this;

  return Object.keys(this._features).map(function (id) { return this$1$1._features[id]; });
};

/**
 * Adds features to the current selection.
 * @param {string | Array<string>} featureIds
 * @param {Object} [options]
 * @param {Object} [options.silent] - If `true`, this invocation will not fire an event.
 * @return {Store} this
 */
Store.prototype.select = function (featureIds, options) {
  var this$1$1 = this;
  if ( options === void 0 ) options = {};

  toDenseArray(featureIds).forEach(function (id) {
    if (this$1$1._selectedFeatureIds.has(id)) { return; }
    this$1$1._selectedFeatureIds.add(id);
    this$1$1._changedFeatureIds.add(id);
    if (!options.silent) {
      this$1$1._emitSelectionChange = true;
    }
  });
  return this;
};

/**
 * Deletes features from the current selection.
 * @param {string | Array<string>} featureIds
 * @param {Object} [options]
 * @param {Object} [options.silent] - If `true`, this invocation will not fire an event.
 * @return {Store} this
 */
Store.prototype.deselect = function (featureIds, options) {
  var this$1$1 = this;
  if ( options === void 0 ) options = {};

  toDenseArray(featureIds).forEach(function (id) {
    if (!this$1$1._selectedFeatureIds.has(id)) { return; }
    this$1$1._selectedFeatureIds.delete(id);
    this$1$1._changedFeatureIds.add(id);
    if (!options.silent) {
      this$1$1._emitSelectionChange = true;
    }
  });
  refreshSelectedCoordinates(this, options);
  return this;
};

/**
 * Clears the current selection.
 * @param {Object} [options]
 * @param {Object} [options.silent] - If `true`, this invocation will not fire an event.
 * @return {Store} this
 */
Store.prototype.clearSelected = function (options) {
  if ( options === void 0 ) options = {};

  this.deselect(this._selectedFeatureIds.values(), { silent: options.silent });
  return this;
};

/**
 * Sets the store's selection, clearing any prior values.
 * If no feature ids are passed, the store is just cleared.
 * @param {string | Array<string> | undefined} featureIds
 * @param {Object} [options]
 * @param {Object} [options.silent] - If `true`, this invocation will not fire an event.
 * @return {Store} this
 */
Store.prototype.setSelected = function (featureIds, options) {
  var this$1$1 = this;
  if ( options === void 0 ) options = {};

  featureIds = toDenseArray(featureIds);

  // Deselect any features not in the new selection
  this.deselect(
    this._selectedFeatureIds.values().filter(function (id) { return featureIds.indexOf(id) === -1; }),
    { silent: options.silent }
  );

  // Select any features in the new selection that were not already selected
  this.select(
    featureIds.filter(function (id) { return !this$1$1._selectedFeatureIds.has(id); }),
    { silent: options.silent }
  );

  return this;
};

/**
 * Sets the store's coordinates selection, clearing any prior values.
 * @param {Array<Array<string>>} coordinates
 * @return {Store} this
 */
Store.prototype.setSelectedCoordinates = function (coordinates) {
  this._selectedCoordinates = coordinates;
  this._emitSelectionChange = true;
  return this;
};

/**
 * Clears the current coordinates selection.
 * @param {Object} [options]
 * @return {Store} this
 */
Store.prototype.clearSelectedCoordinates = function () {
  this._selectedCoordinates = [];
  this._emitSelectionChange = true;
  // extend start
  mapClearSelectedCoordinates(this.ctx.events.getModeInstance());
  // extend end
  return this;
};

/**
 * Returns the ids of features in the current selection.
 * @return {Array<string>} Selected feature ids.
 */
Store.prototype.getSelectedIds = function () {
  return this._selectedFeatureIds.values();
};

/**
 * Returns features in the current selection.
 * @return {Array<Object>} Selected features.
 */
Store.prototype.getSelected = function () {
  var this$1$1 = this;

  return this._selectedFeatureIds.values().map(function (id) { return this$1$1.get(id); });
};

/**
 * Returns selected coordinates in the currently selected feature.
 * @return {Array<Object>} Selected coordinates.
 */
Store.prototype.getSelectedCoordinates = function () {
  var this$1$1 = this;

  var selected = this._selectedCoordinates.map(function (coordinate) {
    var feature = this$1$1.get(coordinate.feature_id);
    return {
      coordinates: feature.getCoordinate(coordinate.coord_path),
    };
  });
  return selected;
};

/**
 * Indicates whether a feature is selected.
 * @param {string} featureId
 * @return {boolean} `true` if the feature is selected, `false` if not.
 */
Store.prototype.isSelected = function (featureId) {
  return this._selectedFeatureIds.has(featureId);
};

/**
 * Sets a property on the given feature
 * @param {string} featureId
 * @param {string} property property
 * @param {string} property value
 */
Store.prototype.setFeatureProperty = function (featureId, property, value) {
  this.get(featureId).setProperty(property, value);
  this.featureChanged(featureId);
};

function refreshSelectedCoordinates(store, options) {
  var newSelectedCoordinates = store._selectedCoordinates.filter(function (point) { return store._selectedFeatureIds.has(point.feature_id); });
  if (store._selectedCoordinates.length !== newSelectedCoordinates.length && !options.silent) {
    store._emitSelectionChange = true;
  }
  store._selectedCoordinates = newSelectedCoordinates;
}

/**
 * Stores the initial config for a map, so that we can set it again after we're done.
 */
Store.prototype.storeMapConfig = function () {
  var this$1$1 = this;

  interactions.forEach(function (interaction) {
    var interactionSet = this$1$1.ctx.map[interaction];
    if (interactionSet) {
      this$1$1._mapInitialConfig[interaction] = this$1$1.ctx.map[interaction].isEnabled();
    }
  });
};

/**
 * Restores the initial config for a map, ensuring all is well.
 */
Store.prototype.restoreMapConfig = function () {
  var this$1$1 = this;

  Object.keys(this._mapInitialConfig).forEach(function (key) {
    var value = this$1$1._mapInitialConfig[key];
    if (value) {
      this$1$1.ctx.map[key].enable();
    } else {
      this$1$1.ctx.map[key].disable();
    }
  });
};

/**
 * Returns the initial state of an interaction setting.
 * @param {string} interaction
 * @return {boolean} `true` if the interaction is enabled, `false` if not.
 * Defaults to `true`. (Todo: include defaults.)
 */
Store.prototype.getInitialConfigValue = function (interaction) {
  if (this._mapInitialConfig[interaction] !== undefined) {
    return this._mapInitialConfig[interaction];
  } else {
    // This needs to be set to whatever the default is for that interaction
    // It seems to be true for all cases currently, so let's send back `true`.
    return true;
  }
};

// extend start
Store.prototype.emitCallbacks = function (e) {
  while (this._emitCallbacks.length > 0) {
    this._emitCallbacks.shift()(e);
  }
};

Store.prototype.afterRender = function (cb, render) {
  if (typeof cb === 'function') { this._emitCallbacks.push(cb); }
  if (render) { this.render(); }
};

Store.prototype.beforeRender = function (cb) {
  if (typeof cb === 'function') { cb(); }
  this.render();
};
// extend end

var classTypes = ['mode', 'feature', 'mouse'];

function ui (ctx) {
  var buttonElements = {};
  var activeButton = null;

  var currentMapClasses = {
    mode: null, // e.g. mode-direct_select
    feature: null, // e.g. feature-vertex
    mouse: null, // e.g. mouse-move
  };

  var nextMapClasses = {
    mode: null,
    feature: null,
    mouse: null,
  };

  var lineUnitTranform = {
    meters: '米',
    kilometers: '公里',
    miles: '英里',
    nauticalmiles: '海里',
    inches: '英寸',
    yards: '码',
    centimeters: '厘米',
    feet: '英尺',
  };
  var linePopover;

  function removeLinePopover() {
    if (linePopover) {
      linePopover.removeHandle();
      linePopover = null;
    }
  }

  var areaUnitTranform = {
    mu: '亩',
    hectares: '公顷',
    kilometers: '平方公里',
    meters: '平方米',
    centimetres: '平方厘米',
    millimeters: '平方毫米',
    acres: '英亩',
    miles: '平方英里',
    yards: '平方码',
    feet: '平方英尺',
    inches: '平方英寸',
  };

  var polygonPopover;

  function removePolygonPopover() {
    if (polygonPopover) {
      polygonPopover.removeHandle();
      polygonPopover = null;
    }
  }

  function listen() {
    removePolygonPopover();
    removeLinePopover();
    document.body.removeEventListener('click', listen);
  }

  function clearMapClasses() {
    queueMapClasses({ mode: null, feature: null, mouse: null });
    updateMapClasses();
  }

  function queueMapClasses(options) {
    nextMapClasses = xtend(nextMapClasses, options);
  }

  function updateMapClasses() {
    var ref, ref$1;

    if (!ctx.container) { return; }

    var classesToRemove = [];
    var classesToAdd = [];

    classTypes.forEach(function (type) {
      if (nextMapClasses[type] === currentMapClasses[type]) { return; }

      classesToRemove.push((type + "-" + (currentMapClasses[type])));
      if (nextMapClasses[type] !== null) {
        classesToAdd.push((type + "-" + (nextMapClasses[type])));
      }
    });

    if (classesToRemove.length > 0) {
      (ref = ctx.container.classList).remove.apply(ref, classesToRemove);
    }

    if (classesToAdd.length > 0) {
      (ref$1 = ctx.container.classList).add.apply(ref$1, classesToAdd);
    }

    currentMapClasses = xtend(currentMapClasses, nextMapClasses);
  }

  function createControlButton(id, options) {
    if ( options === void 0 ) options = {};

    var button = document.createElement('button');
    button.className = (classes.CONTROL_BUTTON) + " " + (options.className);
    button.setAttribute('title', options.title);
    button.disabled = !!options.disabled;
    options.container.appendChild(button);
    button.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (id !== 'cut_line' && id !== 'cut_polygon') {
          removeLinePopover();
          removePolygonPopover();
        }

        if (typeof options.onClick === 'function') {
          options.onClick();
          return;
        }

        var clickedButton = e.target;
        if (clickedButton === activeButton) {
          deactivateButtons();
          options.onDeactivate();
          return;
        }
        if (options.popover) {
          options.popover({ button: button }).then(function (res) {
            setActiveButton(id);
            options.onActivate(res);
          });
        } else {
          setActiveButton(id);
          options.onActivate();
        }
      },
      true
    );

    return button;
  }

  function deactivateButtons() {
    if (!activeButton) { return; }
    activeButton.classList.remove(classes.ACTIVE_BUTTON);
    activeButton = null;
  }

  function setActiveButton(id) {
    deactivateButtons();
    var button = buttonElements[id];
    if (!button) { return; }

    if (button && id !== 'trash') {
      button.classList.add(classes.ACTIVE_BUTTON);
      activeButton = button;
    }
  }

  function addButtons() {
    var controls = ctx.options.controls;
    var controlGroup = document.createElement('div');
    controlGroup.className = (classes.CONTROL_GROUP) + " " + (classes.CONTROL_BASE);

    if (!controls) { return controlGroup; }

    if (controls[types$1.LINE]) {
      buttonElements[types$1.LINE] = createControlButton(types$1.LINE, {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_LINE,
        title: ("LineString tool " + (ctx.options.keybindings ? '(l)' : '')),
        onActivate: function () { return ctx.events.changeMode(modes$1.DRAW_LINE_STRING); },
        onDeactivate: function () { return ctx.events.trash(); },
      });
    }

    if (controls[types$1.POLYGON]) {
      buttonElements[types$1.POLYGON] = createControlButton(types$1.POLYGON, {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_POLYGON,
        title: ("Polygon tool " + (ctx.options.keybindings ? '(p)' : '')),
        onActivate: function () { return ctx.events.changeMode(modes$1.DRAW_POLYGON); },
        onDeactivate: function () { return ctx.events.trash(); },
      });
    }

    if (controls[types$1.POINT]) {
      buttonElements[types$1.POINT] = createControlButton(types$1.POINT, {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_POINT,
        title: ("Marker tool " + (ctx.options.keybindings ? '(m)' : '')),
        onActivate: function () { return ctx.events.changeMode(modes$1.DRAW_POINT); },
        onDeactivate: function () { return ctx.events.trash(); },
      });
    }

    if (controls.trash) {
      buttonElements.trash = createControlButton('trash', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_TRASH,
        title: 'Delete',
        onActivate: function () {
          ctx.events.trash();
        },
      });
    }

    if (controls.combine_features) {
      buttonElements.combine_features = createControlButton('combineFeatures', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_COMBINE_FEATURES,
        title: 'Combine',
        onActivate: function () {
          ctx.events.combineFeatures();
        },
      });
    }

    if (controls.uncombine_features) {
      buttonElements.uncombine_features = createControlButton('uncombineFeatures', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_UNCOMBINE_FEATURES,
        title: 'Uncombine',
        onActivate: function () {
          ctx.events.uncombineFeatures();
        },
      });
    }
    // extend start
    if (controls.undo) {
      buttonElements.undo = createControlButton('undo', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_UNDO,
        title: 'Undo',
        disabled: true,
        onClick: function () { return ctx.events.undo(); },
      });
    }

    if (controls.redo) {
      buttonElements.redo = createControlButton('redo', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_REDO,
        title: 'Redo',
        disabled: true,
        onClick: function () { return ctx.events.redo(); },
      });
    }

    if (controls.finish) {
      buttonElements.finish = createControlButton('finish', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_FINISH,
        title: 'Finsih',
        disabled: true,
        onClick: function () { return ctx.events.finish(); },
      });
    }

    if (controls.cancel) {
      buttonElements.cancel = createControlButton('cancel', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_CANCEL,
        title: 'Cancel',
        disabled: true,
        onClick: function () { return ctx.events.cancel(); },
      });
    }

    if (controls.draw_center) {
      buttonElements.draw_center = createControlButton('draw_center', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_DRAW_CENTER,
        title: 'Draw By Center',
        disabled: true,
        onClick: function () { return ctx.api.drawByCenter(); },
      });
    }

    if (controls.cut_line) {
      buttonElements.cut_line = createControlButton('cut_line', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_CUT_LINE,
        title: 'cut line',
        disabled: true,
        popover: function (ref) {
          var button = ref.button;

          return new Promise(function (resolve) {
            if (linePopover) {
              removeLinePopover();
              resolve();
              return;
            }
            removePolygonPopover();
            var popover = document.createElement('div');
            var title = document.createTextNode('line width:');
            var title1 = document.createTextNode('unit:');
            var input = document.createElement('input');
            var okBtn = document.createElement('button');
            var cancelBtn = document.createElement('button');
            var select = document.createElement('select');
            select.innerHTML = Object.keys(lineUnitTranform).reduce(function (prev, k) {
              prev += "<option value=\"" + k + "\">" + (lineUnitTranform[k]) + "</option>";
              return prev;
            }, '');
            okBtn.addEventListener('click', function () {
              resolve({ bufferOptions: { width: +(input.value || 0), unit: select.value } });
              removeLinePopover();
            });
            cancelBtn.addEventListener('click', function () {
              resolve();
              removeLinePopover();
            });
            okBtn.textContent = 'ok';
            cancelBtn.textContent = 'cancel';
            input.value = '1';
            input.type = 'number';
            input.min = 0;
            select.value = 'meters';
            popover.className = classes.CONTROL_POPOVER;
            popover.style.top = (11 * 29) + "px";
            popover.style.left = '-308px';
            popover.appendChild(title);
            popover.appendChild(input);
            popover.appendChild(title1);
            popover.appendChild(select);
            popover.appendChild(okBtn);
            popover.appendChild(cancelBtn);
            popover.addEventListener('click', function (e) { return e.stopPropagation(); });
            popover.removeHandle = function () {
              title.remove();
              title1.remove();
              input.remove();
              okBtn.remove();
              cancelBtn.remove();
              select.remove();
              popover.remove();
            };
            linePopover = popover;
            button.parentNode.appendChild(popover);
            document.body.addEventListener('click', listen);
          });
        },
        onActivate: function (opts) { return ctx.api.changeMode(modes$1.CUT_LINE, opts); },
        onDeactivate: function () { return ctx.events.trash(); },
      });
    }

    if (controls.cut_polygon) {
      buttonElements.cut_polygon = createControlButton('cut_polygon', {
        container: controlGroup,
        className: classes.CONTROL_BUTTON_CUT_POLYGON,
        title: 'cut polygon',
        disabled: true,
        popover: function (ref) {
          var button = ref.button;

          return new Promise(function (resolve) {
            if (polygonPopover) {
              removePolygonPopover();
              resolve();
              return;
            }
            removeLinePopover();
            var popover = document.createElement('div');
            var title = document.createTextNode('buffer width:');
            var title1 = document.createTextNode('unit:');
            var input = document.createElement('input');
            var okBtn = document.createElement('button');
            var cancelBtn = document.createElement('button');
            var select = document.createElement('select');
            select.innerHTML = Object.keys(areaUnitTranform).reduce(function (prev, k) {
              prev += "<option value=\"" + k + "\">" + (areaUnitTranform[k]) + "</option>";
              return prev;
            }, '');
            okBtn.addEventListener('click', function () {
              var bufferOptions;
              if (select.value === 'mu') {
                bufferOptions = { unit: 'meters', width: (input.value || 0) * 666.666666667 };
              } else {
                bufferOptions = { width: +(input.value || 0), unit: select.value };
              }
              resolve({ bufferOptions: bufferOptions });
              removePolygonPopover();
            });
            cancelBtn.addEventListener('click', function () {
              resolve();
              removePolygonPopover();
            });

            okBtn.textContent = 'ok';
            cancelBtn.textContent = 'cancel';
            input.value = '1';
            input.type = 'number';
            select.value = 'meters';
            popover.className = classes.CONTROL_POPOVER;
            popover.style.top = (12 * 29) + "px";
            popover.style.left = '-347px';
            popover.appendChild(title);
            popover.appendChild(input);
            popover.appendChild(title1);
            popover.appendChild(select);
            popover.appendChild(okBtn);
            popover.appendChild(cancelBtn);
            popover.addEventListener('click', function (e) { return e.stopPropagation(); });
            popover.removeHandle = function () {
              title.remove();
              title1.remove();
              input.remove();
              okBtn.remove();
              cancelBtn.remove();
              select.remove();
              popover.remove();
            };

            polygonPopover = popover;
            button.parentNode.appendChild(popover);
            document.body.addEventListener('click', listen);
          });
        },
        onDeactivate: function () { return ctx.events.trash(); },
        onActivate: function (opts) { return ctx.api.changeMode(modes$1.CUT_POLYGON, opts); },
      });
    }

    // extend end
    return controlGroup;
  }

  function removeButtons() {
    Object.keys(buttonElements).forEach(function (buttonId) {
      var button = buttonElements[buttonId];
      if (button.parentNode) {
        button.parentNode.removeChild(button);
      }
      delete buttonElements[buttonId];
    });
  }

  // extend start
  function setDisableButtons(cb) {
    if (!buttonElements) { return; }

    var orginStatus = Object.entries(buttonElements).reduce(function (prev, ref) {
      var k = ref[0];
      var v = ref[1];

      prev[k] = { disabled: !!v.disabled };
      return prev;
    }, {});
    var status = cb(JSON.parse(JSON.stringify(orginStatus)));

    Object.entries(buttonElements).forEach(function (ref) {
      var buttonId = ref[0];
      var button = ref[1];

      var disabled = status[buttonId].disabled;
      if (typeof disabled === 'boolean' && disabled !== button.disabled) { button.disabled = status[buttonId].disabled; }
    });
  }
  // extend end
  return {
    setActiveButton: setActiveButton,
    queueMapClasses: queueMapClasses,
    updateMapClasses: updateMapClasses,
    clearMapClasses: clearMapClasses,
    addButtons: addButtons,
    removeButtons: removeButtons,
    setDisableButtons: setDisableButtons,
  };
}

function runSetup (ctx) {
  var controlContainer = null;
  var mapLoadedInterval = null;

  var setup = {
    onRemove: function onRemove() {
      // Stop connect attempt in the event that control is removed before map is loaded
      ctx.map.off('load', setup.connect);
      clearInterval(mapLoadedInterval);
      setup.removeLayers();
      ctx.store.restoreMapConfig();
      ctx.ui.removeButtons();
      ctx.events.removeEventListeners();
      ctx.ui.clearMapClasses();
      if (ctx.boxZoomInitial) { ctx.map.boxZoom.enable(); }
      ctx.map = null;
      ctx.container = null;
      ctx.store = null;

      if (controlContainer && controlContainer.parentNode) { controlContainer.parentNode.removeChild(controlContainer); }
      controlContainer = null;

      return this;
    },
    connect: function connect() {
      ctx.map.off('load', setup.connect);
      clearInterval(mapLoadedInterval);
      setup.addLayers();
      ctx.store.storeMapConfig();
      ctx.events.addEventListeners();

      // extend start
      loadIconImageByTheme(ctx.map);
      var modeInstance = ctx.events.getModeInstance();
      modeInstance.afterRender(function () { return mapFireOnAdd(modeInstance, { controlContainer: controlContainer }); });
      // extend end
    },
    onAdd: function onAdd(map) {
      if ('browser' !== 'test') {
        // Monkey patch to resolve breaking change to `fire` introduced by
        // mapbox-gl-js. See mapbox/mapbox-gl-draw/issues/766.
        var _fire = map.fire;
        map.fire = function (type, event) {
          // eslint-disable-next-line
          var args = arguments;

          if (_fire.length === 1 && arguments.length !== 1) {
            args = [xtend({}, { type: type }, event)];
          }

          return _fire.apply(map, args);
        };
      }

      ctx.map = map;
      ctx.events = events(ctx);
      ctx.ui = ui(ctx);
      ctx.container = map.getContainer();
      ctx.store = new Store(ctx);
      controlContainer = ctx.ui.addButtons();

      if (ctx.options.boxSelect) {
        ctx.boxZoomInitial = map.boxZoom.isEnabled();
        map.boxZoom.disable();
        // Need to toggle dragPan on and off or else first
        // dragPan disable attempt in simple_select doesn't work
        map.dragPan.disable();
        map.dragPan.enable();
      }

      if (map.loaded()) {
        setup.connect();
      } else {
        map.on('load', setup.connect);
        mapLoadedInterval = setInterval(function () {
          if (map.loaded()) { setup.connect(); }
        }, 16);
      }

      ctx.events.start();
      return controlContainer;
    },
    addLayers: function addLayers() {
      // drawn features style
      ctx.map.addSource(sources.COLD, {
        data: {
          type: geojsonTypes$1.FEATURE_COLLECTION,
          features: [],
        },
        type: 'geojson',
      });

      // hot features style
      ctx.map.addSource(sources.HOT, {
        data: {
          type: geojsonTypes$1.FEATURE_COLLECTION,
          features: [],
        },
        type: 'geojson',
      });

      ctx.options.styles.forEach(function (style) {
        ctx.map.addLayer(style);
      });

      ctx.store.setDirty();
      ctx.store.render();
    },
    // Check for layers and sources before attempting to remove
    // If user adds draw control and removes it before the map is loaded, layers and sources will be missing
    removeLayers: function removeLayers() {
      ctx.options.styles.forEach(function (style) {
        if (ctx.map.getLayer(style.id)) {
          ctx.map.removeLayer(style.id);
        }
      });

      if (ctx.map.getSource(sources.COLD)) {
        ctx.map.removeSource(sources.COLD);
      }

      if (ctx.map.getSource(sources.HOT)) {
        ctx.map.removeSource(sources.HOT);
      }
    },
  };

  ctx.setup = setup;

  return setup;
}

var styles = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': ['coalesce', ['get', 'user_inactive-fill-color'], '#3bb2d0'],
      'fill-outline-color': ['coalesce', ['get', 'user_inactive-fill-outline-color'], '#3bb2d0'],
      'fill-opacity': ['coalesce', ['get', 'user_inactive-fill-opacity'], 0.1],
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#3bb2d0'],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ['coalesce', ['get', 'user_inactive-line-color'], '#3bb2d0'],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 3,
      'circle-color': '#3bb2d0',
    },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#fff',
    },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#fbb03b',
    },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2,
    },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040',
    },
  } ];

function isOfMetaType(type) {
  return function (e) {
    var featureTarget = e.featureTarget;
    if (!featureTarget) { return false; }
    if (!featureTarget.properties) { return false; }
    return featureTarget.properties.meta === type;
  };
}

function isShiftMousedown(e) {
  if (!e.originalEvent) { return false; }
  if (!e.originalEvent.shiftKey) { return false; }
  return e.originalEvent.button === 0;
}

function isActiveFeature(e) {
  if (!e.featureTarget) { return false; }
  if (!e.featureTarget.properties) { return false; }
  return e.featureTarget.properties.active === activeStates.ACTIVE && e.featureTarget.properties.meta === meta.FEATURE;
}

function isInactiveFeature(e) {
  if (!e.featureTarget) { return false; }
  if (!e.featureTarget.properties) { return false; }
  return (
    e.featureTarget.properties.active === activeStates.INACTIVE && e.featureTarget.properties.meta === meta.FEATURE
  );
}

function noTarget(e) {
  return e.featureTarget === undefined;
}

function isFeature(e) {
  if (!e.featureTarget) { return false; }
  if (!e.featureTarget.properties) { return false; }
  return e.featureTarget.properties.meta === meta.FEATURE;
}

function isVertex$1(e) {
  var featureTarget = e.featureTarget;
  if (!featureTarget) { return false; }
  if (!featureTarget.properties) { return false; }
  return featureTarget.properties.meta === meta.VERTEX;
}

function isShiftDown(e) {
  if (!e.originalEvent) { return false; }
  return e.originalEvent.shiftKey === true;
}

function isEscapeKey(e) {
  return e.keyCode === 27;
}

function isEnterKey(e) {
  return e.keyCode === 13;
}

function isTrue() {
  return true;
}

var common_selectors = /*#__PURE__*/Object.freeze({
__proto__: null,
isOfMetaType: isOfMetaType,
isShiftMousedown: isShiftMousedown,
isActiveFeature: isActiveFeature,
isInactiveFeature: isInactiveFeature,
noTarget: noTarget,
isFeature: isFeature,
isVertex: isVertex$1,
isShiftDown: isShiftDown,
isEscapeKey: isEscapeKey,
isEnterKey: isEnterKey,
isTrue: isTrue
});

'use strict';

var pointGeometry = Point$1;

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
function Point$1(x, y) {
    this.x = x;
    this.y = y;
}

Point$1.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() { return new Point$1(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add:     function(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub:     function(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint:    function(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint:     function(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult:    function(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div:     function(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate:  function(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit:    function() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp:    function() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round:   function() { return this.clone()._round(); },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, or an unknown type, return it unchanged
 * @param {Array<Number>|Point|*} a any kind of input value
 * @return {Point} constructed point, or passed-through value.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point$1.convert = function (a) {
    if (a instanceof Point$1) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point$1(a[0], a[1]);
    }
    return a;
};

var Point$2 = /*@__PURE__*/getDefaultExportFromCjs(pointGeometry);

/**
 * Returns a Point representing a mouse event's position
 * relative to a containing element.
 *
 * @param {MouseEvent} mouseEvent
 * @param {Node} container
 * @returns {Point}
 */
function mouseEventPoint(mouseEvent, container) {
  var rect = container.getBoundingClientRect();
  return new Point$2(
    mouseEvent.clientX - rect.left - (container.clientLeft || 0),
    mouseEvent.clientY - rect.top - (container.clientTop || 0)
  );
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
 * @return {GeoJSON} Point
 */
function createVertex(parentId, coordinates, path, selected, isLast, mode) {
  return {
    type: geojsonTypes$1.FEATURE,
    properties: {
      meta: meta.VERTEX,
      parent: parentId,
      coord_path: path,
      active: (selected) ? activeStates.ACTIVE : activeStates.INACTIVE,
      isLast: !!isLast,
      mode: mode
    },
    geometry: {
      type: geojsonTypes$1.POINT,
      coordinates: coordinates
    }
  };
}

function createMidpoint(parent, startVertex, endVertex) {
  var startCoord = startVertex.geometry.coordinates;
  var endCoord = endVertex.geometry.coordinates;

  // If a coordinate exceeds the projection, we can't calculate a midpoint,
  // so run away
  if (startCoord[1] > LAT_RENDERED_MAX$1 ||
    startCoord[1] < LAT_RENDERED_MIN$1 ||
    endCoord[1] > LAT_RENDERED_MAX$1 ||
    endCoord[1] < LAT_RENDERED_MIN$1) {
    return null;
  }

  var mid = {
    lng: (startCoord[0] + endCoord[0]) / 2,
    lat: (startCoord[1] + endCoord[1]) / 2
  };

  return {
    type: geojsonTypes$1.FEATURE,
    properties: {
      meta: meta.MIDPOINT,
      parent: parent,
      lng: mid.lng,
      lat: mid.lat,
      coord_path: endVertex.properties.coord_path
    },
    geometry: {
      type: geojsonTypes$1.POINT,
      coordinates: [mid.lng, mid.lat]
    }
  };
}

function createSupplementaryPoints(geojson, options, basePath, mode) {
  if ( options === void 0 ) options = {};
  if ( basePath === void 0 ) basePath = null;

  var ref = geojson.geometry;
  var type = ref.type;
  var coordinates = ref.coordinates;
  var featureId = geojson.properties && geojson.properties.id;

  var supplementaryPoints = [];

  if (type === geojsonTypes$1.POINT) {
    // For points, just create a vertex
    supplementaryPoints.push(createVertex(featureId, coordinates, basePath, isSelectedPath(basePath),undefined, mode));
  } else if (type === geojsonTypes$1.POLYGON) {
    // Cycle through a Polygon's rings and
    // process each line
    coordinates.forEach(function (line, lineIndex) {
      processLine(line, (basePath !== null) ? (basePath + "." + lineIndex) : String(lineIndex));
    });
  } else if (type === geojsonTypes$1.LINE_STRING) {
    processLine(coordinates, basePath);
  } else if (type.indexOf(geojsonTypes$1.MULTI_PREFIX) === 0) {
    processMultiGeometry();
  }

  function processLine(line, lineBasePath) {
    var firstPointString = '';
    var lastVertex = null;
    line.forEach(function (point, pointIndex) {
      var pointPath = (lineBasePath !== undefined && lineBasePath !== null) ? (lineBasePath + "." + pointIndex) : String(pointIndex);
      var vertex = createVertex(featureId, point, pointPath, isSelectedPath(pointPath), undefined, mode);

      // If we're creating midpoints, check if there was a
      // vertex before this one. If so, add a midpoint
      // between that vertex and this one.
      if (options.midpoints && lastVertex) {
        var midpoint = createMidpoint(featureId, lastVertex, vertex);
        if (midpoint) {
          supplementaryPoints.push(midpoint);
        }
      }
      lastVertex = vertex;

      // A Polygon line's last point is the same as the first point. If we're on the last
      // point, we want to draw a midpoint before it but not another vertex on it
      // (since we already a vertex there, from the first point).
      var stringifiedPoint = JSON.stringify(point);
      if (firstPointString !== stringifiedPoint) {
        supplementaryPoints.push(vertex);
      }
      if (pointIndex === 0) {
        firstPointString = stringifiedPoint;
      }
    });
  }

  function isSelectedPath(path) {
    if (!options.selectedPaths) { return false; }
    return options.selectedPaths.indexOf(path) !== -1;
  }

  // Split a multi-geometry into constituent
  // geometries, and accumulate the supplementary points
  // for each of those constituents
  function processMultiGeometry() {
    var subType = type.replace(geojsonTypes$1.MULTI_PREFIX, '');
    coordinates.forEach(function (subCoordinates, index) {
      var subFeature = {
        type: geojsonTypes$1.FEATURE,
        properties: geojson.properties,
        geometry: {
          type: subType,
          coordinates: subCoordinates
        }
      };
      supplementaryPoints = supplementaryPoints.concat(createSupplementaryPoints(subFeature, options, index, mode));
    });
  }

  return supplementaryPoints;
}

var doubleClickZoom = {
  enable: function enable(ctx) {
    setTimeout(function () {
      // First check we've got a map and some context.
      if (!ctx.map || !ctx.map.doubleClickZoom || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) { return; }
      // Now check initial state wasn't false (we leave it disabled if so)
      if (!ctx._ctx.store.getInitialConfigValue('doubleClickZoom')) { return; }
      ctx.map.doubleClickZoom.enable();
    }, 0);
  },
  disable: function disable(ctx) {
    setTimeout(function () {
      if (!ctx.map || !ctx.map.doubleClickZoom) { return; }
      // Always disable here, as it's necessary in some cases.
      ctx.map.doubleClickZoom.disable();
    }, 0);
  }
};

var geojsonExtent$1 = {exports: {}};

var geojsonNormalize$1 = normalize;

var types = {
    Point: 'geometry',
    MultiPoint: 'geometry',
    LineString: 'geometry',
    MultiLineString: 'geometry',
    Polygon: 'geometry',
    MultiPolygon: 'geometry',
    GeometryCollection: 'geometry',
    Feature: 'feature',
    FeatureCollection: 'featurecollection'
};

/**
 * Normalize a GeoJSON feature into a FeatureCollection.
 *
 * @param {object} gj geojson data
 * @returns {object} normalized geojson data
 */
function normalize(gj) {
    if (!gj || !gj.type) { return null; }
    var type = types[gj.type];
    if (!type) { return null; }

    if (type === 'geometry') {
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: gj
            }]
        };
    } else if (type === 'feature') {
        return {
            type: 'FeatureCollection',
            features: [gj]
        };
    } else if (type === 'featurecollection') {
        return gj;
    }
}

var normalize$1 = /*@__PURE__*/getDefaultExportFromCjs(geojsonNormalize$1);

function e(t){switch(t&&t.type||null){case"FeatureCollection":return t.features=t.features.reduce(function(t,r){return t.concat(e(r))},[]),t;case"Feature":return t.geometry?e(t.geometry).map(function(e){var r={type:"Feature",properties:JSON.parse(JSON.stringify(t.properties)),geometry:e};return void 0!==t.id&&(r.id=t.id),r}):[t];case"MultiPoint":return t.coordinates.map(function(e){return {type:"Point",coordinates:e}});case"MultiPolygon":return t.coordinates.map(function(e){return {type:"Polygon",coordinates:e}});case"MultiLineString":return t.coordinates.map(function(e){return {type:"LineString",coordinates:e}});case"GeometryCollection":return t.geometries.map(e).reduce(function(e,t){return e.concat(t)},[]);case"Point":case"Polygon":case"LineString":return [t]}}

var index_es = /*#__PURE__*/Object.freeze({
__proto__: null,
'default': e
});

var require$$1 = /*@__PURE__*/getAugmentedNamespace(index_es);

var flatten$1 = function flatten(list) {
    return _flatten(list);

    function _flatten(list) {
        if (Array.isArray(list) && list.length &&
            typeof list[0] === 'number') {
            return [list];
        }
        return list.reduce(function (acc, item) {
            if (Array.isArray(item) && Array.isArray(item[0])) {
                return acc.concat(_flatten(item));
            } else {
                acc.push(item);
                return acc;
            }
        }, []);
    }
};

var flatten$2 = /*@__PURE__*/getDefaultExportFromCjs(flatten$1);

var geojsonNormalize = geojsonNormalize$1,
    geojsonFlatten = require$$1,
    flatten = flatten$1;

if (!(geojsonFlatten instanceof Function)) { geojsonFlatten = geojsonFlatten.default; }

var geojsonCoords$1 = function(_) {
    if (!_) { return []; }
    var normalized = geojsonFlatten(geojsonNormalize(_)),
        coordinates = [];
    normalized.features.forEach(function(feature) {
        if (!feature.geometry) { return; }
        coordinates = coordinates.concat(flatten(feature.geometry.coordinates));
    });
    return coordinates;
};

var index$3 = /*@__PURE__*/getDefaultExportFromCjs(geojsonCoords$1);

'use strict';

// TODO: use call-bind, is-date, is-regex, is-string, is-boolean-object, is-number-object
function toS(obj) { return Object.prototype.toString.call(obj); }
function isDate(obj) { return toS(obj) === '[object Date]'; }
function isRegExp(obj) { return toS(obj) === '[object RegExp]'; }
function isError(obj) { return toS(obj) === '[object Error]'; }
function isBoolean(obj) { return toS(obj) === '[object Boolean]'; }
function isNumber$1(obj) { return toS(obj) === '[object Number]'; }
function isString(obj) { return toS(obj) === '[object String]'; }

// TODO: use isarray
var isArray = Array.isArray || function isArray(xs) {
	return Object.prototype.toString.call(xs) === '[object Array]';
};

// TODO: use for-each?
function forEach(xs, fn) {
	if (xs.forEach) { return xs.forEach(fn); }
	for (var i = 0; i < xs.length; i++) {
		fn(xs[i], i, xs);
	}
	return void undefined;
}

// TODO: use object-keys
var objectKeys = Object.keys || function keys(obj) {
	var res = [];
	for (var key in obj) { res.push(key); } // eslint-disable-line no-restricted-syntax
	return res;
};

var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var getOwnPropertySymbols = Object.getOwnPropertySymbols; // eslint-disable-line id-length

// TODO: use reflect.ownkeys and filter out non-enumerables
function ownEnumerableKeys(obj) {
	var res = objectKeys(obj);

	// Include enumerable symbol properties.
	if (getOwnPropertySymbols) {
		var symbols = getOwnPropertySymbols(obj);
		for (var i = 0; i < symbols.length; i++) {
			if (propertyIsEnumerable.call(obj, symbols[i])) {
				res.push(symbols[i]);
			}
		}
	}
	return res;
}

// TODO: use object.hasown
var hasOwnProperty = Object.prototype.hasOwnProperty || function (obj, key) {
	return key in obj;
};

function copy(src) {
	if (typeof src === 'object' && src !== null) {
		var dst;

		if (isArray(src)) {
			dst = [];
		} else if (isDate(src)) {
			dst = new Date(src.getTime ? src.getTime() : src);
		} else if (isRegExp(src)) {
			dst = new RegExp(src);
		} else if (isError(src)) {
			dst = { message: src.message };
		} else if (isBoolean(src) || isNumber$1(src) || isString(src)) {
			dst = Object(src);
		} else if (Object.create && Object.getPrototypeOf) {
			dst = Object.create(Object.getPrototypeOf(src));
		} else if (src.constructor === Object) {
			dst = {};
		} else {
			var proto = (src.constructor && src.constructor.prototype)
				|| src.__proto__
				|| {};
			var T = function T() {}; // eslint-disable-line func-style, func-name-matching
			T.prototype = proto;
			dst = new T();
		}

		forEach(ownEnumerableKeys(src), function (key) {
			dst[key] = src[key];
		});
		return dst;
	}
	return src;
}

function walk(root, cb, immutable) {
	var path = [];
	var parents = [];
	var alive = true;

	return (function walker(node_) {
		var node = immutable ? copy(node_) : node_;
		var modifiers = {};

		var keepGoing = true;

		var state = {
			node: node,
			node_: node_,
			path: [].concat(path),
			parent: parents[parents.length - 1],
			parents: parents,
			key: path[path.length - 1],
			isRoot: path.length === 0,
			level: path.length,
			circular: null,
			update: function (x, stopHere) {
				if (!state.isRoot) {
					state.parent.node[state.key] = x;
				}
				state.node = x;
				if (stopHere) { keepGoing = false; }
			},
			delete: function (stopHere) {
				delete state.parent.node[state.key];
				if (stopHere) { keepGoing = false; }
			},
			remove: function (stopHere) {
				if (isArray(state.parent.node)) {
					state.parent.node.splice(state.key, 1);
				} else {
					delete state.parent.node[state.key];
				}
				if (stopHere) { keepGoing = false; }
			},
			keys: null,
			before: function (f) { modifiers.before = f; },
			after: function (f) { modifiers.after = f; },
			pre: function (f) { modifiers.pre = f; },
			post: function (f) { modifiers.post = f; },
			stop: function () { alive = false; },
			block: function () { keepGoing = false; },
		};

		if (!alive) { return state; }

		function updateState() {
			if (typeof state.node === 'object' && state.node !== null) {
				if (!state.keys || state.node_ !== state.node) {
					state.keys = ownEnumerableKeys(state.node);
				}

				state.isLeaf = state.keys.length === 0;

				for (var i = 0; i < parents.length; i++) {
					if (parents[i].node_ === node_) {
						state.circular = parents[i];
						break; // eslint-disable-line no-restricted-syntax
					}
				}
			} else {
				state.isLeaf = true;
				state.keys = null;
			}

			state.notLeaf = !state.isLeaf;
			state.notRoot = !state.isRoot;
		}

		updateState();

		// use return values to update if defined
		var ret = cb.call(state, state.node);
		if (ret !== undefined && state.update) { state.update(ret); }

		if (modifiers.before) { modifiers.before.call(state, state.node); }

		if (!keepGoing) { return state; }

		if (
			typeof state.node === 'object'
			&& state.node !== null
			&& !state.circular
		) {
			parents.push(state);

			updateState();

			forEach(state.keys, function (key, i) {
				path.push(key);

				if (modifiers.pre) { modifiers.pre.call(state, state.node[key], key); }

				var child = walker(state.node[key]);
				if (immutable && hasOwnProperty.call(state.node, key)) {
					state.node[key] = child.node;
				}

				child.isLast = i === state.keys.length - 1;
				child.isFirst = i === 0;

				if (modifiers.post) { modifiers.post.call(state, child); }

				path.pop();
			});
			parents.pop();
		}

		if (modifiers.after) { modifiers.after.call(state, state.node); }

		return state;
	}(root)).node;
}

function Traverse(obj) {
	this.value = obj;
}

Traverse.prototype.get = function (ps) {
	var node = this.value;
	for (var i = 0; i < ps.length; i++) {
		var key = ps[i];
		if (!node || !hasOwnProperty.call(node, key)) {
			return void undefined;
		}
		node = node[key];
	}
	return node;
};

Traverse.prototype.has = function (ps) {
	var node = this.value;
	for (var i = 0; i < ps.length; i++) {
		var key = ps[i];
		if (!node || !hasOwnProperty.call(node, key)) {
			return false;
		}
		node = node[key];
	}
	return true;
};

Traverse.prototype.set = function (ps, value) {
	var node = this.value;
	for (var i = 0; i < ps.length - 1; i++) {
		var key = ps[i];
		if (!hasOwnProperty.call(node, key)) { node[key] = {}; }
		node = node[key];
	}
	node[ps[i]] = value;
	return value;
};

Traverse.prototype.map = function (cb) {
	return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
	this.value = walk(this.value, cb, false);
	return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
	var skip = arguments.length === 1;
	var acc = skip ? this.value : init;
	this.forEach(function (x) {
		if (!this.isRoot || !skip) {
			acc = cb.call(this, acc, x);
		}
	});
	return acc;
};

Traverse.prototype.paths = function () {
	var acc = [];
	this.forEach(function () {
		acc.push(this.path);
	});
	return acc;
};

Traverse.prototype.nodes = function () {
	var acc = [];
	this.forEach(function () {
		acc.push(this.node);
	});
	return acc;
};

Traverse.prototype.clone = function () {
	var parents = [];
	var nodes = [];

	return (function clone(src) {
		for (var i = 0; i < parents.length; i++) {
			if (parents[i] === src) {
				return nodes[i];
			}
		}

		if (typeof src === 'object' && src !== null) {
			var dst = copy(src);

			parents.push(src);
			nodes.push(dst);

			forEach(ownEnumerableKeys(src), function (key) {
				dst[key] = clone(src[key]);
			});

			parents.pop();
			nodes.pop();
			return dst;
		}

		return src;

	}(this.value));
};

function traverse$1(obj) {
	return new Traverse(obj);
}

// TODO: replace with object.assign?
forEach(ownEnumerableKeys(Traverse.prototype), function (key) {
	traverse$1[key] = function (obj) {
		var args = [].slice.call(arguments, 1);
		var t = new Traverse(obj);
		return t[key].apply(t, args);
	};
});

var traverse_1 = traverse$1;

var index$2 = /*@__PURE__*/getDefaultExportFromCjs(traverse_1);

var extent$2 = Extent;

function Extent(bbox) {
    if (!(this instanceof Extent)) {
        return new Extent(bbox);
    }
    this._bbox = bbox || [Infinity, Infinity, -Infinity, -Infinity];
    this._valid = !!bbox;
}

Extent.prototype.include = function(ll) {
    this._valid = true;
    this._bbox[0] = Math.min(this._bbox[0], ll[0]);
    this._bbox[1] = Math.min(this._bbox[1], ll[1]);
    this._bbox[2] = Math.max(this._bbox[2], ll[0]);
    this._bbox[3] = Math.max(this._bbox[3], ll[1]);
    return this;
};

Extent.prototype.equals = function(_) {
    var other;
    if (_ instanceof Extent) { other = _.bbox(); } else { other = _; }
    return this._bbox[0] == other[0] &&
        this._bbox[1] == other[1] &&
        this._bbox[2] == other[2] &&
        this._bbox[3] == other[3];
};

Extent.prototype.center = function(_) {
    if (!this._valid) { return null; }
    return [
        (this._bbox[0] + this._bbox[2]) / 2,
        (this._bbox[1] + this._bbox[3]) / 2]
};

Extent.prototype.union = function(_) {
    this._valid = true;
    var other;
    if (_ instanceof Extent) { other = _.bbox(); } else { other = _; }
    this._bbox[0] = Math.min(this._bbox[0], other[0]);
    this._bbox[1] = Math.min(this._bbox[1], other[1]);
    this._bbox[2] = Math.max(this._bbox[2], other[2]);
    this._bbox[3] = Math.max(this._bbox[3], other[3]);
    return this;
};

Extent.prototype.bbox = function() {
    if (!this._valid) { return null; }
    return this._bbox;
};

Extent.prototype.contains = function(ll) {
    if (!ll) { return this._fastContains(); }
    if (!this._valid) { return null; }
    var lon = ll[0], lat = ll[1];
    return this._bbox[0] <= lon &&
        this._bbox[1] <= lat &&
        this._bbox[2] >= lon &&
        this._bbox[3] >= lat;
};

Extent.prototype.intersect = function(_) {
    if (!this._valid) { return null; }

    var other;
    if (_ instanceof Extent) { other = _.bbox(); } else { other = _; }

    return !(
      this._bbox[0] > other[2] ||
      this._bbox[2] < other[0] ||
      this._bbox[3] < other[1] ||
      this._bbox[1] > other[3]
    );
};

Extent.prototype._fastContains = function() {
    if (!this._valid) { return new Function('return null;'); }
    var body = 'return ' +
        this._bbox[0] + '<= ll[0] &&' +
        this._bbox[1] + '<= ll[1] &&' +
        this._bbox[2] + '>= ll[0] &&' +
        this._bbox[3] + '>= ll[1]';
    return new Function('ll', body);
};

Extent.prototype.polygon = function() {
    if (!this._valid) { return null; }
    return {
        type: 'Polygon',
        coordinates: [
            [
                // W, S
                [this._bbox[0], this._bbox[1]],
                // E, S
                [this._bbox[2], this._bbox[1]],
                // E, N
                [this._bbox[2], this._bbox[3]],
                // W, N
                [this._bbox[0], this._bbox[3]],
                // W, S
                [this._bbox[0], this._bbox[1]]
            ]
        ]
    };
};

var index$1 = /*@__PURE__*/getDefaultExportFromCjs(extent$2);

var geojsonExtent = geojsonExtent$1.exports;

var geojsonCoords = geojsonCoords$1,
    traverse = traverse_1,
    extent = extent$2;

var geojsonTypesByDataAttributes = {
    features: ['FeatureCollection'],
    coordinates: ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
    geometry: ['Feature'],
    geometries: ['GeometryCollection']
};

var dataAttributes = Object.keys(geojsonTypesByDataAttributes);

geojsonExtent$1.exports = function(_) {
    return getExtent(_).bbox();
};

var polygon$1 = geojsonExtent$1.exports.polygon = function(_) {
    return getExtent(_).polygon();
};

var bboxify = geojsonExtent$1.exports.bboxify = function(_) {
    return traverse(_).map(function(value) {
        if (!value) { return ; }

        var isValid = dataAttributes.some(function(attribute){
            if(value[attribute]) {
                return geojsonTypesByDataAttributes[attribute].indexOf(value.type) !== -1;
            }
            return false;
        });

        if(isValid){
            value.bbox = getExtent(value).bbox();
            this.update(value);
        }

    });
};

function getExtent(_) {
    var ext = extent(),
        coords = geojsonCoords(_);
    for (var i = 0; i < coords.length; i++) { ext.include(coords[i]); }
    return ext;
}

var geojsonExtentExports = geojsonExtent$1.exports;
var extent$1 = /*@__PURE__*/getDefaultExportFromCjs(geojsonExtentExports);

var LAT_MIN = LAT_MIN$1;
var LAT_MAX = LAT_MAX$1;
var LAT_RENDERED_MIN = LAT_RENDERED_MIN$1;
var LAT_RENDERED_MAX = LAT_RENDERED_MAX$1;
var LNG_MIN = LNG_MIN$1;
var LNG_MAX = LNG_MAX$1;

// Ensure that we do not drag north-south far enough for
// - any part of any feature to exceed the poles
// - any feature to be completely lost in the space between the projection's
//   edge and the poles, such that it couldn't be re-selected and moved back
function constrainFeatureMovement(geojsonFeatures, delta) {
  // "inner edge" = a feature's latitude closest to the equator
  var northInnerEdge = LAT_MIN;
  var southInnerEdge = LAT_MAX;
  // "outer edge" = a feature's latitude furthest from the equator
  var northOuterEdge = LAT_MIN;
  var southOuterEdge = LAT_MAX;

  var westEdge = LNG_MAX;
  var eastEdge = LNG_MIN;

  geojsonFeatures.forEach(function (feature) {
    var bounds = extent$1(feature);
    var featureSouthEdge = bounds[1];
    var featureNorthEdge = bounds[3];
    var featureWestEdge = bounds[0];
    var featureEastEdge = bounds[2];
    if (featureSouthEdge > northInnerEdge) { northInnerEdge = featureSouthEdge; }
    if (featureNorthEdge < southInnerEdge) { southInnerEdge = featureNorthEdge; }
    if (featureNorthEdge > northOuterEdge) { northOuterEdge = featureNorthEdge; }
    if (featureSouthEdge < southOuterEdge) { southOuterEdge = featureSouthEdge; }
    if (featureWestEdge < westEdge) { westEdge = featureWestEdge; }
    if (featureEastEdge > eastEdge) { eastEdge = featureEastEdge; }
  });


  // These changes are not mutually exclusive: we might hit the inner
  // edge but also have hit the outer edge and therefore need
  // another readjustment
  var constrainedDelta = delta;
  if (northInnerEdge + constrainedDelta.lat > LAT_RENDERED_MAX) {
    constrainedDelta.lat = LAT_RENDERED_MAX - northInnerEdge;
  }
  if (northOuterEdge + constrainedDelta.lat > LAT_MAX) {
    constrainedDelta.lat = LAT_MAX - northOuterEdge;
  }
  if (southInnerEdge + constrainedDelta.lat < LAT_RENDERED_MIN) {
    constrainedDelta.lat = LAT_RENDERED_MIN - southInnerEdge;
  }
  if (southOuterEdge + constrainedDelta.lat < LAT_MIN) {
    constrainedDelta.lat = LAT_MIN - southOuterEdge;
  }
  if (westEdge + constrainedDelta.lng <= LNG_MIN) {
    constrainedDelta.lng += Math.ceil(Math.abs(constrainedDelta.lng) / 360) * 360;
  }
  if (eastEdge + constrainedDelta.lng >= LNG_MAX) {
    constrainedDelta.lng -= Math.ceil(Math.abs(constrainedDelta.lng) / 360) * 360;
  }

  return constrainedDelta;
}

function moveFeatures(features, delta, modeInstance) {
  var constrainedDelta = constrainFeatureMovement(features.map(function (feature) { return feature.toGeoJSON(); }), delta);

  features.forEach(function (feature) {
    var currentCoordinates = feature.getCoordinates();

    var moveCoordinate = function (coord) {
      var point = {
        lng: coord[0] + constrainedDelta.lng,
        lat: coord[1] + constrainedDelta.lat
      };
      return [point.lng, point.lat];
    };
    var moveRing = function (ring) { return ring.map(function (coord) { return moveCoordinate(coord); }); };
    var moveMultiPolygon = function (multi) { return multi.map(function (ring) { return moveRing(ring); }); };

    var nextCoordinates;
    if (feature.type === geojsonTypes$1.POINT) {
      nextCoordinates = moveCoordinate(currentCoordinates);
    } else if (feature.type === geojsonTypes$1.LINE_STRING || feature.type === geojsonTypes$1.MULTI_POINT) {
      nextCoordinates = currentCoordinates.map(moveCoordinate);
    } else if (feature.type === geojsonTypes$1.POLYGON || feature.type === geojsonTypes$1.MULTI_LINE_STRING) {
      nextCoordinates = currentCoordinates.map(moveRing);
    } else if (feature.type === geojsonTypes$1.MULTI_POLYGON) {
      nextCoordinates = currentCoordinates.map(moveMultiPolygon);
    }

    feature.incomingCoords(nextCoordinates);
    // extend start
    modeInstance.afterRender(function (e) { return feature.move(e); });
    // extend end
  });
}

var SimpleSelect = {};

SimpleSelect.onSetup = function (opts) {
  var this$1$1 = this;

  // turn the opts into state.
  var state = {
    dragMoveLocation: null,
    boxSelectStartLocation: null,
    boxSelectElement: undefined,
    boxSelecting: false,
    canBoxSelect: false,
    dragMoving: false,
    canDragMove: false,
    initiallySelectedFeatureIds: opts.featureIds || [],
  };

  this.setSelected(state.initiallySelectedFeatureIds.filter(function (id) { return this$1$1.getFeature(id) !== undefined; }));
  this.fireActionable();

  this.setActionableState({
    combineFeatures: true,
    uncombineFeatures: true,
    trash: true,
  });

  // extend start
  return this.setState(state);
  // extend end
};

SimpleSelect.fireUpdate = function () {
  this.map.fire(events$1.UPDATE, {
    action: updateActions.MOVE,
    features: this.getSelected().map(function (f) { return f.toGeoJSON(); }),
  });
};

SimpleSelect.fireActionable = function () {
  var this$1$1 = this;

  var selectedFeatures = this.getSelected();

  var multiFeatures = selectedFeatures.filter(function (feature) { return this$1$1.isInstanceOf('MultiFeature', feature); });

  var combineFeatures = false;

  if (selectedFeatures.length > 1) {
    combineFeatures = true;
    var featureType = selectedFeatures[0].type.replace('Multi', '');
    selectedFeatures.forEach(function (feature) {
      if (feature.type.replace('Multi', '') !== featureType) {
        combineFeatures = false;
      }
    });
  }

  var uncombineFeatures = multiFeatures.length > 0;
  var trash = selectedFeatures.length > 0;

  this.setActionableState({
    combineFeatures: combineFeatures,
    uncombineFeatures: uncombineFeatures,
    trash: trash,
  });
};

SimpleSelect.getUniqueIds = function (allFeatures) {
  if (!allFeatures.length) { return []; }
  var ids = allFeatures
    .map(function (s) { return s.properties.id; })
    .filter(function (id) { return id !== undefined; })
    .reduce(function (memo, id) {
      memo.add(id);
      return memo;
    }, new StringSet());

  return ids.values();
};

SimpleSelect.stopExtendedInteractions = function (state) {
  if (state.boxSelectElement) {
    if (state.boxSelectElement.parentNode) { state.boxSelectElement.parentNode.removeChild(state.boxSelectElement); }
    state.boxSelectElement = null;
  }

  this.map.dragPan.enable();

  state.boxSelecting = false;
  state.canBoxSelect = false;
  state.dragMoving = false;
  state.canDragMove = false;
};

SimpleSelect.onStop = function () {
  doubleClickZoom.enable(this);
  this.destroy();
};

SimpleSelect.onMouseMove = function (state, e) {
  var isFeature$1 = isFeature(e);
  if (isFeature$1 && state.dragMoving) { this.fireUpdate(); }

  // On mousemove that is not a drag, stop extended interactions.
  // This is useful if you drag off the canvas, release the button,
  // then move the mouse back over the canvas --- we don't allow the
  // interaction to continue then, but we do let it continue if you held
  // the mouse button that whole time
  this.stopExtendedInteractions(state);

  // Skip render
  return true;
};

SimpleSelect.onMouseOut = function (state) {
  // As soon as you mouse leaves the canvas, update the feature
  if (state.dragMoving) { return this.fireUpdate(); }

  // Skip render
  return true;
};

SimpleSelect.onTap = SimpleSelect.onClick = function (state, e) {
  // Click (with or without shift) on no feature
  // extend start
  if (isStopPropagationClickActiveFeature(this._ctx, e)) { return; }
  var selectedFeatures = this.getSelected();
  // extend end
  if (noTarget(e)) {
    // extend start
    if (selectedFeatures.length) { this.redoUndo.reset(); }
    mapFireClickOrOnTab(this, { e: e, type: 'clickNoTarget' });
    if (isClickNotthingNoChangeMode(this._ctx, e)) { return; }
    // extend end
    return this.clickAnywhere(state, e); // also tap
  }
  if (isOfMetaType(meta.VERTEX)(e)) { return this.clickOnVertex(state, e); } //tap
  if (isFeature(e)) {
    if ((selectedFeatures.length === 1 && selectedFeatures[0].id !== e.featureTarget.properties.id) || selectedFeatures.length) {
      this.redoUndo.reset();
    }

    return this.clickOnFeature(state, e);
  }
};

SimpleSelect.clickAnywhere = function (state) {
  var this$1$1 = this;

  // Clear the re-render selection
  var wasSelected = this.getSelectedIds();
  if (wasSelected.length) {
    this.clearSelectedFeatures();
    wasSelected.forEach(function (id) { return this$1$1.doRender(id); });
  }
  doubleClickZoom.enable(this);
  this.stopExtendedInteractions(state);
};

SimpleSelect.clickOnVertex = function (state, e) {
  var this$1$1 = this;

  // Enter direct select mode
  this.changeMode(modes$1.DIRECT_SELECT, {
    featureId: e.featureTarget.properties.parent,
    coordPath: e.featureTarget.properties.coord_path,
    startPos: e.lngLat,
  });
  // extend start
  this.afterRender(function () { return mapFireByClickOnVertex(this$1$1, { e: e }); });
  // extend end
  this.updateUIClasses({ mouse: cursors.MOVE });
};

SimpleSelect.startOnActiveFeature = function (state, e) {
  // Stop any already-underway extended interactions
  this.stopExtendedInteractions(state);

  // Disable map.dragPan immediately so it can't start
  this.map.dragPan.disable();

  // Re-render it and enable drag move
  this.doRender(e.featureTarget.properties.id);

  // Set up the state for drag moving
  state.canDragMove = true;
  state.dragMoveLocation = e.lngLat;
};

SimpleSelect.clickOnFeature = function (state, e) {
  var this$1$1 = this;

  // Stop everything
  doubleClickZoom.disable(this);
  this.stopExtendedInteractions(state);

  var isShiftClick = isShiftDown(e);
  var selectedFeatureIds = this.getSelectedIds();
  var featureId = e.featureTarget.properties.id;
  var isFeatureSelected = this.isSelected(featureId);

  // Click (without shift) on any selected feature but a point
  if (!isShiftClick && isFeatureSelected && this.getFeature(featureId).type !== geojsonTypes$1.POINT) {
    // Enter direct select mode
    return this.changeMode(modes$1.DIRECT_SELECT, {
      featureId: featureId,
    });
  }

  // Shift-click on a selected feature
  if (isFeatureSelected && isShiftClick) {
    // Deselect it
    this.deselect(featureId);
    this.updateUIClasses({ mouse: cursors.POINTER });
    if (selectedFeatureIds.length === 1) {
      doubleClickZoom.enable(this);
    }
    // Shift-click on an unselected feature
  } else if (!isFeatureSelected && isShiftClick) {
    // Add it to the selection
    this.select(featureId);
    this.updateUIClasses({ mouse: cursors.MOVE });
    // Click (without shift) on an unselected feature
  } else if (!isFeatureSelected && !isShiftClick) {
    // Make it the only selected feature
    selectedFeatureIds.forEach(function (id) { return this$1$1.doRender(id); });
    this.setSelected(featureId);
    this.updateUIClasses({ mouse: cursors.MOVE });
  }

  // No matter what, re-render the clicked feature
  this.doRender(featureId);
};

SimpleSelect.onMouseDown = function (state, e) {
  if (isActiveFeature(e)) { return this.startOnActiveFeature(state, e); }
  if (this.drawConfig.boxSelect && isShiftMousedown(e)) { return this.startBoxSelect(state, e); }
};

SimpleSelect.startBoxSelect = function (state, e) {
  this.stopExtendedInteractions(state);
  this.map.dragPan.disable();
  // Enable box select
  state.boxSelectStartLocation = mouseEventPoint(e.originalEvent, this.map.getContainer());
  state.canBoxSelect = true;
};

SimpleSelect.onTouchStart = function (state, e) {
  if (isActiveFeature(e)) { return this.startOnActiveFeature(state, e); }
};

SimpleSelect.onDrag = function (state, e) {
  // extend start
  if (isDisabledDragVertexWithSimpleSelectMode(this._ctx)) { return; }
  // extend end
  if (state.canDragMove) { return this.dragMove(state, e); }
  if (this.drawConfig.boxSelect && state.canBoxSelect) { return this.whileBoxSelect(state, e); }
};

SimpleSelect.whileBoxSelect = function (state, e) {
  state.boxSelecting = true;
  this.updateUIClasses({ mouse: cursors.ADD });

  // Create the box node if it doesn't exist
  if (!state.boxSelectElement) {
    state.boxSelectElement = document.createElement('div');
    state.boxSelectElement.classList.add(classes.BOX_SELECT);
    this.map.getContainer().appendChild(state.boxSelectElement);
  }

  // Adjust the box node's width and xy position
  var current = mouseEventPoint(e.originalEvent, this.map.getContainer());
  var minX = Math.min(state.boxSelectStartLocation.x, current.x);
  var maxX = Math.max(state.boxSelectStartLocation.x, current.x);
  var minY = Math.min(state.boxSelectStartLocation.y, current.y);
  var maxY = Math.max(state.boxSelectStartLocation.y, current.y);
  var translateValue = "translate(" + minX + "px, " + minY + "px)";
  state.boxSelectElement.style.transform = translateValue;
  state.boxSelectElement.style.WebkitTransform = translateValue;
  state.boxSelectElement.style.width = (maxX - minX) + "px";
  state.boxSelectElement.style.height = (maxY - minY) + "px";
};

SimpleSelect.dragMove = function (state, e) {
  // extend start
  if (state.dragMoving === false) { this._reodUndoAdd({ dragMoveLocation: state.dragMoveLocation }); }
  // extend end
  // Dragging when drag move is enabled
  state.dragMoving = true;
  e.originalEvent.stopPropagation();

  var delta = {
    lng: e.lngLat.lng - state.dragMoveLocation.lng,
    lat: e.lngLat.lat - state.dragMoveLocation.lat,
  };

  moveFeatures(this.getSelected(), delta, this);

  state.dragMoveLocation = e.lngLat;
};

SimpleSelect.onTouchEnd = SimpleSelect.onMouseUp = function (state, e) {
  var this$1$1 = this;

  // End any extended interactions
  if (state.dragMoving) {
    this.fireUpdate();
  } else if (state.boxSelecting) {
    var bbox = [state.boxSelectStartLocation, mouseEventPoint(e.originalEvent, this.map.getContainer())];
    var featuresInBox = this.featuresAt(null, bbox, 'click');
    var idsToSelect = this.getUniqueIds(featuresInBox).filter(function (id) { return !this$1$1.isSelected(id); });

    if (idsToSelect.length) {
      this.select(idsToSelect);
      idsToSelect.forEach(function (id) { return this$1$1.doRender(id); });
      this.updateUIClasses({ mouse: cursors.MOVE });
    }
  }
  this.stopExtendedInteractions(state);
};

SimpleSelect.toDisplayFeatures = function (state, geojson, display) {
  geojson.properties.active = this.isSelected(geojson.properties.id) ? activeStates.ACTIVE : activeStates.INACTIVE;
  display(geojson);
  this.fireActionable();
  if (geojson.properties.active !== activeStates.ACTIVE || geojson.geometry.type === geojsonTypes$1.POINT) { return; }
  createSupplementaryPoints(geojson, undefined, undefined, modes$1.SIMPLE_SELECT).forEach(display);
};

SimpleSelect.onTrash = function () {
  this.deleteFeature(this.getSelectedIds());
  this.fireActionable();
};

SimpleSelect.onCombineFeatures = function () {
  var selectedFeatures = this.getSelected();

  if (selectedFeatures.length === 0 || selectedFeatures.length < 2) { return; }

  var coordinates = [],
    featuresCombined = [];
  var featureType = selectedFeatures[0].type.replace('Multi', '');

  for (var i = 0; i < selectedFeatures.length; i++) {
    var feature = selectedFeatures[i];

    if (feature.type.replace('Multi', '') !== featureType) {
      return;
    }
    if (feature.type.includes('Multi')) {
      feature.getCoordinates().forEach(function (subcoords) {
        coordinates.push(subcoords);
      });
    } else {
      coordinates.push(feature.getCoordinates());
    }

    featuresCombined.push(feature.toGeoJSON());
  }

  if (featuresCombined.length > 1) {
    var multiFeature = this.newFeature({
      type: geojsonTypes$1.FEATURE,
      properties: featuresCombined[0].properties,
      geometry: {
        type: ("Multi" + featureType),
        coordinates: coordinates,
      },
    });

    this.addFeature(multiFeature);
    this.deleteFeature(this.getSelectedIds(), { silent: true });
    this.setSelected([multiFeature.id]);

    this.map.fire(events$1.COMBINE_FEATURES, {
      createdFeatures: [multiFeature.toGeoJSON()],
      deletedFeatures: featuresCombined,
    });
  }
  this.fireActionable();
};

SimpleSelect.onUncombineFeatures = function () {
  var this$1$1 = this;

  var selectedFeatures = this.getSelected();
  if (selectedFeatures.length === 0) { return; }

  var createdFeatures = [];
  var featuresUncombined = [];

  var loop = function ( i ) {
    var feature = selectedFeatures[i];

    if (this$1$1.isInstanceOf('MultiFeature', feature)) {
      feature.getFeatures().forEach(function (subFeature) {
        this$1$1.addFeature(subFeature);
        subFeature.properties = feature.properties;
        createdFeatures.push(subFeature.toGeoJSON());
        this$1$1.select([subFeature.id]);
      });
      this$1$1.deleteFeature(feature.id, { silent: true });
      featuresUncombined.push(feature.toGeoJSON());
    }
  };

  for (var i = 0; i < selectedFeatures.length; i++) loop( i );

  if (createdFeatures.length > 1) {
    this.map.fire(events$1.UNCOMBINE_FEATURES, {
      createdFeatures: createdFeatures,
      deletedFeatures: featuresUncombined,
    });
  }
  this.fireActionable();
};
// extend start
SimpleSelect._reodUndoAdd = function (item) {
  var this$1$1 = this;

  this.redoUndo.undoStack.push(JSON.parse(JSON.stringify(item)));
  this.afterRender(function () { return this$1$1.redoUndo.fireChange({ type: 'add' }); });
};
SimpleSelect._redoOrUndo = function (type) {
  var this$1$1 = this;

  if (!type) { return; }
  var item = this.redoUndo[(type + "Stack")].pop();
  if (item) {
    var state = this.getState();
    var stack = JSON.parse(JSON.stringify({ dragMoveLocation: state.dragMoveLocation }));
    this.redoUndo[type === 'undo' ? 'redoStack' : 'undoStack'].push(stack);
    var delta = {
      lng: item.dragMoveLocation.lng - state.dragMoveLocation.lng,
      lat: item.dragMoveLocation.lat - state.dragMoveLocation.lat,
    };
    state.dragMoveLocation = item.dragMoveLocation;
    var features = this.getSelected();
    moveFeatures(features, delta, this);
    features.forEach(function (feature) { return feature.execMeasure(); });
    this.afterRender(function () { return this$1$1.redoUndo.fireChange({ type: type }); });
    this._ctx.store.render();
  }
};

SimpleSelect.undo = function () {
  this._redoOrUndo('undo');
};

SimpleSelect.redo = function () {
  this._redoOrUndo('redo');
};

var isVertex = isOfMetaType(meta.VERTEX);
var isMidpoint = isOfMetaType(meta.MIDPOINT);

var DirectSelect = {};

// INTERNAL FUCNTIONS

DirectSelect.fireUpdate = function () {
  this.map.fire(events$1.UPDATE, {
    action: updateActions.CHANGE_COORDINATES,
    features: this.getSelected().map(function (f) { return f.toGeoJSON(); }),
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
  if (!isDisabledMovePolgon(this._ctx, state)) { state.canDragMove = true; }
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
  var this$1$1 = this;

  this.startDragging(state, e);
  var about = e.featureTarget.properties;
  var selectedIndex = state.selectedCoordPaths.indexOf(about.coord_path);
  if (!isShiftDown(e) && selectedIndex === -1) {
    state.selectedCoordPaths = [about.coord_path];
  } else if (isShiftDown(e) && selectedIndex === -1) {
    state.selectedCoordPaths.push(about.coord_path);
  }
  var selectedCoordinates = this.pathsToCoordinates(state.featureId, state.selectedCoordPaths);
  this.setSelectedCoordinates(selectedCoordinates);
  // extend start
  this.afterRender(function () { return mapFireByClickOnVertex(this$1$1, { e: e }); });
  // extend end
};

DirectSelect.onMidpoint = function (state, e) {
  var this$1$1 = this;

  this.startDragging(state, e);
  var about = e.featureTarget.properties;
  // extend start
  this.afterRender(function () { return mapFireByOnMidpoint(this$1$1, { e: e }); });
  this._reodUndoAdd({ selectedCoordPaths: state.selectedCoordPaths });
  // extend end
  state.feature.addCoordinate(about.coord_path, about.lng, about.lat);
  this.fireUpdate();
  state.selectedCoordPaths = [about.coord_path];
};

DirectSelect.pathsToCoordinates = function (featureId, paths) {
  return paths.map(function (coord_path) { return ({ feature_id: featureId, coord_path: coord_path }); });
};

DirectSelect.onFeature = function (state, e) {
  if (state.selectedCoordPaths.length === 0) { this.startDragging(state, e); }
  else { this.stopDragging(state); }
};

DirectSelect.dragFeature = function (state, e, delta) {
  moveFeatures(this.getSelected(), delta, this);
  state.dragMoveLocation = e.lngLat;
};

DirectSelect.dragVertex = function (state, e, delta) {
  var this$1$1 = this;

  if (isDisabledDragVertexWithTwoFingersZoom(this._ctx, e)) { return; }
  var selectedCoords = state.selectedCoordPaths.map(function (coord_path) { return state.feature.getCoordinate(coord_path); });
  var selectedCoordPoints = selectedCoords.map(function (coords) { return ({
    type: geojsonTypes$1.FEATURE,
    properties: {},
    geometry: {
      type: geojsonTypes$1.POINT,
      coordinates: coords,
    },
  }); });

  var constrainedDelta = constrainFeatureMovement(selectedCoordPoints, delta);
  for (var i = 0; i < selectedCoords.length; i++) {
    var coord = selectedCoords[i];
    state.feature.updateCoordinate(state.selectedCoordPaths[i], coord[0] + constrainedDelta.lng, coord[1] + constrainedDelta.lat);
  }
  // extend start
  e.state = state;
  this.afterRender(function () { return mapFireByDragVertex(this$1$1, { e: e }); });
  // extend end
};

DirectSelect.clickNoTarget = function () {
  this.changeMode(modes$1.SIMPLE_SELECT);
};

DirectSelect.clickInactive = function () {
  this.changeMode(modes$1.SIMPLE_SELECT);
};

DirectSelect.clickActiveFeature = function (state) {
  state.selectedCoordPaths = [];
  this.clearSelectedCoordinates();
  state.feature.changed();
};

// EXTERNAL FUNCTIONS

DirectSelect.onSetup = function (opts) {
  var featureId = opts.featureId;
  var feature = this.getFeature(featureId);

  if (!feature) {
    throw new Error('You must provide a featureId to enter direct_select mode');
  }

  if (feature.type === geojsonTypes$1.POINT) {
    throw new TypeError("direct_select mode doesn't handle point features");
  }

  var state = {
    featureId: featureId,
    feature: feature,
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
    geojson.properties.active = activeStates.ACTIVE;
    push(geojson);
    createSupplementaryPoints(
      geojson,
      {
        map: this.map,
        midpoints: true,
        selectedPaths: state.selectedCoordPaths,
      },
      undefined,
      modes$1.DIRECT_SELECT
    ).forEach(push);
  } else {
    geojson.properties.active = activeStates.INACTIVE;
    push(geojson);
  }
  this.fireActionable(state);
};

DirectSelect.onTrash = function (state) {
  // Uses number-aware sorting to make sure '9' < '10'. Comparison is reversed because we want them
  // in reverse order so that we can remove by index safely.
  state.selectedCoordPaths.sort(function (a, b) { return b.localeCompare(a, 'en', { numeric: true }); }).forEach(function (id) { return state.feature.removeCoordinate(id); });
  this.fireUpdate();
  state.selectedCoordPaths = [];
  this.clearSelectedCoordinates();
  this.fireActionable(state);
  if (state.feature.isValid() === false) {
    this.deleteFeature([state.featureId]);
    this.changeMode(modes$1.SIMPLE_SELECT, {});
  }
};

DirectSelect.onMouseMove = function (state, e) {
  // On mousemove that is not a drag, stop vertex movement.
  var isFeature = isActiveFeature(e);
  var onVertex = isVertex(e);
  var isMidPoint = isMidpoint(e);
  var noCoords = state.selectedCoordPaths.length === 0;
  if (isFeature && noCoords) { this.updateUIClasses({ mouse: cursors.MOVE }); }
  else if (onVertex && !noCoords) { this.updateUIClasses({ mouse: cursors.MOVE }); }
  else { this.updateUIClasses({ mouse: cursors.NONE }); }

  var isDraggableItem = onVertex || isFeature || isMidPoint;
  if (isDraggableItem && state.dragMoving) { this.fireUpdate(); }

  this.stopDragging(state);

  // Skip render
  return true;
};

DirectSelect.onMouseOut = function (state) {
  // As soon as you mouse leaves the canvas, update the feature
  if (state.dragMoving) { this.fireUpdate(); }
  // Skip render
  return true;
};

DirectSelect.onTouchStart = DirectSelect.onMouseDown = function (state, e) {
  if (isVertex(e)) { return this.onVertex(state, e); }
  if (isActiveFeature(e)) { return this.onFeature(state, e); }
  if (isMidpoint(e)) { return this.onMidpoint(state, e); }
};

DirectSelect.onDrag = function (state, e) {
  var this$1$1 = this;

  if (state.canDragMove !== true) { return; }
  // extend start
  if (state.dragMoving === false) { this._reodUndoAdd({ selectedCoordPaths: state.selectedCoordPaths }); }
  // extend end
  state.dragMoving = true;
  e.originalEvent.stopPropagation();
  var type = 'null';

  var delta = {
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
  this.afterRender(function () { return mapFireDrag(this$1$1, { e: e, type: type }); });
  // extend end
};

DirectSelect.onClick = function (state, e) {
  var this$1$1 = this;

  // extend start
  if (isStopPropagationClickActiveFeature(this._ctx, e)) { return; }
  // extend end
  if (noTarget(e)) {
    // extend start
    this.redoUndo.reset();
    this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'clickNoTarget' }); });
    if (isClickNotthingNoChangeMode(this._ctx, e)) {
      return;
    }
    // extend end
    return this.clickNoTarget(state, e);
  }
  if (isActiveFeature(e)) {
    // extend start
    this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'clickActiveFeature' }); });
    // extend end
    return this.clickActiveFeature(state, e);
  }
  if (isInactiveFeature(e)) {
    // extend start
    this.redoUndo.reset();
    this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'clickInactiveFeature' }); });
    // extend end
    return this.clickInactive(state, e);
  }

  this.stopDragging(state);
  // extend start
  this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'null' }); });
  // extend end
};

DirectSelect.onTap = function (state, e) {
  var this$1$1 = this;

  if (isStopPropagationClickActiveFeature(this._ctx, e)) { return; }
  if (noTarget(e)) {
    // extend start
    this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'clickNoTarget' }); });
    if (isClickNotthingNoChangeMode(this._ctx, e)) {
      return; //this.clickActiveFeature(state, e);
    }
    // extend end
    return this.clickNoTarget(state, e);
  }
  if (isActiveFeature(e)) {
    // extend start
    this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'clickActiveFeature' }); });
    // extend end
    return this.clickActiveFeature(state, e);
  }
  if (isInactiveFeature(e)) {
    // extend start
    this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'clickInactiveFeature' }); });
    // extend end
    return this.clickInactive(state, e);
  }
  // extend start
  this.afterRender(function () { return mapFireClickOrOnTab(this$1$1, { e: e, type: 'null' }); });
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
  var stack = JSON.parse(JSON.stringify(Object.assign({}, item, {coordinates: this.getState().feature.getCoordinates()})));
  this.redoUndo.undoStack.push(stack);
  this.redoUndo.fireChange({ type: 'add' });
  console.log('undoStack', this.redoUndo.undoStack);
};

DirectSelect._redoOrUndo = function (type) {
  var this$1$1 = this;

  if (!type) { return; }
  var item = this.redoUndo[(type + "Stack")].pop();
  if (item) {
    var state = this.getState();
    this.redoUndo[type === 'undo' ? 'redoStack' : 'undoStack'].push({
      coordinates: state.feature.getCoordinates(),
      selectedCoordPaths: state.selectedCoordPaths,
    });
    if (state.selectedCoordPaths) { state.selectedCoordPaths = item.selectedCoordPaths; }
    state.feature.setCoordinates(item.coordinates);
    state.feature.execMeasure();
    this._ctx.store.render();
    this.afterRender(function () { return this$1$1.redoUndo.fireChange({ type: type }); });
  }
};

DirectSelect.undo = function () {
  this._redoOrUndo('undo');
};

DirectSelect.redo = function () {
  this._redoOrUndo('redo');
};

var DrawPoint = {};

DrawPoint.onSetup = function () {
  var point = this.newFeature(
    {
      type: geojsonTypes$1.FEATURE,
      properties: {},
      geometry: {
        type: geojsonTypes$1.POINT,
        coordinates: [],
      },
    },
    { declareFeature: true }
  );

  this.addFeature(point);

  this.clearSelectedFeatures();
  this.updateUIClasses({ mouse: cursors.ADD });
  this.activateUIButton(types$1.POINT);

  this.setActionableState({
    trash: true,
  });

  // extend start
  return this.setState({ point: point });
  // extend end
};

DrawPoint.stopDrawingAndRemove = function (state) {
  this.deleteFeature([state.point.id], { silent: true });
  this.changeMode(modes$1.SIMPLE_SELECT);
};

DrawPoint.onTap = DrawPoint.onClick = function (state, e) {
  var this$1$1 = this;

  this.updateUIClasses({ mouse: cursors.MOVE });
  state.point.updateCoordinate('', e.lngLat.lng, e.lngLat.lat);
  // extend start
  this.afterRender(function () { return mapFireAddPoint(this$1$1, { e: e }); });
  // extend end
  this.map.fire(events$1.CREATE, {
    features: [state.point.toGeoJSON()],
  });
  this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.point.id] });
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
  var isActivePoint = geojson.properties.id === state.point.id;
  geojson.properties.active = isActivePoint ? activeStates.ACTIVE : activeStates.INACTIVE;
  if (!isActivePoint) { return display(geojson); }
};

DrawPoint.onTrash = DrawPoint.stopDrawingAndRemove;

DrawPoint.onKeyUp = function (state, e) {
  if (isEscapeKey(e) || isEnterKey(e)) {
    return this.stopDrawingAndRemove(state, e);
  }
};

DrawPoint.drawByCoordinate = function (coord) {
  this.onClick(this.getState(), { lngLat: { lng: coord[0], lat: coord[1] } });
};

function isEventAtCoordinates(event, coordinates) {
  if (!event.lngLat) { return false; }
  return event.lngLat.lng === coordinates[0] && event.lngLat.lat === coordinates[1];
}

var DrawPolygon = {};

DrawPolygon.onSetup = function (opt) {
  if ( opt === void 0 ) opt = {};

  var polygon = this.newFeature(
    {
      type: geojsonTypes$1.FEATURE,
      properties: {},
      geometry: {
        type: geojsonTypes$1.POLYGON,
        coordinates: [[]],
      },
    },
    { declareFeature: true }
  );

  this.addFeature(polygon);
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  this.updateUIClasses({ mouse: cursors.ADD });
  this.activateUIButton(opt.button || types$1.POLYGON);
  this.setActionableState({ trash: true });

  // extend start
  return this.setState({ polygon: polygon, currentVertexPosition: 0 });
  // extend end
};

DrawPolygon.clickAnywhere = function (state, e) {
  var this$1$1 = this;

  if (state.currentVertexPosition > 0 && isEventAtCoordinates(e, state.polygon.coordinates[0][state.currentVertexPosition - 1])) {
    // extend start
    if (isIgnoreClickOnVertexWithCtx(this._ctx)) { return; }
    // extend end
    return this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
  }

  this.updateUIClasses({ mouse: cursors.ADD });
  state.polygon.updateCoordinate(("0." + (state.currentVertexPosition)), e.lngLat.lng, e.lngLat.lat);
  state.currentVertexPosition++;
  state.polygon.updateCoordinate(("0." + (state.currentVertexPosition)), e.lngLat.lng, e.lngLat.lat);
  // extend start
  this.afterRender(function () { return mapFireAddPoint(this$1$1, { e: e }); });
  // extend end
};

DrawPolygon.clickOnVertex = function (state, cb) {
  // extend start
  if (isDisabledClickOnVertexWithCtx(this._ctx)) { return; }
  if (typeof cb === 'function') { return cb(); }
  // extend end
  return this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
};

DrawPolygon.onMouseMove = function (state, e) {
  state.polygon.updateCoordinate(("0." + (state.currentVertexPosition)), e.lngLat.lng, e.lngLat.lat);
  if (isVertex$1(e)) {
    this.updateUIClasses({ mouse: cursors.POINTER });
  }
};

DrawPolygon.onTap = DrawPolygon.onClick = function (state, e) {
  // extend start
  if (isIgnoreClickOnVertexWithCtx(this._ctx)) { return this.clickAnywhere(state, e); }
  // extend end
  if (isVertex$1(e)) { return this.clickOnVertex(state, e); }
  return this.clickAnywhere(state, e);
};

DrawPolygon.onKeyUp = function (state, e) {
  if (isEscapeKey(e)) {
    this.deleteFeature([state.polygon.id], { silent: true });
    this.changeMode(modes$1.SIMPLE_SELECT);
  } else if (isEnterKey(e)) {
    this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
  }
};

DrawPolygon.onStop = function (state, cb) {
  this.updateUIClasses({ mouse: cursors.NONE });
  doubleClickZoom.enable(this);
  this.activateUIButton();
  this.destroy();

  // check to see if we've deleted this feature
  if (this.getFeature(state.polygon.id) === undefined) { return; }
  //remove last added coordinate

  state.polygon.removeCoordinate(("0." + (state.currentVertexPosition)));
  if (typeof cb === 'function') { return cb(state); }
  if (state.polygon.isValid()) {
    this.map.fire(events$1.CREATE, { features: [state.polygon.toGeoJSON()] });
  } else {
    this.deleteFeature([state.polygon.id], { silent: true });
    // this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

DrawPolygon.toDisplayFeatures = function (state, geojson, display) {
  var isActivePolygon = geojson.properties.id === state.polygon.id;
  geojson.properties.active = isActivePolygon ? activeStates.ACTIVE : activeStates.INACTIVE;
  if (!isActivePolygon) { return display(geojson); }

  // Don't render a polygon until it has two positions
  // (and a 3rd which is just the first repeated)
  if (geojson.geometry.coordinates.length === 0) { return; }

  var coordinateCount = geojson.geometry.coordinates[0].length;
  // 2 coordinates after selecting a draw type
  // 3 after creating the first point
  if (coordinateCount < 3) {
    return;
  }
  geojson.properties.meta = meta.FEATURE;
  display(createVertex(state.polygon.id, geojson.geometry.coordinates[0][0], '0.0', false, undefined, modes$1.DRAW_POLYGON));
  if (coordinateCount > 3) {
    // Add a start position marker to the map, clicking on this will finish the feature
    // This should only be shown when we're in a valid spot
    var endPos = geojson.geometry.coordinates[0].length - 3;
    // extend start
    if (endPos > 0) {
      geojson.geometry.coordinates[0].slice(1, endPos).forEach(function (coordinate, index) {
        display(createVertex(state.polygon.id, coordinate, ("0." + (index + 1)), false, false, modes$1.DRAW_POLYGON));
      });
    }
    // extend end
    display(
      createVertex(state.polygon.id, geojson.geometry.coordinates[0][endPos], ("0." + endPos), false, true, modes$1.DRAW_POLYGON)
    );
    // extend start
    display(
      createLastOrSecondToLastPoint(
        state.polygon.id,
        geojson.geometry.coordinates[0][endPos],
        ("0." + endPos),
        false,
        false,
        modes$1.DRAW_POLYGON
      )
    );
    display(
      createLastOrSecondToLastPoint(
        state.polygon.id,
        geojson.geometry.coordinates[0][endPos],
        ("0." + (endPos + 1)),
        false,
        true,
        modes$1.DRAW_POLYGON
      )
    );
    // extend end
  }
  if (coordinateCount <= 4) {
    // If we've only drawn two positions (plus the closer),
    // make a LineString instead of a Polygon
    var lineCoordinates = [
      [geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]],
      [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]] ];
    // create an initial vertex so that we can track the first point on mobile devices
    display({
      type: geojsonTypes$1.FEATURE,
      properties: geojson.properties,
      geometry: {
        coordinates: lineCoordinates,
        type: geojsonTypes$1.LINE_STRING,
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
  this.changeMode(modes$1.SIMPLE_SELECT);
};

DrawPolygon.drawByCoordinate = function (coord) {
  var this$1$1 = this;

  var state = this.getState();
  state.polygon.addCoordinate(("0." + (state.currentVertexPosition++)), coord[0], coord[1]);
  this.afterRender(function () { return mapFireAddPoint(this$1$1); }, true);
};

var DrawLineString = {};

DrawLineString.onSetup = function (opts) {
  opts = opts || {};
  var featureId = opts.featureId;

  var line, currentVertexPosition;
  var direction = 'forward';
  if (featureId) {
    line = this.getFeature(featureId);
    if (!line) {
      throw new Error('Could not find a feature with the provided featureId');
    }
    var from = opts.from;
    if (from && from.type === 'Feature' && from.geometry && from.geometry.type === 'Point') {
      from = from.geometry;
    }
    if (from && from.type === 'Point' && from.coordinates && from.coordinates.length === 2) {
      from = from.coordinates;
    }
    if (!from || !Array.isArray(from)) {
      throw new Error('Please use the `from` property to indicate which point to continue the line from');
    }
    var lastCoord = line.coordinates.length - 1;
    if (line.coordinates[lastCoord][0] === from[0] && line.coordinates[lastCoord][1] === from[1]) {
      currentVertexPosition = lastCoord + 1;
      // add one new coordinate to continue from
      line.addCoordinate.apply(line, [ currentVertexPosition ].concat( line.coordinates[lastCoord] ));
    } else if (line.coordinates[0][0] === from[0] && line.coordinates[0][1] === from[1]) {
      direction = 'backwards';
      currentVertexPosition = 0;
      // add one new coordinate to continue from
      line.addCoordinate.apply(line, [ currentVertexPosition ].concat( line.coordinates[0] ));
    } else {
      throw new Error('`from` should match the point at either the start or the end of the provided LineString');
    }
  } else {
    line = this.newFeature(
      {
        type: geojsonTypes$1.FEATURE,
        properties: {},
        geometry: {
          type: geojsonTypes$1.LINE_STRING,
          coordinates: [],
        },
      },
      { declareFeature: true }
    );
    currentVertexPosition = 0;
    this.addFeature(line);
  }
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  this.updateUIClasses({ mouse: cursors.ADD });
  this.activateUIButton(opts.button || types$1.LINE);
  this.setActionableState({
    trash: true,
  });
  // extend start
  return this.setState({ line: line, currentVertexPosition: currentVertexPosition, direction: direction });
  // extend end
};

DrawLineString.clickAnywhere = function (state, e) {
  var this$1$1 = this;

  if (
    (state.currentVertexPosition > 0 && isEventAtCoordinates(e, state.line.coordinates[state.currentVertexPosition - 1])) ||
    (state.direction === 'backwards' && isEventAtCoordinates(e, state.line.coordinates[state.currentVertexPosition + 1]))
  ) {
    // extend start
    if (isIgnoreClickOnVertexWithCtx(this._ctx)) { return; }
    // extend end
    return this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.line.id] });
  }
  this.updateUIClasses({ mouse: cursors.ADD });
  state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  if (state.direction === 'forward') {
    state.currentVertexPosition++;
    state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  } else {
    state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
  }
  // extend start
  this.afterRender(function () { return mapFireAddPoint(this$1$1, { e: e }); });
  // extend end
};

DrawLineString.clickOnVertex = function (state, cb) {
  // extend start
  if (isDisabledClickOnVertexWithCtx(this._ctx)) { return; }
  if (typeof cb === 'function') { return cb(); }
  // extend end
  return this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.line.id] });
};

DrawLineString.onMouseMove = function (state, e) {
  state.line.updateCoordinate(state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
  if (isVertex$1(e)) {
    this.updateUIClasses({ mouse: cursors.POINTER });
  }
};

DrawLineString.onTap = DrawLineString.onClick = function (state, e) {
  // extend start
  if (isIgnoreClickOnVertexWithCtx(this._ctx)) { return this.clickAnywhere(state, e); }
  // extend end
  if (isVertex$1(e)) { return this.clickOnVertex(state, e); }
  this.clickAnywhere(state, e);
};

DrawLineString.onKeyUp = function (state, e) {
  if (isEnterKey(e)) {
    this.changeMode(modes$1.SIMPLE_SELECT, { featureIds: [state.line.id] });
  } else if (isEscapeKey(e)) {
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode(modes$1.SIMPLE_SELECT);
  }
};

DrawLineString.onStop = function (state, cb) {
  doubleClickZoom.enable(this);
  this.activateUIButton();
  this.destroy();

  // check to see if we've deleted this feature
  if (this.getFeature(state.line.id) === undefined) { return; }
  //remove last added coordinate
  state.line.removeCoordinate(("" + (state.currentVertexPosition)));
  if (typeof cb === 'function') { return cb(); }
  if (state.line.isValid()) {
    this.map.fire(events$1.CREATE, {
      features: [state.line.toGeoJSON()],
    });
  } else {
    this.deleteFeature([state.line.id], { silent: true });
    // this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

DrawLineString.onTrash = function (state) {
  this.deleteFeature([state.line.id], { silent: true });
  this.changeMode(modes$1.SIMPLE_SELECT);
};

DrawLineString.toDisplayFeatures = function (state, geojson, display) {
  var isActiveLine = geojson.properties.id === state.line.id;
  geojson.properties.active = isActiveLine ? activeStates.ACTIVE : activeStates.INACTIVE;
  if (!isActiveLine) { return display(geojson); }
  // Only render the line if it has at least one real coordinate
  if (geojson.geometry.coordinates.length < 2) { return; }
  geojson.properties.meta = meta.FEATURE;
  // extend start
  geojson.geometry.coordinates.forEach(function (coordinate, index) {
    var i = "" + (index + 1);
    if (index === geojson.geometry.coordinates.length - 1) {
      display(createLastOrSecondToLastPoint(state.line.id, coordinate, i, false, true, modes$1.DRAW_LINE_STRING));
    } else {
      var secondLast = index === geojson.geometry.coordinates.length - 2;
      if (secondLast) {
        display(createLastOrSecondToLastPoint(state.line.id, coordinate, i, false, false, modes$1.DRAW_LINE_STRING));
      }
      display(createVertex(state.line.id, coordinate, i, false, secondLast, modes$1.DRAW_LINE_STRING));
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
  var this$1$1 = this;

  var state = this.getState();
  state.line.addCoordinate(state.currentVertexPosition++, coord[0], coord[1]);
  this.afterRender(function () { return mapFireAddPoint(this$1$1); }, true);
};

var polyTypes = [geojsonTypes$1.POLYGON, geojsonTypes$1.MULTI_POLYGON];

var lineTypes = [geojsonTypes$1.LINE_STRING, geojsonTypes$1.MULTI_LINE_STRING];

var geojsonTypes = polyTypes.concat( lineTypes);

var getCutDefaultOptions = function () { return ({
  featureIds: [],
  highlightColor: '#73d13d',
  continuous: true,
  bufferOptions: {
    width: 0,
  },
}); };

var highlightFieldName = 'wait-cut';

var Cut = {
  _styles: ['inactive-fill-color', 'inactive-fill-outline-color', 'inactive-line-color'],
};

Cut._execMeasure = function (feature) {
  var api = this._ctx.api;
  if (feature && api.options.measureOptions) {
    feature.measure.setOptions(api.options.measureOptions);
    feature.execMeasure();
  }
};

Cut._continuous = function (cb) {
  if (this._options.continuous) {
    if (cb) { cb(); }

    this._updateFeatures();
  }
};

Cut._updateFeatures = function () {
  this._features = this._ctx.store
    .getAll()
    .filter(function (f) { return f.getProperty(highlightFieldName); })
    .map(function (f) { return f.toGeoJSON(); });
};

Cut._cancelCut = function () {
  if (this._features.length) {
    this._batchHighlight(this._features);
    this._features = [];
  }
};

Cut._setHighlight = function (id, color) {
  var api = this._ctx.api;
  this._styles.forEach(function (style) { return api.setFeatureProperty(id, style, color); });
  api.setFeatureProperty(id, highlightFieldName, color ? true : undefined);
};

Cut._batchHighlight = function (features, color) {
  var this$1$1 = this;

  if (features.length) { features.forEach(function (feature) { return this$1$1._setHighlight(feature.id, color); }); }
};

Cut._undoByLines = function (stack) {
  var this$1$1 = this;

  stack.lines.forEach(function (ref) {
    var cuted = ref.cuted;
    var line = ref.line;

    var ref$1 = cuted.features;
    var f = ref$1[0];
    var rest = ref$1.slice(1);
    var lineFeature = this$1$1.newFeature(line);
    rest.forEach(function (v) { return this$1$1.deleteFeature(v.id); });
    this$1$1._ctx.store.get(f.id).measure.delete();
    lineFeature.id = f.id;
    this$1$1.addFeature(lineFeature);
    this$1$1._execMeasure(lineFeature);
    this$1$1._setHighlight(lineFeature.id, this$1$1._options.highlightColor);
  });
};

Cut.getWaitCutFeatures = function () {
  return JSON.parse(JSON.stringify(this._features));
};

Cut.onTrash = function (state) {
  this.originOnTrash(state);
  this._cancelCut();
};

Cut.onKeyUp = function (state, e) {
  this.originOnKeyUp(state, e);
  if (isEscapeKey(e)) { this._cancelCut(); }
};

function objectWithoutProperties$1 (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var originOnSetup$1 = DrawPolygon.onSetup;
var originOnMouseMove$1 = DrawPolygon.onMouseMove;
var originClickOnVertex$1 = DrawPolygon.clickOnVertex;
var originOnStop$1 = DrawPolygon.onStop;
var originOnTrash$1 = DrawPolygon.onTrash;
var originOnKeyUp$1 = DrawPolygon.onKeyUp;
var rest$1 = objectWithoutProperties$1( DrawPolygon, ["onSetup", "onMouseMove", "clickOnVertex", "onStop", "onTrash", "onKeyUp"] );
var restOriginMethods$1 = rest$1;

var CutPolygonMode = Object.assign({}, {originOnSetup: originOnSetup$1,
  originOnKeyUp: originOnKeyUp$1,
  originOnMouseMove: originOnMouseMove$1,
  originClickOnVertex: originClickOnVertex$1,
  originOnStop: originOnStop$1,
  originOnTrash: originOnTrash$1},
  restOriginMethods$1,
  Cut);

var defaultOptions$1 = Object.assign({}, getCutDefaultOptions(),
  {bufferOptions: {
    width: 0,
    // steps: 1,
    // unit: 'meters',
    // type: 'flat', // flat: 平头，round: 圆头，
  }});

CutPolygonMode.onSetup = function (opt) {
  var this$1$1 = this;

  var options = xtend(defaultOptions$1, opt);

  if (options.bufferOptions.width > 0 && !options.bufferOptions.unit) {
    throw new Error('Please provide a valid bufferWidthUnit');
  }

  var highlightColor = options.highlightColor;
  var featureIds = options.featureIds;

  var features = [];
  if (featureIds.length) {
    features = featureIds.map(function (id) { return this$1$1.getFeature(id).toGeoJSON(); });
  } else {
    features = this.getSelected().map(function (f) { return f.toGeoJSON(); });
  }

  features = features.filter(function (f) { return geojsonTypes.includes(f.geometry.type); });
  if (!features.length) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon or LineString or MultiLineString) to split!');
  }

  this._features = features;
  this._options = options;
  this._undoStack = [];
  this._redoStack = [];
  this._redoType = '';
  this._undoType = '';
  this._batchHighlight(features, highlightColor);
  var state = this.originOnSetup({ button: modes$1.CUT_POLYGON });
  window.state = state;
  window.p = this;
  return this.setState(state);
};

CutPolygonMode.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: cursors.ADD });
  this.originOnMouseMove(state, e);
};

CutPolygonMode.onStop = function (state) {
  var this$1$1 = this;

  var featureIds = this._features.map(function (v) { return v.id; });
  this.originOnStop(state, function () {
    this$1$1._cancelCut();
    this$1$1.deleteFeature([state.polygon.id], { silent: true });
  });
  return { featureIds: featureIds };
};

CutPolygonMode.clickOnVertex = function (state) {
  var this$1$1 = this;

  this.originClickOnVertex(state, function () {
    var cuttingpolygon = state.polygon.toGeoJSON();
    cuttingpolygon.geometry.coordinates[0].splice(state.currentVertexPosition, 1);
    this$1$1._cut(cuttingpolygon);
    if (this$1$1._options.continuous) {
      this$1$1._resetState();
    } else {
      this$1$1.deleteFeature([state.polygon.id], { silent: true });
    }
  });
};

CutPolygonMode.undo = function () {
  var this$1$1 = this;

  var ref = this.redoUndo.undo() || {};
  var type = ref.type;
  var stack = ref.stack;
  if (type !== 'cut') { return; }
  var ref$1 = this._ctx;
  var store = ref$1.store;

  this.beforeRender(function () {
    var state = this$1$1.getState();
    var redoStack = { geoJson: stack.geoJson };
    stack.polygons.forEach(function (item) {
      // 将features合并为一个feature
      var combine = turf__namespace.combine(item.difference);
      // 将两个feature合并为一个feature
      var nuion = turf__namespace.union(item.intersect, combine.features[0]);
      var nuionFeature = this$1$1.newFeature(nuion);
      var ref = item.difference.features;
      var f = ref[0];
      var rest = ref.slice(1);
      nuionFeature.id = f.id;
      item.difference.features.forEach(function (f) { return store.get(f.id).measure.delete(); });
      rest.forEach(function (v) { return this$1$1.deleteFeature(v.id); });
      this$1$1.addFeature(nuionFeature);
      this$1$1._execMeasure(nuionFeature);
      this$1$1._setHighlight(nuionFeature.id, this$1$1._options.highlightColor);
    });
    this$1$1._undoByLines(stack);

    state.currentVertexPosition = stack.geoJson.geometry.coordinates[0].length - 1;
    state.polygon.setCoordinates(stack.geoJson.geometry.coordinates);
    this$1$1.redoUndo.setRedoUndoStack(function (ref) {
      var r = ref.redoStack;

      return ({ redoStack: r.concat( [redoStack]) });
    });
    this$1$1._updateFeatures();
  });
};

CutPolygonMode.redo = function () {
  var this$1$1 = this;

  var res = this.redoUndo.redo() || {};
  var type = res.type;
  var stack = res.stack;
  if (type !== 'cut') { return; }
  this.beforeRender(function () {
    this$1$1._cut(stack.geoJson);
    this$1$1._resetState();
  });
};

CutPolygonMode._cut = function (cuttingpolygon) {
  var this$1$1 = this;

  var ref = this._ctx;
  var store = ref.store;
  var api = ref.api;
  var ref$1 = this._options;
  var highlightColor = ref$1.highlightColor;
  var bufferOptions = ref$1.bufferOptions;
  var undoStack = { geoJson: cuttingpolygon, polygons: [], lines: [] };
  if (bufferOptions.width) { cuttingpolygon = turf__namespace.buffer(cuttingpolygon, bufferOptions.width, { units: bufferOptions.unit }); }
  var narrow = turf__namespace.transformScale(cuttingpolygon, 0.01);

  this._features.forEach(function (feature) {
    if (geojsonTypes.includes(feature.geometry.type)) {
      store.get(feature.id).measure.delete();
      if (lineTypes.includes(feature.geometry.type)) {
        var splitter = turf__namespace.polygonToLine(cuttingpolygon);
        var cuted = turf__namespace.lineSplit(feature, splitter);
        cuted.features = cuted.features.filter(function (f) { return turf__namespace.booleanWithin(f, narrow); });
        undoStack.lines.push({ cuted: cuted, line: feature });
        cuted.features.sort(function (a, b) { return turf__namespace.length(a) - turf__namespace.length(b); });
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach(function (id, i) { return (cuted.features[i].id = id); });
        this$1$1._continuous(function () { return this$1$1._batchHighlight(cuted.features, highlightColor); });
        return;
      }
      var afterCut = turf__namespace.difference(feature, cuttingpolygon);
      if (!afterCut) { return; }
      var newFeature = this$1$1.newFeature(afterCut);
      var item = { intersect: turf__namespace.intersect(feature, cuttingpolygon) };
      if (newFeature.features) {
        var ref = newFeature.features.sort(function (a, b) { return turf__namespace.area(a) - turf__namespace.area(b); });
        var f = ref[0];
        var rest = ref.slice(1);
        f.id = feature.id;
        this$1$1.addFeature(f);
        api.add(turf__namespace.featureCollection(rest.map(function (v) { return v.toGeoJSON(); })), { silent: true });
        this$1$1._execMeasure(f);
        this$1$1._continuous(function () { return this$1$1._batchHighlight(newFeature.features, highlightColor); });
        if (item.intersect) {
          item.difference = turf__namespace.featureCollection(newFeature.features.map(function (v) { return v.toGeoJSON(); }));
        }
      } else {
        newFeature.id = feature.id;
        this$1$1.addFeature(newFeature);
        this$1$1._execMeasure(newFeature);
        this$1$1._continuous(function () { return this$1$1._setHighlight(newFeature.id, highlightColor); });
        if (item.intersect) { item.difference = turf__namespace.featureCollection([newFeature.toGeoJSON()]); }
      }
      if (item.intersect && item.difference) { undoStack.polygons.push(item); }
    } else {
      console.info('The feature is not Polygon/MultiPolygon!');
    }
  });
  this.redoUndo.setRedoUndoStack(function (ref) {
    var u = ref.undoStack;

    return ({ undoStack: u.concat( [undoStack]) });
  });
  store.setDirty();
};

CutPolygonMode._resetState = function () {
  var state = this.getState();
  state.currentVertexPosition = 0;
  state.polygon.setCoordinates([[]]);
};

/**
 * Returns a cloned copy of the passed GeoJSON Object, including possible 'Foreign Members'.
 * ~3-5x faster than the common JSON.parse + JSON.stringify combo method.
 *
 * @name clone
 * @param {GeoJSON} geojson GeoJSON Object
 * @returns {GeoJSON} cloned GeoJSON Object
 * @example
 * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]], {color: 'red'});
 *
 * var lineCloned = turf.clone(line);
 */
function clone(geojson) {
    if (!geojson) {
        throw new Error("geojson is required");
    }
    switch (geojson.type) {
        case "Feature":
            return cloneFeature(geojson);
        case "FeatureCollection":
            return cloneFeatureCollection(geojson);
        case "Point":
        case "LineString":
        case "Polygon":
        case "MultiPoint":
        case "MultiLineString":
        case "MultiPolygon":
        case "GeometryCollection":
            return cloneGeometry(geojson);
        default:
            throw new Error("unknown GeoJSON type");
    }
}
/**
 * Clone Feature
 *
 * @private
 * @param {Feature<any>} geojson GeoJSON Feature
 * @returns {Feature<any>} cloned Feature
 */
function cloneFeature(geojson) {
    var cloned = { type: "Feature" };
    // Preserve Foreign Members
    Object.keys(geojson).forEach(function (key) {
        switch (key) {
            case "type":
            case "properties":
            case "geometry":
                return;
            default:
                cloned[key] = geojson[key];
        }
    });
    // Add properties & geometry last
    cloned.properties = cloneProperties(geojson.properties);
    cloned.geometry = cloneGeometry(geojson.geometry);
    return cloned;
}
/**
 * Clone Properties
 *
 * @private
 * @param {Object} properties GeoJSON Properties
 * @returns {Object} cloned Properties
 */
function cloneProperties(properties) {
    var cloned = {};
    if (!properties) {
        return cloned;
    }
    Object.keys(properties).forEach(function (key) {
        var value = properties[key];
        if (typeof value === "object") {
            if (value === null) {
                // handle null
                cloned[key] = null;
            }
            else if (Array.isArray(value)) {
                // handle Array
                cloned[key] = value.map(function (item) {
                    return item;
                });
            }
            else {
                // handle generic Object
                cloned[key] = cloneProperties(value);
            }
        }
        else {
            cloned[key] = value;
        }
    });
    return cloned;
}
/**
 * Clone Feature Collection
 *
 * @private
 * @param {FeatureCollection<any>} geojson GeoJSON Feature Collection
 * @returns {FeatureCollection<any>} cloned Feature Collection
 */
function cloneFeatureCollection(geojson) {
    var cloned = { type: "FeatureCollection" };
    // Preserve Foreign Members
    Object.keys(geojson).forEach(function (key) {
        switch (key) {
            case "type":
            case "features":
                return;
            default:
                cloned[key] = geojson[key];
        }
    });
    // Add features
    cloned.features = geojson.features.map(function (feature) {
        return cloneFeature(feature);
    });
    return cloned;
}
/**
 * Clone Geometry
 *
 * @private
 * @param {Geometry<any>} geometry GeoJSON Geometry
 * @returns {Geometry<any>} cloned Geometry
 */
function cloneGeometry(geometry) {
    var geom = { type: geometry.type };
    if (geometry.bbox) {
        geom.bbox = geometry.bbox;
    }
    if (geometry.type === "GeometryCollection") {
        geom.geometries = geometry.geometries.map(function (g) {
            return cloneGeometry(g);
        });
        return geom;
    }
    geom.coordinates = deepSlice(geometry.coordinates);
    return geom;
}
/**
 * Deep Slice coordinates
 *
 * @private
 * @param {Coordinates} coords Coordinates
 * @returns {Coordinates} all coordinates sliced
 */
function deepSlice(coords) {
    var cloned = coords;
    if (typeof cloned[0] !== "object") {
        return cloned.slice();
    }
    return cloned.map(function (coord) {
        return deepSlice(coord);
    });
}

/**
 * @module helpers
 */
/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 *
 * @memberof helpers
 * @type {number}
 */
var earthRadius = 6371008.8;
/**
 * Unit of measurement factors using a spherical (non-ellipsoid) earth radius.
 *
 * @memberof helpers
 * @type {Object}
 */
var factors = {
    centimeters: earthRadius * 100,
    centimetres: earthRadius * 100,
    degrees: earthRadius / 111325,
    feet: earthRadius * 3.28084,
    inches: earthRadius * 39.37,
    kilometers: earthRadius / 1000,
    kilometres: earthRadius / 1000,
    meters: earthRadius,
    metres: earthRadius,
    miles: earthRadius / 1609.344,
    millimeters: earthRadius * 1000,
    millimetres: earthRadius * 1000,
    nauticalmiles: earthRadius / 1852,
    radians: 1,
    yards: earthRadius * 1.0936,
};
/**
 * Units of measurement factors based on 1 meter.
 *
 * @memberof helpers
 * @type {Object}
 */
var unitsFactors = {
    centimeters: 100,
    centimetres: 100,
    degrees: 1 / 111325,
    feet: 3.28084,
    inches: 39.37,
    kilometers: 1 / 1000,
    kilometres: 1 / 1000,
    meters: 1,
    metres: 1,
    miles: 1 / 1609.344,
    millimeters: 1000,
    millimetres: 1000,
    nauticalmiles: 1 / 1852,
    radians: 1 / earthRadius,
    yards: 1.0936133,
};
/**
 * Area of measurement factors based on 1 square meter.
 *
 * @memberof helpers
 * @type {Object}
 */
var areaFactors = {
    acres: 0.000247105,
    centimeters: 10000,
    centimetres: 10000,
    feet: 10.763910417,
    hectares: 0.0001,
    inches: 1550.003100006,
    kilometers: 0.000001,
    kilometres: 0.000001,
    meters: 1,
    metres: 1,
    miles: 3.86e-7,
    millimeters: 1000000,
    millimetres: 1000000,
    yards: 1.195990046,
};
/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geom, properties, options) {
    if (options === void 0) { options = {}; }
    var feat = { type: "Feature" };
    if (options.id === 0 || options.id) {
        feat.id = options.id;
    }
    if (options.bbox) {
        feat.bbox = options.bbox;
    }
    feat.properties = properties || {};
    feat.geometry = geom;
    return feat;
}
/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<any>} coordinates Coordinates
 * @param {Object} [options={}] Optional Parameters
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = "Point";
 * var coordinates = [110, 50];
 * var geometry = turf.geometry(type, coordinates);
 * // => geometry
 */
function geometry(type, coordinates, _options) {
    if (_options === void 0) { _options = {}; }
    switch (type) {
        case "Point":
            return point(coordinates).geometry;
        case "LineString":
            return lineString(coordinates).geometry;
        case "Polygon":
            return polygon(coordinates).geometry;
        case "MultiPoint":
            return multiPoint(coordinates).geometry;
        case "MultiLineString":
            return multiLineString(coordinates).geometry;
        case "MultiPolygon":
            return multiPolygon(coordinates).geometry;
        default:
            throw new Error(type + " is invalid");
    }
}
/**
 * Creates a {@link Point} {@link Feature} from a Position.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */
function point(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (!coordinates) {
        throw new Error("coordinates is required");
    }
    if (!Array.isArray(coordinates)) {
        throw new Error("coordinates must be an Array");
    }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be at least 2 numbers long");
    }
    if (!isNumber(coordinates[0]) || !isNumber(coordinates[1])) {
        throw new Error("coordinates must contain numbers");
    }
    var geom = {
        type: "Point",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
/**
 * Creates a {@link Point} {@link FeatureCollection} from an Array of Point coordinates.
 *
 * @name points
 * @param {Array<Array<number>>} coordinates an array of Points
 * @param {Object} [properties={}] Translate these properties to each Feature
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Point>} Point Feature
 * @example
 * var points = turf.points([
 *   [-75, 39],
 *   [-80, 45],
 *   [-78, 50]
 * ]);
 *
 * //=points
 */
function points(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return point(coords, properties);
    }), options);
}
/**
 * Creates a {@link Polygon} {@link Feature} from an Array of LinearRings.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<Polygon>} Polygon Feature
 * @example
 * var polygon = turf.polygon([[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]], { name: 'poly1' });
 *
 * //=polygon
 */
function polygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
        var ring = coordinates_1[_i];
        if (ring.length < 4) {
            throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            // Check if first point of Polygon contains two numbers
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error("First and last Position are not equivalent.");
            }
        }
    }
    var geom = {
        type: "Polygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
/**
 * Creates a {@link Polygon} {@link FeatureCollection} from an Array of Polygon coordinates.
 *
 * @name polygons
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygon coordinates
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<Polygon>} Polygon FeatureCollection
 * @example
 * var polygons = turf.polygons([
 *   [[[-5, 52], [-4, 56], [-2, 51], [-7, 54], [-5, 52]]],
 *   [[[-15, 42], [-14, 46], [-12, 41], [-17, 44], [-15, 42]]],
 * ]);
 *
 * //=polygons
 */
function polygons(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return polygon(coords, properties);
    }), options);
}
/**
 * Creates a {@link LineString} {@link Feature} from an Array of Positions.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<LineString>} LineString Feature
 * @example
 * var linestring1 = turf.lineString([[-24, 63], [-23, 60], [-25, 65], [-20, 69]], {name: 'line 1'});
 * var linestring2 = turf.lineString([[-14, 43], [-13, 40], [-15, 45], [-10, 49]], {name: 'line 2'});
 *
 * //=linestring1
 * //=linestring2
 */
function lineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    if (coordinates.length < 2) {
        throw new Error("coordinates must be an array of two or more positions");
    }
    var geom = {
        type: "LineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
/**
 * Creates a {@link LineString} {@link FeatureCollection} from an Array of LineString coordinates.
 *
 * @name lineStrings
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north]
 * associated with the FeatureCollection
 * @param {string|number} [options.id] Identifier associated with the FeatureCollection
 * @returns {FeatureCollection<LineString>} LineString FeatureCollection
 * @example
 * var linestrings = turf.lineStrings([
 *   [[-24, 63], [-23, 60], [-25, 65], [-20, 69]],
 *   [[-14, 43], [-13, 40], [-15, 45], [-10, 49]]
 * ]);
 *
 * //=linestrings
 */
function lineStrings(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    return featureCollection(coordinates.map(function (coords) {
        return lineString(coords, properties);
    }), options);
}
/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {FeatureCollection} FeatureCollection of Features
 * @example
 * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
 * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
 * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
 *
 * var collection = turf.featureCollection([
 *   locationA,
 *   locationB,
 *   locationC
 * ]);
 *
 * //=collection
 */
function featureCollection(features, options) {
    if (options === void 0) { options = {}; }
    var fc = { type: "FeatureCollection" };
    if (options.id) {
        fc.id = options.id;
    }
    if (options.bbox) {
        fc.bbox = options.bbox;
    }
    fc.features = features;
    return fc;
}
/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 */
function multiLineString(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiLineString",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 */
function multiPoint(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPoint",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
function multiPolygon(coordinates, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "MultiPolygon",
        coordinates: coordinates,
    };
    return feature(geom, properties, options);
}
/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Object} [options={}] Optional Parameters
 * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
 * @param {string|number} [options.id] Identifier associated with the Feature
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = turf.geometry("Point", [100, 0]);
 * var line = turf.geometry("LineString", [[101, 0], [102, 1]]);
 * var collection = turf.geometryCollection([pt, line]);
 *
 * // => collection
 */
function geometryCollection(geometries, properties, options) {
    if (options === void 0) { options = {}; }
    var geom = {
        type: "GeometryCollection",
        geometries: geometries,
    };
    return feature(geom, properties, options);
}
/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 */
function round(num, precision) {
    if (precision === void 0) { precision = 0; }
    if (precision && !(precision >= 0)) {
        throw new Error("precision must be a positive number");
    }
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(num * multiplier) / multiplier;
}
/**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToLength
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} distance
 */
function radiansToLength(radians, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return radians * factor;
}
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name lengthToRadians
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} radians
 */
function lengthToRadians(distance, units) {
    if (units === void 0) { units = "kilometers"; }
    var factor = factors[units];
    if (!factor) {
        throw new Error(units + " units is invalid");
    }
    return distance / factor;
}
/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name lengthToDegrees
 * @param {number} distance in real units
 * @param {string} [units="kilometers"] can be degrees, radians, miles, inches, yards, metres,
 * meters, kilometres, kilometers.
 * @returns {number} degrees
 */
function lengthToDegrees(distance, units) {
    return radiansToDegrees(lengthToRadians(distance, units));
}
/**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAzimuth
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 */
function bearingToAzimuth(bearing) {
    var angle = bearing % 360;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
/**
 * Converts an angle in radians to degrees
 *
 * @name radiansToDegrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 */
function radiansToDegrees(radians) {
    var degrees = radians % (2 * Math.PI);
    return (degrees * 180) / Math.PI;
}
/**
 * Converts an angle in degrees to radians
 *
 * @name degreesToRadians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 */
function degreesToRadians(degrees) {
    var radians = degrees % 360;
    return (radians * Math.PI) / 180;
}
/**
 * Converts a length to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} length to be converted
 * @param {Units} [originalUnit="kilometers"] of the length
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted length
 */
function convertLength(length, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "kilometers"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(length >= 0)) {
        throw new Error("length must be a positive number");
    }
    return radiansToLength(lengthToRadians(length, originalUnit), finalUnit);
}
/**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeters, acres, miles, yards, feet, inches, hectares
 * @param {number} area to be converted
 * @param {Units} [originalUnit="meters"] of the distance
 * @param {Units} [finalUnit="kilometers"] returned unit
 * @returns {number} the converted area
 */
function convertArea(area, originalUnit, finalUnit) {
    if (originalUnit === void 0) { originalUnit = "meters"; }
    if (finalUnit === void 0) { finalUnit = "kilometers"; }
    if (!(area >= 0)) {
        throw new Error("area must be a positive number");
    }
    var startFactor = areaFactors[originalUnit];
    if (!startFactor) {
        throw new Error("invalid original units");
    }
    var finalFactor = areaFactors[finalUnit];
    if (!finalFactor) {
        throw new Error("invalid final units");
    }
    return (area / startFactor) * finalFactor;
}
/**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */
function isNumber(num) {
    return !isNaN(num) && num !== null && !Array.isArray(num);
}
/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */
function isObject(input) {
    return !!input && input.constructor === Object;
}
/**
 * Validate BBox
 *
 * @private
 * @param {Array<number>} bbox BBox to validate
 * @returns {void}
 * @throws Error if BBox is not valid
 * @example
 * validateBBox([-180, -40, 110, 50])
 * //=OK
 * validateBBox([-180, -40])
 * //=Error
 * validateBBox('Foo')
 * //=Error
 * validateBBox(5)
 * //=Error
 * validateBBox(null)
 * //=Error
 * validateBBox(undefined)
 * //=Error
 */
function validateBBox(bbox) {
    if (!bbox) {
        throw new Error("bbox is required");
    }
    if (!Array.isArray(bbox)) {
        throw new Error("bbox must be an Array");
    }
    if (bbox.length !== 4 && bbox.length !== 6) {
        throw new Error("bbox must be an Array of 4 or 6 numbers");
    }
    bbox.forEach(function (num) {
        if (!isNumber(num)) {
            throw new Error("bbox must only contain numbers");
        }
    });
}
/**
 * Validate Id
 *
 * @private
 * @param {string|number} id Id to validate
 * @returns {void}
 * @throws Error if Id is not valid
 * @example
 * validateId([-180, -40, 110, 50])
 * //=Error
 * validateId([-180, -40])
 * //=Error
 * validateId('Foo')
 * //=OK
 * validateId(5)
 * //=OK
 * validateId(null)
 * //=Error
 * validateId(undefined)
 * //=Error
 */
function validateId(id) {
    if (!id) {
        throw new Error("id is required");
    }
    if (["string", "number"].indexOf(typeof id) === -1) {
        throw new Error("id must be a number or a string");
    }
}

/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */
function getCoord(coord) {
    if (!coord) {
        throw new Error("coord is required");
    }
    if (!Array.isArray(coord)) {
        if (coord.type === "Feature" &&
            coord.geometry !== null &&
            coord.geometry.type === "Point") {
            return coord.geometry.coordinates;
        }
        if (coord.type === "Point") {
            return coord.coordinates;
        }
    }
    if (Array.isArray(coord) &&
        coord.length >= 2 &&
        !Array.isArray(coord[0]) &&
        !Array.isArray(coord[1])) {
        return coord;
    }
    throw new Error("coord must be GeoJSON Point or an Array of numbers");
}
/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array
 *
 * @name getCoords
 * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
 * @returns {Array<any>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coords = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */
function getCoords(coords) {
    if (Array.isArray(coords)) {
        return coords;
    }
    // Feature
    if (coords.type === "Feature") {
        if (coords.geometry !== null) {
            return coords.geometry.coordinates;
        }
    }
    else {
        // Geometry
        if (coords.coordinates) {
            return coords.coordinates;
        }
    }
    throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array");
}
/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */
function containsNumber(coordinates) {
    if (coordinates.length > 1 &&
        isNumber(coordinates[0]) &&
        isNumber(coordinates[1])) {
        return true;
    }
    if (Array.isArray(coordinates[0]) && coordinates[0].length) {
        return containsNumber(coordinates[0]);
    }
    throw new Error("coordinates must only contain numbers");
}
/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function geojsonType(value, type, name) {
    if (!type || !name) {
        throw new Error("type and name required");
    }
    if (!value || value.type !== type) {
        throw new Error("Invalid input to " +
            name +
            ": must be a " +
            type +
            ", given " +
            value.type);
    }
}
/**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 */
function featureOf(feature, type, name) {
    if (!feature) {
        throw new Error("No feature passed");
    }
    if (!name) {
        throw new Error(".featureOf() requires a name");
    }
    if (!feature || feature.type !== "Feature" || !feature.geometry) {
        throw new Error("Invalid input to " + name + ", Feature with geometry required");
    }
    if (!feature.geometry || feature.geometry.type !== type) {
        throw new Error("Invalid input to " +
            name +
            ": must be a " +
            type +
            ", given " +
            feature.geometry.type);
    }
}
/**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 */
function collectionOf(featureCollection, type, name) {
    if (!featureCollection) {
        throw new Error("No featureCollection passed");
    }
    if (!name) {
        throw new Error(".collectionOf() requires a name");
    }
    if (!featureCollection || featureCollection.type !== "FeatureCollection") {
        throw new Error("Invalid input to " + name + ", FeatureCollection required");
    }
    for (var _i = 0, _a = featureCollection.features; _i < _a.length; _i++) {
        var feature = _a[_i];
        if (!feature || feature.type !== "Feature" || !feature.geometry) {
            throw new Error("Invalid input to " + name + ", Feature with geometry required");
        }
        if (!feature.geometry || feature.geometry.type !== type) {
            throw new Error("Invalid input to " +
                name +
                ": must be a " +
                type +
                ", given " +
                feature.geometry.type);
        }
    }
}
/**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 */
function getGeom(geojson) {
    if (geojson.type === "Feature") {
        return geojson.geometry;
    }
    return geojson;
}
/**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name="geojson"] name of the variable to display in error message (unused)
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */
function getType(geojson, _name) {
    if (geojson.type === "FeatureCollection") {
        return "FeatureCollection";
    }
    if (geojson.type === "GeometryCollection") {
        return "GeometryCollection";
    }
    if (geojson.type === "Feature" && geojson.geometry !== null) {
        return geojson.geometry.type;
    }
    return geojson.type;
}

/**
 * Takes a ring and return true or false whether or not the ring is clockwise or counter-clockwise.
 *
 * @name booleanClockwise
 * @param {Feature<LineString>|LineString|Array<Array<number>>} line to be evaluated
 * @returns {boolean} true/false
 * @example
 * var clockwiseRing = turf.lineString([[0,0],[1,1],[1,0],[0,0]]);
 * var counterClockwiseRing = turf.lineString([[0,0],[1,0],[1,1],[0,0]]);
 *
 * turf.booleanClockwise(clockwiseRing)
 * //=true
 * turf.booleanClockwise(counterClockwiseRing)
 * //=false
 */
function booleanClockwise(line) {
    var ring = getCoords(line);
    var sum = 0;
    var i = 1;
    var prev;
    var cur;
    while (i < ring.length) {
        prev = cur || ring[0];
        cur = ring[i];
        sum += (cur[0] - prev[0]) * (cur[1] + prev[1]);
        i++;
    }
    return sum > 0;
}

/**
 * Callback for coordEach
 *
 * @callback coordEachCallback
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function coordEach(geojson, callback, excludeWrapCoord) {
  // Handles null Geometry -- Skips this GeoJSON
  if (geojson === null) { return; }
  var j,
    k,
    l,
    geometry,
    stopG,
    coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    coordIndex = 0,
    isGeometryCollection,
    type = geojson.type,
    isFeatureCollection = type === "FeatureCollection",
    isFeature = type === "Feature",
    stop = isFeatureCollection ? geojson.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
    geometryMaybeCollection = isFeatureCollection
      ? geojson.features[featureIndex].geometry
      : isFeature
      ? geojson.geometry
      : geojson;
    isGeometryCollection = geometryMaybeCollection
      ? geometryMaybeCollection.type === "GeometryCollection"
      : false;
    stopG = isGeometryCollection
      ? geometryMaybeCollection.geometries.length
      : 1;

    for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
      var multiFeatureIndex = 0;
      var geometryIndex = 0;
      geometry = isGeometryCollection
        ? geometryMaybeCollection.geometries[geomIndex]
        : geometryMaybeCollection;

      // Handles null Geometry -- Skips this geometry
      if (geometry === null) { continue; }
      coords = geometry.coordinates;
      var geomType = geometry.type;

      wrapShrink =
        excludeWrapCoord &&
        (geomType === "Polygon" || geomType === "MultiPolygon")
          ? 1
          : 0;

      switch (geomType) {
        case null:
          break;
        case "Point":
          if (
            callback(
              coords,
              coordIndex,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            ) === false
          )
            { return false; }
          coordIndex++;
          multiFeatureIndex++;
          break;
        case "LineString":
        case "MultiPoint":
          for (j = 0; j < coords.length; j++) {
            if (
              callback(
                coords[j],
                coordIndex,
                featureIndex,
                multiFeatureIndex,
                geometryIndex
              ) === false
            )
              { return false; }
            coordIndex++;
            if (geomType === "MultiPoint") { multiFeatureIndex++; }
          }
          if (geomType === "LineString") { multiFeatureIndex++; }
          break;
        case "Polygon":
        case "MultiLineString":
          for (j = 0; j < coords.length; j++) {
            for (k = 0; k < coords[j].length - wrapShrink; k++) {
              if (
                callback(
                  coords[j][k],
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                { return false; }
              coordIndex++;
            }
            if (geomType === "MultiLineString") { multiFeatureIndex++; }
            if (geomType === "Polygon") { geometryIndex++; }
          }
          if (geomType === "Polygon") { multiFeatureIndex++; }
          break;
        case "MultiPolygon":
          for (j = 0; j < coords.length; j++) {
            geometryIndex = 0;
            for (k = 0; k < coords[j].length; k++) {
              for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                if (
                  callback(
                    coords[j][k][l],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  { return false; }
                coordIndex++;
              }
              geometryIndex++;
            }
            multiFeatureIndex++;
          }
          break;
        case "GeometryCollection":
          for (j = 0; j < geometry.geometries.length; j++)
            { if (
              coordEach(geometry.geometries[j], callback, excludeWrapCoord) ===
              false
            )
              { return false; } }
          break;
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
  }
}

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentCoord;
 * });
 */
function coordReduce(geojson, callback, initialValue, excludeWrapCoord) {
  var previousValue = initialValue;
  coordEach(
    geojson,
    function (
      currentCoord,
      coordIndex,
      featureIndex,
      multiFeatureIndex,
      geometryIndex
    ) {
      if (coordIndex === 0 && initialValue === undefined)
        { previousValue = currentCoord; }
      else
        { previousValue = callback(
          previousValue,
          currentCoord,
          coordIndex,
          featureIndex,
          multiFeatureIndex,
          geometryIndex
        ); }
    },
    excludeWrapCoord
  );
  return previousValue;
}

/**
 * Callback for propEach
 *
 * @callback propEachCallback
 * @param {Object} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propEach(features, function (currentProperties, featureIndex) {
 *   //=currentProperties
 *   //=featureIndex
 * });
 */
function propEach(geojson, callback) {
  var i;
  switch (geojson.type) {
    case "FeatureCollection":
      for (i = 0; i < geojson.features.length; i++) {
        if (callback(geojson.features[i].properties, i) === false) { break; }
      }
      break;
    case "Feature":
      callback(geojson.properties, 0);
      break;
  }
}

/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current Properties being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {FeatureCollection|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=featureIndex
 *   return currentProperties
 * });
 */
function propReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  propEach(geojson, function (currentProperties, featureIndex) {
    if (featureIndex === 0 && initialValue === undefined)
      { previousValue = currentProperties; }
    else
      { previousValue = callback(previousValue, currentProperties, featureIndex); }
  });
  return previousValue;
}

/**
 * Callback for featureEach
 *
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.featureEach(features, function (currentFeature, featureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 * });
 */
function featureEach(geojson, callback) {
  if (geojson.type === "Feature") {
    callback(geojson, 0);
  } else if (geojson.type === "FeatureCollection") {
    for (var i = 0; i < geojson.features.length; i++) {
      if (callback(geojson.features[i], i) === false) { break; }
    }
  }
}

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   return currentFeature
 * });
 */
function featureReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  featureEach(geojson, function (currentFeature, featureIndex) {
    if (featureIndex === 0 && initialValue === undefined)
      { previousValue = currentFeature; }
    else { previousValue = callback(previousValue, currentFeature, featureIndex); }
  });
  return previousValue;
}

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * var coords = turf.coordAll(features);
 * //= [[26, 37], [36, 53]]
 */
function coordAll(geojson) {
  var coords = [];
  coordEach(geojson, function (coord) {
    coords.push(coord);
  });
  return coords;
}

/**
 * Callback for geomEach
 *
 * @callback geomEachCallback
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 * });
 */
function geomEach(geojson, callback) {
  var i,
    j,
    g,
    geometry,
    stopG,
    geometryMaybeCollection,
    isGeometryCollection,
    featureProperties,
    featureBBox,
    featureId,
    featureIndex = 0,
    isFeatureCollection = geojson.type === "FeatureCollection",
    isFeature = geojson.type === "Feature",
    stop = isFeatureCollection ? geojson.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (i = 0; i < stop; i++) {
    geometryMaybeCollection = isFeatureCollection
      ? geojson.features[i].geometry
      : isFeature
      ? geojson.geometry
      : geojson;
    featureProperties = isFeatureCollection
      ? geojson.features[i].properties
      : isFeature
      ? geojson.properties
      : {};
    featureBBox = isFeatureCollection
      ? geojson.features[i].bbox
      : isFeature
      ? geojson.bbox
      : undefined;
    featureId = isFeatureCollection
      ? geojson.features[i].id
      : isFeature
      ? geojson.id
      : undefined;
    isGeometryCollection = geometryMaybeCollection
      ? geometryMaybeCollection.type === "GeometryCollection"
      : false;
    stopG = isGeometryCollection
      ? geometryMaybeCollection.geometries.length
      : 1;

    for (g = 0; g < stopG; g++) {
      geometry = isGeometryCollection
        ? geometryMaybeCollection.geometries[g]
        : geometryMaybeCollection;

      // Handle null Geometry
      if (geometry === null) {
        if (
          callback(
            null,
            featureIndex,
            featureProperties,
            featureBBox,
            featureId
          ) === false
        )
          { return false; }
        continue;
      }
      switch (geometry.type) {
        case "Point":
        case "LineString":
        case "MultiPoint":
        case "Polygon":
        case "MultiLineString":
        case "MultiPolygon": {
          if (
            callback(
              geometry,
              featureIndex,
              featureProperties,
              featureBBox,
              featureId
            ) === false
          )
            { return false; }
          break;
        }
        case "GeometryCollection": {
          for (j = 0; j < geometry.geometries.length; j++) {
            if (
              callback(
                geometry.geometries[j],
                featureIndex,
                featureProperties,
                featureBBox,
                featureId
              ) === false
            )
              { return false; }
          }
          break;
        }
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
    // Only increase `featureIndex` per each feature
    featureIndex++;
  }
}

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Geometry} currentGeometry The current Geometry being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {Object} featureProperties The current Feature Properties being processed.
 * @param {Array<number>} featureBBox The current Feature BBox being processed.
 * @param {number|string} featureId The current Feature Id being processed.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=featureIndex
 *   //=featureProperties
 *   //=featureBBox
 *   //=featureId
 *   return currentGeometry
 * });
 */
function geomReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  geomEach(
    geojson,
    function (
      currentGeometry,
      featureIndex,
      featureProperties,
      featureBBox,
      featureId
    ) {
      if (featureIndex === 0 && initialValue === undefined)
        { previousValue = currentGeometry; }
      else
        { previousValue = callback(
          previousValue,
          currentGeometry,
          featureIndex,
          featureProperties,
          featureBBox,
          featureId
        ); }
    }
  );
  return previousValue;
}

/**
 * Callback for flattenEach
 *
 * @callback flattenEachCallback
 * @param {Feature} currentFeature The current flattened feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Iterate over flattened features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name flattenEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex, multiFeatureIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenEach(features, function (currentFeature, featureIndex, multiFeatureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 * });
 */
function flattenEach(geojson, callback) {
  geomEach(geojson, function (geometry, featureIndex, properties, bbox, id) {
    // Callback for single geometry
    var type = geometry === null ? null : geometry.type;
    switch (type) {
      case null:
      case "Point":
      case "LineString":
      case "Polygon":
        if (
          callback(
            feature(geometry, properties, { bbox: bbox, id: id }),
            featureIndex,
            0
          ) === false
        )
          { return false; }
        return;
    }

    var geomType;

    // Callback for multi-geometry
    switch (type) {
      case "MultiPoint":
        geomType = "Point";
        break;
      case "MultiLineString":
        geomType = "LineString";
        break;
      case "MultiPolygon":
        geomType = "Polygon";
        break;
    }

    for (
      var multiFeatureIndex = 0;
      multiFeatureIndex < geometry.coordinates.length;
      multiFeatureIndex++
    ) {
      var coordinate = geometry.coordinates[multiFeatureIndex];
      var geom = {
        type: geomType,
        coordinates: coordinate,
      };
      if (
        callback(feature(geom, properties), featureIndex, multiFeatureIndex) ===
        false
      )
        { return false; }
    }
  });
}

/**
 * Callback for flattenReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback flattenReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 */

/**
 * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
 *
 * @name flattenReduce
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, multiFeatureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, multiFeatureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   return currentFeature
 * });
 */
function flattenReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  flattenEach(
    geojson,
    function (currentFeature, featureIndex, multiFeatureIndex) {
      if (
        featureIndex === 0 &&
        multiFeatureIndex === 0 &&
        initialValue === undefined
      )
        { previousValue = currentFeature; }
      else
        { previousValue = callback(
          previousValue,
          currentFeature,
          featureIndex,
          multiFeatureIndex
        ); }
    }
  );
  return previousValue;
}

/**
 * Callback for segmentEach
 *
 * @callback segmentEachCallback
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 * @returns {void}
 */

/**
 * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex)
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentEach(polygon, function (currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //=currentSegment
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   //=segmentIndex
 * });
 *
 * // Calculate the total number of segments
 * var total = 0;
 * turf.segmentEach(polygon, function () {
 *     total++;
 * });
 */
function segmentEach(geojson, callback) {
  flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
    var segmentIndex = 0;

    // Exclude null Geometries
    if (!feature.geometry) { return; }
    // (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
    var type = feature.geometry.type;
    if (type === "Point" || type === "MultiPoint") { return; }

    // Generate 2-vertex line segments
    var previousCoords;
    var previousFeatureIndex = 0;
    var previousMultiIndex = 0;
    var prevGeomIndex = 0;
    if (
      coordEach(
        feature,
        function (
          currentCoord,
          coordIndex,
          featureIndexCoord,
          multiPartIndexCoord,
          geometryIndex
        ) {
          // Simulating a meta.coordReduce() since `reduce` operations cannot be stopped by returning `false`
          if (
            previousCoords === undefined ||
            featureIndex > previousFeatureIndex ||
            multiPartIndexCoord > previousMultiIndex ||
            geometryIndex > prevGeomIndex
          ) {
            previousCoords = currentCoord;
            previousFeatureIndex = featureIndex;
            previousMultiIndex = multiPartIndexCoord;
            prevGeomIndex = geometryIndex;
            segmentIndex = 0;
            return;
          }
          var currentSegment = lineString(
            [previousCoords, currentCoord],
            feature.properties
          );
          if (
            callback(
              currentSegment,
              featureIndex,
              multiFeatureIndex,
              geometryIndex,
              segmentIndex
            ) === false
          )
            { return false; }
          segmentIndex++;
          previousCoords = currentCoord;
        }
      ) === false
    )
      { return false; }
  });
}

/**
 * Callback for segmentReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback segmentReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentSegment The current Segment being processed.
 * @param {number} featureIndex The current index of the Feature being processed.
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed.
 * @param {number} geometryIndex The current index of the Geometry being processed.
 * @param {number} segmentIndex The current index of the Segment being processed.
 */

/**
 * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON
 * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, multiFeatureIndex, geometryIndex, segmentIndex) {
 *   //= previousSegment
 *   //= currentSegment
 *   //= featureIndex
 *   //= multiFeatureIndex
 *   //= geometryIndex
 *   //= segmentIndex
 *   return currentSegment
 * });
 *
 * // Calculate the total number of segments
 * var initialValue = 0
 * var total = turf.segmentReduce(polygon, function (previousValue) {
 *     previousValue++;
 *     return previousValue;
 * }, initialValue);
 */
function segmentReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  var started = false;
  segmentEach(
    geojson,
    function (
      currentSegment,
      featureIndex,
      multiFeatureIndex,
      geometryIndex,
      segmentIndex
    ) {
      if (started === false && initialValue === undefined)
        { previousValue = currentSegment; }
      else
        { previousValue = callback(
          previousValue,
          currentSegment,
          featureIndex,
          multiFeatureIndex,
          geometryIndex,
          segmentIndex
        ); }
      started = true;
    }
  );
  return previousValue;
}

/**
 * Callback for lineEach
 *
 * @callback lineEachCallback
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
 * similar to Array.forEach.
 *
 * @name lineEach
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @example
 * var multiLine = turf.multiLineString([
 *   [[26, 37], [35, 45]],
 *   [[36, 53], [38, 50], [41, 55]]
 * ]);
 *
 * turf.lineEach(multiLine, function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function lineEach(geojson, callback) {
  // validation
  if (!geojson) { throw new Error("geojson is required"); }

  flattenEach(geojson, function (feature, featureIndex, multiFeatureIndex) {
    if (feature.geometry === null) { return; }
    var type = feature.geometry.type;
    var coords = feature.geometry.coordinates;
    switch (type) {
      case "LineString":
        if (callback(feature, featureIndex, multiFeatureIndex, 0, 0) === false)
          { return false; }
        break;
      case "Polygon":
        for (
          var geometryIndex = 0;
          geometryIndex < coords.length;
          geometryIndex++
        ) {
          if (
            callback(
              lineString(coords[geometryIndex], feature.properties),
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            ) === false
          )
            { return false; }
        }
        break;
    }
  });
}

/**
 * Callback for lineReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback lineReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} featureIndex The current index of the Feature being processed
 * @param {number} multiFeatureIndex The current index of the Multi-Feature being processed
 * @param {number} geometryIndex The current index of the Geometry being processed
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name lineReduce
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var multiPoly = turf.multiPolygon([
 *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
 *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
 * ]);
 *
 * turf.lineReduce(multiPoly, function (previousValue, currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=previousValue
 *   //=currentLine
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 *   return currentLine
 * });
 */
function lineReduce(geojson, callback, initialValue) {
  var previousValue = initialValue;
  lineEach(
    geojson,
    function (currentLine, featureIndex, multiFeatureIndex, geometryIndex) {
      if (featureIndex === 0 && initialValue === undefined)
        { previousValue = currentLine; }
      else
        { previousValue = callback(
          previousValue,
          currentLine,
          featureIndex,
          multiFeatureIndex,
          geometryIndex
        ); }
    }
  );
  return previousValue;
}

/**
 * Finds a particular 2-vertex LineString Segment from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 * Point & MultiPoint will always return null.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.segmentIndex=0] Segment Index
 * @param {Object} [options.properties={}] Translate Properties to output LineString
 * @param {BBox} [options.bbox={}] Translate BBox to output LineString
 * @param {number|string} [options.id={}] Translate Id to output LineString
 * @returns {Feature<LineString>} 2-vertex GeoJSON Feature LineString
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findSegment(multiLine);
 * // => Feature<LineString<[[10, 10], [50, 30]]>>
 *
 * // First Segment of 2nd Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: 1});
 * // => Feature<LineString<[[-10, -10], [-50, -30]]>>
 *
 * // Last Segment of Last Multi Feature
 * turf.findSegment(multiLine, {multiFeatureIndex: -1, segmentIndex: -1});
 * // => Feature<LineString<[[-50, -30], [-30, -40]]>>
 */
function findSegment(geojson, options) {
  // Optional Parameters
  options = options || {};
  if (!isObject(options)) { throw new Error("options is invalid"); }
  var featureIndex = options.featureIndex || 0;
  var multiFeatureIndex = options.multiFeatureIndex || 0;
  var geometryIndex = options.geometryIndex || 0;
  var segmentIndex = options.segmentIndex || 0;

  // Find FeatureIndex
  var properties = options.properties;
  var geometry;

  switch (geojson.type) {
    case "FeatureCollection":
      if (featureIndex < 0)
        { featureIndex = geojson.features.length + featureIndex; }
      properties = properties || geojson.features[featureIndex].properties;
      geometry = geojson.features[featureIndex].geometry;
      break;
    case "Feature":
      properties = properties || geojson.properties;
      geometry = geojson.geometry;
      break;
    case "Point":
    case "MultiPoint":
      return null;
    case "LineString":
    case "Polygon":
    case "MultiLineString":
    case "MultiPolygon":
      geometry = geojson;
      break;
    default:
      throw new Error("geojson is invalid");
  }

  // Find SegmentIndex
  if (geometry === null) { return null; }
  var coords = geometry.coordinates;
  switch (geometry.type) {
    case "Point":
    case "MultiPoint":
      return null;
    case "LineString":
      if (segmentIndex < 0) { segmentIndex = coords.length + segmentIndex - 1; }
      return lineString(
        [coords[segmentIndex], coords[segmentIndex + 1]],
        properties,
        options
      );
    case "Polygon":
      if (geometryIndex < 0) { geometryIndex = coords.length + geometryIndex; }
      if (segmentIndex < 0)
        { segmentIndex = coords[geometryIndex].length + segmentIndex - 1; }
      return lineString(
        [
          coords[geometryIndex][segmentIndex],
          coords[geometryIndex][segmentIndex + 1] ],
        properties,
        options
      );
    case "MultiLineString":
      if (multiFeatureIndex < 0)
        { multiFeatureIndex = coords.length + multiFeatureIndex; }
      if (segmentIndex < 0)
        { segmentIndex = coords[multiFeatureIndex].length + segmentIndex - 1; }
      return lineString(
        [
          coords[multiFeatureIndex][segmentIndex],
          coords[multiFeatureIndex][segmentIndex + 1] ],
        properties,
        options
      );
    case "MultiPolygon":
      if (multiFeatureIndex < 0)
        { multiFeatureIndex = coords.length + multiFeatureIndex; }
      if (geometryIndex < 0)
        { geometryIndex = coords[multiFeatureIndex].length + geometryIndex; }
      if (segmentIndex < 0)
        { segmentIndex =
          coords[multiFeatureIndex][geometryIndex].length - segmentIndex - 1; }
      return lineString(
        [
          coords[multiFeatureIndex][geometryIndex][segmentIndex],
          coords[multiFeatureIndex][geometryIndex][segmentIndex + 1] ],
        properties,
        options
      );
  }
  throw new Error("geojson is invalid");
}

/**
 * Finds a particular Point from a GeoJSON using `@turf/meta` indexes.
 *
 * Negative indexes are permitted.
 *
 * @param {FeatureCollection|Feature|Geometry} geojson Any GeoJSON Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.featureIndex=0] Feature Index
 * @param {number} [options.multiFeatureIndex=0] Multi-Feature Index
 * @param {number} [options.geometryIndex=0] Geometry Index
 * @param {number} [options.coordIndex=0] Coord Index
 * @param {Object} [options.properties={}] Translate Properties to output Point
 * @param {BBox} [options.bbox={}] Translate BBox to output Point
 * @param {number|string} [options.id={}] Translate Id to output Point
 * @returns {Feature<Point>} 2-vertex GeoJSON Feature Point
 * @example
 * var multiLine = turf.multiLineString([
 *     [[10, 10], [50, 30], [30, 40]],
 *     [[-10, -10], [-50, -30], [-30, -40]]
 * ]);
 *
 * // First Segment (defaults are 0)
 * turf.findPoint(multiLine);
 * // => Feature<Point<[10, 10]>>
 *
 * // First Segment of the 2nd Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: 1});
 * // => Feature<Point<[-10, -10]>>
 *
 * // Last Segment of last Multi-Feature
 * turf.findPoint(multiLine, {multiFeatureIndex: -1, coordIndex: -1});
 * // => Feature<Point<[-30, -40]>>
 */
function findPoint(geojson, options) {
  // Optional Parameters
  options = options || {};
  if (!isObject(options)) { throw new Error("options is invalid"); }
  var featureIndex = options.featureIndex || 0;
  var multiFeatureIndex = options.multiFeatureIndex || 0;
  var geometryIndex = options.geometryIndex || 0;
  var coordIndex = options.coordIndex || 0;

  // Find FeatureIndex
  var properties = options.properties;
  var geometry;

  switch (geojson.type) {
    case "FeatureCollection":
      if (featureIndex < 0)
        { featureIndex = geojson.features.length + featureIndex; }
      properties = properties || geojson.features[featureIndex].properties;
      geometry = geojson.features[featureIndex].geometry;
      break;
    case "Feature":
      properties = properties || geojson.properties;
      geometry = geojson.geometry;
      break;
    case "Point":
    case "MultiPoint":
      return null;
    case "LineString":
    case "Polygon":
    case "MultiLineString":
    case "MultiPolygon":
      geometry = geojson;
      break;
    default:
      throw new Error("geojson is invalid");
  }

  // Find Coord Index
  if (geometry === null) { return null; }
  var coords = geometry.coordinates;
  switch (geometry.type) {
    case "Point":
      return point(coords, properties, options);
    case "MultiPoint":
      if (multiFeatureIndex < 0)
        { multiFeatureIndex = coords.length + multiFeatureIndex; }
      return point(coords[multiFeatureIndex], properties, options);
    case "LineString":
      if (coordIndex < 0) { coordIndex = coords.length + coordIndex; }
      return point(coords[coordIndex], properties, options);
    case "Polygon":
      if (geometryIndex < 0) { geometryIndex = coords.length + geometryIndex; }
      if (coordIndex < 0)
        { coordIndex = coords[geometryIndex].length + coordIndex; }
      return point(coords[geometryIndex][coordIndex], properties, options);
    case "MultiLineString":
      if (multiFeatureIndex < 0)
        { multiFeatureIndex = coords.length + multiFeatureIndex; }
      if (coordIndex < 0)
        { coordIndex = coords[multiFeatureIndex].length + coordIndex; }
      return point(coords[multiFeatureIndex][coordIndex], properties, options);
    case "MultiPolygon":
      if (multiFeatureIndex < 0)
        { multiFeatureIndex = coords.length + multiFeatureIndex; }
      if (geometryIndex < 0)
        { geometryIndex = coords[multiFeatureIndex].length + geometryIndex; }
      if (coordIndex < 0)
        { coordIndex =
          coords[multiFeatureIndex][geometryIndex].length - coordIndex; }
      return point(
        coords[multiFeatureIndex][geometryIndex][coordIndex],
        properties,
        options
      );
  }
  throw new Error("geojson is invalid");
}

/**
 * Rewind {@link LineString|(Multi)LineString} or {@link Polygon|(Multi)Polygon} outer ring counterclockwise and inner rings clockwise (Uses {@link http://en.wikipedia.org/wiki/Shoelace_formula|Shoelace Formula}).
 *
 * @name rewind
 * @param {GeoJSON} geojson input GeoJSON Polygon
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.reverse=false] enable reverse winding
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} rewind Polygon
 * @example
 * var polygon = turf.polygon([[[121, -29], [138, -29], [138, -18], [121, -18], [121, -29]]]);
 *
 * var rewind = turf.rewind(polygon);
 *
 * //addToMap
 * var addToMap = [rewind];
 */
function rewind(geojson, options) {
  // Optional parameters
  options = options || {};
  if (!isObject(options)) { throw new Error("options is invalid"); }
  var reverse = options.reverse || false;
  var mutate = options.mutate || false;

  // validation
  if (!geojson) { throw new Error("<geojson> is required"); }
  if (typeof reverse !== "boolean")
    { throw new Error("<reverse> must be a boolean"); }
  if (typeof mutate !== "boolean")
    { throw new Error("<mutate> must be a boolean"); }

  // prevent input mutation
  if (mutate === false) { geojson = clone(geojson); }

  // Support Feature Collection or Geometry Collection
  var results = [];
  switch (geojson.type) {
    case "GeometryCollection":
      geomEach(geojson, function (geometry) {
        rewindFeature(geometry, reverse);
      });
      return geojson;
    case "FeatureCollection":
      featureEach(geojson, function (feature) {
        featureEach(rewindFeature(feature, reverse), function (result) {
          results.push(result);
        });
      });
      return featureCollection(results);
  }
  // Support Feature or Geometry Objects
  return rewindFeature(geojson, reverse);
}

/**
 * Rewind
 *
 * @private
 * @param {Geometry|Feature<any>} geojson Geometry or Feature
 * @param {Boolean} [reverse=false] enable reverse winding
 * @returns {Geometry|Feature<any>} rewind Geometry or Feature
 */
function rewindFeature(geojson, reverse) {
  var type = geojson.type === "Feature" ? geojson.geometry.type : geojson.type;

  // Support all GeoJSON Geometry Objects
  switch (type) {
    case "GeometryCollection":
      geomEach(geojson, function (geometry) {
        rewindFeature(geometry, reverse);
      });
      return geojson;
    case "LineString":
      rewindLineString(getCoords(geojson), reverse);
      return geojson;
    case "Polygon":
      rewindPolygon(getCoords(geojson), reverse);
      return geojson;
    case "MultiLineString":
      getCoords(geojson).forEach(function (lineCoords) {
        rewindLineString(lineCoords, reverse);
      });
      return geojson;
    case "MultiPolygon":
      getCoords(geojson).forEach(function (lineCoords) {
        rewindPolygon(lineCoords, reverse);
      });
      return geojson;
    case "Point":
    case "MultiPoint":
      return geojson;
  }
}

/**
 * Rewind LineString - outer ring clockwise
 *
 * @private
 * @param {Array<Array<number>>} coords GeoJSON LineString geometry coordinates
 * @param {Boolean} [reverse=false] enable reverse winding
 * @returns {void} mutates coordinates
 */
function rewindLineString(coords, reverse) {
  if (booleanClockwise(coords) === reverse) { coords.reverse(); }
}

/**
 * Rewind Polygon - outer ring counterclockwise and inner rings clockwise.
 *
 * @private
 * @param {Array<Array<Array<number>>>} coords GeoJSON Polygon geometry coordinates
 * @param {Boolean} [reverse=false] enable reverse winding
 * @returns {void} mutates coordinates
 */
function rewindPolygon(coords, reverse) {
  // outer ring
  if (booleanClockwise(coords[0]) !== reverse) {
    coords[0].reverse();
  }
  // inner rings
  for (var i = 1; i < coords.length; i++) {
    if (booleanClockwise(coords[i]) === reverse) {
      coords[i].reverse();
    }
  }
}

function pointInPolygon(p, polygon) {
    var i = 0;
    var ii = 0;
    var k = 0;
    var f = 0;
    var u1 = 0;
    var v1 = 0;
    var u2 = 0;
    var v2 = 0;
    var currentP = null;
    var nextP = null;

    var x = p[0];
    var y = p[1];

    var numContours = polygon.length;
    for (i; i < numContours; i++) {
        ii = 0;
        var contourLen = polygon[i].length - 1;
        var contour = polygon[i];

        currentP = contour[0];
        if (currentP[0] !== contour[contourLen][0] &&
            currentP[1] !== contour[contourLen][1]) {
            throw new Error('First and last coordinates in a ring must be the same')
        }

        u1 = currentP[0] - x;
        v1 = currentP[1] - y;

        for (ii; ii < contourLen; ii++) {
            nextP = contour[ii + 1];

            v2 = nextP[1] - y;

            if ((v1 < 0 && v2 < 0) || (v1 > 0 && v2 > 0)) {
                currentP = nextP;
                v1 = v2;
                u1 = currentP[0] - x;
                continue
            }

            u2 = nextP[0] - p[0];

            if (v2 > 0 && v1 <= 0) {
                f = (u1 * v2) - (u2 * v1);
                if (f > 0) { k = k + 1; }
                else if (f === 0) { return 0 }
            } else if (v1 > 0 && v2 <= 0) {
                f = (u1 * v2) - (u2 * v1);
                if (f < 0) { k = k + 1; }
                else if (f === 0) { return 0 }
            } else if (v2 === 0 && v1 < 0) {
                f = (u1 * v2) - (u2 * v1);
                if (f === 0) { return 0 }
            } else if (v1 === 0 && v2 < 0) {
                f = u1 * v2 - u2 * v1;
                if (f === 0) { return 0 }
            } else if (v1 === 0 && v2 === 0) {
                if (u2 <= 0 && u1 >= 0) {
                    return 0
                } else if (u1 <= 0 && u2 >= 0) {
                    return 0
                }
            }
            currentP = nextP;
            v1 = v2;
            u1 = u2;
        }
    }

    if (k % 2 === 0) { return false }
    return true
}

var epsilon = 1.1102230246251565e-16;
var splitter = 134217729;
var resulterrbound = (3 + 8 * epsilon) * epsilon;

// fast_expansion_sum_zeroelim routine from oritinal code
function sum(elen, e, flen, f, h) {
    var Q, Qnew, hh, bvirt;
    var enow = e[0];
    var fnow = f[0];
    var eindex = 0;
    var findex = 0;
    if ((fnow > enow) === (fnow > -enow)) {
        Q = enow;
        enow = e[++eindex];
    } else {
        Q = fnow;
        fnow = f[++findex];
    }
    var hindex = 0;
    if (eindex < elen && findex < flen) {
        if ((fnow > enow) === (fnow > -enow)) {
            Qnew = enow + Q;
            hh = Q - (Qnew - enow);
            enow = e[++eindex];
        } else {
            Qnew = fnow + Q;
            hh = Q - (Qnew - fnow);
            fnow = f[++findex];
        }
        Q = Qnew;
        if (hh !== 0) {
            h[hindex++] = hh;
        }
        while (eindex < elen && findex < flen) {
            if ((fnow > enow) === (fnow > -enow)) {
                Qnew = Q + enow;
                bvirt = Qnew - Q;
                hh = Q - (Qnew - bvirt) + (enow - bvirt);
                enow = e[++eindex];
            } else {
                Qnew = Q + fnow;
                bvirt = Qnew - Q;
                hh = Q - (Qnew - bvirt) + (fnow - bvirt);
                fnow = f[++findex];
            }
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
        }
    }
    while (eindex < elen) {
        Qnew = Q + enow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (enow - bvirt);
        enow = e[++eindex];
        Q = Qnew;
        if (hh !== 0) {
            h[hindex++] = hh;
        }
    }
    while (findex < flen) {
        Qnew = Q + fnow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (fnow - bvirt);
        fnow = f[++findex];
        Q = Qnew;
        if (hh !== 0) {
            h[hindex++] = hh;
        }
    }
    if (Q !== 0 || hindex === 0) {
        h[hindex++] = Q;
    }
    return hindex;
}

function sum_three(alen, a, blen, b, clen, c, tmp, out) {
    return sum(sum(alen, a, blen, b, tmp), tmp, clen, c, out);
}

// scale_expansion_zeroelim routine from oritinal code
function scale(elen, e, b, h) {
    var Q, sum, hh, product1, product0;
    var bvirt, c, ahi, alo, bhi, blo;

    c = splitter * b;
    bhi = c - (c - b);
    blo = b - bhi;
    var enow = e[0];
    Q = enow * b;
    c = splitter * enow;
    ahi = c - (c - enow);
    alo = enow - ahi;
    hh = alo * blo - (Q - ahi * bhi - alo * bhi - ahi * blo);
    var hindex = 0;
    if (hh !== 0) {
        h[hindex++] = hh;
    }
    for (var i = 1; i < elen; i++) {
        enow = e[i];
        product1 = enow * b;
        c = splitter * enow;
        ahi = c - (c - enow);
        alo = enow - ahi;
        product0 = alo * blo - (product1 - ahi * bhi - alo * bhi - ahi * blo);
        sum = Q + product0;
        bvirt = sum - Q;
        hh = Q - (sum - bvirt) + (product0 - bvirt);
        if (hh !== 0) {
            h[hindex++] = hh;
        }
        Q = product1 + sum;
        hh = sum - (Q - product1);
        if (hh !== 0) {
            h[hindex++] = hh;
        }
    }
    if (Q !== 0 || hindex === 0) {
        h[hindex++] = Q;
    }
    return hindex;
}

function negate(elen, e) {
    for (var i = 0; i < elen; i++) { e[i] = -e[i]; }
    return elen;
}

function estimate(elen, e) {
    var Q = e[0];
    for (var i = 1; i < elen; i++) { Q += e[i]; }
    return Q;
}

function vec(n) {
    return new Float64Array(n);
}

var ccwerrboundA = (3 + 16 * epsilon) * epsilon;
var ccwerrboundB = (2 + 12 * epsilon) * epsilon;
var ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;

var B = vec(4);
var C1 = vec(8);
var C2 = vec(12);
var D = vec(16);
var u$2 = vec(4);

function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
    var acxtail, acytail, bcxtail, bcytail;
    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

    var acx = ax - cx;
    var bcx = bx - cx;
    var acy = ay - cy;
    var bcy = by - cy;

    s1 = acx * bcy;
    c = splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcx;
    c = splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    B[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    B[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    B[2] = _j - (u3 - bvirt) + (_i - bvirt);
    B[3] = u3;

    var det = estimate(4, B);
    var errbound = ccwerrboundB * detsum;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - acx;
    acxtail = ax - (acx + bvirt) + (bvirt - cx);
    bvirt = bx - bcx;
    bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
    bvirt = ay - acy;
    acytail = ay - (acy + bvirt) + (bvirt - cy);
    bvirt = by - bcy;
    bcytail = by - (bcy + bvirt) + (bvirt - cy);

    if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
        return det;
    }

    errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
    det += (acx * bcytail + bcy * acxtail) - (acy * bcxtail + bcx * acytail);
    if (det >= errbound || -det >= errbound) { return det; }

    s1 = acxtail * bcy;
    c = splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcx;
    c = splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u$2[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u$2[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u$2[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u$2[3] = u3;
    var C1len = sum(4, B, 4, u$2, C1);

    s1 = acx * bcytail;
    c = splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcxtail;
    c = splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u$2[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u$2[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u$2[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u$2[3] = u3;
    var C2len = sum(C1len, C1, 4, u$2, C2);

    s1 = acxtail * bcytail;
    c = splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcxtail;
    c = splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u$2[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u$2[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u$2[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u$2[3] = u3;
    var Dlen = sum(C2len, C2, 4, u$2, D);

    return D[Dlen - 1];
}

function orient2d(ax, ay, bx, by, cx, cy) {
    var detleft = (ay - cy) * (bx - cx);
    var detright = (ax - cx) * (by - cy);
    var det = detleft - detright;

    if (detleft === 0 || detright === 0 || (detleft > 0) !== (detright > 0)) { return det; }

    var detsum = Math.abs(detleft + detright);
    if (Math.abs(det) >= ccwerrboundA * detsum) { return det; }

    return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
}

function orient2dfast(ax, ay, bx, by, cx, cy) {
    return (ay - cy) * (bx - cx) - (ax - cx) * (by - cy);
}

var o3derrboundA = (7 + 56 * epsilon) * epsilon;
var o3derrboundB = (3 + 28 * epsilon) * epsilon;
var o3derrboundC = (26 + 288 * epsilon) * epsilon * epsilon;

var bc$2 = vec(4);
var ca$1 = vec(4);
var ab$2 = vec(4);
var at_b = vec(4);
var at_c = vec(4);
var bt_c = vec(4);
var bt_a = vec(4);
var ct_a = vec(4);
var ct_b = vec(4);
var bct$1 = vec(8);
var cat$1 = vec(8);
var abt$1 = vec(8);
var u$1 = vec(4);

var _8$2 = vec(8);
var _8b$1 = vec(8);
var _16$2 = vec(8);
var _12 = vec(12);

var fin$2 = vec(192);
var fin2$1 = vec(192);

function finadd$1(finlen, alen, a) {
    finlen = sum(finlen, fin$2, alen, a, fin2$1);
    var tmp = fin$2; fin$2 = fin2$1; fin2$1 = tmp;
    return finlen;
}

function tailinit(xtail, ytail, ax, ay, bx, by, a, b) {
    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _k, _0, s1, s0, t1, t0, u3, negate;
    if (xtail === 0) {
        if (ytail === 0) {
            a[0] = 0;
            b[0] = 0;
            return 1;
        } else {
            negate = -ytail;
            s1 = negate * ax;
            c = splitter * negate;
            ahi = c - (c - negate);
            alo = negate - ahi;
            c = splitter * ax;
            bhi = c - (c - ax);
            blo = ax - bhi;
            a[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            a[1] = s1;
            s1 = ytail * bx;
            c = splitter * ytail;
            ahi = c - (c - ytail);
            alo = ytail - ahi;
            c = splitter * bx;
            bhi = c - (c - bx);
            blo = bx - bhi;
            b[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            b[1] = s1;
            return 2;
        }
    } else {
        if (ytail === 0) {
            s1 = xtail * ay;
            c = splitter * xtail;
            ahi = c - (c - xtail);
            alo = xtail - ahi;
            c = splitter * ay;
            bhi = c - (c - ay);
            blo = ay - bhi;
            a[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            a[1] = s1;
            negate = -xtail;
            s1 = negate * by;
            c = splitter * negate;
            ahi = c - (c - negate);
            alo = negate - ahi;
            c = splitter * by;
            bhi = c - (c - by);
            blo = by - bhi;
            b[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            b[1] = s1;
            return 2;
        } else {
            s1 = xtail * ay;
            c = splitter * xtail;
            ahi = c - (c - xtail);
            alo = xtail - ahi;
            c = splitter * ay;
            bhi = c - (c - ay);
            blo = ay - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = ytail * ax;
            c = splitter * ytail;
            ahi = c - (c - ytail);
            alo = ytail - ahi;
            c = splitter * ax;
            bhi = c - (c - ax);
            blo = ax - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            a[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            a[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            a[2] = _j - (u3 - bvirt) + (_i - bvirt);
            a[3] = u3;
            s1 = ytail * bx;
            c = splitter * ytail;
            ahi = c - (c - ytail);
            alo = ytail - ahi;
            c = splitter * bx;
            bhi = c - (c - bx);
            blo = bx - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = xtail * by;
            c = splitter * xtail;
            ahi = c - (c - xtail);
            alo = xtail - ahi;
            c = splitter * by;
            bhi = c - (c - by);
            blo = by - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            b[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            b[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            b[2] = _j - (u3 - bvirt) + (_i - bvirt);
            b[3] = u3;
            return 4;
        }
    }
}

function tailadd(finlen, a, b, k, z) {
    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _k, _0, s1, s0, u3;
    s1 = a * b;
    c = splitter * a;
    ahi = c - (c - a);
    alo = a - ahi;
    c = splitter * b;
    bhi = c - (c - b);
    blo = b - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    c = splitter * k;
    bhi = c - (c - k);
    blo = k - bhi;
    _i = s0 * k;
    c = splitter * s0;
    ahi = c - (c - s0);
    alo = s0 - ahi;
    u$1[0] = alo * blo - (_i - ahi * bhi - alo * bhi - ahi * blo);
    _j = s1 * k;
    c = splitter * s1;
    ahi = c - (c - s1);
    alo = s1 - ahi;
    _0 = alo * blo - (_j - ahi * bhi - alo * bhi - ahi * blo);
    _k = _i + _0;
    bvirt = _k - _i;
    u$1[1] = _i - (_k - bvirt) + (_0 - bvirt);
    u3 = _j + _k;
    u$1[2] = _k - (u3 - _j);
    u$1[3] = u3;
    finlen = finadd$1(finlen, 4, u$1);
    if (z !== 0) {
        c = splitter * z;
        bhi = c - (c - z);
        blo = z - bhi;
        _i = s0 * z;
        c = splitter * s0;
        ahi = c - (c - s0);
        alo = s0 - ahi;
        u$1[0] = alo * blo - (_i - ahi * bhi - alo * bhi - ahi * blo);
        _j = s1 * z;
        c = splitter * s1;
        ahi = c - (c - s1);
        alo = s1 - ahi;
        _0 = alo * blo - (_j - ahi * bhi - alo * bhi - ahi * blo);
        _k = _i + _0;
        bvirt = _k - _i;
        u$1[1] = _i - (_k - bvirt) + (_0 - bvirt);
        u3 = _j + _k;
        u$1[2] = _k - (u3 - _j);
        u$1[3] = u3;
        finlen = finadd$1(finlen, 4, u$1);
    }
    return finlen;
}

function orient3dadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, permanent) {
    var finlen;
    var adxtail, bdxtail, cdxtail;
    var adytail, bdytail, cdytail;
    var adztail, bdztail, cdztail;
    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _k, _0, s1, s0, t1, t0, u3;

    var adx = ax - dx;
    var bdx = bx - dx;
    var cdx = cx - dx;
    var ady = ay - dy;
    var bdy = by - dy;
    var cdy = cy - dy;
    var adz = az - dz;
    var bdz = bz - dz;
    var cdz = cz - dz;

    s1 = bdx * cdy;
    c = splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cdx * bdy;
    c = splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc$2[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc$2[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bc$2[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bc$2[3] = u3;
    s1 = cdx * ady;
    c = splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = adx * cdy;
    c = splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ca$1[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ca$1[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ca$1[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ca$1[3] = u3;
    s1 = adx * bdy;
    c = splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bdx * ady;
    c = splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab$2[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab$2[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ab$2[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ab$2[3] = u3;

    finlen = sum(
        sum(
            scale(4, bc$2, adz, _8$2), _8$2,
            scale(4, ca$1, bdz, _8b$1), _8b$1, _16$2), _16$2,
        scale(4, ab$2, cdz, _8$2), _8$2, fin$2);

    var det = estimate(finlen, fin$2);
    var errbound = o3derrboundB * permanent;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - adx;
    adxtail = ax - (adx + bvirt) + (bvirt - dx);
    bvirt = bx - bdx;
    bdxtail = bx - (bdx + bvirt) + (bvirt - dx);
    bvirt = cx - cdx;
    cdxtail = cx - (cdx + bvirt) + (bvirt - dx);
    bvirt = ay - ady;
    adytail = ay - (ady + bvirt) + (bvirt - dy);
    bvirt = by - bdy;
    bdytail = by - (bdy + bvirt) + (bvirt - dy);
    bvirt = cy - cdy;
    cdytail = cy - (cdy + bvirt) + (bvirt - dy);
    bvirt = az - adz;
    adztail = az - (adz + bvirt) + (bvirt - dz);
    bvirt = bz - bdz;
    bdztail = bz - (bdz + bvirt) + (bvirt - dz);
    bvirt = cz - cdz;
    cdztail = cz - (cdz + bvirt) + (bvirt - dz);

    if (adxtail === 0 && bdxtail === 0 && cdxtail === 0 &&
        adytail === 0 && bdytail === 0 && cdytail === 0 &&
        adztail === 0 && bdztail === 0 && cdztail === 0) {
        return det;
    }

    errbound = o3derrboundC * permanent + resulterrbound * Math.abs(det);
    det +=
        adz * (bdx * cdytail + cdy * bdxtail - (bdy * cdxtail + cdx * bdytail)) + adztail * (bdx * cdy - bdy * cdx) +
        bdz * (cdx * adytail + ady * cdxtail - (cdy * adxtail + adx * cdytail)) + bdztail * (cdx * ady - cdy * adx) +
        cdz * (adx * bdytail + bdy * adxtail - (ady * bdxtail + bdx * adytail)) + cdztail * (adx * bdy - ady * bdx);
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    var at_len = tailinit(adxtail, adytail, bdx, bdy, cdx, cdy, at_b, at_c);
    var bt_len = tailinit(bdxtail, bdytail, cdx, cdy, adx, ady, bt_c, bt_a);
    var ct_len = tailinit(cdxtail, cdytail, adx, ady, bdx, bdy, ct_a, ct_b);

    var bctlen = sum(bt_len, bt_c, ct_len, ct_b, bct$1);
    finlen = finadd$1(finlen, scale(bctlen, bct$1, adz, _16$2), _16$2);

    var catlen = sum(ct_len, ct_a, at_len, at_c, cat$1);
    finlen = finadd$1(finlen, scale(catlen, cat$1, bdz, _16$2), _16$2);

    var abtlen = sum(at_len, at_b, bt_len, bt_a, abt$1);
    finlen = finadd$1(finlen, scale(abtlen, abt$1, cdz, _16$2), _16$2);

    if (adztail !== 0) {
        finlen = finadd$1(finlen, scale(4, bc$2, adztail, _12), _12);
        finlen = finadd$1(finlen, scale(bctlen, bct$1, adztail, _16$2), _16$2);
    }
    if (bdztail !== 0) {
        finlen = finadd$1(finlen, scale(4, ca$1, bdztail, _12), _12);
        finlen = finadd$1(finlen, scale(catlen, cat$1, bdztail, _16$2), _16$2);
    }
    if (cdztail !== 0) {
        finlen = finadd$1(finlen, scale(4, ab$2, cdztail, _12), _12);
        finlen = finadd$1(finlen, scale(abtlen, abt$1, cdztail, _16$2), _16$2);
    }

    if (adxtail !== 0) {
        if (bdytail !== 0) {
            finlen = tailadd(finlen, adxtail, bdytail, cdz, cdztail);
        }
        if (cdytail !== 0) {
            finlen = tailadd(finlen, -adxtail, cdytail, bdz, bdztail);
        }
    }
    if (bdxtail !== 0) {
        if (cdytail !== 0) {
            finlen = tailadd(finlen, bdxtail, cdytail, adz, adztail);
        }
        if (adytail !== 0) {
            finlen = tailadd(finlen, -bdxtail, adytail, cdz, cdztail);
        }
    }
    if (cdxtail !== 0) {
        if (adytail !== 0) {
            finlen = tailadd(finlen, cdxtail, adytail, bdz, bdztail);
        }
        if (bdytail !== 0) {
            finlen = tailadd(finlen, -cdxtail, bdytail, adz, adztail);
        }
    }

    return fin$2[finlen - 1];
}

function orient3d(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {
    var adx = ax - dx;
    var bdx = bx - dx;
    var cdx = cx - dx;
    var ady = ay - dy;
    var bdy = by - dy;
    var cdy = cy - dy;
    var adz = az - dz;
    var bdz = bz - dz;
    var cdz = cz - dz;

    var bdxcdy = bdx * cdy;
    var cdxbdy = cdx * bdy;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;

    var det =
        adz * (bdxcdy - cdxbdy) +
        bdz * (cdxady - adxcdy) +
        cdz * (adxbdy - bdxady);

    var permanent =
        (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz) +
        (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz) +
        (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz);

    var errbound = o3derrboundA * permanent;
    if (det > errbound || -det > errbound) {
        return det;
    }

    return orient3dadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, permanent);
}

function orient3dfast(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {
    var adx = ax - dx;
    var bdx = bx - dx;
    var cdx = cx - dx;
    var ady = ay - dy;
    var bdy = by - dy;
    var cdy = cy - dy;
    var adz = az - dz;
    var bdz = bz - dz;
    var cdz = cz - dz;

    return adx * (bdy * cdz - bdz * cdy) +
        bdx * (cdy * adz - cdz * ady) +
        cdx * (ady * bdz - adz * bdy);
}

var iccerrboundA = (10 + 96 * epsilon) * epsilon;
var iccerrboundB = (4 + 48 * epsilon) * epsilon;
var iccerrboundC = (44 + 576 * epsilon) * epsilon * epsilon;

var bc$1 = vec(4);
var ca = vec(4);
var ab$1 = vec(4);
var aa = vec(4);
var bb = vec(4);
var cc = vec(4);
var u = vec(4);
var v = vec(4);
var axtbc = vec(8);
var aytbc = vec(8);
var bxtca = vec(8);
var bytca = vec(8);
var cxtab = vec(8);
var cytab = vec(8);
var abt = vec(8);
var bct = vec(8);
var cat = vec(8);
var abtt = vec(4);
var bctt = vec(4);
var catt = vec(4);

var _8$1 = vec(8);
var _16$1 = vec(16);
var _16b = vec(16);
var _16c = vec(16);
var _32 = vec(32);
var _32b = vec(32);
var _48$1 = vec(48);
var _64 = vec(64);

var fin$1 = vec(1152);
var fin2 = vec(1152);

function finadd(finlen, a, alen) {
    finlen = sum(finlen, fin$1, a, alen, fin2);
    var tmp = fin$1; fin$1 = fin2; fin2 = tmp;
    return finlen;
}

function incircleadapt(ax, ay, bx, by, cx, cy, dx, dy, permanent) {
    var finlen;
    var adxtail, bdxtail, cdxtail, adytail, bdytail, cdytail;
    var axtbclen, aytbclen, bxtcalen, bytcalen, cxtablen, cytablen;
    var abtlen, bctlen, catlen;
    var abttlen, bcttlen, cattlen;
    var n1, n0;

    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

    var adx = ax - dx;
    var bdx = bx - dx;
    var cdx = cx - dx;
    var ady = ay - dy;
    var bdy = by - dy;
    var cdy = cy - dy;

    s1 = bdx * cdy;
    c = splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cdx * bdy;
    c = splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc$1[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc$1[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bc$1[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bc$1[3] = u3;
    s1 = cdx * ady;
    c = splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = adx * cdy;
    c = splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ca[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ca[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ca[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ca[3] = u3;
    s1 = adx * bdy;
    c = splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bdx * ady;
    c = splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab$1[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab$1[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ab$1[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ab$1[3] = u3;

    finlen = sum(
        sum(
            sum(
                scale(scale(4, bc$1, adx, _8$1), _8$1, adx, _16$1), _16$1,
                scale(scale(4, bc$1, ady, _8$1), _8$1, ady, _16b), _16b, _32), _32,
            sum(
                scale(scale(4, ca, bdx, _8$1), _8$1, bdx, _16$1), _16$1,
                scale(scale(4, ca, bdy, _8$1), _8$1, bdy, _16b), _16b, _32b), _32b, _64), _64,
        sum(
            scale(scale(4, ab$1, cdx, _8$1), _8$1, cdx, _16$1), _16$1,
            scale(scale(4, ab$1, cdy, _8$1), _8$1, cdy, _16b), _16b, _32), _32, fin$1);

    var det = estimate(finlen, fin$1);
    var errbound = iccerrboundB * permanent;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - adx;
    adxtail = ax - (adx + bvirt) + (bvirt - dx);
    bvirt = ay - ady;
    adytail = ay - (ady + bvirt) + (bvirt - dy);
    bvirt = bx - bdx;
    bdxtail = bx - (bdx + bvirt) + (bvirt - dx);
    bvirt = by - bdy;
    bdytail = by - (bdy + bvirt) + (bvirt - dy);
    bvirt = cx - cdx;
    cdxtail = cx - (cdx + bvirt) + (bvirt - dx);
    bvirt = cy - cdy;
    cdytail = cy - (cdy + bvirt) + (bvirt - dy);
    if (adxtail === 0 && bdxtail === 0 && cdxtail === 0 && adytail === 0 && bdytail === 0 && cdytail === 0) {
        return det;
    }

    errbound = iccerrboundC * permanent + resulterrbound * Math.abs(det);
    det += ((adx * adx + ady * ady) * ((bdx * cdytail + cdy * bdxtail) - (bdy * cdxtail + cdx * bdytail)) +
        2 * (adx * adxtail + ady * adytail) * (bdx * cdy - bdy * cdx)) +
        ((bdx * bdx + bdy * bdy) * ((cdx * adytail + ady * cdxtail) - (cdy * adxtail + adx * cdytail)) +
        2 * (bdx * bdxtail + bdy * bdytail) * (cdx * ady - cdy * adx)) +
        ((cdx * cdx + cdy * cdy) * ((adx * bdytail + bdy * adxtail) - (ady * bdxtail + bdx * adytail)) +
        2 * (cdx * cdxtail + cdy * cdytail) * (adx * bdy - ady * bdx));

    if (det >= errbound || -det >= errbound) {
        return det;
    }

    if (bdxtail !== 0 || bdytail !== 0 || cdxtail !== 0 || cdytail !== 0) {
        s1 = adx * adx;
        c = splitter * adx;
        ahi = c - (c - adx);
        alo = adx - ahi;
        s0 = alo * alo - (s1 - ahi * ahi - (ahi + ahi) * alo);
        t1 = ady * ady;
        c = splitter * ady;
        ahi = c - (c - ady);
        alo = ady - ahi;
        t0 = alo * alo - (t1 - ahi * ahi - (ahi + ahi) * alo);
        _i = s0 + t0;
        bvirt = _i - s0;
        aa[0] = s0 - (_i - bvirt) + (t0 - bvirt);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 + t1;
        bvirt = _i - _0;
        aa[1] = _0 - (_i - bvirt) + (t1 - bvirt);
        u3 = _j + _i;
        bvirt = u3 - _j;
        aa[2] = _j - (u3 - bvirt) + (_i - bvirt);
        aa[3] = u3;
    }
    if (cdxtail !== 0 || cdytail !== 0 || adxtail !== 0 || adytail !== 0) {
        s1 = bdx * bdx;
        c = splitter * bdx;
        ahi = c - (c - bdx);
        alo = bdx - ahi;
        s0 = alo * alo - (s1 - ahi * ahi - (ahi + ahi) * alo);
        t1 = bdy * bdy;
        c = splitter * bdy;
        ahi = c - (c - bdy);
        alo = bdy - ahi;
        t0 = alo * alo - (t1 - ahi * ahi - (ahi + ahi) * alo);
        _i = s0 + t0;
        bvirt = _i - s0;
        bb[0] = s0 - (_i - bvirt) + (t0 - bvirt);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 + t1;
        bvirt = _i - _0;
        bb[1] = _0 - (_i - bvirt) + (t1 - bvirt);
        u3 = _j + _i;
        bvirt = u3 - _j;
        bb[2] = _j - (u3 - bvirt) + (_i - bvirt);
        bb[3] = u3;
    }
    if (adxtail !== 0 || adytail !== 0 || bdxtail !== 0 || bdytail !== 0) {
        s1 = cdx * cdx;
        c = splitter * cdx;
        ahi = c - (c - cdx);
        alo = cdx - ahi;
        s0 = alo * alo - (s1 - ahi * ahi - (ahi + ahi) * alo);
        t1 = cdy * cdy;
        c = splitter * cdy;
        ahi = c - (c - cdy);
        alo = cdy - ahi;
        t0 = alo * alo - (t1 - ahi * ahi - (ahi + ahi) * alo);
        _i = s0 + t0;
        bvirt = _i - s0;
        cc[0] = s0 - (_i - bvirt) + (t0 - bvirt);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 + t1;
        bvirt = _i - _0;
        cc[1] = _0 - (_i - bvirt) + (t1 - bvirt);
        u3 = _j + _i;
        bvirt = u3 - _j;
        cc[2] = _j - (u3 - bvirt) + (_i - bvirt);
        cc[3] = u3;
    }

    if (adxtail !== 0) {
        axtbclen = scale(4, bc$1, adxtail, axtbc);
        finlen = finadd(finlen, sum_three(
            scale(axtbclen, axtbc, 2 * adx, _16$1), _16$1,
            scale(scale(4, cc, adxtail, _8$1), _8$1, bdy, _16b), _16b,
            scale(scale(4, bb, adxtail, _8$1), _8$1, -cdy, _16c), _16c, _32, _48$1), _48$1);
    }
    if (adytail !== 0) {
        aytbclen = scale(4, bc$1, adytail, aytbc);
        finlen = finadd(finlen, sum_three(
            scale(aytbclen, aytbc, 2 * ady, _16$1), _16$1,
            scale(scale(4, bb, adytail, _8$1), _8$1, cdx, _16b), _16b,
            scale(scale(4, cc, adytail, _8$1), _8$1, -bdx, _16c), _16c, _32, _48$1), _48$1);
    }
    if (bdxtail !== 0) {
        bxtcalen = scale(4, ca, bdxtail, bxtca);
        finlen = finadd(finlen, sum_three(
            scale(bxtcalen, bxtca, 2 * bdx, _16$1), _16$1,
            scale(scale(4, aa, bdxtail, _8$1), _8$1, cdy, _16b), _16b,
            scale(scale(4, cc, bdxtail, _8$1), _8$1, -ady, _16c), _16c, _32, _48$1), _48$1);
    }
    if (bdytail !== 0) {
        bytcalen = scale(4, ca, bdytail, bytca);
        finlen = finadd(finlen, sum_three(
            scale(bytcalen, bytca, 2 * bdy, _16$1), _16$1,
            scale(scale(4, cc, bdytail, _8$1), _8$1, adx, _16b), _16b,
            scale(scale(4, aa, bdytail, _8$1), _8$1, -cdx, _16c), _16c, _32, _48$1), _48$1);
    }
    if (cdxtail !== 0) {
        cxtablen = scale(4, ab$1, cdxtail, cxtab);
        finlen = finadd(finlen, sum_three(
            scale(cxtablen, cxtab, 2 * cdx, _16$1), _16$1,
            scale(scale(4, bb, cdxtail, _8$1), _8$1, ady, _16b), _16b,
            scale(scale(4, aa, cdxtail, _8$1), _8$1, -bdy, _16c), _16c, _32, _48$1), _48$1);
    }
    if (cdytail !== 0) {
        cytablen = scale(4, ab$1, cdytail, cytab);
        finlen = finadd(finlen, sum_three(
            scale(cytablen, cytab, 2 * cdy, _16$1), _16$1,
            scale(scale(4, aa, cdytail, _8$1), _8$1, bdx, _16b), _16b,
            scale(scale(4, bb, cdytail, _8$1), _8$1, -adx, _16c), _16c, _32, _48$1), _48$1);
    }

    if (adxtail !== 0 || adytail !== 0) {
        if (bdxtail !== 0 || bdytail !== 0 || cdxtail !== 0 || cdytail !== 0) {
            s1 = bdxtail * cdy;
            c = splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = splitter * cdy;
            bhi = c - (c - cdy);
            blo = cdy - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = bdx * cdytail;
            c = splitter * bdx;
            ahi = c - (c - bdx);
            alo = bdx - ahi;
            c = splitter * cdytail;
            bhi = c - (c - cdytail);
            blo = cdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            u[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            u[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            u[2] = _j - (u3 - bvirt) + (_i - bvirt);
            u[3] = u3;
            s1 = cdxtail * -bdy;
            c = splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = splitter * -bdy;
            bhi = c - (c - -bdy);
            blo = -bdy - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = cdx * -bdytail;
            c = splitter * cdx;
            ahi = c - (c - cdx);
            alo = cdx - ahi;
            c = splitter * -bdytail;
            bhi = c - (c - -bdytail);
            blo = -bdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            v[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            v[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            v[2] = _j - (u3 - bvirt) + (_i - bvirt);
            v[3] = u3;
            bctlen = sum(4, u, 4, v, bct);
            s1 = bdxtail * cdytail;
            c = splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = splitter * cdytail;
            bhi = c - (c - cdytail);
            blo = cdytail - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = cdxtail * bdytail;
            c = splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = splitter * bdytail;
            bhi = c - (c - bdytail);
            blo = bdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            bctt[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            bctt[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            bctt[2] = _j - (u3 - bvirt) + (_i - bvirt);
            bctt[3] = u3;
            bcttlen = 4;
        } else {
            bct[0] = 0;
            bctlen = 1;
            bctt[0] = 0;
            bcttlen = 1;
        }
        if (adxtail !== 0) {
            var len = scale(bctlen, bct, adxtail, _16c);
            finlen = finadd(finlen, sum(
                scale(axtbclen, axtbc, adxtail, _16$1), _16$1,
                scale(len, _16c, 2 * adx, _32), _32, _48$1), _48$1);

            var len2 = scale(bcttlen, bctt, adxtail, _8$1);
            finlen = finadd(finlen, sum_three(
                scale(len2, _8$1, 2 * adx, _16$1), _16$1,
                scale(len2, _8$1, adxtail, _16b), _16b,
                scale(len, _16c, adxtail, _32), _32, _32b, _64), _64);

            if (bdytail !== 0) {
                finlen = finadd(finlen, scale(scale(4, cc, adxtail, _8$1), _8$1, bdytail, _16$1), _16$1);
            }
            if (cdytail !== 0) {
                finlen = finadd(finlen, scale(scale(4, bb, -adxtail, _8$1), _8$1, cdytail, _16$1), _16$1);
            }
        }
        if (adytail !== 0) {
            var len$1 = scale(bctlen, bct, adytail, _16c);
            finlen = finadd(finlen, sum(
                scale(aytbclen, aytbc, adytail, _16$1), _16$1,
                scale(len$1, _16c, 2 * ady, _32), _32, _48$1), _48$1);

            var len2$1 = scale(bcttlen, bctt, adytail, _8$1);
            finlen = finadd(finlen, sum_three(
                scale(len2$1, _8$1, 2 * ady, _16$1), _16$1,
                scale(len2$1, _8$1, adytail, _16b), _16b,
                scale(len$1, _16c, adytail, _32), _32, _32b, _64), _64);
        }
    }
    if (bdxtail !== 0 || bdytail !== 0) {
        if (cdxtail !== 0 || cdytail !== 0 || adxtail !== 0 || adytail !== 0) {
            s1 = cdxtail * ady;
            c = splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = splitter * ady;
            bhi = c - (c - ady);
            blo = ady - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = cdx * adytail;
            c = splitter * cdx;
            ahi = c - (c - cdx);
            alo = cdx - ahi;
            c = splitter * adytail;
            bhi = c - (c - adytail);
            blo = adytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            u[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            u[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            u[2] = _j - (u3 - bvirt) + (_i - bvirt);
            u[3] = u3;
            n1 = -cdy;
            n0 = -cdytail;
            s1 = adxtail * n1;
            c = splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = splitter * n1;
            bhi = c - (c - n1);
            blo = n1 - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = adx * n0;
            c = splitter * adx;
            ahi = c - (c - adx);
            alo = adx - ahi;
            c = splitter * n0;
            bhi = c - (c - n0);
            blo = n0 - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            v[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            v[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            v[2] = _j - (u3 - bvirt) + (_i - bvirt);
            v[3] = u3;
            catlen = sum(4, u, 4, v, cat);
            s1 = cdxtail * adytail;
            c = splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = splitter * adytail;
            bhi = c - (c - adytail);
            blo = adytail - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = adxtail * cdytail;
            c = splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = splitter * cdytail;
            bhi = c - (c - cdytail);
            blo = cdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            catt[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            catt[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            catt[2] = _j - (u3 - bvirt) + (_i - bvirt);
            catt[3] = u3;
            cattlen = 4;
        } else {
            cat[0] = 0;
            catlen = 1;
            catt[0] = 0;
            cattlen = 1;
        }
        if (bdxtail !== 0) {
            var len$2 = scale(catlen, cat, bdxtail, _16c);
            finlen = finadd(finlen, sum(
                scale(bxtcalen, bxtca, bdxtail, _16$1), _16$1,
                scale(len$2, _16c, 2 * bdx, _32), _32, _48$1), _48$1);

            var len2$2 = scale(cattlen, catt, bdxtail, _8$1);
            finlen = finadd(finlen, sum_three(
                scale(len2$2, _8$1, 2 * bdx, _16$1), _16$1,
                scale(len2$2, _8$1, bdxtail, _16b), _16b,
                scale(len$2, _16c, bdxtail, _32), _32, _32b, _64), _64);

            if (cdytail !== 0) {
                finlen = finadd(finlen, scale(scale(4, aa, bdxtail, _8$1), _8$1, cdytail, _16$1), _16$1);
            }
            if (adytail !== 0) {
                finlen = finadd(finlen, scale(scale(4, cc, -bdxtail, _8$1), _8$1, adytail, _16$1), _16$1);
            }
        }
        if (bdytail !== 0) {
            var len$3 = scale(catlen, cat, bdytail, _16c);
            finlen = finadd(finlen, sum(
                scale(bytcalen, bytca, bdytail, _16$1), _16$1,
                scale(len$3, _16c, 2 * bdy, _32), _32, _48$1), _48$1);

            var len2$3 = scale(cattlen, catt, bdytail, _8$1);
            finlen = finadd(finlen, sum_three(
                scale(len2$3, _8$1, 2 * bdy, _16$1), _16$1,
                scale(len2$3, _8$1, bdytail, _16b), _16b,
                scale(len$3, _16c, bdytail, _32), _32,  _32b, _64), _64);
        }
    }
    if (cdxtail !== 0 || cdytail !== 0) {
        if (adxtail !== 0 || adytail !== 0 || bdxtail !== 0 || bdytail !== 0) {
            s1 = adxtail * bdy;
            c = splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = splitter * bdy;
            bhi = c - (c - bdy);
            blo = bdy - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = adx * bdytail;
            c = splitter * adx;
            ahi = c - (c - adx);
            alo = adx - ahi;
            c = splitter * bdytail;
            bhi = c - (c - bdytail);
            blo = bdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            u[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            u[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            u[2] = _j - (u3 - bvirt) + (_i - bvirt);
            u[3] = u3;
            n1 = -ady;
            n0 = -adytail;
            s1 = bdxtail * n1;
            c = splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = splitter * n1;
            bhi = c - (c - n1);
            blo = n1 - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = bdx * n0;
            c = splitter * bdx;
            ahi = c - (c - bdx);
            alo = bdx - ahi;
            c = splitter * n0;
            bhi = c - (c - n0);
            blo = n0 - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            v[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            v[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            v[2] = _j - (u3 - bvirt) + (_i - bvirt);
            v[3] = u3;
            abtlen = sum(4, u, 4, v, abt);
            s1 = adxtail * bdytail;
            c = splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = splitter * bdytail;
            bhi = c - (c - bdytail);
            blo = bdytail - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = bdxtail * adytail;
            c = splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = splitter * adytail;
            bhi = c - (c - adytail);
            blo = adytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            abtt[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            abtt[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            abtt[2] = _j - (u3 - bvirt) + (_i - bvirt);
            abtt[3] = u3;
            abttlen = 4;
        } else {
            abt[0] = 0;
            abtlen = 1;
            abtt[0] = 0;
            abttlen = 1;
        }
        if (cdxtail !== 0) {
            var len$4 = scale(abtlen, abt, cdxtail, _16c);
            finlen = finadd(finlen, sum(
                scale(cxtablen, cxtab, cdxtail, _16$1), _16$1,
                scale(len$4, _16c, 2 * cdx, _32), _32, _48$1), _48$1);

            var len2$4 = scale(abttlen, abtt, cdxtail, _8$1);
            finlen = finadd(finlen, sum_three(
                scale(len2$4, _8$1, 2 * cdx, _16$1), _16$1,
                scale(len2$4, _8$1, cdxtail, _16b), _16b,
                scale(len$4, _16c, cdxtail, _32), _32, _32b, _64), _64);

            if (adytail !== 0) {
                finlen = finadd(finlen, scale(scale(4, bb, cdxtail, _8$1), _8$1, adytail, _16$1), _16$1);
            }
            if (bdytail !== 0) {
                finlen = finadd(finlen, scale(scale(4, aa, -cdxtail, _8$1), _8$1, bdytail, _16$1), _16$1);
            }
        }
        if (cdytail !== 0) {
            var len$5 = scale(abtlen, abt, cdytail, _16c);
            finlen = finadd(finlen, sum(
                scale(cytablen, cytab, cdytail, _16$1), _16$1,
                scale(len$5, _16c, 2 * cdy, _32), _32, _48$1), _48$1);

            var len2$5 = scale(abttlen, abtt, cdytail, _8$1);
            finlen = finadd(finlen, sum_three(
                scale(len2$5, _8$1, 2 * cdy, _16$1), _16$1,
                scale(len2$5, _8$1, cdytail, _16b), _16b,
                scale(len$5, _16c, cdytail, _32), _32, _32b, _64), _64);
        }
    }

    return fin$1[finlen - 1];
}

function incircle(ax, ay, bx, by, cx, cy, dx, dy) {
    var adx = ax - dx;
    var bdx = bx - dx;
    var cdx = cx - dx;
    var ady = ay - dy;
    var bdy = by - dy;
    var cdy = cy - dy;

    var bdxcdy = bdx * cdy;
    var cdxbdy = cdx * bdy;
    var alift = adx * adx + ady * ady;

    var cdxady = cdx * ady;
    var adxcdy = adx * cdy;
    var blift = bdx * bdx + bdy * bdy;

    var adxbdy = adx * bdy;
    var bdxady = bdx * ady;
    var clift = cdx * cdx + cdy * cdy;

    var det =
        alift * (bdxcdy - cdxbdy) +
        blift * (cdxady - adxcdy) +
        clift * (adxbdy - bdxady);

    var permanent =
        (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * alift +
        (Math.abs(cdxady) + Math.abs(adxcdy)) * blift +
        (Math.abs(adxbdy) + Math.abs(bdxady)) * clift;

    var errbound = iccerrboundA * permanent;

    if (det > errbound || -det > errbound) {
        return det;
    }
    return incircleadapt(ax, ay, bx, by, cx, cy, dx, dy, permanent);
}

function incirclefast(ax, ay, bx, by, cx, cy, dx, dy) {
    var adx = ax - dx;
    var ady = ay - dy;
    var bdx = bx - dx;
    var bdy = by - dy;
    var cdx = cx - dx;
    var cdy = cy - dy;

    var abdet = adx * bdy - bdx * ady;
    var bcdet = bdx * cdy - cdx * bdy;
    var cadet = cdx * ady - adx * cdy;
    var alift = adx * adx + ady * ady;
    var blift = bdx * bdx + bdy * bdy;
    var clift = cdx * cdx + cdy * cdy;

    return alift * bcdet + blift * cadet + clift * abdet;
}

var isperrboundA = (16 + 224 * epsilon) * epsilon;
var isperrboundB = (5 + 72 * epsilon) * epsilon;
var isperrboundC = (71 + 1408 * epsilon) * epsilon * epsilon;

var ab = vec(4);
var bc = vec(4);
var cd = vec(4);
var de = vec(4);
var ea = vec(4);
var ac = vec(4);
var bd = vec(4);
var ce = vec(4);
var da = vec(4);
var eb = vec(4);

var abc = vec(24);
var bcd = vec(24);
var cde = vec(24);
var dea = vec(24);
var eab = vec(24);
var abd = vec(24);
var bce = vec(24);
var cda = vec(24);
var deb = vec(24);
var eac = vec(24);

var adet = vec(1152);
var bdet = vec(1152);
var cdet = vec(1152);
var ddet = vec(1152);
var edet = vec(1152);
var abdet = vec(2304);
var cddet = vec(2304);
var cdedet = vec(3456);
var deter = vec(5760);

var _8 = vec(8);
var _8b = vec(8);
var _8c = vec(8);
var _16 = vec(16);
var _24 = vec(24);
var _48 = vec(48);
var _48b = vec(48);
var _96 = vec(96);
var _192 = vec(192);
var _384x = vec(384);
var _384y = vec(384);
var _384z = vec(384);
var _768 = vec(768);

function sum_three_scale(a, b, c, az, bz, cz, out) {
    return sum_three(
        scale(4, a, az, _8), _8,
        scale(4, b, bz, _8b), _8b,
        scale(4, c, cz, _8c), _8c, _16, out);
}

function liftexact(alen, a, blen, b, clen, c, dlen, d, x, y, z, out) {
    var len = sum(
        sum(alen, a, blen, b, _48), _48,
        negate(sum(clen, c, dlen, d, _48b), _48b), _48b, _96);

    return sum_three(
        scale(scale(len, _96, x, _192), _192, x, _384x), _384x,
        scale(scale(len, _96, y, _192), _192, y, _384y), _384y,
        scale(scale(len, _96, z, _192), _192, z, _384z), _384z, _768, out);
}

function insphereexact(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez) {
    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

    s1 = ax * by;
    c = splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bx * ay;
    c = splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ab[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ab[3] = u3;
    s1 = bx * cy;
    c = splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cx * by;
    c = splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bc[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bc[3] = u3;
    s1 = cx * dy;
    c = splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dx * cy;
    c = splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    cd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    cd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    cd[2] = _j - (u3 - bvirt) + (_i - bvirt);
    cd[3] = u3;
    s1 = dx * ey;
    c = splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ex * dy;
    c = splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    de[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    de[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    de[2] = _j - (u3 - bvirt) + (_i - bvirt);
    de[3] = u3;
    s1 = ex * ay;
    c = splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ax * ey;
    c = splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ea[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ea[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ea[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ea[3] = u3;
    s1 = ax * cy;
    c = splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cx * ay;
    c = splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ac[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ac[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ac[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ac[3] = u3;
    s1 = bx * dy;
    c = splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dx * by;
    c = splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bd[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bd[3] = u3;
    s1 = cx * ey;
    c = splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ex * cy;
    c = splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ce[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ce[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ce[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ce[3] = u3;
    s1 = dx * ay;
    c = splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ax * dy;
    c = splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    da[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    da[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    da[2] = _j - (u3 - bvirt) + (_i - bvirt);
    da[3] = u3;
    s1 = ex * by;
    c = splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bx * ey;
    c = splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    eb[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    eb[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    eb[2] = _j - (u3 - bvirt) + (_i - bvirt);
    eb[3] = u3;

    var abclen = sum_three_scale(ab, bc, ac, cz, az, -bz, abc);
    var bcdlen = sum_three_scale(bc, cd, bd, dz, bz, -cz, bcd);
    var cdelen = sum_three_scale(cd, de, ce, ez, cz, -dz, cde);
    var dealen = sum_three_scale(de, ea, da, az, dz, -ez, dea);
    var eablen = sum_three_scale(ea, ab, eb, bz, ez, -az, eab);
    var abdlen = sum_three_scale(ab, bd, da, dz, az, bz, abd);
    var bcelen = sum_three_scale(bc, ce, eb, ez, bz, cz, bce);
    var cdalen = sum_three_scale(cd, da, ac, az, cz, dz, cda);
    var deblen = sum_three_scale(de, eb, bd, bz, dz, ez, deb);
    var eaclen = sum_three_scale(ea, ac, ce, cz, ez, az, eac);

    var deterlen = sum_three(
        liftexact(cdelen, cde, bcelen, bce, deblen, deb, bcdlen, bcd, ax, ay, az, adet), adet,
        liftexact(dealen, dea, cdalen, cda, eaclen, eac, cdelen, cde, bx, by, bz, bdet), bdet,
        sum_three(
            liftexact(eablen, eab, deblen, deb, abdlen, abd, dealen, dea, cx, cy, cz, cdet), cdet,
            liftexact(abclen, abc, eaclen, eac, bcelen, bce, eablen, eab, dx, dy, dz, ddet), ddet,
            liftexact(bcdlen, bcd, abdlen, abd, cdalen, cda, abclen, abc, ex, ey, ez, edet), edet, cddet, cdedet), cdedet, abdet, deter);

    return deter[deterlen - 1];
}

var xdet = vec(96);
var ydet = vec(96);
var zdet = vec(96);
var fin = vec(1152);

function liftadapt(a, b, c, az, bz, cz, x, y, z, out) {
    var len = sum_three_scale(a, b, c, az, bz, cz, _24);
    return sum_three(
        scale(scale(len, _24, x, _48), _48, x, xdet), xdet,
        scale(scale(len, _24, y, _48), _48, y, ydet), ydet,
        scale(scale(len, _24, z, _48), _48, z, zdet), zdet, _192, out);
}

function insphereadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez, permanent) {
    var ab3, bc3, cd3, da3, ac3, bd3;

    var aextail, bextail, cextail, dextail;
    var aeytail, beytail, ceytail, deytail;
    var aeztail, beztail, ceztail, deztail;

    var bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0;

    var aex = ax - ex;
    var bex = bx - ex;
    var cex = cx - ex;
    var dex = dx - ex;
    var aey = ay - ey;
    var bey = by - ey;
    var cey = cy - ey;
    var dey = dy - ey;
    var aez = az - ez;
    var bez = bz - ez;
    var cez = cz - ez;
    var dez = dz - ez;

    s1 = aex * bey;
    c = splitter * aex;
    ahi = c - (c - aex);
    alo = aex - ahi;
    c = splitter * bey;
    bhi = c - (c - bey);
    blo = bey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bex * aey;
    c = splitter * bex;
    ahi = c - (c - bex);
    alo = bex - ahi;
    c = splitter * aey;
    bhi = c - (c - aey);
    blo = aey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab[1] = _0 - (_i + bvirt) + (bvirt - t1);
    ab3 = _j + _i;
    bvirt = ab3 - _j;
    ab[2] = _j - (ab3 - bvirt) + (_i - bvirt);
    ab[3] = ab3;
    s1 = bex * cey;
    c = splitter * bex;
    ahi = c - (c - bex);
    alo = bex - ahi;
    c = splitter * cey;
    bhi = c - (c - cey);
    blo = cey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cex * bey;
    c = splitter * cex;
    ahi = c - (c - cex);
    alo = cex - ahi;
    c = splitter * bey;
    bhi = c - (c - bey);
    blo = bey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc[1] = _0 - (_i + bvirt) + (bvirt - t1);
    bc3 = _j + _i;
    bvirt = bc3 - _j;
    bc[2] = _j - (bc3 - bvirt) + (_i - bvirt);
    bc[3] = bc3;
    s1 = cex * dey;
    c = splitter * cex;
    ahi = c - (c - cex);
    alo = cex - ahi;
    c = splitter * dey;
    bhi = c - (c - dey);
    blo = dey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dex * cey;
    c = splitter * dex;
    ahi = c - (c - dex);
    alo = dex - ahi;
    c = splitter * cey;
    bhi = c - (c - cey);
    blo = cey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    cd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    cd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    cd3 = _j + _i;
    bvirt = cd3 - _j;
    cd[2] = _j - (cd3 - bvirt) + (_i - bvirt);
    cd[3] = cd3;
    s1 = dex * aey;
    c = splitter * dex;
    ahi = c - (c - dex);
    alo = dex - ahi;
    c = splitter * aey;
    bhi = c - (c - aey);
    blo = aey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = aex * dey;
    c = splitter * aex;
    ahi = c - (c - aex);
    alo = aex - ahi;
    c = splitter * dey;
    bhi = c - (c - dey);
    blo = dey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    da[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    da[1] = _0 - (_i + bvirt) + (bvirt - t1);
    da3 = _j + _i;
    bvirt = da3 - _j;
    da[2] = _j - (da3 - bvirt) + (_i - bvirt);
    da[3] = da3;
    s1 = aex * cey;
    c = splitter * aex;
    ahi = c - (c - aex);
    alo = aex - ahi;
    c = splitter * cey;
    bhi = c - (c - cey);
    blo = cey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cex * aey;
    c = splitter * cex;
    ahi = c - (c - cex);
    alo = cex - ahi;
    c = splitter * aey;
    bhi = c - (c - aey);
    blo = aey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ac[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ac[1] = _0 - (_i + bvirt) + (bvirt - t1);
    ac3 = _j + _i;
    bvirt = ac3 - _j;
    ac[2] = _j - (ac3 - bvirt) + (_i - bvirt);
    ac[3] = ac3;
    s1 = bex * dey;
    c = splitter * bex;
    ahi = c - (c - bex);
    alo = bex - ahi;
    c = splitter * dey;
    bhi = c - (c - dey);
    blo = dey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dex * bey;
    c = splitter * dex;
    ahi = c - (c - dex);
    alo = dex - ahi;
    c = splitter * bey;
    bhi = c - (c - bey);
    blo = bey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    bd3 = _j + _i;
    bvirt = bd3 - _j;
    bd[2] = _j - (bd3 - bvirt) + (_i - bvirt);
    bd[3] = bd3;

    var finlen = sum(
        sum(
            negate(liftadapt(bc, cd, bd, dez, bez, -cez, aex, aey, aez, adet), adet), adet,
            liftadapt(cd, da, ac, aez, cez, dez, bex, bey, bez, bdet), bdet, abdet), abdet,
        sum(
            negate(liftadapt(da, ab, bd, bez, dez, aez, cex, cey, cez, cdet), cdet), cdet,
            liftadapt(ab, bc, ac, cez, aez, -bez, dex, dey, dez, ddet), ddet, cddet), cddet, fin);

    var det = estimate(finlen, fin);
    var errbound = isperrboundB * permanent;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - aex;
    aextail = ax - (aex + bvirt) + (bvirt - ex);
    bvirt = ay - aey;
    aeytail = ay - (aey + bvirt) + (bvirt - ey);
    bvirt = az - aez;
    aeztail = az - (aez + bvirt) + (bvirt - ez);
    bvirt = bx - bex;
    bextail = bx - (bex + bvirt) + (bvirt - ex);
    bvirt = by - bey;
    beytail = by - (bey + bvirt) + (bvirt - ey);
    bvirt = bz - bez;
    beztail = bz - (bez + bvirt) + (bvirt - ez);
    bvirt = cx - cex;
    cextail = cx - (cex + bvirt) + (bvirt - ex);
    bvirt = cy - cey;
    ceytail = cy - (cey + bvirt) + (bvirt - ey);
    bvirt = cz - cez;
    ceztail = cz - (cez + bvirt) + (bvirt - ez);
    bvirt = dx - dex;
    dextail = dx - (dex + bvirt) + (bvirt - ex);
    bvirt = dy - dey;
    deytail = dy - (dey + bvirt) + (bvirt - ey);
    bvirt = dz - dez;
    deztail = dz - (dez + bvirt) + (bvirt - ez);
    if (aextail === 0 && aeytail === 0 && aeztail === 0 &&
        bextail === 0 && beytail === 0 && beztail === 0 &&
        cextail === 0 && ceytail === 0 && ceztail === 0 &&
        dextail === 0 && deytail === 0 && deztail === 0) {
        return det;
    }

    errbound = isperrboundC * permanent + resulterrbound * Math.abs(det);

    var abeps = (aex * beytail + bey * aextail) - (aey * bextail + bex * aeytail);
    var bceps = (bex * ceytail + cey * bextail) - (bey * cextail + cex * beytail);
    var cdeps = (cex * deytail + dey * cextail) - (cey * dextail + dex * ceytail);
    var daeps = (dex * aeytail + aey * dextail) - (dey * aextail + aex * deytail);
    var aceps = (aex * ceytail + cey * aextail) - (aey * cextail + cex * aeytail);
    var bdeps = (bex * deytail + dey * bextail) - (bey * dextail + dex * beytail);
    det +=
        (((bex * bex + bey * bey + bez * bez) * ((cez * daeps + dez * aceps + aez * cdeps) +
        (ceztail * da3 + deztail * ac3 + aeztail * cd3)) + (dex * dex + dey * dey + dez * dez) *
        ((aez * bceps - bez * aceps + cez * abeps) + (aeztail * bc3 - beztail * ac3 + ceztail * ab3))) -
        ((aex * aex + aey * aey + aez * aez) * ((bez * cdeps - cez * bdeps + dez * bceps) +
        (beztail * cd3 - ceztail * bd3 + deztail * bc3)) + (cex * cex + cey * cey + cez * cez) *
        ((dez * abeps + aez * bdeps + bez * daeps) + (deztail * ab3 + aeztail * bd3 + beztail * da3)))) +
        2 * (((bex * bextail + bey * beytail + bez * beztail) * (cez * da3 + dez * ac3 + aez * cd3) +
        (dex * dextail + dey * deytail + dez * deztail) * (aez * bc3 - bez * ac3 + cez * ab3)) -
        ((aex * aextail + aey * aeytail + aez * aeztail) * (bez * cd3 - cez * bd3 + dez * bc3) +
        (cex * cextail + cey * ceytail + cez * ceztail) * (dez * ab3 + aez * bd3 + bez * da3)));

    if (det >= errbound || -det >= errbound) {
        return det;
    }

    return insphereexact(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez);
}

function insphere(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez) {
    var aex = ax - ex;
    var bex = bx - ex;
    var cex = cx - ex;
    var dex = dx - ex;
    var aey = ay - ey;
    var bey = by - ey;
    var cey = cy - ey;
    var dey = dy - ey;
    var aez = az - ez;
    var bez = bz - ez;
    var cez = cz - ez;
    var dez = dz - ez;

    var aexbey = aex * bey;
    var bexaey = bex * aey;
    var ab = aexbey - bexaey;
    var bexcey = bex * cey;
    var cexbey = cex * bey;
    var bc = bexcey - cexbey;
    var cexdey = cex * dey;
    var dexcey = dex * cey;
    var cd = cexdey - dexcey;
    var dexaey = dex * aey;
    var aexdey = aex * dey;
    var da = dexaey - aexdey;
    var aexcey = aex * cey;
    var cexaey = cex * aey;
    var ac = aexcey - cexaey;
    var bexdey = bex * dey;
    var dexbey = dex * bey;
    var bd = bexdey - dexbey;

    var abc = aez * bc - bez * ac + cez * ab;
    var bcd = bez * cd - cez * bd + dez * bc;
    var cda = cez * da + dez * ac + aez * cd;
    var dab = dez * ab + aez * bd + bez * da;

    var alift = aex * aex + aey * aey + aez * aez;
    var blift = bex * bex + bey * bey + bez * bez;
    var clift = cex * cex + cey * cey + cez * cez;
    var dlift = dex * dex + dey * dey + dez * dez;

    var det = (clift * dab - dlift * abc) + (alift * bcd - blift * cda);

    var aezplus = Math.abs(aez);
    var bezplus = Math.abs(bez);
    var cezplus = Math.abs(cez);
    var dezplus = Math.abs(dez);
    var aexbeyplus = Math.abs(aexbey);
    var bexaeyplus = Math.abs(bexaey);
    var bexceyplus = Math.abs(bexcey);
    var cexbeyplus = Math.abs(cexbey);
    var cexdeyplus = Math.abs(cexdey);
    var dexceyplus = Math.abs(dexcey);
    var dexaeyplus = Math.abs(dexaey);
    var aexdeyplus = Math.abs(aexdey);
    var aexceyplus = Math.abs(aexcey);
    var cexaeyplus = Math.abs(cexaey);
    var bexdeyplus = Math.abs(bexdey);
    var dexbeyplus = Math.abs(dexbey);
    var permanent =
        ((cexdeyplus + dexceyplus) * bezplus + (dexbeyplus + bexdeyplus) * cezplus + (bexceyplus + cexbeyplus) * dezplus) * alift +
        ((dexaeyplus + aexdeyplus) * cezplus + (aexceyplus + cexaeyplus) * dezplus + (cexdeyplus + dexceyplus) * aezplus) * blift +
        ((aexbeyplus + bexaeyplus) * dezplus + (bexdeyplus + dexbeyplus) * aezplus + (dexaeyplus + aexdeyplus) * bezplus) * clift +
        ((bexceyplus + cexbeyplus) * aezplus + (cexaeyplus + aexceyplus) * bezplus + (aexbeyplus + bexaeyplus) * cezplus) * dlift;

    var errbound = isperrboundA * permanent;
    if (det > errbound || -det > errbound) {
        return det;
    }
    return -insphereadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez, permanent);
}

function inspherefast(pax, pay, paz, pbx, pby, pbz, pcx, pcy, pcz, pdx, pdy, pdz, pex, pey, pez) {
    var aex = pax - pex;
    var bex = pbx - pex;
    var cex = pcx - pex;
    var dex = pdx - pex;
    var aey = pay - pey;
    var bey = pby - pey;
    var cey = pcy - pey;
    var dey = pdy - pey;
    var aez = paz - pez;
    var bez = pbz - pez;
    var cez = pcz - pez;
    var dez = pdz - pez;

    var ab = aex * bey - bex * aey;
    var bc = bex * cey - cex * bey;
    var cd = cex * dey - dex * cey;
    var da = dex * aey - aex * dey;
    var ac = aex * cey - cex * aey;
    var bd = bex * dey - dex * bey;

    var abc = aez * bc - bez * ac + cez * ab;
    var bcd = bez * cd - cez * bd + dez * bc;
    var cda = cez * da + dez * ac + aez * cd;
    var dab = dez * ab + aez * bd + bez * da;

    var alift = aex * aex + aey * aey + aez * aez;
    var blift = bex * bex + bey * bey + bez * bez;
    var clift = cex * cex + cey * cey + cez * cez;
    var dlift = dex * dex + dey * dey + dez * dez;

    return (clift * dab - dlift * abc) + (alift * bcd - blift * cda);
}

var Edge = function Edge(p1, p2, edgeType, index, contourId) {
  this.p1 = p1;
  this.p2 = p2;
  this.edgeType = edgeType;
  this.originalIndex = index;

  this.polygonContourId = contourId;
  this.interiorRing = false;

  this.minX = Math.min(p1.p[0], p2.p[0]);
  this.minY = Math.min(p1.p[1], p2.p[1]);

  this.maxX = Math.max(p1.p[0], p2.p[0]);
  this.maxY = Math.max(p1.p[1], p2.p[1]);

  this.intersectionPoints = [];
  this.nextEdge = null;
};

var Point = function Point(p) {
  this.p = p;
};

var Contour = function Contour(contourId, coords) {
  this.id = contourId;
  this.rawCoords = coords;
};

function fillQueue(polygon, line, polyEdges, lineEdges, polylineBbox) {
  var numberOfRingsInPolygon = 0;
  var contours = [];

  var linegeom = line.type === 'Feature' ? line.geometry : line;
  var linecoords = linegeom.type === 'LineString' ? [linegeom.coordinates] : linegeom.coordinates;

  var edgeCount = 0;

  for (var i = 0; i < linecoords.length; i++) {

    var lineLength = linecoords[i].length - 1;
    var p1 = new Point(linecoords[i][0]);
    var p2 = null;
    var prevEdge = {nextEdge: null};

    for (var ii = 0; ii < lineLength; ii++) {
      p2 = new Point(linecoords[i][ii + 1]);
      p1.nextPoint = p2;
      p2.prevPoint = p1;
      var e = new Edge(p1, p2, 'polyline', edgeCount, null);
      lineEdges.push(e);
      prevEdge.nextEdge = e;
      e.prevEdge = prevEdge;
      polylineBbox[0] = Math.min(polylineBbox[0], p1.p[0]);
      polylineBbox[1] = Math.min(polylineBbox[1], p1.p[1]);
      polylineBbox[2] = Math.max(polylineBbox[2], p1.p[0]);
      polylineBbox[3] = Math.max(polylineBbox[3], p1.p[1]);

      p1 = p2;
      edgeCount = edgeCount + 1;
      prevEdge = e;
    }
    polylineBbox[0] = Math.min(polylineBbox[0], linecoords[i][lineLength][0]);
    polylineBbox[1] = Math.min(polylineBbox[1], linecoords[i][lineLength][1]);
    polylineBbox[2] = Math.max(polylineBbox[2], linecoords[i][lineLength][0]);
    polylineBbox[3] = Math.max(polylineBbox[3], linecoords[i][lineLength][1]);
  }

  var polygeom = polygon.type === 'Feature' ? polygon.geometry : polygon;
  var polycoords = polygeom.type === 'Polygon' ? [polygeom.coordinates] : polygeom.coordinates;

  var polyLength = polycoords.length;

  for (var i$1 = 0; i$1 < polyLength; i$1++) {

    var polyLenth2 = polycoords[i$1].length;

    for (var ii$1 = 0; ii$1 < polyLenth2; ii$1++) {
      numberOfRingsInPolygon = numberOfRingsInPolygon + 1;

      var polygonSet = polycoords[i$1][ii$1];
      var polyLenth3 = polygonSet.length;
      
      contours.push(new Contour(numberOfRingsInPolygon, polygonSet));

      var firstPoint = new Point(polygonSet[0]);
      var p1$1 = firstPoint;
      var p2$1 = (void 0), e$1 = null;
      var prevEdge$1 = {nextEdge: null, prevEdge: null};
      var firstEdge = null;

      for (var iii = 1; iii < polyLenth3; iii++) {
        p2$1 = new Point(polygonSet[iii]);
        p1$1.nextPoint = p2$1;
        p2$1.prevPoint = p1$1;

        e$1 = new Edge(p1$1, p2$1, 'polygon', edgeCount, numberOfRingsInPolygon);
        prevEdge$1.nextEdge = e$1;
        e$1.prevEdge = prevEdge$1;
        if (iii === 1) { firstEdge = e$1; }

        if (ii$1 > 0) { e$1.interiorRing = true; }
        e$1.intersectPolylineBbox = edgeIntersectsBbox(e$1, polylineBbox);
        polyEdges.push(e$1);

        p1$1 = p2$1;
        edgeCount = edgeCount + 1;
        prevEdge$1 = e$1;
      }

      e$1.nextEdge = firstEdge;
      firstEdge.prevEdge = e$1;
      p2$1.nextPoint = firstPoint.nextPoint;
      firstPoint.prevPoint = p2$1.prevPoint;
    }
  }
  return contours
}

function edgeIntersectsBbox(edge, bbox) {
  if (edge.maxX < bbox[0]) { return false }
  if (edge.minX > bbox[2]) { return false }
  if (edge.maxY < bbox[1]) { return false }
  if (edge.minY > bbox[3]) { return false }
  return true
}

var IntersectionPoint = function IntersectionPoint(p, edge1, edge2, isHeadingIn) {
  this.p = p;
  this.polylineEdge = edge1;
  this.polygonEdge = edge2;
  this.isHeadingIn = isHeadingIn;

  this.distanceFromPolylineEdgeStart = distance(this.polylineEdge.p1.p, this.p);
  this.distanceFromPolygonEdgeStart = distance(this.polygonEdge.p1.p, this.p);

  this.polygonEdge.intersectionPoints.push(this);
  this.polylineEdge.intersectionPoints.push(this);

  this.visitCount = 0;
};

IntersectionPoint.prototype.incrementVisitCount = function incrementVisitCount () {
  this.visitCount = this.visitCount + 1;
};

function distance(p1, p2) {
  var xs = p2[0] - p1[0];
  var ys = p2[1] - p1[1];
  xs *= xs;
  ys *= ys;

  return Math.sqrt(xs + ys)
}

function findIntersectionPoints(polygonEdges, lineEdges, intersectingPoints) {
  var i, ii, iii;
  var count = lineEdges.length;
  var polyCount = polygonEdges.length;
  for (i = 0; i < count; i++) {
    var lineEdge = lineEdges[i];

    for (ii = 0; ii < polyCount; ii++) {
      var polygonEdge = polygonEdges[ii];
      if (!polygonEdge.intersectPolylineBbox) { continue }

      if (polygonEdge.maxX < lineEdge.minX || polygonEdge.minX > lineEdge.maxX) { continue }
      if (polygonEdge.maxY < lineEdge.minY || polygonEdge.minY > lineEdge.maxY) { continue }
      var intersection = getEdgeIntersection(lineEdge, polygonEdge);
      if (intersection !== null) {
        for (iii = 0; iii < intersection.length; iii++) {
          var isHeadingIn = orient2d(polygonEdge.p1.p[0], polygonEdge.p1.p[1], polygonEdge.p2.p[0], polygonEdge.p2.p[1], lineEdge.p1.p[0], lineEdge.p1.p[1]);
          var ip = new IntersectionPoint(intersection[iii], lineEdge, polygonEdge, isHeadingIn > 0);
          intersectingPoints.push(ip);
        }
      }
    }
  }
  lineEdges.forEach(function (edge) {
    edge.intersectionPoints.sort(function (a, b) {
      return a.distanceFromPolylineEdgeStart - b.distanceFromPolylineEdgeStart
    });
  });

  polygonEdges.forEach(function (edge) {
    edge.intersectionPoints.sort(function (a, b) {
      return a.distanceFromPolygonEdgeStart - b.distanceFromPolygonEdgeStart
    });
  });
}

var EPSILON = 1e-9;

function crossProduct(a, b) {
  return (a[0] * b[1]) - (a[1] * b[0])
}

function dotProduct(a, b) {
  return (a[0] * b[0]) + (a[1] * b[1])
}

function toPoint(p, s, d) {
  return [
    p[0] + s * d[0],
    p[1] + s * d[1]
  ]
}

function getEdgeIntersection(lineEdge, potentialEdge, noEndpointTouch) {
  var va = [lineEdge.p2.p[0] - lineEdge.p1.p[0], lineEdge.p2.p[1] - lineEdge.p1.p[1]];
  var vb = [potentialEdge.p2.p[0] - potentialEdge.p1.p[0], potentialEdge.p2.p[1] - potentialEdge.p1.p[1]];

  var e = [potentialEdge.p1.p[0] - lineEdge.p1.p[0], potentialEdge.p1.p[1] - lineEdge.p1.p[1]];
  var kross = crossProduct(va, vb);
  var sqrKross = kross * kross;
  var sqrLenA  = dotProduct(va, va);

  if (sqrKross > 0) {

    var s = crossProduct(e, vb) / kross;
    if (s < 0 || s > 1) { return null }
    var t = crossProduct(e, va) / kross;
    if (t < 0 || t > 1) { return null }
    if (s === 0 || s === 1) {
      // on an endpoint of line segment a
      return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, s, va)]
    }
    if (t === 0 || t === 1) {
      // on an endpoint of line segment b
      return noEndpointTouch ? null : [toPoint(potentialEdge.p1.p, t, vb)]
    }
    return [toPoint(lineEdge.p1.p, s, va)]
  }

  var sqrLenE = dotProduct(e, e);
  kross = crossProduct(e, va);
  sqrKross = kross * kross;

  if (sqrKross > EPSILON * sqrLenA * sqrLenE) { return null }

  var sa = dotProduct(va, e) / sqrLenA;
  var sb = sa + dotProduct(va, vb) / sqrLenA;
  var smin = Math.min(sa, sb);
  var smax = Math.max(sa, sb);

  if (smin <= 1 && smax >= 0) {

    if (smin === 1) { return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, smin > 0 ? smin : 0, va)] }

    if (smax === 0) { return noEndpointTouch ? null : [toPoint(lineEdge.p1.p, smax < 1 ? smax : 1, va)] }

    if (noEndpointTouch && smin === 0 && smax === 1) { return null }

    return [
      toPoint(lineEdge.p1.p, smin > 0 ? smin : 0, va),
      toPoint(lineEdge.p1.p, smax < 1 ? smax : 1, va)
    ]
  }

  return null
}

// import { _debugCandidatePoly, _debugIntersectionPoint, _debugLinePoints, _debugIntersectionPoints, _debugPolyStart } from './debug'

function index (polygon, line) {
  var poly = rewind(polygon);

  var intersections = [];
  var polygonEdges = [];
  var polylineEdges = [];
  var polylineBbox = [Infinity, Infinity, Infinity, Infinity];

  var contours = fillQueue(poly, line, polygonEdges, polylineEdges, polylineBbox);

  findIntersectionPoints(polygonEdges, polylineEdges, intersections);

  if (intersections.length === 0) {
    return polygon
  }

  // Track the number of intersections per contour
  // This is useful for holes or outerrings that aren't intersected
  // so that we can manually add them back in at the end
  var numberIntersectionsByRing = {};
  contours.forEach(function (c) { return numberIntersectionsByRing[c.id] = 0; }); //eslint-disable-line
  intersections.forEach(function (i) {
    var id = i.polygonEdge.polygonContourId;
    numberIntersectionsByRing[id] = numberIntersectionsByRing[id] + 1;
  });


  var infiniteLoopGuard = 0;
  var outPolys = [];
  // _debugIntersectionPoints(intersections)
  // Start the rewiring of the outputs from the first intersection point along the polyline line
  // This step makes a difference (eg see the another.geojson harness file)
  var firstPolyStart = null;
  for (var index = 0; index < polylineEdges.length; index++) {
    var pe = polylineEdges[index];
    if (pe.intersectionPoints.length > 0) {
      firstPolyStart = pe.intersectionPoints[0];
      break
    }
  }

  var polyStart = firstPolyStart;
  var nextPolyStart = {visitCount: 1};
  // Basically we're going to walk our way around the outside of the polygon
  // to find new output polygons until we get back to the beginning
  while (firstPolyStart !== nextPolyStart) {
    if (infiniteLoopGuard > intersections.length * 2) {
      break
    }
    infiniteLoopGuard = infiniteLoopGuard++;

    // If we've already visited this intersection point a couple of times we've
    // already used it in it's two output polygons

    if (nextPolyStart.visitCount >= 2) {
      var unvisitedPolyFound = false;
      for (var index$1 = 0; index$1 < intersections.length; index$1++) {
        var intersection = intersections[index$1];
        if (intersection.visitCount < 2) {
          polyStart = intersection;
          unvisitedPolyFound = true;
          break
        }
      }
      if (!unvisitedPolyFound) { break }
    }

    polyStart.visitCount = polyStart.visitCount + 1;
    var outPoly = [];
    outPolys.push(outPoly);
    outPoly.push(polyStart.p);

    polyStart.visitCount = polyStart.visitCount + 1;
    var nextIntersection = walkPolygonForwards(polyStart, outPoly);
    // _debugCandidatePoly(outPolys)
    // After we've walked the first stretch of the polygon we now have the
    // starting point for our next output polygon
    nextPolyStart = nextIntersection;


    // Although sometimes we walk all the way around the outside
    // because our split line goes from outer to inner ring
    var override = false;
    if (nextIntersection === nextPolyStart && intersections.length === 2) {
      for (var index$2 = 0; index$2 < intersections.length; index$2++) {
        var intersection$1 = intersections[index$2];
        if (intersection$1.visitCount < 2) {
          override = true;
        }
      }
    }

    // An ouput polygon has to contain at least 1 stretch from the original polygon
    // and one stretch from the polyline
    // However it can contain many stretches of each
    // So we walk continually from polyline to polygon collecting the output
    while (nextIntersection !== polyStart || override) {
      var methodForPolyline = nextIntersection.isHeadingIn ? walkPolylineForwards : walkPolylineBackwards;
      nextIntersection = methodForPolyline(nextIntersection, outPoly);
      // _debugCandidatePoly(outPolys)

      if (nextIntersection !== polyStart) {
        nextIntersection = walkPolygonForwards(nextIntersection, outPoly);
        // _debugCandidatePoly(outPolys)
      }
      override = false;
    }

    if (nextPolyStart.visitCount >= 2) {
      var unvisitedPolyFound$1 = false;
      for (var index$3 = 0; index$3 < intersections.length; index$3++) {
        var intersection$2 = intersections[index$3];
        if (intersection$2.visitCount < 2) {
          polyStart = intersection$2;
          unvisitedPolyFound$1 = true;
          break
        }
      }
      if (unvisitedPolyFound$1) {
        nextPolyStart = polyStart;
      }
    }

    // Finally we set the next start point based on what we found earlier
    polyStart = nextPolyStart;
  }

  var outCoordinates = outPolys.map(function (poly) { return [poly]; });

  var keys = Object.keys(numberIntersectionsByRing);
  for (var index$4 = 0; index$4 < keys.length; index$4++) {
    var key = keys[index$4];
    var value = numberIntersectionsByRing[key];
    if (value === 0) {
      var edge = findFirstPolygonEdge(polygonEdges, parseInt(key));
      var ring = findRingFromEdge(edge, contours);
      createAsHoleOrAddAsNewOuterRing(ring, outCoordinates);
    }
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: outCoordinates
    }
  }
}

function findFirstPolygonEdge(polygonEdges, contourId) {
  for (var index = 0; index < polygonEdges.length; index++) {
    var edge = polygonEdges[index];
    if (edge.polygonContourId === contourId) { return edge }
  }
}

function findRingFromEdge(edge, contours) {
  var contour = contours.find(function (c) { return c.id === edge.polygonContourId; });
  return contour.rawCoords
}

function createAsHoleOrAddAsNewOuterRing(unusedRing, outCoordinates) {
  for (var index = 0; index < outCoordinates.length; index++) {
    var existingRing = outCoordinates[index];
    if (pointInPolygon(unusedRing[0], [existingRing[0]])) {
      existingRing.push(unusedRing);
      return
    }
  }
  // If no match is found push it as a new outer ring
  outCoordinates.push([unusedRing]);
}

// Walk around the polygon collecting vertices
function walkPolygonForwards(intersectionPoint, outPoly) {
  var nextEdge = intersectionPoint.polygonEdge;
  if (nextEdge.intersectionPoints.length > 1) {
    // _debugIntersectionPoint(intersectionPoint)
    var lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1];
    if (lastPointOnEdge !== intersectionPoint) {
      var currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints);
      var nextIp = nextEdge.intersectionPoints[currentIndex + 1];
      outPoly.push(nextIp.p);
      nextIp.incrementVisitCount();
      return nextIp
    }
  }
  var condition = true;
  while (condition) {
    outPoly.push(nextEdge.p2.p);
    nextEdge = nextEdge.nextEdge;
    if (nextEdge === null) { return intersectionPoint }
    else if (nextEdge.intersectionPoints.length > 0) { condition = false; }
  }
  nextEdge.intersectionPoints[0].incrementVisitCount();
  outPoly.push(nextEdge.intersectionPoints[0].p);
  return nextEdge.intersectionPoints[0]
}

// Given a set of intersections find the next one
function findIndexOfIntersectionPoint(intersection, intersections) {
  for (var index = 0; index < intersections.length; index++) {
    var int = intersections[index];
    if (int === intersection) { return index }
  }
  return null
}


function walkPolylineBackwards(intersectionPoint, outPoly) {
  var nextEdge = intersectionPoint.polylineEdge;
  if (nextEdge.intersectionPoints.length === 2) {
    var lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1];
    // debugger
    if (lastPointOnEdge === intersectionPoint) {
      var nextIntersection = nextEdge.intersectionPoints[0];
      outPoly.push(nextIntersection.p);
      nextIntersection.incrementVisitCount();
      return nextIntersection
    } else {
      outPoly.push(lastPointOnEdge.p);
      lastPointOnEdge.incrementVisitCount();
      return lastPointOnEdge
    }
  } else if (nextEdge.intersectionPoints.length > 2) {
    // _debugIntersectionPoint(intersectionPoint)

    var lastPointOnEdge$1 = nextEdge.intersectionPoints[0];
    if (lastPointOnEdge$1 !== intersectionPoint) {
      var currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints);
      var nextIntersection$1 = nextEdge.intersectionPoints[currentIndex - 1];
      outPoly.push(nextIntersection$1.p);
      nextIntersection$1.incrementVisitCount();
      return nextIntersection$1
    }
  }
  var condition = true;
  while (condition) {
    outPoly.push(nextEdge.p1.p);
    nextEdge = nextEdge.prevEdge;
    if (nextEdge.originalIndex === undefined) { return intersectionPoint }
    else if (nextEdge.intersectionPoints.length > 0) {
      condition = false;
    }
  }
  if (nextEdge.originalIndex === undefined) { return intersectionPoint }
  var lastIntersection = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1];
  lastIntersection.incrementVisitCount();
  outPoly.push(lastIntersection.p);
  return lastIntersection
}

function walkPolylineForwards(intersectionPoint, outPoly) {
  var nextEdge = intersectionPoint.polylineEdge;

  if (nextEdge.intersectionPoints.length > 1) {
    // _debugIntersectionPoint(intersectionPoint)
    var lastPointOnEdge = nextEdge.intersectionPoints[nextEdge.intersectionPoints.length - 1];
    if (lastPointOnEdge !== intersectionPoint) {
      var currentIndex = findIndexOfIntersectionPoint(intersectionPoint, nextEdge.intersectionPoints);
      var nextIp = nextEdge.intersectionPoints[currentIndex + 1];
      outPoly.push(nextIp.p);
      nextIp.incrementVisitCount();
      return nextIp
    }
  }
  var condition = true;
  while (condition) {
    outPoly.push(nextEdge.p2.p);
    nextEdge = nextEdge.nextEdge;
    if (nextEdge === null) { return intersectionPoint }
    else if (nextEdge.intersectionPoints.length > 0) { condition = false; }
  }
  if (nextEdge === undefined) { return intersectionPoint }
  var lastIntersection = nextEdge.intersectionPoints[0];
  lastIntersection.incrementVisitCount();
  outPoly.push(lastIntersection.p);
  return lastIntersection
}

function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }

var originOnSetup = DrawLineString.onSetup;
var originOnMouseMove = DrawLineString.onMouseMove;
var originClickOnVertex = DrawLineString.clickOnVertex;
var originOnStop = DrawLineString.onStop;
var originOnKeyUp = DrawLineString.onKeyUp;
var originOnTrash = DrawLineString.onTrash;
var rest = objectWithoutProperties( DrawLineString, ["onSetup", "onMouseMove", "clickOnVertex", "onStop", "onKeyUp", "onTrash"] );
var restOriginMethods = rest;
var CutLineMode = Object.assign({}, {originOnTrash: originOnTrash,
  originOnSetup: originOnSetup,
  originOnKeyUp: originOnKeyUp,
  originOnStop: originOnStop,
  originOnMouseMove: originOnMouseMove,
  originClickOnVertex: originClickOnVertex},
  restOriginMethods,
  Cut);
CutLineMode.onSetup = function (opt) {
  var this$1$1 = this;

  var options = xtend(getCutDefaultOptions(), opt);
  var featureIds = options.featureIds;
  var highlightColor = options.highlightColor;

  if (options.bufferOptions.width > 0 && !options.bufferOptions.unit) {
    throw new Error('Please provide a valid bufferOptions.unit');
  }

  var features = [];
  if (featureIds.length) {
    features = featureIds.map(function (id) { return this$1$1.getFeature(id).toGeoJSON(); });
  } else {
    features = this.getSelected().map(function (f) { return f.toGeoJSON(); });
  }

  if (!features.length) {
    throw new Error('Please select a feature/features (Polygon or MultiPolygon or LineString or MultiLineString) to split!');
  }
  this._options = options;
  this._features = features;
  var state = this.originOnSetup({ button: modes$1.CUT_LINE });
  this._batchHighlight(features, highlightColor);
  return this.setState(state);
};

CutLineMode.clickOnVertex = function (state) {
  var this$1$1 = this;

  this.originClickOnVertex(state, function () {
    var cuttingLineString = state.line.toGeoJSON();
    cuttingLineString.geometry.coordinates[0].splice(state.currentVertexPosition, 1);
    this$1$1._cut(cuttingLineString);
    if (this$1$1._options.continuous) {
      this$1$1._resetState();
    } else {
      this$1$1.deleteFeature([state.line.id], { silent: true });
    }
  });
};

CutLineMode._cut = function (cuttingLineString) {
  var this$1$1 = this;

  var splitter;
  var buffered;
  var ref = this._options;
  var bufferOptions = ref.bufferOptions;
  var highlightColor = ref.highlightColor;
  var lineWidth = bufferOptions.width;
  var lineWidthUnit = bufferOptions.unit;
  var ref$1 = this._ctx;
  var store = ref$1.store;
  var api = ref$1.api;
  var endCoord = cuttingLineString.geometry.coordinates[cuttingLineString.geometry.coordinates.length - 1];
  var startPoint = turf__namespace.point(cuttingLineString.geometry.coordinates[0]);
  var endPoint = turf__namespace.point(endCoord);
  var undoStack = { geoJson: cuttingLineString, polygons: [], lines: [] };

  this._features.forEach(function (feature) {
    if (turf__namespace.booleanDisjoint(feature, cuttingLineString)) {
      console.warn(("Line was outside of Polygon " + (feature.id)));
      return;
    }

    if (!(turf__namespace.booleanDisjoint(feature, startPoint) && turf__namespace.booleanDisjoint(feature, endPoint))) {
      console.warn("The start and end points of the line must be outside of the poly");
      return;
    }
    store.get(feature.id).measure.delete();
    if (lineTypes.includes(feature.geometry.type)) {
      if (!lineWidth) {
        var cuted = turf__namespace.lineSplit(feature, cuttingLineString);
        cuted.features.sort(function (a, b) { return turf__namespace.length(a) - turf__namespace.length(b); });
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach(function (id, i) { return (cuted.features[i].id = id); });
        this$1$1._continuous(function () { return this$1$1._batchHighlight(cuted.features, highlightColor); });
        undoStack.lines.push({ cuted: cuted, line: feature });
      } else {
        if (!splitter) {
          buffered = turf__namespace.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit });
          splitter = turf__namespace.polygonToLine(buffered);
        }
        var cuted$1 = turf__namespace.lineSplit(feature, splitter);
        // cuted.features = cuted.features.reduce((prev, curr) => {
        //   if (!turf.booleanWithin(curr, buffered)) prev.push({ ...curr, id: hat() });
        //   return prev;
        // }, []);
        var intersecting = turf__namespace.featureCollection([]);
        cuted$1.features.forEach(function (v) { return (v.id = hat$1()); });
        var intersectPoints = turf__namespace.lineIntersect(feature, cuttingLineString);
        intersectPoints.features.forEach(function (p) {
          var buffered = turf__namespace.buffer(p, 0.1, { units: 'meters' });
          cuted$1.features = cuted$1.features.filter(function (f) { return turf__namespace.booleanDisjoint(buffered, f); });
        });
        cuted$1.features.sort(function (a, b) { return turf__namespace.length(a) - turf__namespace.length(b); });
        if (cuted$1.features.length !== 0) {
          cuted$1.features[0].id = feature.id;
          api.add(cuted$1, { silent: true });
          undoStack.lines.push({ cuted: cuted$1, line: feature });
          this$1$1._continuous(function () { return this$1$1._batchHighlight(cuted$1.features, highlightColor); });
        } else {
          api.delete(feature.id, { silent: true });
          undoStack.lines.push({ cuted: turf__namespace.featureCollection([feature]), line: feature });
          this$1$1._continuous();
        }
      }
      return;
    }

    var afterCut;
    var item = {};
    if (!lineWidth) {
      afterCut = index(feature.geometry, cuttingLineString.geometry);
    } else {
      var buffered$1 = turf__namespace.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit });
      item.intersect = turf__namespace.intersect(feature, buffered$1);
      afterCut = turf__namespace.difference(feature.geometry, buffered$1);
    }
    if (afterCut) {
      var newFeature = this$1$1.newFeature(afterCut);
      var ref = newFeature.features.sort(function (a, b) { return turf__namespace.area(a) - turf__namespace.area(b); });
      var f = ref[0];
      var rest = ref.slice(1);
      f.id = feature.id;
      api.add(turf__namespace.featureCollection(rest.map(function (v) { return v.toGeoJSON(); })), { silent: true });
      this$1$1.addFeature(f);
      this$1$1._execMeasure(f);
      this$1$1._continuous(function () { return this$1$1._batchHighlight(newFeature.features, highlightColor); });
      item.cuted = turf__namespace.featureCollection([f.toGeoJSON() ].concat( rest.map(function (v) { return v.toGeoJSON(); })));
    } else {
      api.delete(feature.id, { silent: true });
      this$1$1._continuous();
      item.cuted = turf__namespace.featureCollection([feature]);
    }
    if (item.cuted) {
      if (item.intersect) { item.intersect = turf__namespace.featureCollection([item.intersect]); }
      undoStack.polygons.push(item);
    }
  });

  this.redoUndo.setRedoUndoStack(function (ref) {
    var u = ref.undoStack;

    return ({ undoStack: u.concat( [undoStack]) });
  });
  store.setDirty();
};

CutLineMode.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: cursors.ADD });
  this.originOnMouseMove(state, e);
};

CutLineMode.onStop = function (state) {
  var this$1$1 = this;

  var featureIds = this._features.map(function (v) { return v.id; });
  this.originOnStop(state, function () {
    this$1$1._cancelCut();
    this$1$1.deleteFeature([state.line.id], { silent: true });
  });
  return { featureIds: featureIds };
};

CutLineMode.undo = function () {
  var this$1$1 = this;

  var ref = this.redoUndo.undo() || {};
  var type = ref.type;
  var stack = ref.stack;

  if (type !== 'cut') { return; }
  var ref$1 = this._ctx;
  var store = ref$1.store;
  this.beforeRender(function () {
    var state = this$1$1.getState();
    var redoStack = { geoJson: stack.geoJson };
    stack.polygons.forEach(function (item) {
      var ref;

      if (item.intersect) { (ref = item.cuted.features).push.apply(ref, item.intersect.features); }
      // 将features合并为一个feature
      var f = item.cuted.features.shift();
      store.get(f.id).measure.delete();
      var combine = turf__namespace.combine(item.cuted);
      // 将两个feature合并为一个feature
      var nuionFeature = this$1$1.newFeature(turf__namespace.union(f, combine.features[0]));
      nuionFeature.id = f.id;
      item.cuted.features.forEach(function (v) { return this$1$1.deleteFeature(v.id); });
      this$1$1.addFeature(nuionFeature);
      this$1$1._execMeasure(nuionFeature);
      this$1$1._setHighlight(nuionFeature.id, this$1$1._options.highlightColor);
    });
    this$1$1._undoByLines(stack);

    state.currentVertexPosition = stack.geoJson.geometry.coordinates.length - 1;
    state.line.setCoordinates(stack.geoJson.geometry.coordinates);
    this$1$1.redoUndo.setRedoUndoStack(function (ref) {
      var r = ref.redoStack;

      return ({ redoStack: r.concat( [redoStack]) });
    });
    this$1$1._updateFeatures();
  });
};

CutLineMode.redo = function () {
  var this$1$1 = this;

  var res = this.redoUndo.redo() || {};
  var type = res.type;
  var stack = res.stack;
  if (type !== 'cut') { return; }
  this.beforeRender(function () {
    this$1$1._cut(stack.geoJson);
    this$1$1._resetState();
  });
};

CutLineMode._resetState = function () {
  var state = this.getState();
  state.currentVertexPosition = 0;
  state.line.setCoordinates([]);
};

var modes = {
  simple_select: SimpleSelect,
  direct_select: DirectSelect,
  draw_point: DrawPoint,
  draw_polygon: DrawPolygon,
  draw_line_string: DrawLineString,
  cut_polygon: CutPolygonMode,
  cut_line: CutLineMode,
};

var defaultOptions = {
  defaultMode: modes$1.SIMPLE_SELECT,
  keybindings: true,
  touchEnabled: true,
  clickBuffer: 2,
  touchBuffer: 25,
  boxSelect: true,
  displayControlsDefault: true,
  styles: styles,
  modes: modes,
  controls: {},
  userProperties: false,
  measureOptions: {
    enable: true,
  },
};

var showControls = {
  point: true,
  line_string: true,
  polygon: true,
  trash: true,
  combine_features: true,
  uncombine_features: true,
  /** extend start */
  undo: true,
  redo: true,
  finish: true,
  cancel: true,
  draw_center: true,
  cut_line: true,
  cut_polygon: true,
  /** extend end */
};

var hideControls = {
  point: false,
  line_string: false,
  polygon: false,
  trash: false,
  combine_features: false,
  uncombine_features: false,
  /** extend start */
  undo: false,
  redo: false,
  cancel: true,
  draw_center: true,
  cut_line: true,
  cut_polygon: true,
  /** extend end */
};

function addSources(styles, sourceBucket) {
  return styles.map(function (style) {
    if (style.source) { return style; }
    return xtend(style, {
      id: ((style.id) + "." + sourceBucket),
      source: sourceBucket === 'hot' ? sources.HOT : sources.COLD,
    });
  });
}

// extend start
function genStyles(styles) {
  return addSources(styles, 'cold').concat(addSources(styles, 'hot'));
}
// extend end

function setupOptions (options) {
  if ( options === void 0 ) options = {};

  var withDefaults = xtend(options);

  if (!options.controls) {
    withDefaults.controls = {};
  }

  if (options.displayControlsDefault === false) {
    withDefaults.controls = xtend(hideControls, options.controls);
  } else {
    withDefaults.controls = xtend(showControls, options.controls);
  }

  withDefaults = xtend(defaultOptions, withDefaults);

  // extend start Layers with a shared source should be adjacent for performance reasons
  withDefaults.styles = genStyles(withDefaults.styles);
  // extend end

  return withDefaults;
}

var lodash_isequal$1 = {exports: {}};

/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var lodash_isequal = lodash_isequal$1.exports;

(function (module, exports) {
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used to compose bitmasks for value comparisons. */
	var COMPARE_PARTIAL_FLAG = 1,
	    COMPARE_UNORDERED_FLAG = 2;

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    asyncTag = '[object AsyncFunction]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    nullTag = '[object Null]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    proxyTag = '[object Proxy]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    undefinedTag = '[object Undefined]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	typedArrayTags[setTag] = typedArrayTags[stringTag] =
	typedArrayTags[weakMapTag] = false;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Detect free variable `exports`. */
	var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/** Detect free variable `process` from Node.js. */
	var freeProcess = moduleExports && freeGlobal.process;

	/** Used to access faster Node.js helpers. */
	var nodeUtil = (function() {
	  try {
	    return freeProcess && freeProcess.binding && freeProcess.binding('util');
	  } catch (e) {}
	}());

	/* Node.js helper references. */
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	/**
	 * A specialized version of `_.filter` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length,
	      resIndex = 0,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[resIndex++] = value;
	    }
	  }
	  return result;
	}

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	/**
	 * A specialized version of `_.some` for arrays without support for iteratee
	 * shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array == null ? 0 : array.length;

	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/**
	 * The base implementation of `_.unary` without support for storing metadata.
	 *
	 * @private
	 * @param {Function} func The function to cap arguments for.
	 * @returns {Function} Returns the new capped function.
	 */
	function baseUnary(func) {
	  return function(value) {
	    return func(value);
	  };
	}

	/**
	 * Checks if a `cache` value for `key` exists.
	 *
	 * @private
	 * @param {Object} cache The cache to query.
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function cacheHas(cache, key) {
	  return cache.has(key);
	}

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice,
	    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols,
	    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
	    nativeKeys = overArg(Object.keys, Object);

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView'),
	    Map = getNative(root, 'Map'),
	    Promise = getNative(root, 'Promise'),
	    Set = getNative(root, 'Set'),
	    WeakMap = getNative(root, 'WeakMap'),
	    nativeCreate = getNative(Object, 'create');

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	  this.size = 0;
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  var result = this.has(key) && delete this.__data__[key];
	  this.size -= result ? 1 : 0;
	  return result;
	}

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
	}

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  this.size += this.has(key) ? 0 : 1;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	  this.size = 0;
	}

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  --this.size;
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    ++this.size;
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries == null ? 0 : entries.length;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.size = 0;
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  var result = getMapData(this, key)['delete'](key);
	  this.size -= result ? 1 : 0;
	  return result;
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  var data = getMapData(this, key),
	      size = data.size;

	  data.set(key, value);
	  this.size += data.size == size ? 0 : 1;
	  return this;
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/**
	 *
	 * Creates an array cache object to store unique values.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [values] The values to cache.
	 */
	function SetCache(values) {
	  var index = -1,
	      length = values == null ? 0 : values.length;

	  this.__data__ = new MapCache;
	  while (++index < length) {
	    this.add(values[index]);
	  }
	}

	/**
	 * Adds `value` to the array cache.
	 *
	 * @private
	 * @name add
	 * @memberOf SetCache
	 * @alias push
	 * @param {*} value The value to cache.
	 * @returns {Object} Returns the cache instance.
	 */
	function setCacheAdd(value) {
	  this.__data__.set(value, HASH_UNDEFINED);
	  return this;
	}

	/**
	 * Checks if `value` is in the array cache.
	 *
	 * @private
	 * @name has
	 * @memberOf SetCache
	 * @param {*} value The value to search for.
	 * @returns {number} Returns `true` if `value` is found, else `false`.
	 */
	function setCacheHas(value) {
	  return this.__data__.has(value);
	}

	// Add methods to `SetCache`.
	SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	SetCache.prototype.has = setCacheHas;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  var data = this.__data__ = new ListCache(entries);
	  this.size = data.size;
	}

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	  this.size = 0;
	}

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  var data = this.__data__,
	      result = data['delete'](key);

	  this.size = data.size;
	  return result;
	}

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var data = this.__data__;
	  if (data instanceof ListCache) {
	    var pairs = data.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      this.size = ++data.size;
	      return this;
	    }
	    data = this.__data__ = new MapCache(pairs);
	  }
	  data.set(key, value);
	  this.size = data.size;
	  return this;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  var isArr = isArray(value),
	      isArg = !isArr && isArguments(value),
	      isBuff = !isArr && !isArg && isBuffer(value),
	      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	      skipIndexes = isArr || isArg || isBuff || isType,
	      result = skipIndexes ? baseTimes(value.length, String) : [],
	      length = result.length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (
	           // Safari 9 has enumerable `arguments.length` in strict mode.
	           key == 'length' ||
	           // Node.js 0.10 has enumerable non-index properties on buffers.
	           (isBuff && (key == 'offset' || key == 'parent')) ||
	           // PhantomJS 2 has enumerable non-index properties on typed arrays.
	           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	           // Skip index properties.
	           isIndex(key, length)
	        ))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}

	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  if (value == null) {
	    return value === undefined ? undefinedTag : nullTag;
	  }
	  return (symToStringTag && symToStringTag in Object(value))
	    ? getRawTag(value)
	    : objectToString(value);
	}

	/**
	 * The base implementation of `_.isArguments`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 */
	function baseIsArguments(value) {
	  return isObjectLike(value) && baseGetTag(value) == argsTag;
	}

	/**
	 * The base implementation of `_.isEqual` which supports partial comparisons
	 * and tracks traversed objects.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {boolean} bitmask The bitmask flags.
	 *  1 - Unordered comparison
	 *  2 - Partial comparison
	 * @param {Function} [customizer] The function to customize comparisons.
	 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, bitmask, customizer, stack) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	}

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = objIsArr ? arrayTag : getTag(object),
	      othTag = othIsArr ? arrayTag : getTag(other);

	  objTag = objTag == argsTag ? objectTag : objTag;
	  othTag = othTag == argsTag ? objectTag : othTag;

	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && isBuffer(object)) {
	    if (!isBuffer(other)) {
	      return false;
	    }
	    objIsArr = true;
	    objIsObj = false;
	  }
	  if (isSameTag && !objIsObj) {
	    stack || (stack = new Stack);
	    return (objIsArr || isTypedArray(object))
	      ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	      : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	  }
	  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	    if (objIsWrapped || othIsWrapped) {
	      var objUnwrapped = objIsWrapped ? object.value() : object,
	          othUnwrapped = othIsWrapped ? other.value() : other;

	      stack || (stack = new Stack);
	      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  stack || (stack = new Stack);
	  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	}

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * The base implementation of `_.isTypedArray` without Node.js optimizations.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 */
	function baseIsTypedArray(value) {
	  return isObjectLike(value) &&
	    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `array` and `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      arrLength = array.length,
	      othLength = other.length;

	  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(array);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var index = -1,
	      result = true,
	      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

	  stack.set(array, other);
	  stack.set(other, array);

	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, arrValue, index, other, array, stack)
	        : customizer(arrValue, othValue, index, array, other, stack);
	    }
	    if (compared !== undefined) {
	      if (compared) {
	        continue;
	      }
	      result = false;
	      break;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (seen) {
	      if (!arraySome(other, function(othValue, othIndex) {
	            if (!cacheHas(seen, othIndex) &&
	                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	              return seen.push(othIndex);
	            }
	          })) {
	        result = false;
	        break;
	      }
	    } else if (!(
	          arrValue === othValue ||
	            equalFunc(arrValue, othValue, bitmask, customizer, stack)
	        )) {
	      result = false;
	      break;
	    }
	  }
	  stack['delete'](array);
	  stack['delete'](other);
	  return result;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	  switch (tag) {
	    case dataViewTag:
	      if ((object.byteLength != other.byteLength) ||
	          (object.byteOffset != other.byteOffset)) {
	        return false;
	      }
	      object = object.buffer;
	      other = other.buffer;

	    case arrayBufferTag:
	      if ((object.byteLength != other.byteLength) ||
	          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	        return false;
	      }
	      return true;

	    case boolTag:
	    case dateTag:
	    case numberTag:
	      // Coerce booleans to `1` or `0` and dates to milliseconds.
	      // Invalid dates are coerced to `NaN`.
	      return eq(+object, +other);

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings, primitives and objects,
	      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	      // for more details.
	      return object == (other + '');

	    case mapTag:
	      var convert = mapToArray;

	    case setTag:
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	      convert || (convert = setToArray);

	      if (object.size != other.size && !isPartial) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked) {
	        return stacked == other;
	      }
	      bitmask |= COMPARE_UNORDERED_FLAG;

	      // Recursively compare objects (susceptible to call stack limits).
	      stack.set(object, other);
	      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	      stack['delete'](object);
	      return result;

	    case symbolTag:
	      if (symbolValueOf) {
	        return symbolValueOf.call(object) == symbolValueOf.call(other);
	      }
	  }
	  return false;
	}

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	 * @param {Function} customizer The function to customize comparisons.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Object} stack Tracks traversed `object` and `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	      objProps = getAllKeys(object),
	      objLength = objProps.length,
	      othProps = getAllKeys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isPartial) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  // Assume cyclic values are equal.
	  var stacked = stack.get(object);
	  if (stacked && stack.get(other)) {
	    return stacked == other;
	  }
	  var result = true;
	  stack.set(object, other);
	  stack.set(other, object);

	  var skipCtor = isPartial;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key];

	    if (customizer) {
	      var compared = isPartial
	        ? customizer(othValue, objValue, key, other, object, stack)
	        : customizer(objValue, othValue, key, object, other, stack);
	    }
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(compared === undefined
	          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	          : compared
	        )) {
	      result = false;
	      break;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (result && !skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      result = false;
	    }
	  }
	  stack['delete'](object);
	  stack['delete'](other);
	  return result;
	}

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];

	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}

	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}

	/**
	 * Creates an array of the own enumerable symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	  if (object == null) {
	    return [];
	  }
	  object = Object(object);
	  return arrayFilter(nativeGetSymbols(object), function(symbol) {
	    return propertyIsEnumerable.call(object, symbol);
	  });
	};

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = baseGetTag(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : '';

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to convert.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e$1) {}
	  }
	  return '';
	}

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	    !propertyIsEnumerable.call(value, 'callee');
	};

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	/**
	 * Performs a deep comparison between two values to determine if they are
	 * equivalent.
	 *
	 * **Note:** This method supports comparing arrays, array buffers, booleans,
	 * date objects, error objects, maps, numbers, `Object` objects, regexes,
	 * sets, strings, symbols, and typed arrays. `Object` objects are compared
	 * by their own, not inherited, enumerable properties. Functions and DOM
	 * nodes are compared by strict equality, i.e. `===`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.isEqual(object, other);
	 * // => true
	 *
	 * object === other;
	 * // => false
	 */
	function isEqual(value, other) {
	  return baseIsEqual(value, other);
	}

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  if (!isObject(value)) {
	    return false;
	  }
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 9 which returns 'object' for typed arrays and other constructors.
	  var tag = baseGetTag(value);
	  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return value != null && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = isEqual; 
} (lodash_isequal$1, lodash_isequal$1.exports));

var lodash_isequalExports = lodash_isequal$1.exports;
var isEqual = /*@__PURE__*/getDefaultExportFromCjs(lodash_isequalExports);

function stringSetsAreEqual(a, b) {
  if (a.length !== b.length) { return false; }
  return JSON.stringify(a.map(function (id) { return id; }).sort()) === JSON.stringify(b.map(function (id) { return id; }).sort());
}

var featureTypes = {
  Polygon: Polygon,
  LineString: LineString,
  Point: Point$3,
  MultiPolygon: MultiFeature,
  MultiLineString: MultiFeature,
  MultiPoint: MultiFeature,
};

function setupAPI (ctx, api) {
  api.modes = modes$1;

  api.getFeatureIdsAt = function (point) {
    var features = featuresAt.click({ point: point }, null, ctx);
    return features.map(function (feature) { return feature.properties.id; });
  };

  api.getSelectedIds = function () {
    return ctx.store.getSelectedIds();
  };

  api.getSelected = function () {
    return {
      type: geojsonTypes$1.FEATURE_COLLECTION,
      features: ctx.store
        .getSelectedIds()
        .map(function (id) { return ctx.store.get(id); })
        .map(function (feature) { return feature.toGeoJSON(); }),
    };
  };

  api.getSelectedPoints = function () {
    return {
      type: geojsonTypes$1.FEATURE_COLLECTION,
      features: ctx.store.getSelectedCoordinates().map(function (coordinate) { return ({
        type: geojsonTypes$1.FEATURE,
        properties: {},
        geometry: {
          type: geojsonTypes$1.POINT,
          coordinates: coordinate.coordinates,
        },
      }); }),
    };
  };

  api.set = function (featureCollection) {
    if (
      featureCollection.type === undefined ||
      featureCollection.type !== geojsonTypes$1.FEATURE_COLLECTION ||
      !Array.isArray(featureCollection.features)
    ) {
      throw new Error('Invalid FeatureCollection');
    }
    var renderBatch = ctx.store.createRenderBatch();
    var toDelete = ctx.store.getAllIds().slice();
    var newIds = api.add(featureCollection);
    var newIdsLookup = new StringSet(newIds);

    toDelete = toDelete.filter(function (id) { return !newIdsLookup.has(id); });
    if (toDelete.length) {
      api.delete(toDelete);
    }

    renderBatch();
    return newIds;
  };

  api.add = function (geojson, options) {
    if ( options === void 0 ) options = { silent: false };

    var featureCollection = JSON.parse(JSON.stringify(normalize$1(geojson)));

    var ids = featureCollection.features.map(function (feature) {
      feature.id = feature.id || hat$1();

      if (feature.geometry === null) {
        throw new Error('Invalid geometry: null');
      }
      var internalFeature;

      if (ctx.store.get(feature.id) === undefined || ctx.store.get(feature.id).type !== feature.geometry.type) {
        // If the feature has not yet been created ...
        var Model = featureTypes[feature.geometry.type];
        if (Model === undefined) {
          throw new Error(("Invalid geometry type: " + (feature.geometry.type) + "."));
        }
        internalFeature = new Model(ctx, feature);
        ctx.store.add(internalFeature);
      } else {
        // If a feature of that id has already been created, and we are swapping it out ...
        internalFeature = ctx.store.get(feature.id);
        internalFeature.properties = feature.properties;
        if (!isEqual(internalFeature.getCoordinates(), feature.geometry.coordinates)) {
          internalFeature.incomingCoords(feature.geometry.coordinates);
        }
      }

      if (internalFeature && api.options.measureOptions) {
        internalFeature.measure.setOptions(api.options.measureOptions);
        internalFeature.execMeasure();
      }
      return feature.id;
    });
    if (!options.silent) { ctx.store.render(); }
    return ids;
  };

  api.get = function (id) {
    var feature = ctx.store.get(id);
    if (feature) {
      return feature.toGeoJSON();
    }
  };

  api.getAll = function () {
    return {
      type: geojsonTypes$1.FEATURE_COLLECTION,
      features: ctx.store.getAll().map(function (feature) { return feature.toGeoJSON(); }),
    };
  };

  api.delete = function (featureIds) {
    ctx.store.delete(featureIds, { silent: true });
    // If we were in direct select mode and our selected feature no longer exists
    // (because it was deleted), we need to get out of that mode.
    if (api.getMode() === modes$1.DIRECT_SELECT && !ctx.store.getSelectedIds().length) {
      ctx.events.changeMode(modes$1.SIMPLE_SELECT, undefined, { silent: true });
    } else {
      ctx.store.render();
    }

    return api;
  };

  api.deleteAll = function () {
    ctx.store.delete(ctx.store.getAllIds(), { silent: true });
    // If we were in direct select mode, now our selected feature no longer exists,
    // so escape that mode.
    if (api.getMode() === modes$1.DIRECT_SELECT) {
      ctx.events.changeMode(modes$1.SIMPLE_SELECT, undefined, { silent: true });
    } else {
      ctx.store.render();
    }

    return api;
  };

  api.changeMode = function (mode, modeOptions) {
    if ( modeOptions === void 0 ) modeOptions = {};

    // Avoid changing modes just to re-select what's already selected
    if (mode === modes$1.SIMPLE_SELECT && api.getMode() === modes$1.SIMPLE_SELECT) {
      if (stringSetsAreEqual(modeOptions.featureIds || [], ctx.store.getSelectedIds())) { return api; }
      // And if we are changing the selection within simple_select mode, just change the selection,
      // instead of stopping and re-starting the mode
      ctx.store.setSelected(modeOptions.featureIds, { silent: true });
      ctx.store.render();
      return api;
    }

    if (
      mode === modes$1.DIRECT_SELECT &&
      api.getMode() === modes$1.DIRECT_SELECT &&
      modeOptions.featureId === ctx.store.getSelectedIds()[0]
    ) {
      return api;
    }

    ctx.events.changeMode(mode, modeOptions, { silent: true });
    return api;
  };

  api.getMode = function () {
    return ctx.events.getMode();
  };

  api.trash = function () {
    ctx.events.trash({ silent: true });
    return api;
  };

  api.combineFeatures = function () {
    ctx.events.combineFeatures({ silent: true });
    return api;
  };

  api.uncombineFeatures = function () {
    ctx.events.uncombineFeatures({ silent: true });
    return api;
  };

  api.setFeatureProperty = function (featureId, property, value) {
    ctx.store.setFeatureProperty(featureId, property, value);
    return api;
  };

  api.getFeatureTypeById = function (id) {
    return ctx.store.get(id);
  };
  // extend start
  api.undo = function () {
    ctx.events.undo();
    return api;
  };
  api.redo = function () {
    ctx.events.redo();
    return api;
  };
  api.finish = function (m) {
    ctx.events.finish(m);
    return api;
  };
  api.cancel = function (m) {
    ctx.events.cancel(m);
    return api;
  };
  api.drawByCenter = function () {
    ctx.events.drawByCoordinate(ctx.map.getCenter().toArray());
    return api;
  };
  api.drawByCoordinate = function (coord) {
    ctx.events.drawByCoordinate(coord);
    return api;
  };
  api.setStyle = function (styles) {
    ctx.options.styles.forEach(function (style) {
      if (ctx.map.getLayer(style.id)) { ctx.map.removeLayer(style.id); }
    });
    ctx.options.styles = genStyles(styles).map(function (style) {
      ctx.map.addLayer(style);
      return style;
    });
    return api;
  };
  api.edit = function (geojson) {
    var ids = api.add(geojson);
    var type = geojson.type;
    var feature =
      type === geojsonTypes$1.FEATURE
        ? geojson
        : GEOMETRYS.includes(type)
        ? { type: geojsonTypes$1.FEATURE, properties: {}, geometry: geojson }
        : null;
    if (!feature) {
      console.warn('only support edit feature or geometry');
      return api;
    }
    if (feature.geometry.type === geojsonTypes$1.POINT) {
      api.changeMode('simple_select', { featureIds: ids });
    } else {
      api.changeMode('direct_select', { featureId: ids[0] });
    }
    return api;
  };
  api.setMeasureOptions = function (options) {
    ctx.events.setMeasureOptions(options);
    return api;
  };
  // extend end
  return api;
}

var lib = /*#__PURE__*/Object.freeze({
__proto__: null,
CommonSelectors: common_selectors,
constrainFeatureMovement: constrainFeatureMovement,
createMidPoint: createMidpoint,
createSupplementaryPoints: createSupplementaryPoints,
createVertex: createVertex,
doubleClickZoom: doubleClickZoom,
euclideanDistance: euclideanDistance,
featuresAt: featuresAt,
getFeatureAtAndSetCursors: getFeatureAtAndSetCursors,
isClick: isClick,
isEventAtCoordinates: isEventAtCoordinates,
isTap: isTap,
mapEventToBoundingBox: mapEventToBoundingBox,
ModeHandler: ModeHandler,
moveFeatures: moveFeatures,
sortFeatures: sortFeatures,
stringSetsAreEqual: stringSetsAreEqual,
StringSet: StringSet,
theme: styles,
theme3: theme3,
toDenseArray: toDenseArray
});

var setupDraw = function(options, api) {
  options = setupOptions(options);

  var ctx = {
    options: options
  };

  // 初始化实例
  api = setupAPI(ctx, api);
  ctx.api = api;
  var setup = runSetup(ctx);
  api.onAdd = setup.onAdd;
  api.onRemove = setup.onRemove;
  api.types = types$1;
  api.options = options;
  return api;
};

function MapboxDraw(options) {
  setupDraw(options, this);
}
MapboxDraw.modes = modes;
MapboxDraw.constants = Constants;
MapboxDraw.lib = lib;

return MapboxDraw;

}));
