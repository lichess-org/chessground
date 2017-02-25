/// <reference path="chess.d.ts" />

interface AnimVector {
  0: NumberPair; // animation goal
  1: NumberPair; // animation current status
}

interface AnimVectors {
  [key: string]: AnimVector
}

interface AnimFadings {
  [key: string]: Piece
}

interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFadings;
}

interface AnimCurrent {
  start: Timestamp;
  duration: Milliseconds;
  plan: AnimPlan;
}
