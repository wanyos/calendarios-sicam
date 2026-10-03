// WHY: vite.config.js declara root: 'src' (porque index.html vive ahí),
//      pero los tests viven en tests/ a nivel de raíz. Sin esta override
//      Vitest hereda el root de Vite y no encuentra los tests.
//      include explícito documenta dónde viven los archivos de prueba.

import { defineConfig } from 'vitest/config';
import { TZ_GOLDEN } from './tests/golden/config.js';

// WHY: fijada aquí (proceso principal) para que los workers la hereden
//      antes de importar los calendarios. Ver tests/golden/config.js.
process.env.TZ = TZ_GOLDEN;

export default defineConfig({
  test: {
    root: '.',
    include: ['tests/**/*.test.js'],
  },
});
