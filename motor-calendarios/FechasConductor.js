import { crearCalendarioBasico } from './FechasFactory.js';

// WHY: las matrices de fechas son la "configuración" del calendario.
//      Cada fila corresponde a un grupo (1-5) y cada columna a una letra
//      del subgrupo (A-H = índices 0-7). letraAIndice (en FuncionesComunes)
//      hace el mapeo letra→índice.
const subgruposPorGrupo = [
    [new Date(2020, 2, 4), new Date(2020, 1, 3), new Date(2020, 0, 9), new Date(2020, 1, 13), new Date(2020, 2, 19), new Date(2020, 1, 4), new Date(2020, 2, 10), new Date(2020, 0, 29)],
    [new Date(2020, 1, 26), new Date(2020, 0, 27), new Date(2020, 0, 2), new Date(2020, 1, 6), new Date(2020, 2, 12), new Date(2020, 0, 28), new Date(2020, 2, 3), new Date(2020, 0, 22)],
    [new Date(2020, 1, 19), new Date(2020, 2, 25), new Date(2020, 1, 24), new Date(2020, 0, 30), new Date(2020, 2, 5), new Date(2020, 0, 21), new Date(2020, 1, 25), new Date(2020, 0, 15)],
    [new Date(2020, 1, 12), new Date(2020, 0, 13), new Date(2020, 1, 17), new Date(2020, 2, 23), new Date(2020, 1, 27), new Date(2020, 0, 14), new Date(2020, 1, 18), new Date(2020, 2, 24)],
    [new Date(2020, 1, 5), new Date(2020, 2, 11), new Date(2020, 1, 10), new Date(2020, 2, 16), new Date(2020, 1, 20), new Date(2020, 2, 26), new Date(2020, 1, 11), new Date(2020, 2, 17)],
];

// WHY: sábados de subgrupos comunes a dos grupos (A-C-E-G y B-D-F-H) a
//      partir de 2020. Columnas: 0 = ACEG, 1 = BDFH.
const subComunesPorGrupo = [
    [new Date(2020, 1, 29), new Date(2020, 0, 25)],
    [new Date(2020, 1, 22), new Date(2020, 0, 18)],
    [new Date(2020, 1, 15), new Date(2020, 0, 11)],
    [new Date(2020, 1, 8), new Date(2020, 0, 4)],
    [new Date(2020, 1, 1), new Date(2020, 2, 7)],
];

// WHY: la secuencia de subgrupo es [60, 65, 76, 79] = distancias entre
//      días que caen en jueves, lunes, miércoles y martes (en ese orden
//      de posición). getPosSecuencia mapea el día de la semana a su pos.
const getPosSecuenciaConductor = (fechaInit) => {
    const day = fechaInit.getDay();
    if (day === 1) return 1; // lunes
    if (day === 3) return 2; // miércoles
    if (day === 2) return 3; // martes
    return 0;                // jueves (default)
};

const cal = crearCalendarioBasico({
    libres: {
        fechaInicial: new Date(2020, 0, 1),
        secuencia: [2, 3, 2, 3],
        trabajo: [8, 6, 7, 8],
        totalSecuencia: 35,
    },
    subgrupo: {
        fechasIniciales: subgruposPorGrupo,
        secuencia: [60, 65, 76, 79],
        totalSecuencia: 280,
        getPosSecuencia: getPosSecuenciaConductor,
    },
    subComunes: {
        fechasIniciales: subComunesPorGrupo,
        totalSecuencia: 70,
    },
});

export const getListaLibresConductor = cal.getListaLibres;
export const getListaSubgrupoConductor = cal.getListaSubgrupo;
export const getListaSubComunesConductor = cal.getListaSubComunes;
