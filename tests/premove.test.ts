import { premove } from '../src/premove';
import * as cg from '../src/types';
import { defaults, HeadlessState } from '../src/state';
import * as fen from '../src/fen';
import * as util from '../src/util';

const verticallyOpposite = (square: cg.Key): cg.Key => {
  const pos = util.key2pos(square);
  return util.pos2keyUnsafe([pos[0], 7 - pos[1]]);
};

const diagonallyOpposite = (square: cg.Key): cg.Key =>
  util.pos2keyUnsafe(util.key2pos(square).map(n => 7 - n) as cg.Pos);

const diagonallyInvertPieces = (pieces: cg.Pieces): cg.Pieces =>
  new Map(
    [...pieces].map(([key, piece]) => [
      diagonallyOpposite(key),
      { role: piece.role, color: util.opposite(piece.color) },
    ]),
  );

const verticallyInvertPieces = (pieces: cg.Pieces): cg.Pieces =>
  new Map(
    [...pieces].map(([key, piece]) => [
      verticallyOpposite(key),
      { role: piece.role, color: util.opposite(piece.color) },
    ]),
  );

const invertCastlingPrivileges = (castlingPrivileges: cg.CastlePrivileges): cg.CastlePrivileges => {
  return {
    white: castlingPrivileges.black,
    black: castlingPrivileges.white,
  };
};

const makeState = (
  pieces: cg.Pieces,
  trimPremoves: boolean,
  lastMove: cg.Key[] | undefined,
  turnColor: cg.Color,
  castlingPrivileges: cg.CastlePrivileges | undefined,
): HeadlessState => {
  const state = defaults();
  state.pieces = pieces;
  if (!trimPremoves) state.premovable.unrestrictedPremoves = true;
  state.lastMove = lastMove;
  state.turnColor = turnColor;
  if (castlingPrivileges) state.premovable.castle = structuredClone(castlingPrivileges);
  return state;
};

const testPosition = (
  state: HeadlessState,
  expectedPremoves: Map<cg.Key, Iterable<cg.Key>>,
  checkDiagonalInverse: boolean,
  checkVerticalInverse: boolean,
): void => {
  expect(!checkDiagonalInverse || !state.premovable.castle);
  for (const [from, expectedDests] of expectedPremoves) {
    expect(new Set(premove(state, from))).toEqual(new Set(expectedDests));
  }
  expect(
    util.allKeys.filter(sq => !expectedPremoves.has(sq)).every(sq => !premove(state, sq as cg.Key).length),
  ).toEqual(true);
  if (checkDiagonalInverse) {
    testPosition(
      makeState(
        diagonallyInvertPieces(state.pieces),
        !state.premovable.unrestrictedPremoves,
        state.lastMove?.map(sq => diagonallyOpposite(sq)),
        util.opposite(state.turnColor),
        undefined,
      ),
      new Map(
        [...expectedPremoves].map(([start, dests]) => [
          diagonallyOpposite(start),
          Array.from(dests, diagonallyOpposite),
        ]),
      ),
      false,
      false,
    );
  }
  if (checkVerticalInverse) {
    testPosition(
      makeState(
        verticallyInvertPieces(state.pieces),
        !state.premovable.unrestrictedPremoves,
        state.lastMove?.map(sq => verticallyOpposite(sq)),
        util.opposite(state.turnColor),
        state.premovable.castle ? invertCastlingPrivileges(state.premovable.castle) : undefined,
      ),
      new Map(
        [...expectedPremoves].map(([start, dests]) => [
          verticallyOpposite(start),
          Array.from(dests, verticallyOpposite),
        ]),
      ),
      false,
      false,
    );
  }
};

