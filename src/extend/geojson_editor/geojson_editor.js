// 参考https://nebula.gl/geojson-editor/

import xtend from 'xtend';
import { LineCut } from './line-sut';
import { PolygonCut } from './polygon-cut';

export class GeoJsonEditor {
  constructor(options) {
    this.lineSplit = new LineCut({ ctx: options.ctx });
    this.polygonSplit = new PolygonCut({ ctx: options.ctx });
    debugger;
  }

  setOptions(options) {
    this.options = xtend(this.options, options);
  }
}
