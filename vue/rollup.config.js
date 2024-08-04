import vue from 'rollup-plugin-vue';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import { babel } from '@rollup/plugin-babel';

export default {
  input: './index.vue',
  output: [
    {
      format: 'esm',
      file: 'dist/my-ui.min.mjs'
    },
    {
      format: 'cjs',
      file: 'dist/my-ui.min.cjs',
      exports: 'default',
    }
  ],
  plugins: [
    resolve(),
    commonjs({ include: "**/node_modules/**" }),
    vue(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    terser()
  ],
  external: ['vue']
};
