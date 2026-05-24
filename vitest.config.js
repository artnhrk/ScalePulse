import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '#shared': new URL('./src/shared', import.meta.url).pathname,
            '#config': new URL('./src/config', import.meta.url).pathname,
            '#bootstrap': new URL('./src/bootstrap', import.meta.url).pathname,
            '#plugins': new URL('./src/plugins', import.meta.url).pathname,
            '#infra': new URL('./src/infra', import.meta.url).pathname,
            '#modules': new URL('./src/modules', import.meta.url).pathname,
            '#app': new URL('./src', import.meta.url).pathname,
        },
    },
    test: {
        environment: 'node',
        globals: true,

        envFile: '.env.test',
        setupFiles: 'vitest.setup.js',

        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],

        coverage: {
            provider: 'v8',

            reporter: ['text', 'html', 'json-summary'],

            reportsDirectory: './coverage',

            exclude: ['node_modules/', 'dist/', 'test/', '**/*.config.*'],

            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
});