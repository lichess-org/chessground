  type Color = 'white' | 'black';
  type Role = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
  type Key = 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';
  type Fil = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
  type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  interface Pos {
    0: number;
    1: number;
  }
  type Piece = {
    role: Role;
    color: Color;
  }
  interface Drop {
    role: Role;
    key: Key;
  }
  type Bounds = {
    top: number;
    left: number;
    width: number;
    height: number;
  }
  type Pieces = {
    [pos: string]: Piece;
  };

  interface SetConfig {
    orientation?: Color;
    fen?: string;
    lastMove?: [Key, Key];
    check?: boolean;
    turnColor?: Color;
    movableColor?: Color;
    dests?: {[index: string]: Array<Key>};
  }

  interface Controller {
    data: any;
    getFen(): string;
    set(cfg: SetConfig): void;
    reconfigure(cfg: any): void;
    toggleOrientation(): void;
    setPieces(pieces: Pieces): void;
    setDragPiece(key: Key, piece: Piece, dragOpts: any): void;
    selectSquare(key: Key): void;
    apiMove(orig: Key, dest: Key, pieces?: Pieces, config?: SetConfig): void;
    apiNewPiece(piece: Piece, key: Key, config?: SetConfig): void;
    playPremove(): void;
    playPredrop(validate: (drop: Drop) => boolean): void;
    cancelPremove(): void;
    cancelPredrop(): void;
    setCheck(color: Color): void;
    cancelMove(): void;
    stop(): void;
    explode(keys: Array<Key>): void;
    setBounds(bounds: Bounds): void;
    unload(): void;
  }

  interface Api {
    set(cfg: SetConfig): void
    toggleOrientation(): void
    getOrientation(): Color
    setBounds(bounds: Bounds): void;
    getPieces(): Pieces
    getMaterialDiff(): any
    getFen(): string
    dump(): any
    move(orig: Key, dest: Key, pieces?: Pieces, config?: SetConfig): void;
    setPieces(pieces: Pieces): void;
    setCheck(color: Color): void;
    playPremove(): void;
    cancelPremove(): void;
    cancelMove(): void;
    stop(): void;
    explode(keys: Array<Key>): void;
  }
