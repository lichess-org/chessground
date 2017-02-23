/// <reference path="dts/index.d.ts" />

import { init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'

import makeCtrl from './ctrl';
import view from './view';
import configure from './configure'
import defaults from './defaults'

import klass from 'snabbdom/modules/class';
import style from 'snabbdom/modules/style';
import attributes from 'snabbdom/modules/attributes';

const patch = init([klass, style, attributes]);

export default function Chessground(initialElement: HTMLElement, config: any) {

  const data = defaults() as Data;

  data.dom = {
    element: initialElement,
    bounds: initialElement.getBoundingClientRect(),
    redraw() {}
  };

  configure(data, config);

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  let ctrl = makeCtrl(data);

  vnode = patch(initialElement, view(ctrl));

  const element = vnode.elm as HTMLElement;

  data.dom = {
    element: element,
    bounds: element.getBoundingClientRect(),
    redraw: redraw
  };

  function recomputeBounds() {
    data.dom.bounds = element.getBoundingClientRect();
    redraw();
  }

  if (data.resizable) {
    document.body.addEventListener('chessground.resize', recomputeBounds, false);
    ['onscroll', 'onresize'].forEach(n => {
      const prev = window[n];
      window[n] = () => {
        prev && prev();
        recomputeBounds();
      };
    });
  }

  element.addEventListener('contextmenu', e => {
    if (data.disableContextMenu || data.drawable.enabled) {
      e.preventDefault();
      return false;
    }
    return true;
  });

  function everyAF() {
    redraw();
    requestAnimationFrame(everyAF);
  }
  everyAF();

  return ctrl;
};
