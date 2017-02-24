import { h } from 'snabbdom';

export const defaults: Example = {
  name: 'Default configuration',
  run(el) {
    window.Chessground(el);
  }
};
export const fromFen: Example = {
  name: 'From FEN, from black POV',
  run(el) {
    window.Chessground(el, {
      fen:'2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -',
      orientation: 'black'
    });
  }
};
export const orientationToggle: Example = {
  name: 'Orientation toggle',
  run(el) {
    const cg = window.Chessground(el, {
      fen:'2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -',
      orientation: 'black'
    });
    const button = document.createElement('button');
    button.innerHTML = 'Toggle orientation';
    button.addEventListener('click', cg.toggleOrientation);
    el.parentNode.appendChild(button);
  }
};
