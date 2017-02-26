import { Api, start } from './api'
import { Config, configure } from './config'
import { State, defaults } from './state'

import renderWrap from './wrap';
import bindEvents from './events'
import render from './render';
import svg from './svg';
import * as util from './util';

export function Chessground(container: HTMLElement, config?: Config): Api {

  const state = defaults() as State;

  configure(state, config || {});

  state.browser = {
    transform: util.transformFunction()
  };

  function redrawAll() {
    // compute bounds from existing board element if possible
    // this allows non-square boards from CSS to be handled (for 3D)
    const bounds = (state.dom ? state.dom.elements.board : container).getBoundingClientRect();
    const [wrapEl, elements] = renderWrap(state, bounds);
    container.innerHTML = '';
    container.appendChild(wrapEl);
    state.dom = {
      elements: elements,
      bounds: bounds,
      redraw(withSvg: boolean = true) {
        render(state);
        if (withSvg && elements.svg) svg(state, elements.svg);
      }
    };
    state.dom.redraw();
    bindEvents(state);
  }
  redrawAll();

  const api = start(state, redrawAll);

  return api;
};
