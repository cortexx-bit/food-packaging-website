import { defineConfig } from 'vite'
import injectHtml  from 'vite-plugin-html-inject';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML()
  ],
})