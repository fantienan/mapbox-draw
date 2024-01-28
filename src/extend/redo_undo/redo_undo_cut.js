import { mapFireRedoUndo } from '../utils';
import * as Constants from '../../constants';

export class RedoUndoCut {
  constructor(options) {
    this._modeInstance = options.modeInstance;
    this._ctx = options.ctx;
    this._api = options.ctx.api;
    this.undoStack = [];
    this.redoStack = [];
    this._addPointEvent = this._drawAddPointEvent.bind(this);
    this._bindEvent();
  }

  _bindEvent() {
    this._unbindEvent();
    this._ctx.map.on(Constants.events.ADD_POINT, this._addPointEvent);
  }

  _unbindEvent() {
    this._ctx.map.off(Constants.events.ADD_POINT, this._addPointEvent);
  }

  _drawAddPointEvent(e) {
    this.redoStack = [];
    const coord = e.data.e.lngLat.toArray();
    this.undoStack.push(coord);
    if (this.undoStack.length === 1) this.undoStack.push(coord);

    this._fireChange({ type: 'add' });
  }

  _fireChangeAndRender(eventData) {
    this._modeInstance.afterRender(() => this._fireChange(eventData), true);
  }

  _genStacks(stacks) {
    return stacks.map((v) => ({ type: Array.isArray(v) ? 'draw' : 'cut', stack: v }));
  }

  _fireChange({ cb, ...eventData }) {
    const e = { ...eventData, undoStack: this._genStacks(this.undoStack), redoStack: this._genStacks(this.redoStack) };
    mapFireRedoUndo(this._modeInstance, JSON.parse(JSON.stringify(e)));
    typeof cb === 'function' && cb();
  }

  setRedoUndoStack(cb) {
    const { undoStack, redoStack } = cb({ undoStack: this.undoStack, redoStack: this.redoStack });
    if (Array.isArray(undoStack)) this.undoStack = JSON.parse(JSON.stringify(undoStack));
    if (Array.isArray(redoStack)) this.redoStack = JSON.parse(JSON.stringify(redoStack));
    console.log('setRedoUndoStack', this.undoStack, this.redoStack);

    this._fireChangeAndRender({ type: 'cut' });
  }

  undo(cb = () => {}) {
    let coord = null;
    const state = this._modeInstance.getState();
    const pos = state.currentVertexPosition - 1;
    const position = Math.max(0, pos);
    const stack = this.undoStack.pop();
    if (Array.isArray(stack)) {
      if (state.line) {
        [coord] = state.line.removeCoordinate(`${position}`);
      } else if (state.polygon) {
        [coord] = state.polygon.removeCoordinate(`0.${position}`, true);
      }

      if (coord) {
        if (state.currentVertexPosition === 0) return;
        state.currentVertexPosition--;
        this.redoStack.push(coord);
        this._fireChangeAndRender({ type: 'undo', cb });
      }
    }

    return this._genStacks([stack])[0];
  }

  redo(cb = () => {}) {
    const state = this._modeInstance.getState();
    const coord = this.redoStack.pop();
    if (Array.isArray(coord)) {
      if (state.line) {
        state.line.addCoordinate(state.currentVertexPosition++, coord[0], coord[1]);
      } else if (state.polygon) {
        if (state.polygon.coordinates[0].length === 0) {
          state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, coord[0], coord[1]);
        }
        state.polygon.addCoordinate(`0.${state.currentVertexPosition++}`, coord[0], coord[1]);
        if (this.undoStack.length === 0) this.undoStack.push(coord);
        this.undoStack.push(coord);
      }
      this._fireChangeAndRender({ type: 'redo', cb });
    }
    return this._genStacks([coord])[0];
  }

  destroy() {
    this._unbindEvent();
    this.reset();
  }

  reset() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
