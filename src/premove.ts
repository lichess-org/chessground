import * as util from './util.js';
import * as cg from './types.js';
import { HeadlessState } from './state.js';

type MobilityContext = {
  pos1: cg.Pos;
  pos2: cg.Pos;
  allPieces: cg.Pieces;
  friendlies: cg.Pieces;
  enemies: cg.Pieces;
  premoveThroughFriendlies: boolean;
  color: cg.Color;
  lastMove: cg.Key[] | undefined;
};

type Mobility = (ctx: MobilityContext) => boolean;

const isDestOccupiedByFriendly = (ctx: MobilityContext): boolean =>
  !!ctx.friendlies.get(util.pos2key(ctx.pos2));

const isDestOccupiedByEnemy = (ctx: MobilityContext): boolean => !!ctx.enemies.get(util.pos2key(ctx.pos2));

const anyPieceBetween = (pos1: cg.Pos, pos2: cg.Pos, pieces: cg.Pieces): boolean =>
  util.squaresBetween(...pos1, ...pos2).some(s => pieces.get(s));

const canEnemyPawnAdvanceToSquare = (pawnStart: cg.Key, dest: cg.Key, ctx: MobilityContext): boolean => {
  const piece = ctx.enemies.get(pawnStart);
  if (piece?.role !== 'pawn') return false;
  const step = piece.color === 'white' ? 1 : -1;
  const startPos = util.key2pos(pawnStart);
  const destPos = util.key2pos(dest);
  return (
    util.pawnDirAdvance(...startPos, ...destPos, piece.color === 'white') &&
    !anyPieceBetween(startPos, [destPos[0], destPos[1] + step], ctx.allPieces)
  );
};

const canEnemyPawnCaptureOnSquare = (pawnStart: cg.Key, dest: cg.Key, ctx: MobilityContext): boolean => {
  const enemyPawn = ctx.enemies.get(pawnStart);
  return (
    enemyPawn?.role === 'pawn' &&
    util.pawnDirCapture(...util.key2pos(pawnStart), ...util.key2pos(dest), enemyPawn.color === 'white') &&
    (!!ctx.friendlies.get(dest) ||
      canBeCapturedBySomeEnemyEnPassant(
        util.squareShiftedVertically(dest, enemyPawn.color === 'white' ? -1 : 1),
        ctx.friendlies,
        ctx.enemies,
        ctx.lastMove,
      ))
  );
};

const canSomeEnemyPawnAdvanceToDest = (ctx: MobilityContext): boolean =>
  [...ctx.enemies.keys()].some(key => canEnemyPawnAdvanceToSquare(key, util.pos2key(ctx.pos2), ctx));

const isDestControlledByEnemy = (ctx: MobilityContext, pieceRolesExclude?: cg.Role[]): boolean => {
  const square: cg.Pos = ctx.pos2;
  return [...ctx.enemies].some(([key, piece]) => {
    const piecePos = util.key2pos(key);
    return (
      !pieceRolesExclude?.includes(piece.role) &&
      ((piece.role === 'pawn' && util.pawnDirCapture(...piecePos, ...square, piece.color === 'white')) ||
        (piece.role === 'knight' && util.knightDir(...piecePos, ...square)) ||
        (piece.role === 'bishop' && util.bishopDir(...piecePos, ...square)) ||
        (piece.role === 'rook' && util.rookDir(...piecePos, ...square)) ||
        (piece.role === 'queen' && util.queenDir(...piecePos, ...square)) ||
        (piece.role === 'king' && util.kingDirNonCastling(...piecePos, ...square))) &&
      (!['bishop', 'rook', 'queen'].includes(piece.role) || !anyPieceBetween(piecePos, square, ctx.allPieces))
    );
  });
};

const isFriendlyOnDestAndAttacked = (ctx: MobilityContext): boolean =>
  isDestOccupiedByFriendly(ctx) &&
  (canBeCapturedBySomeEnemyEnPassant(util.pos2key(ctx.pos2), ctx.friendlies, ctx.enemies, ctx.lastMove) ||
    isDestControlledByEnemy(ctx));

