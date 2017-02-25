/// <reference path="chess.d.ts" />

interface Shape {
  orig: Key;
  dest?: Key;
  brush: string;
  brushModifiers?: BrushModifiers;
  piece?: ShapePiece;
}

interface ShapePiece {
  role: Role;
  color: Color;
  scale?: number;
}

interface Brush {
  key: string;
  color: string;
  opacity: number;
  lineWidth: number
}

interface BrushModifiers {
  color?: string;
  opacity?: number;
  lineWidth?: number;
}

interface Drawable {
  enabled: boolean; // allows SVG drawings
  eraseOnClick: boolean;
  onChange?: (shapes: Shape[]) => void;
  shapes: Shape[]; // user shapes
  autoShapes: Shape[]; // computer shapes
  current?: DrawableCurrent;
  brushes: {
    [name: string]: Brush
  };
  // drawable SVG pieces; used for crazyhouse drop
  pieces: {
    baseUrl: string
  }
}

interface DrawableCurrent {
  orig: Key; // orig key of drawing
  dest?: Key; // square being moused over, if != orig
  destPrev?: Key; // square previously moused over
  pos: NumberPair; // relative current position
  brush: string; // brush name for shape
}

