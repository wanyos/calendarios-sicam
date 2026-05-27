

/**
 * Rellena el select grupo dependiendo de cada calendario
 * @param {*} tipoCalendario 
 * @param {*} select 
 */
export function initSelectGrupo(tipoCalendario, select) {
    let arrayGrupo;
    if (tipoCalendario === 'Conductor' || tipoCalendario === 'Inspector' || tipoCalendario === 'Inspector_Noche' ||
        tipoCalendario === 'Grua' || tipoCalendario === 'GruaDSM' || tipoCalendario === 'Buho') {
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
    } else if (tipoCalendario === 'GruaDSM') {
        array = getArrayGruaDSM(select_value);
    } else if(tipoCalendario === 'GruaDSM_Noche' || tipoCalendario === 'ParkingDSM_100' || tipoCalendario === 'ParkingDSM_50' || tipoCalendario === 'Refuerzo_Nocturno'){
        return;
    }
    setDatosSelect(select, array);
}


export function initRotulos(tipoCalendario, div) {
    // WHY: buscamos por data-rol en vez de por posición (firstElementChild,
    //      nextElementSibling). Si el HTML cambia el orden de los <h4>,
    //      antes la función seguía funcionando pero pintaba en el sitio
    //      equivocado. Con data-rol falla ruidosamente con un TypeError
    //      si se borra el atributo, lo cual es preferible.
    //      "libre" no se referencia desde aquí porque nunca cambia su
    //      visibilidad (es siempre visible). Lo dejamos en el HTML para
    //      coherencia visual y se gestiona vía CSS estático.
    const subgrupo = div.querySelector('[data-rol="subgrupo"]');
    const sub1 = div.querySelector('[data-rol="sub1"]');
    const sub2 = div.querySelector('[data-rol="sub2"]');

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

    } else if(tipoCalendario === 'Grua' || tipoCalendario === 'GruaDSM'){
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


// WHY: tras el rediseño, label y select del subgrupo viven dentro de un .field;
//      ya no son hermanos sueltos en nav__sup. Basta con ocultar/mostrar el
//      .field entero. Usamos display:"" (no "block") para que al restaurar se
//      recupere el flex propio del .field, no un block que rompería el layout.
function getFieldSubgrupo(divNavSup) {
    // estructura: [field año][field grupo][field subgrupo][div opcion-refuerzo]
    return divNavSup.lastElementChild.previousElementSibling;
}

export function initDivNavSup(tipoCalendario, divNavSup){
    const fieldSubgrupo = getFieldSubgrupo(divNavSup);
    const ocultar = ['GruaDSM_Noche', 'ParkingDSM_100', 'ParkingDSM_50', 'Refuerzo_Nocturno'].includes(tipoCalendario);
    fieldSubgrupo.style.display = ocultar ? 'none' : '';
}

export function initCajaRefuerzo(tipoCalendario, divNavSup, divRefuerzo){
    const fieldSubgrupo = getFieldSubgrupo(divNavSup);
    if (tipoCalendario === 'Refuerzo_Nocturno') {
        divRefuerzo.style.display = 'flex';
        fieldSubgrupo.style.display = 'none';
    } else {
        divRefuerzo.style.display = 'none';
        fieldSubgrupo.style.display = '';
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
    // WHY: tras manipular las <option> nativas, Tom Select no se entera por sí
    //      solo. clearOptions+addOptions+setValue rebuilen su dropdown y dejan
    //      seleccionado el primer elemento (replica del comportamiento nativo:
    //      tras añadir options, select.value apunta al primero por defecto).
    //      clearOptions(() => false) fuerza el borrado de TODAS las options;
    //      sin filtro, Tom Select preserva la option actualmente seleccionada
    //      (clearFilter por defecto la considera "en uso") y al re-añadirla
    //      mantiene su $order antiguo — el dropdown la pinta primero aunque
    //      ya no corresponda al nuevo conjunto (p.ej. queda una 'J' o '1'
    //      flotando al cambiar de categoría). clear() limpia primero los
    //      items seleccionados para que ningún valor previo quede colgando.
    if (select.tomselect) {
        const ts = select.tomselect;
        ts.clear(true);
        ts.clearOptions(() => false);
        ts.addOptions(array.map(v => ({ value: String(v), text: String(v) })));
        if (array.length > 0) ts.setValue(String(array[0]), true);
        ts.refreshOptions(false);
    }
}


/**
 * Existen 50 subgrupos, dependiendo de la seleccion del select grupo 
 * se calculan el resto para incluirlos en el select de subgrupo
 * @param {*} select_value 
 */
function getArrayGruaDSM(select_value) {
    // WHY: todos los push convierten a string para mantener tipo uniforme.
    //      Antes el primer elemento entraba como number y los demás como
    //      string — luego cualquier comparación con === podía fallar.
    const array = [];
    let valor = parseInt(select_value);
    array.push(String(valor));
    for (let a = 0; a < 9; a++) {
        valor += 5;
        array.push(String(valor));
    }
    return array;
}