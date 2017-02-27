import { State } from './state'
import { key2pos, computeIsTrident } from './util'
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushes, DrawModifiers } from './draw'
import * as cg from './types'

export function createElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

interface Shape {
  shape: DrawShape;
  current: boolean;
  hash: Hash;
}

interface CustomBrushes {
  [hash: string]: DrawBrush
}

type Hash = string;

let isTrident: boolean | undefined;
let fullHashPrev: Hash = '';

export default function(state: State, root: SVGElement): void {

  const d = state.drawable,
  defsEl = root.firstChild as SVGElement,
  shapes: Shape[] = d.shapes.concat(d.autoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      current: false,
      hash: shapeHash(s, false)
    };
  });
  if (d.current) shapes.push({
    shape: d.current as DrawShape,
    current: true,
    hash: shapeHash(d.current, true)
  });

  const fullHash = shapes.map(sc => sc.hash).join('');
  if (fullHash === fullHashPrev) return;
  fullHashPrev = fullHash;

  syncDefs(d, shapes, defsEl);
  syncShapes(state, shapes, d.brushes, root, defsEl);
}

// append only. Don't try to update/remove.
function syncDefs(d: Drawable, shapes: Shape[], defsEl: SVGElement) {
  const brushes: CustomBrushes = {};
  let brush: DrawBrush;
  shapes.forEach(s => {
    if (s.shape.dest) {
      brush = d.brushes[s.shape.brush];
      if (s.shape.modifiers) brush = makeCustomBrush(brush, s.shape.modifiers);
      brushes[brush.key] = brush;
    }
  });
  const keysInDom: {[key: string]: boolean} = {};
  let el: SVGElement = defsEl.firstChild as SVGElement;
  while(el) {
    keysInDom[el.getAttribute('cgKey') as string] = true;
    el = el.nextSibling as SVGElement;
  }
  for (let key in brushes) {
    if (!keysInDom[key]) defsEl.appendChild(renderMarker(brushes[key]));
  }
}

// append and remove only. No updates.
function syncShapes(state: State, shapes: Shape[], brushes: DrawBrushes, root: SVGElement, defsEl: SVGElement): void {
  if (isTrident === undefined) isTrident = computeIsTrident();
  const bounds = state.dom.bounds(),
  hashesInDom: {[hash: string]: boolean} = {},
  toRemove: SVGElement[] = [];
  shapes.forEach(sc => { hashesInDom[sc.hash] = false; });
  if (bounds.width !== bounds.height) return;
  let el: SVGElement = defsEl.nextSibling as SVGElement, elHash: Hash;
  while(el) {
    elHash = el.getAttribute('cgHash') as Hash;
    // found a shape element that's here to stay
    if (hashesInDom.hasOwnProperty(elHash)) hashesInDom[elHash] = true;
    // or remove it
    else toRemove.push(el);
    el = el.nextSibling as SVGElement;
  }
  // remove old shapes
  toRemove.forEach(el => root.removeChild(el));
  // insert shapes that are not yet in dom
  shapes.forEach(sc => {
    if (!hashesInDom[sc.hash]) root.appendChild(renderShape(state, sc, brushes, bounds));
  });
}

function shapeHash({orig, dest, brush, piece, modifiers}: DrawShape, current: boolean): Hash {
  return [current, orig, dest, brush,
    piece && pieceHash(piece),
    modifiers && modifiersHash(modifiers)
  ].filter(x => x).join('');
}

function pieceHash(piece: DrawShapePiece): Hash {
  return [piece.color, piece.role, piece.scale].filter(x => x).join('');
}

function modifiersHash(m: DrawModifiers): Hash {
  return '' + (m.lineWidth || '');
}

function renderShape(state: State, {shape, current, hash}: Shape, brushes: DrawBrushes, bounds: ClientRect): SVGElement {
  let el: SVGElement;
  if (shape.piece) el = renderPiece(
    state.drawable.pieces.baseUrl,
    orient(key2pos(shape.orig), state.orientation),
    shape.piece,
    bounds);
  else {
    const orig = orient(key2pos(shape.orig), state.orientation);
    if (shape.orig && shape.dest) {
      let brush: DrawBrush = brushes[shape.brush];
      if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
      el = renderArrow(
        brush,
        orig,
        orient(key2pos(shape.dest), state.orientation),
        current,
        bounds);
    }
    else el = renderCircle(brushes[shape.brush], orig, current, bounds);
  }
  el.setAttribute('cgHash', hash);
  return el;
}

function renderCircle(brush: DrawBrush, pos: cg.Pos, current: boolean, bounds: ClientRect): SVGElement {
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

function renderArrow(brush: DrawBrush, orig: cg.Pos, dest: cg.Pos, current: boolean, bounds: ClientRect): SVGElement {
  const m = arrowMargin(bounds, current),
  a = pos2px(orig, bounds),
  b = pos2px(dest, bounds),
  dx = b[0] - a[0],
  dy = b[1] - a[1],
  angle = Math.atan2(dy, dx),
  xo = Math.cos(angle) * m,
  yo = Math.sin(angle) * m;
  return setAttributes(createElement('line'), {
    stroke: brush.color,
    'stroke-width': lineWidth(brush, current, bounds),
    'stroke-linecap': 'round',
    'marker-end': isTrident ? undefined : 'url(#arrowhead-' + brush.key + ')',
    opacity: opacity(brush, current),
    x1: a[0],
    y1: a[1],
    x2: b[0] - xo,
    y2: b[1] - yo
  });
}

function renderPiece(baseUrl: string, pos: cg.Pos, piece: DrawShapePiece, bounds: ClientRect): SVGElement {
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

function renderMarker(brush: DrawBrush): SVGElement {
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
  marker.setAttribute('cgKey', brush.key);
  return marker;
}

function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (let key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function orient(pos: cg.Pos, color: cg.Color): cg.Pos {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function makeCustomBrush(base: DrawBrush, modifiers: DrawModifiers): DrawBrush {
  const brush: Partial<DrawBrush> = {
    color: base.color,
    opacity: Math.round(base.opacity * 10) / 10,
    lineWidth: Math.round(modifiers.lineWidth || base.lineWidth)
  };
  brush.key = [base.key, modifiers.lineWidth].filter(x => x).join('');
  return brush as DrawBrush;
}

function circleWidth(current: boolean, bounds: ClientRect): number {
  return (current ? 3 : 4) / 512 * bounds.width;
}

function lineWidth(brush: DrawBrush, current: boolean, bounds: ClientRect): number {
  return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
}

function opacity(brush: DrawBrush, current: boolean): number {
  return (brush.opacity || 1) * (current ? 0.9 : 1);
}

function arrowMargin(bounds: ClientRect, current: boolean): number {
  return isTrident ? 0 : ((current ? 10 : 20) / 512 * bounds.width);
}

function pos2px(pos: cg.Pos, bounds: ClientRect): cg.NumberPair {
  const squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}
