import * as board from './board'
import * as util from './util'
import * as draw from './draw'

let originTarget: EventTarget | undefined;

function hashPiece(piece?: Piece): string {
  return piece ? piece.color + piece.role : '';
}

function computeSquareBounds(state: State, key: Key) {
  const pos = util.key2pos(key), bounds = state.dom.bounds;
  if (state.orientation !== 'white') {
    pos[0] = 9 - pos[0];
    pos[1] = 9 - pos[1];
  }
  return {
    left: bounds.left + bounds.width * (pos[0] - 1) / 8,
    top: bounds.top + bounds.height * (8 - pos[1]) / 8,
    width: bounds.width / 8,
    height: bounds.height / 8
  };
}

export function start(state: State, e: MouchEvent): void {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  originTarget = e.target;
  const previouslySelected = state.selected;
  const position = util.eventPosition(e);
  const orig = board.getKeyAtDomPos(state, position);
  if (!orig) return;
  const piece = state.pieces[orig];
  if (!previouslySelected && (
    state.drawable.eraseOnClick || (!piece || piece.color !== state.turnColor)
  )) draw.clear(state);
  if (state.viewOnly) return;
  const hadPremove = !!state.premovable.current;
  const hadPredrop = !!state.predroppable.current;
  state.stats.ctrlKey = e.ctrlKey;
  board.selectSquare(state, orig);
  const stillSelected = state.selected === orig;
  if (piece && stillSelected && board.isDraggable(state, orig)) {
    const squareBounds = computeSquareBounds(state, orig);
    state.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      pieceHash: hashPiece(piece),
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: state.draggable.centerPiece ? [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ] : [0, 0],
      started: state.draggable.autoDistance && state.stats.dragged
    };
  } else {
    if (hadPremove) board.unsetPremove(state);
    if (hadPredrop) board.unsetPredrop(state);
  }
  processDrag(state);
}

function processDrag(state: State): void {
  util.raf(() => {
    const cur = state.draggable.current;
    if (cur) {
      // cancel animations while dragging
      if (state.animation.current && state.animation.current.plan.anims[cur.orig])
      state.animation.current = undefined;
      // if moving piece is gone, cancel
      if (hashPiece(state.pieces[cur.orig]) !== cur.pieceHash) cancel(state);
      else {
        if (!cur.started && util.distance(cur.epos, cur.rel) >= state.draggable.distance)
        cur.started = true;
        if (cur.started) {
          cur.pos = [
            cur.epos[0] - cur.rel[0],
            cur.epos[1] - cur.rel[1]
          ];
          cur.over = board.getKeyAtDomPos(state, cur.epos);
        }
      }
    }
    state.dom.redraw();
    if (cur) processDrag(state);
  });
}

export function move(state: State, e: TouchEvent): void {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  if (state.draggable.current) state.draggable.current.epos = util.eventPosition(e);
}

export function end(state: State, e: TouchEvent): void {
  const cur = state.draggable.current;
  if (!cur && (!state.editable.enabled || state.editable.selected === 'pointer')) return;
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === 'touchend' && originTarget !== e.target && cur && !cur.newPiece) {
    state.draggable.current = undefined;
    return;
  }
  board.unsetPremove(state);
  board.unsetPredrop(state);
  const eventPos: NumberPair = util.eventPosition(e);
  const dest = board.getKeyAtDomPos(state, eventPos);
  if (dest) {
    if (state.editable.enabled && state.editable.selected !== 'pointer') {
      if (state.editable.selected === 'trash') {
        delete state.pieces[dest];
        state.dom.redraw();
      } else {
        // where pieces to be dropped live. Fix me.
        const key = 'a0';
        state.pieces[key] = state.editable.selected as Piece;
        board.dropNewPiece(state, key, dest, true);
      }
    } else if (cur && cur.started) {
      if (cur.newPiece) board.dropNewPiece(state, cur.orig, dest);
      else {
        if (cur.orig !== dest) state.movable.dropped = [cur.orig, dest];
        state.stats.ctrlKey = e.ctrlKey;
        if (board.userMove(state, cur.orig, dest)) state.stats.dragged = true;
      }
    }
  }
  if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
    board.unselect(state);
  else if (!state.selectable.enabled) board.unselect(state);
  state.draggable.current = undefined;
}

export function cancel(state: State): void {
  if (state.draggable.current) {
    state.draggable.current = undefined;
    board.unselect(state);
  }
}
