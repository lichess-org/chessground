import { State } from './state'
import { key2pos, translate, posToTranslate } from './util'

type PieceClass = string;

interface SamePieces { [key: string]: boolean }
interface SameSquares { [key: string]: boolean }
interface MovedPieces { [className: string]: LolNode }
interface MovedSquares { [className: string]: LolNode }
interface SquareClasses { [key: string]: string }

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
  squares: SquareClasses = computeSquareClasses(s),
  samePieces: SamePieces = {},
  sameSquares: SameSquares = {},
  movedPieces: MovedPieces = {},
  movedSquares: MovedSquares = {},
  piecesKeys: Key[] = Object.keys(pieces) as Key[],
  transform: string = s.browser.transformProp;
  let k: Key,
  p: Piece | undefined,
  el: LolNode,
  squareClassAtKey: string | undefined,
  pieceAtKey: Piece | undefined,
  pieceClass: PieceClass,
  translation: NumberPair,
  anim: AnimVector | undefined,
  fading: Piece | undefined,
  mvdset: LolNode[],
  mvd: LolNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = s.dom.elements.board.firstChild as LolNode;
  while (el) {
    k = el.cgKey;
    squareClassAtKey = squares[k];
    pieceAtKey = pieces[k];
    pieceClass = el.cgRole + el.cgColor;
    anim = anims[k];
    fading = fadings[k];
    if (el.tagName === 'PIECE') {
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
        el.classList.remove('dragging');
        el.style[transform] = translate(posToTranslate(key2pos(k), asWhite, bounds));
        el.cgDragging = false;
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same color
        // (otherwise it could animate a captured piece)
        if (anim && el.cgAnimating && el.cgColor === pieceAtKey.color) {
          translation = posToTranslate(key2pos(k), asWhite, bounds);
          translation[0] += anim[1][0];
          translation[1] += anim[1][1];
          el.style[transform] = translate(translation);
        } else if (el.cgAnimating) {
          translation = posToTranslate(key2pos(k), asWhite, bounds);
          el.style[transform] = translate(translation);
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
            if (movedPieces[pieceClass]) movedPieces[pieceClass].push(el);
            else movedPieces[pieceClass] = [el];
          }
        }
      }
      // no piece: flag as moved
      else {
        if (movedPieces[pieceClass]) movedPieces[pieceClass].push(el);
        else movedPieces[pieceClass] = [el];
      }
    }
    else if (el.tagName === 'SQUARE') {
      const cn = el.className;
      if (squareClassAtKey === cn) sameSquares[k] = true;
      else if (movedSquares[cn]) movedSquares[cn].push(el);
      else movedSquares[cn] = [el];
    }
    el = el.nextSibling;
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (let j = 0, jlen = piecesKeys.length; j < jlen; ++j) {
    k = piecesKeys[j];
    p = pieces[k];
    pieceClass = p.role + p.color;
    anim = anims[k];
    if (!samePieces[k]) {
      mvdset = movedPieces[pieceClass];
      mvd = mvdset && mvdset.pop();
      // a same piece was moved
      if (mvd) {
        // apply dom changes
        mvd.cgKey = k;
        translation = posToTranslate(key2pos(k), asWhite, bounds);
        if (anim) {
          mvd.cgAnimating = true;
          translation[0] += anim[1][0];
          translation[1] += anim[1][1];
        }
        mvd.style[transform] = translate(translation);
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
      mvdset = movedSquares[squares[sk]];
      mvd = mvdset && mvdset.pop();
      translation = posToTranslate(key2pos(sk as Key), asWhite, bounds);
      if (mvd) {
        mvd.cgKey = sk;
        mvd.style[transform] = translate(translation);
      }
      else {
        s.dom.elements.board.appendChild(renderSquareDom(sk as Key, squares[sk], translation, transform));
      }
    }
  }

  // remove any element that remains in the moved sets
  for (let i in movedPieces) removeNodes(s, movedPieces[i]);
  for (let i in movedSquares) removeNodes(s, movedSquares[i]);
}

function removeNodes(s: State, nodes: LolNode[]): void {
  for (let i in nodes) s.dom.elements.board.removeChild(nodes[i]);
}

function renderSquareDom(key: Key, className: string, translation: NumberPair, transform: string): LolNode {
  const s = document.createElement('square') as LolNode;
  s.className = className;
  s.cgKey = key;
  s.style[transform] = translate(translation);
  return s;
}

function renderPieceDom(piece: Piece, key: Key, asWhite: boolean, bounds: ClientRect, anim: AnimVector | undefined, transform: string): LolNode {

  const p = document.createElement('piece') as LolNode;
  p.className = `${piece.role} ${piece.color}`;
  p.cgRole = piece.role;
  p.cgColor = piece.color;
  p.cgKey = key;

  const translation = posToTranslate(key2pos(key), asWhite, bounds);
  if (anim) {
    p.cgAnimating = true;
    translation[0] += anim[1][0];
    translation[1] += anim[1][1];
  }
  p.style[transform] = translate(translation);
  return p;
}

function computeSquareClasses(s: State): SquareClasses {
  const squares: SquareClasses = {};
  let i: any, k: Key;
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

function addSquare(squares: SquareClasses, key: Key, klass: string): void {
  if (squares[key]) squares[key] += ' ' + klass;
  else squares[key] = klass;
}
