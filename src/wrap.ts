import { State } from './state'
import { colors, setVisible, createEl } from './util'
import { files, ranks } from './types'
import { createElement as createSVG } from './svg'
import { Elements } from './types'

export default function wrap(element: HTMLElement, s: State, bounds?: ClientRect): Elements {

  element.innerHTML = '';

  element.classList.add('cg-board-wrap');
  colors.forEach(c => {
    element.classList.toggle('orientation-' + c, s.orientation === c);
  });
  element.classList.toggle('manipulable', !s.viewOnly);

  const board = createEl('div', 'cg-board');

  element.appendChild(board);

  let svg: SVGElement | undefined;
  if (s.drawable.visible && bounds) {
    svg = createSVG('svg');
    svg.appendChild(createSVG('defs'));
    element.appendChild(svg);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    element.appendChild(renderCoords(ranks, 'ranks' + orientClass));
    element.appendChild(renderCoords(files, 'files' + orientClass));
  }

  let ghost: HTMLElement | undefined;
  if (bounds && s.draggable.showGhost) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    element.appendChild(ghost);
  }

  return {
    board: board,
    ghost: ghost,
    svg: svg
  };
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
