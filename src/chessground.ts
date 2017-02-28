import { Api, makeApi } from './api'
import { Config, configure } from './config'
import { State, defaults } from './state'

import renderWrap from './wrap';
import bindEvents from './events'
import render from './render';
import svg from './svg';
import * as util from './util';

// const cg = Chessground.api(config);
// cg.attachTo(element);

export function ChessgroundApi(config?: Config): Api {

  const state = defaults() as State;

  configure(state, config || {});

  state.browser = {
    transform: util.transformFunction()
  };

  const api = makeApi(state, () => {});

  return api;
}

// export function Chessground(config?: Config): Api;
export function Chessground(element: HTMLElement, config?: Config): Api {

  return attachTo(ChessgroundApi(config), element);
};


function attachTo(bare: Api, root: HTMLElement): Api {
  function redrawAll() {
    const s = bare.state;
    if (s.dom && s.dom.elements.root !== root) throw "Chessground is already attached to another node!";
    const isFirstDraw = !s.dom;
    // first ensure the cg-board-wrap class is set
    // so bounds calculation can use the CSS width/height values
    // add that class yourself to the element before calling chessground
    // for a slight performance improvement! (avoids recomputing style)
    if (isFirstDraw) root.classList.add('cg-board-wrap');
    // compute bounds from existing board element if possible
    // this allows non-square boards from CSS to be handled (for 3D)
    const bounds = util.memo(() => {
      return (isFirstDraw ? root : s.dom.elements.board).getBoundingClientRect();
    });
    const elements = renderWrap(root, s, bounds());
    s.dom = {
      elements: elements,
      bounds: bounds,
      redraw(withSvg: boolean = true) {
        render(s);
        if (withSvg && elements.svg) svg(s, elements.svg);
      }
    };
    s.dom.redraw();
    bindEvents(s, isFirstDraw, redrawAll);
  }
  const api = makeApi(bare.state, redrawAll);
  api.redrawAll();
  return api;
}
