import { type HeadlessState } from './state.js';
import type * as cg from './types.js';
import { type Mobility, type MobilityContext } from './types.js';
import * as util from './util.js';

const pawn: Mobility = (ctx: MobilityContext) =>
  util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) <= 1 &&
  (util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) === 1
    ? ctx.dest.pos[1] === ctx.orig.pos[1] + (ctx.color === 'white' ? 1 : -1)
    : util.pawnDirAdvance(...ctx.orig.pos, ...ctx.dest.pos, ctx.color === 'white'));

const knight: Mobility = (ctx: MobilityContext) => util.knightDir(...ctx.orig.pos, ...ctx.dest.pos);

const bishop: Mobility = (ctx: MobilityContext) => util.bishopDir(...ctx.orig.pos, ...ctx.dest.pos);

const rook: Mobility = (ctx: MobilityContext) => util.rookDir(...ctx.orig.pos, ...ctx.dest.pos);

const queen: Mobility = (ctx: MobilityContext) => bishop(ctx) || rook(ctx);

const king: Mobility = (ctx: MobilityContext) =>
  util.kingDirNonCastling(...ctx.orig.pos, ...ctx.dest.pos) ||
  (ctx.orig.pos[1] === ctx.dest.pos[1] &&
    ctx.orig.pos[1] === (ctx.color === 'white' ? 0 : 7) &&
    ((ctx.orig.pos[0] === 4 &&
      ((ctx.dest.pos[0] === 2 && ctx.rookFilesFriendlies.includes(0)) ||
        (ctx.dest.pos[0] === 6 && ctx.rookFilesFriendlies.includes(7)))) ||
      ctx.rookFilesFriendlies.includes(ctx.dest.pos[0])));

const mobilityByRole = { pawn, knight, bishop, rook, queen, king };

/**
 * Virtually applies a single move to a pieces map and returns a new map.
 * The moved piece is relocated and any piece on the destination square is
 * captured (overwritten). Like the rest of premove logic, this intentionally
 * ignores promotion, en-passant and castling-rights details — it only needs to
 * be good enough to compute legal destination squares for the next queued
 * premove on a hypothetical board.
 */
export function applyMoveToPieces(pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): cg.Pieces {
  const piece = pieces.get(orig);
  if (!piece) return pieces;
  const entries: [cg.Key, cg.Piece][] = [];
  for (const [key, p] of pieces) if (key !== orig) entries.push([key, p]);
  entries.push([dest, piece]);
  return new Map(entries);
}

/**
 * The pieces map that should be used to compute premove destinations for `orig`:
 * the real board with the queued premoves already applied on top. When premoving
 * is not in "multiple" (queue) mode, or the queue is empty, this is simply the
 * current board.
 *
 * When `orig` is an origin already used by an earlier queued item, re-queueing
 * from it replaces that item and everything queued after it, so the hypothetical
 * board only applies the items before that one.
 */
export function premovePieces(state: HeadlessState, orig?: cg.Key): cg.Pieces {
  if (!state.premovable.multiple) return state.pieces;
  const queue = state.premovable.queue;
  const idx = orig === undefined ? -1 : queue.findIndex(item => item.orig === orig);
  const effective = idx === -1 ? queue : queue.slice(0, idx);
  let pieces = state.pieces;
  for (const item of effective) pieces = applyMoveToPieces(pieces, item.orig, item.dest);
  return pieces;
}

function premoveFromState(state: HeadlessState, pieces: cg.Pieces, key: cg.Key): cg.Key[] {
  const piece = pieces.get(key);
  if (!piece || piece.color === state.turnColor) return [];
  const color = piece.color,
    friendlies = new Map([...pieces].filter(([_, p]) => p.color === color)),
    enemies = new Map([...pieces].filter(([_, p]) => p.color === util.opposite(color))),
    orig = { key, pos: util.key2pos(key) },
    mobility: Mobility = (ctx: MobilityContext) =>
      mobilityByRole[piece.role](ctx) && state.premovable.additionalPremoveRequirements(ctx),
    partialCtx = {
      orig,
      role: piece.role,
      allPieces: pieces,
      friendlies,
      enemies,
      color,
      rookFilesFriendlies: Array.from(pieces)
        .filter(
          ([k, p]) => k[1] === (color === 'white' ? '1' : '8') && p.color === color && p.role === 'rook',
        )
        .map(([k]) => util.key2pos(k)[0]),
      lastMove: state.lastMove,
    };
  // todo - remove more properties from MobilityContext that aren't used in this file, and adjust as needed in lila.
  return util.allPosAndKey.filter(dest => mobility({ ...partialCtx, dest })).map(pk => pk.key);
}

export function premove(state: HeadlessState, key: cg.Key): cg.Key[] {
  return premoveFromState(state, premovePieces(state, key), key);
}
