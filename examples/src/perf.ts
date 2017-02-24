export const move: Example = {
  name: 'Perf: piece move',
  run(cont) {
    const cg = window.Chessground(cont);
    const el = cont.querySelector('.cg-board') as HTMLElement;
    const delay = 500;
    function move() {
      if (!el.offsetParent) return;
      console.log('move');
      cg.move('e2', 'd4');
      setTimeout(() => {
        cg.move('d4', 'e2');
        setTimeout(move, delay);
      }, delay);
    }
    setTimeout(move, delay);
  }
};
