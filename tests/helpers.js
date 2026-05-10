// WHY: helper compartido por todas las suites de tests de calendarios.
//      Las 9 suites comprueban el mismo contrato de salida (array no vacío
//      de Date del año pedido), así que extraerlo evita repetir 9 veces
//      el mismo bloque de aserciones. Si mañana añadimos una garantía
//      (ej. fechas ordenadas crecientemente, sin duplicados) la añadimos
//      aquí y todos los tests heredan la nueva validación.

import { expect } from 'vitest';

export const YEAR = 2026;

export function expectArrayDeFechasDelAnyo(lista, year = YEAR) {
  expect(Array.isArray(lista)).toBe(true);
  expect(lista.length).toBeGreaterThan(0);
  for (const fecha of lista) {
    expect(fecha).toBeInstanceOf(Date);
    expect(fecha.getFullYear()).toBe(year);
  }
}
