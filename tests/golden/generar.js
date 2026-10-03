// WHY: genera el golden master de los calendarios a partir del código
//      ACTUAL. Solo debe ejecutarse cuando un cambio en las fechas es
//      intencionado y está validado (p. ej. contra el calendario impreso
//      oficial). Nunca para "arreglar" un test en rojo durante un refactor.
//
//      Uso: pnpm golden:update
//
//      Se guarda comprimido (gzip): el JSON plano ocupa varios MB porque
//      son ~300 combinaciones × ~27 años × 365 días, pero es muy repetitivo.

import './fijar-tz.js'; // WHY: primero, antes de cualquier módulo que cree Date.
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { COMBINACIONES, YEARS, claveCombinacion } from './combinaciones.js';
import { renderAnyo } from './render.js';
import { RUTA_GOLDEN, TZ_GOLDEN } from './config.js';

const datos = {};
for (const combinacion of COMBINACIONES) {
    const porAnyo = {};
    for (const year of YEARS) porAnyo[year] = renderAnyo(combinacion, year);
    datos[claveCombinacion(combinacion)] = porAnyo;
}

const golden = { years: YEARS, tz: TZ_GOLDEN, datos };
writeFileSync(RUTA_GOLDEN, gzipSync(JSON.stringify(golden), { level: 9 }));
console.log(`Golden master escrito: ${COMBINACIONES.length} combinaciones × ${YEARS.length} años → ${RUTA_GOLDEN}`);
