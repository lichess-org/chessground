import { pos2key, invRanks } from './util'
import * as cg from './types'

export const initial: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles: { [letter: string]: cg.Role } = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };

const letters = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };

export function read(fen: cg.FEN): cg.Pieces {
  if (fen === 'start') fen = initial;
  const pieces: cg.Pieces = {};
  let row: number = 8, col: number = 0;
  for (const c of fen) {
    switch (c) {
      case ' ': return pieces;
      case '/':
        --row;
        if (row === 0) return pieces;
        col = 0;
        break;
      case '~':
        const piece = pieces[pos2key([col, row])];
        if (piece) piece.promoted = true;
        break;
      default:
        const nb = c.charCodeAt(0);
        if (nb < 57) col += nb - 48;
        else {
          ++col;
          const role = c.toLowerCase();
          pieces[pos2key([col, row])] = {
            role: roles[role],
            color: (c === role ? 'black' : 'white') as cg.Color
          };
        }
    }
  }
  return pieces;
}

export function write(pieces: cg.Pieces): cg.FEN {
  return invRanks.map(y => cg.ranks.map(x => {
      const piece = pieces[pos2key([x, y])];
      if (piece) {
        const letter = letters[piece.role];
        return piece.color === 'white' ? letter.toUpperCase() : letter;
      } else return '1';
    }).join('')
  ).join('/').replace(/1{2,}/g, s => s.length.toString());
}
