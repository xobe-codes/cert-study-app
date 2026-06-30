import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Cloudflare Pages: `/`. GitHub Pages project site: set VITE_BASE=/cert-study-app/ in deploy workflow.
  base: process.env.VITE_BASE || '/',
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
