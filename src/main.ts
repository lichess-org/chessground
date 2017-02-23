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

export default function Chessground(initialElement: HTMLElement, config: Config) {

  const data = defaults() as Data;

  data.dom = {
    element: initialElement,
    bounds: initialElement.getBoundingClientRect(),
    redraw() {}
  };

  configure(data, config);

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(api.data));
  }

  let api = makeApi(data);

  vnode = patch(initialElement, view(api.data));

  const element = vnode.elm as HTMLElement;

  data.dom = {
    element: element,
    bounds: element.getBoundingClientRect(),
    redraw: redraw
  };

  bindEvents(data);

  // function everyAF() {
  //   redraw();
  //   requestAnimationFrame(everyAF);
  // }
  // everyAF();

  return api;
};
