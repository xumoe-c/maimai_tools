import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    publicDir: 'static',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/covers': {
                target: 'https://www.diving-fish.com/covers',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/covers/, '')
            }
        }
    }
})
