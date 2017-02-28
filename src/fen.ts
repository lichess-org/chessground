import { pos2key, invRanks } from './util'
import * as cg from './types'

export const initial: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles: { [letter: string]: cg.Role } = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };

const letters = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };

const flagsRegex = / .+$/;
const zhRegex = /~/g;

export function read(fen: cg.FEN): cg.Pieces {
  if (fen === 'start') fen = initial;
  let pieces: cg.Pieces = {}, x: number, nb: number, role: cg.Role;
  fen.replace(flagsRegex, '').replace(zhRegex, '').split('/').forEach((row, y) => {
    if (y > 7) return;
    x = 0;
    row.split('').forEach(v => {
      nb = parseInt(v);
      if (nb) x += nb;
      else {
        ++x;
        role = v.toLowerCase() as cg.Role;
        pieces[pos2key([x, 8 - y])] = {
          role: roles[role],
          color: (v === role ? 'black' : 'white') as cg.Color
        };
      }
    });
  });

  return pieces;
}

export function write(pieces: cg.Pieces): cg.FEN {
  let piece: cg.Piece, letter: string;
  return [8, 7, 6, 5, 4, 3, 2].reduce(
    (str: string, nb: any) => str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), nb),
    invRanks.map(y => {
      return cg.ranks.map(x => {
        piece = pieces[pos2key([x, y])];
        if (piece) {
          letter = letters[piece.role];
          return piece.color === 'white' ? letter.toUpperCase() : letter;
        } else return '1';
      }).join('');
    }).join('/'));
}
