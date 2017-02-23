import * as board from './board'
import { write as fenWrite } from './fen'
import configure from './configure'
import anim from './anim'
import { cancel as dragCancel } from './drag'
import explosion from './explosion'

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

    move(orig, dest) {
      anim(data => board.baseMove(data, orig, dest), data);
    },

    newPiece(piece, key) {
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

    cancelMove() {
      anim(data => { board.cancelMove(data); dragCancel(data); }, data, true);
    },

    stop() {
      anim(data => { board.stop(data); dragCancel(data); }, data, true);
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
