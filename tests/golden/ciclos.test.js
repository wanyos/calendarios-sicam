// WHY: test de CORRECCIÓN independiente del golden master. Cada calendario
//      es un ciclo de longitud fija que se repite indefinidamente, pero el
//      código calcula cada año por separado (getFechaInit aproxima un punto
//      de arranque con una heurística). Si la heurística o un refactor
//      desalinean un año, el patrón se rompe justo en el cambio de año.
//
//      Aquí unimos todos los años en una línea temporal continua y
//      exigimos que el día d y el día d + ciclo tengan la misma marca.
//      No depende de ningún dato guardado: sigue protegiendo aunque se
//      regenere el golden.

import { describe, it, expect } from 'vitest';
import {
    getDatosListaLibres,
    getDatosListaSubgrupo,
    getDatosListaSubComunes,
} from '../../src/calendarios/DatosFechas.js';
import { COMBINACIONES, YEARS } from './combinaciones.js';

// WHY: longitud del ciclo completo (días) de cada lista por calendario.
//      Coincide con los totalSecuencia de src/calendarios/Fechas*.js, pero
//      se escribe aquí a mano a propósito: es conocimiento del dominio que
//      el test no debe leer del código que está comprobando.
const CICLO = {
    libres: {
        Conductor: 35, Inspector: 35, Inspector_Noche: 35, Buho: 35, Grua: 35, GruaDSM: 35,
        GruaDSM_Noche: 21, ParkingDSM_100: 70, ParkingDSM_50: 42, Refuerzo_Nocturno: 280,
    },
    subgrupo: {
        Conductor: 280, Buho: 280, Inspector: 350, Inspector_Noche: 350, Grua: 105, GruaDSM: 350,
        ParkingDSM_50: 42, // reducción
    },
    subComunes: {
        Conductor: 70, Buho: 70, Inspector: 70, Inspector_Noche: 70,
        ParkingDSM_100: 70, ParkingDSM_50: 84,
    },
};

const OBTENER = {
    libres: (c, y) => getDatosListaLibres(c.tipo, y, c.grupo, c.grupoDos),
    subgrupo: (c, y) => getDatosListaSubgrupo(c.tipo, y, c.grupo, c.subgrupo),
    subComunes: (c, y) => getDatosListaSubComunes(c.tipo, y, c.grupo, c.subgrupo),
};

const Y0 = YEARS[0];
const Y1 = YEARS[YEARS.length - 1];
const BASE = Date.UTC(Y0, 0, 1);
const indice = (d) => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - BASE) / 864e5);
const TOTAL_DIAS = indice(new Date(Y1, 11, 31)) + 1;
const fechaDe = (i) => new Date(BASE + i * 864e5).toISOString().slice(0, 10);

// WHY: libres no depende del subgrupo; deduplicamos para no repetir trabajo.
function listasUnicas() {
    const vistas = new Map();
    for (const c of COMBINACIONES) {
        for (const tipoLista of Object.keys(CICLO)) {
            if (!CICLO[tipoLista][c.tipo]) continue;
            const variante = tipoLista === 'libres' ? c.grupoDos : c.subgrupo;
            const nombre = [c.tipo, tipoLista, `g${c.grupo}`, variante].filter(v => v !== undefined).join('|');
            if (!vistas.has(nombre)) vistas.set(nombre, { c, tipoLista });
        }
    }
    return vistas;
}

describe(`ciclos — patrón continuo entre años (${Y0}-${Y1})`, () => {
    for (const [nombre, { c, tipoLista }] of listasUnicas()) {
        it(nombre, () => {
            const ciclo = CICLO[tipoLista][c.tipo];
            const marcas = new Uint8Array(TOTAL_DIAS);
            const anyosVacios = [];

            for (const year of YEARS) {
                const lista = OBTENER[tipoLista](c, year) ?? [];
                if (lista.length === 0) anyosVacios.push(year);
                for (const d of lista) marcas[indice(d)] = 1;
            }

            const rupturas = [];
            for (let i = 0; i + ciclo < TOTAL_DIAS; i++) {
                if (marcas[i] !== marcas[i + ciclo]) rupturas.push(`${fechaDe(i)} vs ${fechaDe(i + ciclo)}`);
            }

            expect(anyosVacios, 'años sin ninguna fecha').toEqual([]);
            expect(rupturas.slice(0, 10), `ciclo de ${ciclo} días roto ${rupturas.length} veces`).toEqual([]);
        });
    }
});
