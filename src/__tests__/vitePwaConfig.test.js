import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const viteConfig = readFileSync(resolve(ROOT, 'vite.config.js'), 'utf8')

describe('vite PWA runtime caching', () => {
  it('includes CacheFirst rule for skill-questions chunk', () => {
    expect(viteConfig).toMatch(/urlPattern:\s*\/\\\/assets\\\/skill-questions\[\^\/\?\]\*\\\.js\$\/i/)
    expect(viteConfig).toMatch(/cacheName:\s*'ccna-skill-questions'/)
    expect(viteConfig).toMatch(/handler:\s*'CacheFirst'/)
    const skillBlock = viteConfig.slice(
      viteConfig.indexOf('skill-questions'),
      viteConfig.indexOf('ccna-chunks'),
    )
    expect(skillBlock).toContain('rejectHtmlAsScript')
  })

  it('keeps other large chunk CacheFirst rules', () => {
    for (const name of ['clean-questions', 'mock-exam', 'labs', 'study-modes', 'studios', 'shelved-questions', 'vendor-react']) {
      expect(viteConfig).toContain(name)
    }
  })

  it('includes CacheFirst rule for shelved-questions and vendor-react', () => {
    expect(viteConfig).toMatch(/urlPattern:\s*\/\\\/assets\\\/shelved-questions\[\^\/\?\]\*\\\.js\$\/i/)
    expect(viteConfig).toMatch(/cacheName:\s*'ccna-shelved-questions'/)
    expect(viteConfig).toMatch(/urlPattern:\s*\/\\\/assets\\\/vendor-react\[\^\/\?\]\*\\\.js\$\/i/)
    expect(viteConfig).toMatch(/cacheName:\s*'ccna-vendor-react'/)
  })
})
