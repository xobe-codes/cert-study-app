// Lighthouse CI configuration
// Targets are set as baselines — tighten thresholds over time as scores improve.
// Run: npm run lighthouse  (requires dist/ to exist — run npm run build first)

export default {
  ci: {
    collect: {
      // Serve the production build locally for testing
      staticDistDir: './dist',
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        // Performance: warn only until baseline is established
        'categories:performance': ['warn', { minScore: 0.85 }],

        // Accessibility: hard gate — CCNA app must be usable for all learners
        'categories:accessibility': ['error', { minScore: 0.90 }],

        // Best practices: hard gate
        'categories:best-practices': ['error', { minScore: 0.90 }],

        // PWA: must pass — app is deployed as a PWA
        'categories:pwa': ['warn', { minScore: 0.80 }],
      },
    },
    upload: {
      // Disable remote upload — we're using local assertions only for now.
      // To enable LHCI server or GitHub status checks, configure target here.
      target: 'temporary-public-storage',
    },
  },
};
