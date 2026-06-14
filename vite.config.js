import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Cloudflare Pages serves the app at the domain root.
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('ccnaCleanQuestions')) return 'clean-questions'
          if (id.includes('ccnaShelvedQuestions')) return 'shelved-questions'
          if (id.includes('ccnaSkillQuestions')) return 'skill-questions'
        },
      },
    },
  },
})
