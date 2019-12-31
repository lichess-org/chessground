import * as util from './util'
import * as cg from './types'

type Mobility = (x1:number, y1:number, x2:number, y2:number) => boolean;

function diff(a: number, b:number):number {
  return Math.abs(a - b);
}

function pawn(color: cg.Color): Mobility {
  return (x1, y1, x2, y2) => diff(x1, x2) < 2 && (
    color === 'white' ? (
      // allow 2 squares from 1 and 8, for horde
      y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)
    ) : (
      y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2)
    )
  );
}

const knight: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
}

const bishop: Mobility = (x1, y1, x2, y2) => {
  return diff(x1, x2) === diff(y1, y2);
}

const rook: Mobility = (x1, y1, x2, y2) => {
  return x1 === x2 || y1 === y2;
}

const queen: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
}

function king(color: cg.Color, rookFiles: number[], canCastle: boolean): Mobility {
  return (x1, y1, x2, y2)  => (
    diff(x1, x2) < 2 && diff(y1, y2) < 2
  ) || (
    canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && (
      (x1 === 5 && ((util.containsX(rookFiles, 1) && x2 === 3) || (util.containsX(rookFiles, 8) && x2 === 7))) ||
      util.containsX(rookFiles, x2)
    )
  );
}

function rookFilesOf(pieces: cg.Pieces, color: cg.Color) {
  const backrank = color == 'white' ? '1' : '8';
  return Object.keys(pieces).filter(key => {
    const piece = pieces[key];
    return key[1] === backrank && piece && piece.color === color && piece.role === 'rook';
  }).map((key: string ) => util.key2pos(key as cg.Key)[0]);
}

const allPos = util.allKeys.map(util.key2pos);

export default function premove(pieces: cg.Pieces, key: cg.Key, canCastle: boolean): cg.Key[] {
  const piece = pieces[key]!,
    pos = util.key2pos(key),
    r = piece.role,
    mobility: Mobility = r === 'pawn' ? pawn(piece.color) : (
      r === 'knight' ? knight : (
        r === 'bishop' ? bishop : (
          r === 'rook' ? rook : (
            r === 'queen' ? queen : king(piece.color, rookFilesOf(pieces, piece.color), canCastle)
          ))));
  return allPos.filter(pos2 =>
    (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1])
  ).map(util.pos2key);
};
