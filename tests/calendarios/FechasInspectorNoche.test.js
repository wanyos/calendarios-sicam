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

const YEAR = 2026;
const GRUPOS = [1, 2, 3, 4, 5];
const SUBGRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// WHY: helper de aserciones comunes a los 3 puntos de entrada — todos
//      devuelven un array de Date del año pedido. Si rompemos cualquiera
//      de estas garantías, hay un bug en el núcleo de FuncionesComunes.
function expectArrayDeFechasDelAnyo(lista, year) {
  expect(Array.isArray(lista)).toBe(true);
  expect(lista.length).toBeGreaterThan(0);
  for (const fecha of lista) {
    expect(fecha).toBeInstanceOf(Date);
    expect(fecha.getFullYear()).toBe(year);
  }
}

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
        expectArrayDeFechasDelAnyo(lista, YEAR);
      });
    }
  }
});

describe('FechasInspectorNoche — getListaSubComunesInspectorNoche', () => {
  for (const grupo of GRUPOS) {
    for (const subgrupo of SUBGRUPOS) {
      it(`grupo ${grupo} subgrupo ${subgrupo}: array no vacío de Date del año ${YEAR}`, () => {
        const lista = getListaSubComunesInspectorNoche(YEAR, grupo, subgrupo);
        expectArrayDeFechasDelAnyo(lista, YEAR);
      });
    }
  }
});

// WHY: BUG-01 — antes del fix, grupo 4 J y grupo 5 J devolvían fechas de
//      2023/2031 en vez del año pedido (porque las fechas base estaban
//      malformadas y JS rebalanceaba). Si alguien revierte el fix por
//      accidente, este describe lo detecta inmediatamente porque el
//      assert `getFullYear() === 2026` falla. Los smoke tests de arriba
//      también lo detectarían, pero este describe lo destaca para que
//      sea evidente al leer el output qué bug protege.
describe('FechasInspectorNoche — BUG-01: subgrupos J grupo 4 y 5 (PENDIENTE validación oficial)', () => {
  it('grupo 4 J: la primera fecha del array está en el año pedido (no en 2023)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 4, 'J');
    expect(lista[0].getFullYear()).toBe(YEAR);
  });

  it('grupo 5 J: la primera fecha del array está en el año pedido (no en 2031)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 5, 'J');
    expect(lista[0].getFullYear()).toBe(YEAR);
  });

  // WHY: snapshot del array completo. Si cualquier fecha de los grupos J
  //      cambia tras una validación contra calendario oficial, este test
  //      falla y obliga a actualizar el snapshot conscientemente con
  //      `npm run test:run -- -u`. Documenta exactamente qué fechas
  //      generamos hoy con la hipótesis aplicada.
  it('grupo 4 J: snapshot completo (hipótesis -1 día respecto a Inspector)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 4, 'J');
    const fechasISO = lista.map(d => d.toISOString().slice(0, 10));
    expect(fechasISO).toMatchSnapshot();
  });

  it('grupo 5 J: snapshot completo (hipótesis -1 día respecto a Inspector)', () => {
    const lista = getListaSubgrupoInspectorNoche(YEAR, 5, 'J');
    const fechasISO = lista.map(d => d.toISOString().slice(0, 10));
    expect(fechasISO).toMatchSnapshot();
  });
});
