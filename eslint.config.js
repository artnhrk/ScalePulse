import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'


export default [
    {
        ignores: [
            'dist',
            'node_modules',
            'eslint.config.js',
            'vitest.config.js',
            'prisma.config.ts',
            'vitest.setup.js',
            'playground',
            'coverage',
            'schema.prisma',
        ]
    },

    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,

    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },

    {
        settings: {
            'import/resolver': {
                alias: {
                    map: [
                        ['#shared', './src/shared'],
                        ['#config', './src/config'],
                        ['#bootstrap', './src/bootstrap'],
                        ['#plugins', './src/plugins'],
                        ['#infra', './src/infra'],
                        ['#modules', './src/modules'],
                    ],
                    extensions: ['.ts', '.js', '.json'],
                },
            },
        },
        plugins: {
            import: importPlugin,
            'simple-import-sort': simpleImportSort
        },
        rules: {
            // general
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            'no-duplicate-imports': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': ['error', 'always'],

            'curly': ['error', 'all'],
            'no-return-await': 'error',

            // import management
            'import/order': 'off',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            // typescript safety
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/no-non-null-assertion': 'warn',

            '@typescript-eslint/explicit-function-return-type': 'off',

            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',

            // promise async/await
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/require-await': 'warn',

            // bug prevention
            'no-unreachable': 'error',
            'no-unsafe-finally': 'error',
            'no-self-compare': 'error',
            'no-template-curly-in-string': 'error',
            'no-constant-condition': 'warn',

            // code complexity control
            'complexity': ['warn', 10],
            'max-depth': ['warn', 4],
            'max-lines-per-function': ['warn', 80],
            'max-params': ['warn', 5],
        }
    },

    {
        // ignoring these rules for test files
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
            'max-lines-per-function': 'off',
        },
    },

    eslintConfigPrettier
]