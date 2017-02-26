import { State } from './state'
import { key2pos, translate, posToTranslate } from './util'
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim'
import { DragCurrent } from './drag'
import * as cg from './types'

type PieceClass = string;

interface SamePieces { [key: string]: boolean }
interface SameSquares { [key: string]: boolean }
interface MovedPieces { [className: string]: cg.PieceNode[] }
interface MovedSquares { [className: string]: cg.SquareNode[] }
interface SquareClasses { [key: string]: string }

// ported from https://github.com/veloce/lichobile/blob/master/src/js/chessground/view.js
// in case of bugs, blame @veloce
export default function(s: State): void {
  const asWhite: boolean = s.orientation === 'white',
  bounds: ClientRect = s.dom.bounds,
  pieces: cg.Pieces = s.pieces,
  curAnim: AnimCurrent | undefined = s.animation.current,
  anims: AnimVectors = curAnim ? curAnim.plan.anims : {},
  fadings: AnimFadings = curAnim ? curAnim.plan.fadings : {},
  curDrag: DragCurrent | undefined = s.draggable.current,
  squares: SquareClasses = computeSquareClasses(s),
  samePieces: SamePieces = {},
  sameSquares: SameSquares = {},
  movedPieces: MovedPieces = {},
  movedSquares: MovedSquares = {},
  piecesKeys: cg.Key[] = Object.keys(pieces) as cg.Key[],
  transform: string = s.browser.transformProp;
  let k: cg.Key,
  p: cg.Piece | undefined,
  anyEl: cg.PieceNode | cg.SquareNode,
  pEl: cg.PieceNode,
  squareClassAtKey: string | undefined,
  pieceAtKey: cg.Piece | undefined,
  elPieceClass: PieceClass,
  translation: cg.NumberPair,
  anim: AnimVector | undefined,
  fading: cg.Piece | undefined,
  pMvdset: cg.PieceNode[],
  pMvd: cg.PieceNode | undefined,
  sMvdset: cg.SquareNode[],
  sMvd: cg.SquareNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  anyEl = s.dom.elements.board.firstChild as cg.PieceNode | cg.SquareNode;
  while (anyEl) {
    k = anyEl.cgKey as cg.Key;
    squareClassAtKey = squares[k];
    pieceAtKey = pieces[k];
    anim = anims[k];
    fading = fadings[k];
    if (anyEl.tagName === 'PIECE') {
      pEl = anyEl as cg.PieceNode;
      elPieceClass = pEl.cgPiece;
      // if piece not being dragged anymore, remove dragging style
      if (pEl.cgDragging && (!curDrag || curDrag.orig !== k)) {
        pEl.classList.remove('dragging');
        pEl.style.setProperty(transform, translate(posToTranslate(key2pos(k), asWhite, bounds)));
        pEl.cgDragging = false;
      }
      // remove fading class if it still remains
      if (!fading && pEl.cgFading) {
        pEl.cgFading = false;
        pEl.classList.remove('fading');
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same piece
        // (otherwise it could animate a captured piece)
        if (anim && pEl.cgAnimating && elPieceClass === pieceClassOf(pieceAtKey)) {
          translation = posToTranslate(key2pos(k), asWhite, bounds);
          translation[0] += anim[1][0];
          translation[1] += anim[1][1];
          pEl.style.setProperty(transform, translate(translation));
        } else if (pEl.cgAnimating) {
          translation = posToTranslate(key2pos(k), asWhite, bounds);
          pEl.style.setProperty(transform, translate(translation));
          pEl.cgAnimating = false;
        }
        // same piece: flag as same
        if (elPieceClass === pieceClassOf(pieceAtKey)) {
          samePieces[k] = true;
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && elPieceClass === pieceClassOf(fading)) {
            pEl.classList.add('fading');
            pEl.cgFading = true;
          } else {
            if (movedPieces[elPieceClass]) movedPieces[elPieceClass].push(pEl);
            else movedPieces[elPieceClass] = [pEl];
          }
        }
      }
      // no piece: flag as moved
      else {
        if (movedPieces[elPieceClass]) movedPieces[elPieceClass].push(pEl);
        else movedPieces[elPieceClass] = [pEl];
      }
    }
    else if (anyEl.tagName === 'SQUARE') {
      const cn = anyEl.className;
      if (squareClassAtKey === cn) sameSquares[k] = true;
      else if (movedSquares[cn]) movedSquares[cn].push(anyEl);
      else movedSquares[cn] = [anyEl];
    }
    anyEl = anyEl.nextSibling as cg.PieceNode | cg.SquareNode;
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j in piecesKeys) {
    k = piecesKeys[j];
    p = pieces[k];
    anim = anims[k];
    if (!samePieces[k]) {
      pMvdset = movedPieces[pieceClassOf(p)];
      pMvd = pMvdset && pMvdset.pop();
      // a same piece was moved
      if (pMvd) {
        // apply dom changes
        pMvd.cgKey = k;
        translation = posToTranslate(key2pos(k), asWhite, bounds);
        if (anim) {
          pMvd.cgAnimating = true;
          translation[0] += anim[1][0];
          translation[1] += anim[1][1];
        }
        pMvd.style.setProperty(transform, translate(translation));
      }
      // no piece in moved obj: insert the new piece
      // new: assume the new piece is not being dragged
      // might be a bad idea
      else {
        s.dom.elements.board.appendChild(
          renderPieceDom(p, k, asWhite, bounds, anim, transform)
        );
      }
    }
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  for (let sk in squares) {
    if (!sameSquares[sk]) {
      sMvdset = movedSquares[squares[sk]];
      sMvd = sMvdset && sMvdset.pop();
      translation = posToTranslate(key2pos(sk as cg.Key), asWhite, bounds);
      if (sMvd) {
        sMvd.cgKey = sk as cg.Key;
        sMvd.style.setProperty(transform, translate(translation));
      }
      else {
        s.dom.elements.board.appendChild(renderSquareDom(sk as cg.Key, squares[sk], translation, transform));
      }
    }
  }

  // remove any element that remains in the moved sets
  for (let i in movedPieces) removeNodes(s, movedPieces[i]);
  for (let i in movedSquares) removeNodes(s, movedSquares[i]);
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (let i in nodes) s.dom.elements.board.removeChild(nodes[i]);
}

