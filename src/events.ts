import * as drag from './drag'
import * as draw from './draw'
import { isLeftButton, isRightButton } from './util'

const startEvents = ['touchstart', 'mousedown'];
const moveEvents = ['touchmove', 'mousemove'];
const endEvents = ['touchend', 'mouseup'];

type MouchBind = (e: MouchEvent) => void;
type DataMouchBind = (d: Data, e: MouchEvent) => void;

// returns the unbind function
export default function(d: Data, el: HTMLElement): () => void {

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

  startEvents.forEach(ev => el.addEventListener(ev, onstart));

  moveEvents.forEach(ev => document.addEventListener(ev, onmove));

  endEvents.forEach(ev => document.addEventListener(ev, onend));

  return () => {
    startEvents.forEach(ev => el.removeEventListener(ev, onstart));
    moveEvents.forEach(ev => document.removeEventListener(ev, onmove));
    endEvents.forEach(ev => document.removeEventListener(ev, onend));
  };
}

function startDragOrDraw(d: Data): MouchBind {
  return e => {
    if (isRightButton(e) && d.draggable.current) {
      if (d.draggable.current.newPiece) delete d.pieces[d.draggable.current.orig];
      d.draggable.current = undefined;
      d.selected = undefined;
    } else if ((e.shiftKey || isRightButton(e)) && d.drawable.enabled) draw.start(d, e);
    else drag.start(d, e);
  };
}

function dragOrDraw(d: Data, withDrag: DataMouchBind, withDraw: DataMouchBind): MouchBind {
  return e => {
    if ((e.shiftKey || isRightButton(e)) && d.drawable.enabled) withDraw(d, e);
    else if (!d.viewOnly) withDrag(d, e);
  };
}
