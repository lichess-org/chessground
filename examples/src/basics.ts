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
