import { State } from './state'
import { key2pos, createEl } from './util'
import { whitePov } from './board'
import * as util from './util'
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim'
import { DragCurrent } from './drag'
import * as cg from './types'

// `$color $role`
type PieceName = string;

interface SamePieces { [key: string]: boolean }
interface SameSquares { [key: string]: boolean }
interface MovedPieces { [pieceName: string]: cg.PieceNode[] | undefined }
interface MovedSquares { [className: string]: cg.SquareNode[] | undefined }
interface SquareClasses { [key: string]: string }

// ported from https://github.com/veloce/lichobile/blob/master/src/js/chessground/view.js
// in case of bugs, blame @veloce
export default function render(s: State): void {
  const asWhite: boolean = whitePov(s),
  posToTranslate = s.dom.relative ? util.posToTranslateRel : util.posToTranslateAbs(s.dom.bounds()),
  translate = s.dom.relative ? util.translateRel : util.translateAbs,
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
  piecesKeys: cg.Key[] = Object.keys(pieces) as cg.Key[];
  let k: cg.Key,
  p: cg.Piece | undefined,
  el: cg.PieceNode | cg.SquareNode | undefined,
  pieceAtKey: cg.Piece | undefined,
  elPieceName: PieceName,
  anim: AnimVector | undefined,
  fading: cg.Piece | undefined,
  pMvdset: cg.PieceNode[] | undefined,
  pMvd: cg.PieceNode | undefined,
  sMvdset: cg.SquareNode[] | undefined,
  sMvd: cg.SquareNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = boardEl.firstChild as cg.PieceNode | cg.SquareNode | undefined;
  while (el) {
    k = el.cgKey;
    if (isPieceNode(el)) {
      pieceAtKey = pieces[k];
      anim = anims[k];
      fading = fadings[k];
      elPieceName = el.cgPiece;
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
        el.classList.remove('dragging');
        translate(el, posToTranslate(key2pos(k), asWhite));
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
          const pos = key2pos(k);
          pos[0] += anim[2];
          pos[1] += anim[3];
          el.classList.add('anim');
          translate(el, posToTranslate(pos, asWhite));
        } else if (el.cgAnimating) {
          el.cgAnimating = false;
          el.classList.remove('anim');
          translate(el, posToTranslate(key2pos(k), asWhite));
          if (s.addPieceZIndex) el.style.zIndex = posZIndex(key2pos(k), asWhite);
        }
        // same piece: flag as same
        if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
          samePieces[k] = true;
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && elPieceName === pieceNameOf(fading)) {
            el.classList.add('fading');
            el.cgFading = true;
          } else {
            if (movedPieces[elPieceName]) movedPieces[elPieceName]!.push(el);
            else movedPieces[elPieceName] = [el];
          }
        }
      }
      // no piece: flag as moved
      else {
        if (movedPieces[elPieceName]) movedPieces[elPieceName]!.push(el);
        else movedPieces[elPieceName] = [el];
      }
    }
    else if (isSquareNode(el)) {
      const cn = el.className;
      if (squares[k] === cn) sameSquares[k] = true;
      else if (movedSquares[cn]) movedSquares[cn]!.push(el);
      else movedSquares[cn] = [el];
    }
    el = el.nextSibling as cg.PieceNode | cg.SquareNode | undefined;
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  for (const sk in squares) {
    if (!sameSquares[sk]) {
      sMvdset = movedSquares[squares[sk]];
      sMvd = sMvdset && sMvdset.pop();
      const translation = posToTranslate(key2pos(sk as cg.Key), asWhite);
      if (sMvd) {
        sMvd.cgKey = sk as cg.Key;
        translate(sMvd, translation);
      }
      else {
        const squareNode = createEl('square', squares[sk]) as cg.SquareNode;
        squareNode.cgKey = sk as cg.Key;
        translate(squareNode, translation);
        boardEl.insertBefore(squareNode, boardEl.firstChild);
      }
    }
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (k of piecesKeys) {
    p = pieces[k]!;
    anim = anims[k];
    if (!samePieces[k]) {
      pMvdset = movedPieces[pieceNameOf(p)];
      pMvd = pMvdset && pMvdset.pop();
      // a same piece was moved
      if (pMvd) {
        // apply dom changes
        pMvd.cgKey = k;
        if (pMvd.cgFading) {
          pMvd.classList.remove('fading');
          pMvd.cgFading = false;
        }
        const pos = key2pos(k);
        if (s.addPieceZIndex) pMvd.style.zIndex = posZIndex(pos, asWhite);
        if (anim) {
          pMvd.cgAnimating = true;
          pMvd.classList.add('anim');
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pMvd, posToTranslate(pos, asWhite));
      }
      // no piece in moved obj: insert the new piece
      // assumes the new piece is not being dragged
      else {

        const pieceName = pieceNameOf(p),
        pieceNode = createEl('piece', pieceName) as cg.PieceNode,
        pos = key2pos(k);

        pieceNode.cgPiece = pieceName;
        pieceNode.cgKey = k;
        if (anim) {
          pieceNode.cgAnimating = true;
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pieceNode, posToTranslate(pos, asWhite));

        if (s.addPieceZIndex) pieceNode.style.zIndex = posZIndex(pos, asWhite);

        boardEl.appendChild(pieceNode);
      }
    }
  }

  // remove any element that remains in the moved sets
  for (const i in movedPieces) removeNodes(s, movedPieces[i]!);
  for (const i in movedSquares) removeNodes(s, movedSquares[i]!);
}

function isPieceNode(el: cg.PieceNode | cg.SquareNode): el is cg.PieceNode {
  return el.tagName === 'PIECE';
}
function isSquareNode(el: cg.PieceNode | cg.SquareNode): el is cg.SquareNode {
  return el.tagName === 'SQUARE';
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (const node of nodes) s.dom.elements.board.removeChild(node);
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
  if (s.lastMove && s.highlight.lastMove) for (const k of s.lastMove) {
    addSquare(squares, k, 'last-move');
  }
  if (s.check && s.highlight.check) addSquare(squares, s.check, 'check');
  if (s.selected) {
    addSquare(squares, s.selected, 'selected');
    if (s.movable.showDests) {
      const dests = s.movable.dests && s.movable.dests[s.selected];
      if (dests) for (const k of dests) {
        addSquare(squares, k, 'move-dest' + (s.pieces[k] ? ' oc' : ''));
      }
      const pDests = s.premovable.dests;
      if (pDests) for (const k of pDests) {
        addSquare(squares, k, 'premove-dest' + (s.pieces[k] ? ' oc' : ''));
      }
    }
  }
  const premove = s.premovable.current;
  if (premove) for (const k of premove) addSquare(squares, k, 'current-premove');
  else if (s.predroppable.current) addSquare(squares, s.predroppable.current.key, 'current-premove');

  const o = s.exploding;
  if (o) for (const k of o.keys) addSquare(squares, k, 'exploding' + o.stage);

  return squares;
}

function addSquare(squares: SquareClasses, key: cg.Key, klass: string): void {
  if (squares[key]) squares[key] += ' ' + klass;
  else squares[key] = klass;
}
