
import {getFechaInit, getListaLibres} from './FuncionesComunes.js';

export function getListaLibresRefuerzoNocturno(year, grupo, grupoDos){
    let fechaInit = new Date(2022, 0, 2);
    const totalSecuencia = 280;
    let pos = 0;

    const secuenciaLibres = [3, 1, 1, 1, 2, 1, 2, 1, 4,
        2, 4, 1, 1, 1, 2, 1,
        2, 1, 1, 1, 2, 1, 2, 1, 1, 1,
        3, 1, 2, 1, 1, 1, 2, 1,
        2, 1, 4, 2, 1, 2, 1, 2, 1,
        2, 1, 2, 1, 1, 1, 2, 1,
        2, 1, 1, 1, 2, 1];
    const secuenciaTrabajo = [3, 4, 3, 7, 6, 2, 4, 4,
        7, 6, 4, 4, 3, 7, 6,
        2, 4, 4, 3, 7, 6, 2, 4, 4, 3,
        7, 5, 2, 4, 4, 3, 7, 6,
        2, 4, 4, 7, 6, 2, 4, 3, 3,
        7, 6, 2, 4, 4, 3, 7, 6,
        2, 4, 4, 3, 7, 6, 2];

        fechaInit = new Date(getFechaInit(year, fechaInit, totalSecuencia));
        if(grupoDos === '5'){
            fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate()-3);
        }
        pos = getPos(grupo, grupoDos);
        return getListaLibres(year, fechaInit, secuenciaLibres, secuenciaTrabajo, pos);
}


function getPos(grupo, grupoDos){
    let pos = 0;
    let valor = getEntero(grupoDos);

    if(grupo === 'A'){

        if(valor > 0){
            pos = getPosAN(valor);
        } else {
            pos = getPosAL(grupoDos);
        }

    } else if(grupo === 'B'){

        if(valor > 0){
            pos = getPosBN(valor);
        } else {
            pos = getPosBL(grupoDos);
        }

    }
    return pos;
}

function getEntero(grupoDos){
    let valor = parseInt(grupoDos);
    if(isNaN(valor)){
        return 0;
    } 
    return valor;
}

function getPosAN(grupoDos){
    let v = 0;
    switch(grupoDos){
        case 1: v = 31; break;
        case 2: v = 32; break;
        case 3: v = 33; break;
        case 4: v = 35; break;
        case 5: v = 36; break;
        case 6: v = 37; break;
        case 7: v = 38; break;
        case 8: v = 40; break;
        case 9: v = 42; break;
    }
    return v;
}

function getPosAL(grupoDos){
    let v = 0;
    switch(grupoDos){
        case 'A': v = 43; break;
        case 'B': v = 44; break;
        case 'C': v = 46; break;
        case 'D': v = 48; break;
        case 'E': v = 49; break;
        case 'F': v = 50; break;
        case 'G': v = 52; break;
        case 'H': v = 54; break;
        case 'I': v = 55; break;
        case 'J': v = 56; break;
        case 'K': v = 1; break;
    }
    return v;
}

function getPosBN(grupoDos){
    let v = 0;
    switch(grupoDos){
        case 1: v = 3; break;
        case 2: v = 4; break;
        case 3: v = 5; break;
        case 4: v = 7; break;
        case 5: v = 8; break;
        case 6: v = 9; break;
        case 7: v = 10; break;
        case 8: v = 11; break;
        case 9: v = 13; break;
    }
    return v;
}

function getPosBL(grupoDos){
    let v = 0;
    switch(grupoDos){
        case 'A': v = 14; break;
        case 'B': v = 15; break;
        case 'C': v = 17; break;
        case 'D': v = 19; break;
        case 'E': v = 20; break;
        case 'F': v = 21; break;
        case 'G': v = 23; break;
        case 'H': v = 25; break;
        case 'I': v = 26; break;
        case 'J': v = 27; break;
        case 'K': v = 29; break;
    }
    return v;
}