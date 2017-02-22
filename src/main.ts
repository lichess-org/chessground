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

export default function Chessground(element: HTMLElement, config: any) {

  const dom: Dom = {
    element: element,
    bounds: element.getBoundingClientRect()
  };

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(ctrl, dom.bounds));
  }

  let data: Data = defaults();

  configure(data, config);

  let ctrl = makeCtrl(data, redraw, dom);

  vnode = patch(element, view(ctrl, dom.bounds));

  function recomputeBounds() {
    dom.bounds = element.getBoundingClientRect();
    redraw();
  }

  if (data.resizable) setTimeout(() => {
    document.body.addEventListener('chessground.resize', recomputeBounds, false);
    ['onscroll', 'onresize'].forEach(n => {
      const prev = window[n];
      window[n] = () => {
        prev && prev();
        recomputeBounds();
      };
    });
  }, 500);

  element.addEventListener('contextmenu', e => {
    if (data.disableContextMenu || data.drawable.enabled) {
      e.preventDefault();
      return false;
    }
    return true;
  });

  return ctrl;
};
