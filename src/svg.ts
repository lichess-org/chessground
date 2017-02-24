import { State } from './state'
import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode'
import { key2pos, isTrident } from './util'

export default function(state: State): VNode | undefined {
  const d = state.drawable;
  const allShapes = d.shapes.concat(d.autoShapes);
  if (!allShapes.length && !d.current) return;
  if (state.dom.bounds.width !== state.dom.bounds.height) return;
  const usedBrushes = computeUsedBrushes(d, allShapes, d.current as Shape | undefined);
  const renderedShapes = allShapes.map((s, i) => renderShape(state, false, s, i));
  if (d.current) renderedShapes.push(renderShape(state, true, d.current as Shape, 9999));
  return h('svg', { key: 'svg' }, [ defs(usedBrushes), ...renderedShapes ]);
}

function circle(brush: Brush, pos: Pos, current: boolean, bounds: ClientRect): VNode {
  const o = pos2px(pos, bounds);
  const width = circleWidth(current, bounds);
  const radius = bounds.width / 16;
  return h('circle', {
    attrs: {
      stroke: brush.color,
      'stroke-width': width,
      fill: 'none',
      opacity: opacity(brush, current),
      cx: o[0],
      cy: o[1],
      r: radius - width / 2
    }
  });
}

function arrow(brush: Brush, orig: Pos, dest: Pos, current: boolean, bounds: ClientRect): VNode {
  const m = arrowMargin(current, bounds),
  a = pos2px(orig, bounds),
  b = pos2px(dest, bounds),
  dx = b[0] - a[0],
  dy = b[1] - a[1],
  angle = Math.atan2(dy, dx),
  xo = Math.cos(angle) * m,
  yo = Math.sin(angle) * m;
  return h('line', {
    attrs: {
      stroke: brush.color,
      'stroke-width': lineWidth(brush, current, bounds),
      'stroke-linecap': 'round',
      'marker-end': isTrident() ? null : 'url(#arrowhead-' + brush.key + ')',
      opacity: opacity(brush, current),
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo
    }
  });
}

function piece(baseUrl: string, pos: Pos, piece: ShapePiece, bounds: ClientRect): VNode {
  const o = pos2px(pos, bounds);
  const size = bounds.width / 8 * (piece.scale || 1);
  const name = piece.color[0] + (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
  return h('image', {
    attrs: {
      class: `${piece.color} ${piece.role}`, // can't use classes because IE
      x: o[0] - size / 2,
      y: o[1] - size / 2,
      width: size,
      height: size,
      href: baseUrl + name + '.svg'
    }
  });
}

function defs(brushes: Brush[]): VNode {
  return h('defs', brushes.map(marker));
}

function marker(brush: Brush): VNode {
  return h('marker', {
    attrs: {
      id: 'arrowhead-' + brush.key,
      orient: 'auto',
      markerWidth: 4,
      markerHeight: 8,
      refX: 2.05,
      refY: 2.01
    }
  }, [
    h('path', {
      attrs: {
        d: 'M0,0 V4 L3,2 Z',
        fill: brush.color
      }
    })
  ]);
}

function orient(pos: Pos, color: Color): Pos {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function renderShape(state: State, current: boolean, shape: Shape, i: number): VNode {
  if (shape.piece) return piece(
    state.drawable.pieces.baseUrl,
    orient(key2pos(shape.orig), state.orientation),
    shape.piece,
    state.dom.bounds);
  else {
    let brush = state.drawable.brushes[shape.brush];
    if (shape.brushModifiers) brush = makeCustomBrush(brush, shape.brushModifiers, i);
    const orig = orient(key2pos(shape.orig), state.orientation);
    if (shape.orig && shape.dest) return arrow(
      brush,
      orig,
      orient(key2pos(shape.dest), state.orientation),
      current, state.dom.bounds);
    else return circle(brush, orig, current, state.dom.bounds);
  }
}

function makeCustomBrush(base: Brush, modifiers: BrushModifiers, i: number): Brush {
  return {
    key: 'cb_' + i,
    color: modifiers.color || base.color,
    opacity: modifiers.opacity || base.opacity,
    lineWidth: modifiers.lineWidth || base.lineWidth
  };
}

function computeUsedBrushes(d: Drawable, drawn: Shape[], current?: Shape): Brush[] {
  const brushes = [],
  keys = [],
  shapes = (current && current.dest) ? drawn.concat(current) : drawn;
  let i: any, shape: Shape, brushKey: string;
  for (i in shapes) {
    shape = shapes[i];
    if (!shape.dest) continue;
    brushKey = shape.brush;
    if (shape.brushModifiers)
    brushes.push(makeCustomBrush(d.brushes[brushKey], shape.brushModifiers, i));
    else if (keys.indexOf(brushKey) === -1) {
      brushes.push(d.brushes[brushKey]);
      keys.push(brushKey);
    }
  }
  return brushes;
}

function circleWidth(current: boolean, bounds: ClientRect): number {
  return (current ? 3 : 4) / 512 * bounds.width;
}

function lineWidth(brush: Brush, current: boolean, bounds: ClientRect): number {
  return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
}

function opacity(brush: Brush, current: boolean): number {
  return (brush.opacity || 1) * (current ? 0.9 : 1);
}

function arrowMargin(current: boolean, bounds: ClientRect): number {
  return isTrident() ? 0 : ((current ? 10 : 20) / 512 * bounds.width);
}

function pos2px(pos: Pos, bounds: ClientRect): NumberPair {
  const squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}
