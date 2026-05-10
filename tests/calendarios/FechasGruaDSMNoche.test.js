// WHY: GruaDSM_Noche solo tiene 3 grupos (no 5) y NO tiene función
//      de subgrupo — el .field--subgrupo se oculta en la UI.

import { describe, it } from 'vitest';
import { getListaLibresGruaDSMNoche } from '../../src/calendarios/FechasGruaDSMNoche.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3];

describe('FechasGruaDSMNoche — getListaLibresGruaDSMNoche', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresGruaDSMNoche(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }
});
