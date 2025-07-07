import * as util from './util.js';
import * as cg from './types.js';

type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean;

const diff = (a: number, b: number): number => Math.abs(a - b);

const friendlyPieceBetween = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pieces: cg.Pieces,
  color: cg.Color,
): boolean => util.coordsBetween(x1, y1, x2, y2).some(sq => pieces.get(util.pos2key(sq))?.color === color);

const pawn =
  (pieces: cg.Pieces, color: cg.Color, useFriendliesToTrimPremoves: boolean): Mobility =>
  (x1, y1, x2, y2) => {
    const step = color === 'white' ? 1 : -1;
    if (diff(x1, x2) === 1) return y2 === y1 + step;
    return (
      x1 === x2 &&
      (y2 === y1 + step ||
        // allow 2 squares from first two ranks, for horde
        (y2 === y1 + 2 * step && (color === 'white' ? y1 <= 1 : y1 >= 6))) &&
      (!useFriendliesToTrimPremoves || !friendlyPieceBetween(x1, y1, x2, y2 + step, pieces, color))
    );
  };

export const knight: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};

const bishop =
  (pieces: cg.Pieces, color: cg.Color, useFriendliesToTrimPremoves: boolean): Mobility =>
  (x1, y1, x2, y2) =>
    diff(x1, x2) === diff(y1, y2) &&
    (!useFriendliesToTrimPremoves || !friendlyPieceBetween(x1, y1, x2, y2, pieces, color));

const rook =
  (pieces: cg.Pieces, color: cg.Color, useFriendliesToTrimPremoves: boolean): Mobility =>
  (x1, y1, x2, y2) =>
    (x1 === x2 || y1 === y2) &&
    (!useFriendliesToTrimPremoves || !friendlyPieceBetween(x1, y1, x2, y2, pieces, color));

export const queen =
  (pieces: cg.Pieces, color: cg.Color, useFriendliesToTrimPremoves: boolean = false): Mobility =>
  (x1, y1, x2, y2) =>
    bishop(pieces, color, useFriendliesToTrimPremoves)(x1, y1, x2, y2) ||
    rook(pieces, color, useFriendliesToTrimPremoves)(x1, y1, x2, y2);

const king =
  (color: cg.Color, rookFiles: number[], canCastle: boolean): Mobility =>
  (x1, y1, x2, y2) =>
    (diff(x1, x2) < 2 && diff(y1, y2) < 2) ||
    (canCastle &&
      y1 === y2 &&
      y1 === (color === 'white' ? 0 : 7) &&
      ((x1 === 4 && ((x2 === 2 && rookFiles.includes(0)) || (x2 === 6 && rookFiles.includes(7)))) ||
        rookFiles.includes(x2)));

function rookFilesOf(pieces: cg.Pieces, color: cg.Color) {
  const backrank = color === 'white' ? '1' : '8';
  const files = [];
  for (const [key, piece] of pieces) {
    if (key[1] === backrank && piece.color === color && piece.role === 'rook') {
      files.push(util.key2pos(key)[0]);
    }
  }
  return files;
}

export function premove(
  pieces: cg.Pieces,
  key: cg.Key,
  canCastle: boolean,
  useFriendliesToTrimPremoves: boolean = false,
): cg.Key[] {
  const piece = pieces.get(key);
  if (!piece) return [];
  const pos = util.key2pos(key),
    r = piece.role,
    mobility: Mobility =
      r === 'pawn'
        ? pawn(pieces, piece.color, useFriendliesToTrimPremoves)
        : r === 'knight'
          ? knight
          : r === 'bishop'
            ? bishop(pieces, piece.color, useFriendliesToTrimPremoves)
            : r === 'rook'
              ? rook(pieces, piece.color, useFriendliesToTrimPremoves)
              : r === 'queen'
                ? queen(pieces, piece.color, useFriendliesToTrimPremoves)
                : king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
  return util.allPos
    .filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]))
    .map(util.pos2key);
}
