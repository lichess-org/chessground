import { State } from './state'
import * as board from './board'
import * as util from './util'
import { clear as drawClear } from './draw'
import * as cg from './types'

export interface DragCurrent {
  orig: cg.Key; // orig key of dragging piece
  origPos: cg.Pos;
  piece: cg.Piece;
  rel: cg.NumberPair; // x; y of the piece at original position
  epos: cg.NumberPair; // initial event position
  pos: cg.NumberPair; // relative current position
  dec: cg.NumberPair; // piece center decay
  over?: cg.Key; // square being moused over
  overPrev?: cg.Key; // square previously moused over
  started: boolean; // whether the drag has started; as per the distance setting
  element: cg.PieceNode;
  newPiece?: boolean;
  previouslySelected?: cg.Key;
  originTarget: EventTarget;
}

export function start(s: State, e: cg.MouchEvent): void {
  if (e.button !== undefined && e.button !== 0) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.preventDefault();
  const asWhite = s.orientation === 'white',
  bounds = s.dom.bounds(),
  position = util.eventPosition(e),
  orig = board.getKeyAtDomPos(position, asWhite, bounds);
  if (!orig) return;
  const piece = s.pieces[orig];
  const previouslySelected = s.selected;
  if (!previouslySelected && (
    s.drawable.eraseOnClick || (!piece || piece.color !== s.turnColor)
  )) drawClear(s);
  if (s.viewOnly) return;
  const hadPremove = !!s.premovable.current;
  const hadPredrop = !!s.predroppable.current;
  s.stats.ctrlKey = e.ctrlKey;
  board.selectSquare(s, orig);
  const stillSelected = s.selected === orig;
  const element = pieceElementByKey(s, orig);
  if (piece && element && stillSelected && board.isDraggable(s, orig)) {
    const squareBounds = computeSquareBounds(orig, asWhite, bounds);
    s.draggable.current = {
      orig: orig,
      origPos: util.key2pos(orig),
      piece: piece,
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: s.draggable.centerPiece ? [
        position[0] - (squareBounds.left + squareBounds.width / 2),
        position[1] - (squareBounds.top + squareBounds.height / 2)
      ] : [0, 0],
      started: s.draggable.autoDistance && s.stats.dragged,
      element: element,
      previouslySelected: previouslySelected,
      originTarget: e.target
    };
    element.cgDragging = true;
    element.classList.add('dragging');
    // place ghost
    const ghost = s.dom.elements.ghost;
    if (ghost) {
      ghost.className = `ghost ${piece.color} ${piece.role}`;
      const translation = util.posToTranslate(util.key2pos(orig), asWhite, bounds);
      s.browser.transform(ghost, util.translate(translation));
    }
  } else {
    if (hadPremove) board.unsetPremove(s);
    if (hadPredrop) board.unsetPredrop(s);
  }
  util.raf(s.dom.redraw);
  processDrag(s);
}

function processDrag(s: State): void {
  util.raf(() => {
    const cur = s.draggable.current;
    if (!cur) return;
    // cancel animations while dragging
    if (s.animation.current && s.animation.current.plan.anims[cur.orig]) s.animation.current = undefined;
    // if moving piece is gone, cancel
    if (s.pieces[cur.orig] !== cur.piece) cancel(s);
    else {
      if (!cur.started && util.distance(cur.epos, cur.rel) >= s.draggable.distance) cur.started = true;
      if (cur.started) {
        const asWhite = s.orientation === 'white',
        bounds = s.dom.bounds();
        cur.pos = [
          cur.epos[0] - cur.rel[0],
          cur.epos[1] - cur.rel[1]
        ];
        cur.over = board.getKeyAtDomPos(cur.epos, asWhite, bounds);

        // move piece
        const translation = util.posToTranslate(cur.origPos, asWhite, bounds);
        translation[0] += cur.pos[0] + cur.dec[0];
        translation[1] += cur.pos[1] + cur.dec[1];
        s.browser.transform(cur.element, util.translate(translation));

        // move over element
        const overEl = s.dom.elements.over;
        if (overEl && cur.over && cur.over !== cur.overPrev) {
          const dests = s.movable.dests;
          if (s.movable.free ||
            util.containsX(dests && dests[cur.orig], cur.over) ||
            util.containsX(s.premovable.dests, cur.over)) {
            const squareWidth = bounds.width / 8,
            pos = util.key2pos(cur.over),
            vector: cg.NumberPair = [
              (asWhite ? pos[0] - 1 : 8 - pos[0]) * squareWidth,
              (asWhite ? 8 - pos[1] : pos[1] - 1) * squareWidth
            ];
            s.browser.transform(overEl, util.translate(vector));
          } else {
            s.browser.transform(overEl, util.translateAway);
          }
          cur.overPrev = cur.over;
        }
      }
    }
    processDrag(s);
  });
}

export function move(s: State, e: cg.MouchEvent): void {
  // support one finger touch only
  if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
    s.draggable.current.epos = util.eventPosition(e);
  }
}

export function end(s: State, e: cg.MouchEvent): void {
  const cur = s.draggable.current;
  if (!cur) return;
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === 'touchend' && cur && cur.originTarget !== e.target && !cur.newPiece) {
    s.draggable.current = undefined;
    return;
  }
  board.unsetPremove(s);
  board.unsetPredrop(s);
  const eventPos: cg.NumberPair = util.eventPosition(e);
  const dest = board.getKeyAtDomPos(eventPos, s.orientation === 'white', s.dom.bounds());
  if (dest && cur.started) {
    if (cur.newPiece) board.dropNewPiece(s, cur.orig, dest);
    else {
      s.stats.ctrlKey = e.ctrlKey;
      if (board.userMove(s, cur.orig, dest)) s.stats.dragged = true;
    }
  }
  if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
    board.unselect(s);
  else if (!s.selectable.enabled) board.unselect(s);

  removeDragElements(s);

  s.draggable.current = undefined;
  util.raf(s.dom.redraw);
}

export function cancel(s: State): void {
  if (s.draggable.current) {
    s.draggable.current = undefined;
    board.unselect(s);
    removeDragElements(s);
  }
}

function removeDragElements(s: State) {
  const e = s.dom.elements;
  if (e.over) s.browser.transform(e.over, util.translateAway);
  if (e.ghost) s.browser.transform(e.ghost, util.translateAway);
}

function computeSquareBounds(key: cg.Key, asWhite: boolean, bounds: ClientRect) {
  const pos = util.key2pos(key);
  if (!asWhite) {
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

function pieceElementByKey(s: State, key: cg.Key): cg.PieceNode | undefined {
  let el = s.dom.elements.board.firstChild as cg.PieceNode;
  while (el) {
    if (el.cgKey === key && el.tagName === 'PIECE') return el;
    el = el.nextSibling as cg.PieceNode;
  }
  return undefined;
}
