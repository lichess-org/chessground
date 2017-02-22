import { pos2key, ranks, invRanks } from './util'

export const initial: FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles: { [letter: string]: Role } = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };

const letters = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };

export function read(fen: FEN): Pieces {
  if (fen === 'start') fen = initial;
  let pieces: Pieces = {}, x: number, nb: number, role: Role;
  fen.replace(/ .+$/, '').replace(/~/g, '').split('/').forEach((row, y) => {
    x = 0;
    row.split('').forEach(function(v) {
      nb = parseInt(v);
      if (nb) x += nb;
      else {
        ++x;
        role = v.toLowerCase() as Role;
        pieces[pos2key([x, 8 - y])] = {
          role: roles[role],
          color: (v === role ? 'black' : 'white' as Color) as Color
        };
      }
    });
  });

  return pieces;
}

export function write(pieces: Pieces): FEN {
  let piece: Piece, letter: string;
  return [8, 7, 6, 5, 4, 3, 2].reduce(
    (str: string, nb: any) => str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), nb),
    invRanks.map(y => {
      return ranks.map(x => {
        piece = pieces[pos2key([x, y])];
        if (piece) {
          letter = letters[piece.role];
          return piece.color === 'white' ? letter.toUpperCase() : letter;
        } else return '1';
      }).join('');
    }).join('/'));
}