test('premoves are trimmed appropriately', () => {
  const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
    ['f8', ['g8', 'e8', 'd8', 'c8', 'f7', 'f6', 'f5', 'f4', 'f3', 'f2', 'f1']],
    ['f1', ['h1', 'g1', 'e1', 'd1', 'c1', 'b1', 'a1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7']],
    ['g5', ['h5', 'f5', 'e5', 'd5', 'c5', 'g6']],
    ['h8', ['h7', 'g8']],
    ['e3', ['g3', 'f3', 'd3', 'c3', 'b3', 'e2', 'e1', 'e4', 'e5', 'e6']],
    ['d6', ['e6', 'f6', 'g6', 'c6', 'b6', 'a6', 'd7', 'd8', 'd5', 'd4', 'd3', 'd2', 'd1']],
    ['h1', ['h2', 'h3', 'h4', 'g1', 'f1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7']],
    ['a4', ['b3', 'b4', 'c4', 'd4', 'e4', 'f4', 'a5', 'a6']],
    ['c5', ['c4', 'c3', 'd4', 'e3', 'd5', 'e5', 'f5', 'c6', 'b6', 'a7', 'b4']],
    ['a8', ['b8', 'b7', 'a7']],
    ['c8', ['e7', 'b6', 'a7']],
    ['g4', ['h2', 'f6', 'e5', 'e3', 'f2']],
    ['c2', ['e1', 'e3', 'd4', 'b4', 'a1']],
    ['b2', ['c1', 'a1', 'c3', 'd4', 'e5', 'f6']],
    ['c7', ['d8', 'b8', 'b6', 'a5']],
    ['h6', ['h5']],
    ['g7', ['g6', 'f6']],
    ['e5', ['e4', 'd4']],
    ['b5', ['b4']],
    ['a3', []],
  ]);
  testPosition(
    makeState(
      fen.read('k1n2r1r/2bP2p1/3r3p/Ppq1pPr1/qP4n1/p3r1P1/PbnP2KP/R4r1q w - - 0 1'),
      true,
      ['e7', 'e5'],
      'white',
      undefined,
    ),
    expectedPremoves,
    true,
    true,
  );
});

test('anticipate all en passant captures if no last move', () => {
  const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
    ['a2', ['b1', 'b3', 'c4', 'd5', 'e6', 'f7', 'g8']],
    ['h2', ['g1', 'g3', 'f4', 'e5', 'd6', 'c7', 'b8']],
    ['h3', ['g3', 'f3', 'e3', 'd3', 'h4', 'h5']],
    ['f5', ['e5', 'd5', 'c5', 'b5', 'a5', 'f6', 'f7', 'f8', 'f4', 'f3']],
    ['c4', ['c5']],
    ['f4', []],
    ['g5', ['g6']],
    ['d3', ['d4', 'e4']],
  ]);
  testPosition(
    makeState(fen.read('8/8/8/5RPp/1pP1pP2/3Pp2R/B6B/8 b - - 0 1'), true, undefined, 'black', undefined),
    expectedPremoves,
    true,
    true,
  );
});

test('horde no en passant for first to third rank', () => {
  const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
    ['f1', ['f2', 'f3']],
    ['g3', ['g4', 'h4']],
  ]);
  testPosition(
    makeState(
      fen.read('rnbqkbnr/ppppppp1/8/8/8/6Pp/8/5P2 w kq - 0 1'),
      true,
      ['g1', 'g3'],
      'black',
      undefined,
    ),
    expectedPremoves,
    true,
    true,
  );
});

test('do not trim premoves when specified', () => {
  const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
    ['f1', ['f2', 'f3', 'e2', 'g2']],
    ['g3', ['g4', 'h4', 'f4']],
  ]);
  testPosition(
    makeState(
      fen.read('rnbqkbnr/ppppppp1/8/8/8/6Pp/8/5P2 w kq - 0 1'),
      false,
      ['g1', 'g3'],
      'black',
      undefined,
    ),
    expectedPremoves,
    true,
    true,
  );
});

test('prod bug report lichess-org/lila#18224', () => {
  const expectedPremoves = new Map<cg.Key, Set<cg.Key>>([
    ['a8', new Set(['a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'])],
    ['f2', new Set(['f3', 'g3'])],
    ['g2', new Set(['h1', 'g1', 'f1', 'h2', 'h3', 'g3', 'f3'])],
  ]);
  testPosition(
    makeState(fen.read('R7/6k1/8/8/5pp1/8/p4PK1/r7 b - - 0 56'), true, ['h2', 'g2'], 'black', undefined),
    expectedPremoves,
    true,
    true,
  );
});

