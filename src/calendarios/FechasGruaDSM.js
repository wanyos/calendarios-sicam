
import {getFechaInit, getListaLibres, getListaSubgrupo} from './FuncionesComunes.js';
//const FuncionesComunes = require('./FuncionesComunes');

export function getListaLibresGruaDSM(year, grupo){
    let fechaInitGrupo1_2022 = new Date(2022,0,1);
    const totalSecuencia = 35;
    //Secuencia libres s,d,l,m,x - j,v - s,d - s,d
    const secuenciaLibres = [5,2,2,2];
    const secuenciaTrabajo = [8,8,6,6];
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
        case 2: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 5); break;
        case 3: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 7); break;
    }
    return fecha;
}


function getPos(grupo){
    if(grupo === 2){
        return 1;
    } else if(grupo === 5){
        return 3;
    } else if(grupo === 3 || grupo === 4){
        return 2;
    }
    return 0;
}




      //  ----------------------------------------------------------------------------------------------------------------------------------------------------------- //
    
    //Existen 50 subgrupos, en el array cada posicion se corresponde con uno de ellos
    //El nombre del subgrupo se corresponde con un número entre el 1 y el 50
    const subgrupo = [ 
        new Date(2022,2,22), new Date(2022,2,15), new Date(2022,2,8), new Date(2022,2,1), new Date(2022,1,22), new Date(2022,1,15), new Date(2022,1,8), 
        new Date(2022,1,1), new Date(2022,0,25), new Date(2022,0,18), new Date(2022,0,11), new Date(2022,0,4), new Date(2022,3,7), new Date(2022,2,31),
        new Date(2022,2,24), new Date(2022,2,17), new Date(2022,2,10), new Date(2022,2,3), new Date(2022,1,24), new Date(2022,1,17), new Date(2022,1,10),
        new Date(2022,1,3), new Date(2022,0,27), new Date(2022,0,20), new Date(2022,0,13), new Date(2022,3,1), new Date(2022,2,25), new Date(2022,2,18),
        new Date(2022,2,11), new Date(2022,2,4), new Date(2022,1,25), new Date(2022,1,18), new Date(2022,1,11), new Date(2022,1,4), new Date(2022,0,28),
        new Date(2022,0,21), new Date(2022,0,14), new Date(2022,0,7), new Date(2022,1,28), new Date(2022,1,21), new Date(2022,1,14), new Date(2022,1,7),
        new Date(2022,0,31), new Date(2022,0,24), new Date(2022,0,17), new Date(2022,0,10), new Date(2022,0,3), new Date(2022,3,12), new Date(2022,3,5),
        new Date(2022,2,29)
    ];


    export function getListaSubgrupoGruaDSM(year, numSubgrupo){
        const secuencia = [59,106,1,99,85];
        const totalSec = 350;
        let fechaInit = subgrupo[numSubgrupo-1];
        if (year > 2022) {
            fechaInit = new Date(getFechaInit(year, fechaInit, totalSec));
        }
        let posSecuencia = getPosSecuencia(fechaInit);
       // return FuncionesComunes.getListaSubgrupo(year, fechaInit, secuencia, posSecuencia);
        return getListaSubgrupo(year, fechaInit, secuencia, posSecuencia);
    }


    function getPosSecuencia(fechaInit){
        const day = fechaInit.getDay();
        if(day >= 1 && day <= 4){
            return day;
        }
        return 0;
    }


//module.exports.getListaLibresGruaDSM = getListaLibresGruaDSM;
//module.exports.getListaSubgrupoGruaDSM = getListaSubgrupoGruaDSM;