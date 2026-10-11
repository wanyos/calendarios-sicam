import { describe, it, expect } from 'vitest';
import {
  getListaLibresGrua,
  getListaSubgrupoGrua,
} from '../../src/calendarios/FechasGrua.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5];
const SUBGRUPOS = ['A', 'B', 'C'];

describe('FechasGrua — getListaLibresGrua', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresGrua(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasGrua — getListaSubgrupoGrua', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubgrupoGrua(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }

  it('B3: un grupo fuera de rango lanza un error claro', () => {
    expect(() => getListaSubgrupoGrua(2026, 7, 'A')).toThrow('Grupo fuera de rango');
  });

  it('B4: una letra de subgrupo inexistente lanza un error claro', () => {
    expect(() => getListaSubgrupoGrua(2026, 1, 'D')).toThrow('Subgrupo fuera de rango');
  });
});
