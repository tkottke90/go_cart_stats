import nodeResolve from 'rollup-plugin-node-resolve';
import typescript2 from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import workbox from 'rollup-plugin-workbox-inject';

import inject from './rollup-util/inject';

const main = {
  input: ['ui-src/bootstrap.ts'],
  output: {
    format: 'esm',
    dir: 'lib/dist/assets',
    entryFileNames: 'bootstrap-[hash].js',
    sourcemap: true
  },
  
  plugins: [
    copy({
      targets: [
        { src: 'ui-src/app/index.html', dest: 'lib/dist/' },
        { src: 'ui-src/app/404.html', dest: 'lib/dist/' },
        { src: 'ui-src/app/index.css', dest: 'lib/dist/' },
        { src: 'ui-src/app/favicon.ico', dest: 'lib/dist/' },
      ]
    }),
    nodeResolve(),
    typescript2({
      tsconfigOverride: {
        include: [ 'ui-src', 'typings', 'ui-src/app/util/service-worker.ts' ],
        compilerOptions: {
          module: 'ESNext',
          target: 'ESNext',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          experimentalDecorators: true,        /* Enables experimental support for ES7 decorators. */
          emitDecoratorMetadata: true,         /* Enables experimental support for emitting type metadata for decorators. */
        }
      }
    }),
    postcss({
      writeDefinitions: true
    }),
    terser({ ecma: 8 }),
    image(),
    inject()
  ]
}

const service_worker = {
  input: 'ui-src/app/util/service-worker.js',
  output: {
    dir: 'lib/dist',
    format: 'esm',
    sourcemap: false
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
    nodeResolve({
      browser: true,
    }),
    workbox({
      globDirectory: 'lib/dist',
      globPatterns: [
        '**/*.js',
        'index.css',
        'index.html',
      ],
    }),
    terser(),
  ]
}

export default [main, service_worker]