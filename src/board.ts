import { pos2key, key2pos, opposite, containsX } from './util'
import premove from './premove'
import * as hold from './hold'

type Callback = (...args: any[]) => void;

function callUserFunction(f: Callback | undefined, ...args: any[]): void {
  if (f) setTimeout(() => f(...args), 1);
}

export function toggleOrientation(data: Data): void {
  data.orientation = opposite(data.orientation);
}

export function reset(data: Data): void {
  data.lastMove = undefined;
  setSelected(data);
  unsetPremove(data);
  unsetPredrop(data);
}

export function setPieces(data: Data, pieces: Pieces): void {
  for (var key in pieces) {
    if (pieces[key]) data.pieces[key] = pieces[key];
    else delete data.pieces[key];
  }
  data.movable.dropped = undefined;
}

export function setCheck(data: Data, color?: Color): void {
  const checkColor: Color = color || data.turnColor;
  for (var key in data.pieces) {
    if (data.pieces[key].role === 'king' && data.pieces[key].color === checkColor) data.check = key as Key;
  }
}

function setPremove(data: Data, orig: Key, dest: Key, meta: any): void {
  unsetPredrop(data);
  data.premovable.current = [orig, dest];
  callUserFunction(data.premovable.events.set, orig, dest, meta);
}

export function unsetPremove(data: Data): void {
  if (data.premovable.current) {
    data.premovable.current = undefined;
    callUserFunction(data.premovable.events.unset);
  }
}

function setPredrop(data: Data, role: Role, key: Key): void {
  unsetPremove(data);
  data.predroppable.current = {
    role: role,
    key: key
  };
  callUserFunction(data.predroppable.events.set, role, key);
}

export function unsetPredrop(data: Data): void {
  const pd = data.predroppable;
  if (pd.current) {
    pd.current = undefined;
    callUserFunction(pd.events.unset);
  }
}

function tryAutoCastle(data: Data, orig: Key, dest: Key): void {
  if (!data.autoCastle) return;
  const king = data.pieces[dest];
  if (king.role !== 'king') return;
  const origPos = key2pos(orig);
  if (origPos[0] !== 5) return;
  if (origPos[1] !== 1 && origPos[1] !== 8) return;
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
  } else return;
  delete data.pieces[orig];
  delete data.pieces[dest];
  delete data.pieces[oldRookPos];
  data.pieces[newKingPos] = {
    role: 'king',
    color: king.color
  };
  data.pieces[newRookPos] = {
    role: 'rook',
    color: king.color
  };
}

export function baseMove(data: Data, orig: Key, dest: Key): boolean {
  if (orig === dest || !data.pieces[orig]) return false;
  var captured: Piece | undefined = (
    data.pieces[dest] &&
    data.pieces[dest].color !== data.pieces[orig].color
  ) ? data.pieces[dest] : undefined;
  callUserFunction(data.events.move, orig, dest, captured);
  data.pieces[dest] = data.pieces[orig];
  delete data.pieces[orig];
  data.lastMove = [orig, dest];
  data.check = undefined;
  tryAutoCastle(data, orig, dest);
  callUserFunction(data.events.change);
  data.movable.dropped = undefined;
  return true;
}

export function baseNewPiece(data: Data, piece: Piece, key: Key, force?: boolean): boolean {
  if (data.pieces[key]) {
    if (force) delete data.pieces[key];
    else return false;
  }
  callUserFunction(data.events.dropNewPiece, piece, key);
  data.pieces[key] = piece;
  data.lastMove = [key, key];
  data.check = undefined;
  callUserFunction(data.events.change);
  data.movable.dropped = undefined;
  data.movable.dests = undefined;
  data.turnColor = opposite(data.turnColor);
  return true;
}

function baseUserMove(data: Data, orig: Key, dest: Key): boolean {
  var result = baseMove(data, orig, dest);
  if (result) {
    data.movable.dests = {};
    data.turnColor = opposite(data.turnColor);
  }
  return result;
}

function userMove(data: Data, orig: Key, dest: Key): boolean {
  if (!dest) {
    hold.cancel();
    setSelected(data);
    if (data.movable.dropOff === 'trash') {
      delete data.pieces[orig];
      callUserFunction(data.events.change);
    }
  } else if (canMove(data, orig, dest)) {
    if (baseUserMove(data, orig, dest)) {
      var holdTime = hold.stop();
      setSelected(data);
      callUserFunction(data.movable.events.after, orig, dest, {
        premove: false,
        ctrlKey: data.stats.ctrlKey,
        holdTime: holdTime
      });
      return true;
    }
  } else if (canPremove(data, orig, dest)) {
    setPremove(data, orig, dest, {
      ctrlKey: data.stats.ctrlKey
    });
    setSelected(data);
  } else if (isMovable(data, dest) || isPremovable(data, dest)) {
    setSelected(data, dest);
    hold.start();
  } else setSelected(data);
  return false;
}

export function dropNewPiece(data: Data, orig: Key, dest: Key, force?: boolean): void {
  if (canDrop(data, orig, dest) || force) {
    var piece = data.pieces[orig];
    delete data.pieces[orig];
    baseNewPiece(data, piece, dest, force);
    data.movable.dropped = undefined;
    callUserFunction(data.movable.events.afterNewPiece, piece.role, dest, {
      predrop: false
    });
  } else if (canPredrop(data, orig, dest)) {
    setPredrop(data, data.pieces[orig].role, dest);
  } else {
    unsetPremove(data);
    unsetPredrop(data);
  }
  delete data.pieces[orig];
  setSelected(data);
}

