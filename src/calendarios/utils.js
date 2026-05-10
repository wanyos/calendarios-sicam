// WHY: módulo de funciones puras extraídas de index.js. Antes vivían
//      acopladas a globales (currentDate, sets de listas, select_subgrupo)
//      y no se podían testear de forma aislada. Aquí reciben todo lo que
//      necesitan como parámetros — testeables y reutilizables.

// WHY: clave canónica "YYYY-M-D" (mes 0-indexed, día 1-31). Misma forma
//      en construcción y en lookup, así no podemos comparar fechas de
//      meses distintos por confusión 0-vs-1-indexed.
export const claveDia = (anyo, mes, dia) => `${anyo}-${mes}-${dia}`;
export const claveFecha = (d) => claveDia(d.getFullYear(), d.getMonth(), d.getDate());


// WHY: año bisiesto según regla gregoriana — divisible por 4 PERO no por
//      100, salvo si es divisible por 400.
export function isLeap(year) {
  return (year % 100 !== 0 && year % 4 === 0) || year % 400 === 0;
}


// WHY: total de días por mes 1-12. Recibe year explícito para resolver
//      febrero en bisiestos sin depender de un global.
export function getTotalDays(month, year) {
  if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
    return 31;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) {
    return 30;
  }
  return isLeap(year) ? 29 : 28;
}


// WHY: día de la semana en el que arranca el mes, en convención
//      lunes=0..domingo=6 (no la nativa de JS, que es domingo=0).
//      Necesario para alinear el primer día del mes en la grid 7x6.
export function startDay(month, year) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}


// WHY: nombre del mes en español. Hardcodeado en lugar de usar Intl
//      porque queremos control sobre las mayúsculas y la salida es fija.
export function getNombre(n) {
  switch (n) {
    case 1: return 'Enero';
    case 2: return 'Febrero';
    case 3: return 'Marzo';
    case 4: return 'Abril';
    case 5: return 'Mayo';
    case 6: return 'Junio';
    case 7: return 'Julio';
    case 8: return 'Agosto';
    case 9: return 'Septiembre';
    case 10: return 'Octubre';
    case 11: return 'Noviembre';
    case 12: return 'Diciembre';
    default: return '';
  }
}


// WHY: array de 42 celdas (6 semanas × 7 días) con los huecos al inicio
//      antes del día 1 (espacios) y al final tras el último día. Los
//      huecos se representan con ".". Los días son strings para
//      comparación uniforme con comprobarDia.
export function getArrayMes(espacios, totalDias) {
  const arrayMes = [];
  let contador = 0;
  let numDia = 1;

  for (let a = 0; a < 42; a++) {
    if (contador <= espacios || numDia > totalDias) {
      arrayMes.push('.');
      contador++;
    } else {
      arrayMes.push(String(numDia));
      numDia++;
    }
  }
  return arrayMes;
}


// WHY: numDia llega como string ("1", "2", ..., o "." para huecos del mes).
//      parseInt + Number.isFinite filtra los huecos sin depender de coerción
//      implícita ("." > 0 daba false antes pero era frágil).
//
//      sets es { libres, subgrupo, subComunes } — pasamos el contenedor
//      en lugar de los 3 sets sueltos para mantener la firma manejable.
//
//      Orden de prioridad libres > subgrupo > subComunes — preserva el
//      comportamiento original cuando una fecha cae en más de una lista.
export function comprobarDia(numDia, mes, anyo, sets, subgrupoActual) {
  const dia = parseInt(numDia);
  if (!Number.isFinite(dia) || dia <= 0) return;

  const clave = claveDia(anyo, mes - 1, dia);

  if (sets.libres.has(clave)) return 'libres';
  if (sets.subgrupo.has(clave)) return 'subgrupo';
  if (sets.subComunes.has(clave)) {
    return 'ACEGI'.includes(subgrupoActual) ? 'sub1' : 'sub2';
  }
}
