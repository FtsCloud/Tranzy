import terser from '@rollup/plugin-terser';

export default {
  input: 'src/tranzy.js',
  output: [
    {
      file: 'dist/tranzy.es.js',
      format: 'es',
      sourcemap: true,
      exports: 'default'
    },
    {
      file: 'dist/tranzy.umd.js',
      format: 'umd',
      name: 'Tranzy',
      sourcemap: true,
      exports: 'default',
      globals: {
        'indexedDB': 'indexedDB'
      }
    }
  ],
  plugins: [
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true
    })
  ]
}; 