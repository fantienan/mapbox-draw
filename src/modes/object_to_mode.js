import ModeInterface from './mode_interface';
import * as Constants from '../constants';

const eventMapper = {
  drag: 'onDrag',
  click: 'onClick',
  mousemove: 'onMouseMove',
  mousedown: 'onMouseDown',
  mouseup: 'onMouseUp',
  mouseout: 'onMouseOut',
  keyup: 'onKeyUp',
  keydown: 'onKeyDown',
  touchstart: 'onTouchStart',
  touchmove: 'onTouchMove',
  touchend: 'onTouchEnd',
  tap: 'onTap',
};

const eventKeys = Object.keys(eventMapper);

export default function (modeObject) {
  const modeObjectKeys = Object.keys(modeObject);
  return function (ctx, startOpts = {}) {
    let state = {};
    const mode = modeObjectKeys.reduce((m, k) => {
      m[k] = modeObject[k];
      return m;
    }, new ModeInterface(ctx));
    function wrapper(eh) {
      return (e) => mode[eh](state, e);
    }

    return {
      start() {
        state = mode.onSetup(startOpts); // this should set ui buttons
        if (ctx.options.measureOptions) {
          const modeName = ctx.api.getMode();
          if (modeName !== Constants.modes.CUT_LINE && modeName !== Constants.modes.CUT_POLYGON) {
            mode.setMeasureOptions(ctx.options.measureOptions);
          }
        }
        // Adds event handlers for all event options
        // add sets the selector to false for all
        // handlers that are not present in the mode
        // to reduce on render calls for functions that
        // have no logic
        eventKeys.forEach((key) => {
          const modeHandler = eventMapper[key];
          let selector = () => false;
          if (modeObject[modeHandler]) {
            selector = () => true;
          }
          this.on(key, selector, wrapper(modeHandler));
        });
      },
      stop() {
        return mode.onStop(state);
      },
      trash() {
        mode.onTrash(state);
      },
      combineFeatures() {
        mode.onCombineFeatures(state);
      },
      uncombineFeatures() {
        mode.onUncombineFeatures(state);
      },
      render(geojson, push) {
        mode.toDisplayFeatures(state, geojson, push);
      },
      // extend start
      undo() {
        mode.undo();
      },
      redo() {
        mode.redo();
      },
      finish(m) {
        mode.finish(m);
      },
      cancel(m) {
        mode.cancel(m);
      },
      drawByCoordinate(coord) {
        mode.drawByCoordinate(coord);
      },
      getModeInstance() {
        return mode;
      },
      setMeasureOptions(options) {
        mode.setMeasureOptions(options);
      },
      // extend end
    };
  };
}
