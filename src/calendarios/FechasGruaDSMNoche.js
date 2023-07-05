
//const FuncionesComunes = require('./FuncionesComunes');
import {getFechaInit, getListaLibres} from './FuncionesComunes.js';

export function getListaLibresGruaDSMNoche(year, grupo){
    let fechaInitGrupo1_2022 = new Date(2022,0,1);
    const totalSecuencia = 21;
    const secuenciaLibres = [5,2];
    const secuenciaTrabajo = [8,8];
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
        case 2: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 5); break;
        case 3: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
    }
    return fecha;
}


function getPosSecuencia(grupo){
    if(grupo === 2){
        return 1;
    } 
    return 0;
}


//module.exports.getListaLibresGruaDSMNoche = getListaLibresGruaDSMNoche;