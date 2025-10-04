import * as util from './util.js';
import * as cg from './types.js';
import { HeadlessState } from './state.js';

type MobilityContext = {
  pos1: cg.Pos;
  pos2: cg.Pos;
  allPieces: cg.Pieces;
  friendlies: cg.Pieces;
  enemies: cg.Pieces;
  unrestrictedPremoves: boolean;
  color: cg.Color;
  canCastle: boolean;
  rookFilesFriendlies: number[];
  lastMove: cg.Key[] | undefined;
};

type Mobility = (ctx: MobilityContext) => boolean;

const isDestOccupiedByFriendly = (ctx: MobilityContext): boolean =>
  ctx.friendlies.has(util.pos2key(ctx.pos2));

const isDestOccupiedByEnemy = (ctx: MobilityContext): boolean => ctx.enemies.has(util.pos2key(ctx.pos2));

const anyPieceBetween = (pos1: cg.Pos, pos2: cg.Pos, pieces: cg.Pieces): boolean =>
  util.squaresBetween(...pos1, ...pos2).some(s => pieces.has(s));

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
    (ctx.friendlies.has(dest) ||
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
  potentialSquareOfFriendlyPawn: cg.Key | undefined,
  friendlies: cg.Pieces,
  enemies: cg.Pieces,
  lastMove?: cg.Key[],
): boolean => {
  if (!potentialSquareOfFriendlyPawn || (lastMove && potentialSquareOfFriendlyPawn !== lastMove[1]))
    return false;
  const pos = util.key2pos(potentialSquareOfFriendlyPawn);
  const friendly = friendlies.get(potentialSquareOfFriendlyPawn);
  return (
    friendly?.role === 'pawn' &&
    pos[1] === (friendly.color === 'white' ? 3 : 4) &&
    (!lastMove || util.diff(util.key2pos(lastMove[0])[1], pos[1]) === 2) &&
    [1, -1].some(delta => enemies.get(util.pos2key([pos[0] + delta, pos[1]]))?.role === 'pawn')
  );
};

const isPathClearEnoughOfFriendliesForPremove = (ctx: MobilityContext): boolean => {
  if (ctx.unrestrictedPremoves) return true;
  const squaresBetween = util.squaresBetween(...ctx.pos1, ...ctx.pos2);
  const squaresOfFriendliesBetween = squaresBetween.filter(s => ctx.friendlies.has(s));
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
  if (ctx.unrestrictedPremoves) return true;
  const squaresBetween = util.squaresBetween(...ctx.pos1, ...ctx.pos2);
  const squaresOfEnemiesBetween = squaresBetween.filter(s => ctx.enemies.has(s));
  if (squaresOfEnemiesBetween.length > 1) return false;
  if (!squaresOfEnemiesBetween.length) return true;
  const enemySquare = squaresOfEnemiesBetween[0];
  const enemy = ctx.enemies.get(enemySquare);
  if (!enemy || enemy.role !== 'pawn') return true;

  const enemyStep = enemy.color === 'white' ? 1 : -1;
  const squareAbove = util.squareShiftedVertically(enemySquare, enemyStep);
  const enemyPawnDests: cg.Key[] = [
    ...util.adjacentSquares(squareAbove).filter(s => canEnemyPawnCaptureOnSquare(enemySquare, s, ctx)),
    ...[squareAbove, util.squareShiftedVertically(squareAbove, enemyStep)].filter(
      (s: cg.Key | undefined) => s && canEnemyPawnAdvanceToSquare(enemySquare, s, ctx),
    ),
  ];
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
  if (ctx.unrestrictedPremoves || isDestOccupiedByEnemy(ctx)) return true;
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
  (ctx.unrestrictedPremoves || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx));

const bishop: Mobility = (ctx: MobilityContext) =>
  util.bishopDir(...ctx.pos1, ...ctx.pos2) &&
  isPathClearEnoughForPremove(ctx) &&
  (ctx.unrestrictedPremoves || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx));

const rook: Mobility = (ctx: MobilityContext) =>
  util.rookDir(...ctx.pos1, ...ctx.pos2) &&
  isPathClearEnoughForPremove(ctx) &&
  (ctx.unrestrictedPremoves || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx));

const queen: Mobility = (ctx: MobilityContext) => bishop(ctx) || rook(ctx);

const king: Mobility = (ctx: MobilityContext) =>
  (util.kingDirNonCastling(...ctx.pos1, ...ctx.pos2) &&
    (ctx.unrestrictedPremoves || !isDestOccupiedByFriendly(ctx) || isFriendlyOnDestAndAttacked(ctx))) ||
  (ctx.canCastle &&
    ctx.pos1[1] === ctx.pos2[1] &&
    ctx.pos1[1] === (ctx.color === 'white' ? 0 : 7) &&
    ((ctx.pos1[0] === 4 &&
      ((ctx.pos2[0] === 2 && ctx.rookFilesFriendlies.includes(0)) ||
        (ctx.pos2[0] === 6 && ctx.rookFilesFriendlies.includes(7)))) ||
      ctx.rookFilesFriendlies.includes(ctx.pos2[0])) &&
    (ctx.unrestrictedPremoves ||
      /* The following checks if no non-rook friendly piece is in the way between the king and its castling destination.
         Note that for the Chess960 edge case of Kb1 "long castling", the check passes even if there is a piece in the way
         on c1. But this is fine, since premoving from b1 to a1 as a normal move would have already returned true. */
      util
        .squaresBetween(...ctx.pos1, ctx.pos2[0] > ctx.pos1[0] ? 7 : 1, ctx.pos2[1])
        .map(s => ctx.allPieces.get(s))
        .every(p => !p || util.samePiece(p, { role: 'rook', color: ctx.color }))));

const mobilityByRole = { pawn, knight, bishop, rook, queen, king };

export function premove(state: HeadlessState, key: cg.Key): cg.Key[] {
  const pieces = state.pieces,
    canCastle = state.premovable.castle,
    unrestrictedPremoves = !!state.premovable.unrestrictedPremoves;
  const piece = pieces.get(key);
  if (!piece || piece.color === state.turnColor) return [];
  const color = piece.color,
    friendlies = new Map([...pieces].filter(([_, p]) => p.color === color)),
    enemies = new Map([...pieces].filter(([_, p]) => p.color === util.opposite(color))),
    pos = util.key2pos(key),
    mobility: Mobility = mobilityByRole[piece.role],
    ctx = {
      pos1: pos,
      allPieces: pieces,
      friendlies: friendlies,
      enemies: enemies,
      unrestrictedPremoves: unrestrictedPremoves,
      color: color,
      canCastle: canCastle,
      rookFilesFriendlies: Array.from(pieces)
        .filter(
          ([k, p]) => k[1] === (color === 'white' ? '1' : '8') && p.color === color && p.role === 'rook',
        )
        .map(([k]) => util.key2pos(k)[0]),
      lastMove: state.lastMove,
    };
  return util.allPos.filter(pos2 => mobility({ ...ctx, pos2 })).map(util.pos2key);
}
