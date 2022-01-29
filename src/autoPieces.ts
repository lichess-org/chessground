import { State } from './state.js';
import { key2pos, createEl, posToTranslate as posToTranslateFromBounds, translateAndScale } from './util.js';
import { whitePov } from './board.js';
import * as cg from './types.js';
import { DrawShape } from './draw.js';
import { SyncableShape, Hash, syncShapes } from './sync.js';

export function render(state: State, autoPieceEl: HTMLElement): void {
  const autoPieces = state.drawable.autoShapes.filter(autoShape => autoShape.piece);
  const autoPieceShapes: SyncableShape[] = autoPieces.map((s: DrawShape) => {
    return {
      shape: s,
      hash: hash(s),
      current: false,
    };
  });

  syncShapes(autoPieceShapes, autoPieceEl, shape => renderShape(state, shape, state.dom.bounds()));
}

export function renderResized(state: State): void {
  const asWhite: boolean = whitePov(state),
    posToTranslate = posToTranslateFromBounds(state.dom.bounds());
  let el = state.dom.elements.autoPieces?.firstChild as cg.PieceNode | undefined;
  while (el) {
    translateAndScale(el, posToTranslate(key2pos(el.cgKey), asWhite), el.cgScale);
    el = el.nextSibling as cg.PieceNode | undefined;
  }
}

function renderShape(state: State, { shape, hash }: SyncableShape, bounds: ClientRect): cg.PieceNode {
  const orig = shape.orig;
  const role = shape.piece?.role;
  const color = shape.piece?.color;
  const scale = shape.piece?.scale;

  const pieceEl = createEl('piece', `${role} ${color}`) as cg.PieceNode;
  pieceEl.setAttribute('cgHash', hash);
  pieceEl.cgKey = orig;
  pieceEl.cgScale = scale;
  translateAndScale(pieceEl, posToTranslateFromBounds(bounds)(key2pos(orig), whitePov(state)), scale);

  return pieceEl;
}

function hash(autoPiece: DrawShape): Hash {
  return [autoPiece.orig, autoPiece.piece?.role, autoPiece.piece?.color, autoPiece.piece?.scale].join(',');
}
