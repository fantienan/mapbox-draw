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

  const lineUnitTranform = {
    meters: '米',
    kilometers: '公里',
    miles: '英里',
    nauticalmiles: '海里',
    inches: '英寸',
    yards: '码',
    centimeters: '厘米',
    feet: '英尺',
  };
  let linePopover;

  function removeLinePopover() {
    if (linePopover) {
      linePopover.removeHandle();
      linePopover = null;
    }
  }

  const areaUnitTranform = {
    mu: '亩',
    hectares: '公顷',
    kilometers: '平方公里',
    meters: '平方米',
    centimetres: '平方厘米',
    millimeters: '平方毫米',
    acres: '英亩',
    miles: '平方英里',
    yards: '平方码',
    feet: '平方英尺',
    inches: '平方英寸',
  };

  let polygonPopover;

  function removePolygonPopover() {
    if (polygonPopover) {
      polygonPopover.removeHandle();
      polygonPopover = null;
    }
  }

  function listen() {
    removePolygonPopover();
    removeLinePopover();
    document.body.removeEventListener('click', listen);
  }

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
        if (id !== 'cut_line' && id !== 'cut_polygon') {
          removeLinePopover();
          removePolygonPopover();
        }

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
        if (options.popover) {
          options.popover({ button }).then((res) => {
            setActiveButton(id);
            options.onActivate(res);
          });
        } else {
          setActiveButton(id);
          options.onActivate();
        }
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
        popover: ({ button }) => {
          return new Promise((resolve) => {
            if (linePopover) {
              removeLinePopover();
              resolve();
              return;
            }
            removePolygonPopover();
            const popover = document.createElement('div');
            const title = document.createTextNode('line width:');
            const title1 = document.createTextNode('unit:');
            const input = document.createElement('input');
            const okBtn = document.createElement('button');
            const cancelBtn = document.createElement('button');
            const select = document.createElement('select');
            select.innerHTML = Object.keys(lineUnitTranform).reduce((prev, k) => {
              prev += `<option value="${k}">${lineUnitTranform[k]}</option>`;
              return prev;
            }, '');
            okBtn.addEventListener('click', () => {
              resolve({ lineWidth: +(input.value || 0), lineWidthUnit: select.value });
              removeLinePopover();
            });
            cancelBtn.addEventListener('click', () => {
              resolve();
              removeLinePopover();
            });
            okBtn.textContent = 'ok';
            cancelBtn.textContent = 'cancel';
            input.value = '1';
            input.type = 'number';
            input.min = 0;
            select.value = 'meters';
            popover.className = Constants.classes.CONTROL_POPOVER;
            popover.style.top = `${11 * 29}px`;
            popover.style.left = '-308px';
            popover.appendChild(title);
            popover.appendChild(input);
            popover.appendChild(title1);
            popover.appendChild(select);
            popover.appendChild(okBtn);
            popover.appendChild(cancelBtn);
            popover.addEventListener('click', (e) => e.stopPropagation());
            popover.removeHandle = () => {
              title.remove();
              title1.remove();
              input.remove();
              okBtn.remove();
              cancelBtn.remove();
              select.remove();
              popover.remove();
            };
            linePopover = popover;
            button.parentNode.appendChild(popover);
            document.body.addEventListener('click', listen);
          });
        },
        onActivate: (opts) => ctx.api.changeMode(Constants.modes.CUT_LINE, opts),
        onDeactivate: () => ctx.events.trash(),
      });
    }

    if (controls.cut_polygon) {
      buttonElements.cut_polygon = createControlButton('cut_polygon', {
        container: controlGroup,
        className: Constants.classes.CONTROL_BUTTON_CUT_POLYGON,
        title: 'cut polygon',
        disabled: true,
        popover: ({ button }) => {
          return new Promise((resolve) => {
            if (polygonPopover) {
              removePolygonPopover();
              resolve();
              return;
            }
            removeLinePopover();
            const popover = document.createElement('div');
            const title = document.createTextNode('buffer width:');
            const title1 = document.createTextNode('unit:');
            const input = document.createElement('input');
            const okBtn = document.createElement('button');
            const cancelBtn = document.createElement('button');
            const select = document.createElement('select');
            select.innerHTML = Object.keys(areaUnitTranform).reduce((prev, k) => {
              prev += `<option value="${k}">${areaUnitTranform[k]}</option>`;
              return prev;
            }, '');
            okBtn.addEventListener('click', () => {
              let res;
              if (select.value === 'mu') {
                res = { bufferWidthUnit: 'meters', bufferWidth: (input.value || 0) * 666.666666667 };
              } else {
                res = { bufferWidth: +(input.value || 0), bufferWidthUnit: select.value };
              }
              resolve(res);
              removePolygonPopover();
            });
            cancelBtn.addEventListener('click', () => {
              resolve();
              removePolygonPopover();
            });

            okBtn.textContent = 'ok';
            cancelBtn.textContent = 'cancel';
            input.value = '1';
            input.type = 'number';
            input.min = 0;
            select.value = 'meters';
            popover.className = Constants.classes.CONTROL_POPOVER;
            popover.style.top = `${12 * 29}px`;
            popover.style.left = '-347px';

            popover.appendChild(title);
            popover.appendChild(input);
            popover.appendChild(title1);
            popover.appendChild(select);
            popover.appendChild(okBtn);
            popover.appendChild(cancelBtn);
            popover.addEventListener('click', (e) => e.stopPropagation());
            popover.removeHandle = () => {
              title.remove();
              title1.remove();
              input.remove();
              okBtn.remove();
              cancelBtn.remove();
              select.remove();
              popover.remove();
            };

            polygonPopover = popover;
            button.parentNode.appendChild(popover);
            document.body.addEventListener('click', listen);
          });
        },
        onDeactivate: () => ctx.events.trash(),
        onActivate: (opts) => ctx.api.changeMode(Constants.modes.CUT_POLYGON, opts),
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
