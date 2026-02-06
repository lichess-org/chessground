import { HeadlessState } from './state.js';
import { setVisible, createEl, opposite } from './util.js';
import { colors, files, ranks, Elements, Color } from './types.js';
import { createElement as createSVG, setAttributes, createDefs } from './svg.js';

export function renderWrap(element: HTMLElement, s: HeadlessState): Elements {
  // .cg-wrap (element passed to Chessground)
  //   cg-container
  //     cg-board
  //     svg.cg-shapes
  //       defs
  //       g
  //     svg.cg-custom-svgs
  //       g
  //     cg-auto-pieces
  //     coords.ranks
  //     coords.files
  //     piece.ghost

  element.innerHTML = '';

  // ensure the cg-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling chessground
  // for a slight performance improvement! (avoids recomputing style)
  element.classList.add('cg-wrap');

  for (const c of colors) element.classList.toggle('orientation-' + c, s.orientation === c);
  element.classList.toggle('manipulable', !s.viewOnly);

  const container = createEl('cg-container');
  element.appendChild(container);

  const board = createEl('cg-board');
  container.appendChild(board);

  let shapesBelow: SVGElement | undefined;
  let shapes: SVGElement | undefined;
  let customBelow: SVGElement | undefined;
  let custom: SVGElement | undefined;
  let autoPieces: HTMLElement | undefined;

  if (s.drawable.visible) {
    [shapesBelow, shapes] = ['cg-shapes-below', 'cg-shapes'].map(cls => svgContainer(cls, true));
    [customBelow, custom] = ['cg-custom-below', 'cg-custom-svgs'].map(cls => svgContainer(cls, false));

    autoPieces = createEl('cg-auto-pieces');

    container.appendChild(shapesBelow);
    container.appendChild(customBelow);
    container.appendChild(shapes);
    container.appendChild(custom);
    container.appendChild(autoPieces);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    const ranksPositionClass = s.ranksPosition === 'left' ? ' left' : '';

    if (s.coordinatesOnSquares) {
      const rankN: (i: number) => number = s.orientation === 'white' ? i => i + 1 : i => 8 - i;
      files.forEach((f, i) =>
        container.appendChild(
          renderCoords(
            ranks.map(r => f + r),
            'squares rank' + rankN(i) + orientClass + ranksPositionClass,
            i % 2 === 0 ? 'black' : 'white',
          ),
        ),
      );
    } else {
      container.appendChild(
        renderCoords(
          ranks,
          'ranks' + orientClass + ranksPositionClass,
          (s.ranksPosition === 'right') === (s.orientation === 'white') ? 'white' : 'black',
        ),
      );
      container.appendChild(renderCoords(files, 'files' + orientClass, opposite(s.orientation)));
    }
  }

  let ghost: HTMLElement | undefined;
  if (!s.viewOnly && s.draggable.enabled && s.draggable.showGhost) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return { board, container, wrap: element, ghost, shapes, shapesBelow, custom, customBelow, autoPieces };
}

function svgContainer(cls: string, isShapes: boolean) {
  const svg = setAttributes(createSVG('svg'), {
    class: cls,
    viewBox: isShapes ? '-4 -4 8 8' : '-3.5 -3.5 8 8',
    preserveAspectRatio: 'xMidYMid slice',
  });
  if (isShapes) svg.appendChild(createDefs());
  svg.appendChild(createSVG('g'));
  return svg;
}

function renderCoords(elems: readonly string[], className: string, firstColor: Color): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  elems.forEach((elem, i) => {
    const light = i % 2 === (firstColor === 'white' ? 0 : 1);
    f = createEl('coord', `coord-${light ? 'light' : 'dark'}`);
    f.textContent = elem;
    el.appendChild(f);
  });
  return el;
}
