// WHY: ESLint v9 usa flat config (eslint.config.js) en vez de .eslintrc.
//      Mantenemos un set mínimo de reglas — solo las que pillan errores
//      reales o aplican convenciones modernas. Sin formateo (que hoy lo
//      hacen Prettier / editor), para no pelear con cada commit.

import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // WHY: el código corre en navegador sin bundler-helper, así que
        //      avisamos a ESLint de los globals del browser. Sin esto,
        //      'document', 'window', etc. salen como no-undef.
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
