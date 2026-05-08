
import TomSelect from 'tom-select';
// WHY: tom-select.default.css incluye el TEMA con chevron, padding-right
//      reservado vía --ts-pr-caret, hover y active states. tom-select.css
//      es solo el core sin tema y obliga a recrearlo todo a mano.
import 'tom-select/dist/css/tom-select.default.css';

import { getDatosListaLibres, getDatosListaSubgrupo, getDatosListaSubComunes } from './calendarios/DatosFechas.js';
import { initSelectGrupo, initSelectSubgrupo, initRotulos, initDivNavSup, initCajaRefuerzo } from './calendarios/InitCabecera.js';
import { CATEGORIAS, NUMEROS_REFUERZO, LETRAS_REFUERZO } from './calendarios/Constantes.js';

let currentDate;
let titulo = document.getElementById('titulo');
let select_opcion = document.getElementById('select_opcion');
let dias_semana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
let select_year = document.getElementById("select_year");
let btn = document.getElementById('btn');
let contenedor = document.getElementById("container-tabla");
let rotulosSubgrupo = document.getElementById('rotulos-subgrupo');
let divNavSup = document.getElementById('nav_sup');
let divRefuerzo = document.getElementById('opcion-refuerzo');

let select_grupo = document.getElementById("select_grupo");
let select_subgrupo = document.getElementById("select_subgrupo");
let select_num = document.getElementById('select-num');
let select_ltr = document.getElementById('select-ltr');

let listaLibresYear = [];
let listaSubgrupoYear = [];
let listaSubComunesYear = [];


/*dia que empieza el mes*/
function startDay(monthNumber) {
    let start = new Date(currentDate.getFullYear(), monthNumber - 1, 1);
    return ((start.getDay() - 1) == -1) ? 6 : start.getDay() - 1;
}


/*Anyo bisiesto*/
function isLeap() {
    return ((currentDate.getFullYear() % 100 !== 0) && (currentDate.getFullYear() % 4 == 0)
        || (currentDate.getFullYear() % 400 == 0));
}



/*total dias de mes*/
function getTotalDays(month) {
    if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
        return 31;
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        return 30;
    } else {
        return isLeap() ? 29 : 28;
    }
}

const comprobarDia = (numDia, mes) => {
    if (numDia > 0) {
        if (listaLibresYear.length > 0 && comprobarArray(listaLibresYear, numDia, mes)) {
            listaLibresYear.shift();
            return "libres";
        } else if (listaSubgrupoYear != undefined && listaSubgrupoYear.length > 0 && comprobarArray(listaSubgrupoYear, numDia, mes)) {
            listaSubgrupoYear.shift();
            return "subgrupo";
        } else if (listaSubComunesYear != undefined && listaSubComunesYear.length > 0 && comprobarArray(listaSubComunesYear, numDia, mes)) {
            listaSubComunesYear.shift();
            let sub = select_subgrupo.value;
            if (sub === "A" || sub === "C" || sub === "E" || sub === "G" || sub === "I") {
                return "sub1";
            } else {
                return "sub2";
            }
        }
    }

}

function comprobarArray(array, numDia, mes) {
    if (parseInt(numDia) === array[0].getDate() && (mes - 1) === array[0].getMonth()) {
        return true;
    }
    return false;
}



function getArrayMes(espacios, totalDias) {
    let arrayMes = new Array();
    let contador = 0;
    let num_dia = 1;

    for (let a = 0; a < 42; a++) {
        if (contador <= espacios || num_dia > totalDias) {
            arrayMes.push(".");
            contador++;
        } else {
            arrayMes.push("" + num_dia++);
        }
    }
    return arrayMes;
}


function rellenarDias(tabla, mes) {
    let numeroDias = getTotalDays(mes);
    let espacios = startDay(mes) - 1;
    let tipoDia;
    let fragment = document.createDocumentFragment();

    const arrayMes = getArrayMes(espacios, numeroDias);
    let diaSemana = 0;
    for (const d of arrayMes) {
        if (diaSemana === 0) {
            fragment = document.createElement("tr");
        }
        let columna = document.createElement("td");

        tipoDia = comprobarDia(d, mes);

        let dia = document.createTextNode(d);
        columna.appendChild(dia);
        columna.setAttribute("class", tipoDia);

        fragment.appendChild(columna);
        diaSemana++;

        if (diaSemana === 7) {
            diaSemana = 0;
            tabla.appendChild(fragment);
        }
    }
}



