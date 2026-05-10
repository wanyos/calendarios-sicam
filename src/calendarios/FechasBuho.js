// WHY: Buho originalmente usaba FuncionesComunes directamente (no
//      FechasConductorInspector). La migración a la factoría unifica el
//      wiring. Los offsets por grupo (2→+2, 3→+3, 4→+4, 5→+7) son los
//      mismos que Conductor/Inspector, así que pasar por la factoría
//      común no cambia comportamiento. Pequeña diferencia en SubComunes:
//      antes Buho llamaba a getListaSubgrupoReduccion sin pre-calcular
//      getFechaInit; la factoría hace el pre-cálculo via
//      getListaSubComunesConductorInspector. Resultado idéntico (los
//      636 tests siguen pasando), solo cambia el nº de iteraciones de
//      calentamiento del bucle interno.

import { crearCalendarioBasico } from './FechasFactory.js';

const subgruposPorGrupo = [
    [new Date(2022, 1, 16), new Date(2022, 0, 3), new Date(2022, 1, 7), new Date(2022, 2, 14), new Date(2022, 1, 1), new Date(2022, 0, 2), new Date(2022, 1, 6), new Date(2022, 0, 12)],
    [new Date(2022, 1, 9), new Date(2022, 2, 16), new Date(2022, 0, 31), new Date(2022, 2, 7), new Date(2022, 0, 25), new Date(2022, 2, 1), new Date(2022, 0, 30), new Date(2022, 0, 5)],
    [new Date(2022, 1, 2), new Date(2022, 2, 9), new Date(2022, 0, 24), new Date(2022, 1, 28), new Date(2022, 0, 18), new Date(2022, 1, 22), new Date(2022, 0, 23), new Date(2022, 1, 27)],
    [new Date(2022, 0, 26), new Date(2022, 2, 2), new Date(2022, 0, 17), new Date(2022, 1, 21), new Date(2022, 0, 11), new Date(2022, 1, 15), new Date(2022, 0, 16), new Date(2022, 1, 20)],
    [new Date(2022, 0, 19), new Date(2022, 1, 23), new Date(2022, 0, 10), new Date(2022, 1, 14), new Date(2022, 0, 4), new Date(2022, 1, 8), new Date(2022, 0, 9), new Date(2022, 1, 13)],
];

// WHY: sábados comunes a dos grupos (A-C-E-G y B-D-F-H). Columnas:
//      0 = ACEG, 1 = BDFH.
const subComunesPorGrupo = [
    [new Date(2022, 0, 28), new Date(2022, 2, 4)],
    [new Date(2022, 0, 21), new Date(2022, 1, 25)],
    [new Date(2022, 0, 14), new Date(2022, 1, 18)],
    [new Date(2022, 0, 7), new Date(2022, 1, 11)],
    [new Date(2022, 2, 11), new Date(2022, 1, 4)],
];

// WHY: secuencia [60, 65, 76, 79] ordenada miércoles (default), domingo,
//      martes, lunes (posiciones 0..3). day = JS getDay()
//      (domingo=0, lunes=1, ..., sábado=6).
const getPosSecuenciaBuho = (fechaInit) => {
    const day = fechaInit.getDay();
    if (day === 0) return 1; // domingo
    if (day === 2) return 2; // martes
    if (day === 1) return 3; // lunes
    return 0;                // miércoles (default)
};

const cal = crearCalendarioBasico({
    libres: {
        fechaInicial: new Date(2022, 0, 4),
        secuencia: [2, 3, 2, 3],
        trabajo: [8, 6, 7, 8],
        totalSecuencia: 35,
    },
    subgrupo: {
        fechasIniciales: subgruposPorGrupo,
        secuencia: [60, 65, 76, 79],
        totalSecuencia: 280,
        getPosSecuencia: getPosSecuenciaBuho,
    },
    subComunes: {
        fechasIniciales: subComunesPorGrupo,
        totalSecuencia: 70,
    },
});

export const getListaLibresBuho = cal.getListaLibres;
export const getListaSubgrupoBuho = cal.getListaSubgrupo;
export const getListaSubComunesBuho = cal.getListaSubComunes;
