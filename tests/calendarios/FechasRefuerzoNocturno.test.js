// WHY: Refuerzo_Nocturno tiene 2 grupos (A, B) y un "grupoDos" que
//      puede ser un número (1-9) o una letra (A-K) según el radio
//      seleccionado en la UI. Iteramos ambos dominios.
//      Los números se pasan como STRING desde el select (.value), así
//      que respetamos esa forma — el código tiene un parseInt interno.

import { describe, it } from 'vitest';
import { getListaLibresRefuerzoNocturno } from '../../src/calendarios/FechasRefuerzoNocturno.js';
import { NUMEROS_REFUERZO, LETRAS_REFUERZO } from '../../src/calendarios/Constantes.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = ['A', 'B'];

describe('FechasRefuerzoNocturno — números (1-9)', () => {
  for (const grupo of GRUPOS) {
    for (const num of NUMEROS_REFUERZO) {
      it(`grupo ${grupo} grupoDos ${num}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaLibresRefuerzoNocturno(YEAR, grupo, String(num));
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});

describe('FechasRefuerzoNocturno — letras (A-K)', () => {
  for (const grupo of GRUPOS) {
    for (const letra of LETRAS_REFUERZO) {
      it(`grupo ${grupo} grupoDos ${letra}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaLibresRefuerzoNocturno(YEAR, grupo, letra);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});
