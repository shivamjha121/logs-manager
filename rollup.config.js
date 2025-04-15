import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'; // ✅ import the JSON plugin
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/my-library.cjs.js',
      format: 'cjs',
      sourcemap: false,
    },
    {
      file: 'dist/my-library.esm.js',
      format: 'esm',
      sourcemap: false,
    },
  ],
  plugins: [
    resolve(
      {
          preferBuiltins: true
      }
    ),        // Resolves third-party modules in node_modules
    commonjs(),       // Converts CommonJS to ES Modules
    json(),           // ✅ Enables importing .json files
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    terser(),         // Minifies the output
  ],
  // Optional: include or remove this depending on if you want to bundle dependencies
  // external: ['mongoose', 'winston', 'winston-mongodb'],
};
