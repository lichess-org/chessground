import { Unit } from './unit';
import Chessground  from 'chessground';

export const move: Unit = {
  name: 'Perf: piece move',
  run(cont) {
    const cg = Chessground(cont, {
      animation: { duration: 500 }
    });
    const el = cont.querySelector('.cg-board') as HTMLElement;
    const delay = 400;
    function run() {
      if (!el.offsetParent) return;
      cg.move('e2', 'd4');
      setTimeout(() => {
        cg.move('d4', 'e2');
        setTimeout(run, delay);
      }, delay);
    }
    setTimeout(run, delay);
    return cg;
  }
};
export const select: Unit = {
  name: 'Perf: square select',
  run(cont) {
    const cg = Chessground(cont, {
      movable: {
        free: false,
        dests: {
          e2: ['e3', 'e4', 'd3', 'f3']
        }
      }
    });
    const el = cont.querySelector('.cg-board') as HTMLElement;
    const delay = 500;
    function run() {
      if (!el.offsetParent) return;
      cg.selectSquare('e2');
      setTimeout(() => {
        cg.selectSquare('d4');
        setTimeout(run, delay);
      }, delay);
    }
    setTimeout(run, delay);
    return cg;
  }
};
