import { premove } from './premove.js';
import { type HeadlessState } from './state.js';
import type * as cg from './types.js';
import {
  allPos,
  computeSquareCenter,
  distanceSq,
  key2pos,
  knightDir,
  opposite,
  pos2key,
  pos2keyUnsafe,
  queenDir,
  samePos,
} from './util.js';

export function callUserFunction<T extends (...args: any[]) => void>(
  f: T | undefined,
  ...args: Parameters<T>
): void {
  if (f) setTimeout(() => f(...args), 1);
}

export function toggleOrientation(state: HeadlessState): void {
  state.orientation = opposite(state.orientation);
  state.animation.current = state.draggable.current = state.selected = undefined;
}

export function reset(state: HeadlessState): void {
  state.lastMove = undefined;
  unselect(state);
  unsetPremove(state);
  unsetPredrop(state);
}

function applyPiecesDiff(pieces: cg.Pieces, diff: cg.PiecesDiff): void {
  for (const [key, piece] of diff) {
    if (piece) pieces.set(key, piece);
    else pieces.delete(key);
  }
}

export function setPieces(state: HeadlessState, pieces: cg.PiecesDiff): void {
  applyPiecesDiff(state.pieces, pieces);
  // While a queue preview is active, basePieces is the authoritative board that
  // will be used to reconstruct the preview. Keep programmatic piece updates
  // (promotion, en passant, atomic explosions, etc.) in that base as well.
  if (state.premovable.basePieces) applyPiecesDiff(state.premovable.basePieces, pieces);
}

export function setCheck(state: HeadlessState, color: cg.Color | boolean): void {
  state.check = undefined;
  if (color === true) color = state.turnColor;
  if (color)
    for (const [k, p] of state.pieces) {
      if (p.role === 'king' && p.color === color) {
        state.check = k;
      }
    }
}

const multiplePremovesEnabled = (state: HeadlessState): boolean => state.premovable.maxCount > 1;

function previewMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  if (!piece || orig === dest) return false;
  if (!tryAutoCastle(state, orig, dest)) {
    state.pieces.set(dest, piece);
    state.pieces.delete(orig);
  }
  return true;
}

function rebuildPremovePreview(state: HeadlessState): boolean {
  const base = state.premovable.basePieces;
  if (!base) return false;
  state.pieces = new Map(base);
  for (const [orig, dest] of state.premovable.queue) if (!previewMove(state, orig, dest)) return false;
  return true;
}

function redrawAfterPreview(state: HeadlessState): void {
  (state as HeadlessState & { dom?: cg.Dom }).dom?.redraw();
}

function schedulePremovePreview(state: HeadlessState): void {
  const pm = state.premovable;
  const expectedBase = pm.basePieces;
  const expectedQueue = pm.queue;
  setTimeout(() => {
    if (
      !expectedBase ||
      pm.basePieces !== expectedBase ||
      pm.queue !== expectedQueue ||
      !pm.queue.length ||
      !multiplePremovesEnabled(state)
    )
      return;
    if (!rebuildPremovePreview(state)) clearPremove(state, true);
    redrawAfterPreview(state);
  }, 1);
}

function clearPremove(state: HeadlessState, restorePreview: boolean): void {
  const pm = state.premovable;
  const hadPremove = !!pm.current || pm.queue.length > 0;
  if (restorePreview && pm.basePieces) state.pieces = new Map(pm.basePieces);
  pm.current = undefined;
  pm.queue = [];
  pm.basePieces = undefined;
  if (hadPremove) callUserFunction(pm.events.unset);
}

function setPremove(state: HeadlessState, orig: cg.Key, dest: cg.Key, meta: cg.SetPremoveMetadata): void {
  unsetPredrop(state);
  const pm = state.premovable;
  const move: cg.KeyPair = [orig, dest];

  // Preserve the existing Chessground semantics by default: a new premove replaces
  // the previous one and pieces stay on the authoritative board squares.
  if (!multiplePremovesEnabled(state)) {
    pm.queue = [move];
    pm.current = move;
    callUserFunction(pm.events.set, orig, dest, meta);
    return;
  }

  if (pm.queue.length >= pm.maxCount) return;
  if (!pm.queue.length) pm.basePieces = new Map(state.pieces);

  pm.queue.push(move);
  pm.current = pm.queue[0];
  // Keep the long-standing async callback semantics. The speculative board is
  // rebuilt after the callback tick, so consumers still observe the position in
  // which this premove was entered (important for pre-promotion detection).
  callUserFunction(pm.events.set, orig, dest, meta);
  schedulePremovePreview(state);
}

