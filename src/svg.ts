import { State } from './state.js';
import { key2pos } from './util.js';
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushes, DrawModifiers } from './draw.js';
import { SyncableShape, Hash, syncShapes } from './sync.js';
import * as cg from './types.js';

export function createElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

type CustomBrushes = Map<string, DrawBrush>; // by hash

type ArrowDests = Map<cg.Key, number>; // how many arrows land on a square
type AngleSlots = Set<number>; // angle slots from 0 to 15, for label adjustments
type ArrowSlots = Map<cg.Key | undefined, AngleSlots>; // angle slots per dest

export function renderSvg(state: State, svg: SVGElement, customSvg: SVGElement): void {
  const d = state.drawable,
    curD = d.current,
    cur = curD && curD.mouseSq ? (curD as DrawShape) : undefined,
    arrowDests: ArrowDests = new Map(),
    arrowSlots: ArrowSlots = new Map(),
    bounds = state.dom.bounds(),
    nonPieceAutoShapes = d.autoShapes.filter(autoShape => !autoShape.piece);

  for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
    if (!s.dest) continue;
    const sources = arrowSlots.get(s.dest) ?? new Set();
    const from = pos2user(orient(key2pos(s.orig), state.orientation), bounds),
      to = pos2user(orient(key2pos(s.dest), state.orientation), bounds);
    sources.add(moveAngle(from, to, state.orientation === 'white'));
    arrowSlots.set(s.dest, sources);
    arrowDests.set(s.dest, (arrowDests.get(s.dest) ?? 0) + 1);
  }

  const shapes: SyncableShape[] = d.shapes.concat(nonPieceAutoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      current: false,
      hash: shapeHash(s, arrowDests, false, bounds),
    };
  });
  if (cur)
    shapes.push({
      shape: cur,
      current: true,
      hash: shapeHash(cur, arrowDests, true, bounds),
    });

  const fullHash = shapes.map(sc => sc.hash).join(';');
  if (fullHash === state.drawable.prevSvgHash) return;
  state.drawable.prevSvgHash = fullHash;

  /*
    -- DOM hierarchy --
    <svg class="cg-shapes">      (<= svg)
      <defs>
        ...(for brushes)...
      </defs>
      <g>
        ...(for arrows and circles)...
      </g>
    </svg>
    <svg class="cg-custom-svgs"> (<= customSvg)
      <g>
        ...(for custom svgs)...
      </g>
    </svg>
  */

  const defsEl = svg.querySelector('defs') as SVGElement;
  const shapesEl = svg.querySelector('g') as SVGElement;
  const customSvgsEl = customSvg.querySelector('g') as SVGElement;

  syncDefs(d, shapes, defsEl);
  const renderer = (s: SyncableShape) =>
    renderShape(state, s, d.brushes, arrowDests, bounds, arrowSlots.get(s.shape.dest));

  syncShapes(
    shapes.filter(s => !s.shape.customSvg),
    shapesEl,
    renderer,
  );
  syncShapes(
    shapes.filter(s => s.shape.customSvg),
    customSvgsEl,
    renderer,
  );
}

// append only. Don't try to update/remove.
function syncDefs(d: Drawable, shapes: SyncableShape[], defsEl: SVGElement) {
  const brushes: CustomBrushes = new Map();
  let brush: DrawBrush;
  for (const s of shapes) {
    if (s.shape.dest) {
      brush = d.brushes[s.shape.brush];
      if (s.shape.modifiers) brush = makeCustomBrush(brush, s.shape.modifiers);
      if (s.shape.modifiers?.hilite) brushes.set('hilite', { key: 'hilite', color: 'white', opacity: 1, lineWidth: 1 });
      brushes.set(brush.key, brush);
    }
  }
  const keysInDom = new Set();
  let el: SVGElement | undefined = defsEl.firstChild as SVGElement;
  while (el) {
    keysInDom.add(el.getAttribute('cgKey'));
    el = el.nextSibling as SVGElement | undefined;
  }
  for (const [key, brush] of brushes.entries()) {
    if (!keysInDom.has(key)) defsEl.appendChild(renderMarker(brush));
  }
}

