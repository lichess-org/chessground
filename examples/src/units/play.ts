import { Chess } from 'chess.js';
import chessground from 'chessground/chessground';
import { Unit } from './unit';
import { toColor, toDests } from '../util'

export const initial: Unit = {
  name: 'Play legal moves from initial position',
  run(el) {
    const chess = new Chess();
    const cg = chessground(el, {
      movable: {
        color: 'white',
        free: false,
        dests: toDests(chess)
      }
    });
    cg.set({
      // draggable: {
      //   showGhost: false
      // },
      movable: {
        events: {
          after(orig, dest) {
            chess.move({from: orig, to: dest});
            cg.set({
              turnColor: toColor(chess),
              movable: {
                color: toColor(chess),
                dests: toDests(chess)
              }
            });
          }
        }
      }
    });
    return cg;
  }
};
