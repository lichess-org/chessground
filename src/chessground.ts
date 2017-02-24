/// <reference path="./dts/anim.d.ts" />
/// <reference path="./dts/chess.d.ts" />
/// <reference path="./dts/drawable.d.ts" />

import { init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'
import { Api, start } from './api'
import { Config, configure } from './config'
import { State, defaults } from './state'

import view from './view';
import bindEvents from './events'
import makeCoords from './coords'

import klass from 'snabbdom/modules/class';
import attrs from 'snabbdom/modules/attributes';
import style from 'snabbdom/modules/style';

const patch = init([klass, attrs, style]);

export function Chessground(container: HTMLElement, config?: Config): Api {

  const placeholder: HTMLElement = document.createElement('div');
  container.appendChild(placeholder);

  const state = defaults() as State;

  configure(state, config || {});

  state.dom = {
    element: placeholder,
    bounds: container.getBoundingClientRect(),
    redraw() {}
  };

  const updateCoords = makeCoords(state);

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(api.state));
    updateCoords();
  }

  const api = start(state);

  vnode = patch(placeholder, view(api.state));

  state.dom.element = vnode.elm as HTMLElement;
  state.dom.redraw = redraw;

  bindEvents(state);

  return api;
};
