import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

const mapboxGl = window.mapboxgl;
const turf = window.turf;
const mapboxToken = 'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg'
const MapboxDraw = window.MapboxDraw
const drawCtrCls = MapboxDraw.constants.classes.CONTROL_BUTTON;

function mockCoordinate() {
  return turf.random.randomPosition([103.21881127258172, 26.878483490981296, 117.27592821015219, 33.2831676759686]);
}

function mockFeature(count = 4) {
  const coordinates = [];
  for (let i = 0; i < (count || 4); i++) coordinates.push(mockCoordinate());
  coordinates.push(coordinates[0]);
  const fc = turf.polygonSmooth(turf.bboxPolygon(turf.bbox(turf.polygon([coordinates]))), { iterations: 3 });
  return fc.features[0];
}

const themes =[
  { color: '#fbb03b', style: MapboxDraw.lib.theme },
  { color: '#E1361B', style: MapboxDraw.lib.theme1 },
  { color: '#42baf3', style: MapboxDraw.lib.theme2 }
]

function App() {
  const [, setMap] = useState<mapboxgl.Map>()
  const [draw, setDraw] = useState<MapboxDraw>()
  const [themeIndex, setThemeIndex] = useState(0)
  const [controlContainer, setControlContainer] = useState<HTMLDivElement | null>(null)

  const onTheme = () => {
    const index = (themeIndex + 1) % themes.length;
    setThemeIndex(index);
    draw?.setStyle(themes[index].style)
  }

  const onEdit = () => draw?.edit(mockFeature())

  useEffect(() => {
    const _map = new mapboxGl.Map({
      container: 'map',
      accessToken: mapboxToken,
      preserveDrawingBuffer: true,
      projection: { name: 'globe' },
      zoom: 3,
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
        disabledDragVertexWithSimpleSelectMode:false,
        /** 禁止拖拽 */
        disabledDrag: false,
        /** 禁止选中 */
        disableSelect: false,
        styles: themes[themeIndex].style,
        measureOptions: {
          enable: true,
        }
    })
    _map.addControl(_draw);
    window._draw = _draw
    window._map = _map
    _map.on("style.load", () => {
      setMap(_map);
      setDraw(_draw)
      _map
      .on('draw.redoUndo', (e) => {
        console.log('draw.redoUndo', e)
      })
      .on("draw.onAdd", (e) => {
        console.log('draw.onAdd', e)
        setControlContainer(e.data.controlContainer)
      })

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
  
    })
  },[])
  return <>
    <div id="map"/>
    {!!controlContainer && 
      createPortal(
        <>
          <button className={drawCtrCls} onClick={onEdit} title='Edit Geometry'>
            <svg viewBox="0 0 1509 1024" width="16" height="16"><path d="M766.43851868-190.49113761l732.8107684 530.40072157-21.1358041 64.64162344c-48.82833801 59.62765601-119.56386124 144.86511838-212.20657183 255.7123891l-309.09186866-169.54927096 64.4102095 461.82506108L815.26685663 1197.99242491H313.63860132L33.62775022 339.90958396 766.43851868-190.49113761z" fill="#333333" p-id="5322"></path><path d="M1307.40714229 874.16720321l97.57953864 134.29721429-100.5879199 95.80536646-101.66785234-140.23683951-75.82663004 115.24413564-97.03957346-458.35385193 380.75304768 200.79015129z" fill="#333333"/></svg>
          </button> 
          <button className={drawCtrCls} title="Theme" onClick={onTheme} style={{position: 'relative'}}>
            <svg viewBox="0 0 1024 1024" style={{position: 'absolute', top: 3, left: 5}} width="16" height="16"><path d="M798.08 512.256a82.773333 82.773333 0 1 1 0.085333-165.589333 82.773333 82.773333 0 0 1-0.085333 165.589333zM642.474667 311.04a82.773333 82.773333 0 1 1 0.042666-165.589333 82.773333 82.773333 0 0 1 0 165.589333z m-262.101334 0a82.773333 82.773333 0 1 1 0.042667-165.589333 82.773333 82.773333 0 0 1-0.042667 165.589333z m-153.941333 201.258667a82.773333 82.773333 0 1 1 0-165.589334 82.773333 82.773333 0 0 1 0 165.589334z m286.933333-469.333334C169.898667 42.922667 42.666667 342.741333 42.666667 510.890667c0 168.106667 122.24 470.698667 460.501333 470.698666 0 0 82.773333 1.365333 82.773333-74.24 0-75.648-37.802667-51.626667-37.802666-106.026666s37.802667-78.677333 55.168-78.677334c17.365333 0 137.941333 9.088 204.16-16.853333A271.914667 271.914667 0 0 0 981.333333 459.264c2.474667-122.581333-124.714667-416.341333-467.925333-416.341333z" fill={themes[themeIndex].color}/></svg>
            <svg viewBox="0 0 1024 1024" style={{position: 'absolute', bottom: 2, right: 1}} width="13" height="13"><path d="M514 114.3c-219.9 0-398.9 178.9-398.9 398.8 0.1 220 179 398.9 398.9 398.9 219.9 0 398.8-178.9 398.8-398.8S733.9 114.3 514 114.3z m218.3 489v1.7c0 0.5-0.1 1-0.1 1.6 0 0.3 0 0.6-0.1 0.9 0 0.5-0.1 1-0.2 1.5 0 0.3-0.1 0.7-0.1 1-0.1 0.4-0.1 0.8-0.2 1.2-0.1 0.4-0.2 0.9-0.2 1.3-0.1 0.3-0.1 0.6-0.2 0.8-0.1 0.6-0.3 1.2-0.4 1.8 0 0.1-0.1 0.2-0.1 0.3-2.2 8.5-6.6 16.6-13.3 23.3L600.7 755.4c-20 20-52.7 20-72.6 0-20-20-20-52.7 0-72.6l28.9-28.9H347c-28.3 0-51.4-23.1-51.4-51.4 0-28.3 23.1-51.4 51.4-51.4h334c13.2 0 26.4 5 36.4 15s15 23.2 15 36.4c0 0.3-0.1 0.6-0.1 0.8z m0.1-179.5c0 28.3-23.1 51.4-51.4 51.4H347c-13.2 0-26.4-5-36.4-15s-15-23.2-15-36.4v-0.8-1.6c0-0.5 0.1-1.1 0.1-1.6 0-0.3 0-0.6 0.1-0.9 0-0.5 0.1-1 0.2-1.5 0-0.3 0.1-0.7 0.1-1 0.1-0.4 0.1-0.8 0.2-1.2 0.1-0.4 0.2-0.9 0.2-1.3 0.1-0.3 0.1-0.6 0.2-0.8 0.1-0.6 0.3-1.2 0.4-1.8 0-0.1 0.1-0.2 0.1-0.3 2.2-8.5 6.6-16.6 13.3-23.3l116.6-116.6c20-20 52.7-20 72.6 0 20 20 20 52.7 0 72.6L471 372.5h210c28.2 0 51.4 23.1 51.4 51.3z" fill="#0C0C0C"></path></svg>
          </button> 
        </>,
        controlContainer
      )}
  </>
}

export default App
