import { setCheck, setSelected, unsetPremove } from './board.js';
import { type DrawBrushes, type DrawShape } from './draw.js';
import { read as fenRead } from './fen.js';
import { type HeadlessState } from './state.js';
import type * as cg from './types.js';

export interface Config {
  fen?: cg.FEN; // chess position in Forsyth notation
  orientation?: cg.Color; // board orientation. white | black
  turnColor?: cg.Color; // turn to play. white | black
  check?: cg.Color | boolean; // true for current color, false to unset
  lastMove?: cg.Key[]; // squares part of the last move ["c3", "c4"]
  selected?: cg.Key; // square currently selected "a1"
  coordinates?: boolean; // include coords attributes
  coordinatesOnSquares?: boolean; // include coords attributes on every square
  ranksPosition?: cg.RanksPosition; // render rank coords on the right (default) or the left
  autoCastle?: boolean; // immediately complete the castle by moving the rook after king move
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu?: boolean; // because who needs a context menu on a chessboard
  addPieceZIndex?: boolean; // adds z-index values to pieces (for 3D)
  addDimensionsCssVarsTo?: HTMLElement; // add ---cg-width and ---cg-height CSS vars containing the board's dimensions to this element
  blockTouchScroll?: boolean; // block scrolling via touch dragging on the board, e.g. for coordinate training
  touchIgnoreRadius?: number; // ignore touches within a radius of an occupied square, in units of its circumradius
  trustAllEvents?: boolean; // disable checking for human only input (e.isTrusted)
  jsHover?: boolean; // enable JS-driven hover state handling to workaround Safari drag issue
  highlight?: {
    lastMove?: boolean; // add last-move class to squares
    check?: boolean; // add check class to squares
    custom?: cg.SquareClasses; // add custom classes to custom squares
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    color?: cg.Color | 'both'; // color that can move. white | black | both | undefined
    dests?: cg.Dests; // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    showDests?: boolean; // whether to add the move-dest class on squares
    events?: {
      after?: (orig: cg.Key, dest: cg.Key, metadata: cg.MoveMetadata) => void; // called after the move has been played
      afterNewPiece?: (role: cg.Role, key: cg.Key, metadata: cg.MoveMetadata) => void; // called after a new piece is dropped on the board
    };
    rookCastle?: boolean; // castle by moving the king to the rook
  };
  premovable?: {
    enabled?: boolean; // allow premoves for color that can not move
    showDests?: boolean; // whether to add the premove-dest class on squares
    castle?: boolean; // whether to allow king castle premoves
    dests?: cg.Key[]; // premove destinations for the current selection
    customDests?: cg.Dests; // use custom valid premoves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    maxCount?: number; // maximum queued premoves; 1 keeps the legacy single-premove behaviour
    additionalPremoveRequirements?: cg.Mobility;
    events?: {
      set?: (orig: cg.Key, dest: cg.Key, metadata?: cg.SetPremoveMetadata) => void; // called after a premove has been set
      unset?: () => void; // called after the premove queue has been cleared
    };
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for color that can not move
    events?: {
      set?: (role: cg.Role, key: cg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    };
  };
  draggable?: {
    enabled?: boolean; // allow moves & premoves to use drag'n drop
    distance?: number; // minimum distance to initiate a drag; in pixels
    autoDistance?: boolean; // lets chessground set distance to zero when user drags pieces
    showGhost?: boolean; // show ghost of piece being dragged
    deleteOnDropOff?: boolean; // delete a piece when it is dropped off the board
  };
  selectable?: {
    // disable to enforce dragging over click-click move
    enabled?: boolean;
  };
  events?: {
    change?: () => void; // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {color: 'white'; 'role': 'queen'}
    move?: (orig: cg.Key, dest: cg.Key, capturedPiece?: cg.Piece) => void;
    dropNewPiece?: (piece: cg.Piece, key: cg.Key) => void;
    select?: (key: cg.Key) => void; // called when a square is selected
    insert?: (elements: cg.Elements) => void; // called when the board DOM has been (re)inserted
  };
  drawable?: {
    enabled?: boolean; // can draw
    visible?: boolean;
    defaultSnapToValidMove?: boolean;
    // Clicking an empty square or immovable piece will clear the drawing regardless, but when this property is true,
    // clicking on a (currently unselected) movable piece will also clear the drawing.
    eraseOnMovablePieceClick?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    brushes?: DrawBrushes;
    onChange?: (shapes: DrawShape[]) => void; // called after drawable shapes change
  };
}

export function applyAnimation(state: HeadlessState, config: Config): void {
  if (config.animation) {
    deepMerge(state.animation, config.animation);
    // no need for such short animations
    if ((state.animation.duration || 0) < 70) state.animation.enabled = false;
  }
}

export function configure(state: HeadlessState, config: Config): void {
  // A live preference change must never leave a speculative queue armed behind
  // a disabled premove setting. Restore the authoritative pieces before applying
  // the new configuration so a later playPremove() cannot execute stale input.
  if (config.premovable?.enabled === false && state.premovable.queue.length) unsetPremove(state);
  // Switching multiple -> single keeps the queue head, cancels the dependent
  // tail and removes the speculative preview. This mirrors the compatibility
  // behavior of a legacy single premove rather than silently discarding the head.
  else if (
    config.premovable?.maxCount !== undefined &&
    config.premovable.maxCount <= 1 &&
    state.premovable.maxCount > 1 &&
    state.premovable.queue.length
  ) {
    const head = state.premovable.queue[0];
    if (state.premovable.basePieces) state.pieces = new Map(state.premovable.basePieces);
    state.premovable.queue = [head];
    state.premovable.current = head;
    state.premovable.basePieces = undefined;
  }

  // don't merge destinations and autoShapes. Just override.
  if (config.movable?.dests) state.movable.dests = undefined;
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];

