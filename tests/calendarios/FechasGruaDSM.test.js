// WHY: GruaDSM tiene 5 grupos para getListaLibres pero el "subgrupo"
//      es un NÚMERO de 1 a 50 (no una letra como en otros calendarios).
//      Iteramos los 50 valores posibles.

import { describe, it } from 'vitest';
import {
  getListaLibresGruaDSM,
  getListaSubgrupoGruaDSM,
} from '../../src/calendarios/FechasGruaDSM.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5];

describe('FechasGruaDSM — getListaLibresGruaDSM', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresGruaDSM(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasGruaDSM — getListaSubgrupoGruaDSM', () => {
  for (let numSubgrupo = 1; numSubgrupo <= 50; numSubgrupo++) {
    it(`numSubgrupo ${numSubgrupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaSubgrupoGruaDSM(YEAR, numSubgrupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});
