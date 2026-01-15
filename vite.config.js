import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { Fancybox } from "@fancyapps/ui"
import "@fancyapps/ui/dist/fancybox/fancybox.css"

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        about: './about.html',
        contact: './contact.html',
        products: './products.html',
        product: './product.html'
      }
    }
  }
})