function renderSquareDom(key: cg.Key, className: string, translation: cg.NumberPair, transform: string): cg.SquareNode {
  const s = document.createElement('square') as cg.SquareNode;
  s.className = className;
  s.cgKey = key;
  s.style.setProperty(transform, translate(translation));
  return s;
}

function renderPieceDom(piece: cg.Piece, key: cg.Key, asWhite: boolean, bounds: ClientRect, anim: AnimVector | undefined, transform: string): cg.PieceNode {

  const p = document.createElement('piece') as cg.PieceNode;
  const pieceClass = pieceClassOf(piece);
  p.className = pieceClass;
  p.cgPiece = pieceClass;
  p.cgKey = key;

  const translation = posToTranslate(key2pos(key), asWhite, bounds);
  if (anim) {
    p.cgAnimating = true;
    translation[0] += anim[1][0];
    translation[1] += anim[1][1];
  }
  p.style.setProperty(transform, translate(translation));
  return p;
}

function pieceClassOf(piece: cg.Piece): string {
  return `${piece.color} ${piece.role}`;
}

function computeSquareClasses(s: State): SquareClasses {
  const squares: SquareClasses = {};
  let i: any, k: cg.Key;
  if (s.lastMove && s.highlight.lastMove) for (i in s.lastMove) {
    addSquare(squares, s.lastMove[i], 'last-move');
  }
  if (s.check && s.highlight.check) addSquare(squares, s.check, 'check');
  if (s.selected) {
    addSquare(squares, s.selected, 'selected');
    if (s.movable.showDests) {
      const dests = s.movable.dests && s.movable.dests[s.selected];
      if (dests) for (i in dests) {
        k = dests[i];
        addSquare(squares, k, 'move-dest' + (s.pieces[k] ? ' oc' : ''));
      }
      const pDests = s.premovable.dests;
      if (pDests) for (i in pDests) {
        k = pDests[i];
        addSquare(squares, k, 'premove-dest' + (s.pieces[k] ? ' oc' : ''));
      }
    }
  }
  const premove = s.premovable.current;
  if (premove) for (i in premove) addSquare(squares, premove[i], 'current-premove');
  else if (s.predroppable.current) addSquare(squares, s.predroppable.current.key, 'current-premove');

  let o = s.exploding;
  if (o) for (i in o.keys) addSquare(squares, o.keys[i], 'exploding' + o.stage);

  return squares;
}

function addSquare(squares: SquareClasses, key: cg.Key, klass: string): void {
  if (squares[key]) squares[key] += ' ' + klass;
  else squares[key] = klass;
}
