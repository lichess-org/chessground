import * as cg from './types.js';

export const invRanks: readonly cg.Rank[] = [...cg.ranks].reverse();

export const allKeys: readonly cg.Key[] = cg.files.flatMap(f => cg.ranks.map(r => (f + r) as cg.Key));

export const pos2key = (pos: cg.Pos): cg.Key => allKeys[8 * pos[0] + pos[1]];

export const key2pos = (k: cg.Key): cg.Pos => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];

export const uciToMove = (uci: string | undefined): cg.Key[] | undefined => {
  if (!uci) return undefined;
  if (uci[1] === '@') return [uci.slice(2, 4) as cg.Key];
  return [uci.slice(0, 2), uci.slice(2, 4)] as cg.Key[];
};

export const allPos: readonly cg.Pos[] = allKeys.map(key2pos);

export function memo<A>(f: () => A): cg.Memo<A> {
  let v: A | undefined;
  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => {
    v = undefined;
  };
  return ret;
}

export const timer = (): cg.Timer => {
  let startAt: number | undefined;
  return {
    start() {
      startAt = performance.now();
    },
    cancel() {
      startAt = undefined;
    },
    stop() {
      if (!startAt) return 0;
      const time = performance.now() - startAt;
      startAt = undefined;
      return time;
    },
  };
};

export const opposite = (c: cg.Color): cg.Color => (c === 'white' ? 'black' : 'white');

export const distanceSq = (pos1: cg.Pos, pos2: cg.Pos): number =>
  (pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2;

export const samePiece = (p1: cg.Piece, p2: cg.Piece): boolean =>
  p1.role === p2.role && p1.color === p2.color;

export const samePos = (p1: cg.Pos, p2: cg.Pos): boolean => p1[0] === p2[0] && p1[1] === p2[1];

export const posToTranslate =
  (bounds: DOMRectReadOnly): ((pos: cg.Pos, asWhite: boolean) => cg.NumberPair) =>
  (pos, asWhite) => [
    ((asWhite ? pos[0] : 7 - pos[0]) * bounds.width) / 8,
    ((asWhite ? 7 - pos[1] : pos[1]) * bounds.height) / 8,
  ];

export const translate = (el: HTMLElement, pos: cg.NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateAndScale = (el: HTMLElement, pos: cg.NumberPair, scale = 1): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
};

export const setVisible = (el: HTMLElement, v: boolean): void => {
  el.style.visibility = v ? 'visible' : 'hidden';
};

export const eventPosition = (e: cg.MouchEvent): cg.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};

export const isRightButton = (e: cg.MouchEvent): boolean => e.button === 2;

export const createEl = (tagName: string, className?: string): HTMLElement => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export function computeSquareCenter(key: cg.Key, asWhite: boolean, bounds: DOMRectReadOnly): cg.NumberPair {
  const pos = key2pos(key);
  if (!asWhite) {
    pos[0] = 7 - pos[0];
    pos[1] = 7 - pos[1];
  }
  return [
    bounds.left + (bounds.width * pos[0]) / 8 + bounds.width / 16,
    bounds.top + (bounds.height * (7 - pos[1])) / 8 + bounds.height / 16,
  ];
}

export const diff = (a: number, b: number): number => Math.abs(a - b);

export const knightDir: cg.DirectionalCheck = (x1, y1, x2, y2) => diff(x1, x2) * diff(y1, y2) === 2;

export const rookDir: cg.DirectionalCheck = (x1, y1, x2, y2) => (x1 === x2) !== (y1 === y2);

export const bishopDir: cg.DirectionalCheck = (x1, y1, x2, y2) => diff(x1, x2) === diff(y1, y2) && x1 !== x2;

export const queenDir: cg.DirectionalCheck = (x1, y1, x2, y2) =>
  rookDir(x1, y1, x2, y2) || bishopDir(x1, y1, x2, y2);

export const kingDirNonCastling: cg.DirectionalCheck = (x1, y1, x2, y2) =>
  Math.max(diff(x1, x2), diff(y1, y2)) === 1;

export const pawnDirCapture = (x1: number, y1: number, x2: number, y2: number, isDirectionUp: boolean) =>
  diff(x1, x2) === 1 && y2 === y1 + (isDirectionUp ? 1 : -1);

export const pawnDirAdvance = (x1: number, y1: number, x2: number, y2: number, isDirectionUp: boolean) => {
  const step = isDirectionUp ? 1 : -1;
  return (
    x1 === x2 &&
    (y2 === y1 + step ||
      // allow 2 squares from first two ranks, for horde
      (y2 === y1 + 2 * step && (isDirectionUp ? y1 <= 1 : y1 >= 6)))
  );
};

/** Returns all board squares between (x1, y1) and (x2, y2) exclusive,
 *  along a straight line (rook or bishop path). Returns [] if not aligned, or none between.
 */
export const squaresBetween = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  exclusive: boolean,
): cg.Key[] => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Must be a straight or diagonal line
  if (dx && dy && Math.abs(dx) !== Math.abs(dy)) return [];
  const stepX = Math.sign(dx),
    stepY = Math.sign(dy);
  const squares: cg.Pos[] = [];
  if (!exclusive) squares.push([x1, y1]);
  let x = x1 + stepX,
    y = y1 + stepY;
  while (x !== x2 || y !== y2) {
    squares.push([x, y]);
    x += stepX;
    y += stepY;
  }
  if (!exclusive && (dx || dy)) squares.push([x2, y2]);
  return squares.map(sq => pos2key(sq));
};

export const horizontallyAdjacentSquares = (square: cg.Key): cg.Key[] => {
  const pos = key2pos(square);
  const adjacentSquares: cg.Pos[] = [];
  if (pos[0] > 0) adjacentSquares.push([pos[0] - 1, pos[1]]);
  if (pos[0] < 7) adjacentSquares.push([pos[0] + 1, pos[1]]);
  return adjacentSquares.map(pos2key);
};

export const squareShiftedVertically = (square: cg.Key, delta: number): cg.Key => {
  const pos = key2pos(square);
  pos[1] += delta;
  return pos2key(pos);
};

export const findSquareOfPiece = (pieces: cg.Pieces, role: cg.Role, color: cg.Color): cg.Key | undefined => {
  for (const [key, piece] of pieces) {
    if (piece.role === role && piece.color === color) {
      return key;
    }
  }
  return undefined;
};

export const makeCastlingPrivileges = (valForAll: boolean): cg.CastlePrivileges => {
  return { white: { kside: valForAll, qside: valForAll }, black: { kside: valForAll, qside: valForAll } };
};

export const castlingPrivilegesFromFen = (fen: cg.FEN, pieces: cg.Pieces): cg.CastlePrivileges => {
  const castlePart = fen.split(/\s+/)[2];
  const castlePrivileges = makeCastlingPrivileges(false);
  if (castlePart === '-') return castlePrivileges;
  for (const color of cg.colors) {
    const kingSq = findSquareOfPiece(pieces, 'king', color);
    for (const side of cg.castleSides) {
      if (!kingSq) castlePrivileges[color][side] = false;
      else if (!castlePart) castlePrivileges[color][side] = true;
      else
        castlePrivileges[color][side] = castlePart
          .split('')
          .filter(c => c === (color === 'white' ? c.toUpperCase() : c.toLowerCase()))
          .map(c => c.toLowerCase())
          .some(c =>
            side === 'kside'
              ? c === 'k' || (c !== 'q' && c > kingSq[0])
              : c === 'q' || (c !== 'k' && c < kingSq[0]),
          );
    }
  }
  return castlePrivileges;
};
