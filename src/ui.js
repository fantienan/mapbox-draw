import xtend from 'xtend';
import * as Constants from './constants';

const classTypes = ['mode', 'feature', 'mouse'];

export default function (ctx) {
  const buttonElements = {};
  let activeButton = null;

  let currentMapClasses = {
    mode: null, // e.g. mode-direct_select
    feature: null, // e.g. feature-vertex
    mouse: null, // e.g. mouse-move
  };

  let nextMapClasses = {
    mode: null,
    feature: null,
    mouse: null,
  };

  function clearMapClasses() {
    queueMapClasses({ mode: null, feature: null, mouse: null });
    updateMapClasses();
  }

  function queueMapClasses(options) {
    nextMapClasses = xtend(nextMapClasses, options);
  }

  function updateMapClasses() {
    if (!ctx.container) return;

    const classesToRemove = [];
    const classesToAdd = [];

    classTypes.forEach((type) => {
      if (nextMapClasses[type] === currentMapClasses[type]) return;

      classesToRemove.push(`${type}-${currentMapClasses[type]}`);
      if (nextMapClasses[type] !== null) {
        classesToAdd.push(`${type}-${nextMapClasses[type]}`);
      }
    });

    if (classesToRemove.length > 0) {
      ctx.container.classList.remove(...classesToRemove);
    }

    if (classesToAdd.length > 0) {
      ctx.container.classList.add(...classesToAdd);
    }

    currentMapClasses = xtend(currentMapClasses, nextMapClasses);
  }

  function createControlButton(id, options = {}) {
    const button = document.createElement('button');
    button.className = `${Constants.classes.CONTROL_BUTTON} ${options.className}`;
    button.setAttribute('title', options.title);
    button.disabled = !!options.disabled;
    options.container.appendChild(button);
    button.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof options.onClick === 'function') {
          options.onClick();
          return;
        }

        const clickedButton = e.target;
        if (clickedButton === activeButton) {
          deactivateButtons();
          options.onDeactivate();
          return;
        }

        setActiveButton(id);
        options.onActivate();
      },
      true,
    );

    return button;
  }

  function deactivateButtons() {
    if (!activeButton) return;
    activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
    activeButton = null;
  }

  function setActiveButton(id) {
    deactivateButtons();

    const button = buttonElements[id];
    if (!button) return;

    if (button && id !== 'trash') {
      button.classList.add(Constants.classes.ACTIVE_BUTTON);
      activeButton = button;
    }
  }

  function addButtons() {
    const controls = ctx.options.controls;
    const controlGroup = document.createElement('div');
    controlGroup.className = `${Constants.classes.CONTROL_GROUP} ${Constants.classes.CONTROL_BASE}`;

    if (!controls) return controlGroup;

    if (controls[Constants.types.LINE]) {
      buttonElements[Constants.types.LINE] = createControlButton(Constants.types.LINE, {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_LINE,
        title: `LineString tool ${ctx.options.keybindings ? '(l)' : ''}`,
        onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_LINE_STRING),
        onDeactivate: () => ctx.events.trash(),
      });
    }

    if (controls[Constants.types.POLYGON]) {
      buttonElements[Constants.types.POLYGON] = createControlButton(Constants.types.POLYGON, {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_POLYGON,
        title: `Polygon tool ${ctx.options.keybindings ? '(p)' : ''}`,
        onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POLYGON),
        onDeactivate: () => ctx.events.trash(),
      });
    }

    if (controls[Constants.types.POINT]) {
      buttonElements[Constants.types.POINT] = createControlButton(Constants.types.POINT, {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_POINT,
        title: `Marker tool ${ctx.options.keybindings ? '(m)' : ''}`,
        onActivate: () => ctx.events.changeMode(Constants.modes.DRAW_POINT),
        onDeactivate: () => ctx.events.trash(),
      });
    }

    if (controls.trash) {
      buttonElements.trash = createControlButton('trash', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_TRASH,
        title: 'Delete',
        onActivate: () => {
          ctx.events.trash();
        },
      });
    }

    if (controls.combine_features) {
      buttonElements.combine_features = createControlButton('combineFeatures', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_COMBINE_FEATURES,
        title: 'Combine',
        onActivate: () => {
          ctx.events.combineFeatures();
        },
      });
    }

    if (controls.uncombine_features) {
      buttonElements.uncombine_features = createControlButton('uncombineFeatures', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_UNCOMBINE_FEATURES,
        title: 'Uncombine',
        onActivate: () => {
          ctx.events.uncombineFeatures();
        },
      });
    }
    // extend start
    if (controls.undo) {
      buttonElements.undo = createControlButton('undo', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_UNDO,
        title: 'Undo',
        disabled: true,
        onClick: () => ctx.events.undo(),
      });
    }

    if (controls.redo) {
      buttonElements.redo = createControlButton('redo', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_REDO,
        title: 'Redo',
        disabled: true,
        onClick: () => ctx.events.redo(),
      });
    }

    if (controls.finish) {
      buttonElements.finish = createControlButton('finish', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_FINISH,
        title: 'Finsih',
        disabled: true,
        onClick: () => ctx.events.finish(),
      });
    }

    if (controls.cancel) {
      buttonElements.cancel = createControlButton('cancel', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_CANCEL,
        title: 'Cancel',
        disabled: true,
        onClick: () => ctx.events.cancel(),
      });
    }

    if (controls.draw_center) {
      buttonElements.draw_center = createControlButton('draw_center', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_DRAW_CENTER,
        title: 'Draw By Center',
        disabled: true,
        onClick: () => ctx.api.drawByCenter(),
      });
    }

    if (controls.cut_line) {
      buttonElements.cut_line = createControlButton('cut_line', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_CUT_LINE,
        title: 'cut line',
        disabled: true,
        onActivate: () => ctx.api.changeMode(Constants.modes.CUT_LINE),
        onDeactivate: () => ctx.events.trash(),
      });
    }

    if (controls.cut_polygon) {
      buttonElements.cut_polygon = createControlButton('cut_polygon', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_CUT_POLYGON,
        title: 'cut polygon',
        disabled: true,
        onDeactivate: () => ctx.events.trash(),
        onActivate: () => ctx.api.changeMode(Constants.modes.CUT_POLYGON),
      });
    }

    // extend end
    return controlGroup;
  }

  function removeButtons() {
    Object.keys(buttonElements).forEach((buttonId) => {
      const button = buttonElements[buttonId];
      if (button.parentNode) {
        button.parentNode.removeChild(button);
      }
      delete buttonElements[buttonId];
    });
  }

  // extend start
  function setDisableButtons(cb) {
    if (!buttonElements) return;
    const orginStatus = Object.entries(buttonElements).reduce((prev, [k, v]) => {
      prev[k] = { disabled: !!v.disabled };
      return prev;
    }, {});
    const status = cb(JSON.parse(JSON.stringify(orginStatus)));

    Object.entries(buttonElements).forEach(([buttonId, button]) => {
      const disabled = status[buttonId].disabled;
      if (typeof disabled === 'boolean' && disabled !== button.disabled) button.disabled = status[buttonId].disabled;
    });
  }
  // extend end
  return {
    setActiveButton,
    queueMapClasses,
    updateMapClasses,
    clearMapClasses,
    addButtons,
    removeButtons,
    setDisableButtons,
  };
}
