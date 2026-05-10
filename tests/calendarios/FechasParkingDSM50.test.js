// WHY: ParkingDSM_50 tiene 12 grupos y 3 funciones públicas (Libres,
//      Reduccion, Subgrupo) que aceptan solo (year, grupo). Aquí el
//      "Reduccion" pinta como sub2 en la UI y "Subgrupo" como sub1.

import { describe, it } from 'vitest';
import {
  getListaLibresParkingDSM50,
  getListaReduccionParkingDSM50,
  getListaSubgrupoParkingDSM50,
} from '../../src/calendarios/FechasParkingDSM50.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

describe('FechasParkingDSM50 — getListaLibresParkingDSM50', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresParkingDSM50(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasParkingDSM50 — getListaReduccionParkingDSM50', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaReduccionParkingDSM50(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasParkingDSM50 — getListaSubgrupoParkingDSM50', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaSubgrupoParkingDSM50(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});
