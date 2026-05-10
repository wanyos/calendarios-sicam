// WHY: factoría declarativa para los 4 calendarios que comparten estructura
//      completa (Conductor, Inspector, Inspector_Noche, Buho). Antes cada
//      uno duplicaba ~100 LOC de wiring entre arrays de fechas, secuencias
//      y los helpers de FechasConductorInspector. Aquí el patrón vive en
//      un solo sitio y cada calendario queda como un fichero declarativo
//      de ~30 LOC.
//
//      Los otros 5 calendarios (Grua, GruaDSM, GruaDSM_Noche,
//      ParkingDSM_*, Refuerzo_Nocturno) NO usan esta factoría porque
//      tienen estructuras suficientemente distintas como para que
//      adaptar la factoría a sus casos la haría más confusa que el
//      código duplicado.

import { letraAIndice } from './FuncionesComunes.js';
import {
    getLibresConductorInspector,
    getListaSubgrupoConductorInspector,
    getListaSubComunesConductorInspector,
} from './FechasConductorInspector.js';

/**
 * Crea las 3 funciones públicas (Libres, Subgrupo, SubComunes) para un
 * calendario que sigue el patrón de Conductor/Inspector.
 *
 * @param {object} config
 * @param {object} config.libres
 *   @prop {Date}      fechaInicial    - fecha base del grupo 1 en el año cero del calendario
 *   @prop {number[]}  secuencia       - días libres por bloque del ciclo (ej. [2,3,2,3])
 *   @prop {number[]}  trabajo         - días de trabajo por bloque del ciclo (ej. [8,6,7,8])
 *   @prop {number}    totalSecuencia  - duración del ciclo completo en días
 * @param {object} config.subgrupo
 *   @prop {Date[][]}  fechasIniciales - matriz [grupo-1][indiceLetra] → fecha base de cada subgrupo
 *   @prop {number[]}  secuencia       - distancias entre días del subgrupo
 *   @prop {number}    totalSecuencia  - duración del ciclo completo en días
 *   @prop {(d:Date)=>number} getPosSecuencia - mapea día de la semana a índice en secuencia
 * @param {object} config.subComunes
 *   @prop {Date[][]}  fechasIniciales - matriz [grupo-1][0|1] → fecha (0=ACEGI, 1=BDFHJ)
 *   @prop {number}    totalSecuencia  - duración del ciclo completo en días
 *
 * @returns {{
 *   getListaLibres: (year:number, grupo:number) => Date[],
 *   getListaSubgrupo: (year:number, grupo:number, subgrupo:string) => Date[],
 *   getListaSubComunes: (year:number, grupo:number, subgrupo:string) => Date[],
 * }}
 */
export function crearCalendarioBasico({ libres, subgrupo, subComunes }) {
    const getListaLibres = (year, grupo) =>
        getLibresConductorInspector(
            year,
            grupo,
            libres.fechaInicial,
            libres.totalSecuencia,
            libres.secuencia,
            libres.trabajo,
        );

    const getListaSubgrupo = (year, grupo, sub) => {
        const fechaInit = getFechaSubgrupo(subgrupo.fechasIniciales, grupo, sub);
        const pos = subgrupo.getPosSecuencia(fechaInit);
        return getListaSubgrupoConductorInspector(
            year,
            fechaInit,
            subgrupo.totalSecuencia,
            subgrupo.secuencia,
            pos,
        );
    };

    const getListaSubComunes = (year, grupo, sub) => {
        const fechaInit = getFechaSubComunes(subComunes.fechasIniciales, grupo, sub);
        return getListaSubComunesConductorInspector(year, fechaInit, subComunes.totalSecuencia);
    };

    return { getListaLibres, getListaSubgrupo, getListaSubComunes };
}

// WHY: helper interno — busca la fecha del subgrupo en la matriz por
//      [grupo-1][indiceLetra]. Si grupo está fuera del rango 1-5,
//      devuelve la primera columna como fallback (comportamiento
//      preservado del código original).
function getFechaSubgrupo(matriz, grupo, sub) {
    const pos = letraAIndice(sub);
    if (grupo >= 1 && grupo <= 5) {
        return matriz[grupo - 1][pos];
    }
    return matriz[grupo - 1][0];
}

// WHY: helper interno — la matriz subComunes solo tiene 2 columnas
//      (ACEGI=0, BDFHJ=1). Las letras impares en orden alfabético
//      (A,C,E,G,I) van a 0; las pares (B,D,F,H,J) a 1.
function getFechaSubComunes(matriz, grupo, sub) {
    const pos = 'BDFHJ'.includes(sub) ? 1 : 0;
    if (grupo >= 1 && grupo <= 5) {
        return matriz[grupo - 1][pos];
    }
    return matriz[grupo - 1][0];
}