/**
* Recorre el array de dias de la semana y los pone en la cabecera de cada tabla
* @param {*} tabla elemento tabla
*/
function rellenarTablaCabecera(tabla) {
    let fila = document.createElement("tr");
    for (let a = 0; a < dias_semana.length; a++) {
        let cabecera = document.createElement("th");
        let d = document.createTextNode(dias_semana[a]);
        cabecera.appendChild(d);
        fila.appendChild(cabecera);
    }
    tabla.appendChild(fila);
}



function getNombre(n) {
    switch (n) {
        case 1: return "Enero";
        case 2: return "Febrero";
        case 3: return "Marzo";
        case 4: return "Abril";
        case 5: return "Mayo";
        case 6: return "Junio";
        case 7: return "Julio";
        case 8: return "Agosto";
        case 9: return "Septiembre";
        case 10: return "Octubre";
        case 11: return "Noviembre";
        case 12: return "Diciembre";
    }
}

/**
* Crea una tabla para cada mes 
* llama a rellenar cabecera la cual rellena la cabecera de la tabla con los dias de la semana
* @param {*} cont_tabla contenedor div que contendra la tabla
* @param {*} nombre nombre del mes
* @param {*} num_mes numero del mes
*/
function crearTabla(cont_tabla, nombre, num_mes) {
    let tabla = document.createElement("table");
    let nombre_mes = document.createElement("caption");
    let contenido = document.createTextNode(nombre);
    nombre_mes.appendChild(contenido);
    tabla.appendChild(nombre_mes);
    rellenarTablaCabecera(tabla);
    rellenarDias(tabla, num_mes);
    cont_tabla.appendChild(tabla);
}


/**
 * Crea un div por cada mes 
 * llama a la función creartabla que creara una tabla dentro de cada div
 */
function crearMeses() {
    setDatos();
    const fragment = document.createDocumentFragment();
    for (let a = 1; a <= 12; a++) {
        let cont_tabla = document.createElement("div");
        cont_tabla.setAttribute("class", "div-mes");
        crearTabla(cont_tabla, getNombre(a), a);
        fragment.appendChild(cont_tabla);
    }
    document.getElementById("container-tabla").appendChild(fragment);
}


function nuevaFecha() {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
    currentDate = new Date(select_year.value, 0, 1);
    crearMeses();
}


function setDatos() {
    let year = parseInt(select_year.value);
    let grupo;
    if(select_opcion.value === 'Refuerzo_Nocturno'){
        grupo = select_grupo.value;
    } else {
        grupo = parseInt(select_grupo.value);
    }

    let subgrupo = select_subgrupo.value;
    let grupoDos = getGrupoDos();

    listaLibresYear = getDatosListaLibres(select_opcion.value, year, grupo, grupoDos);
    //console.log(listaLibresYear)
    listaSubgrupoYear = getDatosListaSubgrupo(select_opcion.value, year, grupo, subgrupo);
    //console.log(listaSubgrupoYear);
    listaSubComunesYear = getDatosListaSubComunes(select_opcion.value, year, grupo, subgrupo);
    //console.log(listaSubComunesYear);
}

function getGrupoDos(){
    let rdActivo = document.querySelector('input[name="opcion"]:checked');
    if(rdActivo.value === 'Num'){
        return select_num.value;
    } else if(rdActivo.value === 'Ltr'){
        return select_ltr.value;
    }
}


