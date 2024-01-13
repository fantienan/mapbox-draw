import xtend from 'xtend';
import * as Constants from './constants';

import styles from './lib/theme';
import modes from './modes/index';

const defaultOptions = {
  defaultMode: Constants.modes.SIMPLE_SELECT,
  keybindings: true,
  touchEnabled: true,
  clickBuffer: 2,
  touchBuffer: 25,
  boxSelect: true,
  displayControlsDefault: true,
  styles,
  modes,
  controls: {},
  userProperties: false,
  measureOptions: {
    enable: true,
  },
};

const showControls = {
  point: true,
  line_string: true,
  polygon: true,
  trash: true,
  combine_features: true,
  uncombine_features: true,
  /** extend start */
  undo: true,
  redo: true,
  finish: true,
  cancel: true,
  draw_center: true,
  /** extend end */
};

const hideControls = {
  point: false,
  line_string: false,
  polygon: false,
  trash: false,
  combine_features: false,
  uncombine_features: false,
  /** extend start */
  undo: false,
  redo: false,
  cancel: true,
  draw_center: true,
  /** extend end */
};

function addSources(styles, sourceBucket) {
  return styles.map((style) => {
    if (style.source) return style;
    return xtend(style, {
      id: `${style.id}.${sourceBucket}`,
      source: sourceBucket === 'hot' ? Constants.sources.HOT : Constants.sources.COLD,
    });
  });
}

// extend start
export function genStyles(styles) {
  return addSources(styles, 'cold').concat(addSources(styles, 'hot'));
}
// extend end

export default function (options = {}) {
  let withDefaults = xtend(options);

  if (!options.controls) {
    withDefaults.controls = {};
  }

  if (options.displayControlsDefault === false) {
    withDefaults.controls = xtend(hideControls, options.controls);
  } else {
    withDefaults.controls = xtend(showControls, options.controls);
  }

  withDefaults = xtend(defaultOptions, withDefaults);

  // extend start Layers with a shared source should be adjacent for performance reasons
  withDefaults.styles = genStyles(withDefaults.styles);
  // extend end

  return withDefaults;
}
