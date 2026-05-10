// WHY: vite.config.js declara root: 'src' (porque index.html vive ahí),
//      pero los tests viven en tests/ a nivel de raíz. Sin esta override
//      Vitest hereda el root de Vite y no encuentra los tests.
//      include explícito documenta dónde viven los archivos de prueba.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    include: ['tests/**/*.test.js'],
  },
});
