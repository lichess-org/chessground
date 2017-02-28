import { State } from './state'
import { colors, translateAway, createEl } from './util'
import { files, ranks } from './types'
import { createElement as createSVG } from './svg'
import { Elements, Browser } from './types'

export default function wrap(root: HTMLElement, s: State, bounds: ClientRect): Elements {

  root.innerHTML = '';

  root.classList.add('cg-board-wrap');
  colors.forEach(c => {
    root.classList.toggle('orientation-' + c, s.orientation === c);
  });
  root.classList.toggle('manipulable', !s.viewOnly);

  const board = createEl('div', 'cg-board');

  root.appendChild(board);

  let svg: SVGElement | undefined;
  if (s.drawable.enabled) {
    svg = createSVG('svg');
    svg.appendChild(createSVG('defs'));
    root.appendChild(svg);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    root.appendChild(renderCoords(ranks, 'ranks' + orientClass));
    root.appendChild(renderCoords(files, 'files' + orientClass));
  }

  let over: HTMLElement | undefined;
  if (!s.viewOnly && (s.movable.showDests || s.premovable.showDests)) {
    over = renderAway(s.browser, bounds, 'div', 'over');
    root.appendChild(over);
  }

  let ghost: HTMLElement | undefined;
  if (!s.viewOnly && s.draggable.showGhost) {
    ghost = renderAway(s.browser, bounds, 'piece', 'ghost');
    root.appendChild(ghost);
  }

  return {
    root: root,
    board: board,
    over: over,
    ghost: ghost,
    svg: svg
  };
}

function renderAway(browser: Browser, bounds: ClientRect, tagName: string, className: string): HTMLElement {
  const squareSize = bounds.width / 8;
  const el = createEl(tagName, className);
  el.style.width = squareSize + 'px';
  el.style.height = squareSize + 'px';
  browser.transform(el, translateAway);
  return el;
}

function renderCoords(elems: any[], className: string): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  for (let i in elems) {
    f = createEl('coord');
    f.textContent = elems[i];
    el.appendChild(f);
  }
  return el;
}
