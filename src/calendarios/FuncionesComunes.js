

export const getFechaInit = (year, fechaFin, valorSecuencia) => {
    let mes = 12 - (parseInt(valorSecuencia) / 30);
    let fechaInit = new Date((year - 1), mes, 1);
    let dias = (fechaInit.getTime() - fechaFin.getTime());
    if (dias < 0) {
        return new Date(fechaFin.getFullYear(), fechaFin.getMonth(), (fechaFin.getDate() - valorSecuencia));
    }
    dias /= (1000 * 60 * 60 * 24);
    let re = parseFloat(dias / valorSecuencia);
    let p_dec = parseFloat(re % 1);
    let t_dias = parseFloat((valorSecuencia * 0.01) * (1 - p_dec) * 100);
    fechaInit.setDate(fechaInit.getDate() + Math.round(t_dias));
    return fechaInit;
}


export const getListaLibres = (year, fechaInit, libres, trabajo, pos) => {
    let lista = [];

    while (fechaInit.getFullYear() <= year) {
        let totalLibres = libres[pos];
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
    let lista = [];

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
    let lista = [];

    while (fechaInit.getFullYear() <= year) {
        if (fechaInit.getFullYear() === year) {
            lista.push(fechaInit);
        }
        fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate() + totalSecuencia);
    }

    return lista;
}




//module.exports.getFechaInit = getFechaInit;
//module.exports.getListaLibres = getListaLibres;
//module.exports.getListaSubgrupo = getListaSubgrupo;
//module.exports.getListaSubgrupoReduccion = getListaSubgrupoReduccion;