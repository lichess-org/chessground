type Color = 'white' | 'black';
type Role = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type Key = 'a0' | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';
type Fil = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type FEN = string;
interface Pos {
  0: number;
  1: number;
}
interface Piece {
  role: Role;
  color: Color;
}
interface Drop {
  role: Role;
  key: Key;
}
interface Pieces {
  [key: string]: Piece;
}
interface Shape {
  brush: string;
  orig: Key;
  dest?: Key
}
interface Brush {
  key: string;
  color: string;
  opacity: number;
  lineWidth: number
}
interface KeyPair {
  0: Key;
  1: Key;
  [i: number]: Key
}
interface NumberPair {
  0: number;
  1: number;
}
interface AnimVector {
  0: NumberPair; // animation goal
  1: NumberPair; // animation current status
}
interface AnimVectors {
  [key: string]: AnimVector
}
interface AnimFading {
  pos: Pos;
  opacity: number
  piece: Piece
}
interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFading[];
}
interface MaterialDiff {
  white: { [role: string]: number }
  black: { [role: string]: number }
}

interface Data {
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
    dests?: {
      [key: string]: Key[]
    }; // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    dropOff: 'revert' | 'trash'; // when a piece is dropped outside the board. "revert" | "trash"
    dropped?: KeyPair; // last dropped [orig; dest]; not to be animated
    showDests: boolean; // whether to add the move-dest class on squares
    events: {
      after?: (orig: Key, dest: Key, metadata: any) => void; // called after the move has been played
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
      rel: NumberPair; // x; y of the piece at original position
      pos: NumberPair; // relative current position
      dec: NumberPair; // piece center decay
      over: Key; // square being moused over
      started: boolean; // whether the drag has started; as per the distance setting
      newPiece?: boolean
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
  drawable: {
    enabled: boolean; // allows SVG drawings
    eraseOnClick: boolean;
    onChange?: (shapes: Shape[]) => void;
    shapes: Shape[]; // user shapes
    autoShapes: Shape[]; // computer shapes
    current?: {
      orig: Key; // orig key of drawing
      pos: NumberPair // relative current position
      dest: Key // square being moused over
      brush: string // brush name for shape
    };
    brushes: {
      [name: string]: Brush
    };
    // drawable SVG pieces; used for crazyhouse drop
    pieces: {
      baseUrl: string
    }
  }
}

interface State {
  exploding?: Exploding;
  sparePieceSelected?: Role | 'pointer';
}
interface Exploding {
  stage: number;
  keys: Key[];
}

interface Window {
  [key: string]: any
}

type Redraw = () => void;
type Timestamp = number;
type Milliseconds = number;