function initCalendario() {
    // WHY: usamos el .text del <option> seleccionada (no el .value) porque el
    //      value es un id interno con guiones bajos ("Inspector_Noche") y a
    //      veces sin separar ("GruaDSM"); el text del <option> ya está en
    //      formato legible. Así el HTML queda como única fuente de verdad
    //      para los nombres y no duplicamos el mapeo en JS.
    titulo.textContent = select_opcion.selectedOptions[0].text;
    //iniciar caja con opciones para refuerzo nocturno
    opcion();
    initCajaRefuerzo(select_opcion.value, divNavSup, divRefuerzo);
    initSelectGrupo(select_opcion.value, select_grupo);
    //el select_grupo.value es necesario para GruaDSM
    initSelectSubgrupo(select_opcion.value, select_subgrupo, select_grupo.value);
     //el valor divNavSup es necesario para GruaDSMNoche, eliminar el select subgrupo
    initDivNavSup(select_opcion.value, divNavSup);
    initRotulos(select_opcion.value, rotulosSubgrupo);
    nuevaFecha();
}

function opcion(){
    let elementoActivo = document.querySelector('input[name="opcion"]:checked');
    if(elementoActivo.value === 'Num') {
        select_num.disabled = false;
        select_ltr.disabled = true;
    } else if(elementoActivo.value === 'Ltr') {
        select_num.disabled = true;
        select_ltr.disabled = false;
    }
}


// WHY: helper genérico para rellenar un <select> a partir de un array.
//      Acepta dos formatos para no obligar a envolver datos triviales:
//        - strings/numbers: value y text iguales (ej. años, números, letras).
//        - objetos { value, text }: cuando el id interno difiere del texto
//          que ve el usuario (ej. "Inspector_Noche" → "Inspector Noche").
//      Usamos un DocumentFragment para hacer un único reflow al final,
//      en vez de uno por cada appendChild dentro del bucle.
function poblarSelect(select, items) {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
        const op = document.createElement('option');
        const esObjeto = typeof item === 'object' && item !== null;
        op.value = esObjeto ? item.value : item;
        op.text = esObjeto ? item.text : item;
        fragment.appendChild(op);
    }
    select.appendChild(fragment);
}

// WHY: las options de los selects estáticos (categoría, num, ltr) viven en
//      Constantes.js y se inyectan al cargar. Antes estaban hardcodeadas en
//      el HTML — moverlas a un módulo centraliza renombres y deja la vista
//      como pura estructura. Debe correr ANTES de TomSelect (la librería
//      fotografía las <option> al construirse).
function poblarSelectsEstaticos() {
    poblarSelect(select_opcion, CATEGORIAS);
    poblarSelect(select_num, NUMEROS_REFUERZO);
    poblarSelect(select_ltr, LETRAS_REFUERZO);
}

// WHY: ventana deslizante de años (-2 atrás, +10 adelante desde el año en
//      curso) generada al cargar la página. Sustituye las <option> antes
//      hardcodeadas en el HTML; así el rango se "refresca" en cada visita y
//      el select nunca se queda corto al cambiar de año natural.
function poblarSelectYear() {
    const actual = new Date().getFullYear();
    const years = [];
    for (let y = actual - 2; y <= actual + 10; y++) years.push(y);
    poblarSelect(select_year, years);
    select_year.value = actual;
}

poblarSelectsEstaticos();
poblarSelectYear();

btn.addEventListener('click', nuevaFecha);
select_opcion.addEventListener('change', initCalendario);
select_grupo.addEventListener('change', () => {
    if (select_opcion.value === 'GruaDSM') {
        initSelectSubgrupo(select_opcion.value, select_subgrupo, select_grupo.value);
    }
});

document.getElementById("rdNum").addEventListener('click', opcion);
document.getElementById("rdLtr").addEventListener('click', opcion);


initCalendario();
nuevaFecha();

// WHY: inicializar Tom Select DESPUÉS de la primera render — para entonces
//      select_grupo y select_subgrupo ya están poblados, y TomSelect copia
//      las <option> existentes a su estado interno. controlInput:null oculta
//      la búsqueda (las listas son cortas y fijas, sería un cuadro de texto
//      de adorno). dropdownParent:'body' saca el menú del stacking context
//      de .toolbar — si no, queda tapado por .main que tiene mismo z-index
//      y aparece más tarde en el DOM.
const tomConfig = {
    controlInput: null,
    allowEmptyOption: false,
    maxItems: 1,
    create: false,
    dropdownParent: 'body',
};
[select_opcion, select_year, select_grupo, select_subgrupo, select_num, select_ltr]
    .forEach(el => new TomSelect(el, tomConfig));
