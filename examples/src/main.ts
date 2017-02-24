/// <reference path="./index.d.ts" />

import { h, init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import listeners from 'snabbdom/modules/eventlisteners';
import * as page from 'page'

import * as basics from './basics'
import * as play from './play'
import * as perf from './perf'

const patch = init([klass, attributes, listeners]);

export function run(element: Element) {

  const examples: Example[] = [
    basics.defaults, basics.fromFen,
    play.initial,
    perf.move, perf.select
  ];

  let example: Example, cg: Api, vnode: VNode;

  function redraw() {
    vnode = patch(vnode || element, render());
  }

  function runExample(vnode: VNode) {
    const el = vnode.elm as HTMLElement;
    el.innerHTML = '';
    cg = example.run(el);
  }

  function render() {
    return h('div#chessground-examples', [
      h('menu', examples.map((ex, id) => {
        return h('a', {
          class: {
            active: example.name === ex.name
          },
          on: { click: () => page(`/${id}`) }
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
      ]),
      h('control', [
        h('button', { on: { click() { cg.toggleOrientation(); }}}, 'Toggle orientation')
      ])
    ]);
  }

  page({ click: false, popstate: false, dispatch: false, hashbang: true });
  page('/:id', ctx => {
    example = examples[parseInt(ctx.params.id) || 0];
    redraw();
  });
  page(location.hash.slice(2) || '/0');
}
