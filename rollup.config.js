import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

import tsconfig from './tsconfig.json';

function stripUndefined(obj) {
  const r = {};
  for (const prop in obj) if (obj[prop] !== undefined) r[prop] = obj[prop];
  return r;
}

export default {
  input: 'src/index.js',
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
        terser({
          safari10: true,
        }),
      ],
    },
  ],
  plugins: [
    typescript(stripUndefined({
      ...tsconfig.compilerOptions,
      tsconfig: false,
      outDir: undefined,
      sourceMap: undefined,
      declaration: undefined,
    })),
    commonjs({
      extensions: ['.js', '.ts'],
    }),
  ],
};
