import { State } from './state'
import * as drag from './drag'
import * as draw from './draw'
import { isRightButton, raf } from './util'
import * as cg from './types'

type MouchBind = (e: cg.MouchEvent) => void;
type StateMouchBind = (d: State, e: cg.MouchEvent) => void;

// returns the unbind function
export default function events(s: State, firstTime: boolean, redrawAll: cg.Redraw): void {

  const boardEl = s.dom.elements.board;
  const onstart: MouchBind = startDragOrDraw(s);
  const onmove: MouchBind = dragOrDraw(s, drag.move, draw.move);
  const onend: MouchBind = dragOrDraw(s, drag.end, draw.end);

  if (!s.viewOnly) {
    ['touchstart', 'mousedown'].forEach(ev => boardEl.addEventListener(ev, onstart));
  }

  if (s.disableContextMenu || s.drawable.enabled) {
    boardEl.addEventListener('contextmenu', e => {
      e.preventDefault();
      return false;
    });
  }

  if (firstTime) {
    if (!s.viewOnly) {
      ['touchmove', 'mousemove'].forEach(ev => document.addEventListener(ev, onmove));
      ['touchend', 'mouseup'].forEach(ev => document.addEventListener(ev, onend));
    }
    if (s.resizable) document.body.addEventListener('chessground.resize', function() {
      s.dom.bounds.clear();
      raf(redrawAll);
    }, false);
    ['onscroll', 'onresize'].forEach((n: cg.WindowEvent) => {
      const prev = window[n];
      window[n] = e => {
        prev && prev.apply(window, e);
        s.dom.bounds.clear();
      };
    });
  }
}

function startDragOrDraw(s: State): MouchBind {
  return e => {
    if (isRightButton(e) && s.draggable.current) {
      if (s.draggable.current.newPiece) delete s.pieces[s.draggable.current.orig];
      s.draggable.current = undefined;
      s.selected = undefined;
    } else if ((e.shiftKey || isRightButton(e)) && s.drawable.enabled) draw.start(s, e);
    else drag.start(s, e);
  };
}

function dragOrDraw(s: State, withDrag: StateMouchBind, withDraw: StateMouchBind): MouchBind {
  return e => {
    if ((e.shiftKey || isRightButton(e)) && s.drawable.enabled) withDraw(s, e);
    else if (!s.viewOnly) withDrag(s, e);
  };
}
