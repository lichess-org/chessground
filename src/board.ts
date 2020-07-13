import { State } from './state'
import { pos2key, key2pos, opposite } from './util'
import { premove } from './premove'
import { computeSquareCenter } from './drag'
import * as cg from './types'

export type Callback = (...args: any[]) => void;

export function callUserFunction(f: Callback | undefined, ...args: any[]): void {
  if (f) setTimeout(() => f(...args), 1);
}

export function toggleOrientation(state: State): void {
  state.orientation = opposite(state.orientation);
  state.animation.current =
  state.draggable.current =
  state.selected = undefined;
}

export function reset(state: State): void {
  state.lastMove = undefined;
  unselect(state);
  unsetPremove(state);
  unsetPredrop(state);
}

export function setPieces(state: State, pieces: cg.PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece);
    else state.pieces.delete(key);
  }
}

export function setCheck(state: State, color: cg.Color | boolean): void {
  state.check = undefined;
  if (color === true) color = state.turnColor;
  if (color) for (const [k, p] of state.pieces) {
    if (p.role === 'king' && p.color === color) {
      state.check = k;
    }
  }
}

function setPremove(state: State, orig: cg.Key, dest: cg.Key, meta: cg.SetPremoveMetadata): void {
  unsetPredrop(state);
  state.premovable.current = [orig, dest];
  callUserFunction(state.premovable.events.set, orig, dest, meta);
}

export function unsetPremove(state: State): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
}

function setPredrop(state: State, role: cg.Role, key: cg.Key): void {
  unsetPremove(state);
  state.predroppable.current = { role, key };
  callUserFunction(state.predroppable.events.set, role, key);
}

export function unsetPredrop(state: State): void {
  const pd = state.predroppable;
  if (pd.current) {
    pd.current = undefined;
    callUserFunction(pd.events.unset);
  }
}

