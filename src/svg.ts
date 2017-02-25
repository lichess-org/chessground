import { State } from './state'
import { key2pos, computeIsTrident } from './util'

export function createElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

export default function(state: State, el: SVGElement): void {

  el.innerHTML = '';

  if (state.browser.isTrident === undefined) state.browser.isTrident = computeIsTrident();

  const d = state.drawable, allShapes = d.shapes.concat(d.autoShapes);

  if (!allShapes.length && !d.current) return;

  const usedBrushes: Brush[] = computeUsedBrushes(d, allShapes, d.current as Shape | undefined);

  const renderedShapes: SVGElement[] = allShapes.map((s, i) => renderShape(state, false, s, i));
  // if (d.current) renderedShapes.push(renderShape(state, true, d.current as Shape, 9999));

  console.log(renderedShapes);

  el.appendChild(renderDefs(usedBrushes));

  for (let i in renderedShapes) el.appendChild(renderedShapes[i]);
}

function renderShape(state: State, current: boolean, shape: Shape, i: number): SVGElement {
  if (shape.piece) return renderPiece(
    state.drawable.pieces.baseUrl,
    orient(key2pos(shape.orig), state.orientation),
    shape.piece,
    state.dom.bounds);
  else {
    let brush = state.drawable.brushes[shape.brush];
    if (shape.brushModifiers) brush = makeCustomBrush(brush, shape.brushModifiers, i);
    const orig = orient(key2pos(shape.orig), state.orientation);
    if (shape.orig && shape.dest) return renderArrow(
      state.dom,
      state.browser,
      brush,
      orig,
      orient(key2pos(shape.dest), state.orientation),
      current);
    else return renderCircle(brush, orig, current, state.dom.bounds);
  }
}

function renderCircle(brush: Brush, pos: Pos, current: boolean, bounds: ClientRect): SVGElement {
  const o = pos2px(pos, bounds),
  width = circleWidth(current, bounds),
  radius = bounds.width / 16;
  return setAttributes(createElement('circle'), {
    stroke: brush.color,
    'stroke-width': width,
    fill: 'none',
    opacity: opacity(brush, current),
    cx: o[0],
    cy: o[1],
    r: radius - width / 2
  });
}

function renderArrow(dom: Dom, browser: Browser, brush: Brush, orig: Pos, dest: Pos, current: boolean): SVGElement {
  const m = arrowMargin(dom, browser, current),
  a = pos2px(orig, dom.bounds),
  b = pos2px(dest, dom.bounds),
  dx = b[0] - a[0],
  dy = b[1] - a[1],
  angle = Math.atan2(dy, dx),
  xo = Math.cos(angle) * m,
  yo = Math.sin(angle) * m;
  return setAttributes(createElement('line'), {
    stroke: brush.color,
    'stroke-width': lineWidth(brush, current, dom.bounds),
    'stroke-linecap': 'round',
    'marker-end': browser.isTrident ? undefined : 'url(#arrowhead-' + brush.key + ')',
    opacity: opacity(brush, current),
    x1: a[0],
    y1: a[1],
    x2: b[0] - xo,
    y2: b[1] - yo
  });
}

function renderPiece(baseUrl: string, pos: Pos, piece: ShapePiece, bounds: ClientRect): SVGElement {
  const o = pos2px(pos, bounds),
  size = bounds.width / 8 * (piece.scale || 1),
  name = piece.color[0] + (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
  return setAttributes(createElement('image'), {
    className: `${piece.role} ${piece.color}`,
    x: o[0] - size / 2,
    y: o[1] - size / 2,
    width: size,
    height: size,
    href: baseUrl + name + '.svg'
  });
}

function renderDefs(brushes: Brush[]): SVGElement {
  const e = createElement('defs');
  brushes.forEach(brush => e.appendChild(renderMarker(brush)));
  return e;
}

function renderMarker(brush: Brush): SVGElement {
  const marker = setAttributes(createElement('marker'), {
    id: 'arrowhead-' + brush.key,
    orient: 'auto',
    markerWidth: 4,
    markerHeight: 8,
    refX: 2.05,
    refY: 2.01
  });
  marker.appendChild(setAttributes(createElement('path'), {
    d: 'M0,0 V4 L3,2 Z',
    fill: brush.color
  }));
  return marker;
}

function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (let key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function orient(pos: Pos, color: Color): Pos {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
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

function arrowMargin(dom: Dom, browser: Browser, current: boolean): number {
  return browser.isTrident ? 0 : ((current ? 10 : 20) / 512 * dom.bounds.width);
}

function pos2px(pos: Pos, bounds: ClientRect): NumberPair {
  const squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}
