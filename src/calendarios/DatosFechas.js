
import {getListaLibresConductor, getListaSubgrupoConductor, getListaSubComunesConductor} from './FechasConductor.js';
import {getListaLibresInspector, getListaSubgrupoInspector, getListaSubComunesInspector} from './FechasInspector.js';
import {getListaLibresInspectorNoche, getListaSubgrupoInspectorNoche, getListaSubComunesInspectorNoche} from './FechasInspectorNoche.js'
import {getListaLibresGrua, getListaSubgrupoGrua} from './FechasGrua.js';
import {getListaLibresGruaDSM, getListaSubgrupoGruaDSM} from './FechasGruaDSM.js'
import {getListaLibresGruaDSMNoche} from './FechasGruaDSMNoche.js'
import {getListaLibresParkingDSM100, getListaSubgrupoParkingDSM100} from './FechasParkingDSM100.js';
import {getListaLibresParkingDSM50, getListaSubgrupoParkingDSM50, getListaReduccionParkingDSM50} from './FechasParkingDSM50.js';
import {getListaLibresRefuerzoNocturno} from './FechasRefuerzoNocturno.js';
import {getListaLibresBuho, getListaSubgrupoBuho, getListaSubComunesBuho} from './FechasBuho.js';


export function getDatosListaLibres(tipoCalendario, year, grupo, grupoDos){
    if(tipoCalendario === 'Conductor'){
        return getListaLibresConductor(year, grupo);
    } else if(tipoCalendario === 'Inspector'){
        return getListaLibresInspector(year, grupo);
    } else if(tipoCalendario === 'Inspector_Noche'){
        return getListaLibresInspectorNoche(year, grupo);
    } else if(tipoCalendario === 'Grua'){
        return getListaLibresGrua(year, grupo);
    } else if(tipoCalendario === 'GruaDM'){
        return getListaLibresGruaDSM(year, grupo);
    } else if(tipoCalendario === 'GruaDSM_Noche'){
        return getListaLibresGruaDSMNoche(year, grupo);
    } else if(tipoCalendario === 'ParkingDSM_100'){
        return getListaLibresParkingDSM100(year, grupo);
    } else if(tipoCalendario === 'ParkingDSM_50'){
        return getListaLibresParkingDSM50(year, grupo);
    } else if(tipoCalendario === 'Refuerzo_Nocturno'){
       return getListaLibresRefuerzoNocturno(year, grupo, grupoDos);
    } else if(tipoCalendario === 'Buho'){
        return getListaLibresBuho(year, grupo);
    }
}

export function getDatosListaSubgrupo(tipoCalendario, year, grupo, subgrupo){
    if(tipoCalendario === 'Conductor'){
        return getListaSubgrupoConductor(year, grupo, subgrupo);
    } else if(tipoCalendario === 'Inspector'){
        return getListaSubgrupoInspector(year, grupo, subgrupo);
    } else if(tipoCalendario === 'Inspector_Noche'){
        return getListaSubgrupoInspectorNoche(year, grupo, subgrupo);
    } else if(tipoCalendario === 'Grua'){
        return getListaSubgrupoGrua(year, grupo, subgrupo);
    } else if(tipoCalendario === 'GruaDM'){
        return getListaSubgrupoGruaDSM(year, subgrupo); //el subgrupo es número
    } else if(tipoCalendario === 'ParkingDSM_50'){
        return getListaReduccionParkingDSM50(year, grupo);  //solo existe un tipo de subgrupo por grupo
    } else if(tipoCalendario === 'Buho'){
        return getListaSubgrupoBuho(year, grupo, subgrupo);
    }
}


export function getDatosListaSubComunes(tipoCalendario, year, grupo, subgrupo){
    if(tipoCalendario === 'Conductor'){
        return getListaSubComunesConductor(year, grupo, subgrupo);
    } else if(tipoCalendario === 'Inspector'){
        return getListaSubComunesInspector(year, grupo, subgrupo);
    } else if(tipoCalendario === 'Inspector_Noche'){
        return getListaSubComunesInspectorNoche(year, grupo, subgrupo);
    } else if(tipoCalendario === 'ParkingDSM_100'){
        return getListaSubgrupoParkingDSM100(year, grupo);  //solo existe un tipo de subgrupo por grupo
    }   else if(tipoCalendario === 'ParkingDSM_50'){
        return getListaSubgrupoParkingDSM50(year, grupo);  //se le llama dia parcial
    } else if (tipoCalendario === 'Buho'){
        return getListaSubComunesBuho(year, grupo, subgrupo);
    }
}

