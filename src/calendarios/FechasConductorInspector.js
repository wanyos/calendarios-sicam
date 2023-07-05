
import {getListaLibres, getListaSubgrupo, getListaSubgrupoReduccion} from './FuncionesComunes.js';
import {getFechaInit} from './FuncionesComunes.js';

    export const getLibresConductorInspector = (year, grupo, fechaInit, totalSec, libres, trabajo) => {
        let pos = 0;
        fechaInit = getFechaInit(year, fechaInit, totalSec);
        if(grupo > 1){
            fechaInit = getFechaInitGrupo(grupo, fechaInit);
            pos = getPos(grupo);
        }
        return getListaLibres(year, fechaInit, libres, trabajo, pos);
    }


    function getFechaInitGrupo(grupo, fechaInit){
        switch(grupo){
            case 2: return new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate()+2);
            case 3: return new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate()+3);
            case 4: return new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate()+4);
            case 5: return new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate()+7);
        }
    }

    function getPos(grupo){
        if(grupo > 1 && grupo < 5){
            return grupo-1;
        }
        return 0;
    }


// ---------------------------------------------------------------------------------------------------------------------------------------- //

export function getListaSubgrupoConductorInspector(year, fechaInit, totalSecuencia, secuencia, pos){
    if(year > fechaInit.getFullYear()){
        fechaInit = getFechaInit(year, fechaInit, totalSecuencia);
    }
    return getListaSubgrupo(year, fechaInit, secuencia, pos);
}


// ---------------------------------------------------------------------------------------------------------------------------------------- //


export function getListaSubComunesConductorInspector(year, fechaInit, totalSecuencia){
    if(year > fechaInit.getFullYear()){
        fechaInit = getFechaInit(year, fechaInit, totalSecuencia);
    }
    return getListaSubgrupoReduccion(year, fechaInit, totalSecuencia);
}





