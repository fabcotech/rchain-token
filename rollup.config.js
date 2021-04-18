import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'RChainToken',
    file: 'dist/rchain-token@5.0.3.js',
  },
  plugins: [resolve(), commonjs(), json()],
};
