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
      userProperties: true,
    });
    _map.addControl(_draw);
    window._draw = _draw;
    window._map = _map;
    _map.on('style.load', () => {
      setMap(_map);
      setDraw(_draw);

      // _map.addLayer({
      //   id: '1',
      //   type: 'fill',
      //   source: {
      //     type: 'geojson',
      //     data: {
      //       type: 'Feature',
      //       properties: {},
      //       geometry: {
      //         type: 'Polygon',
      //         coordinates: [
      //           [
      //             [117.91566869928491, 40.60909802761085],
      //             [118.56702385052388, 40.5596359358965],
      //             [118.5854002652149, 40.75654579909049],
      //             [117.93672961562264, 40.684278918779754],
      //             [117.91566869928491, 40.60909802761085],
      //           ],
      //         ],
      //       },
      //     },
      //   },
      // });

      _draw.set({
        type: 'FeatureCollection',
        features: [
          {
            id: '175670f9bc6228803c4545ae9315f044',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [117.9463405121158, 40.7185868164847],
                  [117.86813037283878, 40.43940105481127],
                  [118.55246909151464, 40.403676481698284],
                  [118.58766365418933, 40.78079882237071],
                  [118.63458973775658, 41.138123864880896],
                  [118.33739120850095, 40.831118286048195],
                  [118.1262238324523, 41.202884142601135],
                  [117.8055622614167, 40.84886898664695],
                  [117.40278004413915, 40.857742554299676],
                  [117.9463405121158, 40.7185868164847],
                ],
              ],
              type: 'Polygon',
            },
          },
          {
            id: 'c30a9f9b67b76c8021fa40a5409287b2',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [119.22581090763043, 40.92706311226121],
                  [119.09676417782362, 40.64578403249419],
                  [119.60513008312557, 40.62501109215793],
                  [119.56993552045077, 41.03039180552224],
                  [119.22581090763043, 40.92706311226121],
                ],
              ],
              type: 'Polygon',
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
