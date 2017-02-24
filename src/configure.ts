import { setCheck, setSelected } from './board'
import { read as fenRead } from './fen'

export default function(state: State, config: Config) {

  // don't merge destinations. Just override.
  if (config.movable && config.movable.dests) state.movable.dests = undefined;

  let configCheck: Color | boolean | undefined = config.check;

  delete config.check;

  merge(state, config);

  // if a fen was provided, replace the pieces
  if (config.fen) {
    state.pieces = fenRead(config.fen);
    state.drawable.shapes = [];
  }

  if (configCheck !== undefined) setCheck(state, configCheck);

  // forget about the last dropped piece
  state.movable.dropped = undefined;

  // fix move/premove dests
  if (state.selected) setSelected(state, state.selected);

  // no need for such short animations
  if (!state.animation.duration || state.animation.duration < 40) state.animation.enabled = false;

  if (!state.movable.rookCastle && state.movable.dests) {
    const rank = state.movable.color === 'white' ? 1 : 8;
    const kingStartPos = 'e' + rank;
    const dests = state.movable.dests[kingStartPos];
    if (!dests || state.pieces[kingStartPos].role !== 'king') return;
    state.movable.dests[kingStartPos] = dests.filter(d => {
      if ((d === 'a' + rank) && dests.indexOf('c' + rank as Key) !== -1) return false;
      if ((d === 'h' + rank) && dests.indexOf('g' + rank as Key) !== -1) return false;
      return true;
    });
  }
};

function merge(base: any, extend: any) {
  for (var key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o: any): boolean {
  return typeof o === 'object';
}
