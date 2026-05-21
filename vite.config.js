import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postsPlugin from './vite-plugin-posts.js'

// https://vite.dev/config/
export default defineConfig({
  base: '/Personal_Website/',
  plugins: [postsPlugin(), react()],
})