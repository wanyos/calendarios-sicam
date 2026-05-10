// WHY: testea el dispatcher central. Un bug aquí significa que el tipo
//      de calendario seleccionado en la UI no se enruta a la función
//      correcta — el calendario pintado sería el equivocado.
//
//      Cubrimos dos contratos:
//        1. tipos VÁLIDOS → array no vacío de Date del año pedido
//        2. tipos NO MANEJADOS por una función concreta → undefined
//           (importante porque setDatos en index.js usa ?? [] para
//           blindarse contra esto)

import { describe, it, expect } from 'vitest';
import {
  getDatosListaLibres,
  getDatosListaSubgrupo,
  getDatosListaSubComunes,
} from '../../src/calendarios/DatosFechas.js';
import { YEAR, expectArrayDeFechasDelAnyo } from '../helpers.js';

const TODOS = [
  'Conductor', 'Inspector', 'Inspector_Noche',
  'Grua', 'GruaDSM', 'GruaDSM_Noche',
  'ParkingDSM_100', 'ParkingDSM_50',
  'Refuerzo_Nocturno', 'Buho',
];

// WHY: un input "razonable" por tipo — el grupo más común y un subgrupo
//      válido. No buscamos cubrir todas las combinaciones (eso lo hacen
//      ya las suites por archivo); aquí solo verificamos el dispatch.
const INPUT_POR_TIPO = {
  Conductor:         { grupo: 1, subgrupo: 'A',  grupoDos: undefined },
  Inspector:         { grupo: 1, subgrupo: 'A',  grupoDos: undefined },
  Inspector_Noche:   { grupo: 1, subgrupo: 'A',  grupoDos: undefined },
  Grua:              { grupo: 1, subgrupo: 'A',  grupoDos: undefined },
  GruaDSM:           { grupo: 1, subgrupo: undefined, grupoDos: undefined }, // su Subgrupo recibe número
  GruaDSM_Noche:     { grupo: 1, subgrupo: undefined, grupoDos: undefined },
  ParkingDSM_100:    { grupo: 1, subgrupo: undefined, grupoDos: undefined },
  ParkingDSM_50:     { grupo: 1, subgrupo: undefined, grupoDos: undefined },
  Refuerzo_Nocturno: { grupo: 'A', subgrupo: undefined, grupoDos: '1' },
  Buho:              { grupo: 1, subgrupo: 'A',  grupoDos: undefined },
};

describe('DatosFechas — getDatosListaLibres', () => {
  for (const tipo of TODOS) {
    it(`tipo ${tipo}: array no vacío de Date del año ${YEAR}`, () => {
      const { grupo, grupoDos } = INPUT_POR_TIPO[tipo];
      const lista = getDatosListaLibres(tipo, YEAR, grupo, grupoDos);
      expectArrayDeFechasDelAnyo(lista);
    });
  }

  it('tipo desconocido → undefined (no crash)', () => {
    expect(getDatosListaLibres('TipoInexistente', YEAR, 1, undefined)).toBeUndefined();
  });
});

describe('DatosFechas — getDatosListaSubgrupo', () => {
  // WHY: tipos que SÍ tienen función de subgrupo (excluye GruaDSM_Noche,
  //      ParkingDSM_100 y Refuerzo_Nocturno — esos solo en SubComunes
  //      o no tienen). GruaDSM espera un NÚMERO 1-50 como subgrupo.
  const conSubgrupo = {
    Conductor:       { grupo: 1, subgrupo: 'A' },
    Inspector:       { grupo: 1, subgrupo: 'A' },
    Inspector_Noche: { grupo: 1, subgrupo: 'A' },
    Grua:            { grupo: 1, subgrupo: 'A' },
    GruaDSM:         { grupo: 1, subgrupo: 5 },
    ParkingDSM_50:   { grupo: 1, subgrupo: undefined },
    Buho:            { grupo: 1, subgrupo: 'A' },
  };

  for (const [tipo, { grupo, subgrupo }] of Object.entries(conSubgrupo)) {
    it(`tipo ${tipo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getDatosListaSubgrupo(tipo, YEAR, grupo, subgrupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }

  it('tipos sin Subgrupo → undefined', () => {
    expect(getDatosListaSubgrupo('GruaDSM_Noche', YEAR, 1, undefined)).toBeUndefined();
    expect(getDatosListaSubgrupo('ParkingDSM_100', YEAR, 1, undefined)).toBeUndefined();
    expect(getDatosListaSubgrupo('Refuerzo_Nocturno', YEAR, 'A', undefined)).toBeUndefined();
  });

  it('tipo desconocido → undefined', () => {
    expect(getDatosListaSubgrupo('TipoInexistente', YEAR, 1, 'A')).toBeUndefined();
  });
});

describe('DatosFechas — getDatosListaSubComunes', () => {
  // WHY: tipos que tienen función de SubComunes. Grua, GruaDSM, GruaDSM_Noche
  //      y Refuerzo_Nocturno NO la tienen — devuelven undefined.
  const conSubComunes = {
    Conductor:       { grupo: 1, subgrupo: 'A' },
    Inspector:       { grupo: 1, subgrupo: 'A' },
    Inspector_Noche: { grupo: 1, subgrupo: 'A' },
    ParkingDSM_100:  { grupo: 1, subgrupo: undefined },
    ParkingDSM_50:   { grupo: 1, subgrupo: undefined },
    Buho:            { grupo: 1, subgrupo: 'A' },
  };

  for (const [tipo, { grupo, subgrupo }] of Object.entries(conSubComunes)) {
    it(`tipo ${tipo}: array no vacío de Date del año ${YEAR}`, () => {
      const lista = getDatosListaSubComunes(tipo, YEAR, grupo, subgrupo);
      expectArrayDeFechasDelAnyo(lista);
    });
  }

  it('tipos sin SubComunes → undefined', () => {
    expect(getDatosListaSubComunes('Grua', YEAR, 1, 'A')).toBeUndefined();
    expect(getDatosListaSubComunes('GruaDSM', YEAR, 1, 5)).toBeUndefined();
    expect(getDatosListaSubComunes('GruaDSM_Noche', YEAR, 1, undefined)).toBeUndefined();
    expect(getDatosListaSubComunes('Refuerzo_Nocturno', YEAR, 'A', undefined)).toBeUndefined();
  });

  it('tipo desconocido → undefined', () => {
    expect(getDatosListaSubComunes('TipoInexistente', YEAR, 1, 'A')).toBeUndefined();
  });
});
