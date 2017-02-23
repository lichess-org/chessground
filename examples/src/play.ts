import { Chess } from 'chess.js';
import { toColor, toDests } from './util'

export const initial: Example = {
  name: 'Play legal moves from initial position',
  config: {
    movable: {
      color: 'white',
      free: false,
    }
  },
  run(cg) {
    const chess = new Chess();
    cg.set({
      movable: {
        dests: toDests(chess),
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
