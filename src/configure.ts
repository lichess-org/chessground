// import { setCheck, setSelected } from './board'
import { read as fenRead } from './fen'

export default function(data: Data, config: any) {

  if (!config) return;

  // don't merge destinations. Just override.
  if (config.movable && config.movable.dests) data.movable.dests = undefined;

  merge(data, config);

  // if a fen was provided, replace the pieces
  if (config.fen) {
    data.pieces = fenRead(config.fen);
    data.check = config.check;
    data.drawable.shapes = [];
  }

  // if (data.check === true) board.setCheck(data);

  // forget about the last dropped piece
  data.movable.dropped = undefined;

  // fix move/premove dests
  // if (data.selected) board.setSelected(data, data.selected);

  // no need for such short animations
  if (!data.animation.duration || data.animation.duration < 40)
  data.animation.enabled = false;

  // if (!data.movable.rookCastle) {
  //   var rank = data.movable.color === 'white' ? 1 : 8;
  //   var kingStartPos = 'e' + rank;
  //   if (data.movable.dests) {
  //     var dests = data.movable.dests[kingStartPos];
  //     if (!dests || data.pieces[kingStartPos].role !== 'king') return;
  //     data.movable.dests[kingStartPos] = dests.filter(function(d) {
  //       if ((d === 'a' + rank) && dests.indexOf('c' + rank) !== -1) return false;
  //       if ((d === 'h' + rank) && dests.indexOf('g' + rank) !== -1) return false;
  //       return true;
  //     });
  //   }
  // }
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
