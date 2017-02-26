import { State } from './state'
import { key2pos, computeIsTrident } from './util'
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushModifiers } from './draw'
import * as cg from './types.d'

export function createElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

interface Shape {
  shape: DrawShape;
  current: boolean;
  hash: Hash;
}

type Hash = string;

let isTrident: boolean | undefined;
let fullHashPrev: Hash = '';

export default function(state: State, root: SVGElement): void {

  const d = state.drawable,
  allShapes: Shape[] = d.shapes.concat(d.autoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      current: false,
      hash: shapeHash(s, false)
    };
  });

  if (d.current) allShapes.push({
    shape: d.current as DrawShape,
    current: true,
    hash: shapeHash(d.current, true)
  });

  const fullHash = allShapes.map(sc => sc.hash).join('');
  if (fullHash === fullHashPrev) return;
  fullHashPrev = fullHash;

  if (isTrident === undefined) isTrident = computeIsTrident();

  const usedBrushes: DrawBrush[] = computeUsedBrushes(d, allShapes),
  hashesInDom: {[hash: string]: boolean} = {};

  allShapes.forEach(sc => { hashesInDom[sc.hash] = false; });

  let needsDefs = usedBrushes.length > 0,
  el = root.firstChild as cg.LolNode,
  toDelete: SVGElement[] = [],
  elHash;

  while(el) {
    if (el.tagName === 'DEFS') {
      if (needsDefs) {
        root.replaceChild(renderDefs(usedBrushes), el);
        needsDefs = false;
      }
    } else {
      elHash = el.getAttribute('cgHash');
      // found a shape element that's here to stay
      if (hashesInDom.hasOwnProperty(elHash)) hashesInDom[elHash] = true;
      // or delete it
      else toDelete.push(el);
    }
    el = el.nextSibling;
  }

  // remove old shapes and defs
  toDelete.forEach(el => root.removeChild(el));

  // insert new defs
  if (needsDefs) root.appendChild(renderDefs(usedBrushes));

  // insert shapes that are not yet in dom
  allShapes.forEach(sc => {
    if (!hashesInDom[sc.hash]) {
      el = renderShape(state, sc, 9876);
      el.setAttribute('cgHash', sc.hash);
      root.appendChild(el);
    }
  });
}

function shapeHash({orig, dest, brush, piece, brushModifiers}: DrawShape, current: boolean): Hash {
  return [current, orig, dest, brush,
    piece && pieceHash(piece),
    brushModifiers && brushModifiersHash(brushModifiers)
  ].filter(x => x).join('');
}

function pieceHash(piece: DrawShapePiece): Hash {
  return [piece.color, piece.role, piece.scale].filter(x => x).join('');
}

function brushModifiersHash(m: DrawBrushModifiers): Hash {
  return [m.color, m.opacity, m.lineWidth].filter(x => x).join('');
}

function renderShape(state: State, {shape, current}: Shape, i: number): SVGElement {
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
      brush,
      orig,
      orient(key2pos(shape.dest), state.orientation),
      current);
    else return renderCircle(brush, orig, current, state.dom.bounds);
  }
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

function renderArrow(dom: cg.Dom, brush: DrawBrush, orig: cg.Pos, dest: cg.Pos, current: boolean): SVGElement {
  const m = arrowMargin(dom, current),
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

function renderDefs(brushes: DrawBrush[]): SVGElement {
  const e = createElement('defs');
  brushes.forEach(brush => e.appendChild(renderMarker(brush)));
  return e;
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
  return marker;
}

function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (let key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function orient(pos: cg.Pos, color: cg.Color): cg.Pos {
  return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}

function makeCustomBrush(base: DrawBrush, modifiers: DrawBrushModifiers, i: number): DrawBrush {
  return {
    key: 'cb_' + i,
    color: modifiers.color || base.color,
    opacity: modifiers.opacity || base.opacity,
    lineWidth: modifiers.lineWidth || base.lineWidth
  };
}

function computeUsedBrushes(d: Drawable, shapes: Shape[]): DrawBrush[] {
  const brushes = [], keys = [];
  let i: any, shape: DrawShape, brushKey: string;
  for (i in shapes) {
    shape = shapes[i].shape;
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

function lineWidth(brush: DrawBrush, current: boolean, bounds: ClientRect): number {
  return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
}

function opacity(brush: DrawBrush, current: boolean): number {
  return (brush.opacity || 1) * (current ? 0.9 : 1);
}

function arrowMargin(dom: cg.Dom, current: boolean): number {
  return isTrident ? 0 : ((current ? 10 : 20) / 512 * dom.bounds.width);
}

function pos2px(pos: cg.Pos, bounds: ClientRect): cg.NumberPair {
  const squareSize = bounds.width / 8;
  return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}
