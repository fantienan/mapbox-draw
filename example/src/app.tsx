import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { editIcon, themeIcon } from './icon';

const mapboxGl = window.mapboxgl;
const turf = window.turf;
const mapboxToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg';
const MapboxDraw = window.MapboxDraw;
const drawCtrCls = MapboxDraw.constants.classes.CONTROL_BUTTON;

function mockCoordinate() {
  return turf.random.randomPosition([114.40505643781512, 39.1356395975223, 119.75667936801392, 41.30376077536678]);
}

function mockFeature(count = 4) {
  const coordinates = [];
  for (let i = 0; i < (count || 4); i++) coordinates.push(mockCoordinate());
  coordinates.push(coordinates[0]);
  const fc = turf.polygonSmooth(turf.bboxPolygon(turf.bbox(turf.polygon([coordinates]))), { iterations: 3 });
  return fc.features[0];
}

const themes = [
  { color: '#fbb03b', style: MapboxDraw.lib.theme },
  { color: '#E1361B', style: MapboxDraw.lib.theme1 },
  { color: '#42baf3', style: MapboxDraw.lib.theme2 },
];

function App() {
  const [, setMap] = useState<mapboxgl.Map>();
  const [draw, setDraw] = useState<MapboxDraw>();
  const [themeIndex, setThemeIndex] = useState(0);
  const [controlContainer, setControlContainer] = useState<HTMLDivElement | null>(null);

  const onTheme = () => {
    const index = (themeIndex + 1) % themes.length;
    setThemeIndex(index);
    draw?.setStyle(themes[index].style);
  };

  const onEdit = () => draw?.edit(mockFeature());

  useEffect(() => {
    const _map = new mapboxGl.Map({
      container: 'map',
      accessToken: mapboxToken,
      preserveDrawingBuffer: true,
      projection: { name: 'globe' },
      hash: true,
      style: '/style.json' + '?t=' + Date.now(),
    });
    const _draw = new MapboxDraw({
      /** 双击落点或者落点与其它节点重合时是否禁止完成绘制 */
      disabledClickOnVertex: false,
      /** 受否忽略双击落点或者落点与其它节点重合的检测 */
      ignoreClickOnVertex: false,
      /** 当点击源的元素有selector时，阻止触发高亮图斑点击事件 */
      stopPropagationClickActiveFeatureHandlerClassName: '',
      /** 编辑模式下点击图形以外部分不退出编辑模式, 默认true */
      clickNotthingNoChangeMode: false,
      /** simple_select mode 下禁止拖拽节点，点要素在simple_select mode 下才允许编辑 */
      disabledDragVertexWithSimpleSelectMode: false,
      /** 禁止拖拽 */
      disabledDrag: false,
      /** 禁止选中 */
      disableSelect: false,
      styles: themes[themeIndex].style,
      measureOptions: {
        enable: true,
      },
      geoJsonEditorOptions: {
        layers: ['BEIJIGN'],
      },
    });
    _map.addControl(_draw);
    window._draw = _draw;
    window._map = _map;
    _map.on('style.load', () => {
      setMap(_map);
      setDraw(_draw);
      _map
        .on('draw.redoUndo', (e) => {
          console.log('draw.redoUndo', e);
        })
        .on('draw.onAdd', (e) => {
          console.log('draw.onAdd', e);
          setControlContainer(e.data.controlContainer);
        });

      // .on('draw.render', (e) => {
      //   // console.log('draw.render', e)
      // })
      // .on('draw.clickOnVertex', (e) => {
      //   console.log('draw.clickOnVertex', e)
      // })
      // .on('draw.dragVertex', (e) => {
      //   console.log('draw.dragVertex', e)
      // })
      // .on("draw.onMidpoint", (e) => {
      //   console.log('draw.onMidpoint', e)
      // })
      // .on("draw.dragVertex", (e) => {
      //   console.log('draw.dragVertex', e)
      // })
      // .on("draw.clickOrTab", (e) => {
      //   console.log('draw.clickOrTab', e)
      // })
      // .on("draw.drag", (e) => {
      //   console.log('draw.drag', e)
      // })
      // .on("draw.clearSelectedCoordinates", (e) => {
      //   console.log('draw.clearSelectedCoordinates', e)
      // })
      // .on("draw.addPoint", (e) => {
      //   console.log('draw.addPoint', e)
      // })
    });
  }, []);
  return (
    <>
      <div id="map" />
      {!!controlContainer &&
        createPortal(
          <>
            <button className={drawCtrCls} onClick={onEdit} title="Edit Geometry">
              {editIcon}
            </button>
            <button className={drawCtrCls} title="Theme" onClick={onTheme} style={{ position: 'relative' }}>
              {themeIcon(themes[themeIndex].color)}
            </button>
          </>,
          controlContainer,
        )}
    </>
  );
}