function shapeHash(
  { orig, dest, brush, piece, modifiers, customSvg, label }: DrawShape,
  arrowDests: ArrowDests,
  current: boolean,
  bounds: DOMRectReadOnly,
): Hash {
  return [
    bounds.width,
    bounds.height,
    current,
    orig,
    dest,
    brush,
    dest && (arrowDests.get(dest) || 0) > 1 && '-',
    piece && pieceHash(piece),
    modifiers && modifiersHash(modifiers),
    customSvg && customSvgHash(customSvg),
    label,
  ]
    .filter(x => x)
    .join(',');
}

function pieceHash(piece: DrawShapePiece): Hash {
  return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
}

function modifiersHash(m: DrawModifiers): Hash {
  return [m.lineWidth, m.hilite && '*'].filter(x => x).join(',');
}

function customSvgHash(s: string): Hash {
  // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
  }
  return 'custom-' + h.toString();
}

function renderShape(
  state: State,
  { shape, current, hash }: SyncableShape,
  brushes: DrawBrushes,
  arrowDests: ArrowDests,
  bounds: DOMRectReadOnly,
  slots?: AngleSlots,
): SVGElement {
  let el: SVGElement;
  const orig = orient(key2pos(shape.orig), state.orientation);

  if (shape.customSvg) {
    el = renderCustomSvg(shape.customSvg, orig, bounds);
  } else {
    const from = pos2user(orig, bounds);
    const to = shape.dest ? pos2user(orient(key2pos(shape.dest), state.orientation), bounds) : from;
    if (shape.dest && shape.dest !== shape.orig) {
      let brush: DrawBrush = brushes[shape.brush];
      if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
      el = renderArrow(brush, shape, from, to, current, arrowDests);
    } else el = renderCircle(brushes[shape.brush], orig, current, bounds);
    if (shape.label) {
      const g = createElement('g');
      g.appendChild(el);
      g.appendChild(renderLabel(shape, from, to, slots));
      el = g;
    }
  }
  el.setAttribute('cgHash', hash);
  return el;
}

function renderCustomSvg(customSvg: string, pos: cg.Pos, bounds: DOMRectReadOnly): SVGElement {
  const [x, y] = pos2user(pos, bounds);

  // Translate to top-left of `orig` square
  const g = setAttributes(createElement('g'), { transform: `translate(${x},${y})` });

  // Give 100x100 coordinate system to the user for `orig` square
  const svg = setAttributes(createElement('svg'), { width: 1, height: 1, viewBox: '0 0 100 100' });

  g.appendChild(svg);
  svg.innerHTML = customSvg;
  return g;
}

function renderCircle(brush: DrawBrush, pos: cg.Pos, current: boolean, bounds: DOMRectReadOnly): SVGElement {
  const o = pos2user(pos, bounds),
    widths = circleWidth(),
    radius = (bounds.width + bounds.height) / (4 * Math.max(bounds.width, bounds.height));
  return setAttributes(createElement('circle'), {
    stroke: brush.color,
    'stroke-width': widths[current ? 0 : 1],
    fill: 'none',
    opacity: opacity(brush, current),
    cx: o[0],
    cy: o[1],
    r: radius - widths[1] / 2,
  });
}

function renderArrow(
  brush: DrawBrush,
  s: DrawShape,
  from: cg.NumberPair,
  to: cg.NumberPair,
  current: boolean,
  arrowDests: ArrowDests,
): SVGElement {
  function renderInner(isHilite: boolean) {
    const m = arrowMargin((arrowDests.get(s.dest!) || 0) > 1 && !current),
      a = from,
      b = to,
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      angle = Math.atan2(dy, dx),
      xo = Math.cos(angle) * m,
      yo = Math.sin(angle) * m;
    return setAttributes(createElement('line'), {
      stroke: isHilite ? 'white' : brush.color,
      'stroke-width': lineWidth(brush, current) + (isHilite ? 0.04 : 0),
      'stroke-linecap': 'round',
      'marker-end': `url(#arrowhead-${isHilite ? 'hilite' : brush.key})`,
      opacity: isHilite ? 1 : opacity(brush, current),
      x1: a[0],
      y1: a[1],
      x2: b[0] - xo,
      y2: b[1] - yo,
    });
  }
  if (!s.modifiers?.hilite) return renderInner(false);

  const g = createElement('g');
  [true, false].map(h => g.appendChild(renderInner(h)));
  return g;
}

