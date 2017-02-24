/// <reference path="./dts/index.d.ts" />

import { init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'

import makeApi from './api';
import view from './view';
import configure from './configure'
import defaults from './defaults'
import bindEvents from './events'

import klass from 'snabbdom/modules/class';
import attrs from 'snabbdom/modules/attributes';
import style from 'snabbdom/modules/style';

const patch = init([klass, attrs, style]);

export default function Chessground(container: HTMLElement, config?: Config): Api {

  const placeholder: HTMLElement = document.createElement('div');
  container.appendChild(placeholder);

  const state = defaults() as State;

  configure(state, config || {});

  state.dom = {
    element: placeholder,
    bounds: container.getBoundingClientRect(),
    redraw() {}
  };

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(api.state));
  }

  let api = makeApi(state);

  vnode = patch(placeholder, view(api.state));

  state.dom.element = vnode.elm as HTMLElement;
  state.dom.redraw = redraw;

  bindEvents(state);

  return api;
};