export function selectSquare(data: Data, key?: Key, force?: boolean): void {
  if (data.selected) {
    if (key) {
      if (data.selected === key && !data.draggable.enabled) {
        setSelected(data);
        hold.cancel();
      } else if ((data.selectable.enabled || force) && data.selected !== key) {
        if (userMove(data, data.selected, key)) data.stats.dragged = false;
      } else hold.start();
    } else {
      setSelected(data);
      hold.cancel();
    }
  } else if (key && (isMovable(data, key) || isPremovable(data, key))) {
    setSelected(data, key);
    hold.start();
  }
  if (key) callUserFunction(data.events.select, key);
}

function setSelected(data: Data, key?: Key): void {
  data.selected = key;
  if (key && isPremovable(data, key)) {
    data.premovable.dests = premove(data.pieces, key, data.premovable.castle);
  }
  else data.premovable.dests = undefined;
}

function isMovable(data: Data, orig: Key): boolean {
  var piece = data.pieces[orig];
  return piece && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color &&
        data.turnColor === piece.color
    ));
}

function canMove(data: Data, orig: Key, dest: Key): boolean {
  return orig !== dest && isMovable(data, orig) && (
    data.movable.free || (!!data.movable.dests && containsX(data.movable.dests[orig], dest))
  );
}

function canDrop(data: Data, orig: Key, dest: Key): boolean {
  var piece = data.pieces[orig];
  return piece && dest && (orig === dest || !data.pieces[dest]) && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color &&
        data.turnColor === piece.color
    ));
}


function isPremovable(data: Data, orig: Key): boolean {
  var piece = data.pieces[orig];
  return piece && data.premovable.enabled &&
  data.movable.color === piece.color &&
    data.turnColor !== piece.color;
}

function canPremove(data: Data, orig: Key, dest: Key): boolean {
  return orig !== dest &&
  isPremovable(data, orig) &&
  containsX(premove(data.pieces, orig, data.premovable.castle), dest);
}

function canPredrop(data: Data, orig: Key, dest: Key): boolean {
  var piece = data.pieces[orig];
  return piece && dest &&
  (!data.pieces[dest] || data.pieces[dest].color !== data.movable.color) &&
  data.predroppable.enabled &&
  (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
  data.movable.color === piece.color &&
    data.turnColor !== piece.color;
}

export function isDraggable(data: Data, orig: Key): boolean {
  var piece = data.pieces[orig];
  return piece && data.draggable.enabled && (
    data.movable.color === 'both' || (
      data.movable.color === piece.color && (
        data.turnColor === piece.color || data.premovable.enabled
      )
    )
  );
}

export function playPremove(data: Data): boolean {
  var move = data.premovable.current;
  if (!move) return false;
  var orig = move[0],
    dest = move[1],
    success = false;
  if (canMove(data, orig, dest)) {
    if (baseUserMove(data, orig, dest)) {
      callUserFunction(data.movable.events.after, orig, dest, {
        premove: true
      });
      success = true;
    }
  }
  unsetPremove(data);
  return success;
}

export function playPredrop(data: Data, validate: (drop: Drop) => boolean): boolean {
  let drop = data.predroppable.current,
  success = false;
  if (!drop) return false;
  if (validate(drop)) {
    var piece = {
      role: drop.role,
      color: data.movable.color as Color
    };
    if (baseNewPiece(data, piece, drop.key)) {
      callUserFunction(data.movable.events.afterNewPiece, drop.role, drop.key, {
        predrop: true
      });
      success = true;
    }
  }
  unsetPredrop(data);
  return success;
}

function cancelMove(data: Data): void {
  unsetPremove(data);
  unsetPredrop(data);
  selectSquare(data);
}

export function stop(data: Data): void {
  data.movable.color = undefined;
  data.movable.dests = undefined;
  cancelMove(data);
}

export function getKeyAtDomPos(orientation: Color, pos: NumberPair, bounds: ClientRect): Key | undefined {
  let file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
  file = orientation === 'white' ? file : 9 - file;
  let rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
  rank = orientation === 'white' ? rank : 9 - rank;
  return (file > 0 && file < 9 && rank > 0 && rank < 9) ? pos2key([file, rank]) : undefined;
}

// {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
export function getMaterialDiff(data: Data): MaterialDiff {
  let counts = {
    king: 0,
    queen: 0,
    rook: 0,
    bishop: 0,
    knight: 0,
    pawn: 0
  }, p: Piece, role: Role, c: number;
  for (var k in data.pieces) {
    p = data.pieces[k];
    counts[p.role] += ((p.color === 'white') ? 1 : -1);
  }
  let diff: MaterialDiff = {
    white: {},
    black: {}
  };
  for (role in counts) {
    c = counts[role];
    if (c > 0) diff.white[role] = c;
    else if (c < 0) diff.black[role] = -c;
  }
  return diff;
}

const pieceScores = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0
};

export function getScore(data: Data): number {
  let score = 0;
  for (var k in data.pieces) {
    score += pieceScores[data.pieces[k].role] * (data.pieces[k].color === 'white' ? 1 : -1);
  }
  return score;
}
