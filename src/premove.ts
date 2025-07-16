import * as util from './util.js';
import * as cg from './types.js';
import { HeadlessState } from './state.js';

type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean;

const squaresFriendlyPiecesBetween = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pieces: cg.Pieces,
  color: cg.Color,
): cg.Key[] => util.squaresBetween(x1, y1, x2, y2).filter(sq => pieces.get(sq)?.color === color);

const noFriendliesBetweenOrJustOneEnPassantTarget = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pieces: cg.Pieces,
  color: cg.Color,
  lastMove: cg.Key[] | undefined,
): boolean => {
  const squaresFriendliesBetween = squaresFriendlyPiecesBetween(x1, y1, x2, y2, pieces, color);
  if (!squaresFriendliesBetween.length) return true;
  if (squaresFriendliesBetween.length > 1 || !lastMove || squaresFriendliesBetween[0] !== lastMove[1])
    return false;
  const destKey = lastMove[1],
    srcPos = util.key2pos(lastMove[0]),
    destPos = util.key2pos(destKey),
    piece = pieces.get(destKey)!;
  return (
    piece.role === 'pawn' &&
    util.diff(srcPos[1], destPos[1]) === 2 &&
    [1, -1].some(delta => {
      const enemyPiece = pieces.get(util.pos2key([destPos[0] + delta, destPos[1]]));
      return enemyPiece?.role === 'pawn' && enemyPiece.color === util.opposite(piece.color);
    })
  );
};

const pawn =
  (pieces: cg.Pieces, color: cg.Color, premoveThroughFriendlies: boolean): Mobility =>
  (x1, y1, x2, y2) => {
    const step = color === 'white' ? 1 : -1;
    if (util.diff(x1, x2) === 1) return y2 === y1 + step;
    return (
      x1 === x2 &&
      (y2 === y1 + step ||
        // allow 2 squares from first two ranks, for horde
        (y2 === y1 + 2 * step && (color === 'white' ? y1 <= 1 : y1 >= 6))) &&
      (premoveThroughFriendlies || !squaresFriendlyPiecesBetween(x1, y1, x2, y2 + step, pieces, color).length)
    );
  };

const knight: Mobility = (x1, y1, x2, y2) => util.knightDir(x1, y1, x2, y2);

const bishop =
  (
    pieces: cg.Pieces,
    color: cg.Color,
    premoveThroughFriendlies: boolean,
    lastMove: cg.Key[] | undefined,
  ): Mobility =>
  (x1, y1, x2, y2) =>
    util.bishopDir(x1, y1, x2, y2) &&
    (premoveThroughFriendlies ||
      noFriendliesBetweenOrJustOneEnPassantTarget(x1, y1, x2, y2, pieces, color, lastMove));

const rook =
  (
    pieces: cg.Pieces,
    color: cg.Color,
    premoveThroughFriendlies: boolean,
    lastMove: cg.Key[] | undefined,
  ): Mobility =>
  (x1, y1, x2, y2) =>
    util.rookDir(x1, y1, x2, y2) &&
    (premoveThroughFriendlies ||
      noFriendliesBetweenOrJustOneEnPassantTarget(x1, y1, x2, y2, pieces, color, lastMove));

const queen =
  (
    pieces: cg.Pieces,
    color: cg.Color,
    premoveThroughFriendlies: boolean,
    lastMove: cg.Key[] | undefined,
  ): Mobility =>
  (x1, y1, x2, y2) =>
    bishop(pieces, color, premoveThroughFriendlies, lastMove)(x1, y1, x2, y2) ||
    rook(pieces, color, premoveThroughFriendlies, lastMove)(x1, y1, x2, y2);

const king =
  (
    pieces: cg.Pieces,
    color: cg.Color,
    premoveThroughFriendlies: boolean,
    rookFiles: number[],
    canCastle: boolean,
  ): Mobility =>
  (x1, y1, x2, y2) =>
    (util.diff(x1, x2) < 2 && util.diff(y1, y2) < 2) ||
    (canCastle &&
      y1 === y2 &&
      y1 === (color === 'white' ? 0 : 7) &&
      ((x1 === 4 && ((x2 === 2 && rookFiles.includes(0)) || (x2 === 6 && rookFiles.includes(7)))) ||
        rookFiles.includes(x2)) &&
      (premoveThroughFriendlies ||
        /* The following checks if no non-rook friendly piece is in the way between the king and its castling destination.
         Note that for the Chess960 edge case of Kb1 "long castling", the check passes even if there is a piece in the way
         on c1. But this is fine, since the king can always premove recapturing Ra1. */
        squaresFriendlyPiecesBetween(x1, y1, x2 > x1 ? 7 : 1, y2, pieces, color).every(
          s => pieces.get(s)!.role === 'rook',
        )));

const rookFilesOf = (pieces: cg.Pieces, color: cg.Color) => {
  const backrank = color === 'white' ? '1' : '8';
  const files = [];
  for (const [key, piece] of pieces) {
    if (key[1] === backrank && piece.color === color && piece.role === 'rook') {
      files.push(util.key2pos(key)[0]);
    }
  }
  return files;
};

export function premove(state: HeadlessState, key: cg.Key): cg.Key[] {
  const pieces = state.pieces,
    canCastle = state.premovable.castle,
    premoveThroughFriendlies = !!state.premovable.premoveThroughFriendlies;
  const piece = pieces.get(key);
  if (!piece) return [];
  const pos = util.key2pos(key),
    r = piece.role,
    mobility: Mobility =
      r === 'pawn'
        ? pawn(pieces, piece.color, premoveThroughFriendlies)
        : r === 'knight'
          ? knight
          : r === 'bishop'
            ? bishop(pieces, piece.color, premoveThroughFriendlies, state.lastMove)
            : r === 'rook'
              ? rook(pieces, piece.color, premoveThroughFriendlies, state.lastMove)
              : r === 'queen'
                ? queen(pieces, piece.color, premoveThroughFriendlies, state.lastMove)
                : king(
                    pieces,
                    piece.color,
                    premoveThroughFriendlies,
                    rookFilesOf(pieces, piece.color),
                    canCastle,
                  );
  return util.allPos
    .filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]))
    .map(util.pos2key);
}