  deepMerge(state, config);

  // if a fen was provided, replace the pieces
  if (config.fen) {
    state.pieces = fenRead(config.fen);
    state.drawable.shapes = config.drawable?.shapes || [];
    // A server/parent position update becomes the new authoritative base for any
    // queued premoves. playPremove() will validate the queue head against these
    // real pieces before rebuilding the speculative preview for the remaining tail.
    if (state.premovable.maxCount > 1 && state.premovable.queue.length)
      state.premovable.basePieces = new Map(state.pieces);
  }

  // apply config values that could be undefined yet meaningful
  if ('check' in config) setCheck(state, config.check || false);
  if ('lastMove' in config && !config.lastMove) state.lastMove = undefined;
  // in case of ZH drop last move, there's a single square.
  // if the previous last move had two squares,
  // the merge algorithm will incorrectly keep the second square.
  else if (config.lastMove) state.lastMove = config.lastMove;

  // fix move/premove dests
  if (state.selected) setSelected(state, state.selected);

  applyAnimation(state, config);

  if (!state.movable.rookCastle && state.movable.dests) {
    const rank = state.movable.color === 'white' ? '1' : '8',
      kingStartPos = ('e' + rank) as cg.Key,
      dests = state.movable.dests.get(kingStartPos),
      king = state.pieces.get(kingStartPos);
    if (!dests || !king || king.role !== 'king') return;
    state.movable.dests.set(
      kingStartPos,
      dests.filter(
        d =>
          !(d === 'a' + rank && dests.includes(('c' + rank) as cg.Key)) &&
          !(d === 'h' + rank && dests.includes(('g' + rank) as cg.Key)),
      ),
    );
  }
}

function deepMerge(base: any, extend: any): void {
  for (const key in extend) {
    if (key === '__proto__' || key === 'constructor' || !Object.prototype.hasOwnProperty.call(extend, key))
      continue;
    if (
      Object.prototype.hasOwnProperty.call(base, key) &&
      isPlainObject(base[key]) &&
      isPlainObject(extend[key])
    )
      deepMerge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isPlainObject(o: unknown): boolean {
  if (typeof o !== 'object' || o === null) return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}
