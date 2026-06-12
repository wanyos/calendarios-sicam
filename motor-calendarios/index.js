// Punto de entrada público del motor de cálculo de calendarios.
//
// Este módulo es JavaScript vanilla 100% puro (ES modules): NO depende del
// DOM, del navegador ni de ninguna librería externa. Se puede importar tal
// cual desde un backend Node (Fastify, etc.).
//
// API pública = las 3 funciones del dispatcher. Dado (tipoCalendario, year,
// grupo, subgrupo/grupoDos) devuelven listas de objetos Date del año pedido.
//
//   import { getDatosListaLibres, getDatosListaSubgrupo, getDatosListaSubComunes }
//       from './motor-calendarios/index.js';
//
//   const libres     = getDatosListaLibres('Conductor', 2026, 1, undefined) ?? [];
//   const subgrupo   = getDatosListaSubgrupo('Conductor', 2026, 1, 'A') ?? [];
//   const subComunes = getDatosListaSubComunes('Conductor', 2026, 1, 'A') ?? [];
//
// IMPORTANTE:
//   - Algunas combinaciones devuelven `undefined` (tipos que no manejan esa
//     lista, p.ej. GruaDSM_Noche no tiene subgrupo). Blindar SIEMPRE con `?? []`.
//   - En GruaDSM el `subgrupo` de getDatosListaSubgrupo es un NÚMERO (1-50).
//   - En ParkingDSM_50: "Subgrupo" = días de reducción; "SubComunes" = jornada
//     parcial (mapeo invertido respecto a lo que sugiere el nombre).
//   - `grupoDos` solo lo usa Refuerzo_Nocturno (número 1-9 o letra A-K).
//   - Las fechas se comparan en HORA LOCAL. Al serializar a string NO usar
//     toISOString() (desplaza un día en UTC+1/+2). Ver serializarFecha() abajo.

export {
    getDatosListaLibres,
    getDatosListaSubgrupo,
    getDatosListaSubComunes,
} from './DatosFechas.js';

// Helper de conveniencia: serializa un Date a "YYYY-MM-DD" en HORA LOCAL.
// Evita el desfase de un día que provoca toISOString() en zonas UTC+ (España).
export const serializarFecha = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
};

// Helper de conveniencia: devuelve las 3 listas ya serializadas a "YYYY-MM-DD".
// Es exactamente lo que un endpoint de cálculo del backend necesita devolver.
export const calcularCalendario = (tipoCalendario, year, grupo, subgrupo, grupoDos) => {
    // imports diferidos para no crear dependencia circular con DatosFechas
    return {
        libres:     (getDatos('libres', tipoCalendario, year, grupo, grupoDos)).map(serializarFecha),
        subgrupo:   (getDatos('subgrupo', tipoCalendario, year, grupo, subgrupo)).map(serializarFecha),
        subComunes: (getDatos('subComunes', tipoCalendario, year, grupo, subgrupo)).map(serializarFecha),
    };
};

// helper interno
import {
    getDatosListaLibres as _libres,
    getDatosListaSubgrupo as _subgrupo,
    getDatosListaSubComunes as _subComunes,
} from './DatosFechas.js';

function getDatos(cual, tipo, year, grupo, arg) {
    if (cual === 'libres')     return _libres(tipo, year, grupo, arg) ?? [];
    if (cual === 'subgrupo')   return _subgrupo(tipo, year, grupo, arg) ?? [];
    if (cual === 'subComunes') return _subComunes(tipo, year, grupo, arg) ?? [];
    return [];
}
