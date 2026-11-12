import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173, // 포트 번호 고정
    strictPort: true, // 5173이 이미 사용 중이면 에러를 내고 실행하지 않음
    proxy: {
      // /auth로 시작하는 요청을 백엔드로 전달
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // /api로 시작하는 요청을 백엔드로 전달
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // /users로 시작하는 요청을 백엔드로 전달 (프로필 등)
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // /learning으로 시작하는 요청을 백엔드로 전달
      '/learning': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // /boards로 시작하는 요청을 백엔드로 전달 (커뮤니티 게시판)
      '/boards': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})