function renderMarker(brush: DrawBrush): SVGElement {
  const marker = setAttributes(createElement('marker'), {
    id: 'arrowhead-' + brush.key,
    orient: 'auto',
    markerWidth: 4,
    markerHeight: 8,
    refX: brush.key === 'hilite' ? 1.86 : 2.05,
    refY: 2,
  });
  marker.appendChild(
    setAttributes(createElement('path'), {
      d: 'M0,0 V4 L3,2 Z',
      fill: brush.color,
    }),
  );
  marker.setAttribute('cgKey', brush.key);
  return marker;
}

export function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (const key in attrs) {
    if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
  }
  return el;
}

function orient(pos: cg.Pos, color: cg.Color): cg.Pos {
  return color === 'white' ? pos : [7 - pos[0], 7 - pos[1]];
}

function makeCustomBrush(base: DrawBrush, modifiers: DrawModifiers): DrawBrush {
  return {
    color: base.color,
    opacity: Math.round(base.opacity * 10) / 10,
    lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
    key: [base.key, modifiers.lineWidth].filter(x => x).join(''),
  };
}

function circleWidth(): [number, number] {
  return [3 / 64, 4 / 64];
}

function lineWidth(brush: DrawBrush, current: boolean): number {
  return ((brush.lineWidth || 10) * (current ? 0.85 : 1)) / 64;
}

function opacity(brush: DrawBrush, current: boolean): number {
  return (brush.opacity || 1) * (current ? 0.9 : 1);
}

function arrowMargin(shorten: boolean): number {
  return (shorten ? 20 : 10) / 64;
}

function pos2user(pos: cg.Pos, bounds: DOMRectReadOnly): cg.NumberPair {
  const xScale = Math.min(1, bounds.width / bounds.height);
  const yScale = Math.min(1, bounds.height / bounds.width);
  return [(pos[0] - 3.5) * xScale, (3.5 - pos[1]) * yScale];
}

const LABEL_SIZE = 0.4; // size of arrow labels in pos units, 1 is the width of a board square

function renderLabel(shape: DrawShape, from: cg.NumberPair, to: cg.NumberPair, slots?: AngleSlots): Element {
  if (shape.label!.length > 5) throw new Error(`Label '${shape.label}' too long`);

  const fontSize = LABEL_SIZE * 0.8 ** shape.label!.length;
  const r = LABEL_SIZE / 2;
  const strokeW = 0.03;
  const [x, y] = labelOffset(from, to, slots);
  const g = setAttributes(createElement('g'), { transform: `translate(${x},${y})` });

  g.innerHTML = `
      <circle r="${r}" fill-opacity="1.0" stroke-opacity="0.9" stroke="white" fill="#666666"
        stroke-width="${strokeW}"/>
      <text font-size="${fontSize}" fill="white" font-family="Noto Sans" text-anchor="middle"
        fill-opacity="1.0" y="${fontSize * 0.34}">${shape.label}</text>`;
  return g;
}

function moveAngle(from: cg.NumberPair, to: cg.NumberPair, asSlot = true) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]) + Math.PI;
  return asSlot ? (Math.round((angle * 8) / Math.PI) + 16) % 16 : angle;
}

function length(from: cg.NumberPair, to: cg.NumberPair): number {
  return Math.sqrt([from[0] - to[0], from[1] - to[1]].reduce((acc, x) => acc + x * x, 0));
}

function labelOffset(from: cg.NumberPair, to: cg.NumberPair, slots?: AngleSlots): cg.NumberPair {
  let mag = length(from, to);
  if (mag === 0) return [0, 0];
  const angle = moveAngle(from, to, false);
  if (slots) {
    mag -= 33 / 64; // reduce by arrowhead length
    if (slots.size > 1) {
      mag -= 10 / 64; // reduce by shortening factor
      const slot = moveAngle(from, to);
      if (slots.has((slot + 1) % 16) || slots.has((slot + 15) % 16)) {
        if (slot & 1) mag -= LABEL_SIZE;
        // and by label size for the knight if the another arrow is pi / 8 away.
      }
    }
  }
  return [from[0] - Math.cos(angle) * mag, from[1] - Math.sin(angle) * mag];
}

/*
 we try to place labels at the junction of the destination shaft and arrowhead.
 if there's more than 1 arrow pointing to a square, the arrow shortens by 10 / 64 units so
 the label must move as well. 
 
 if the angle between two incoming arrows is pi / 8, such as when an adjacent knight and
 bishop attack the same square, the knight's label is slid further down the shaft by an
 amount equal to our label size to avoid collision
*/
