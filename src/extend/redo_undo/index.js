import { RedoUndo } from './redo_undo';
import { RedoUndoCut } from './redo_undo_cut';

export const installRedoUndo = (options) => {
  return options.ctx.events.getMode().includes('cut') ? new RedoUndoCut(options) : new RedoUndo(options);
};
