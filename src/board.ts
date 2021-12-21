import { HeadlessState } from './state.js';
import { pos2key, key2pos, opposite, distanceSq, allPos, computeSquareCenter } from './util.js';
import { premove, queen, knight } from './premove.js';
import * as cg from './types.js';

export function callUserFunction<T extends (...args: any[]) => void>(f: T | undefined, ...args: Parameters<T>): void {
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

export function setPieces(state: HeadlessState, pieces: cg.PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece);
    else state.pieces.delete(key);
  }
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

function setPremove(state: HeadlessState, orig: cg.Key, dest: cg.Key, meta: cg.SetPremoveMetadata): void {
  unsetPredrop(state);
  state.premovable.current = [orig, dest];
  callUserFunction(state.premovable.events.set, orig, dest, meta);
}

export function unsetPremove(state: HeadlessState): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
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
    if (destPos[0] === 6) dest = pos2key([7, destPos[1]]);
    else if (destPos[0] === 2) dest = pos2key([0, destPos[1]]);
  }
  const rook = state.pieces.get(dest);
  if (!rook || rook.color !== king.color || rook.role !== 'rook') return false;

  state.pieces.delete(orig);
  state.pieces.delete(dest);

  if (origPos[0] < destPos[0]) {
    state.pieces.set(pos2key([6, destPos[1]]), king);
    state.pieces.set(pos2key([5, destPos[1]]), rook);
  } else {
    state.pieces.set(pos2key([2, destPos[1]]), king);
    state.pieces.set(pos2key([3, destPos[1]]), rook);
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
  if (isMovable(state, key) || isPremovable(state, key)) {
    setSelected(state, key);
    state.hold.start();
  }
}

export function setSelected(state: HeadlessState, key: cg.Key): void {
  state.selected = key;
  if (isPremovable(state, key)) {
    state.premovable.dests = premove(state.pieces, key, state.premovable.castle);
  } else state.premovable.dests = undefined;
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
    (state.movable.color === 'both' || (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

export function canMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  return (
    orig !== dest && isMovable(state, orig) && (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest))
  );
}

function canDrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (orig === dest || !state.pieces.has(dest)) &&
    (state.movable.color === 'both' || (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

function isPremovable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.premovable.enabled && state.movable.color === piece.color && state.turnColor !== piece.color;
}

function canPremove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  return (
    orig !== dest && isPremovable(state, orig) && premove(state.pieces, orig, state.premovable.castle).includes(dest)
  );
}

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
  const move = state.premovable.current;
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
  unsetPremove(state);
  return success;
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

export function getKeyAtDomPos(pos: cg.NumberPair, asWhite: boolean, bounds: ClientRect): cg.Key | undefined {
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
  bounds: ClientRect
): cg.Key | undefined {
  const origPos = key2pos(orig);
  const validSnapPos = allPos.filter(pos2 => {
    return queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]);
  });
  const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2key(pos2), asWhite, bounds));
  const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
  const [, closestSnapIndex] = validSnapDistances.reduce(
    (a, b, index) => (a[0] < b ? a : [b, index]),
    [validSnapDistances[0], 0]
  );
  return pos2key(validSnapPos[closestSnapIndex]);
}

export function whitePov(s: HeadlessState): boolean {
  return s.orientation === 'white';
}
