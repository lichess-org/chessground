import { h, init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import { Api } from 'chessground/api';
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import listeners from 'snabbdom/modules/eventlisteners';
import * as page from 'page'
import { Unit, list } from './units/unit'

export function run(element: Element) {

  const patch = init([klass, attributes, listeners]);

  let unit: Unit, cg: Api, vnode: VNode;

  function redraw() {
    vnode = patch(vnode || element, render());
  }

  function runUnit(vnode: VNode) {
    const el = vnode.elm as HTMLElement;
    el.innerHTML = '';
    cg = unit.run(el);
  }

  function render() {
    return h('div#chessground-examples', [
      h('menu', list.map((ex, id) => {
        return h('a', {
          class: {
            active: unit.name === ex.name
          },
          on: { click: () => page(`/${id}`) }
        }, ex.name);
      })),
      h('section', [
        h('div.chessground.wood.small.merida.coordinates', {
          hook: {
            insert: runUnit,
            postpatch: runUnit
          }
        }),
        h('p', unit.name)
      ]),
      h('control', [
        h('button', { on: { click() { cg.toggleOrientation(); }}}, 'Toggle orientation')
      ])
    ]);
  }

  page({ click: false, popstate: false, dispatch: false, hashbang: true });
  page('/:id', ctx => {
    unit = list[parseInt(ctx.params.id) || 0];
    redraw();
  });
  page(location.hash.slice(2) || '/0');
}
