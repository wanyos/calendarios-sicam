// WHY: testea las funciones puras extraídas de index.js. Antes vivían
//      acopladas a globales y no se podían testear. Ahora son pure
//      functions con I/O explícito — testeo trivial y exhaustivo.

import { describe, it, expect } from 'vitest';
import {
  claveDia,
  claveFecha,
  isLeap,
  getTotalDays,
  startDay,
  getNombre,
  getArrayMes,
  comprobarDia,
} from '../../src/calendarios/utils.js';

describe('utils — claveDia / claveFecha', () => {
  it('claveDia formatea año-mes-día sin padding', () => {
    expect(claveDia(2026, 0, 1)).toBe('2026-0-1');
    expect(claveDia(2026, 11, 31)).toBe('2026-11-31');
  });

  it('claveFecha extrae año/mes/día de un Date y delega en claveDia', () => {
    const d = new Date(2026, 5, 15);
    expect(claveFecha(d)).toBe('2026-5-15');
  });

  it('claveFecha y claveDia(...args extraídos) son equivalentes', () => {
    const d = new Date(2026, 1, 21);
    expect(claveFecha(d)).toBe(claveDia(d.getFullYear(), d.getMonth(), d.getDate()));
  });
});

describe('utils — isLeap (regla gregoriana)', () => {
  it('divisible por 4 pero no por 100 → bisiesto', () => {
    expect(isLeap(2024)).toBe(true);
    expect(isLeap(2028)).toBe(true);
  });

  it('divisible por 100 pero no por 400 → NO bisiesto (excepción gregoriana)', () => {
    expect(isLeap(1900)).toBe(false);
    expect(isLeap(2100)).toBe(false);
  });

  it('divisible por 400 → bisiesto (excepción de la excepción)', () => {
    expect(isLeap(2000)).toBe(true);
    expect(isLeap(2400)).toBe(true);
  });

  it('no divisible por 4 → NO bisiesto', () => {
    expect(isLeap(2025)).toBe(false);
    expect(isLeap(2026)).toBe(false);
  });
});

describe('utils — getTotalDays', () => {
  it('meses de 31 días', () => {
    for (const m of [1, 3, 5, 7, 8, 10, 12]) {
      expect(getTotalDays(m, 2026)).toBe(31);
    }
  });

  it('meses de 30 días', () => {
    for (const m of [4, 6, 9, 11]) {
      expect(getTotalDays(m, 2026)).toBe(30);
    }
  });

  it('febrero en año NO bisiesto = 28', () => {
    expect(getTotalDays(2, 2025)).toBe(28);
    expect(getTotalDays(2, 2026)).toBe(28);
  });

  it('febrero en año bisiesto = 29', () => {
    expect(getTotalDays(2, 2024)).toBe(29);
    expect(getTotalDays(2, 2000)).toBe(29);
  });
});

describe('utils — startDay (lunes=0..domingo=6)', () => {
  // WHY: convención propia del proyecto, no la nativa de JS (domingo=0).
  //      Verificamos contra fechas conocidas.
  it('1 enero 2024 fue lunes → 0', () => {
    expect(startDay(1, 2024)).toBe(0);
  });

  it('1 enero 2026 fue jueves → 3', () => {
    expect(startDay(1, 2026)).toBe(3);
  });

  it('1 febrero 2026 fue domingo → 6 (caso límite del wrap)', () => {
    expect(startDay(2, 2026)).toBe(6);
  });
});

describe('utils — getNombre', () => {
  it('mapea 1..12 a nombres en español', () => {
    const esperados = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    esperados.forEach((nombre, i) => {
      expect(getNombre(i + 1)).toBe(nombre);
    });
  });

  it('valor fuera de rango → string vacío', () => {
    expect(getNombre(0)).toBe('');
    expect(getNombre(13)).toBe('');
    expect(getNombre(-1)).toBe('');
  });
});

