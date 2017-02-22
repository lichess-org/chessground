/// <reference path="dts/index.d.ts" />

import { init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'

// import makeCtrl from './ctrl';
// import view from './view';
import configure from './configure'
import defaults from './defaults'

import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';

const patch = init([klass, attributes]);

export default function Chessground(element: Element, config: any) {

  let vnode: VNode;
  let ctrl: any
  let makeCtrl: any
  let view: any

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  let data: Data = defaults();
  configure(data, config);

  ctrl = makeCtrl(data, redraw);

  vnode = patch(element, view(ctrl));

  return ctrl;
};
