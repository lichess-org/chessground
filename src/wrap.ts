import { State } from './state'
import { ranks, files } from './util'

export default function(s: State): [HTMLElement, HTMLElement] {

  const wrap = document.createElement('div');
  const manipClass = s.viewOnly ? 'view-only' : 'manipulable';
  wrap.className = `cg-board-wrap orientation-${s.orientation} ${manipClass}`;

  const board = document.createElement('div');
  board.className = 'cg-board';
  wrap.appendChild(board);

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    wrap.appendChild(renderCoords(ranks, 'ranks' + orientClass));
    wrap.appendChild(renderCoords(files, 'files' + orientClass));
  }

  return [wrap, board];
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
