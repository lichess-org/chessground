import { whitePov } from './board.js';
import { type DrawShape, type DrawShapePiece } from './draw.js';
import { type State } from './state.js';
import { type Hash, type SyncableShape, syncShapes } from './sync.js';
import type * as cg from './types.js';
import { createEl, key2pos, posToTranslate as posToTranslateFromBounds, translateAndScale } from './util.js';

export function render(state: State, autoPieceEl: HTMLElement): void {
  const autoPieces = state.drawable.autoShapes.filter(autoShape => autoShape.piece);
  const autoPieceShapes: SyncableShape[] = autoPieces.map((s: DrawShape) => {
    return {
      shape: s,
      hash: hash(s),
      current: false,
      pendingErase: false,
    };
  });

  syncShapes(autoPieceShapes, autoPieceEl, shape => renderShape(state, shape, state.dom.bounds()));
}

export function renderResized(state: State): void {
  const asWhite: boolean = whitePov(state),
    posToTranslate = posToTranslateFromBounds(state.dom.bounds());
  let el = state.dom.elements.autoPieces?.firstChild as cg.PieceNode | undefined;
  while (el) {
    const key = el.cgKey;
    position(
      el,
      posToTranslate(key2pos(key), asWhite),
      el.cgScale,
      state.drawable.autoShapes.find(s => s.orig === key && s.piece)?.piece,
      state.dom.bounds(),
    );
    el = el.nextSibling as cg.PieceNode | undefined;
  }
}

function renderShape(state: State, { shape, hash }: SyncableShape, bounds: DOMRectReadOnly): cg.PieceNode {
  const orig = shape.orig;
  const role = shape.piece?.role;
  const color = shape.piece?.color;
  const scale = shape.piece?.scale;

  const pieceEl = createEl('piece', `${role} ${color}`) as cg.PieceNode;
  pieceEl.setAttribute('cgHash', hash);
  pieceEl.cgKey = orig;
  pieceEl.cgScale = scale;
  position(
    pieceEl,
    posToTranslateFromBounds(bounds)(key2pos(orig), whitePov(state)),
    scale,
    shape.piece,
    bounds,
  );

  return pieceEl;
}

function position(
  el: HTMLElement,
  pos: cg.NumberPair,
  scale = 1,
  piece?: DrawShapePiece,
  bounds?: DOMRectReadOnly,
): void {
  const gravity = piece?.gravity ?? 'center';
  const rotation = piece?.rotation ?? 0;
  if (gravity === 'center' && !rotation) translateAndScale(el, pos, scale);
  else {
    const w = bounds!.width / 8,
      h = bounds!.height / 8;
    const angle = (rotation * Math.PI) / 180;
    const bw = scale * (Math.abs(Math.cos(angle)) * w + Math.abs(Math.sin(angle)) * h);
    const bh = scale * (Math.abs(Math.sin(angle)) * w + Math.abs(Math.cos(angle)) * h);
    const x = gravity.includes('west') ? (bw - w) / 2 : gravity.includes('east') ? (w - bw) / 2 : 0;
    const y = gravity.includes('north') ? (bh - h) / 2 : gravity.includes('south') ? (h - bh) / 2 : 0;
    el.style.transform = `translate(${pos[0] + x}px,${pos[1] + y}px) scale(${scale}) rotate(${rotation}deg)`;
  }
  el.style.opacity = piece?.opacity === undefined ? '' : String(piece.opacity);
}

const hash = (autoPiece: DrawShape): Hash =>
  [
    autoPiece.orig,
    autoPiece.piece?.role,
    autoPiece.piece?.color,
    autoPiece.piece?.scale,
    autoPiece.piece?.opacity,
    autoPiece.piece?.gravity,
    autoPiece.piece?.rotation,
  ].join(',');
