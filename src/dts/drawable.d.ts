/// <reference path="chess.d.ts" />

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
  pos: NumberPair; // relative current position
  brush: string; // brush name for shape
}