export default App;

function polygonCut(poly, line, tolerance = 0.001, toleranceType = 'kilometers') {
  debugger;
  // 1. 条件判断
  if (poly.geometry === void 0 || poly.geometry.type !== 'Polygon') throw '传入的必须为polygon';
  if (line.geometry === void 0 || line.geometry.type.toLowerCase().indexOf('linestring') === -1) throw '传入的必须为linestring';
  if (line.geometry.type === 'LineString') {
    if (
      turf.booleanPointInPolygon(turf.point(line.geometry.coordinates[0]), poly) ||
      turf.booleanPointInPolygon(turf.point(line.geometry.coordinates[line.geometry.coordinates.length - 1]), poly)
    )
      throw '起点和终点必须在多边形之外';
  }
  // 2. 计算交点，并把线的点合并
  let lineIntersect = turf.lineIntersect(line, poly);
  const lineExp = turf.explode(line);
  for (let i = 0; i < lineExp.features.length - 1; i++) {
    lineIntersect.features.push(turf.point(lineExp.features[i].geometry.coordinates));
  }
  return turf.featureCollection(lineIntersect.features);
  // 3. 计算线的缓冲区
  const lineBuffer = turf.buffer(line, tolerance, {
    units: toleranceType,
  });
  // 4. 计算线缓冲和多边形的difference，返回"MultiPolygon"，所以将其拆开
  const _body = turf.difference(poly, lineBuffer);
  let pieces = [];
  if (_body.geometry.type === 'Polygon') {
    pieces.push(turf.polygon(_body.geometry.coordinates));
  } else {
    _body.geometry.coordinates.forEach(function (a) {
      pieces.push(turf.polygon(a));
    });
  }
  return turf.featureCollection(pieces);
  debugger;
  // 5. 处理点数据
  for (const p in pieces) {
    const piece = pieces[p];
    for (let c in piece.geometry.coordinates[0]) {
      const coord = piece.geometry.coordinates[0][c];
      const p = turf.point(coord);
      for (let lp in lineIntersect.features) {
        const lpoint = lineIntersect.features[lp];
        if (turf.distance(lpoint, p, toleranceType) <= tolerance * 2) {
          piece.geometry.coordinates[0][c] = lpoint.geometry.coordinates;
        }
      }
    }
  }
  // 6. 过滤掉重复点
  for (const p in pieces) {
    const coords = pieces[p].geometry.coordinates[0];
    pieces[p].geometry.coordinates[0] = filterDuplicatePoints(coords);
  }
  // 7. 将属性赋予每一个polygon，并处理id
  pieces.forEach((a, index) => {
    a.properties = Object.assign({}, poly.properties);
    a.properties.id += `-${index}`;
  });
  return turf.featureCollection(pieces);
}

function filterDuplicatePoints(coords) {
  debugger;
  return coords;
}

window.cut = () => {
  const features = window._draw.getAll().features;
  const line = features.find((a) => a.geometry.type === 'LineString');
  const poly = features.find((a) => a.geometry.type === 'Polygon');
  const fs = polygonCut(poly, line);
  const id = Math.random().toString(16).slice(2);
  window._map.addSource(id, {
    type: 'geojson',
    data: fs,
  });
  window._map.addLayer({
    id: id + '-fill',
    source: id,
    type: 'fill',
    paint: {
      'fill-color': '#f00',
      'fill-opacity': 0.5,
    },
  });
  window._map.addLayer({
    id: id + '-line',
    source: id,
    type: 'line',
    paint: {
      'line-color': '#f00',
      'line-width': 2,
    },
  });
  window._map.addLayer({
    id: id + '-circle',
    source: id,
    type: 'circle',
    paint: {
      'circle-color': '#f00',
      'circle-radius': 4,
    },
  });
};
