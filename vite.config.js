import process from 'node:process'
import {defineConfig} from 'vite'
import config from './blog-config.js'

process.env.VITE_TITLE = config.name

export default defineConfig({
  server: {
    cors: true,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
