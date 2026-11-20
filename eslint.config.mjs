import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts', 'coverage/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['tests/**/*.cjs'],
    rules: {
      // Tests deliberately load Node built-ins and transpile TypeScript in CommonJS VMs.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default config;
