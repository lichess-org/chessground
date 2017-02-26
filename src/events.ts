import { State } from './state'
import * as drag from './drag'
import * as draw from './draw'
import { isLeftButton, isRightButton, raf } from './util'
import * as cg from './types'

const startEvents = ['touchstart', 'mousedown'];
const moveEvents = ['touchmove', 'mousemove'];
const endEvents = ['touchend', 'mouseup'];

type MouchBind = (e: cg.MouchEvent) => void;
type StateMouchBind = (d: State, e: cg.MouchEvent) => void;

// returns the unbind function
export default function(s: State, firstTime: boolean): void {

  const boardEl = s.dom.elements.board;
  const start: MouchBind = startDragOrDraw(s);
  const move: MouchBind = dragOrDraw(s, drag.move, draw.move);
  const end: MouchBind = dragOrDraw(s, drag.end, draw.end);

  let onstart: MouchBind, onmove: MouchBind, onend: MouchBind;

  if (s.editable.enabled) {

    onstart = e => {
      if (s.editable.selected === 'pointer') {
        if (e.type !== 'mousemove') start(e);
      }
      else if (e.type !== 'mousemove' || isLeftButton(e)) end(e);
    };

    onmove = e => {
      if (s.editable.selected === 'pointer') move(e);
    };

    onend = e => {
      if (s.editable.selected === 'pointer') end(e);
    };

    startEvents.push('mousemove');

  } else {
    onstart = start;
    onmove = move;
    onend = end;
  }

  startEvents.forEach(ev => boardEl.addEventListener(ev, onstart));

  if (s.disableContextMenu || s.drawable.enabled) {
    boardEl.addEventListener('contextmenu', e => {
      e.preventDefault();
      return false;
    });
  }

  if (firstTime) {
    if (!s.viewOnly) {
      moveEvents.forEach(ev => document.addEventListener(ev, onmove));
      endEvents.forEach(ev => document.addEventListener(ev, onend));
    }
    if (s.resizable) document.body.addEventListener('chessground.resize', function() {
      s.dom.bounds.clear();
      raf(s.dom.redraw);
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
