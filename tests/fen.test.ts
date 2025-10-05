import { initial, read, write } from '../src/fen';
import { allKeys } from '../src/util';

test('write.read initial', () => {
  expect(write(read(initial))).toEqual(initial);
});

test('invalid position 1', () => {
  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPPRNBQKBNR w KQkq - 0 1';
  Array.from(read(fen).keys()).forEach(k => {
    expect(k).toBeOneOf(allKeys);
  });
});
