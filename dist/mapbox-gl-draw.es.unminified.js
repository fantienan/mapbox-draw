import { Marker } from 'mapbox-gl';
import * as turf from '@turf/turf';

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

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
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

wgs84$1.RADIUS = 6378137;
wgs84$1.FLATTENING = 1/298.257223563;
wgs84$1.POLAR_RADIUS = 6356752.3142;

var wgs84 = wgs84$1;

geojsonArea.geometry = geometry;
geojsonArea.ring = ringArea;

function geometry(_) {
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
                area += geometry(_.geometries[i]);
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
  CONTROL: 'mapbox-gl-draw-ctrl',
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
  DELETE_ALL: 'draw.deleteAll',
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
  BUTTON_STATUS_CHANGE: 'draw.buttonStatusChange',
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

function mapFireOnDeleteAll(modeInstance, eventData) {
  modeInstance.map.fire(events$1.DELETE_ALL, getEventData(modeInstance, eventData));
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

function mapFireButtonStatusChange(modeInstance, eventData) {
  modeInstance.map.fire(events$1.BUTTON_STATUS_CHANGE, getEventData(modeInstance, eventData));
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
      var marker = markers[index] || new Marker();
      markers[index] = marker;
      marker.setLngLat(coord).addTo(this$1$1.ctx.map);
      var dom = marker.getElement();
      var coordinates = this$1$1.getCoordinates().slice(0, index + 1);
      var value = turf.length(turf.lineString(coordinates), { units: unit.line });
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
    var value = turf.area(geoJson, {units: unit.area});
    var marker = markers[0] || new Marker();
    markers[0] = marker;
    var center = turf.center(geoJson).geometry.coordinates;
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
  delete ctx.options.map;
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
  var mode = this._ctx.api.getMode();
  return mode.startsWith('draw') || mode === modes$1.DIRECT_SELECT;
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
    mode === modes$1.DIRECT_SELECT;
    var isCutMode = mode.includes('cut');
    var disabledCut = isSimpleSelectMode ? !store.getSelected().length : isCutMode ? modeInstance.getWaitCutFeatures().length : true;
    var disableFinish = isSimpleSelectMode || !modeInstance.feature.isValid();
    store.ctx.ui.setDisableButtons(function (buttonStatus) {
      buttonStatus.cut_polygon = { disabled: disabledCut };
      buttonStatus.cut_line = { disabled: disabledCut };
      buttonStatus.draw_center = { disabled: isSimpleSelectMode };
      buttonStatus.finish = { disabled: disableFinish };
      buttonStatus.cancel = { disabled: isSimpleSelectMode };
      buttonStatus.undo = { disabled: modeInstance.redoUndo.undoStack.length === 0 };
      buttonStatus.redo = { disabled: modeInstance.redoUndo.redoStack.length === 0 };
      buttonStatus.trash = { disabled: !store.getSelected().length };
      mapFireButtonStatusChange(modeInstance, { buttonStatus: JSON.parse(JSON.stringify(buttonStatus)) });
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
    controlGroup.className = (classes.CONTROL) + " " + (classes.CONTROL_GROUP) + " " + (classes.CONTROL_BASE);

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
      {
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

var geojsonExtent = {exports: {}};

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

// TODO: use call-bind, is-date, is-regex, is-string, is-boolean-object, is-number-object
function toS(obj) { return Object.prototype.toString.call(obj); }
function isDate(obj) { return toS(obj) === '[object Date]'; }
function isRegExp(obj) { return toS(obj) === '[object RegExp]'; }
function isError(obj) { return toS(obj) === '[object Error]'; }
function isBoolean(obj) { return toS(obj) === '[object Boolean]'; }
function isNumber(obj) { return toS(obj) === '[object Number]'; }
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
		} else if (isBoolean(src) || isNumber(src) || isString(src)) {
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

geojsonExtent.exports = function(_) {
    return getExtent(_).bbox();
};

geojsonExtent.exports.polygon = function(_) {
    return getExtent(_).polygon();
};

geojsonExtent.exports.bboxify = function(_) {
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

var geojsonExtentExports = geojsonExtent.exports;
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
    if (isClickNotthingNoChangeMode(this._ctx)) { return; }
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
  this.feature = feature;
  return this.setState(state);
  // extend end
};

DirectSelect.onStop = function (state) {
  var this$1$1 = this;

  doubleClickZoom.enable(this);
  if (state.feature.isValid()) {
    var geoJson = state.feature.toGeoJSON();
    this.afterRender(function () { return this$1$1.map.fire(events$1.CREATE, { features: [geoJson] }); });
  }
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

  // extend start
  this._reodUndoAdd({ selectedCoordPaths: state.selectedCoordPaths });
  // extend end
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
  if (e.originalEvent.touches && e.originalEvent.touches.length === 2) {
    this.stopDragging(state);
    return;
  }
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
    if (isClickNotthingNoChangeMode(this._ctx)) {
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
    if (isClickNotthingNoChangeMode(this._ctx)) {
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

DrawPolygon.clickOnVertex = function (state, e) {
  var this$1$1 = this;

  // extend start
  if (isDisabledClickOnVertexWithCtx(this._ctx)) { return; }
  if (typeof e === 'function') { return e(); }
  this.afterRender(function () { return mapFireByClickOnVertex(this$1$1, { e: e }); });
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

DrawLineString.clickOnVertex = function (state, e) {
  var this$1$1 = this;

  // extend start
  if (isDisabledClickOnVertexWithCtx(this._ctx)) { return; }
  if (typeof e === 'function') { return e(); }
  this.afterRender(function () { return mapFireByClickOnVertex(this$1$1, { e: e }); });
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
      var combine = turf.combine(item.difference);
      // 将两个feature合并为一个feature
      var nuion = turf.union(item.intersect, combine.features[0]);
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
  if (bufferOptions.width) { cuttingpolygon = turf.buffer(cuttingpolygon, bufferOptions.width, { units: bufferOptions.unit }); }

  this._features.forEach(function (feature) {
    if (geojsonTypes.includes(feature.geometry.type)) {
      store.get(feature.id).measure.delete();
      if (lineTypes.includes(feature.geometry.type)) {
        var splitter = turf.polygonToLine(cuttingpolygon);
        var cuted = turf.lineSplit(feature, splitter);
        // cuted.features = cuted.features.filter((f) => turf.booleanWithin(f, narrow));
        undoStack.lines.push({ cuted: cuted, line: feature });
        cuted.features.sort(function (a, b) { return turf.length(a) - turf.length(b); });
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach(function (id, i) { return (cuted.features[i].id = id); });
        this$1$1._continuous(function () { return this$1$1._batchHighlight(cuted.features, highlightColor); });
        return;
      }
      var afterCut = turf.difference(feature, cuttingpolygon);
      if (!afterCut) { return; }
      var newFeature = this$1$1.newFeature(afterCut);
      var item = { intersect: turf.intersect(feature, cuttingpolygon) };
      if (newFeature.features) {
        var ref = newFeature.features.sort(function (a, b) { return turf.area(a) - turf.area(b); });
        var f = ref[0];
        var rest = ref.slice(1);
        f.id = feature.id;
        this$1$1.addFeature(f);
        api.add(turf.featureCollection(rest.map(function (v) { return v.toGeoJSON(); })), { silent: true });
        this$1$1._execMeasure(f);
        this$1$1._continuous(function () { return this$1$1._batchHighlight(newFeature.features, highlightColor); });
        if (item.intersect) {
          item.difference = turf.featureCollection(newFeature.features.map(function (v) { return v.toGeoJSON(); }));
        }
      } else {
        newFeature.id = feature.id;
        this$1$1.addFeature(newFeature);
        this$1$1._execMeasure(newFeature);
        this$1$1._continuous(function () { return this$1$1._setHighlight(newFeature.id, highlightColor); });
        if (item.intersect) { item.difference = turf.featureCollection([newFeature.toGeoJSON()]); }
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
var u = vec(4);

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
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u[3] = u3;
    var C1len = sum(4, B, 4, u, C1);

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
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u[3] = u3;
    var C2len = sum(C1len, C1, 4, u, C2);

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
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u[3] = u3;
    var Dlen = sum(C2len, C2, 4, u, D);

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
  var startPoint = turf.point(cuttingLineString.geometry.coordinates[0]);
  var endPoint = turf.point(endCoord);
  var undoStack = { geoJson: cuttingLineString, polygons: [], lines: [] };

  this._features.forEach(function (feature) {
    if (turf.booleanDisjoint(feature, cuttingLineString)) {
      console.warn(("Line was outside of Polygon " + (feature.id)));
      return;
    }

    if (!(turf.booleanDisjoint(feature, startPoint) && turf.booleanDisjoint(feature, endPoint))) {
      console.warn("The start and end points of the line must be outside of the poly");
      return;
    }
    store.get(feature.id).measure.delete();
    if (lineTypes.includes(feature.geometry.type)) {
      if (!lineWidth) {
        var cuted = turf.lineSplit(feature, cuttingLineString);
        cuted.features.sort(function (a, b) { return turf.length(a) - turf.length(b); });
        cuted.features[0].id = feature.id;
        api.add(cuted, { silent: true }).forEach(function (id, i) { return (cuted.features[i].id = id); });
        this$1$1._continuous(function () { return this$1$1._batchHighlight(cuted.features, highlightColor); });
        undoStack.lines.push({ cuted: cuted, line: feature });
      } else {
        if (!splitter) {
          buffered = turf.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit });
          splitter = turf.polygonToLine(buffered);
        }
        var cuted$1 = turf.lineSplit(feature, splitter);
        // cuted.features = cuted.features.reduce((prev, curr) => {
        //   if (!turf.booleanWithin(curr, buffered)) prev.push({ ...curr, id: hat() });
        //   return prev;
        // }, []);
        turf.featureCollection([]);
        cuted$1.features.forEach(function (v) { return (v.id = hat$1()); });
        var intersectPoints = turf.lineIntersect(feature, cuttingLineString);
        intersectPoints.features.forEach(function (p) {
          var buffered = turf.buffer(p, 0.1, { units: 'meters' });
          cuted$1.features = cuted$1.features.filter(function (f) { return turf.booleanDisjoint(buffered, f); });
        });
        cuted$1.features.sort(function (a, b) { return turf.length(a) - turf.length(b); });
        if (cuted$1.features.length !== 0) {
          cuted$1.features[0].id = feature.id;
          api.add(cuted$1, { silent: true });
          undoStack.lines.push({ cuted: cuted$1, line: feature });
          this$1$1._continuous(function () { return this$1$1._batchHighlight(cuted$1.features, highlightColor); });
        } else {
          api.delete(feature.id, { silent: true });
          undoStack.lines.push({ cuted: turf.featureCollection([feature]), line: feature });
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
      var buffered$1 = turf.buffer(cuttingLineString, lineWidth, { units: lineWidthUnit });
      item.intersect = turf.intersect(feature, buffered$1);
      afterCut = turf.difference(feature.geometry, buffered$1);
    }
    if (afterCut) {
      var newFeature = this$1$1.newFeature(afterCut);
      var ref = newFeature.features.sort(function (a, b) { return turf.area(a) - turf.area(b); });
      var f = ref[0];
      var rest = ref.slice(1);
      f.id = feature.id;
      api.add(turf.featureCollection(rest.map(function (v) { return v.toGeoJSON(); })), { silent: true });
      this$1$1.addFeature(f);
      this$1$1._execMeasure(f);
      this$1$1._continuous(function () { return this$1$1._batchHighlight(newFeature.features, highlightColor); });
      item.cuted = turf.featureCollection([f.toGeoJSON() ].concat( rest.map(function (v) { return v.toGeoJSON(); })));
    } else {
      api.delete(feature.id, { silent: true });
      this$1$1._continuous();
      item.cuted = turf.featureCollection([feature]);
    }
    if (item.cuted) {
      if (item.intersect) { item.intersect = turf.featureCollection([item.intersect]); }
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
      var combine = turf.combine(item.cuted);
      // 将两个feature合并为一个feature
      var nuionFeature = this$1$1.newFeature(turf.union(f, combine.features[0]));
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
  cancel: false,
  draw_center: false,
  cut_line: false,
  cut_polygon: false,
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

var lodash_isequal = {exports: {}};

/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright JS Foundation and other contributors <https://js.foundation/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
lodash_isequal.exports;

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
	var freeExports = exports && !exports.nodeType && exports;

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
} (lodash_isequal, lodash_isequal.exports));

var lodash_isequalExports = lodash_isequal.exports;
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

    var modeInstance = ctx.events.getModeInstance();
    modeInstance.afterRender(function () { return mapFireOnDeleteAll(modeInstance, {}); });
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
  api.getCtx = function () {
    return ctx;
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

export { MapboxDraw as default };
//# sourceMappingURL=mapbox-gl-draw.es.unminified.js.map
