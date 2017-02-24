import { State } from './state'
import { ranks, files } from './util'

export default function(d: State): [HTMLElement, HTMLElement] {

  const wrap = document.createElement('div');
  const manipClass = d.viewOnly ? 'view-only' : 'manipulable';
  wrap.className = `cg-board-wrap orientation-${d.orientation} ${manipClass}`;

  const board = document.createElement('div');
  board.className = 'cg-board';
  wrap.appendChild(board);

  wrap.appendChild(renderAllCoords(d.orientation));

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

function renderAllCoords(orientation: Color): DocumentFragment {
  const all = document.createDocumentFragment();
  const orientClass = orientation === 'black' ? ' black' : '';
  all.appendChild(renderCoords(ranks, 'ranks' + orientClass));
  all.appendChild(renderCoords(files, 'files' + orientClass));
  return all;
}
