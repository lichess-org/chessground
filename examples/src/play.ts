import { Chess } from 'chess.js';
import { toColor, toDests } from './util'

export const initial: Example = {
  name: 'Play legal moves from initial position',
  run(el) {
    const chess = new Chess();
    const cg = window.Chessground(el, {
      movable: {
        color: 'white',
        free: false,
        dests: toDests(chess)
      }
    });
    cg.set({
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
  }
};
