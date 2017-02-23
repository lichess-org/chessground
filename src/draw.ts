import * as board from './board'
import * as util from './util'

const brushes = ['green', 'red', 'blue', 'yellow'];

function eventBrush(e: MouchEvent): string {
  const a: number = e.shiftKey && util.isRightButton(e) ? 1 : 0;
  const b: number = e.altKey ? 2 : 0;
  return brushes[a + b];
}

export function start(data: Data, e: MouchEvent): void {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  board.cancelMove(data);
  const position = util.eventPosition(e);
  const orig = board.getKeyAtDomPos(data, position);
  if (!orig) return;
  data.drawable.current = {
    orig: orig,
    dest: undefined,
    pos: position,
    brush: eventBrush(e)
  };
  processDraw(data);
}

export function processDraw(data: Data): void {
  util.raf(() => {
    const cur = data.drawable.current;
    if (cur) {
      const dest = board.getKeyAtDomPos(data, cur.pos);
      if (cur.orig === dest) cur.dest = undefined;
      else cur.dest = dest;
    }
    data.dom.redraw();
    if (cur) processDraw(data);
  });
}

export function move(data: Data, e: MouchEvent): void {
  if (data.drawable.current) data.drawable.current.pos = util.eventPosition(e);
}

export function end(data: Data): void {
  const cur = data.drawable.current;
  if (!cur) return;
  if (cur.dest) addLine(data.drawable, cur, cur.dest);
  else addCircle(data.drawable, cur);
  data.drawable.current = undefined;
  data.dom.redraw();
}

export function cancel(data: Data): void {
  if (data.drawable.current) data.drawable.current = undefined;
}

export function clear(data: Data): void {
  if (data.drawable.shapes.length) {
    data.drawable.shapes = [];
    data.dom.redraw();
    onChange(data.drawable);
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
