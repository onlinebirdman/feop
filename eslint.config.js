import path from 'node:path'
import { fileURLToPath } from 'node:url'
import antfu from '@antfu/eslint-config'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})
export default antfu(
  {
    // pnpm add @unocss/eslint-plugin -D
    // unocss: true,
    typescript: true,
    // pnpm add eslint-plugin-format -D
    formatters: true,
  },
  {
    rules: {
      // '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  // ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // '@typescript-eslint/explicit-module-boundary-types': 'warn',
    },
  },
)
