import { State } from './state'
import * as util from './util'

export default function(s: State, bounds: ClientRect): [HTMLElement, HTMLElement, HTMLElement] {

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

  const over = renderOverEl(s.browser, bounds);
  wrap.appendChild(over);

  return [wrap, board, over];
}

function renderOverEl(browser: Browser, bounds: ClientRect): HTMLElement {
  const squareSize = bounds.width / 8;
  const over = document.createElement('div');
  over.className = 'over';
  over.style.width = squareSize + 'px';
  over.style.height = squareSize + 'px';
  over.style[browser.transformProp] = util.translateAway;
  return over;
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
