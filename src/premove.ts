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

function isPromotingMove(_orig: cg.Key, dest: cg.Key, piece: cg.Piece): boolean {
  if (piece.role !== 'pawn') return false;
  const destRank = dest[1];
  return (piece.color === 'white' && destRank === '8') || (piece.color === 'black' && destRank === '1');
}

/**
 * Apply a single premove to a pieces map and return a new map. Captures any
 * piece on the destination square, and additionally:
 *
 *  - For pawn promotion, relocates the pawn then transforms it to the requested
 *    promotion role on the destination square. If no promotion role is supplied
 *    for a promoting pawn, it defaults to queen (the overwhelmingly common case
 *    and what chess.com does).
 *  - For castling (king moves two squares on its back rank), also relocates the
 *    corresponding rook on the same rank. This keeps the hypothetical board
 *    consistent so subsequent queued moves on the rook or king make sense.
 *  - For en passant (a pawn captures diagonally to an empty square), removes the
 *    captured pawn from the file it crosses. Detection is purely geometric and
 *    does not require en-passant rights state.
 *
 * If the origin square is empty in `pieces`, the move is dropped: the board is
 * returned unchanged so callers can detect a broken chain.
 */
export function applyMoveToPieces(
  pieces: cg.Pieces,
  orig: cg.Key,
  dest: cg.Key,
  opts?: { promotion?: cg.Role },
): cg.Pieces {
  const piece = pieces.get(orig);
  if (!piece) return pieces;
  const entries: [cg.Key, cg.Piece][] = [];
  for (const [key, p] of pieces) if (key !== orig) entries.push([key, p]);

  // En passant: pawn captures diagonally to an empty square.
  if (piece.role === 'pawn' && !pieces.has(dest) && orig[0] !== dest[0]) {
    const capturedRank = orig[1];
    const capturedKey = (dest[0] + capturedRank) as cg.Key;
    const captured = pieces.get(capturedKey);
    if (captured && captured.role === 'pawn' && captured.color !== piece.color) {
      // Drop the captured pawn from the entries.
      for (let i = entries.length - 1; i >= 0; i--) if (entries[i][0] === capturedKey) entries.splice(i, 1);
    }
  }

  let movingPiece: cg.Piece = piece;
  if (isPromotingMove(orig, dest, piece)) {
    movingPiece = { ...piece, role: opts?.promotion ?? 'queen', promoted: true };
  }

  entries.push([dest, movingPiece]);

  // Castling: king moving two squares on its back rank.
  if (piece.role === 'king' && orig[1] === dest[1] && Math.abs(orig.charCodeAt(0) - dest.charCodeAt(0)) === 2) {
    const rank = orig[1];
    const kingDestFile = dest[0];
    const rookFromFile = kingDestFile === 'g' ? 'h' : kingDestFile === 'c' ? 'a' : null;
    const rookToFile = kingDestFile === 'g' ? 'f' : kingDestFile === 'c' ? 'd' : null;
    if (rookFromFile && rookToFile) {
      const rookKey = (rookFromFile + rank) as cg.Key;
      const rook = pieces.get(rookKey);
      if (rook && rook.role === 'rook' && rook.color === piece.color) {
        for (let i = entries.length - 1; i >= 0; i--) if (entries[i][0] === rookKey) entries.splice(i, 1);
        entries.push([(rookToFile + rank) as cg.Key, rook]);
      }
    }
  }

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
 *
 * If any queued item's origin is missing on the resulting hypothetical board
 * (because a prior step's capture or castling relocation invalidated it), that
 * item is silently skipped — the chain breaks rather than misapplying later
 * moves to the wrong board.
 */
export function premovePieces(state: HeadlessState, orig?: cg.Key): cg.Pieces {
  if (!state.premovable.multiple) return state.pieces;
  const cut = orig === undefined ? state.premovable.queue.length : premoveCutIndex(state, orig);
  const truncated: HeadlessState = {
    ...state,
    premovable: { ...state.premovable, queue: state.premovable.queue.slice(0, cut) },
  };
  return computeVirtualBoard(truncated).pieces;
}

/**
 * Returns the full virtual pieces map with the entire premove queue applied in
 * order. Used by the renderer for the virtual pieces layer; never mutates
 * `state.pieces`. Stops at the first broken item.
 */
export function fullPremovePieces(state: HeadlessState): cg.Pieces {
  return computeVirtualBoard(state).pieces;
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

export interface VirtualBoard {
  /** تخته‌ی فرضی بعد از اعمال بخش معتبر صف */
  pieces: cg.Pieces;
  /** key → آخرین stage ای که مهره‌ای روی این خونه گذاشته */
  placedBy: Map<cg.Key, number>;
  /** خونه‌هایی که رخِ قلعه در آن‌ها نشسته (نه dest خود آیتم) */
  castlingRooks: Set<cg.Key>;
  /** تعداد آیتم‌هایی که با موفقیت اعمال شدند (زنجیره از این‌جا به بعد شکسته) */
  validStages: number;
}

/**
 * صف را stage به stage اعمال می‌کند و علاوه بر تخته‌ی نهایی، برای هر خونه
 * ثبت می‌کند چه stage ای آن را پر کرده. تشخیص تغییر با identity مهره است،
 * چون applyMoveToPieces آبجکت‌های دست‌نخورده را همان‌طور کپی می‌کند.
 */
export function computeVirtualBoard(state: HeadlessState): VirtualBoard {
  const placedBy = new Map<cg.Key, number>();
  const castlingRooks = new Set<cg.Key>();
  let pieces: cg.Pieces = state.pieces;
  let validStages = 0;
  if (!state.premovable.multiple) return { pieces, placedBy, castlingRooks, validStages };

  const queue = state.premovable.queue;
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const before = pieces;
    if (!before.has(item.orig)) break; // زنجیره شکسته
    pieces = applyMoveToPieces(before, item.orig, item.dest, { promotion: item.promotion });
    validStages = i + 1;

    // خونه‌هایی که خالی شدند (مبدأ، رخ قلعه از h1/a1، پیاده‌ی آن‌پاسان)
    for (const [k] of before) {
      if (!pieces.has(k)) {
        placedBy.delete(k);
        castlingRooks.delete(k);
      }
    }
    // خونه‌هایی که محتوایشان عوض شد (dest، خونه‌ی جدید رخ، ارتقا)
    for (const [k, p] of pieces) {
      if (before.get(k) === p) continue;
      placedBy.set(k, i);
      if (k === item.dest) castlingRooks.delete(k);
      else castlingRooks.add(k);
    }
  }
  return { pieces, placedBy, castlingRooks, validStages };
}

/** مهره‌ای که «روی تخته‌ی فرضی» در این خونه است (منبع حقیقت برای انتخاب/درگ) */
export function virtualPieceAt(state: HeadlessState, key: cg.Key): cg.Piece | undefined {
  return computeVirtualBoard(state).pieces.get(key);
}

/**
 * وقتی کاربر از `orig` پیش‌حرکت جدید می‌زند، صف باید تا کجا نگه داشته شود؟
 * از آخر صف به عقب می‌گردیم و به اولین رخدادِ مربوط به این خونه نگاه می‌کنیم:
 *  - آخرین رخداد «ورود» بود (dest) → مهره‌ی روی این خونه همان مهره‌ی صف است → ادامه‌ی زنجیره؛ کل صف می‌ماند
 *  - آخرین رخداد «خروج» بود (orig) → کاربر دارد همان آیتم را از نو مسیریابی می‌کند → از همان‌جا برش
 *  - هیچ‌کدام → کل صف می‌ماند
 *
 * (findIndex(item.orig === orig) قبلی اشتباه بود: اگر خونه بعداً دوباره پر شده
 * باشد، برش از اولین خروج باعث می‌شد مهره‌ی اشتباه دیده شود و نشود ادامه داد.)
 */
export function premoveCutIndex(state: HeadlessState, orig: cg.Key): number {
  const queue = state.premovable.queue;
  for (let i = queue.length - 1; i >= 0; i--) {
    const item = queue[i];
    if (item.dest === orig) return queue.length;
    if (item.orig === orig) return i;
  }
  return queue.length;
}