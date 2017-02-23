import * as board from './board'
import * as util from './util'
import * as draw from './draw'

let originTarget: EventTarget | undefined;

function hashPiece(piece?: Piece): string {
  return piece ? piece.color + piece.role : '';
}

function computeSquareBounds(data: Data, key: Key) {
  const pos = util.key2pos(key), bounds = data.dom.bounds;
  if (data.orientation !== 'white') {
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

export function start(data: Data, e: MouchEvent): void {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  originTarget = e.target;
  const previouslySelected = data.selected;
  const position = util.eventPosition(e);
  const orig = board.getKeyAtDomPos(data, position);
  if (!orig) return;
  const piece = data.pieces[orig];
  if (!previouslySelected && (
    data.drawable.eraseOnClick || (!piece || piece.color !== data.turnColor)
  )) draw.clear(data);
  if (data.viewOnly) return;
  const hadPremove = !!data.premovable.current;
  const hadPredrop = !!data.predroppable.current;
  data.stats.ctrlKey = e.ctrlKey;
  board.selectSquare(data, orig);
  var stillSelected = data.selected === orig;
  if (piece && stillSelected && board.isDraggable(data, orig)) {
    const squareBounds = computeSquareBounds(data, orig);
    data.draggable.current = {
      previouslySelected: previouslySelected,
      orig: orig,
      pieceHash: hashPiece(piece),
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: data.draggable.centerPiece ? [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ] : [0, 0],
      started: data.draggable.autoDistance && data.stats.dragged
    };
  } else {
    if (hadPremove) board.unsetPremove(data);
    if (hadPredrop) board.unsetPredrop(data);
  }
  processDrag(data);
}

function processDrag(data: Data): void {
  util.raf(() => {
    var cur = data.draggable.current;
    if (cur) {
      // cancel animations while dragging
      if (data.animation.current && data.animation.current.plan.anims[cur.orig])
      data.animation.current = undefined;
      // if moving piece is gone, cancel
      if (hashPiece(data.pieces[cur.orig]) !== cur.pieceHash) cancel(data);
      else {
        if (!cur.started && util.distance(cur.epos, cur.rel) >= data.draggable.distance)
        cur.started = true;
        if (cur.started) {
          cur.pos = [
            cur.epos[0] - cur.rel[0],
            cur.epos[1] - cur.rel[1]
          ];
          cur.over = board.getKeyAtDomPos(data, cur.epos);
        }
      }
    }
    data.dom.redraw();
    if (cur) processDrag(data);
  });
}

export function move(data: Data, e: TouchEvent): void {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  if (data.draggable.current) data.draggable.current.epos = util.eventPosition(e);
}

export function end(data: Data, e: TouchEvent): void {
  const cur = data.draggable.current;
  if (!cur && (!data.editable.enabled || data.editable.selected === 'pointer')) return;
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === 'touchend' && originTarget !== e.target && cur && !cur.newPiece) {
    data.draggable.current = undefined;
    return;
  }
  board.unsetPremove(data);
  board.unsetPredrop(data);
  const eventPos: NumberPair = util.eventPosition(e);
  const dest = board.getKeyAtDomPos(data, eventPos);
  if (dest) {
    if (data.editable.enabled && data.editable.selected !== 'pointer') {
      if (data.editable.selected === 'trash') {
        delete data.pieces[dest];
        data.dom.redraw();
      } else {
        // where pieces to be dropped live. Fix me.
        const key = 'a0';
        data.pieces[key] = data.editable.selected as Piece;
        board.dropNewPiece(data, key, dest, true);
      }
    } else if (cur && cur.started) {
      if (cur.newPiece) board.dropNewPiece(data, cur.orig, dest);
      else {
        if (cur.orig !== dest) data.movable.dropped = [cur.orig, dest];
        data.stats.ctrlKey = e.ctrlKey;
        if (board.userMove(data, cur.orig, dest)) data.stats.dragged = true;
      }
    }
  }
  if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
    board.unselect(data);
  else if (!data.selectable.enabled) board.unselect(data);
  data.draggable.current = undefined;
}

export function cancel(data: Data): void {
  if (data.draggable.current) {
    data.draggable.current = undefined;
    board.unselect(data);
  }
}
