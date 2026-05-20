import { defineConfig } from 'vitest/config';


export default defineConfig({
    test: {
        environment: 'node',
        globals: true,

        envFile: '.env.test',
        setupFiles: 'vitest.setup.js',

        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],

        coverage: {
            provider: 'v8',

            reporter: [
                'text',
                'html',
                'json-summary'
            ],

            reportsDirectory: './coverage',

            exclude: [
                'node_modules/',
                'dist/',
                'test/',
                '**/*.config.*'
            ],

            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80
            }
        },
    }
});