const canBeCapturedBySomeEnemyEnPassant = (
  squareOfFriendlyPawn: cg.Key,
  friendlies: cg.Pieces,
  enemies: cg.Pieces,
  lastMove?: cg.Key[],
): boolean => {
  if (!lastMove || squareOfFriendlyPawn !== lastMove[1]) return false;
  const srcPos = util.key2pos(lastMove[0]),
    destPos = util.key2pos(lastMove[1]),
    piece = friendlies.get(lastMove[1])!;
  return (
    piece.role === 'pawn' &&
    util.diff(srcPos[1], destPos[1]) === 2 &&
    [1, -1].some(delta => {
      const enemyPiece = enemies.get(util.pos2key([destPos[0] + delta, destPos[1]]));
      return enemyPiece?.role === 'pawn';
    })
  );
};

const isPathClearEnoughOfFriendliesForPremove = (ctx: MobilityContext): boolean => {
  if (ctx.premoveThroughFriendlies) return true;
  const squaresBetween = util.squaresBetween(...ctx.pos1, ...ctx.pos2);
  const squaresOfFriendliesBetween = squaresBetween.filter(s => ctx.friendlies.get(s));
  return (
    !squaresOfFriendliesBetween.length ||
    (squaresOfFriendliesBetween.length === 1 &&
      canBeCapturedBySomeEnemyEnPassant(
        squaresOfFriendliesBetween[0],
        ctx.friendlies,
        ctx.enemies,
        ctx.lastMove,
      ) &&
      !squaresBetween.includes(
        util.squareShiftedVertically(squaresOfFriendliesBetween[0], ctx.color === 'white' ? -1 : 1),
      ))
  );
};

const isPathClearEnoughOfEnemiesForPremove = (ctx: MobilityContext): boolean => {
  if (ctx.premoveThroughFriendlies) return true;
  const squaresBetween = util.squaresBetween(...ctx.pos1, ...ctx.pos2);
  const squaresOfEnemiesBetween = squaresBetween.filter(s => ctx.enemies.get(s));
  if (squaresOfEnemiesBetween.length > 1) return false;
  if (!squaresOfEnemiesBetween.length) return true;
  const enemySquare = squaresOfEnemiesBetween[0];
  const enemy = ctx.enemies.get(enemySquare)!;
  if (enemy.role !== 'pawn') return true;
  const squareAbove = util.squareShiftedVertically(enemySquare, enemy.color === 'white' ? 1 : -1);
  const enemyPawnDests: cg.Key[] = [];
  if (canEnemyPawnAdvanceToSquare(enemySquare, squareAbove, ctx)) enemyPawnDests.push(squareAbove);
  enemyPawnDests.push(
    ...util.adjacentSquares(squareAbove).filter(s => canEnemyPawnCaptureOnSquare(enemySquare, s, ctx)),
  );
  const badSquares = [...squaresBetween, util.pos2key(ctx.pos1)];
  return enemyPawnDests.some(square => !badSquares.includes(square));
};

const isPathClearEnoughForPremove = (ctx: MobilityContext): boolean =>
  isPathClearEnoughOfFriendliesForPremove(ctx) && isPathClearEnoughOfEnemiesForPremove(ctx);

