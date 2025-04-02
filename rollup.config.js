import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/tranzy.js',
  output: [
    {
      file: 'dist/tranzy.es.js',
      format: 'es',
      sourcemap: true
    },
    {
      file: 'dist/tranzy.umd.js',
      format: 'umd',
      name: 'Tranzy',
      sourcemap: true,
      globals: {
        'indexedDB': 'indexedDB'
      }
    }
  ],
  plugins: [
    commonjs(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true
    })
  ]
}; 