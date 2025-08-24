export default {
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        cook: './cook.html'
      },
      output: {
        manualChunks: {
          'vendor': ['three', 'lottie-web'],
          'model-viewer': ['/main.js']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096
  },
  server: {
    open: true
  }
};