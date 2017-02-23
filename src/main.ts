/// <reference path="./dts/index.d.ts" />

import { init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'

import makeApi from './api';
import view from './view';
import configure from './configure'
import defaults from './defaults'
import bindEvents from './events'

import klass from 'snabbdom/modules/class';
import style from 'snabbdom/modules/style';

const patch = init([klass, style]);

export default function Chessground(container: HTMLElement, config?: Config): Constructor {

  const placeholder: HTMLElement = document.createElement('div');
  container.appendChild(placeholder);

  const data = defaults() as Data;

  configure(data, config || {});

  data.dom = {
    element: placeholder,
    bounds: container.getBoundingClientRect(),
    redraw() {}
  };

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(api.data));
  }

  let api = makeApi(data);

  vnode = patch(placeholder, view(api.data));

  data.dom.element = vnode.elm as HTMLElement;
  data.dom.redraw = redraw;

  bindEvents(data);

  return api;
};
