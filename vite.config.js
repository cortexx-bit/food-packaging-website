import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

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
        product: './product.html',
        category: './category.html',
        privacy_policy: './privacy.html',
        cookie_policy: './cookie_policy.html',
        terms_of_use: './terms-of-use.html',
      }
    }
  }
})