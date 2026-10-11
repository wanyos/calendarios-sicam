// WHY: red de seguridad para refactors. Compara, día a día, lo que pinta
//      el código actual contra el golden master generado desde la versión
//      validada (tests/golden/calendarios.golden.json.gz). Cubre todas las
//      combinaciones seleccionables en la UI y todos los años de YEARS.
//
//      Los tests por calendario (tests/calendarios/Fechas*.test.js) solo
//      comprueban la FORMA de la salida (array de Date del año); un fallo
//      de lógica que desplace un libre un día pasa desapercibido allí.
//      Aquí no: cualquier día con distinta marca hace fallar el test y el
//      mensaje dice qué fechas cambiaron.
//
//      Si el cambio es intencionado y está validado contra el calendario
//      oficial: `pnpm golden:update` y revisar el diff en el commit.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { COMBINACIONES, YEARS, claveCombinacion } from './combinaciones.js';
import { renderAnyo, fechaDeIndice } from './render.js';
import { RUTA_GOLDEN, TZ_GOLDEN } from './config.js';
import { CATEGORIAS } from '../../src/calendarios/Constantes.js';

const golden = JSON.parse(gunzipSync(readFileSync(RUTA_GOLDEN)).toString('utf8'));

const NOMBRE = { '-': 'nada', L: 'Libre', S: 'Subgrupo', 1: 'sub1', 2: 'sub2' };

function describirDiferencias(year, esperado, actual) {
  const lineas = [];
  for (let i = 0; i < Math.max(esperado.length, actual.length); i++) {
    if (esperado[i] !== actual[i]) {
      lineas.push(
        `  ${fechaDeIndice(year, i)}: esperado ${NOMBRE[esperado[i]] ?? esperado[i]}, obtenido ${NOMBRE[actual[i]] ?? actual[i]}`,
      );
    }
  }
  const MAX = 15;
  const extra = lineas.length > MAX ? `\n  ... y ${lineas.length - MAX} días más` : '';
  return `${year} (${lineas.length} días distintos):\n${lineas.slice(0, MAX).join('\n')}${extra}`;
}

describe('golden master — integridad', () => {
  it(`se ejecuta en la zona horaria ${TZ_GOLDEN}`, () => {
    expect(process.env.TZ).toBe(TZ_GOLDEN);
    expect(golden.tz).toBe(TZ_GOLDEN);
  });

  it('el golden cubre exactamente las combinaciones y años actuales', () => {
    expect(golden.years).toEqual(YEARS);
    expect(Object.keys(golden.datos).sort()).toEqual(COMBINACIONES.map(claveCombinacion).sort());
  });

  // WHY: si se añade una categoría a la UI y no a combinaciones.js, su
  //      calendario quedaría fuera de la red sin que nadie lo note.
  it('todas las categorías de la UI están cubiertas', () => {
    const cubiertas = new Set(COMBINACIONES.map((c) => c.tipo));
    expect([...cubiertas].sort()).toEqual(CATEGORIAS.map((c) => c.value).sort());
  });
});

describe('golden master — calendarios día a día', () => {
  for (const combinacion of COMBINACIONES) {
    const clave = claveCombinacion(combinacion);
    it(clave, () => {
      const diferencias = [];
      for (const year of YEARS) {
        const esperado = golden.datos[clave][year];
        const actual = renderAnyo(combinacion, year);
        if (actual !== esperado) diferencias.push(describirDiferencias(year, esperado, actual));
      }
      expect(diferencias, `${clave} ha cambiado:\n${diferencias.join('\n')}`).toEqual([]);
    });
  }
});
