
import {getFechaInit, getListaLibres, getListaSubgrupo, getListaSubgrupoReduccion} from './FuncionesComunes.js';

export function getListaLibresBuho(year, grupo){
    let fechaInitGrupo1_2022 = new Date(2022,0,4);
    const totalSecuencia = 35;
    const secuenciaLibres = [2,3,2,3];
    const secuenciaTrabajo = [8,6,7,8];
    let pos = 0;
    fechaInitGrupo1_2022 = new Date(getFechaInit(year, fechaInitGrupo1_2022, totalSecuencia));
    if(grupo > 1){
        fechaInitGrupo1_2022 = new Date(getFechaInicioGrupo(fechaInitGrupo1_2022, grupo));
        pos = getPos(grupo);
    }
    return getListaLibres(year, fechaInitGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
}

function getFechaInicioGrupo(fecha, grupo){
    switch(grupo){
        case 2: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 2); break;
        case 3: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 3); break;
        case 4: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 4); break;
        case 5: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
    }
    return fecha;
}

function getPos(grupo){
    if(grupo > 1 && grupo < 5){
        return grupo-1;
    }
    return 0;
}

//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //

const subgrupos = [
    [new Date(2022,1,16), new Date(2022,0,3), new Date(2022,1,7), new Date(2022,2,14), new Date(2022,1,1), new Date(2022,0,2), new Date(2022,1,6), new Date(2022,0,12)],
    [new Date(2022,1,9), new Date(2022,2,16), new Date(2022,0,31), new Date(2022,2,7), new Date(2022,0,25), new Date(2022,2,1), new Date(2022,0,30), new Date(2022,0,5)],
    [new Date(2022,1,2), new Date(2022,2,9), new Date(2022,0,24), new Date(2022,1,28), new Date(2022,0,18), new Date(2022,1,22), new Date(2022,0,23), new Date(2022,1,27)],
    [new Date(2022,0,26), new Date(2022,2,2), new Date(2022,0,17), new Date(2022,1,21), new Date(2022,0,11), new Date(2022,1,15), new Date(2022,0,16), new Date(2022,1,20)],
    [new Date(2022,0,19), new Date(2022,1,23), new Date(2022,0,10), new Date(2022,1,14), new Date(2022,0,4), new Date(2022,1,8), new Date(2022,0,9), new Date(2022,1,13)]
];

export function getListaSubgrupoBuho(year, grupo, subgrupo){
    const secuencia = [60,65,76,79];
    const totalSec = 280;
    let fechaInit = getFechaSubgrupo2022(grupo, subgrupo);
    if (year > 2022) {
        fechaInit = new Date(getFechaInit(year, fechaInit, totalSec));
    }
    let posSecuencia = getPosSecuencia(fechaInit);
    return getListaSubgrupo(year, fechaInit, secuencia, posSecuencia);
}

function getFechaSubgrupo2022(grupo, subgrupo) {
    const posLetra = getPosSubgrupo(subgrupo);
    if (grupo >= 1 && grupo <= 5) {
        return subgrupos[grupo - 1][posLetra];
    }
    return subgrupos[grupo - 1][0];
}


function getPosSubgrupo(subgrupo) {
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

//miercoles = 0, domingo = 1, martes = 2, lunes =1
function getPosSecuencia(fechaInit) {
    let pos = 0;
    let day = fechaInit.getDay();
    if(day == 0){
        pos = 1;
    } else if(day == 2){
        pos = 2;
    } else if(day == 1){
        pos = 3;
    }
    return pos;
}
    
    

//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //

 //sábados de subgrupos comunes a dos grupos A-C-E-G y B-D-F-H a partir del 2020
 //las posiciones en el array están en el mismo orden
 const subComunes = [
    [new Date(2022, 0, 28), new Date(2022, 2, 4)],
    [new Date(2022, 0, 21), new Date(2022, 1, 25)],
    [new Date(2022, 0, 14), new Date(2022, 1, 18)],
    [new Date(2022, 0, 7), new Date(2022, 1, 11)],
    [new Date(2022, 2, 11), new Date(2022, 1, 4)]];


    export function getListaSubComunesBuho(year, grupo, subgrupo) {
        let fechaInit = getFechaSubComunes2020(grupo, subgrupo);
        const totalSecuencia = 70;
        return getListaSubgrupoReduccion(year, fechaInit, totalSecuencia);
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