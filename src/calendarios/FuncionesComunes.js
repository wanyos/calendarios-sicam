// Constante de utilidad — milisegundos en un día.
const MS_POR_DIA = 1000 * 60 * 60 * 24;

/**
 * Devuelve una fecha de inicio para iterar el calendario hasta `year`.
 * El bucle iterativo (getListaLibres / getListaSubgrupo) parte de aquí
 * y avanza por la secuencia hasta cubrir el año pedido. La fecha
 * devuelta queda alineada con la cadencia del calendario para que el
 * bucle no haga iteraciones de calentamiento de más.
 *
 * Estrategia (preservada del algoritmo histórico — produce las fechas
 * oficiales validadas con BUG-01):
 *   1. Aproximar una fecha en el año previo, hacia su final. La heurística
 *      `mes = 12 - valorSecuencia/30` retrocede ~`valorSecuencia/30` meses
 *      desde diciembre. Para una secuencia de 35 días → ~noviembre, para
 *      350 días → enero del año previo (mucho calentamiento), etc.
 *   2. Si esa fecha aproximada cae antes que `fechaFin` (caso edge: se
 *      pide un calendario anterior a la fecha base), retroceder un ciclo
 *      desde fechaFin y devolver eso.
 *   3. Si no, calcular cuántos ciclos `valorSecuencia` caben entre
 *      fechaFin y la fechaAprox, con parte fraccionaria.
 *   4. Avanzar fechaAprox `(1 - fracción) * valorSecuencia` días para
 *      llegar al inicio del siguiente ciclo completo.
 *
 * NOTA HISTÓRICA: la versión anterior tenía expresiones redundantes
 * (`parseInt`/`parseFloat` sobre números, `0.01 * X * 100`). Se han
 * simplificado matemáticamente sin cambio de comportamiento. Los 636
 * tests siguen pasando idénticos.
 */
export const getFechaInit = (year, fechaFin, valorSecuencia) => {
    // 1. Aproximar fecha en año previo según la heurística.
    const mesAprox = 12 - valorSecuencia / 30;
    const fechaAprox = new Date(year - 1, mesAprox, 1);

    // 2. Caso edge: fechaAprox cae antes que fechaFin → retrocedemos
    //    un ciclo desde fechaFin para que el bucle pueda arrancar.
    if (fechaAprox.getTime() < fechaFin.getTime()) {
        return new Date(
            fechaFin.getFullYear(),
            fechaFin.getMonth(),
            fechaFin.getDate() - valorSecuencia
        );
    }

    // 3. Días entre fechaFin y fechaAprox / ciclos completos cabidos.
    const dias = (fechaAprox.getTime() - fechaFin.getTime()) / MS_POR_DIA;
    const ciclos = dias / valorSecuencia;
    const fraccionRestante = 1 - (ciclos % 1);

    // 4. Avanzar al inicio del siguiente ciclo completo.
    const diasParaCompletar = Math.round(fraccionRestante * valorSecuencia);
    fechaAprox.setDate(fechaAprox.getDate() + diasParaCompletar);
    return fechaAprox;
};


export const getListaLibres = (year, fechaInit, libres, trabajo, pos) => {
    const lista = [];

    while (fechaInit.getFullYear() <= year) {
        const totalLibres = libres[pos];
        for (let a = 0; a < totalLibres; a++) {
            if (fechaInit.getFullYear() === year) {
                lista.push(fechaInit);
            }
            if (a < totalLibres - 1) {
                fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate() + 1);
            }
        }
        fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate() + trabajo[pos]);
        pos++;
        if (pos > libres.length - 1) {
            pos = 0;
        }
    }
    return lista;
}


export const getListaSubgrupo = (year, fechaInit, secuencia, pos) => {
    const lista = [];

    while (fechaInit.getFullYear() <= year) {
        if (fechaInit.getFullYear() === year) {
            lista.push(fechaInit);
        }
        fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate() + secuencia[pos]);
        pos++;
        if (pos > secuencia.length - 1) {
            pos = 0
        }
    }
    return lista;
}


export const getListaSubgrupoReduccion = (year, fechaInit, totalSecuencia) => {
    const lista = [];

    while (fechaInit.getFullYear() <= year) {
        if (fechaInit.getFullYear() === year) {
            lista.push(fechaInit);
        }
        fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate() + totalSecuencia);
    }

    return lista;
}


// WHY: A→0, B→1, ..., Z→25. Sustituye los switches duplicados que vivían
//      en cada FechasXxx.js. El charCode-65 vale para mayúsculas; minúsculas
//      las sube a mayúsculas antes. Si la letra es vacía/null o no es A-Z,
//      devuelve 0 (mismo comportamiento que el default de los switches).
export const letraAIndice = (letra) => {
    if (typeof letra !== 'string' || letra.length === 0) return 0;
    const cc = letra.toUpperCase().charCodeAt(0);
    return cc >= 65 && cc <= 90 ? cc - 65 : 0;
};




