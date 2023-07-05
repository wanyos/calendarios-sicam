
import {getFechaInit, getListaLibres, getListaSubgrupoReduccion} from './FuncionesComunes.js';
//const FuncionesComunes = require('../FuncionesComunes');

export function getListaLibresParkingDSM100(year, grupo){
    let fechaInitGrupo1_2022 = new Date(2022,0,4);
    const totalSecuencia = 70;
    const secuenciaLibres = [3,3,2,4,2,4,2,4];
    const secuenciaTrabajo = [8,6,6,8,7,6,6,7];
    let pos = 0;
    fechaInitGrupo1_2022 = new Date(getFechaInit(year, fechaInitGrupo1_2022, totalSecuencia));
    if(grupo > 1){
        fechaInitGrupo1_2022 = new Date(getFechaInicioGrupo(fechaInitGrupo1_2022, grupo));
        pos = getPosSecuencia(grupo);
    }
    //return FuncionesComunes.getListaLibres(year, fechaInitGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
    return getListaLibres(year, fechaInitGrupo1_2022, secuenciaLibres, secuenciaTrabajo, pos);
}


function getFechaInicioGrupo(fecha, grupo){
    switch(grupo){
        case 2: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 3); break;
        case 3: 
        case 4: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 4); break;
        case 5: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 8); break;
        case 6: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 9); break;
        case 7: 
        case 8: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 11); break;
        case 9: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 14); break;
        case 10: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 17); break;
    }
    return fecha;
}


/**
 * 
 * @param grupo El grupo1 y grupo9 comparten pos=0
 * @returns 
 */
function getPosSecuencia(grupo){
    if(grupo >= 2 && grupo <= 8){
        return grupo-1;
    } else if(grupo === 10){
        return 1;
    } 
    return 0;
}



//  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //
    
    //Cada posición del array corresponde con un subgrupo
    //El subgrupo corresponde con el número del grupo, solo existe uno por grupo
    const subgrupo = [
        new Date(2022,1,2), new Date(2022,0,26), new Date(2022,0,19), new Date(2022,0,12), new Date(2022,0,5), 
        new Date(2022,2,9), new Date(2022,2,2), new Date(2022,1,23), new Date(2022,1,16), new Date(2022,1,9)];

      export function getListaSubgrupoParkingDSM100(year, grupo){
            let fechaInit = subgrupo[grupo-1];
            const totalSecuencia = 70;
            if (year > 2022) {
                fechaInit = new Date(getFechaInit(year, fechaInit, totalSecuencia));
            }
            //return FuncionesComunes.getListaSubgrupoReduccion(year, fechaInit, totalSecuencia);
            return getListaSubgrupoReduccion(year, fechaInit, totalSecuencia);
        }



        //module.exports.getListaLibresParkingDSM100 = getListaLibresParkingDSM100;
        //module.exports.getListaSubgrupoParkingDSM100 =getListaSubgrupoParkingDSM100;