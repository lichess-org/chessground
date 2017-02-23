import * as board from './board'
import { write as fenWrite } from './fen'
import configure from './configure'
import anim from './anim'
import * as drag from './drag'
import explosion from './explosion'

export interface Api {
  data: Data;
  getFen(): FEN;
  getMaterialDiff(): MaterialDiff;
  set(config: any): void;
  toggleOrientation(): void;
  setPieces(pieces: Pieces): void;
  selectSquare(key: Key): void;
  apiMove(orig: Key, dest: Key): void;
  apiNewPiece(piece: Piece, key: Key): void;
  playPremove(): void;
  playPredrop(validate: (drop: Drop) => boolean): void;
  cancelMove(): void;
  stop(): void;
  cancelPremove(): void;
  cancelPredrop(): void;
  setCheck(color?: Color): void;
  explode(keys: Key[]): void;
  setAutoShapes(shapes: Shape[]): void;
  setShapes(shapes: Shape[]): void;
};

export default function(data: Data): Api {

  return {

    data,

    getFen: () => fenWrite(data.pieces),

    getMaterialDiff: () => board.getMaterialDiff(data),

    set(config) {
      anim(data => configure(data, config), data);
    },

    toggleOrientation() {
      anim(board.toggleOrientation, data);
      // if (this.data.redrawCoords) this.data.redrawCoords(this.data.orientation);
      },

    setPieces(pieces) {
      anim(data => board.setPieces(data, pieces), data);
    },

    selectSquare(key) {
      anim(data => board.selectSquare(data, key), data, true);
    },

    apiMove(orig, dest) {
      anim(data => board.baseMove(data, orig, dest), data);
    },

    apiNewPiece(piece, key) {
      anim(data => board.baseNewPiece(data, piece, key), data);
    },

    playPremove() {
      anim(board.playPremove, data);
    },

    playPredrop(validate) {
      anim(data => board.playPredrop(data, validate), data);
    },

    cancelPremove() {
      anim(board.unsetPremove, data, true);
    },

    cancelPredrop() {
      anim(board.unsetPredrop, data, true);
    },

    setCheck(color) {
      anim(data => board.setCheck(data, color), data, true);
    },

    cancelMove() {
      anim(data => { board.cancelMove(data); drag.cancel(data); }, data, true);
    },

    stop() {
      anim(data => { board.stop(data); drag.cancel(data); }, data, true);
    },

    explode(keys: Key[]) {
      explosion(data, keys);
    },

    setAutoShapes(shapes: Shape[]) {
      anim(data => data.drawable.autoShapes = shapes, data);
    },

    setShapes(shapes: Shape[]) {
      anim(data => data.drawable.shapes = shapes, data);
    }
  };
}
