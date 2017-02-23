/// <reference path="chess.d.ts" />

interface AnimVector {
  0: NumberPair; // animation goal
  1: NumberPair; // animation current status
}

interface AnimVectors {
  [key: string]: AnimVector
}

interface AnimFading {
  pos: Pos;
  opacity: number
  piece: Piece
}

interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFading[];
}
