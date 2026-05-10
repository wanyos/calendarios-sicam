// WHY: ParkingDSM_100 tiene 10 grupos. La función "Subgrupo" pública
//      acepta solo (year, grupo) — no hay subgrupo letra (en la UI
//      tampoco se muestra el select de subgrupo, solo el de grupo).

import { describe, it } from 'vitest';
import {
  getListaLibresParkingDSM100,
  getListaSubgrupoParkingDSM100,
} from '../../src/calendarios/FechasParkingDSM100.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

describe('FechasParkingDSM100 — getListaLibresParkingDSM100', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresParkingDSM100(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});

describe('FechasParkingDSM100 — getListaSubgrupoParkingDSM100', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaSubgrupoParkingDSM100(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});
