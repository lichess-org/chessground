import { State } from './state.js';
import { key2pos } from './util.js';
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushes, DrawModifiers } from './draw.js';
import { SyncableShape, Hash } from './sync.js';
import * as cg from './types.js';

type CustomBrushes = Map<string, DrawBrush>; // by hash
type Svg = { el: SVGElement; isCustom?: boolean };
type AngleSlots = Set<number>; // arrow angle slots for label positioning
type ArrowDests = Map<cg.Key | undefined, AngleSlots>; // angle slots per dest

const hilites: { [name: string]: DrawBrush } = {
  hilitePrimary: { key: 'hilitePrimary', color: '#3291ff', opacity: 1, lineWidth: 1 },
  hiliteWhite: { key: 'hiliteWhite', color: '#ffffff', opacity: 1, lineWidth: 1 },
};

export { createElement, setAttributes };

export function createDefs(): Element {
  const defs = createElement('defs');
  const filter = setAttributes(createElement('filter'), { id: 'cg-filter-blur' });
  filter.appendChild(setAttributes(createElement('feGaussianBlur'), { stdDeviation: '0.019' }));
  defs.appendChild(filter);
  return defs;
}

export function renderSvg(state: State, shapesEl: SVGElement, customsEl: SVGElement): void {
  const d = state.drawable,
    curD = d.current,
    cur = curD && curD.mouseSq ? (curD as DrawShape) : undefined,
    dests: ArrowDests = new Map(),
    bounds = state.dom.bounds(),
    nonPieceAutoShapes = d.autoShapes.filter(autoShape => !autoShape.piece);

  for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
    if (!s.dest) continue;
    const sources = dests.get(s.dest) ?? new Set(),
      from = pos2user(orient(key2pos(s.orig), state.orientation), bounds),
      to = pos2user(orient(key2pos(s.dest), state.orientation), bounds);
    sources.add(moveAngle(from, to));
    dests.set(s.dest, sources);
  }
  const shapes: SyncableShape[] = d.shapes.concat(nonPieceAutoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      current: false,
      hash: shapeHash(s, isShort(s.dest, dests), false, bounds),
    };
  });
  if (cur)
    shapes.push({
      shape: cur,
      current: true,
      hash: shapeHash(cur, isShort(cur.dest, dests), true, bounds),
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

  const defsEl = shapesEl.querySelector('defs') as SVGElement;

  syncDefs(d, shapes, defsEl);
  syncShapes(shapes, shapesEl.querySelector('g')!, customsEl.querySelector('g')!, s =>
    renderShape(state, s, d.brushes, dests, bounds),
  );
}

// append only. Don't try to update/remove.
function syncDefs(d: Drawable, shapes: SyncableShape[], defsEl: SVGElement) {
  const brushes: CustomBrushes = new Map();
  let brush: DrawBrush;
  for (const s of shapes.filter(s => s.shape.dest && s.shape.brush)) {
    brush = makeCustomBrush(d.brushes[s.shape.brush!], s.shape.modifiers);
    if (s.shape.modifiers?.hilite) brushes.set(hilite(brush).key, hilite(brush));
    brushes.set(brush.key, brush);
  }
  const keysInDom = new Set();
  let el: SVGElement | undefined = defsEl.firstElementChild as SVGElement;
  while (el) {
    keysInDom.add(el.getAttribute('cgKey'));
    el = el.nextElementSibling as SVGElement | undefined;
  }
  for (const [key, brush] of brushes.entries()) {
    if (!keysInDom.has(key)) defsEl.appendChild(renderMarker(brush));
  }
}

function syncShapes(
  syncables: SyncableShape[],
  shapes: Element,
  customs: Element,
  renderShape: (shape: SyncableShape) => Svg[],
): void {
  const hashesInDom = new Map();

  for (const sc of syncables) hashesInDom.set(sc.hash, false);
  for (const root of [shapes, customs]) {
    const toRemove: SVGElement[] = [];
    let el: SVGElement | undefined = root.firstElementChild as SVGElement,
      elHash: Hash | null;
    while (el) {
      elHash = el.getAttribute('cgHash') as Hash;
      if (hashesInDom.has(elHash)) hashesInDom.set(elHash, true);
      else toRemove.push(el);
      el = el.nextElementSibling as SVGElement | undefined;
    }
    for (const el of toRemove) root.removeChild(el);
  }
  // insert shapes that are not yet in dom
  for (const sc of syncables.filter(s => !hashesInDom.get(s.hash))) {
    for (const svg of renderShape(sc)) {
      if (svg.isCustom) customs.appendChild(svg.el);
      else shapes.appendChild(svg.el);
    }
  }
}

function shapeHash(
  { orig, dest, brush, piece, modifiers, customSvg, label }: DrawShape,
  shorten: boolean,
  current: boolean,
  bounds: DOMRectReadOnly,
): Hash {
  // a shape and an overlay svg share a lifetime and have the same cgHash attribute
  return [
    bounds.width,
    bounds.height,
    current,
    orig,
    dest,
    brush,
    shorten && '-',
    piece && pieceHash(piece),
    modifiers && modifiersHash(modifiers),
    customSvg && `custom-${textHash(customSvg.html)},${customSvg.center?.[0] ?? 'o'}`,
    label && `label-${textHash(label.text)}`,
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

function textHash(s: string): Hash {
  // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString();
}

function renderShape(
  state: State,
  { shape, current, hash }: SyncableShape,
  brushes: DrawBrushes,
  dests: ArrowDests,
  bounds: DOMRectReadOnly,
): Svg[] {
  const from = pos2user(orient(key2pos(shape.orig), state.orientation), bounds),
    to = shape.dest ? pos2user(orient(key2pos(shape.dest), state.orientation), bounds) : from,
    brush = shape.brush && makeCustomBrush(brushes[shape.brush], shape.modifiers),
    slots = dests.get(shape.dest),
    svgs: Svg[] = [];

  if (brush) {
    const el = setAttributes(createElement('g'), { cgHash: hash });
    svgs.push({ el });

    if (from[0] !== to[0] || from[1] !== to[1])
      el.appendChild(renderArrow(shape, brush, from, to, current, isShort(shape.dest, dests)));
    else el.appendChild(renderCircle(brushes[shape.brush!], from, current, bounds));
  }
  if (shape.label) {
    const label = shape.label;
    label.fill ??= shape.brush && brushes[shape.brush].color;
    const corner = shape.brush ? undefined : 'tr';
    svgs.push({ el: renderLabel(label, hash, from, to, slots, corner), isCustom: true });
  }
  if (shape.customSvg) {
    const on = shape.customSvg.center ?? 'orig';
    const [x, y] =
      on === 'label' ? labelCoords(from, to, slots).map(c => c - 0.5) : on === 'dest' ? to : from;
    const el = setAttributes(createElement('g'), { transform: `translate(${x},${y})`, cgHash: hash });
    el.innerHTML = `<svg width="1" height="1" viewBox="0 0 100 100">${shape.customSvg.html}</svg>`;
    svgs.push({ el, isCustom: true });
  }
  return svgs;
}

function renderCircle(
  brush: DrawBrush,
  at: cg.NumberPair,
  current: boolean,
  bounds: DOMRectReadOnly,
): SVGElement {
  const widths = circleWidth(),
    radius = (bounds.width + bounds.height) / (4 * Math.max(bounds.width, bounds.height));
  return setAttributes(createElement('circle'), {
    stroke: brush.color,
    'stroke-width': widths[current ? 0 : 1],
    fill: 'none',
    opacity: opacity(brush, current),
    cx: at[0],
    cy: at[1],
    r: radius - widths[1] / 2,
  });
}

function hilite(brush: DrawBrush): DrawBrush {
  return ['#ffffff', '#fff', 'white'].includes(brush.color)
    ? hilites['hilitePrimary']
    : hilites['hiliteWhite'];
}

function renderArrow(
  s: DrawShape,
  brush: DrawBrush,
  from: cg.NumberPair,
  to: cg.NumberPair,
  current: boolean,
  shorten: boolean,
): SVGElement {
  function renderLine(isHilite: boolean) {
    const m = arrowMargin(shorten && !current),
      dx = to[0] - from[0],
      dy = to[1] - from[1],
      angle = Math.atan2(dy, dx),
      xo = Math.cos(angle) * m,
      yo = Math.sin(angle) * m;
    return setAttributes(createElement('line'), {
      stroke: isHilite ? hilite(brush).color : brush.color,
      'stroke-width': lineWidth(brush, current) + (isHilite ? 0.04 : 0),
      'stroke-linecap': 'round',
      'marker-end': `url(#arrowhead-${isHilite ? hilite(brush).key : brush.key})`,
      opacity: s.modifiers?.hilite ? 1 : opacity(brush, current),
      x1: from[0],
      y1: from[1],
      x2: to[0] - xo,
      y2: to[1] - yo,
    });
  }
  if (!s.modifiers?.hilite) return renderLine(false);

  const g = createElement('g');
  const blurred = setAttributes(createElement('g'), { filter: 'url(#cg-filter-blur)' });
  blurred.appendChild(filterBox(from, to));
  blurred.appendChild(renderLine(true));
  g.appendChild(blurred);
  g.appendChild(renderLine(false));
  return g;
}

function renderMarker(brush: DrawBrush): SVGElement {
  const marker = setAttributes(createElement('marker'), {
    id: 'arrowhead-' + brush.key,
    orient: 'auto',
    overflow: 'visible',
    markerWidth: 4,
    markerHeight: 4,
    refX: brush.key.startsWith('hilite') ? 1.86 : 2.05,
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

function renderLabel(
  label: { text: string; fill?: string },
  hash: string,
  from: cg.NumberPair,
  to: cg.NumberPair,
  slots?: AngleSlots,
  corner?: 'tr',
): SVGElement {
  const labelSize = 0.4,
    fontSize = labelSize * 0.75 ** label.text.length,
    at = labelCoords(from, to, slots),
    cornerOff = corner === 'tr' ? 0.4 : 0,
    g = setAttributes(createElement('g'), {
      transform: `translate(${at[0] + cornerOff},${at[1] - cornerOff})`,
      cgHash: hash,
    });
  g.appendChild(
    setAttributes(createElement('circle'), {
      r: labelSize / 2,
      'fill-opacity': corner ? 1.0 : 0.8,
      'stroke-opacity': corner ? 1.0 : 0.7,
      'stroke-width': 0.03,
      fill: label.fill ?? '#666',
      stroke: 'white',
    }),
  );
  const labelEl = setAttributes(createElement('text'), {
    'font-size': fontSize,
    'font-family': 'Noto Sans',
    'text-anchor': 'middle',
    fill: 'white',
    y: 0.13 * 0.75 ** label.text.length,
  });
  labelEl.innerHTML = label.text;
  g.appendChild(labelEl);
  return g;
}

function orient(pos: cg.Pos, color: cg.Color): cg.Pos {
  return color === 'white' ? pos : [7 - pos[0], 7 - pos[1]];
}

function isShort(dest: cg.Key | undefined, dests: ArrowDests) {
  return true === (dest && dests.has(dest) && dests.get(dest)!.size > 1);
}

function createElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (const key in attrs) {
    if (Object.prototype.hasOwnProperty.call(attrs, key)) el.setAttribute(key, attrs[key]);
  }
  return el;
}

function makeCustomBrush(base: DrawBrush, modifiers: DrawModifiers | undefined): DrawBrush {
  return !modifiers
    ? base
    : {
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

function filterBox(from: cg.NumberPair, to: cg.NumberPair): SVGElement {
  // lines/arrows are considered to be one dimensional for the purposes of SVG filters,
  // so we add a transparent bounding box to ensure they apply to the 2nd dimension
  const box = {
    from: [Math.floor(Math.min(from[0], to[0])), Math.floor(Math.min(from[1], to[1]))],
    to: [Math.ceil(Math.max(from[0], to[0])), Math.ceil(Math.max(from[1], to[1]))],
  };
  return setAttributes(createElement('rect'), {
    x: box.from[0],
    y: box.from[1],
    width: box.to[0] - box.from[0],
    height: box.to[1] - box.from[1],
    fill: 'none',
    stroke: 'none',
  });
}

function moveAngle(from: cg.NumberPair, to: cg.NumberPair, asSlot = true) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]) + Math.PI;
  return asSlot ? (Math.round((angle * 8) / Math.PI) + 16) % 16 : angle;
}

function dist(from: cg.NumberPair, to: cg.NumberPair): number {
  return Math.sqrt([from[0] - to[0], from[1] - to[1]].reduce((acc, x) => acc + x * x, 0));
}

/*
 try to place label at the junction of the destination shaft and arrowhead. if there's more than
 1 arrow pointing to a square, the arrow shortens by 10 / 64 units so the label must move as well. 
 
 if the angle between two incoming arrows is pi / 8, such as when an adjacent knight and bishop
 attack the same square, the knight's label is slid further down the shaft by an amount equal to
 our label size to avoid collision
*/

function labelCoords(from: cg.NumberPair, to: cg.NumberPair, slots?: AngleSlots): cg.NumberPair {
  let mag = dist(from, to);
  //if (mag === 0) return [from[0], from[1]];
  const angle = moveAngle(from, to, false);
  if (slots) {
    mag -= 33 / 64; // reduce by arrowhead length
    if (slots.size > 1) {
      mag -= 10 / 64; // reduce by shortening factor
      const slot = moveAngle(from, to);
      if (slots.has((slot + 1) % 16) || slots.has((slot + 15) % 16)) {
        if (slot & 1) mag -= 0.4;
        // and by label size for the knight if another arrow is within pi / 8.
      }
    }
  }
  return [from[0] - Math.cos(angle) * mag, from[1] - Math.sin(angle) * mag].map(
    c => c + 0.5,
  ) as cg.NumberPair;
}
