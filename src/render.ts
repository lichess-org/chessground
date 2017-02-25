import { State } from './state'
import * as util from './util'

type PieceId = string;
type LolNode = any; // HTML Node but with custom props

interface SamePieces { [key: string]: boolean }
// interface SameSquares { [key: string]: boolean }
interface MovedPieces { [id: string]: LolNode }
// interface SquareClasses { [key: string]: string }

// ported from https://github.com/veloce/lichobile/blob/master/src/js/chessground/view.js
// in case of bugs, blame @veloce
export default function(s: State): void {
  const asWhite: boolean = s.orientation === 'white',
  bounds: ClientRect = s.dom.bounds,
  pieces: Pieces = s.pieces,
  curAnim: AnimCurrent | undefined = s.animation.current,
  anims: AnimVectors = curAnim ? curAnim.plan.anims : {},
  fadings: AnimFadings = curAnim ? curAnim.plan.fadings : {},
  curDrag: DragCurrent | undefined = s.draggable.current,
  // squares: SquareClasses = computeSquareClasses(s),
  samePieces: SamePieces = {},
  movedPieces: MovedPieces = {},
  piecesKeys: Key[] = Object.keys(pieces) as Key[],
  transform: string = util.transformProp();
  let k: Key,
  p: Piece | undefined,
  el: LolNode,
  pieceAtKey: Piece | undefined,
  pieceId: PieceId,
  translate: NumberPair,
  anim: AnimVector | undefined,
  fading: Piece | undefined,
  mvdset: LolNode[],
  mvd: LolNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = s.dom.element.firstChild as LolNode;
  while (el) {
    k = el.cgKey;
    pieceAtKey = pieces[k];
    pieceId = el.cgRole + el.cgColor;
    anim = anims[k];
    fading = fadings[k];
    if (el.tagName === 'PIECE') {
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
        el.classList.remove('dragging');
        el.style[transform] = util.translate(posToTranslate(util.key2pos(k), asWhite, bounds));
        el.cgDragging = false;
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same color
        // (otherwise it could animate a captured piece)
        if (anim && el.cgAnimating && el.cgColor === pieceAtKey.color) {
          translate = posToTranslate(util.key2pos(k), asWhite, bounds);
          translate[0] += anim[1][0];
          translate[1] += anim[1][1];
          el.style[transform] = util.translate(translate);
        } else if (el.cgAnimating) {
          translate = posToTranslate(util.key2pos(k), asWhite, bounds);
          el.style[transform] = util.translate(translate);
          el.cgAnimating = false;
        }
        // same piece: flag as same
        if (el.cgColor === pieceAtKey.color && el.cgRole === pieceAtKey.role) {
          samePieces[k] = true;
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && fading.role === el.cgRole && fading.color === el.cgColor) {
            el.classList.add('captured'); // todo - add only once
          } else {
            if (movedPieces[pieceId]) movedPieces[pieceId].push(el);
            else movedPieces[pieceId] = [el];
          }
        }
      }
      // no piece: flag as moved
      else {
        if (movedPieces[pieceId]) movedPieces[pieceId].push(el);
        else movedPieces[pieceId] = [el];
      }
    }
    // else if (el.tagName === 'SQUARE') {
    //   if (!orientationChange && squareClassAtKey === el.className) {
    //     sameSquares.add(k);
    //   }
    //   else {
    //     movedSquares.set(
    //       el.className,
    //       (movedSquares.get(el.className) || []).concat(el)
    //     );
    //   }
    // }
    el = el.nextSibling;
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j = 0, jlen = piecesKeys.length; j < jlen; ++j) {
    k = piecesKeys[j];
    p = pieces[k];
    pieceId = p.role + p.color;
    anim = anims[k];
    if (!samePieces[k]) {
      mvdset = movedPieces[pieceId];
      mvd = mvdset && mvdset.pop();
      // a same piece was moved
      if (mvd) {
        // apply dom changes
        mvd.cgKey = k;
        translate = posToTranslate(util.key2pos(k), asWhite, bounds);
        if (anim) {
          mvd.cgAnimating = true;
          translate[0] += anim[1][0];
          translate[1] += anim[1][1];
        }
        mvd.style[transform] = util.translate(translate);
      }
      // no piece in moved obj: insert the new piece
      // new: assume the new piece is not being dragged
      // might be a bad idea
      else {
        s.dom.element.appendChild(
          renderPieceDom(p, k, asWhite, bounds, anim, transform)
        );
      }
    }
  }
}

function renderPieceDom(
  piece: Piece, key: Key, asWhite: boolean, bounds: ClientRect,
  anim: AnimVector | undefined, transform: string): LolNode {

  const p = document.createElement('piece') as LolNode;
  p.className = `${piece.role} ${piece.color}`;
  p.cgRole = piece.role;
  p.cgColor = piece.color;
  p.cgKey = key;

  const translate = posToTranslate(util.key2pos(key), asWhite, bounds);
  if (anim) {
    p.cgAnimating = true;
    translate[0] += anim[1][0];
    translate[1] += anim[1][1];
  }
  p.style[transform] = util.translate(translate);
  return p;
}

// function computeSquareClasses(s: State): SquareClasses {
//   const squares: SquareClasses = {};
//   let i: any, k: Key;
//   if (s.lastMove && s.highlight.lastMove) for (i in s.lastMove) {
//     addSquare(squares, s.lastMove[i], 'last-move');
//   }
//   if (s.check && s.highlight.check) addSquare(squares, s.check, 'check');
//   if (s.selected) {
//     addSquare(squares, s.selected, 'selected');
//     const over = s.draggable.current && s.draggable.current.over,
//     dests = s.movable.dests && s.movable.dests[s.selected];
//     if (dests) for (i in dests) {
//       k = dests[i];
//       if (s.movable.showDests) addSquare(squares, k, 'move-dest');
//       if (k === over) addSquare(squares, k, 'drag-over');
//       else if (s.movable.showDests && s.pieces[k]) addSquare(squares, k, 'oc');
//     }
//     const pDests = s.premovable.dests;
//     if (pDests) for (i in pDests) {
//       k = pDests[i];
//       if (s.movable.showDests) addSquare(squares, k, 'premove-dest');
//       if (k === over) addSquare(squares, k, 'drag-over');
//       else if (s.movable.showDests && s.pieces[k]) addSquare(squares, k, 'oc');
//     }
//   }
//   const premove = s.premovable.current;
//   if (premove) for (i in premove) addSquare(squares, premove[i], 'current-premove');
//   else if (s.predroppable.current) addSquare(squares, s.predroppable.current.key, 'current-premove');

//   let o = s.exploding;
//   if (o) for (i in o.keys) addSquare(squares, o.keys[i], 'exploding' + o.stage);

//   return squares;
// }

// function addSquare(squares: SquareClasses, key: Key, klass: string): void {
//   if (squares[key]) squares[key] += ' ' + klass;
//   else squares[key] = klass;
// }

function posToTranslate(pos: Pos, asWhite: boolean, bounds: ClientRect): NumberPair {
  return [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * bounds.width / 8,
    (asWhite ? 8 - pos[1] : pos[1] - 1) * bounds.height / 8
  ];
}
