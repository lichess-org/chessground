import { State } from './state'
import { translateAway } from './util'
import { files, ranks } from './types'
import { createElement as createSVG } from './svg'
import { Elements, Browser } from './types'

export default function(s: State, bounds: ClientRect): [HTMLElement, Elements] {

  const wrap = document.createElement('div');
  const manipClass = s.viewOnly ? 'view-only' : 'manipulable';
  wrap.className = `cg-board-wrap orientation-${s.orientation} ${manipClass}`;

  const board = document.createElement('div');
  board.className = 'cg-board';
  wrap.appendChild(board);

  let svg: SVGElement | undefined;
  if (s.drawable.enabled) {
    svg = createSVG('svg');
    svg.appendChild(createSVG('defs'));
    wrap.appendChild(svg);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    wrap.appendChild(renderCoords(ranks, 'ranks' + orientClass));
    wrap.appendChild(renderCoords(files, 'files' + orientClass));
  }

  let over: HTMLElement | undefined;
  if (!s.viewOnly && (s.movable.showDests || s.premovable.showDests)) {
    over = renderAway(s.browser, bounds, 'div', 'over');
    wrap.appendChild(over);
  }

  let ghost: HTMLElement | undefined;
  if (!s.viewOnly && s.draggable.showGhost) {
    ghost = renderAway(s.browser, bounds, 'piece', 'ghost');
    wrap.appendChild(ghost);
  }

  return [wrap, {
    board: board,
    over: over,
    ghost: ghost,
    svg: svg
  }];
}

function renderAway(browser: Browser, bounds: ClientRect, tagName: string, className: string): HTMLElement {
  const squareSize = bounds.width / 8;
  const el = document.createElement(tagName);
  el.className = className;
  el.style.width = squareSize + 'px';
  el.style.height = squareSize + 'px';
  browser.transform(el, translateAway);
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