export function unsetPremove(state: HeadlessState): void {
  clearPremove(state, true);
}

function setPredrop(state: HeadlessState, role: cg.Role, key: cg.Key): void {
  unsetPremove(state);
  state.predroppable.current = { role, key };
  callUserFunction(state.predroppable.events.set, role, key);
}

export function unsetPredrop(state: HeadlessState): void {
  const pd = state.predroppable;
  if (pd.current) {
    pd.current = undefined;
    callUserFunction(pd.events.unset);
  }
}

function tryAutoCastle(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  if (!state.autoCastle) return false;

  const king = state.pieces.get(orig);
  if (!king || king.role !== 'king') return false;

  const origPos = key2pos(orig);
  const destPos = key2pos(dest);
  if ((origPos[1] !== 0 && origPos[1] !== 7) || origPos[1] !== destPos[1]) return false;
  if (origPos[0] === 4 && !state.pieces.has(dest)) {
    if (destPos[0] === 6) dest = pos2keyUnsafe([7, destPos[1]]);
    else if (destPos[0] === 2) dest = pos2keyUnsafe([0, destPos[1]]);
  }
  const rook = state.pieces.get(dest);
  if (!rook || rook.color !== king.color || rook.role !== 'rook') return false;

  state.pieces.delete(orig);
  state.pieces.delete(dest);

  if (origPos[0] < destPos[0]) {
    state.pieces.set(pos2keyUnsafe([6, destPos[1]]), king);
    state.pieces.set(pos2keyUnsafe([5, destPos[1]]), rook);
  } else {
    state.pieces.set(pos2keyUnsafe([2, destPos[1]]), king);
    state.pieces.set(pos2keyUnsafe([3, destPos[1]]), rook);
  }
  return true;
}

export function baseMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const origPiece = state.pieces.get(orig),
    destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);
  if (!tryAutoCastle(state, orig, dest)) {
    state.pieces.set(dest, origPiece);
    state.pieces.delete(orig);
  }
  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseNewPiece(state: HeadlessState, piece: cg.Piece, key: cg.Key, force?: boolean): boolean {
  if (state.pieces.has(key)) {
    if (force) state.pieces.delete(key);
    else return false;
  }
  callUserFunction(state.events.dropNewPiece, piece, key);
  state.pieces.set(key, piece);
  state.lastMove = [key];
  state.check = undefined;
  callUserFunction(state.events.change);
  state.movable.dests = undefined;
  state.turnColor = opposite(state.turnColor);
  return true;
}

function baseUserMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const result = baseMove(state, orig, dest);
  if (result) {
    state.movable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

export function userMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const holdTime = state.hold.stop();
      unselect(state);
      const metadata: cg.MoveMetadata = {
        premove: false,
        ctrlKey: state.stats.ctrlKey,
        holdTime,
      };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest, {
      ctrlKey: state.stats.ctrlKey,
    });
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function dropNewPiece(state: HeadlessState, orig: cg.Key, dest: cg.Key, force?: boolean): void {
  const piece = state.pieces.get(orig);
  if (piece && (canDrop(state, orig, dest) || force)) {
    state.pieces.delete(orig);
    baseNewPiece(state, piece, dest, force);
    callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
      premove: false,
      predrop: false,
    });
  } else if (piece && canPredrop(state, orig, dest)) {
    setPredrop(state, piece.role, dest);
  } else {
    unsetPremove(state);
    unsetPredrop(state);
  }
  state.pieces.delete(orig);
  unselect(state);
}

export function selectSquare(state: HeadlessState, key: cg.Key, force?: boolean): void {
  callUserFunction(state.events.select, key);
  if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state);
      state.hold.cancel();
      return;
    } else if ((state.selectable.enabled || force) && state.selected !== key) {
      if (userMove(state, state.selected, key)) {
        state.stats.dragged = false;
        return;
      }
    }
  }
  if (
    (state.selectable.enabled || state.draggable.enabled) &&
    (isMovable(state, key) || isPremovable(state, key))
  ) {
    setSelected(state, key);
    state.hold.start();
  }
}

export function setSelected(state: HeadlessState, key: cg.Key): void {
  state.selected = key;
  if (!isPremovable(state, key)) state.premovable.dests = undefined;
  else if (!state.premovable.customDests) state.premovable.dests = premove(state, key);
  // calculate chess premoves if custom premoves are not passed
}

