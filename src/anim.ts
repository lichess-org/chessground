import { State } from './state.js';
import * as util from './util.js';
import * as cg from './types.js';

export type Mutation<A> = (state: State) => A;

// 0,1 animation goal
// 2,3 animation current status
export type AnimVector = cg.NumberQuad;

export type AnimVectors = Map<cg.Key, AnimVector>;

export type AnimFadings = Map<cg.Key, cg.Piece>;

export interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFadings;
  enPassantFading?: cg.Key; // Track en passant fade
}

export interface AnimCurrent {
  start: DOMHighResTimeStamp;
  frequency: cg.KHz;
  plan: AnimPlan;
}

export const anim = <A>(mutation: Mutation<A>, state: State): A =>
  state.animation.enabled ? animate(mutation, state) : render(mutation, state);

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
type AnimPieces = Map<cg.Key, AnimPiece>;

const makePiece = (key: cg.Key, piece: cg.Piece): AnimPiece => ({
  key: key,
  pos: util.key2pos(key),
  piece: piece,
});

const closer = (piece: AnimPiece, pieces: AnimPiece[]): AnimPiece | undefined =>
  pieces.sort((p1, p2) => util.distanceSq(piece.pos, p1.pos) - util.distanceSq(piece.pos, p2.pos))[0];

function computePlan(prevPieces: cg.Pieces, current: State): AnimPlan {
  const anims: AnimVectors = new Map(),
    animedOrigs: cg.Key[] = [],
    fadings: AnimFadings = new Map(),
    missings: AnimPiece[] = [],
    news: AnimPiece[] = [],
    prePieces: AnimPieces = new Map();
  let curP: cg.Piece | undefined, preP: AnimPiece | undefined, vector: cg.NumberPair;
  let enPassantFading: cg.Key | undefined;

  for (const [k, p] of prevPieces) {
    prePieces.set(k, makePiece(k, p));
  }

  for (const key of util.allKeys) {
    curP = current.pieces.get(key);
    preP = prePieces.get(key);
    if (curP) {
      if (preP) {
        if (!util.samePiece(curP, preP.piece)) {
          missings.push(preP);
          news.push(makePiece(key, curP));
        }
      } else news.push(makePiece(key, curP));
    } else if (preP) {
      // Handle en passant capture animation
      if (preP.piece.role === 'pawn' && current.lastMove?.includes(key)) {
        enPassantFading = key;
      } else {
        missings.push(preP);
      }
    }
  }

  for (const newP of news) {
    preP = closer(
      newP,
      missings.filter(p => util.samePiece(newP.piece, p.piece)),
    );
    if (preP) {
      vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
      anims.set(newP.key, vector.concat(vector) as AnimVector);
      animedOrigs.push(preP.key);
    }
  }

  for (const p of missings) {
    if (!animedOrigs.includes(p.key)) {
      fadings.set(p.key, p.piece);
    }
  }

  return {
    anims: anims,
    fadings: fadings,
    enPassantFading: enPassantFading, // Track en passant piece to fade
  };
}

function step(state: State, now: DOMHighResTimeStamp): void {
  const cur = state.animation.current;
  if (!cur) {
    if (!state.dom.destroyed) state.dom.redrawNow();
    return;
  }

  const rest = 1 - (now - cur.start) * cur.frequency;
  if (rest <= 0) {
    state.animation.current = undefined;
    if (cur.plan.enPassantFading) {
      state.pieces.delete(cur.plan.enPassantFading);
    }
    state.dom.redrawNow();
  } else {
    const ease = easing(rest);
    for (const cfg of cur.plan.anims.values()) {
      cfg[2] = cfg[0] * ease;
      cfg[3] = cfg[1] * ease;
    }
    state.dom.redrawNow(true);
    requestAnimationFrame((now = performance.now()) => step(state, now));
  }
}

function animate<A>(mutation: Mutation<A>, state: State): A {
  const prevPieces: cg.Pieces = new Map(state.pieces);
  const result = mutation(state);
  const plan = computePlan(prevPieces, state);

  if (plan.anims.size || plan.fadings.size || plan.enPassantFading) {
    const alreadyRunning = state.animation.current?.start;
    state.animation.current = {
      start: performance.now(),
      frequency: 1 / state.animation.duration,
      plan: plan,
    };
    if (!alreadyRunning) step(state, performance.now());
  } else {
    state.dom.redraw();
  }

  return result;
}

// https://gist.github.com/gre/1650294
const easing = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
