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
  { color: '#E1361B', style: MapboxDraw.lib.theme3 },
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
      userProperties: true,
    });
    _map.addControl(_draw);
    window._draw = _draw;
    window._map = _map;
    _map.on('style.load', () => {
      setMap(_map);
      setDraw(_draw);

      _draw.set({
        type: 'FeatureCollection',
        features: [
          {
            id: '5cb05b72e9a8491c698ba60c52ef075f',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [117.42361190744288, 39.59406539392941],
                  [117.42348412604088, 39.59291960178655],
                  [117.42507558531241, 39.5927704087068],
                  [117.42552862846355, 39.59430409824097],
                  [117.42361190744288, 39.59406539392941],
                ],
              ],
              type: 'Polygon',
            },
          },
          {
            id: '1dd6d5e8131c6f806c32ce3d350a40f8',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [117.42652377452879, 39.594330952424116],
                  [117.42603588190565, 39.59274653778425],
                  [117.42784031019016, 39.59275847320856],
                  [117.42771041745135, 39.59438032357417],
                  [117.42652377452879, 39.594330952424116],
                ],
              ],
              type: 'Polygon',
            },
          },
          {
            id: '722025ebe6d4e53db46bc7b8d803807d',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [117.42371343893097, 39.59477562088702],
                [117.42776726375399, 39.594826870077384],
              ],
              type: 'LineString',
            },
          },
        ],
      });
      _map
        .on('draw.redoUndo', (e) => {
          // console.log('draw.redoUndo', e);
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
