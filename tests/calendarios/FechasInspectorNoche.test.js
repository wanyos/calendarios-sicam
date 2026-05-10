// WHY: punto de entrada de la suite de tests del proyecto. Validamos
//      Inspector_Noche primero porque es el calendario donde detectamos
//      BUG-01 (fechas malformadas en grupo 4 J y grupo 5 J reconstruidas
//      por hipótesis "-1 día respecto a Inspector"). Estos tests cierran
//      el bucle: si la hipótesis es correcta, pasarán; si la fuente
//      oficial dice otra cosa, fallarán ruidosamente.

import { describe, it, expect } from 'vitest';
import {
  getListaLibresInspectorNoche,
  getListaSubgrupoInspectorNoche,
  getListaSubComunesInspectorNoche,
} from '../../src/calendarios/FechasInspectorNoche.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const GRUPOS = [1, 2, 3, 4, 5];
const SUBGRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

describe('FechasInspectorNoche — getListaLibresInspectorNoche', () => {
  for (const grupo of GRUPOS) {
    it(`grupo ${grupo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getListaLibresInspectorNoche(YEAR, grupo);
      expectArrayDeFechasDelAnyo(lista, YEAR);
    });
  }
});

describe('FechasInspectorNoche — getListaSubgrupoInspectorNoche', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubgrupoInspectorNoche(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});

describe('FechasInspectorNoche — getListaSubComunesInspectorNoche', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubComunesInspectorNoche(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista);
      });
    }
  }
});

// WHY: validación oficial contra calendario impreso (Inspector Noche G-4
//      año 2026) recibido de la fuente sindical. Si estos tests pasan,
//      BUG-01 se cierra definitivamente. Si fallan, identificamos fecha
//      a fecha qué hay que ajustar en el array `subgrupos` de
//      FechasInspectorNoche.js.
describe('FechasInspectorNoche — validación oficial calendario 2026 grupo 4', () => {
  const OFICIAL_GRUPO_4 = {
    A: ['2026-01-26', '2026-04-15', '2026-06-18', '2026-08-23', '2026-10-27'],
    B: ['2026-03-02', '2026-05-20', '2026-07-23', '2026-09-27', '2026-12-01'],
    C: ['2026-01-20', '2026-04-06', '2026-06-24', '2026-08-27', '2026-11-01'],
    D: ['2026-02-24', '2026-05-11', '2026-07-29', '2026-10-01', '2026-12-06'],
    E: ['2026-01-25', '2026-03-31', '2026-06-15', '2026-09-02', '2026-11-05'],
    F: ['2026-03-01', '2026-05-05', '2026-07-20', '2026-10-07', '2026-12-10'],
    G: ['2026-01-29', '2026-04-05', '2026-06-09', '2026-08-24', '2026-11-11'],
    H: ['2026-03-05', '2026-05-10', '2026-07-14', '2026-09-28', '2026-12-16'],
    I: ['2026-02-04', '2026-04-09', '2026-06-14', '2026-08-18', '2026-11-02'],
    J: ['2026-03-11', '2026-05-14', '2026-07-19', '2026-09-22', '2026-12-07'],
  };

  for (const [sub, esperadas] of Object.entries(OFICIAL_GRUPO_4)) {
    it(`subgrupo ${sub}: fechas coinciden con calendario oficial`, () => {
      const lista = getListaSubgrupoInspectorNoche(2026, 4, sub);
      const isos = lista.map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      expect(isos).toEqual(esperadas);
    });
  }
});

// WHY: BUG-01 original — antes del fix, grupo 4 J y grupo 5 J devolvían
//      fechas de 2023/2031 en vez del año pedido (las fechas base estaban
//      malformadas y JS rebalanceaba). Si alguien revierte el fix, este
//      describe lo destaca para que sea evidente qué bug protege.
describe('FechasInspectorNoche — BUG-01: subgrupos J grupo 4 y 5 (snapshots históricos)', () => {
  it('grupo 4 J: la primera fecha del array está en el año pedido (no en 2023)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 4, 'J');
    expect(lista[0].getFullYear()).toBe(YEAR);
  });

  it('grupo 5 J: la primera fecha del array está en el año pedido (no en 2031)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 5, 'J');
    expect(lista[0].getFullYear()).toBe(YEAR);
  });

  // WHY: snapshot del array completo en formato LOCAL (no UTC). Antes
  //      usábamos toISOString que devuelve UTC — en zonas horarias con
  //      offset positivo (España UTC+1/+2) eso desfasa 1 día respecto
  //      a la fecha que se pinta en el navegador, lo cual confundía al
  //      comparar contra un calendario impreso. Ahora el snapshot usa
  //      la misma fecha local que ven los usuarios.
  const fechaLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('grupo 4 J: snapshot completo (validado contra calendario oficial 2026)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 4, 'J');
    expect(lista.map(fechaLocal)).toMatchSnapshot();
  });

  it('grupo 5 J: snapshot completo (validado contra calendario oficial 2026)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 5, 'J');
    expect(lista.map(fechaLocal)).toMatchSnapshot();
  });
});
