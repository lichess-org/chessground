/// <reference path="chess.d.ts" />
/// <reference path="drawable.d.ts" />
/// <reference path="anim.d.ts" />

interface State {
  pieces: Pieces;
  orientation: Color; // board orientation. white | black
  turnColor: Color; // turn to play. white | black
  check?: Key; // square currently in check "a2"
  lastMove?: Key[]; // squares part of the last move ["c3"; "c4"]
  selected?: Key; // square currently selected "a1"
  coordinates: boolean; // include coords attributes
  autoCastle: boolean; // immediately complete the castle by moving the rook after king move
  viewOnly: boolean; // don't bind events: the user will never be able to move pieces around
  disableContextMenu: boolean; // because who needs a context menu on a chessboard
  resizable: boolean; // listens to chessground.resize on document.body to clear bounds cache
  pieceKey: boolean; // add a data-key attribute to piece elements
  highlight: {
    lastMove: boolean; // add last-move class to squares
    check: boolean; // add check class to squares
    dragOver: boolean // add drag-over class to square when dragging over it
  };
  animation: {
    enabled: boolean;
    duration: number;
    current?: {
      start: Timestamp;
      duration: Milliseconds;
      plan: AnimPlan;
    }
  };
  movable: {
    free: boolean; // all moves are valid - board editor
    color?: Color | 'both'; // color that can move. white | black | both
    dests?: Dests; // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    dropOff: 'revert' | 'trash'; // when a piece is dropped outside the board. "revert" | "trash"
    dropped?: KeyPair; // last dropped [orig; dest]; not to be animated
    showDests: boolean; // whether to add the move-dest class on squares
    events: {
      after?: (orig: Key, dest: Key, metadata: MoveMetadata) => void; // called after the move has been played
      afterNewPiece?: (role: Role, pos: Pos) => void; // called after a new piece is dropped on the board
    };
    rookCastle: boolean // castle by moving the king to the rook
  };
  premovable: {
    enabled: boolean; // allow premoves for color that can not move
    showDests: boolean; // whether to add the premove-dest class on squares
    castle: boolean; // whether to allow king castle premoves
    dests?: Key[]; // premove destinations for the current selection
    current?: KeyPair; // keys of the current saved premove ["e2" "e4"]
    events: {
      set?: (orig: Key, dest: Key) => void; // called after the premove has been set
      unset?: () => void;  // called after the premove has been unset
    }
  };
  predroppable: {
    enabled: boolean; // allow predrops for color that can not move
    current?: { // current saved predrop {role: 'knight'; key: 'e4'}
      role: Role;
      key: Key
    };
    events: {
      set?: (role: Role, key: Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    }
  };
  draggable: {
    enabled: boolean; // allow moves & premoves to use drag'n drop
    distance: number; // minimum distance to initiate a drag; in pixels
    autoDistance: boolean; // lets chessground set distance to zero when user drags pieces
    centerPiece: boolean; // center the piece on cursor at drag start
    showGhost: boolean; // show ghost of piece being dragged
    current?: {
      orig: Key; // orig key of dragging piece
      pieceHash: string; // hash
      rel: NumberPair; // x; y of the piece at original position
      epos: NumberPair; // initial event position
      pos: NumberPair; // relative current position
      dec: NumberPair; // piece center decay
      over?: Key; // square being moused over
      started: boolean; // whether the drag has started; as per the distance setting
      newPiece?: boolean;
      previouslySelected?: Key;
    }
  };
  selectable: {
    // disable to enforce dragging over click-click move
    enabled: boolean
  };
  stats: {
    // was last piece dragged or clicked?
    // needs default to false for touch
    dragged: boolean,
    ctrlKey?: boolean
  };
  events: {
    change?: () => void; // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {color: 'white'; 'role': 'queen'}
    move?: (orig: Key, dest: Key, capturedPiece?: Piece) => void;
    dropNewPiece?: (role: Role, pos: Pos) => void;
    select?: (key: Key) => void // called when a square is selected
  };
  items?: (pos: Pos, key: Key) => any | undefined; // items on the board { render: key -> vdom }
  drawable: Drawable,
  editable: {
    enabled: boolean;
    selected: Piece | 'pointer' | 'trash';
  }
  exploding?: Exploding;
  dom: Dom
}
