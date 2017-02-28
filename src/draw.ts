import { State } from './state'
import { cancelMove, getKeyAtDomPos } from './board'
import { eventPosition, raf, isRightButton } from './util'
import * as cg from './types'

export interface DrawShape {
  orig: cg.Key;
  dest?: cg.Key;
  brush: string;
  modifiers?: DrawModifiers;
  piece?: DrawShapePiece;
}

export interface DrawShapePiece {
  role: cg.Role;
  color: cg.Color;
  scale?: number;
}

export interface DrawBrush {
  key: string;
  color: string;
  opacity: number;
  lineWidth: number
}

export interface DrawBrushes {
  [name: string]: DrawBrush;
}

export interface DrawModifiers {
  lineWidth?: number;
}

export interface Drawable {
  enabled: boolean; // allows SVG drawings
  eraseOnClick: boolean;
  onChange?: (shapes: DrawShape[]) => void;
  shapes: DrawShape[]; // user shapes
  autoShapes: DrawShape[]; // computer shapes
  current?: DrawCurrent;
  brushes: DrawBrushes;
  // drawable SVG pieces; used for crazyhouse drop
  pieces: {
    baseUrl: string
  }
}

export interface DrawCurrent {
  orig: cg.Key; // orig key of drawing
  dest?: cg.Key; // square being moused over, if != orig
  destPrev?: cg.Key; // square previously moused over
  pos: cg.NumberPair; // relative current position
  brush: string; // brush name for shape
}

const brushes = ['green', 'red', 'blue', 'yellow'];

export function start(state: State, e: cg.MouchEvent): void {
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  e.stopPropagation();
  e.preventDefault();
  cancelMove(state);
  const position = eventPosition(e);
  const orig = getKeyAtDomPos(position, state.orientation === 'white', state.dom.bounds());
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
  raf(() => {
    const cur = state.drawable.current;
    if (cur) {
      const dest = getKeyAtDomPos(cur.pos, state.orientation === 'white', state.dom.bounds());
      const newDest = (cur.orig === dest) ? undefined : dest;
      if (newDest !== cur.dest) {
        cur.dest = newDest;
        state.dom.redraw();
      }
    }
    if (cur) processDraw(state);
  });
}

export function move(state: State, e: cg.MouchEvent): void {
  if (state.drawable.current) state.drawable.current.pos = eventPosition(e);
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

function eventBrush(e: cg.MouchEvent): string {
  const a: number = e.shiftKey && isRightButton(e) ? 1 : 0;
  const b: number = e.altKey ? 2 : 0;
  return brushes[a + b];
}

function not<A>(f: (a: A) => boolean): (a: A) => boolean {
  return (x: A) => !f(x);
}

function addCircle(drawable: Drawable, cur: DrawCurrent): void {
  const orig = cur.orig;
  const sameCircle = (s: DrawShape) => s.orig === orig && !s.dest;
  const similar = drawable.shapes.filter(sameCircle)[0];
  if (similar) drawable.shapes = drawable.shapes.filter(not(sameCircle));
  if (!similar || similar.brush !== cur.brush) drawable.shapes.push({
    brush: cur.brush,
    orig: orig
  });
  onChange(drawable);
}

function addLine(drawable: Drawable, cur: DrawCurrent, dest: cg.Key): void {
  const orig = cur.orig;
  const sameLine = (s: DrawShape) => {
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
