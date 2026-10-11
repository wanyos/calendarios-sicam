// WHY: reproduce, sin DOM, lo que index.js pinta para una combinación y
//      un año: setDatos (dispatcher + ?? [] + Set de claves) seguido de
//      comprobarDia para cada día. El resultado es un string con un
//      carácter por día del año — exactamente la información que ve el
//      usuario (qué color tiene cada día).
//
//      Codificación: '-' sin marca, 'L' libres, 'S' subgrupo,
//                    '1' sub1, '2' sub2.

import {
  getDatosListaLibres,
  getDatosListaSubgrupo,
  getDatosListaSubComunes,
} from '../../src/calendarios/DatosFechas.js';
import { claveFecha, comprobarDia, getTotalDays } from '../../src/calendarios/utils.js';

const CODIGO = { libres: 'L', subgrupo: 'S', sub1: '1', sub2: '2' };

export function renderAnyo({ tipo, grupo, subgrupo, grupoDos }, year) {
  const aSet = (lista) => new Set((lista ?? []).map(claveFecha));
  const sets = {
    libres: aSet(getDatosListaLibres(tipo, year, grupo, grupoDos)),
    subgrupo: aSet(getDatosListaSubgrupo(tipo, year, grupo, subgrupo)),
    subComunes: aSet(getDatosListaSubComunes(tipo, year, grupo, subgrupo)),
  };

  let salida = '';
  for (let mes = 1; mes <= 12; mes++) {
    for (let dia = 1; dia <= getTotalDays(mes, year); dia++) {
      const clase = comprobarDia(String(dia), mes, year, sets, subgrupo);
      salida += CODIGO[clase] ?? '-';
    }
  }
  return salida;
}

// WHY: traduce un índice de día del año (0-based) a "YYYY-MM-DD" para que
//      los mensajes de fallo digan fechas legibles, no posiciones.
export function fechaDeIndice(year, indice) {
  const d = new Date(year, 0, 1 + indice);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
