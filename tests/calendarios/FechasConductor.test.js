import { describe, it, expect } from 'vitest';
import {
  getListaLibresConductor,
  getListaSubgrupoConductor,
  getListaSubComunesConductor,
} from '../../src/calendarios/FechasConductor.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5];
const SUBGRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

describe('FechasConductor — getListaLibresConductor', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresConductor(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasConductor — getListaSubgrupoConductor', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubgrupoConductor(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }

  it('B3: un grupo fuera de rango lanza un error claro', () => {
    expect(() => getListaSubgrupoConductor(2026, 7, 'A')).toThrow('Grupo fuera de rango');
  });

  it('B4: una letra de subgrupo inexistente lanza un error claro', () => {
    expect(() => getListaSubgrupoConductor(2026, 1, 'I')).toThrow('Subgrupo fuera de rango');
  });
});

describe('FechasConductor — getListaSubComunesConductor', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubComunesConductor(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});
