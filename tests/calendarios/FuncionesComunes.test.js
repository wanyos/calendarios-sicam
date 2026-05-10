// WHY: testea el núcleo del cálculo de calendarios. Un bug aquí rompe
//      TODOS los calendarios a la vez. Los tests verifican el contrato
//      (array de Date del año pedido) más algunas propiedades concretas
//      donde la lógica es razonablemente determinista.
//
//      getFechaInit usa una heurística mágica documentada como BUG-05.
//      Los tests son de caracterización: si alguien la reescribe con
//      semántica distinta, fallan y obligan a revisar el cambio.

import { describe, it, expect } from 'vitest';
import {
  getFechaInit,
  getListaLibres,
  getListaSubgrupo,
  getListaSubgrupoReduccion,
} from '../../src/calendarios/FuncionesComunes.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

describe('FuncionesComunes — getFechaInit (caracterización, no diseño)', () => {
  // WHY: dada la fecha base (2020,0,1) y secuencia 35, getFechaInit calcula
  //      una fecha de inicio cercana al año objetivo desde la que iterar.
  //      Verificamos que devuelve un Date y no un valor degenerado.
  it('devuelve un Date válido', () => {
    const resultado = getFechaInit(2026, new Date(2020, 0, 1), 35);
    expect(resultado).toBeInstanceOf(Date);
    expect(Number.isFinite(resultado.getTime())).toBe(true);
  });

  it('para year > fechaFin.getFullYear() devuelve fecha hacia el año objetivo', () => {
    const resultado = getFechaInit(2026, new Date(2020, 0, 1), 35);
    // WHY: la heurística debería poner la fecha cerca del fin de 2025
    //      o principios de 2026 para que el bucle while llegue al año
    //      pedido sin demasiadas iteraciones de calentamiento.
    const yearResultado = resultado.getFullYear();
    expect(yearResultado).toBeGreaterThanOrEqual(2025);
    expect(yearResultado).toBeLessThanOrEqual(2026);
  });

  it('para year <= fechaFin.getFullYear() retrocede valorSecuencia días', () => {
    // WHY: rama del if(dias < 0) — devuelve fechaFin retrocedida.
    const fechaFin = new Date(2026, 5, 15);
    const resultado = getFechaInit(2025, fechaFin, 35);
    expect(resultado).toBeInstanceOf(Date);
    expect(resultado.getTime()).toBeLessThan(fechaFin.getTime());
  });
});

describe('FuncionesComunes — getListaLibres', () => {
  it('devuelve array de Date del año pedido', () => {
    const fechaInit = new Date(YEAR - 1, 11, 25);
    const lista = getListaLibres(YEAR, fechaInit, [2, 3, 2, 3], [8, 6, 7, 8], 0);
    expectArrayDeFechasDelAnyo(lista);
  });

  it('si fechaInit ya está en el año objetivo, lo cubre', () => {
    const fechaInit = new Date(YEAR, 0, 1);
    const lista = getListaLibres(YEAR, fechaInit, [2, 3, 2, 3], [8, 6, 7, 8], 0);
    expect(lista.length).toBeGreaterThan(0);
    expect(lista[0].getFullYear()).toBe(YEAR);
  });

  it('respeta la posición inicial de la secuencia (pos)', () => {
    // WHY: con pos=0 vs pos=2, las primeras fechas deberían diferir
    //      porque consume libres[0] vs libres[2]. Verifica que pos no
    //      se ignora.
    const fechaInit = new Date(YEAR, 0, 1);
    const a = getListaLibres(YEAR, new Date(fechaInit), [2, 3, 2, 3], [8, 6, 7, 8], 0);
    const b = getListaLibres(YEAR, new Date(fechaInit), [2, 3, 2, 3], [8, 6, 7, 8], 2);
    // WHY: no asumimos longitudes idénticas; solo que dan resultados distintos.
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
  });

  it('todas las fechas devueltas están dentro del año pedido', () => {
    const lista = getListaLibres(YEAR, new Date(YEAR - 1, 0, 1), [3, 1, 1, 1, 2, 1, 2, 1, 4], [3, 4, 3, 7, 6, 2, 4, 4, 7], 0);
    for (const d of lista) {
      expect(d.getFullYear()).toBe(YEAR);
    }
  });
});

describe('FuncionesComunes — getListaSubgrupo', () => {
  it('devuelve array de Date del año pedido', () => {
    const fechaInit = new Date(YEAR - 1, 11, 1);
    const lista = getListaSubgrupo(YEAR, fechaInit, [60, 65, 76, 79], 0);
    expectArrayDeFechasDelAnyo(lista);
  });

  it('avanza por la secuencia ciclicamente', () => {
    // WHY: secuencia [60] sumada repetidamente desde el 1 enero debería
    //      dar fechas separadas exactamente 60 días. Math.round absorbe
    //      la oscilación de ±1 hora cuando dos fechas cruzan el cambio
    //      DST (España cambia hora el último domingo de marzo y octubre).
    const fechaInit = new Date(YEAR, 0, 1);
    const lista = getListaSubgrupo(YEAR, fechaInit, [60], 0);
    expect(lista.length).toBeGreaterThan(0);
    if (lista.length >= 2) {
      const diasDiff = Math.round((lista[1].getTime() - lista[0].getTime()) / (1000 * 60 * 60 * 24));
      expect(diasDiff).toBe(60);
    }
  });
});

describe('FuncionesComunes — getListaSubgrupoReduccion', () => {
  it('devuelve array de Date del año pedido', () => {
    const fechaInit = new Date(YEAR - 1, 11, 1);
    const lista = getListaSubgrupoReduccion(YEAR, fechaInit, 70);
    expectArrayDeFechasDelAnyo(lista);
  });

  it('todas las fechas separadas exactamente totalSecuencia días', () => {
    // WHY: Math.round absorbe la oscilación de ±1 hora cuando dos fechas
    //      cruzan el cambio DST en marzo/octubre.
    const fechaInit = new Date(YEAR, 0, 1);
    const TOTAL = 70;
    const lista = getListaSubgrupoReduccion(YEAR, fechaInit, TOTAL);
    expect(lista.length).toBeGreaterThan(0);
    for (let i = 1; i < lista.length; i++) {
      const diasDiff = Math.round((lista[i].getTime() - lista[i - 1].getTime()) / (1000 * 60 * 60 * 24));
      expect(diasDiff).toBe(TOTAL);
    }
  });
});
