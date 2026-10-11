// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import {
  initRotulos,
  initSelectGrupo,
  initSelectSubgrupo,
} from '../../src/calendarios/InitCabecera';
import { comprobarDia } from '../../src/calendarios/utils';

// replica de los rotulos de src/index.thml
function crearRotulos() {
  const div = document.createElement('div');
  div.innerHTML = `
    <h4 data-rol="libre" class="libres">Libre</h4>
    <h4 data-rol="subgrupo" class="subgrupo">Subgrupo</h4>
    <h4 data-rol="sub1" class="sub1">Grupo(A/C/E/G)</h4>
    <h4 data-rol="sub2" class="sub2">Grupo(B/D/F/H)</h4>
  `;
  return div;
}

describe('InitCabecera - initRotulos', () => {
  it('B1: al pasar de Parking DM 50% a Conductor el rotulo vuelve a "Subgrupo"', () => {
    // preparar
    const div = crearRotulos();

    // actuar: lo mismo que ahce el usuario al cambiar de categoria
    initRotulos('ParkingDSM_50', div);
    initRotulos('Conductor', div);

    //comprobar
    const subgrupo = div.querySelector('[data-rol="subgrupo"]');
    expect(subgrupo.textContent).toBe('Subgrupo');
  });
});

describe('InitCabecera - initSelectSubgrupo', () => {
  it('B2: tras Conductor, los dias de reduccion de Parking DM 100% son "sub2"', () => {
    // preparar: un select vacio y unos sets con un dia en subComunes
    const select = document.createElement('select');
    const sets = {
      libres: new Set([]),
      subgrupo: new Set([]),
      subComunes: new Set(['2026-1-7']),
    };

    // actuar: Conductor primero, Parking DM 100% despues
    initSelectSubgrupo('Conductor', select, '1');
    initSelectSubgrupo('ParkingDSM_100', select, '1');

    // comprobar: ese dia debe pintarse como 'sub2'
    expect(comprobarDia('7', 2, 2026, sets, select.value)).toBe('sub2');
  });
});
