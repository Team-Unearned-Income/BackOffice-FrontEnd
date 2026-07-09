import { defineConfig, loadEnv } from 'vite'
import svgLoader from 'vite-svg-loader'

import { quasar } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig((config) => {
  process.env = { ...process.env, ...loadEnv(config.mode, process.cwd()) }

  return {
    server: {
      host: true,
      // 백엔드 app.client-url 기본값(http://localhost:5173)과 맞춰 OAuth 성공 리다이렉트(/auth/success)를 이 앱이 받도록
      port: 5173,
      strictPort: true,
      proxy: {
        '^/api/seoulland/.*': {
          target: process.env.VITE_API_SERVER,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/seoulland/, '')
        },
        // Knock-in BO API: /bo/* 를 백엔드(VITE_API_SERVER)로 그대로 전달 (rewrite 없음)
        '^/bo/.*': {
          target: process.env.VITE_API_SERVER,
          changeOrigin: true
        },
        // 로그아웃 API (그 외 /auth/* 는 프론트 라우트 — 특히 /auth/success 는 프록시하면 안 됨)
        '^/auth/logout': {
          target: process.env.VITE_API_SERVER,
          changeOrigin: true
        }
      }
    },
    plugins: [
      vue(),
      quasar({
        sassVariables: '@/assets/scss/quasar-variables.scss'
      }),
      svgLoader()
    ],
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: 'vue', replacement: 'vue/dist/vue.esm-bundler.js' }
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/scss/quasar-variables.scss";
          `
        }
      }
    },
    optimizeDeps: {
      include: ['lodash-es'],
      exclude: ['quasar']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    }
  }
})

const manualChunks = (id) => {
  if (id.includes('/quasar/')) {
    return 'quasar'
  } else if (id.includes('/lottie-web/')) {
    return 'lottie-web'
  } else if (id.includes('/v-calendar/')) {
    return 'v-calendar'
  } else if (id.includes('/lodash-es/')) {
    return 'lodash-es'
  } else if (id.includes('node_modules')) {
    return id.toString().split('node_modules/')[1].split('/')[0].toString()
  }
}
