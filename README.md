# @ttfn/mapbox-gl-draw

在[mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw)的基础上扩展了更多功能。

**必须安装 [mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js).**

## 安装

```
pnpm add @ttfn/mapbox-gl-draw
```

## 使用

### JavaScript

**es module的方式使用**

```js
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@ttfn/mapbox-gl-draw";
```

**umd的方式使用**

```html
<script src="/lib/ttfn/mapbox-gl-draw/dist/mapbox-gl-draw.umd.min.js"></script>
```

### CSS

**es module的方式使用**

```js
import '@ttfn/mapbox-gl-draw/dist/mapbox-gl-draw.css';
```

**umd的方式使用**

```html
<script src="/lib/ttfn/mapbox-gl-draw/dist/mapbox-gl-draw.css"></script>
```

## 扩展功能

### undo() => this
- 描述：撤销
### redodo: () => this 
- 描述：重做
### finish: () => this
- 描述：完成绘制
### cancel: () => this
- 描述：取消绘制
### drawByCenter: () => this
- 描述：通过中心点绘制
### drawByCoordinate: (coord: number[]) => this
- 描述：通过坐标绘制
### setStyle: (styles: object[]) => this
- 描述：设置样式
### edit: (geojson: Feature | Geometry) => this
- 描述：编辑图形
### setMeasureOptions: (options: MapboxDraw.MapboxDrawOptions['measureOptions']) => this
- 描述：设置测量选项

## 扩展配置

### disabledClickOnVertex?: boolean
- 描述：双击落点或者落点与其它节点重合时是否禁止完成绘制
- 默认值：undefined

### ignoreClickOnVertex?: boolean
- 描述：是否忽略双击落点或者落点与其它节点重合的检测
- 默认值：undefined

### stopPropagationClickActiveFeatureHandlerClassName?: string
- 描述：当点击源的元素有selector时，阻止触发高亮图斑点击事件
- 默认值：undefined

### clickNotthingNoChangeMode?: boolean
- 描述：编辑模式下点击图形以外部分不退出编辑模式
- 默认值：undefined

### disabledDragVertexWithSimpleSelectMode?: boolean
- 描述：simple_select mode 下禁止拖拽节点，点要素在simple_select mode 下才允许编辑
- 默认值：undefined

### disabledDrag?: boolean
- 描述：禁止拖拽
- 默认值：undefined

### disableSelect?: boolean
- 描述：禁止选中
- 默认值：undefined

### measureOptions?: object
- 描述：测量配置
- 默认值：undefined
- enable?: boolean 
    - 描述：是否启用测量功能
    - 默认值：undefined
- unit?: object 
    - 描述：测量单位
    - 默认值：undefined，
        - line?: MapboxDraw.MeasureLineUnit 
            - 描述：线测量单位，
            - 默认值：undefined
        - area: MapboxDraw.MeasureAreaUnit
            - 描述：面积测量单位
            - 默认值：undefined
- precision?: number 
   - 描述：测量精度
   - 默认值：undefined

## 事件

### draw.redoUndo: DrawUndoEvent
- 描述：撤销回退的事件通知
- 示例

```js
map.on("draw.redoUndo", (e) => {
    console.log(e)
})
```

### draw.clickOnVertex: DrawClickOnVertexEvnet
- 描述：点击节点的事件通知
### draw.onMidpoint: DrawOnMidpointEvent
- 描述：点击中间节点的事件通知
### draw.dragVertex: DrawDragVertexEvent
- 描述：拖拽节点的事件通知
### draw.clickOrTab: DrawClickOrTabEvent
- 描述：点击地图的事件通知，分为一下几类行为
    - clickNoTarget：点击当前选中的图形
    - clickInactiveFeature：点击非高亮图形
    - clickActiveFeature：点击高亮图形
    - null：没有命中
### draw.drag: DrawDragEvent
- 描述：拖拽图形的事件通知
### draw.clearSelectedCoordinates: DrawClearSelectedCoordinatesEvent
- 描述：清除选中坐标点的事件通知
### draw.addPoint: DrawAddPointEvent
- 描述：落点的事件通知
### draw.onAdd: DrawOnAddEvent
- 描述：绘制工具挂载到地图中的事件通知