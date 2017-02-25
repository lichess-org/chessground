import { State } from './state'
import * as board from './board'
import * as util from './util'

const brushes = ['green', 'red', 'blue', 'yellow'];

function eventBrush(e: MouchEvent): string {
  const a: number = e.shiftKey && util.isRightButton(e) ? 1 : 0;
  const b: number = e.altKey ? 2 : 0;
  return brushes[a + b];
}

export function start(state: State, e: MouchEvent): void {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  board.cancelMove(state);
  const position = util.eventPosition(e);
  const orig = board.getKeyAtDomPos(state, position);
  if (!orig) return;
  state.drawable.current = {
    orig: orig,
    dest: orig, // will immediately be set to undefined by processDraw, triggering redraw
    pos: position,
    brush: eventBrush(e)
  };
  processDraw(state);
}

export function processDraw(state: State): void {
  util.raf(() => {
    const cur = state.drawable.current;
    if (cur) {
      const dest = board.getKeyAtDomPos(state, cur.pos);
      const newDest = (cur.orig === dest) ? undefined : dest;
      if (newDest !== cur.dest) {
        cur.dest = newDest;
        state.dom.redraw();
      }
    }
    if (cur) processDraw(state);
  });
}

export function move(state: State, e: MouchEvent): void {
  if (state.drawable.current) state.drawable.current.pos = util.eventPosition(e);
}

export function end(state: State): void {
  const cur = state.drawable.current;
  if (!cur) return;
  if (cur.dest) addLine(state.drawable, cur, cur.dest);
  else addCircle(state.drawable, cur);
  state.drawable.current = undefined;
  state.dom.redraw();
}

export function cancel(state: State): void {
  if (state.drawable.current) state.drawable.current = undefined;
}

export function clear(state: State): void {
  if (state.drawable.shapes.length) {
    state.drawable.shapes = [];
    state.dom.redraw();
    onChange(state.drawable);
  }
}

function not<A>(f: (a: A) => boolean): (a: A) => boolean {
  return (x: A) => !f(x);
}

function addCircle(drawable: Drawable, cur: DrawableCurrent): void {
  const orig = cur.orig;
  const sameCircle = (s: Shape) => s.orig === orig && !s.dest;
  const similar = drawable.shapes.filter(sameCircle)[0];
  if (similar) drawable.shapes = drawable.shapes.filter(not(sameCircle));
  if (!similar || similar.brush !== cur.brush) drawable.shapes.push({
    brush: cur.brush,
    orig: orig
  });
  onChange(drawable);
}

function addLine(drawable: Drawable, cur: DrawableCurrent, dest: Key): void {
  const orig = cur.orig;
  const sameLine = (s: Shape) => {
    return !!s.dest && ((s.orig === orig && s.dest === dest) || (s.dest === orig && s.orig === dest));
  };
  const exists = drawable.shapes.filter(sameLine).length > 0;
  if (exists) drawable.shapes = drawable.shapes.filter(not(sameLine));
  else drawable.shapes.push({
    brush: cur.brush,
    orig: orig,
    dest: dest
  });
  onChange(drawable);
}

function onChange(drawable: Drawable): void {
  if (drawable.onChange) drawable.onChange(drawable.shapes);
}
