import replace from '@rollup/plugin-replace';
import buble from '@rollup/plugin-buble';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

const {MINIFY, ES} = process.env;
const isWatch = process.argv.includes('--watch');
const minified = MINIFY === 'true';
let format = 'umd';
let outputFile = '';
let sourcemap = true;

if (isWatch) {
  outputFile = 'dist/mapbox-gl-draw.umd.unminified.js';
  sourcemap = false;
} else  {
  if (ES === 'true') {
    outputFile = 'dist/mapbox-gl-draw.es.js';
    format = 'es';
  } else {
    outputFile = 'dist/mapbox-gl-draw.umd.js';
  }
  if (!minified) {
    outputFile = outputFile.replace(/\.js$/, '.unminified.js');
  } else {
    outputFile = outputFile.replace(/\.js$/, '.min.js');
  }
}

export default {
  input: ['index.js'],
  output: {
    name: 'MapboxDraw',
    file: outputFile,
    format,
    sourcemap,
    indent: false,
    globals: {
      'mapbox-gl': 'mapboxgl',
      '@turf/turf': 'turf'
    }
  },
  external: ['mapbox-gl', '@turf/turf'],
  treeshake: true,
  plugins: [
    replace({
      'process.env.NODE_ENV': "'browser'",
      preventAssignment: true
    }),
    buble({ transforms: {dangerousForOf: true}, objectAssign: "Object.assign" }),
    minified ? terser() : false,
    resolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs({
      // global keyword handling causes Webpack compatibility issues, so we disabled it:
      // https://github.com/mapbox/mapbox-gl-js/pull/6956
      ignoreGlobal: true,
    }),
    copy({
      copySync: true,
      targets: [
        { src: 'dist/mapbox-gl-draw.umd.unminified.js', dest: 'example/public/mapbox-gl-draw' },
        { src: 'src/mapbox-gl-draw.css', dest: 'dist' },
        { src: 'src/mapbox-gl-draw.css', dest: 'example/public/mapbox-gl-draw' },
      ]
    }),
  ],
};

