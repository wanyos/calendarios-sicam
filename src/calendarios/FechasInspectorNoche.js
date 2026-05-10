import { crearCalendarioBasico } from './FechasFactory.js';

// WHY (2026-05-10): los dos últimos new Date(...) (grupo 4 J y grupo 5 J)
//   tenían un typo (faltaba la coma del día): (2022,21) y (2022,114).
//   Reconstruidos a (2022,1,21) y (2022,1,14) siguiendo el patrón
//   "-1 día respecto a Inspector". Validado contra calendario impreso
//   oficial 2026. Ver docs/REVISION_CALENDARIOS.md → BUG-01.
const subgruposPorGrupo = [
    [new Date(2022, 1, 1), new Date(2022, 0, 2), new Date(2022, 1, 6), new Date(2022, 0, 6), new Date(2022, 1, 10), new Date(2022, 0, 12), new Date(2022, 1, 16), new Date(2022, 0, 3), new Date(2022, 1, 7), new Date(2022, 2, 14)],
    [new Date(2022, 0, 25), new Date(2022, 2, 1), new Date(2022, 0, 30), new Date(2022, 2, 6), new Date(2022, 1, 3), new Date(2022, 0, 5), new Date(2022, 1, 9), new Date(2022, 2, 16), new Date(2022, 0, 31), new Date(2022, 2, 7)],
    [new Date(2022, 0, 18), new Date(2022, 1, 22), new Date(2022, 0, 23), new Date(2022, 1, 27), new Date(2022, 0, 27), new Date(2022, 2, 3), new Date(2022, 1, 2), new Date(2022, 2, 9), new Date(2022, 0, 24), new Date(2022, 1, 28)],
    [new Date(2022, 0, 11), new Date(2022, 1, 15), new Date(2022, 0, 16), new Date(2022, 1, 20), new Date(2022, 0, 20), new Date(2022, 1, 24), new Date(2022, 0, 26), new Date(2022, 2, 2), new Date(2022, 0, 17), new Date(2022, 1, 21)],
    [new Date(2022, 0, 4), new Date(2022, 1, 8), new Date(2022, 0, 9), new Date(2022, 1, 13), new Date(2022, 0, 13), new Date(2022, 1, 17), new Date(2022, 0, 19), new Date(2022, 1, 23), new Date(2022, 0, 10), new Date(2022, 1, 14)],
];

// WHY: sábados comunes a dos grupos (A-C-E-G-I y B-D-F-H-J) a partir
//      de 2022. Columnas: 0 = ACEGI, 1 = BDFHJ.
const subComunesPorGrupo = [
    [new Date(2022, 0, 28), new Date(2022, 2, 4)],
    [new Date(2022, 0, 21), new Date(2022, 1, 25)],
    [new Date(2022, 0, 14), new Date(2022, 1, 18)],
    [new Date(2022, 0, 7), new Date(2022, 1, 11)],
    [new Date(2022, 1, 11), new Date(2022, 1, 4)],
];

// WHY: secuencia [65, 76, 79, 64, 66] = distancias entre días que caen
//      en lunes, martes, miércoles, jueves y domingo (en ese orden de
//      posición). Se diferencia de Inspector porque InspectorNoche
//      empieza la noche del día anterior.
const getPosSecuenciaInspectorNoche = (fechaInit) => {
    const day = fechaInit.getDay();
    if (day === 1) return 2; // lunes
    if (day === 2) return 1; // martes
    if (day === 3) return 3; // miércoles
    if (day === 4) return 4; // jueves
    return 0;                // domingo (default)
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
        secuencia: [65, 76, 79, 64, 66],
        totalSecuencia: 350,
        getPosSecuencia: getPosSecuenciaInspectorNoche,
    },
    subComunes: {
        fechasIniciales: subComunesPorGrupo,
        totalSecuencia: 70,
    },
});

export const getListaLibresInspectorNoche = cal.getListaLibres;
export const getListaSubgrupoInspectorNoche = cal.getListaSubgrupo;
export const getListaSubComunesInspectorNoche = cal.getListaSubComunes;
