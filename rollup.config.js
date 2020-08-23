import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import zip from 'rollup-plugin-zip';

import {
  chromeExtension,
  simpleReloader,
} from 'rollup-plugin-chrome-extension';

export default {
  input: 'manifest.json',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    chromeExtension(),
    simpleReloader(),
    resolve(),
    commonjs(),
    terser(),
    zip(),
  ],
};
