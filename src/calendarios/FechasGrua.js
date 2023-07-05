
import {getFechaInit, getListaLibres, getListaSubgrupo} from './FuncionesComunes.js';

export function getListaLibresGrua(year, grupo){
    let fechaInitGrupo1_2022 = new Date(2022,0,5);
    const totalSecuencia = 35;
    const secuenciaLibres = [2,3,2,4];
    const secuenciaTrabajo = [8,6,6,8];
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
        case 3: 
        case 4: fecha = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 3); break;
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
    
    //Fechas subgrupo letras = A,B,C
    //Cada posicion del array de un grupo corresponde con la letra
    const subgrupos = [[new Date(2022,0,13), new Date(2022,1,11), new Date(2022,0,7)],
                    [new Date(2022,0,6), new Date(2022,1,4), new Date(2022,1,10)],
                    [new Date(2022,2,4), new Date(2022,0,28), new Date(2022,1,3)],
                    [new Date(2022,1,25), new Date(2022,0,21), new Date(2022,0,27)],
                    [new Date(2022,1,18), new Date(2022,0,14), new Date(2022,0,20)]];


   export function getListaSubgrupoGrua(year, grupo, subgrupo){
        const secuencia = [64,41];
        const totalSec = 105;
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


    
    function getPosSubgrupo(subgrupo){
        if(subgrupo === "B"){
            return 1;
        } else if(subgrupo === "C"){
            return 2;
        }
        return 0;
    }

    function getPosSecuencia(fecha){
        const day = fecha.getDay();
        if(day === 5){
            return 1;
        }
        return 0;
    }

