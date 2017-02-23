/// <reference path="chess.d.ts" />

interface Config {
  fen?: FEN; // chess position in Forsyth notation
  orientation?: Color; // board orientation. white | black
  turnColor?: Color; // turn to play. white | black
  check?: Color | boolean; // true for current color, false to unset
  lastMove?: Key[]; // squares part of the last move ["c3", "c4"]
  selected?: Key; // square currently selected "a1"
  coordinates?: boolean; // include coords attributes
  autoCastle?: boolean; // immediately complete the castle by moving the rook after king move
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu?: boolean; // because who needs a context menu on a chessboard
  resizable?: boolean; // listens to chessground.resize on document.body to clear bounds cache
  // pieceKey: boolean; // add a data-key attribute to piece elements
  highlight?: {
    lastMove?: boolean; // add last-move class to squares
    check?: boolean; // add check class to squares
    dragOver?: boolean // add drag-over class to square when dragging over it
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    color?: Color | 'both'; // color that can move. white | black | both | undefined
    dests?: {
      [key: string]: Key[]
    }; // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    dropOff?: 'revert' | 'trash'; // when a piece is dropped outside the board. "revert" | "trash"
    showDests?: boolean; // whether to add the move-dest class on squares
    events?: {
      after?: (orig: Key, dest: Key, metadata: any) => void; // called after the move has been played
      afterNewPiece?: (role: Role, pos: Pos) => void; // called after a new piece is dropped on the board
    };
    rookCastle?: boolean // castle by moving the king to the rook
  };
  premovable?: {
    enabled?: boolean; // allow premoves for color that can not move
    showDests?: boolean; // whether to add the premove-dest class on squares
    castle?: boolean; // whether to allow king castle premoves
    dests?: Key[]; // premove destinations for the current selection
    events?: {
      set?: (orig: Key, dest: Key) => void; // called after the premove has been set
      unset?: () => void;  // called after the premove has been unset
    }
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for color that can not move
    events?: {
      set?: (role: Role, key: Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    }
  };
  draggable?: {
    enabled?: boolean; // allow moves & premoves to use drag'n drop
    distance?: number; // minimum distance to initiate a drag; in pixels
    autoDistance?: boolean; // lets chessground set distance to zero when user drags pieces
    centerPiece?: boolean; // center the piece on cursor at drag start
    showGhost?: boolean; // show ghost of piece being dragged
  };
  selectable?: {
    // disable to enforce dragging over click-click move
    enabled?: boolean
  };
  events?: {
    change?: () => void; // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {color: 'white'; 'role': 'queen'}
    move?: (orig: Key, dest: Key, capturedPiece?: Piece) => void;
    dropNewPiece?: (role: Role, pos: Pos) => void;
    select?: (key: Key) => void // called when a square is selected
  };
  items?: (pos: Pos, key: Key) => any | undefined; // items on the board { render: key -> vdom }
  // drawable: Drawable,
  editable?: {
    enabled?: boolean;
    selected?: Piece | 'pointer' | 'trash';
  }
}
