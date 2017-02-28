import { Api, start } from './api'
import { Config, configure } from './config'
import { State, defaults } from './state'

import renderWrap from './wrap';
import bindEvents from './events'
import render from './render';
import svg from './svg';
import * as util from './util';

export function Chessground(element: HTMLElement, config?: Config): Api {

  const state = defaults() as State;

  configure(state, config || {});

  state.browser = {
    transform: util.transformFunction()
  };

  let firstDraw = true;
  function redrawAll() {
    // first ensure the cg-board-wrap class is set
    // so bounds calculation can use the CSS width/height values
    // add that class yourself to the element before calling chessground
    // for a slight performance improvement! (avoids recomputing style)
    element.classList.add('cg-board-wrap');
    // compute bounds from existing board element if possible
    // this allows non-square boards from CSS to be handled (for 3D)
    const bounds = util.memo(() => (state.dom ? state.dom.elements.board : element).getBoundingClientRect());
    const elements = renderWrap(element, state, bounds());
    state.dom = {
      elements: elements,
      bounds: bounds,
      redraw(withSvg: boolean = true) {
        render(state);
        if (withSvg && elements.svg) svg(state, elements.svg);
      }
    };
    state.dom.redraw();
    bindEvents(state, firstDraw, redrawAll);
    firstDraw = false;
  }
  redrawAll();

  const api = start(state, redrawAll);

  return api;
};
