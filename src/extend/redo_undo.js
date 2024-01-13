import xtend from 'xtend';
import { mapFireRedoUndo } from './utils';
import * as Constants from '../constants';

export class RedoUndo {
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

  _drawAddPointEvent() {
    this.undoStack = [];
    this.redoStack = [];
    this.fireChange({ type: 'clear' });
  }

  _fireChangeAndRender(eventData) {
    this._modeInstance.afterRender(() => this.fireChange(eventData), true);
  }

  fireChange(eventData) {
    let undoStack = this.undoStack;
    const modeName = this._api.getMode();
    if (modeName === Constants.modes.DRAW_LINE_STRING) {
      undoStack = this._modeInstance.feature.getCoordinates();
      undoStack.pop();
    } else if (modeName === Constants.modes.DRAW_POLYGON) {
      undoStack = this._modeInstance.feature.getCoordinates()[0] || [];
      if (undoStack.length < 3) undoStack = [];
    }
    const e = xtend(eventData, { undoStack, redoStack: this.redoStack });
    this._ctx.ui.setDisableButtons((buttonStatus) => {
      buttonStatus.undo = { disabled: e.undoStack.length === 0 };
      buttonStatus.redo = { disabled: e.redoStack.length === 0 };
      return buttonStatus;
    });

    mapFireRedoUndo(this._modeInstance, JSON.parse(JSON.stringify(e)));
  }

  undo() {
    let coord = null;
    const state = this._modeInstance.getState();
    const pos = state.currentVertexPosition - 1;
    const position = Math.max(0, pos);
    if (state.line) {
      [coord] = state.line.removeCoordinate(`${position}`);
    } else if (state.polygon) {
      [coord] = state.polygon.removeCoordinate(`0.${position}`, true);
    }
    if (coord) {
      state.currentVertexPosition--;
      this.redoStack.push(coord);
      this._fireChangeAndRender({ type: 'undo' });
    }
  }

  redo() {
    const state = this._modeInstance.getState();
    const coord = this.redoStack.pop();
    if (!coord) return;
    if (state.line) {
      state.line.addCoordinate(state.currentVertexPosition++, coord[0], coord[1]);
    } else if (state.polygon) {
      state.polygon.addCoordinate(`0.${state.currentVertexPosition++}`, coord[0], coord[1]);
    }
    this._fireChangeAndRender({ type: 'redo' });
  }

  destroy() {
    this._unbindEvent();
    this.undoStack = [];
    this.redoStack = [];
  }
}
