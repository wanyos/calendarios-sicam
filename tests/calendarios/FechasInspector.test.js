import { describe, it } from 'vitest';
import {
  getListaLibresInspector,
  getListaSubgrupoInspector,
  getListaSubComunesInspector,
} from '../../src/calendarios/FechasInspector.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5];
const SUBGRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

describe('FechasInspector — getListaLibresInspector', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresInspector(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasInspector — getListaSubgrupoInspector', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubgrupoInspector(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});

describe('FechasInspector — getListaSubComunesInspector', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubComunesInspector(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});
