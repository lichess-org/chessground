import * as board from './board'
import { write as fenWrite } from './fen'
import configure from './configure'
import anim from './anim'
import { cancel as dragCancel } from './drag'
import explosion from './explosion'

// see API types and documentations in dts/api.d.ts
export default function(state: State): Api {

  return {

    set(config) {
      anim(state => configure(state, config), state);
    },

    state,

    getFen: () => fenWrite(state.pieces),

    getMaterialDiff: () => board.getMaterialDiff(state),

    toggleOrientation() {
      anim(board.toggleOrientation, state);
      // if (this.state.redrawCoords) this.state.redrawCoords(this.state.orientation);
      },

    setPieces(pieces) {
      anim(state => board.setPieces(state, pieces), state);
    },

    selectSquare(key) {
      anim(state => board.selectSquare(state, key), state, true);
    },

    move(orig, dest) {
      anim(state => board.baseMove(state, orig, dest), state);
    },

    newPiece(piece, key) {
      anim(state => board.baseNewPiece(state, piece, key), state);
    },

    playPremove() {
      anim(board.playPremove, state);
    },

    playPredrop(validate) {
      anim(state => board.playPredrop(state, validate), state);
    },

    cancelPremove() {
      anim(board.unsetPremove, state, true);
    },

    cancelPredrop() {
      anim(board.unsetPredrop, state, true);
    },

    cancelMove() {
      anim(state => { board.cancelMove(state); dragCancel(state); }, state, true);
    },

    stop() {
      anim(state => { board.stop(state); dragCancel(state); }, state, true);
    },

    explode(keys: Key[]) {
      explosion(state, keys);
    },

    setAutoShapes(shapes: Shape[]) {
      anim(state => state.drawable.autoShapes = shapes, state);
    },

    setShapes(shapes: Shape[]) {
      anim(state => state.drawable.shapes = shapes, state);
    }
  };
}
