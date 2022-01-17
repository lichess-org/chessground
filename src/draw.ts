import { State } from './state.js';
import { unselect, cancelMove, getKeyAtDomPos, getSnappedKeyAtDomPos, whitePov } from './board.js';
import { eventPosition, isRightButton } from './util.js';
import * as cg from './types.js';

export interface DrawShape {
  orig: cg.Key;
  dest?: cg.Key;
  brush?: string;
  modifiers?: DrawModifiers;
  piece?: DrawShapePiece;
  customSvg?: string;
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
  lineWidth: number;
}

export interface DrawBrushes {
  [name: string]: DrawBrush;
}

export interface DrawModifiers {
  lineWidth?: number;
}

export interface Drawable {
  enabled: boolean; // can draw
  visible: boolean; // can view
  defaultSnapToValidMove: boolean;
  eraseOnClick: boolean;
  onChange?: (shapes: DrawShape[]) => void;
  shapes: DrawShape[]; // user shapes
  autoShapes: DrawShape[]; // computer shapes
  current?: DrawCurrent;
  brushes: DrawBrushes;
  prevSvgHash: string;
}

export interface DrawCurrent {
  orig: cg.Key; // orig key of drawing
  dest?: cg.Key; // shape dest, or undefined for circle
  mouseSq?: cg.Key; // square being moused over
  pos: cg.NumberPair; // relative current position
  brush: string; // brush name for shape
  snapToValidMove: boolean; // whether to snap to valid piece moves
}

const brushes = ['green', 'red', 'blue', 'yellow'];

export function start(state: State, e: cg.MouchEvent): void {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return;
  e.stopPropagation();
  e.preventDefault();
  e.ctrlKey ? unselect(state) : cancelMove(state);
  const pos = eventPosition(e)!,
    orig = getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
  if (!orig) return;
  state.drawable.current = {
    orig,
    pos,
    brush: eventBrush(e),
    snapToValidMove: state.drawable.defaultSnapToValidMove,
  };

  processDraw(state);
}

export function processDraw(state: State): void {
  requestAnimationFrame(() => {
    const cur = state.drawable.current;
    if (cur) {
      const keyAtDomPos = getKeyAtDomPos(cur.pos, whitePov(state), state.dom.bounds());
      if (!keyAtDomPos) {
        cur.snapToValidMove = false;
      }
      const mouseSq = cur.snapToValidMove
        ? getSnappedKeyAtDomPos(cur.orig, cur.pos, whitePov(state), state.dom.bounds())
        : keyAtDomPos;
      if (mouseSq !== cur.mouseSq) {
        cur.mouseSq = mouseSq;
        cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
        state.dom.redrawNow();
      }
      processDraw(state);
    }
  });
}

export function move(state: State, e: cg.MouchEvent): void {
  if (state.drawable.current) state.drawable.current.pos = eventPosition(e)!;
}

export function end(state: State): void {
  const cur = state.drawable.current;
  if (cur) {
    if (cur.mouseSq) addShape(state.drawable, cur);
    cancel(state);
  }
}

export function cancel(state: State): void {
  if (state.drawable.current) {
    state.drawable.current = undefined;
    state.dom.redraw();
  }
}

export function clear(state: State): void {
  if (state.drawable.shapes.length) {
    state.drawable.shapes = [];
    state.dom.redraw();
    onChange(state.drawable);
  }
}

function eventBrush(e: cg.MouchEvent): string {
  const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
  const modB = e.altKey || e.metaKey || e.getModifierState?.('AltGraph');
  return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
}

function addShape(drawable: Drawable, cur: DrawCurrent): void {
  const sameShape = (s: DrawShape) => s.orig === cur.orig && s.dest === cur.dest;
  const similar = drawable.shapes.find(sameShape);
  if (similar) drawable.shapes = drawable.shapes.filter(s => !sameShape(s));
  if (!similar || similar.brush !== cur.brush) drawable.shapes.push(cur);
  onChange(drawable);
}

function onChange(drawable: Drawable): void {
  if (drawable.onChange) drawable.onChange(drawable.shapes);
}
