import { fileURLToPath } from 'node:url';

export const RUTA_GOLDEN = fileURLToPath(new URL('./calendarios.golden.json.gz', import.meta.url));

// WHY: los cálculos usan fechas locales (new Date(y, m, d) + setDate). El
//      golden se genera y se comprueba siempre en la zona horaria de los
//      usuarios para que un cambio de huso (CI en UTC, portátil de viaje)
//      no produzca falsos rojos ni falsos verdes. vitest.config.js y
//      generar.js la fijan ANTES de importar ningún módulo con fechas:
//      los calendarios crean Date a nivel de módulo al importarse.
export const TZ_GOLDEN = 'Europe/Madrid';
