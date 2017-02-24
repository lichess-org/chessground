/// <reference path="config.d.ts" />
/// <reference path="state.d.ts" />

type Constructor = (el: HTMLElement, config?: Config) => Api

interface Api {

  // reconfigure the instance. Accepts all config options, except for viewOnly & minimalDom.
  // board will be animated accordingly, if animations are enabled.
  set(config: Config): void;

  // read chessground state; write at your own risks.
  state: State;

  // get the position as a FEN string (only contains pieces, no flags)
  // e.g. rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
  getFen(): FEN;

  // change the view angle
  toggleOrientation(): void;

  // perform a move programmatically
  move(orig: Key, dest: Key): void;

  // add and/or remove arbitrary pieces on the board
  setPieces(pieces: Pieces): void;

  // click a square programmatically
  selectSquare(key: Key): void;

  // put a new piece on the board
  newPiece(piece: Piece, key: Key): void;

  // play the current premove, if any
  playPremove(): void;

  // cancel the current premove, if any
  cancelPremove(): void;

  // play the current predrop, if any
  playPredrop(validate: (drop: Drop) => boolean): void;

  // cancel the current predrop, if any
  cancelPredrop(): void;

  // cancel the current move being made
  cancelMove(): void;

  // cancel current move and prevent further ones
  stop(): void;

  // get the material difference between white and black
  // {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
  getMaterialDiff(): MaterialDiff;

  // make squares explode (atomic chess)
  explode(keys: Key[]): void;

  // programmatically draw user shapes
  setShapes(shapes: Shape[]): void;

  // programmatically draw auto shapes
  setAutoShapes(shapes: Shape[]): void;
}
