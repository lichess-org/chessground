type Color = 'white' | 'black';
type Role = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type Key = 'a0' | 'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' | 'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' | 'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' | 'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' | 'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' | 'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' | 'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' | 'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8';
type Fil = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type FEN = string;
type Pos = [number, number];
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

type KeyPair = [Key, Key];

type NumberPair = [number, number];

interface Dests {
  [key: string]: Key[]
}
interface MaterialDiff {
  white: { [role: string]: number }
  black: { [role: string]: number }
}

interface Browser {
  transformProp: string;
  isTrident?: boolean;
}
interface Elements {
  board: HTMLElement;
  over?: HTMLElement;
  ghost?: HTMLElement;
}
interface Dom {
  elements: Elements,
  bounds: ClientRect;
  redraw: () => void;
}
interface Exploding {
  stage: number;
  keys: Key[];
}

interface MoveMetadata {
  premove: boolean;
  ctrlKey?: boolean;
  holdTime?: number;
}

type WindowEvent = 'onscroll' | 'onresize';

type MouchEvent = MouseEvent & TouchEvent;
type LolNode = any; // HTML Node but with custom props

interface CSSStyleDeclaration { [key: string]: any; }

type Redraw = () => void;
type Timestamp = number;
type Milliseconds = number;
