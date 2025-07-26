import { premove } from '../src/premove';
import * as cg from '../src/types';
import { defaults, HeadlessState } from '../src/state';
import * as fen from '../src/fen';
import * as util from '../src/util';

const makeState = (
  fenOfPos: cg.FEN,
  trimPremoves: boolean,
  lastMove: cg.Key[] | undefined,
): HeadlessState => {
  const state = defaults();
  state.pieces = fen.read(fenOfPos);
  if (!trimPremoves) state.premovable.unrestrictedPremoves = true;
  state.lastMove = lastMove;
  state.turnColor = fenOfPos.includes(' w ') ? 'white' : 'black';
  return state;
};

test('premoves are trimmed appropriately', () => {
  const state = makeState('k1n2r1r/2bP2p1/3r3p/Ppq1pPr1/qP4n1/p3r1P1/1bnP2KP/R4r1q w - - 0 1', true, [
    'e7',
    'e5',
  ]);
  expect(new Set(premove(state, 'f8'))).toEqual(
    new Set(['g8', 'e8', 'd8', 'c8', 'f7', 'f6', 'f5', 'f4', 'f3', 'f2', 'f1']),
  );
  expect(new Set(premove(state, 'f1'))).toEqual(
    new Set(['h1', 'g1', 'e1', 'd1', 'c1', 'b1', 'a1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7']),
  );
  expect(new Set(premove(state, 'g5'))).toEqual(
    new Set(
      ['h5', 'f5', 'e5', 'd5', 'c5', 'g6'],
      // technically premoving to c5 is impossible, but current expected behaviour allows it
    ),
  );
  expect(new Set(premove(state, 'h8'))).toEqual(new Set(['h7', 'g8']));
  expect(new Set(premove(state, 'e3'))).toEqual(
    new Set(['g3', 'f3', 'd3', 'c3', 'b3', 'a3', 'e2', 'e1', 'e4', 'e5', 'e6']),
  );
  expect(new Set(premove(state, 'd6'))).toEqual(
    new Set(['e6', 'f6', 'g6', 'c6', 'b6', 'a6', 'd7', 'd8', 'd5', 'd4', 'd3', 'd2', 'd1']),
  );
  expect(new Set(premove(state, 'h1'))).toEqual(
    new Set(['h2', 'h3', 'h4', 'g1', 'f1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7']),
  );
  expect(new Set(premove(state, 'a4'))).toEqual(
    new Set(['b3', 'b4', 'c4', 'd4', 'e4', 'f4', 'a5', 'a6', 'a3']),
  );
  expect(new Set(premove(state, 'c5'))).toEqual(
    new Set(['c4', 'c3', 'd4', 'e3', 'd5', 'e5', 'f5', 'c6', 'b6', 'a7', 'b4']),
  );
  expect(new Set(premove(state, 'a8'))).toEqual(new Set(['b8', 'b7', 'a7']));
  expect(new Set(premove(state, 'c8'))).toEqual(new Set(['e7', 'b6', 'a7']));
  expect(new Set(premove(state, 'g4'))).toEqual(new Set(['h2', 'f6', 'e5', 'e3', 'f2']));
  expect(new Set(premove(state, 'c2'))).toEqual(new Set(['e1', 'e3', 'd4', 'b4', 'a3', 'a1']));
  expect(new Set(premove(state, 'b2'))).toEqual(new Set(['c1', 'a1', 'c3', 'd4', 'e5', 'f6', 'a3']));
  expect(new Set(premove(state, 'c7'))).toEqual(new Set(['d8', 'b8', 'b6', 'a5']));

  // todo - test more pieces

  expect(
    util.allKeys
      .filter(
        sq =>
          ![
            'h8',
            'h6',
            'h1',
            'g7',
            'g5',
            'g4',
            'f8',
            'f1',
            'e5',
            'e3',
            'd6',
            'c8',
            'c7',
            'c5',
            'c2',
            'b5',
            'b2',
            'a8',
            'a4',
            'a3',
          ].includes(sq),
      )
      .every(square => !premove(state, square as cg.Key).length),
  ).toEqual(true);
});
