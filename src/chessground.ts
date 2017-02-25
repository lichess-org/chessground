/// <reference path="./dts/anim.d.ts" />
/// <reference path="./dts/chess.d.ts" />
/// <reference path="./dts/drawable.d.ts" />

import { Api, start } from './api'
import { Config, configure } from './config'
import { State, defaults } from './state'

import renderWrap from './wrap';
import bindEvents from './events'
import render from './render';

export function Chessground(container: HTMLElement, config?: Config): Api {

  const state = defaults() as State;

  configure(state, config || {});

  const [wrapEl, boardEl] = renderWrap(state);
  container.innerHTML = '';
  container.appendChild(wrapEl);

  state.dom = {
    element: boardEl,
    bounds: boardEl.getBoundingClientRect(),
    redraw() {
      render(state);
    }
  };

  render(state);

  const api = start(state);

  bindEvents(state);

  return api;
};
