import { pos2key, invRanks } from './util.js';
import * as cg from './types.js';

export const initial: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles: { [letter: string]: cg.Role } = {
  p: 'pawn',
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
};

const letters = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k',
};

export function read(fen: cg.FEN): cg.Pieces {
  if (fen === 'start') fen = initial;
  const pieces: cg.Pieces = new Map();
  let row = 7,
    col = 0;
  for (const c of fen) {
    switch (c) {
      case ' ':
      case '[':
        return pieces;
      case '/':
        --row;
        if (row < 0) return pieces;
        col = 0;
        break;
      case '~': {
        const piece = pieces.get(pos2key([col - 1, row]));
        if (piece) piece.promoted = true;
        break;
      }
      default: {
        const nb = c.charCodeAt(0);
        if (nb < 57) col += nb - 48;
        else {
          const role = c.toLowerCase();
          pieces.set(pos2key([col, row]), {
            role: roles[role],
            color: c === role ? 'black' : 'white',
          });
          ++col;
        }
      }
    }
  }
  return pieces;
}

export function write(pieces: cg.Pieces): cg.FEN {
  return invRanks
    .map(y =>
      cg.files
        .map(x => {
          const piece = pieces.get((x + y) as cg.Key);
          if (piece) {
            let p = letters[piece.role];
            if (piece.color === 'white') p = p.toUpperCase();
            if (piece.promoted) p += '~';
            return p;
          } else return '1';
        })
        .join('')
    )
    .join('/')
    .replace(/1{2,}/g, s => s.length.toString());
}
