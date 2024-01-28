

/**
 * Rellena el select grupo dependiendo de cada calendario
 * @param {*} tipoCalendario 
 * @param {*} select 
 */
export function initSelectGrupo(tipoCalendario, select) {
    let arrayGrupo;
    if (tipoCalendario === 'Conductor' || tipoCalendario === 'Inspector' || tipoCalendario === 'Inspector_Noche' ||
        tipoCalendario === 'Grua' || tipoCalendario === 'GruaDM' || tipoCalendario === 'Buho') {
        arrayGrupo = [1, 2, 3, 4, 5];
    } else if (tipoCalendario === 'GruaDSM_Noche') {
        arrayGrupo = [1,2,3];
    } else if(tipoCalendario === 'ParkingDSM_100'){
        arrayGrupo = [1,2,3,4,5,6,7,8,9,10];
    } else if(tipoCalendario === 'ParkingDSM_50'){
        arrayGrupo = [1,2,3,4,5,6,7,8,9,10,11,12];
    } else if(tipoCalendario === 'Refuerzo_Nocturno'){
        arrayGrupo = ["A", "B"];
    }
    setDatosSelect(select, arrayGrupo);
}

/**
 * Rellena el select subgrupo, el calendario que no tiene no lo necesita porque se borrara
 * @param {*} tipoCalendario 
 * @param {*} select 
 * @param {*} select_value 
 * @returns 
 */
export function initSelectSubgrupo(tipoCalendario, select, select_value) {
    let array;
    if (tipoCalendario === 'Conductor' || tipoCalendario === 'Buho') {
        array = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    } else if (tipoCalendario === 'Inspector' || tipoCalendario === 'Inspector_Noche') {
        array = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    } else if (tipoCalendario === 'Grua') {
        array = ['A', 'B', 'C'];
    } else if (tipoCalendario === 'GruaDM') {
        array = getArrayGruaDSM(select_value);
    } else if(tipoCalendario === 'GruaDSM_Noche' || tipoCalendario === 'ParkingDSM_100' || tipoCalendario === 'ParkingDSM_50' || tipoCalendario === 'Refuerzo_Nocturno'){
        return;
    }
    setDatosSelect(select, array);
}


export function initRotulos(tipoCalendario, div) {
    let libre = div.firstElementChild;
    let subgrupo = libre.nextElementSibling;
    let sub1 = subgrupo.nextElementSibling;
    let sub2 = div.lastElementChild;

    if(tipoCalendario === 'Conductor' || tipoCalendario === 'Buho'){
        subgrupo.style.display = "block";
        sub1.style.display = "block";
        sub2.style.display = "block";
        sub1.textContent = 'Grupo(A/C/E/G)';
        sub2.textContent = 'Grupo(B/D/F/H)';

    } else if(tipoCalendario === 'Inspector' || tipoCalendario === 'Inspector_Noche'){
        subgrupo.style.display = "block";
        sub1.style.display = "block";
        sub2.style.display = "block";
        sub1.textContent = 'Grupo(A/C/E/G/I)';
        sub2.textContent = 'Grupo(B/D/F/H/J)';

    } else if(tipoCalendario === 'Grua' || tipoCalendario === 'GruaDM'){
        //eliminar etiquetas dias reduccion
        subgrupo.style.display = "block";
        sub1.style.display = "none";
        sub2.style.display = "none";

    } else if(tipoCalendario === 'GruaDSM_Noche'){
        //eliminar etiquetas reduccion y subgrupo
        subgrupo.style.display = "none";
        sub1.style.display = "none";
        sub2.style.display = "none";
        
    } else if(tipoCalendario === 'ParkingDSM_100'){
        //eliminar subgrupo y uno de los de reduccion
        subgrupo.style.display = "none";
        sub1.style.display = "none";
        sub2.style.display = "block";
        sub2.textContent = 'D.Reducción';

    } else if(tipoCalendario === 'ParkingDSM_50'){
        //eliminar uno de reduccion cambiar nombres etiquetas
        subgrupo.style.display = "block";
        sub1.style.display = "none";
        sub2.style.display = "block";
        subgrupo.textContent = 'Jda.Parcial';
        sub2.textContent = 'D.Reducción';

    } else if(tipoCalendario === 'Refuerzo_Nocturno'){
        //eliminar etiquetas reduccion y subgrupo
        subgrupo.style.display = "none";
        sub1.style.display = "none";
        sub2.style.display = "none";
    }
}


export function initDivNavSup(tipoCalendario, divNavSup){
    let ultimo = divNavSup.lastElementChild;
    let select_subgrupo = ultimo. previousElementSibling;
    let label_subgrupo = select_subgrupo.previousElementSibling;

    if(tipoCalendario === 'GruaDSM_Noche' || tipoCalendario === 'ParkingDSM_100' || tipoCalendario === 'ParkingDSM_50' || tipoCalendario === 'Refuerzo_Nocturno'){
        select_subgrupo.style.display = "none";
        label_subgrupo.style.display = "none";
    } else {
        select_subgrupo.style.display = "block";
        label_subgrupo.style.display = "block";
    }
}

export function initCajaRefuerzo(tipoCalendario, divNavSup, divRefuerzo){
    let ultimo = divNavSup.lastElementChild;
    let select_subgrupo = ultimo. previousElementSibling;
    let label_subgrupo = select_subgrupo.previousElementSibling;
   if(tipoCalendario === 'Refuerzo_Nocturno'){
     divRefuerzo.style.display = "flex";
     select_subgrupo.style.display = "none";
     label_subgrupo.style.display = "none";
   } else {
     divRefuerzo.style.display = "none";
     select_subgrupo.style.display = "block";
     label_subgrupo.style.display = "block";
   }
}


function setDatosSelect(select, array) {
    select.options.length = 0;
    for (let a = 0; a < array.length; a++) {
        const op = document.createElement('option');
        op.value = array[a];
        op.text = array[a];
        select.appendChild(op);
    }
}


/**
 * Existen 50 subgrupos, dependiendo de la seleccion del select grupo 
 * se calculan el resto para incluirlos en el select de subgrupo
 * @param {*} select_value 
 */
function getArrayGruaDSM(select_value) {
    let array = [];
    let valor = parseInt(select_value);
    array.push(valor); //hay que incluir como primer número el mismo que el grupo
    for (let a = 0; a < 9; a++) {
        valor += 5;
        array.push(valor.toString());
    }
    return array;
}