describe('utils — getArrayMes', () => {
  // WHY: rellenarDias llama con `espacios = startDay - 1`. La condición
  //      interna `contador <= espacios` produce `espacios + 1` huecos —
  //      es decir, exactamente `startDay` huecos. Por eso pasar -1
  //      significa "no quiero huecos" (primer día del mes es lunes).
  it('siempre devuelve 42 celdas (6 semanas × 7 días)', () => {
    expect(getArrayMes(-1, 31).length).toBe(42);
    expect(getArrayMes(5, 28).length).toBe(42);
  });

  it('espacios=-1 → 0 huecos iniciales, día 1 en arr[0]', () => {
    const arr = getArrayMes(-1, 31);
    expect(arr[0]).toBe('1');
    expect(arr[30]).toBe('31');
  });

  it('espacios=2 → 3 huecos iniciales (espacios + 1), día 1 en arr[3]', () => {
    const arr = getArrayMes(2, 31);
    expect(arr[0]).toBe('.');
    expect(arr[1]).toBe('.');
    expect(arr[2]).toBe('.');
    expect(arr[3]).toBe('1');
  });

  it('los días son strings consecutivos desde "1"', () => {
    const arr = getArrayMes(-1, 31);
    expect(arr[0]).toBe('1');
    expect(arr[1]).toBe('2');
    expect(arr[30]).toBe('31');
  });

  it('rellena los huecos finales con "."', () => {
    const arr = getArrayMes(-1, 30);
    expect(arr[29]).toBe('30');
    expect(arr[30]).toBe('.');
    expect(arr[41]).toBe('.');
  });
});

describe('utils — comprobarDia', () => {
  function crearSets(libresFechas = [], subgrupoFechas = [], subComunesFechas = []) {
    return {
      libres: new Set(libresFechas),
      subgrupo: new Set(subgrupoFechas),
      subComunes: new Set(subComunesFechas),
    };
  }

  it('devuelve undefined si numDia es "." (hueco)', () => {
    const sets = crearSets();
    expect(comprobarDia('.', 1, 2026, sets, 'A')).toBeUndefined();
  });

  it('devuelve undefined si numDia <= 0', () => {
    const sets = crearSets();
    expect(comprobarDia('0', 1, 2026, sets, 'A')).toBeUndefined();
    expect(comprobarDia('-3', 1, 2026, sets, 'A')).toBeUndefined();
  });

  it('devuelve undefined si la fecha no está en ningún Set', () => {
    const sets = crearSets(['2026-0-15']);
    expect(comprobarDia('20', 1, 2026, sets, 'A')).toBeUndefined();
  });

  it('devuelve "libres" si la fecha está en el Set de libres', () => {
    const sets = crearSets(['2026-0-15']);
    expect(comprobarDia('15', 1, 2026, sets, 'A')).toBe('libres');
  });

  it('devuelve "subgrupo" si la fecha está solo en subgrupo', () => {
    const sets = crearSets([], ['2026-2-10']);
    expect(comprobarDia('10', 3, 2026, sets, 'A')).toBe('subgrupo');
  });

  it('devuelve "sub1" para subComunes con subgrupo en ACEGI', () => {
    const sets = crearSets([], [], ['2026-1-7']);
    for (const sub of ['A', 'C', 'E', 'G', 'I']) {
      expect(comprobarDia('7', 2, 2026, sets, sub)).toBe('sub1');
    }
  });

  it('devuelve "sub2" para subComunes con subgrupo NO en ACEGI', () => {
    const sets = crearSets([], [], ['2026-1-7']);
    for (const sub of ['B', 'D', 'F', 'H', 'J']) {
      expect(comprobarDia('7', 2, 2026, sets, sub)).toBe('sub2');
    }
  });

  // WHY: la prioridad libres > subgrupo > subComunes está documentada en
  //      utils.js como contrato. Si una fecha cae en varios sets, gana el
  //      primero. Caso patológico que no debería ocurrir, pero conviene
  //      blindarlo por test para que un refactor accidental no lo cambie.
  it('orden de prioridad libres > subgrupo > subComunes', () => {
    const fecha = '2026-5-1';
    const ambos = crearSets([fecha], [fecha], [fecha]);
    expect(comprobarDia('1', 6, 2026, ambos, 'A')).toBe('libres');

    const subYsubComunes = crearSets([], [fecha], [fecha]);
    expect(comprobarDia('1', 6, 2026, subYsubComunes, 'A')).toBe('subgrupo');
  });
});
