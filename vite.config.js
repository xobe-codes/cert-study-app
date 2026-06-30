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
          if (id.includes('MockExam')) return 'mock-exam'
          if (id.includes('/lab/') || id.includes('ccnaLabs')) return 'labs'
          if (id.includes('ExtraStudyMode') || id.includes('ExamTrapStudyMode') || id.includes('RoutingDecoderMode')) return 'study-modes'
          if (id.includes('TopicFocus') || id.includes('CommandHub') || id.includes('StudyLens')) return 'studios'
        },
      },
    },
  },
})
