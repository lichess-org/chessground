import { State } from './state'
import * as util from './util'
import * as cg from './types'

export type Mutation<A> = (state: State) => A;

// 0,1 animation goal
// 2,3 animation current status
export type AnimVector = cg.NumberQuad

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
  start: DOMHighResTimeStamp;
  frequency: cg.KHz;
  plan: AnimPlan;
}

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
  const anims: AnimVectors = {},
  animedOrigs: cg.Key[] = [],
  fadings: AnimFadings = {},
  missings: AnimPiece[] = [],
  news: AnimPiece[] = [],
  prePieces: AnimPieces = {};
  let curP: cg.Piece | undefined, preP: AnimPiece | undefined, i: any, vector: cg.NumberPair;
  for (i in prevPieces) {
    prePieces[i] = makePiece(i as cg.Key, prevPieces[i]!);
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
      vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
      anims[newP.key] = vector.concat(vector) as AnimVector;
      animedOrigs.push(preP.key);
    }
  });
  missings.forEach(p => {
    if (!util.containsX(animedOrigs, p.key)) fadings[p.key] = p.piece;
  });

  return {
    anims: anims,
    fadings: fadings
  };
}

function step(state: State, now: DOMHighResTimeStamp): void {
  const cur = state.animation.current;
  if (cur === undefined) { // animation was canceled :(
    if (!state.dom.destroyed) state.dom.redrawNow();
    return;
  }
  const rest = 1 - (now - cur.start) * cur.frequency;
  if (rest <= 0) {
    state.animation.current = undefined;
    state.dom.redrawNow();
  } else {
    const ease = easing(rest);
    for (let i in cur.plan.anims) {
      const cfg = cur.plan.anims[i];
      cfg[2] = cfg[0] * ease;
      cfg[3] = cfg[1] * ease;
    }
    state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
    requestAnimationFrame((now = performance.now()) => step(state, now));
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
      start: performance.now(),
      frequency: 1 / state.animation.duration,
      plan: plan
    };
    if (!alreadyRunning) step(state, performance.now());
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
