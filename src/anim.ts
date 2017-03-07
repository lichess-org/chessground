import { State } from './state'
import * as util from './util'
import * as cg from './types'

export type Mutation<A> = (state: State) => A;

export interface AnimVector {
  0: cg.NumberPair; // animation goal
  1: cg.NumberPair; // animation current status
}

export interface AnimVectors {
  [key: string]: AnimVector
}

export interface AnimFadings {
  [key: string]: cg.Piece
}

export interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFadings;
}

export interface AnimCurrent {
  start: cg.Timestamp;
  duration: cg.Milliseconds;
  plan: AnimPlan;
}

// transformation is a function
// accepts board state and any number of arguments,
// and mutates the board.
export function anim<A>(mutation: Mutation<A>, state: State): A {
  return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
}

export function render<A>(mutation: Mutation<A>, state: State): A {
  const result = mutation(state);
  state.dom.redraw();
  return result;
}

interface AnimPiece {
  key: cg.Key;
  pos: cg.Pos;
  piece: cg.Piece;
}
interface AnimPieces {
  [key: string]: AnimPiece
}

function makePiece(key: cg.Key, piece: cg.Piece): AnimPiece {
  return {
    key: key,
    pos: util.key2pos(key),
    piece: piece
  };
}

function closer(piece: AnimPiece, pieces: AnimPiece[]): AnimPiece {
  return pieces.sort((p1, p2) => {
    return util.distanceSq(piece.pos, p1.pos) - util.distanceSq(piece.pos, p2.pos);
  })[0];
}

function computePlan(prevPieces: cg.Pieces, current: State): AnimPlan {
  const bounds = current.dom.bounds(),
  width = bounds.width / 8,
  height = bounds.height / 8,
  anims: AnimVectors = {},
  animedOrigs: cg.Key[] = [],
  fadings: AnimFadings = {},
  missings: AnimPiece[] = [],
  news: AnimPiece[] = [],
  prePieces: AnimPieces = {},
  white = current.orientation === 'white';
  let curP: cg.Piece, preP: AnimPiece, i: any, orig: cg.Pos, dest: cg.Pos, vector: cg.NumberPair;
  for (i in prevPieces) {
    prePieces[i] = makePiece(i as cg.Key, prevPieces[i]);
  }
  for (const key of util.allKeys) {
    curP = current.pieces[key];
    preP = prePieces[key];
    if (curP) {
      if (preP) {
        if (!util.samePiece(curP, preP.piece)) {
          missings.push(preP);
          news.push(makePiece(key, curP));
        }
      } else news.push(makePiece(key, curP));
    } else if (preP) missings.push(preP);
  }
  news.forEach(newP => {
    preP = closer(newP, missings.filter(p => util.samePiece(newP.piece, p.piece)));
    if (preP) {
      orig = white ? preP.pos : newP.pos;
      dest = white ? newP.pos : preP.pos;
      vector = [(orig[0] - dest[0]) * width, (dest[1] - orig[1]) * height];
      anims[newP.key] = [vector, vector];
      animedOrigs.push(preP.key);
    }
  });
  missings.forEach(p => {
    if (
      !util.containsX(animedOrigs, p.key) &&
      !(current.items ? current.items(p.pos, p.key) : false)
    )
    fadings[p.key] = p.piece;
  });

  return {
    anims: anims,
    fadings: fadings
  };
}

function step(state: State): void {
  const cur = state.animation.current;
  if (!cur) { // animation was canceled :(
    state.dom.redrawNow();
    return;
  }
  const rest = 1 - (new Date().getTime() - cur.start) / cur.duration;
  if (rest <= 0) {
    state.animation.current = undefined;
    state.dom.redrawNow();
  } else {
    const ease = easing(rest);
    for (let i in cur.plan.anims) {
      const cfg = cur.plan.anims[i];
      cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)];
    }
    state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
    util.raf(() => step(state));
  }
}

function animate<A>(mutation: Mutation<A>, state: State): A {
  // clone state before mutating it
  const prevPieces: cg.Pieces = {...state.pieces};

  const result = mutation(state);
  const plan = computePlan(prevPieces, state);
  if (!isObjectEmpty(plan.anims) || !isObjectEmpty(plan.fadings)) {
    const alreadyRunning = state.animation.current && state.animation.current.start;
    state.animation.current = {
      start: new Date().getTime(),
      duration: state.animation.duration,
      plan: plan
    };
    if (!alreadyRunning) step(state);
  } else {
    // don't animate, just render right away
    state.dom.redraw();
  }
  return result;
}

function isObjectEmpty(o: any): boolean {
  for (let _ in o) return false;
  return true;
}
// https://gist.github.com/gre/1650294
function easing(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
function roundBy(n: number, by: number): number {
  return Math.round(n * by) / by;
}