function tryAutoCastle(state: State, orig: cg.Key, dest: cg.Key): boolean {
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

export function baseMove(state: State, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = (destPiece && destPiece.color !== origPiece.color) ? destPiece : undefined;
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

export function baseNewPiece(state: State, piece: cg.Piece, key: cg.Key, force?: boolean): boolean {
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

function baseUserMove(state: State, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const result = baseMove(state, orig, dest);
  if (result) {
    state.movable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

export function userMove(state: State, orig: cg.Key, dest: cg.Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const holdTime = state.hold.stop();
      unselect(state);
      const metadata: cg.MoveMetadata = {
        premove: false,
        ctrlKey: state.stats.ctrlKey,
        holdTime
      };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest, {
      ctrlKey: state.stats.ctrlKey
    });
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function dropNewPiece(state: State, orig: cg.Key, dest: cg.Key, force?: boolean): void {
  const piece = state.pieces.get(orig);
  if (piece && (canDrop(state, orig, dest) || force)) {
    state.pieces.delete(orig);
    baseNewPiece(state, piece, dest, force);
    callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
      predrop: false
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

export function selectSquare(state: State, key: cg.Key, force?: boolean): void {
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

export function setSelected(state: State, key: cg.Key): void {
  state.selected = key;
  if (isPremovable(state, key)) {
    state.premovable.dests = premove(state.pieces, key, state.premovable.castle);
  }
  else state.premovable.dests = undefined;
}

export function unselect(state: State): void {
  state.selected = undefined;
  state.premovable.dests = undefined;
  state.hold.cancel();
}

function isMovable(state: State, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
        state.turnColor === piece.color
    ));
}

export function canMove(state: State, orig: cg.Key, dest: cg.Key): boolean {
  return orig !== dest && isMovable(state, orig) && (
    state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest)
  );
}

function canDrop(state: State, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && (orig === dest || !state.pieces.has(dest)) && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
        state.turnColor === piece.color
    ));
}


function isPremovable(state: State, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.premovable.enabled &&
  state.movable.color === piece.color &&
    state.turnColor !== piece.color;
}

function canPremove(state: State, orig: cg.Key, dest: cg.Key): boolean {
  return orig !== dest &&
  isPremovable(state, orig) &&
  premove(state.pieces, orig, state.premovable.castle).includes(dest);
}

function canPredrop(state: State, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  const destPiece = state.pieces.get(dest);
  return !!piece &&
  (!destPiece || destPiece.color !== state.movable.color) &&
  state.predroppable.enabled &&
  (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
  state.movable.color === piece.color &&
    state.turnColor !== piece.color;
}

export function isDraggable(state: State, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.draggable.enabled && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color && (
        state.turnColor === piece.color || state.premovable.enabled
      )
    )
  );
}

export function playPremove(state: State): boolean {
  const move = state.premovable.current;
  if (!move) return false;
  const orig = move[0], dest = move[1];
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

export function playPredrop(state: State, validate: (drop: cg.Drop) => boolean): boolean {
  const drop = state.predroppable.current;
  let success = false;
  if (!drop) return false;
  if (validate(drop)) {
    const piece = {
      role: drop.role,
      color: state.movable.color
    } as cg.Piece;
    if (baseNewPiece(state, piece, drop.key)) {
      callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
        predrop: true
      });
      success = true;
    }
  }
  unsetPredrop(state);
  return success;
}

export function cancelMove(state: State): void {
  unsetPremove(state);
  unsetPredrop(state);
  unselect(state);
}

export function stop(state: State): void {
  state.movable.color =
  state.movable.dests =
  state.animation.current = undefined;
  cancelMove(state);
}

export function getKeyAtDomPos(pos: cg.NumberPair, asWhite: boolean, bounds: ClientRect): cg.Key | undefined {
  let file = Math.floor(8 * (pos[0] - bounds.left) / bounds.width);
  if (!asWhite) file = 7 - file;
  let rank = 7 - Math.floor(8 * (pos[1] - bounds.top) / bounds.height);
  if (!asWhite) rank = 7 - rank;
  return (file >= 0 && file < 8 && rank >= 0 && rank < 8) ? pos2key([file, rank]) : undefined;
}

function isAlreadySnapped(orig: cg.Pos, targetKey: cg.Key | undefined): boolean {
  // TODO profile performance - precompute this function's values to an object?
  if (targetKey === undefined) return false;
  const pos = key2pos(targetKey);
  // +
  if (orig[0] === pos[0] || orig[1] === pos[1]) return true;
  // x
  if (Math.abs(orig[0] - pos[0]) === Math.abs(orig[1] - pos[1])) return true;
  // knight
  // a ^ b is 3 for combinations of 1 and 2
  // 0 ^ 3 also passes, but that case is valid and already encompassed above, so no harm
  if ((Math.abs(orig[0] - pos[0]) ^ Math.abs(orig[1] - pos[1])) === 3) return true;
  // all other
  return false;
}

export function getSnappedKeyAtDomPos(orig: cg.Key, pos: cg.NumberPair, asWhite: boolean, bounds: ClientRect): cg.Key | undefined {
  // 1. Get key at dom pos
  // 2. If move is valid, short circuit
  // 3. If move is not valid, pick nearest angle and snap distance to dragged distance
  // Only snapping to + and x currently.
  // TODO: also snap to knight angles, but stop after going past knight tile?
  // TODO: cleanly roll these if statements into 1 loop?

  const unsnappedKey = getKeyAtDomPos(pos, asWhite, bounds);
  const origRowCol = key2pos(orig);
  if (isAlreadySnapped(origRowCol, unsnappedKey)) return unsnappedKey;

  const draggedOutOfBox = unsnappedKey === undefined;
  const unsnappedRowCol = unsnappedKey === undefined ? origRowCol : key2pos(unsnappedKey);
  const origCenterCoord = computeSquareCenter(orig, asWhite, bounds);

  // Use degrees for ease of round numbers in code
  const origCenterToMouseDegrees = Math.atan2(pos[1] - origCenterCoord[1], origCenterCoord[0] - pos[0]) * 180 / Math.PI + 180;
  const origCenterToMouseCoordX = origCenterCoord[0] - pos[0];
  const origCenterToMouseCoordY = origCenterCoord[1] - pos[1];

  const origCenterToMouseCoordDistance = Math.sqrt(
      origCenterToMouseCoordX * origCenterToMouseCoordX +
      origCenterToMouseCoordY * origCenterToMouseCoordY
  );
  const diagonalCoordDistance = Math.sqrt(
      bounds.width * bounds.width +
      bounds.height * bounds.height
  ) / 8;
  const squareCoordDistance = Math.floor((origCenterToMouseCoordDistance + diagonalCoordDistance / 2) / diagonalCoordDistance);

  if (origCenterToMouseDegrees < (45 * 0 + 45 / 2)) {
    // console.log('e+');
    if (draggedOutOfBox) {
      return pos2key([asWhite ? 7 : 0, origRowCol[1]]);
    }
    return pos2key([unsnappedRowCol[0], origRowCol[1]]);
  }
  if (origCenterToMouseDegrees < (45 * 1 + 45 / 2)) {
    // console.log('ne');
    if (asWhite) {
      let newPos: cg.NumberPair = [origRowCol[0] + squareCoordDistance, origRowCol[1] + squareCoordDistance];
      while (newPos[0] > 7 || newPos[1] > 7) {
        newPos = [newPos[0] - 1, newPos[1] - 1];
      }
      return pos2key(newPos);
    } else {
      let newPos: cg.NumberPair = [origRowCol[0] - squareCoordDistance, origRowCol[1] - squareCoordDistance];
      while (newPos[0] < 0 || newPos[1] < 0) {
        newPos = [newPos[0] + 1, newPos[1] + 1];
      }
      return pos2key(newPos);
    }
  }
  if (origCenterToMouseDegrees < (45 * 2 + 45 / 2)) {
    // console.log('n');
    if (draggedOutOfBox) {
      return pos2key([origRowCol[0], asWhite ? 7 : 0]);
    }
    return pos2key([origRowCol[0], unsnappedRowCol[1]]);
  }
  if (origCenterToMouseDegrees < (45 * 3 + 45 / 2)) {
    // console.log('nw');
    if (asWhite) {
      let newPos: cg.NumberPair = [origRowCol[0] - squareCoordDistance, origRowCol[1] + squareCoordDistance];
      while (newPos[0] < 0 || newPos[1] > 7) {
        newPos = [newPos[0] + 1, newPos[1] - 1];
      }
      return pos2key(newPos);
    } else {
      let newPos: cg.NumberPair = [origRowCol[0] + squareCoordDistance, origRowCol[1] - squareCoordDistance];
      while (newPos[0] > 7 || newPos[1] < 0) {
        newPos = [newPos[0] - 1, newPos[1] + 1];
      }
      return pos2key(newPos);
    }
  }
  if (origCenterToMouseDegrees < (45 * 4 + 45 / 2)) {
    // console.log('w');
    if (draggedOutOfBox) {
      return pos2key([asWhite ? 0 : 7, origRowCol[1]]);
    }
    return pos2key([unsnappedRowCol[0], origRowCol[1]]);
  }
  if (origCenterToMouseDegrees < (45 * 5 + 45 / 2)) {
    // console.log('sw');
    if (asWhite) {
      let newPos: cg.NumberPair = [origRowCol[0] - squareCoordDistance, origRowCol[1] - squareCoordDistance];
      while (newPos[0] < 0 || newPos[1] < 0) {
        newPos = [newPos[0] + 1, newPos[1] + 1];
      }
      return pos2key(newPos);
    } else {
      let newPos: cg.NumberPair = [origRowCol[0] + squareCoordDistance, origRowCol[1] + squareCoordDistance];
      while (newPos[0] > 7 || newPos[1] > 7) {
        newPos = [newPos[0] - 1, newPos[1] - 1];
      }
      return pos2key(newPos);
    }
  }
  if (origCenterToMouseDegrees < (45 * 6 + 45 / 2)) {
    // console.log('s');
    if (draggedOutOfBox) {
      return pos2key([origRowCol[0], asWhite ? 0 : 7]);
    }
    return pos2key([origRowCol[0], unsnappedRowCol[1]]);
  }
  if (origCenterToMouseDegrees < (45 * 7 + 45 / 2)) {
    // console.log('se');
    if (asWhite) {
      let newPos: cg.NumberPair = [origRowCol[0] + squareCoordDistance, origRowCol[1] - squareCoordDistance];
      while (newPos[0] > 7 || newPos[1] < 0) {
        newPos = [newPos[0] - 1, newPos[1] + 1];
      }
      return pos2key(newPos);
    } else {
      let newPos: cg.NumberPair = [origRowCol[0] - squareCoordDistance, origRowCol[1] + squareCoordDistance];
      while (newPos[0] < 0 || newPos[1] > 7) {
        newPos = [newPos[0] + 1, newPos[1] - 1];
      }
      return pos2key(newPos);
    }
  } else if (origCenterToMouseDegrees < (45 * 8 + 45 / 2)) {
    // console.log('e-');
    if (draggedOutOfBox) {
      return pos2key([asWhite ? 7 : 0, origRowCol[1]]);
    }
    return pos2key([unsnappedRowCol[0], origRowCol[1]]);
  }

  // should not be reachable
  return unsnappedKey;
}

export function whitePov(s: State): boolean {
  return s.orientation === 'white';
}
