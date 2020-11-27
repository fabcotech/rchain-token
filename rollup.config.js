import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'RChainTokenFiles',
    file: 'dist/rchain-token-files@4.0.0.js',
  },
  plugins: [resolve(), commonjs(), json()],
};
