import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules', 'dist'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/main.tsx',
        'src/App.tsx', // Phase 0 placeholder, replaced wholesale in Phase 3
        'src/pages/ShowcasePage.tsx', // manual visual-QA gallery, verified by hand at /showcase
        'src/**/*.module.css',
        'tests/**',
      ],
      thresholds: { lines: 70, functions: 70, branches: 65, statements: 70 },
    },
  },
})
