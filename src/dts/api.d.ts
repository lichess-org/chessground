/// <reference path="config.d.ts" />
/// <reference path="data.d.ts" />

type Constructor = (el: HTMLElement, config?: Config) => Api

interface Api {
  data: Data;
  getFen(): FEN;
  getMaterialDiff(): MaterialDiff;
  set(config: Config): void;
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
