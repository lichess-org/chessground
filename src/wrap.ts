import { HeadlessState } from './state.js';
import { setVisible, createEl } from './util.js';
import { colors, files, ranks, Elements, cases } from './types.js';
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

  let svg: SVGElement | undefined;
  let customSvg: SVGElement | undefined;
  let autoPieces: HTMLElement | undefined;

  if (s.drawable.visible) {
    svg = setAttributes(createSVG('svg'), {
      class: 'cg-shapes',
      viewBox: '-4 -4 8 8',
      preserveAspectRatio: 'xMidYMid slice',
    });
    svg.appendChild(createDefs());
    svg.appendChild(createSVG('g'));

    customSvg = setAttributes(createSVG('svg'), {
      class: 'cg-custom-svgs',
      viewBox: '-3.5 -3.5 8 8',
      preserveAspectRatio: 'xMidYMid slice',
    });
    customSvg.appendChild(createSVG('g'));

    autoPieces = createEl('cg-auto-pieces');

    container.appendChild(svg);
    container.appendChild(customSvg);
    container.appendChild(autoPieces);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : ' white';
    // TODO: validate the change from: const ranksPositionClass = s.ranksPosition === 'left' ? ' left' : '';
    const ranksPositionClass = s.ranksPosition === 'left' ? ' left' : s.ranksPosition === 'on-square' ? ' on-square' : '';


    // console.log('➡️ ranks', ranks)
    // console.log('⬆️ files', files)
    if (ranksPositionClass === ' on-square') {
      // container.appendChild(renderCoords(ranks, 'ranks' + orientClass + ranksPositionClass));
      // container.appendChild(renderCoords(files, 'files' + orientClass ));

      // const reversedFiles = [...files];
      // console.log(orientClass)
      // if (orientClass !== '') {
      //   reversedFiles.reverse();
      // }
      // console.log(files, reversedFiles)
    // ranks.forEach((rank) => {
    //   // console.log('rank', rank)
    //   const currentFile = files[parseInt(rank)-1];
    //   console.log(rank, currentFile)
    //     const cases: string[] = [];
    //   ranks.forEach((rank) => {
    //     cases.push(currentFile + rank);
    //   })
    //   container.appendChild(renderCoords(cases, 'ranks file-'+ currentFile + orientClass + ranksPositionClass));
    // })
    // files.forEach((file) => {
    //   // console.log('rank', rank)
    //   const currentFile = file;
    //   console.log(currentFile)
    //     const thecases: string[] = [];
    //   // ranks.forEach((rank) => {
    //   //   cases.push(currentFile + rank);
    //   // })
    //   cases[file].forEach(thecase => {
    //     thecases.push(thecase);
    //   })
    //   console.log('the classssss', 'ranks file-'+ currentFile + orientClass + ranksPositionClass);
    //
    //   // container.appendChild(renderCoords(files, 'files file-'+ currentFile + orientClass + ranksPositionClass));
    // })


      // Object.keys(cases).forEach(((fileId: string) => {
      //   // console.log(cases);
      //   // console.log(fileId);
      //   console.log('s.orientation', s.orientation)
      //   const file = cases[fileId];
      //   console.log('render file:', file, 'squares  file-'+ fileId + orientClass + ranksPositionClass)
      //   container.appendChild(renderCoords(s.orientation === 'black' ? file : file.reverse(), 'squares  file-'+ fileId + orientClass + ranksPositionClass));
      //   container.appendChild(renderCoords(ranks, 'squares  file-'+ fileId + orientClass + ranksPositionClass));
      // }))

      console.log(orientClass, ranksPositionClass)
      container.appendChild(renderCoords(cases.a, 'files on-square rank1' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.b, 'files on-square rank2' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.c, 'files on-square rank3' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.d, 'files on-square rank4' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.e, 'files on-square rank5' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.f, 'files on-square rank6' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.g, 'files on-square rank7' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(cases.h, 'files on-square rank8' + orientClass + ranksPositionClass));

    } else {
      container.appendChild(renderCoords(ranks, 'ranks' + orientClass + ranksPositionClass));
      container.appendChild(renderCoords(files, 'files' + orientClass ));
    }
  }

  let ghost: HTMLElement | undefined;
  if (s.draggable.enabled && s.draggable.showGhost) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return {
    board,
    container,
    wrap: element,
    ghost,
    svg,
    customSvg,
    autoPieces,
  };
}

function renderCoords(elems: readonly string[], className: string): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  for (const elem of elems) {
    // console.log('elem', elem)
    f = createEl('coord');
    f.textContent = elem;
    // console.log(f)
    el.appendChild(f);
  }
  return el;
}
// function renderCoordsOnSquare(elems: readonly string[], className: string): HTMLElement {
//   const el = createEl('coords', className);
//   let f: HTMLElement;
//   for (const elem of elems) {
//     console.log('elem', elem)
//     f = createEl('coord');
//     f.textContent = elem;
//     console.log(f)
//     el.appendChild(f);
//   }
//   return el;
// }