const pawn: Mobility = (ctx: MobilityContext) => {
  const step = ctx.color === 'white' ? 1 : -1;
  if (util.diff(ctx.pos1[0], ctx.pos2[0]) > 1) return false;
  if (!util.diff(ctx.pos1[0], ctx.pos2[0])) {
    return (
      util.pawnDirAdvance(...ctx.pos1, ...ctx.pos2, ctx.color === 'white') &&
      isPathClearEnoughForPremove({ ...ctx, pos2: [ctx.pos2[0], ctx.pos2[1] + step] })
    );
  }
  if (ctx.pos2[1] !== ctx.pos1[1] + step) return false;
  // todo - change name of premoveThroughFriendlies, since concept has expanded
  if (ctx.premoveThroughFriendlies || isDestOccupiedByEnemy(ctx)) return true;
  if (isDestOccupiedByFriendly(ctx)) return isDestControlledByEnemy(ctx);
  else
    return (
      canSomeEnemyPawnAdvanceToDest(ctx) ||
      canBeCapturedBySomeEnemyEnPassant(
        util.pos2key([ctx.pos2[0], ctx.pos2[1] + step]),
        ctx.friendlies,
        ctx.enemies,
        ctx.lastMove,
      ) ||
      isDestControlledByEnemy(ctx, ['pawn'])
    );
};

const knight: Mobility = (ctx: MobilityContext) =>
  util.knightDir(...ctx.pos1, ...ctx.pos2) &&
  (ctx.premoveThroughFriendlies || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx));

const bishop: Mobility = (ctx: MobilityContext) =>
  util.bishopDir(...ctx.pos1, ...ctx.pos2) &&
  isPathClearEnoughForPremove(ctx) &&
  (ctx.premoveThroughFriendlies || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx));

const rook: Mobility = (ctx: MobilityContext) =>
  util.rookDir(...ctx.pos1, ...ctx.pos2) &&
  isPathClearEnoughForPremove(ctx) &&
  (ctx.premoveThroughFriendlies || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx));

const queen: Mobility = (ctx: MobilityContext) => bishop(ctx) || rook(ctx);

const king =
  (rookFiles: number[], canCastle: boolean): Mobility =>
  (ctx: MobilityContext) =>
    (util.kingDirNonCastling(...ctx.pos1, ...ctx.pos2) &&
      (ctx.premoveThroughFriendlies || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx))) ||
    (canCastle &&
      ctx.pos1[1] === ctx.pos2[1] &&
      ctx.pos1[1] === (ctx.color === 'white' ? 0 : 7) &&
      ((ctx.pos1[0] === 4 &&
        ((ctx.pos2[0] === 2 && rookFiles.includes(0)) || (ctx.pos2[0] === 6 && rookFiles.includes(7)))) ||
        rookFiles.includes(ctx.pos2[0])) &&
      (ctx.premoveThroughFriendlies ||
        /* The following checks if no non-rook friendly piece is in the way between the king and its castling destination.
         Note that for the Chess960 edge case of Kb1 "long castling", the check passes even if there is a piece in the way
         on c1. But this is fine, since premoving from b1 to a1 as a normal move would have already returned true. */
        util
          .squaresBetween(...ctx.pos1, ctx.pos2[0] > ctx.pos1[0] ? 7 : 1, ctx.pos2[1])
          .map(s => ctx.allPieces.get(s))
          .every(p => !p || util.samePiece(p, { role: 'rook', color: ctx.color }))));

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
  if (!piece || piece.color === state.turnColor) return [];
  const friendlies = new Map([...pieces].filter(([_, p]) => p.color === piece.color));
  const enemies = new Map([...pieces].filter(([_, p]) => p.color === util.opposite(piece.color)));
  const pos = util.key2pos(key),
    r = piece.role,
    mobility: Mobility =
      r === 'pawn'
        ? pawn
        : r === 'knight'
          ? knight
          : r === 'bishop'
            ? bishop
            : r === 'rook'
              ? rook
              : r === 'queen'
                ? queen
                : king(rookFilesOf(pieces, piece.color), canCastle);
  return util.allPos
    .filter(pos2 =>
      mobility({
        pos1: pos,
        pos2: pos2,
        allPieces: pieces,
        friendlies: friendlies,
        enemies: enemies,
        premoveThroughFriendlies: premoveThroughFriendlies,
        color: piece.color,
        lastMove: state.lastMove,
      }),
    )
    .map(util.pos2key);
}
