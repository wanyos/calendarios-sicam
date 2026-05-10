import { describe, it } from 'vitest';
import {
  getListaLibresBuho,
  getListaSubgrupoBuho,
  getListaSubComunesBuho,
} from '../../src/calendarios/FechasBuho.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5];
const SUBGRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

describe('FechasBuho — getListaLibresBuho', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresBuho(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasBuho — getListaSubgrupoBuho', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubgrupoBuho(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});

describe('FechasBuho — getListaSubComunesBuho', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubComunesBuho(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});
