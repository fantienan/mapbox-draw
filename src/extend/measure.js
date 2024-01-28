import xtend from 'xtend';

const getDefaultOptions = () => ({
  unit: { line: 'meters', area: 'meters' },
  precision: 2,
});

export class Measure {
  constructor(options) {
    this.ctx = options.ctx;
    this.markers = [];
    this.enabled = false;
  }

  setOptions(options) {
    this.options = xtend(getDefaultOptions(), options);
    this[options.enable ? 'enable' : 'cancel']();
  }

  enable() {
    this.enabled = true;
  }

  cancel() {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
    this.enabled = false;
  }
  destroy() {
    this.cancel();
  }

  delete() {
    debugger;

    this.cancel();
  }
}
