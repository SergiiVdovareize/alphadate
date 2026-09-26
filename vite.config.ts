/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: [
        'src/main.ts',
        'src/vite-env.d.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        'src/router/**'
      ],
      thresholds: {
        lines: 90,
        statements: 90
      }
    }
  }
});
