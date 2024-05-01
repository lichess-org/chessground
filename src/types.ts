export type Color = (typeof colors)[number];
export type Role = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type File = (typeof files)[number];
export type Rank = (typeof ranks)[number];
export type Key = 'a0' | `${File}${Rank}`;
export type FEN = string;
export type Pos = [number, number];

export interface Piece {
  role: Role;
  color: Color;
  promoted?: boolean;
}

export interface Drop {
  role: Role;
  key: Key;
}

export type Pieces = Map<Key, Piece>;
export type PiecesDiff = Map<Key, Piece | undefined>;

export type KeyPair = [Key, Key];

export type NumberPair = [number, number];

export type NumberQuad = [number, number, number, number];

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type Dests = Map<Key, Key[]>;

export interface Elements {
  board: HTMLElement;
  wrap: HTMLElement;
  container: HTMLElement;
  ghost?: HTMLElement;
  svg?: SVGElement;
  customSvg?: SVGElement;
  autoPieces?: HTMLElement;
}

export interface Dom {
  elements: Elements;
  bounds: Memo<DOMRectReadOnly>;
  redraw: () => void;
  redrawNow: (skipSvg?: boolean) => void;
  unbind?: Unbind;
  destroyed?: boolean;
}

export interface Exploding {
  stage: number;
  keys: readonly Key[];
}

export interface MoveMetadata {
  premove: boolean;
  ctrlKey?: boolean;
  holdTime?: number;
  captured?: Piece;
  predrop?: boolean;
}

export interface SetPremoveMetadata {
  ctrlKey?: boolean;
}

export type MouchEvent = Event & Partial<MouseEvent & TouchEvent>;

export interface KeyedNode extends HTMLElement {
  cgKey: Key;
}

export interface PieceNode extends KeyedNode {
  tagName: 'PIECE';
  cgPiece: string;
  cgAnimating?: boolean;
  cgFading?: boolean;
  cgDragging?: boolean;
  cgScale?: number;
}

export interface SquareNode extends KeyedNode {
  tagName: 'SQUARE';
}

export interface Memo<A> {
  (): A;

  clear: () => void;
}

export interface Timer {
  start: () => void;
  cancel: () => void;
  stop: () => number;
}

export type Redraw = () => void;
export type Unbind = () => void;
export type Milliseconds = number;
export type KHz = number;

export const colors = ['white', 'black'] as const;
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
export const cases = {
  'a': ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'],
  'b': ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'],
  'c': ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
  'd': ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'],
  'e': ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  'f': ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'],
  'g': ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'],
  'h': ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8']
} as {[key: string]: string[]};

// TODO: validate from: export type RanksPosition = 'left' | 'right';
export type RanksPosition = 'left' | 'right' | 'on-square';

export type BrushColor = 'green' | 'red' | 'blue' | 'yellow';

export type SquareClasses = Map<Key, string>;
