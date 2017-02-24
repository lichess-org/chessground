/// <reference path="config.d.ts" />
/// <reference path="state.d.ts" />

type Constructor = (el: HTMLElement, config?: Config) => Api

interface Api {

  // reconfigure the instance. Accepts all options mentioned above (bar "viewOnly" & "minimalDom").
  // board will be animated accordingly, if animations are enabled.
  set(config: Config): void;

  // read chessground state; write at your own risks.
  state: State;

  getFen(): FEN;
  getMaterialDiff(): MaterialDiff;
  toggleOrientation(): void;
  setPieces(pieces: Pieces): void;
  selectSquare(key: Key): void;
  move(orig: Key, dest: Key): void;
  newPiece(piece: Piece, key: Key): void;
  playPremove(): void;
  playPredrop(validate: (drop: Drop) => boolean): void;
  cancelMove(): void;
  stop(): void;
  cancelPremove(): void;
  cancelPredrop(): void;
  explode(keys: Key[]): void;
  setAutoShapes(shapes: Shape[]): void;
  setShapes(shapes: Shape[]): void;
}
