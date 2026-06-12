import { crearCalendarioBasico } from './FechasFactory.js';

// WHY: matriz [grupo-1][letra A..J = 0..9] → fecha base del subgrupo
//      en el año 2022 (se cambiaron los subgrupos a partir de ese año).
const subgruposPorGrupo = [
    [new Date(2022, 1, 2), new Date(2022, 0, 3), new Date(2022, 1, 7), new Date(2022, 0, 7), new Date(2022, 1, 11), new Date(2022, 0, 13), new Date(2022, 1, 17), new Date(2022, 0, 4), new Date(2022, 1, 8), new Date(2022, 2, 15)],
    [new Date(2022, 0, 26), new Date(2022, 2, 2), new Date(2022, 0, 31), new Date(2022, 2, 7), new Date(2022, 1, 4), new Date(2022, 0, 6), new Date(2022, 1, 10), new Date(2022, 2, 17), new Date(2022, 1, 1), new Date(2022, 2, 8)],
    [new Date(2022, 0, 19), new Date(2022, 1, 23), new Date(2022, 0, 24), new Date(2022, 1, 28), new Date(2022, 0, 28), new Date(2022, 2, 4), new Date(2022, 1, 3), new Date(2022, 2, 10), new Date(2022, 0, 25), new Date(2022, 2, 1)],
    [new Date(2022, 0, 12), new Date(2022, 1, 16), new Date(2022, 0, 17), new Date(2022, 1, 21), new Date(2022, 0, 21), new Date(2022, 1, 25), new Date(2022, 0, 27), new Date(2022, 2, 3), new Date(2022, 0, 18), new Date(2022, 1, 22)],
    [new Date(2022, 0, 5), new Date(2022, 1, 9), new Date(2022, 0, 10), new Date(2022, 1, 14), new Date(2022, 0, 14), new Date(2022, 1, 18), new Date(2022, 0, 20), new Date(2022, 1, 24), new Date(2022, 0, 11), new Date(2022, 1, 15)],
];

// WHY: sábados comunes a dos grupos (A-C-E-G-I y B-D-F-H-J) a partir
//      de 2022. Columnas: 0 = ACEGI, 1 = BDFHJ.
const subComunesPorGrupo = [
    [new Date(2022, 0, 29), new Date(2022, 2, 5)],
    [new Date(2022, 0, 22), new Date(2022, 1, 26)],
    [new Date(2022, 0, 15), new Date(2022, 1, 19)],
    [new Date(2022, 0, 8), new Date(2022, 1, 12)],
    [new Date(2022, 0, 1), new Date(2022, 1, 5)],
];

// WHY: la secuencia de subgrupo es [65, 76, 79, 64, 66] = distancias
//      entre días que caen en miércoles, martes, jueves, viernes y
//      lunes (en ese orden de posición).
const getPosSecuenciaInspector = (fechaInit) => {
    const day = fechaInit.getDay();
    if (day === 2) return 2; // martes
    if (day === 3) return 1; // miércoles
    if (day === 4) return 3; // jueves
    if (day === 5) return 4; // viernes
    return 0;                // lunes (default)
};

const cal = crearCalendarioBasico({
    libres: {
        fechaInicial: new Date(2022, 0, 5),
        secuencia: [2, 3, 2, 3],
        trabajo: [8, 6, 7, 8],
        totalSecuencia: 35,
    },
    subgrupo: {
        fechasIniciales: subgruposPorGrupo,
        secuencia: [65, 76, 79, 64, 66],
        totalSecuencia: 350,
        getPosSecuencia: getPosSecuenciaInspector,
    },
    subComunes: {
        fechasIniciales: subComunesPorGrupo,
        totalSecuencia: 70,
    },
});

export const getListaLibresInspector = cal.getListaLibres;
export const getListaSubgrupoInspector = cal.getListaSubgrupo;
export const getListaSubComunesInspector = cal.getListaSubComunes;