describe('castling privileges parsed from FEN', () => {
  it('parses standard KQkq', () => {
    const fenStr = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const pieces = fen.read(fenStr);
    const priv = util.castlingPrivilegesFromFen(fenStr, pieces);
    expect(util.sameCastlingPrivileges(priv, util.makeCastlingPrivileges(true))).toBe(true);
  });

  it('parses standard KQ', () => {
    const fenStr = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1';
    const pieces = fen.read(fenStr);
    const priv = util.castlingPrivilegesFromFen(fenStr, pieces);
    expect(priv.white.kside).toBe(true);
    expect(priv.white.qside).toBe(true);
    expect(priv.black.kside).toBe(false);
    expect(priv.black.qside).toBe(false);
  });

  it('parses standard kq', () => {
    const fenStr = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kq - 0 1';
    const pieces = fen.read(fenStr);
    const priv = util.castlingPrivilegesFromFen(fenStr, pieces);
    expect(priv.white.kside).toBe(false);
    expect(priv.white.qside).toBe(false);
    expect(priv.black.kside).toBe(true);
    expect(priv.black.qside).toBe(true);
  });

  it('parses standard Qk', () => {
    const fenStr = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qk - 0 1';
    const pieces = fen.read(fenStr);
    const priv = util.castlingPrivilegesFromFen(fenStr, pieces);
    expect(priv.white.kside).toBe(false);
    expect(priv.white.qside).toBe(true);
    expect(priv.black.kside).toBe(true);
    expect(priv.black.qside).toBe(false);
  });

  it('handles "-" (no castling)', () => {
    const fenStr = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    const pieces = fen.read(fenStr);
    const priv = util.castlingPrivilegesFromFen(fenStr, pieces);
    expect(util.sameCastlingPrivileges(priv, util.makeCastlingPrivileges(false))).toBe(true);
  });

  it('interprets different forms for castling notation', () => {
    const fenStr = '4k3/8/8/8/8/8/8/R1K4R w AHah - 0 1'; // black doesn't have rooks but expected behaviour is this won't matter
    const pieces = fen.read(fenStr);
    const priv = util.castlingPrivilegesFromFen(fenStr, pieces);
    expect(util.sameCastlingPrivileges(priv, util.makeCastlingPrivileges(true))).toBe(true);
    expect(
      util.sameCastlingPrivileges(
        priv,
        util.castlingPrivilegesFromFen(fenStr.replace('AHah', 'KQkq'), pieces),
      ),
    ).toBe(true);
    expect(
      util.sameCastlingPrivileges(
        priv,
        util.castlingPrivilegesFromFen(fenStr.replace('AHah', 'BGcf'), pieces),
      ),
    ).toBe(true);
    expect(
      util.sameCastlingPrivileges(priv, util.castlingPrivilegesFromFen(fenStr.split(' ')[0], pieces)),
    ).toBe(true);
    expect(
      util.sameCastlingPrivileges(priv, util.castlingPrivilegesFromFen(fenStr.replace('AHah', '-'), pieces)),
    ).toBe(false);
  });
});

describe('premove respects per-side castle forbids', () => {
  const CLEAR_CASTLE_FEN = 'r1k4r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
  const pieces = fen.read(CLEAR_CASTLE_FEN);
  const queensRookPremoves: Iterable<cg.Key> = ['b1', 'c1', 'd1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  const kingsRookPremoves: Iterable<cg.Key> = ['g1', 'f1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'];

  it('includes both sides when allowed', () => {
    const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
      ['e1', ['d2', 'e2', 'f2', 'd1', 'f1', 'c1', 'g1', 'a1', 'h1']],
      ['a1', queensRookPremoves],
      ['h1', kingsRookPremoves],
    ]);
    testPosition(
      makeState(pieces, true, undefined, 'black', util.castlingPrivilegesFromFen(CLEAR_CASTLE_FEN, pieces)),
      expectedPremoves,
      false,
      true,
    );
  });

  it('excludes kside when forbidden', () => {
    const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
      ['e1', ['d2', 'e2', 'f2', 'd1', 'f1', 'c1', 'a1']],
      ['a1', queensRookPremoves],
      ['h1', kingsRookPremoves],
    ]);
    testPosition(
      makeState(
        pieces,
        true,
        undefined,
        'black',
        util.castlingPrivilegesFromFen('r1k4r/8/8/8/8/8/8/R3K2R w Qkq - 0 1', pieces),
      ),
      expectedPremoves,
      false,
      true,
    );
  });

  it('excludes qside when forbidden', () => {
    const expectedPremoves = new Map<cg.Key, Iterable<cg.Key>>([
      ['e1', ['d2', 'e2', 'f2', 'd1', 'f1', 'g1', 'h1']],
      ['a1', queensRookPremoves],
      ['h1', kingsRookPremoves],
    ]);
    testPosition(
      makeState(
        pieces,
        true,
        undefined,
        'black',
        util.castlingPrivilegesFromFen('r1k4r/8/8/8/8/8/8/R3K2R w Kkq - 0 1', pieces),
      ),
      expectedPremoves,
      false,
      true,
    );
  });

  // todo test castling premove stuff after making moves
});
