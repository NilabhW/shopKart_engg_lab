import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// bypass function: if the request is a browser page navigation (Accept: text/html),
// return null so Vite serves index.html instead of proxying to the backend.
const bypassBrowserNav = (req) => {
  const accept = req.headers['accept'] || ''
  if (accept.includes('text/html')) {
    return '/index.html'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/customers': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        bypass: bypassBrowserNav,
      },
      '/products': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        bypass: bypassBrowserNav,
      },
      '/wishlist': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        bypass: bypassBrowserNav,
      },
      '/cart': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        bypass: bypassBrowserNav,
      },
      '/orders': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        bypass: bypassBrowserNav,
      },
    },
  },
})
