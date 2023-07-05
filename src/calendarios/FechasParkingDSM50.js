
import {getFechaInit, getListaLibres, getListaSubgrupoReduccion} from './FuncionesComunes.js';
//const FuncionesComunes = require('../FuncionesComunes');

export function getListaLibresParkingDSM50(year, grupo){
    let fechaInitGrupo1_2022 = new Date(2022,0,20);
    const totalSecuencia = 42;
    const secuenciaLibres = [4,3];
    const secuenciaTrabajo = [15,22];
    let pos = 0;
    fechaInitGrupo1_2022 = new Date(getFechaInit(year, fechaInitGrupo1_2022, totalSecuencia));
    if(grupo > 1){
        fechaInitGrupo1_2022 = new Date(getFechaInicioGrupo(fechaInitGrupo1_2022, grupo));
        pos = getPos(grupo);
    }
    //return FuncionesComunes.getListaLibres(year, fechaInitGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
    return getListaLibres(year, fechaInitGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
}


function getFechaInicioGrupo(fecha, grupo){
    switch(grupo){
        case 2: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 11); break;
        case 3: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 4); break;
        case 4: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 21); break;
        case 5: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 14); break;
        case 6: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
        case 7: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 0); break;
        case 8: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 11); break;
        case 9: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 4); break;
        case 10: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 21); break;
        case 11: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 14); break;
        case 12: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
    }
    return fecha;
}

function getPos(grupo){
    if(grupo === 2 || grupo === 3 || grupo === 8 || grupo === 9){
        return 1;
    } 
    return 0;
}


//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //

export function getListaReduccionParkingDSM50(year, grupo){
    let fechaInitRGrupo1_2022 = new Date(2022,0,17);
    const totalSecuencia = 42;
    const secuenciaLibres = [11,3,7];
    const secuenciaTrabajo = [8,5,11];
    let pos = 1;
    fechaInitRGrupo1_2022 = new Date(getFechaInit(year, fechaInitRGrupo1_2022, totalSecuencia));
    if(grupo > 1){
        fechaInitRGrupo1_2022 = new Date(getFechaInicioRGrupo(fechaInitRGrupo1_2022, grupo));
        pos = getPosRSecuencia(grupo);
    }
    //return FuncionesComunes.getListaLibres(year, fechaInitRGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
    return getListaLibres(year, fechaInitRGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
}


function getFechaInicioRGrupo(fecha, grupo){
    switch(grupo){
        case 2: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 0); break;
        case 3: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 10); break;
        case 4: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 3); break;
        case 5: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 14); break;
        case 6: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
        case 7: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 0); break;
        case 8: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 0); break;
        case 9: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 10); break;
        case 10: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 3); break;
        case 11: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 14); break;
        case 12: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
    }
    return fecha;
}


function getPosRSecuencia(grupo){
    if(grupo === 1 || grupo === 5 || grupo === 6 || grupo === 7 || grupo === 11 || grupo === 12){
        return 1;
    } else if(grupo === 2 || grupo === 8){
        return 2
    }
    return 0;
}


//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //

    //Cada posición corresponde con la primera fecha del subgrupo del grupo del año 2022
    const subgrupo = [
        new Date(2022,0,31), new Date(2022,0,24), new Date(2022,0,17), new Date(2022,0,10), new Date(2022,0,3), new Date(2022,2,21), 
        new Date(2022,2,14), new Date(2022,2,7), new Date(2022,1,28), new Date(2022,1,21), new Date(2022,1,14), new Date(2022,1,7) 
    ];


    export function getListaSubgrupoParkingDSM50(year, grupo){
        let fechaInit = subgrupo[grupo-1];
        const totalSecuencia = 84;
        if (year > 2022) {
            fechaInit = new Date(getFechaInit(year, fechaInit, totalSecuencia));
        }
       // return FuncionesComunes.getListaSubgrupoReduccion(year, fechaInit, totalSecuencia);
        return getListaSubgrupoReduccion(year, fechaInit, totalSecuencia);
    }

    

    //module.exports.getListaLibresParkingDSM50 = getListaLibresParkingDSM50;
    //module.exports.getListaReduccionParkingDSM50 = getListaReduccionParkingDSM50;
    //module.exports.getListaSubgrupoParkingDSM50 = getListaSubgrupoParkingDSM50;