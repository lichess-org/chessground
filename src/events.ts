import * as drag from './drag'
import * as draw from './draw'
import { isLeftButton, isRightButton } from './util'

const startEvents = ['touchstart', 'mousedown'];
const moveEvents = ['touchmove', 'mousemove'];
const endEvents = ['touchend', 'mouseup'];

type MouchBind = (e: MouchEvent) => void;
type StateMouchBind = (d: State, e: MouchEvent) => void;

// returns the unbind function
export default function(d: State): void {

  const start: MouchBind = startDragOrDraw(d);
  const move: MouchBind = dragOrDraw(d, drag.move, draw.move);
  const end: MouchBind = dragOrDraw(d, drag.end, draw.end);

  let onstart: MouchBind, onmove: MouchBind, onend: MouchBind;

  if (d.editable.enabled) {

    onstart = e => {
      if (d.editable.selected === 'pointer') {
        if (e.type !== 'mousemove') start(e);
      }
      else if (e.type !== 'mousemove' || isLeftButton(e)) end(e);
    };

    onmove = e => {
      if (d.editable.selected === 'pointer') move(e);
    };

    onend = e => {
      if (d.editable.selected === 'pointer') end(e);
    };

    startEvents.push('mousemove');

  } else {
    onstart = start;
    onmove = move;
    onend = end;
  }

  startEvents.forEach(ev => d.dom.element.addEventListener(ev, onstart));

  moveEvents.forEach(ev => document.addEventListener(ev, onmove));

  endEvents.forEach(ev => document.addEventListener(ev, onend));

  bindResize(d);

  const onContextMenu: MouchBind = e => {
    if (d.disableContextMenu || d.drawable.enabled) {
      e.preventDefault();
      return false;
    }
    return true;
  };
  d.dom.element.addEventListener('contextmenu', onContextMenu);
}

function startDragOrDraw(d: State): MouchBind {
  return e => {
    if (isRightButton(e) && d.draggable.current) {
      if (d.draggable.current.newPiece) delete d.pieces[d.draggable.current.orig];
      d.draggable.current = undefined;
      d.selected = undefined;
    } else if ((e.shiftKey || isRightButton(e)) && d.drawable.enabled) draw.start(d, e);
    else drag.start(d, e);
  };
}

function dragOrDraw(d: State, withDrag: StateMouchBind, withDraw: StateMouchBind): MouchBind {
  return e => {
    if ((e.shiftKey || isRightButton(e)) && d.drawable.enabled) withDraw(d, e);
    else if (!d.viewOnly) withDrag(d, e);
  };
}

function bindResize(d: State): void {

  if (!d.resizable) return;

  function recomputeBounds() {
    d.dom.bounds = d.dom.element.getBoundingClientRect();
    d.dom.redraw();
  }

  ['onscroll', 'onresize'].forEach(n => {
    const prev = window[n];
    window[n] = () => {
      prev && prev();
      recomputeBounds();
    };
  });

  document.body.addEventListener('chessground.resize', recomputeBounds, false);
}
