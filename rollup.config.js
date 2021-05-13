import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/chessground.js',
      format: 'iife',
      name: 'Chessground',
    },
    {
      file: 'dist/chessground.min.js',
      format: 'iife',
      name: 'Chessground',
      plugins: [
        terser(),
      ],
    },
  ],
  plugins: [
    typescript(),
  ],
};
