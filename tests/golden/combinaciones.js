// WHY: enumeración de TODAS las combinaciones que un usuario puede
//      seleccionar en la UI, con los argumentos tal y como los pasa
//      index.js (setDatos). Es la fuente del golden master: si una
//      combinación no está aquí, su calendario no está protegido.
//
//      Los valores replican InitCabecera.js (no se importa porque
//      manipula el DOM):
//        - grupo: número (parseInt en setDatos) salvo Refuerzo_Nocturno,
//          que usa la letra 'A' / 'B'.
//        - subgrupo: letra, o string numérico en GruaDSM ("4", "9", ...,
//          como sale de select.value). undefined en las categorías que
//          ocultan el select de subgrupo.
//        - grupoDos: solo Refuerzo_Nocturno, string "1".."9" o letra A-K.

import { NUMEROS_REFUERZO, LETRAS_REFUERZO } from '../../src/calendarios/Constantes.js';

// WHY: ventana de años protegida. La UI ofrece [año actual - 2, +10]; el
//      rango cubre la ventana de hoy con margen para los próximos años.
export const YEAR_DESDE = 2024;
export const YEAR_HASTA = 2050;

const rango = (desde, hasta) => Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
const LETRAS = (n) => 'ABCDEFGHIJ'.slice(0, n).split('');

function conSubgrupoLetra(tipo, grupos, numLetras) {
    return grupos.flatMap(grupo =>
        LETRAS(numLetras).map(subgrupo => ({ tipo, grupo, subgrupo, grupoDos: undefined })));
}

function sinSubgrupo(tipo, grupos) {
    return grupos.map(grupo => ({ tipo, grupo, subgrupo: undefined, grupoDos: undefined }));
}

// WHY: GruaDSM muestra 10 subgrupos por grupo: g, g+5, ..., g+45
//      (getArrayGruaDSM en InitCabecera.js).
function gruaDSM() {
    return rango(1, 5).flatMap(grupo =>
        rango(0, 9).map(i => ({ tipo: 'GruaDSM', grupo, subgrupo: String(grupo + i * 5), grupoDos: undefined })));
}

function refuerzoNocturno() {
    const valores = [...NUMEROS_REFUERZO.map(String), ...LETRAS_REFUERZO];
    return ['A', 'B'].flatMap(grupo =>
        valores.map(grupoDos => ({ tipo: 'Refuerzo_Nocturno', grupo, subgrupo: undefined, grupoDos })));
}

export const COMBINACIONES = [
    ...conSubgrupoLetra('Conductor', rango(1, 5), 8),
    ...conSubgrupoLetra('Inspector', rango(1, 5), 10),
    ...conSubgrupoLetra('Inspector_Noche', rango(1, 5), 10),
    ...conSubgrupoLetra('Grua', rango(1, 5), 3),
    ...gruaDSM(),
    ...sinSubgrupo('GruaDSM_Noche', rango(1, 3)),
    ...sinSubgrupo('ParkingDSM_100', rango(1, 10)),
    ...sinSubgrupo('ParkingDSM_50', rango(1, 12)),
    ...refuerzoNocturno(),
    ...conSubgrupoLetra('Buho', rango(1, 5), 8),
];

export const YEARS = rango(YEAR_DESDE, YEAR_HASTA);

export const claveCombinacion = ({ tipo, grupo, subgrupo, grupoDos }) =>
    [tipo, `g${grupo}`, subgrupo !== undefined && `s${subgrupo}`, grupoDos !== undefined && `d${grupoDos}`]
        .filter(Boolean).join('|');
