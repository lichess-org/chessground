/// <reference path="./index.d.ts" />

import { h, init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import listeners from 'snabbdom/modules/eventlisteners';

import * as basics from './basics'
import * as play from './play'

const patch = init([klass, attributes, listeners]);

export function run(element: Element) {

  const examples: Example[] = [
    basics.defaults, basics.fromFen,
    play.initial
  ];

  let example: Example = examples[2],
  vnode: VNode;

  function redraw() {
    vnode = patch(vnode, render());
  }

  vnode = patch(element, render());

  function setExample(ex: Example) {
    example = ex;
    redraw();
  }

  function runExample(vnode: VNode) {
    const el = vnode.elm as HTMLElement;
    el.innerHTML = '';
    const cg = window.Chessground(el, example.config);
    console.log(example.config, cg.getFen());
    if (example.run) example.run(cg);
  }

  function render() {
    return h('div#chessground-examples', [
      h('menu', examples.map(ex => {
        return h('a', {
          class: {
            active: example.name === ex.name
          },
          on: { click: [setExample, ex] }
        }, ex.name);
      })),
      h('section', [
        h('div.chessground.wood.small.merida.coordinates', {
          hook: {
            insert: runExample,
            postpatch: runExample
          }
        }),
        h('p', example.name)
      ])
    ]);
  }
}
