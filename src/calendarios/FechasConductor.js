

import {getLibresConductorInspector, getListaSubgrupoConductorInspector, getListaSubComunesConductorInspector} from './FechasConductorInspector.js';

export function getListaLibresConductor(year, grupo) {
    const fechaInitGrupo1_2020 = new Date(2020, 0, 1);
    const secuenciaLibres = [2, 3, 2, 3];
    const secuenciaTrabajo = [8, 6, 7, 8];
    const totalSecuencia = 35;
    
    return getLibresConductorInspector(year, grupo, fechaInitGrupo1_2020, totalSecuencia, secuenciaLibres, secuenciaTrabajo);
}


//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //

//se cambian los subgrupos a partir del año 2020
//se crea un array por cada grupo y cada posición del array corresponde a su letra a,b,c,d...
//se guarda en cada posición la fecha de inicio de su respectiva letra
const subgrupos = [
    [new Date(2020, 2, 4), new Date(2020, 1, 3), new Date(2020, 0, 9), new Date(2020, 1, 13), new Date(2020, 2, 19), new Date(2020, 1, 4), new Date(2020, 2, 10), new Date(2020, 0, 29)],
    [new Date(2020, 1, 26), new Date(2020, 0, 27), new Date(2020, 0, 2), new Date(2020, 1, 6), new Date(2020, 2, 12), new Date(2020, 0, 28), new Date(2020, 2, 3), new Date(2020, 0, 22)],
    [new Date(2020, 1, 19), new Date(2020, 2, 25), new Date(2020, 1, 24), new Date(2020, 0, 30), new Date(2020, 2, 5), new Date(2020, 0, 21), new Date(2020, 1, 25), new Date(2020, 0, 15)],
    [new Date(2020, 1, 12), new Date(2020, 0, 13), new Date(2020, 1, 17), new Date(2020, 2, 23), new Date(2020, 1, 27), new Date(2020, 0, 14), new Date(2020, 1, 18), new Date(2020, 2, 24)],
    [new Date(2020, 1, 5), new Date(2020, 2, 11), new Date(2020, 1, 10), new Date(2020, 2, 16), new Date(2020, 1, 20), new Date(2020, 2, 26), new Date(2020, 1, 11), new Date(2020, 2, 17)]];


export function getListaSubgrupoConductor(year, grupo, subgrupo) {
    let fechaInit = getFechaSubgrupo2020(grupo, subgrupo);
    let totalSecuencia = 280;
    //distancias entre dias, la secuencia de dias es jueves, lunes, miercoles y martes
    //el array sigue la misma secuencia
    let secu = [60, 65, 76, 79];
    let pos = getPosSecuencia(fechaInit);

    return getListaSubgrupoConductorInspector(year, fechaInit, totalSecuencia, secu, pos);
}


function getFechaSubgrupo2020(grupo, subgrupo) {
    let pos = getNumeroSubgrupo(subgrupo);
    if(grupo >= 1 && grupo <= 5){
        return subgrupos[grupo-1][pos];      
    }
    return subgrupos[grupo-1][0];
}

function getNumeroSubgrupo(subgrupo) {
    let pos;   
    switch(subgrupo){
        case "B": pos = 1; break;
        case "C": pos = 2; break;
        case "D": pos = 3; break;
        case "E": pos = 4; break;
        case "F": pos = 5; break;
        case "G": pos = 6; break;
        case "H": pos = 7; break;
        default: pos = 0; break;
     }
    return pos;
}

/**
     * distancias entre dias, la secuencia de dias es jueves=0, lunes=1, miercoles=2 y martes=3
     * @param fechaInit
     * @return 
     */
 function getPosSecuencia(fechaInit) {
    let pos = 0;
    let day = fechaInit.getDay();
    if(day == 1){
        pos = 1;
    } else if(day == 3){
        pos = 2;
    } else if(day == 2){
        pos = 3;
    }
    return pos;
}



//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //

 //sábados de subgrupos comunes a dos grupos A-C-E-G y B-D-F-H a partir del 2020
 //las posiciones en el array están en el mismo orden
    const subComunes = [
        [new Date(2020, 1, 29), new Date(2020, 0, 25)],
        [new Date(2020, 1, 22), new Date(2020, 0, 18)],
        [new Date(2020, 1, 15), new Date(2020, 0, 11)],
        [new Date(2020, 1, 8), new Date(2020, 0, 4)],
        [new Date(2020, 1, 1), new Date(2020, 2, 7)]];


    export function getListaSubComunesConductor(year, grupo, subgrupo) {
            let fechaInit = getFechaSubComunes2020(grupo, subgrupo);
            const totalSecuencia = 70;
            return getListaSubComunesConductorInspector(year, fechaInit, totalSecuencia);
        }


    function getFechaSubComunes2020(grupo, subgrupo) {
            let pos = 0;
            //A-C-E-G = 0   B-D-F-H=1
            if (subgrupo === "B" || subgrupo === "D" || subgrupo === "F" || subgrupo === "H") {
                pos = 1;
            }
            if (grupo >= 1 && grupo <= 5) {
                return subComunes[grupo - 1][pos];
            }
            return subComunes[grupo - 1][0];
        }

