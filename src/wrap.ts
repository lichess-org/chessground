import { State } from './state'
import * as util from './util'

export default function(s: State, bounds: ClientRect): [HTMLElement, Elements] {

  const wrap = document.createElement('div');
  const manipClass = s.viewOnly ? 'view-only' : 'manipulable';
  wrap.className = `cg-board-wrap orientation-${s.orientation} ${manipClass}`;

  const board = document.createElement('div');
  board.className = 'cg-board';
  wrap.appendChild(board);

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    wrap.appendChild(renderCoords(util.ranks, 'ranks' + orientClass));
    wrap.appendChild(renderCoords(util.files, 'files' + orientClass));
  }

  let over: HTMLElement | undefined;
  if (s.movable.showDests || s.premovable.showDests) {
    over = renderAway(s.browser, bounds, 'div', 'over');
    wrap.appendChild(over);
  }

  let ghost: HTMLElement | undefined;
  if (s.draggable.showGhost) {
    ghost = renderAway(s.browser, bounds, 'piece', 'ghost');
    wrap.appendChild(ghost);
  }

  return [wrap, {
    board: board,
    over: over,
    ghost: ghost
  }];
}

function renderAway(browser: Browser, bounds: ClientRect, tagName: string, className: string): HTMLElement {
  const squareSize = bounds.width / 8;
  const el = document.createElement(tagName);
  el.className = className;
  el.style.width = squareSize + 'px';
  el.style.height = squareSize + 'px';
  el.style[browser.transformProp] = util.translateAway;
  return el;
}

function renderCoords(elems: any[], klass: string): HTMLElement {
  const el = document.createElement('coords');
  el.className = klass;
  let f: HTMLElement;
  for (let i in elems) {
    f = document.createElement('coord');
    f.textContent = elems[i];
    el.appendChild(f);
  }
  return el;
}