export function unselect(state: HeadlessState): void {
  state.selected = undefined;
  state.premovable.dests = undefined;
  state.hold.cancel();
}

function isMovable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (state.movable.color === 'both' ||
      (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

export const canMove = (state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean =>
  orig !== dest &&
  isMovable(state, orig) &&
  (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest));

function canDrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (orig === dest || !state.pieces.has(dest)) &&
    (state.movable.color === 'both' ||
      (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

function isPremovable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.premovable.enabled &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
  );
}

const canPremove = (state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean =>
  orig !== dest &&
  isPremovable(state, orig) &&
  (state.premovable.customDests?.get(orig) ?? premove(state, orig)).includes(dest);

function canPredrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  const destPiece = state.pieces.get(dest);
  return (
    !!piece &&
    (!destPiece || destPiece.color !== state.movable.color) &&
    state.predroppable.enabled &&
    (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
  );
}

export function isDraggable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.draggable.enabled &&
    (state.movable.color === 'both' ||
      (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled)))
  );
}

export function playPremove(state: HeadlessState): boolean {
  const pm = state.premovable;
  const move = pm.queue[0] ?? pm.current;
  if (!move) return false;
  const orig = move[0],
    dest = move[1];
  let success = false;
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const metadata: cg.MoveMetadata = { premove: true };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      success = true;
    }
  }

  if (!multiplePremovesEnabled(state)) {
    clearPremove(state, false);
    return success;
  }

  if (!success) {
    // The head no longer matches the real position after the opponent's move.
    // The rest of the chain depends on it, so discard the complete queue.
    clearPremove(state, true);
    return false;
  }

  pm.queue.shift();
  pm.current = pm.queue[0];
  if (!pm.queue.length) {
    // Match the legacy single-premove contract: consuming the final
    // premove emits unset after the move callback, while preserving
    // the already-played authoritative board position.
    pm.basePieces = undefined;
    callUserFunction(pm.events.unset);
    return true;
  }

  // Keep the just-played move as the new authoritative base. Existing move
  // callbacks run asynchronously; rebuild the speculative tail after them so
  // promotion, en passant and atomic callbacks observe the normal post-move board.
  pm.basePieces = new Map(state.pieces);
  schedulePremovePreview(state);
  return true;
}

export function playPredrop(state: HeadlessState, validate: (drop: cg.Drop) => boolean): boolean {
  const drop = state.predroppable.current;
  let success = false;
  if (!drop) return false;
  if (validate(drop)) {
    const piece = {
      role: drop.role,
      color: state.movable.color,
    } as cg.Piece;
    if (baseNewPiece(state, piece, drop.key)) {
      callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
        premove: false,
        predrop: true,
      });
      success = true;
    }
  }
  unsetPredrop(state);
  return success;
}

export function cancelMove(state: HeadlessState): void {
  unsetPremove(state);
  unsetPredrop(state);
  unselect(state);
}

export function stop(state: HeadlessState): void {
  state.movable.color = state.movable.dests = state.animation.current = undefined;
  cancelMove(state);
}

export function getKeyAtDomPos(
  pos: cg.NumberPair,
  asWhite: boolean,
  bounds: DOMRectReadOnly,
): cg.Key | undefined {
  let file = Math.floor((8 * (pos[0] - bounds.left)) / bounds.width);
  if (!asWhite) file = 7 - file;
  let rank = 7 - Math.floor((8 * (pos[1] - bounds.top)) / bounds.height);
  if (!asWhite) rank = 7 - rank;
  return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? pos2key([file, rank]) : undefined;
}

export function getSnappedKeyAtDomPos(
  orig: cg.Key,
  pos: cg.NumberPair,
  asWhite: boolean,
  bounds: DOMRectReadOnly,
): cg.Key | undefined {
  const origPos = key2pos(orig);
  const validSnapPos = allPos.filter(
    pos2 =>
      samePos(origPos, pos2) ||
      queenDir(origPos[0], origPos[1], pos2[0], pos2[1]) ||
      knightDir(origPos[0], origPos[1], pos2[0], pos2[1]),
  );
  const validSnapCenters = validSnapPos.map(pos2 =>
    computeSquareCenter(pos2keyUnsafe(pos2), asWhite, bounds),
  );
  const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
  const [, closestSnapIndex] = validSnapDistances.reduce(
    (a, b, index) => (a[0] < b ? a : [b, index]),
    [validSnapDistances[0], 0],
  );
  return pos2key(validSnapPos[closestSnapIndex]);
}

export const whitePov = (s: HeadlessState): boolean => s.orientation === 'white';
