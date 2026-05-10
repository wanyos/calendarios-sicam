

export const getFechaInit = (year, fechaFin, valorSecuencia) => {
    const mes = 12 - (parseInt(valorSecuencia) / 30);
    const fechaInit = new Date((year - 1), mes, 1);
    let dias = (fechaInit.getTime() - fechaFin.getTime());
    if (dias < 0) {
        return new Date(fechaFin.getFullYear(), fechaFin.getMonth(), (fechaFin.getDate() - valorSecuencia));
    }
    dias /= (1000 * 60 * 60 * 24);
    const re = parseFloat(dias / valorSecuencia);
    const p_dec = parseFloat(re % 1);
    const t_dias = parseFloat((valorSecuencia * 0.01) * (1 - p_dec) * 100);
    fechaInit.setDate(fechaInit.getDate() + Math.round(t_dias));
    return fechaInit;
}


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




