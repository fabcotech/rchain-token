import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

const { VERSION } =  require('./constants');

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'RChainToken',
    file: `dist/rchain-token@${VERSION}.js`,
  },
  plugins: [resolve(), commonjs(), json()],
};
