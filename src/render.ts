import { State } from './state'
import { key2pos, translate, posToTranslate } from './util'
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim'
import { DragCurrent } from './drag'
import * as cg from './types'

// `$color $role`
type PieceName = string;

interface SamePieces { [key: string]: boolean }
interface SameSquares { [key: string]: boolean }
interface MovedPieces { [pieceName: string]: cg.PieceNode[] }
interface MovedSquares { [className: string]: cg.SquareNode[] }
interface SquareClasses { [key: string]: string }

// ported from https://github.com/veloce/lichobile/blob/master/src/js/chessground/view.js
// in case of bugs, blame @veloce
export default function(s: State): void {
  const asWhite: boolean = s.orientation === 'white',
  bounds: ClientRect = s.dom.bounds(),
  boardEl: HTMLElement = s.dom.elements.board,
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
  transform = s.browser.transform;
  let k: cg.Key,
  p: cg.Piece | undefined,
  el: cg.PieceNode | cg.SquareNode,
  squareClassAtKey: string | undefined,
  pieceAtKey: cg.Piece | undefined,
  elPieceName: PieceName,
  translation: cg.NumberPair,
  anim: AnimVector | undefined,
  fading: cg.Piece | undefined,
  pMvdset: cg.PieceNode[],
  pMvd: cg.PieceNode | undefined,
  sMvdset: cg.SquareNode[],
  sMvd: cg.SquareNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = boardEl.firstChild as cg.PieceNode | cg.SquareNode;
  while (el) {
    k = el.cgKey;
    squareClassAtKey = squares[k];
    pieceAtKey = pieces[k];
    anim = anims[k];
    fading = fadings[k];
    if (isPieceNode(el)) {
      elPieceName = el.cgPiece;
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
        el.classList.remove('dragging');
        transform(el, translate(posToTranslate(key2pos(k), asWhite, bounds)));
        el.cgDragging = false;
      }
      // remove fading class if it still remains
      if (!fading && el.cgFading) {
        el.cgFading = false;
        el.classList.remove('fading');
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same piece
        // (otherwise it could animate a captured piece)
        if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
          translation = posToTranslate(key2pos(k), asWhite, bounds);
          translation[0] += anim[1][0];
          translation[1] += anim[1][1];
          transform(el, translate(translation));
        } else if (el.cgAnimating) {
          translation = posToTranslate(key2pos(k), asWhite, bounds);
          transform(el, translate(translation));
          el.cgAnimating = false;
        }
        // same piece: flag as same
        if (elPieceName === pieceNameOf(pieceAtKey)) {
          samePieces[k] = true;
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && elPieceName === pieceNameOf(fading)) {
            el.classList.add('fading');
            el.cgFading = true;
          } else {
            if (movedPieces[elPieceName]) movedPieces[elPieceName].push(el);
            else movedPieces[elPieceName] = [el];
          }
        }
      }
      // no piece: flag as moved
      else {
        if (movedPieces[elPieceName]) movedPieces[elPieceName].push(el);
        else movedPieces[elPieceName] = [el];
      }
    }
    else if (isSquareNode(el)) {
      const cn = el.className;
      if (squareClassAtKey === cn) sameSquares[k] = true;
      else if (movedSquares[cn]) movedSquares[cn].push(el);
      else movedSquares[cn] = [el];
    }
    el = el.nextSibling as cg.PieceNode | cg.SquareNode;
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
        transform(sMvd, translate(translation));
      }
      else {
        boardEl.insertBefore(
          renderSquareDom(sk as cg.Key, squares[sk], translation, transform),
          boardEl.firstChild);
      }
    }
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j in piecesKeys) {
    k = piecesKeys[j];
    p = pieces[k];
    anim = anims[k];
    if (!samePieces[k]) {
      pMvdset = movedPieces[pieceNameOf(p)];
      pMvd = pMvdset && pMvdset.pop();
      // a same piece was moved
      if (pMvd) {
        // apply dom changes
        pMvd.cgKey = k;
        const pos = key2pos(k);
        if (s.addPieceZIndex) pMvd.style.zIndex = posZIndex(pos, asWhite);
        translation = posToTranslate(pos, asWhite, bounds);
        if (anim) {
          pMvd.cgAnimating = true;
          translation[0] += anim[1][0];
          translation[1] += anim[1][1];
        }
        transform(pMvd, translate(translation));
      }
      // no piece in moved obj: insert the new piece
      // new: assume the new piece is not being dragged
      // might be a bad idea
      else {
        boardEl.appendChild(renderPieceDom(s, p, k, asWhite, anim, bounds));
      }
    }
  }

  // remove any element that remains in the moved sets
  for (let i in movedPieces) removeNodes(s, movedPieces[i]);
  for (let i in movedSquares) removeNodes(s, movedSquares[i]);
}

function isPieceNode(el: cg.PieceNode | cg.SquareNode): el is cg.PieceNode {
  return el.tagName === 'PIECE';
}
function isSquareNode(el: cg.PieceNode | cg.SquareNode): el is cg.SquareNode {
  return el.tagName === 'SQUARE';
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (let i in nodes) s.dom.elements.board.removeChild(nodes[i]);
}

function renderSquareDom(key: cg.Key, className: string, translation: cg.NumberPair, transform: cg.Transform): cg.SquareNode {
  const s = document.createElement('square') as cg.SquareNode;
  s.className = className;
  s.cgKey = key;
  transform(s, translate(translation));
  return s;
}

function renderPieceDom(s: State, piece: cg.Piece, key: cg.Key, asWhite: boolean, anim: AnimVector | undefined, bounds: ClientRect): cg.PieceNode {

  const p = document.createElement('piece') as cg.PieceNode,
  pieceName = pieceNameOf(piece),
  pos = key2pos(key);

  p.className = pieceName;
  p.cgPiece = pieceName;
  p.cgKey = key;

  const translation = posToTranslate(pos, asWhite, bounds);
  if (anim) {
    p.cgAnimating = true;
    translation[0] += anim[1][0];
    translation[1] += anim[1][1];
  }
  s.browser.transform(p, translate(translation));

  if (s.addPieceZIndex) p.style.zIndex = posZIndex(pos, asWhite);

  return p;
}

function posZIndex(pos: cg.Pos, asWhite: boolean): string {
  let z = 2 + (pos[1] - 1) * 8 + (8 - pos[0]);
  if (asWhite) z = 67 - z;
  return z + '';
}

function pieceNameOf(piece: cg.Piece): string {
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
