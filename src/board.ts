import { State } from './state'
import { pos2key, key2pos, opposite, containsX } from './util'
import premove from './premove'
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
  for (let key in pieces) {
    const piece = pieces[key];
    if (piece) state.pieces[key] = piece;
    else delete state.pieces[key];
  }
}

export function setCheck(state: State, color: cg.Color | boolean): void {
  state.check = undefined;
  if (color === true) color = state.turnColor;
  if (color) for (let k in state.pieces) {
    if (state.pieces[k]!.role === 'king' && state.pieces[k]!.color === color) {
      state.check = k as cg.Key;
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
  const king = state.pieces[orig];
  if (!king || king.role !== 'king') return false;
  const origPos = key2pos(orig);
  if (origPos[0] !== 5) return false;
  if (origPos[1] !== 1 && origPos[1] !== 8) return false;
  const destPos = key2pos(dest);
  let oldRookPos, newRookPos, newKingPos;
  if (destPos[0] === 7 || destPos[0] === 8) {
    oldRookPos = pos2key([8, origPos[1]]);
    newRookPos = pos2key([6, origPos[1]]);
    newKingPos = pos2key([7, origPos[1]]);
  } else if (destPos[0] === 3 || destPos[0] === 1) {
    oldRookPos = pos2key([1, origPos[1]]);
    newRookPos = pos2key([4, origPos[1]]);
    newKingPos = pos2key([3, origPos[1]]);
  } else return false;

  const rook = state.pieces[oldRookPos];
  if (!rook || rook.role !== 'rook') return false;

  delete state.pieces[orig];
  delete state.pieces[oldRookPos];

  state.pieces[newKingPos] = king
  state.pieces[newRookPos] = rook;
  return true;
}

export function baseMove(state: State, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const origPiece = state.pieces[orig], destPiece = state.pieces[dest];
  if (orig === dest || !origPiece) return false;
  const captured = (destPiece && destPiece.color !== origPiece.color) ? destPiece : undefined;
  if (dest == state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);
  if (!tryAutoCastle(state, orig, dest)) {
    state.pieces[dest] = origPiece;
    delete state.pieces[orig];
  }
  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseNewPiece(state: State, piece: cg.Piece, key: cg.Key, force?: boolean): boolean {
  if (state.pieces[key]) {
    if (force) delete state.pieces[key];
    else return false;
  }
  callUserFunction(state.events.dropNewPiece, piece, key);
  state.pieces[key] = piece;
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
  if (canDrop(state, orig, dest) || force) {
    const piece = state.pieces[orig]!;
    delete state.pieces[orig];
    baseNewPiece(state, piece, dest, force);
    callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
      predrop: false
    });
  } else if (canPredrop(state, orig, dest)) {
    setPredrop(state, state.pieces[orig]!.role, dest);
  } else {
    unsetPremove(state);
    unsetPredrop(state);
  }
  delete state.pieces[orig];
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
  const piece = state.pieces[orig];
  return !!piece && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
        state.turnColor === piece.color
    ));
}

export function canMove(state: State, orig: cg.Key, dest: cg.Key): boolean {
  return orig !== dest && isMovable(state, orig) && (
    state.movable.free || (!!state.movable.dests && containsX(state.movable.dests[orig], dest))
  );
}

function canDrop(state: State, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces[orig];
  return !!piece && dest && (orig === dest || !state.pieces[dest]) && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
        state.turnColor === piece.color
    ));
}


function isPremovable(state: State, orig: cg.Key): boolean {
  const piece = state.pieces[orig];
  return !!piece && state.premovable.enabled &&
  state.movable.color === piece.color &&
    state.turnColor !== piece.color;
}

function canPremove(state: State, orig: cg.Key, dest: cg.Key): boolean {
  return orig !== dest &&
  isPremovable(state, orig) &&
  containsX(premove(state.pieces, orig, state.premovable.castle), dest);
}

function canPredrop(state: State, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces[orig];
  const destPiece = state.pieces[dest];
  return !!piece && dest &&
  (!destPiece || destPiece.color !== state.movable.color) &&
  state.predroppable.enabled &&
  (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
  state.movable.color === piece.color &&
    state.turnColor !== piece.color;
}

export function isDraggable(state: State, orig: cg.Key): boolean {
  const piece = state.pieces[orig];
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
  let drop = state.predroppable.current,
  success = false;
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
  let file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
  if (!asWhite) file = 9 - file;
  let rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
  if (!asWhite) rank = 9 - rank;
  return (file > 0 && file < 9 && rank > 0 && rank < 9) ? pos2key([file, rank]) : undefined;
}

export function whitePov(s: State): boolean {
  return s.orientation === 'white';
}
