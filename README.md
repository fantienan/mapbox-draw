# @ttfn/mapbox-gl-draw

在[mapbox-gl-draw](https://github.com/mapbox/mapbox-gl-draw)的基础上扩展了更多功能。

## 安装

```
pnpm add @ttfn/mapbox-gl-draw
```

## 功能

- 撤销、回退
- 完成、取消
- 坐标点绘制
- 编辑图形
- 切换主题

## 配置

### disabledClickOnVertex
- 描述：双击落点或者落点与其它节点重合时是否禁止完成绘制
- 类型： boolean | undefined
- 默认值：undefined

### ignoreClickOnVertex
- 描述：是否忽略双击落点或者落点与其它节点重合的检测
- 类型： boolean | undefined
- 默认值：undefined

### stopPropagationClickActiveFeatureHandlerClassName
- 描述：当点击源的元素有selector时，阻止触发高亮图斑点击事件
- 类型： string | undefined
- 默认值：undefined

### clickNotthingNoChangeMode
- 描述：编辑模式下点击图形以外部分不退出编辑模式
- 类型： boolean | undefined
- 默认值：true

### disabledDragVertexWithSimpleSelectMode
- 描述：simple_select mode 下禁止拖拽节点，点要素在simple_select mode 下才允许编辑
- 类型： boolean | undefined
- 默认值：undefined

### disabledDrag
- 描述：禁止拖拽
- 类型： boolean | undefined
- 默认值：undefined

### disableSelect
- 描述：禁止选中
- 类型： boolean | undefined
- 默认值：undefined

### measureOptions
- 描述：测量配置
- 类型： object | undefined
- 默认值：undefined
- enable: 
    - 描述：是否启用测量功能
    - 类型：boolean | undefined 
    - 默认值：undefined
- unit: 
    - 描述：测量单位
    - 类型：object | undefined
    - 默认值：undefined，
        - line: 
            - 描述：线测量单位，
            - 类型：MeasureLineUnit | undefined
            - 默认值：undefined
        - area: 
            - 描述：面积测量单位
            - 类型：MeasureAreaUnit | undefined
            - 默认值：undefined
- precision: 
   - 描述：测量精度
   - 类型：number | undefined
   - 默认值：undefined