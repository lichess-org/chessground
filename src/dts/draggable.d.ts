/// <reference path="chess.d.ts" />

interface DragCurrent {
  orig: Key; // orig key of dragging piece
  pieceHash: string; // hash
  rel: NumberPair; // x; y of the piece at original position
  epos: NumberPair; // initial event position
  pos: NumberPair; // relative current position
  dec: NumberPair; // piece center decay
  over?: Key; // square being moused over
  started: boolean; // whether the drag has started; as per the distance setting
  newPiece?: boolean;
  previouslySelected?: Key;
}
