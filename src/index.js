
import TomSelect from 'tom-select';
// WHY: tom-select.default.css incluye el TEMA con chevron, padding-right
//      reservado vía --ts-pr-caret, hover y active states. tom-select.css
//      es solo el core sin tema y obliga a recrearlo todo a mano.
import 'tom-select/dist/css/tom-select.default.css';

import { getDatosListaLibres, getDatosListaSubgrupo, getDatosListaSubComunes } from './calendarios/DatosFechas.js';
import { initSelectGrupo, initSelectSubgrupo, initRotulos, initDivNavSup, initCajaRefuerzo } from './calendarios/InitCabecera.js';
import { CATEGORIAS, NUMEROS_REFUERZO, LETRAS_REFUERZO } from './calendarios/Constantes.js';
import {
  claveFecha,
  startDay,
  getTotalDays,
  getNombre,
  getArrayMes,
  comprobarDia,
} from './calendarios/utils.js';
import { applyBranding } from './branding/apply.js';

let currentDate;
const titulo = document.getElementById('titulo');
const selectOpcion = document.getElementById('select_opcion');
const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const selectYear = document.getElementById("select_year");
const btn = document.getElementById('btn');
const contenedor = document.getElementById("container-tabla");
const rotulosSubgrupo = document.getElementById('rotulos-subgrupo');
const divNavSup = document.getElementById('nav_sup');
const divRefuerzo = document.getElementById('opcion-refuerzo');

const selectGrupo = document.getElementById("select_grupo");
const selectSubgrupo = document.getElementById("select_subgrupo");
const selectNum = document.getElementById('select-num');
const selectLtr = document.getElementById('select-ltr');

// WHY: las listas de fechas se almacenan como Set<string> con clave canónica
//      "YYYY-M-D" (mes 0-indexed, día 1-31). Esto permite:
//        - lookup O(1) en comprobarDia (set.has(clave))
//        - independencia del orden de pintado (antes el algoritmo dependía
//          de que los meses y días se procesaran en orden creciente porque
//          consumía con .shift())
//        - re-renderizar parcialmente sin reconstruir las listas
let setLibresYear = new Set();
let setSubgrupoYear = new Set();
let setSubComunesYear = new Set();


function rellenarDias(tabla, mes) {
    const year = currentDate.getFullYear();
    const numeroDias = getTotalDays(mes, year);
    const espacios = startDay(mes, year) - 1;
    let tipoDia;
    let fragment = document.createDocumentFragment();

    const arrayMes = getArrayMes(espacios, numeroDias);
    let diaSemana = 0;
    const sets = { libres: setLibresYear, subgrupo: setSubgrupoYear, subComunes: setSubComunesYear };
    for (const d of arrayMes) {
        if (diaSemana === 0) {
            fragment = document.createElement("tr");
        }
        const columna = document.createElement("td");

        tipoDia = comprobarDia(d, mes, year, sets, selectSubgrupo.value);

        const dia = document.createTextNode(d);
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
    const fila = document.createElement("tr");
    for (let a = 0; a < diasSemana.length; a++) {
        const cabecera = document.createElement("th");
        const d = document.createTextNode(diasSemana[a]);
        cabecera.appendChild(d);
        fila.appendChild(cabecera);
    }
    tabla.appendChild(fila);
}



/**
* Crea una tabla para cada mes
* llama a rellenar cabecera la cual rellena la cabecera de la tabla con los dias de la semana
* @param {*} contTabla contenedor div que contendra la tabla
* @param {*} nombre nombre del mes
* @param {*} numMes numero del mes
*/
function crearTabla(contTabla, nombre, numMes) {
    const tabla = document.createElement("table");
    const nombreMes = document.createElement("caption");
    const contenido = document.createTextNode(nombre);
    nombreMes.appendChild(contenido);
    tabla.appendChild(nombreMes);
    rellenarTablaCabecera(tabla);
    rellenarDias(tabla, numMes);
    contTabla.appendChild(tabla);
}


/**
 * Crea un div por cada mes 
 * llama a la función creartabla que creara una tabla dentro de cada div
 */
function crearMeses() {
    setDatos();
    const fragment = document.createDocumentFragment();
    for (let a = 1; a <= 12; a++) {
        const contTabla = document.createElement("div");
        contTabla.setAttribute("class", "div-mes");
        crearTabla(contTabla, getNombre(a), a);
        fragment.appendChild(contTabla);
    }
    document.getElementById("container-tabla").appendChild(fragment);
}


function nuevaFecha() {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
    currentDate = new Date(selectYear.value, 0, 1);
    crearMeses();
}


function setDatos() {
    const year = parseInt(selectYear.value);
    let grupo;
    if(selectOpcion.value === 'Refuerzo_Nocturno'){
        grupo = selectGrupo.value;
    } else {
        grupo = parseInt(selectGrupo.value);
    }

    const subgrupo = selectSubgrupo.value;
    const grupoDos = getGrupoDos();

    // WHY: algunas funciones de DatosFechas devuelven undefined para tipos
    //      que no aplican (ej. getDatosListaSubgrupo no maneja GruaDSM_Noche).
    //      ?? [] blinda contra eso sin tener que validar en cada caller.
    const listaLibres = getDatosListaLibres(selectOpcion.value, year, grupo, grupoDos) ?? [];
    const listaSubgrupo = getDatosListaSubgrupo(selectOpcion.value, year, grupo, subgrupo) ?? [];
    const listaSubComunes = getDatosListaSubComunes(selectOpcion.value, year, grupo, subgrupo) ?? [];

    setLibresYear = new Set(listaLibres.map(claveFecha));
    setSubgrupoYear = new Set(listaSubgrupo.map(claveFecha));
    setSubComunesYear = new Set(listaSubComunes.map(claveFecha));
}

function getGrupoDos(){
    const rdActivo = document.querySelector('input[name="opcion"]:checked');
    if(rdActivo.value === 'Num'){
        return selectNum.value;
    } else if(rdActivo.value === 'Ltr'){
        return selectLtr.value;
    }
}


function initCalendario() {
    // WHY: usamos el .text del <option> seleccionada (no el .value) porque el
    //      value es un id interno con guiones bajos ("Inspector_Noche") y a
    //      veces sin separar ("GruaDSM"); el text del <option> ya está en
    //      formato legible. Así el HTML queda como única fuente de verdad
    //      para los nombres y no duplicamos el mapeo en JS.
    titulo.textContent = selectOpcion.selectedOptions[0].text;
    //iniciar caja con opciones para refuerzo nocturno
    opcion();
    initCajaRefuerzo(selectOpcion.value, divNavSup, divRefuerzo);
    initSelectGrupo(selectOpcion.value, selectGrupo);
    //el selectGrupo.value es necesario para GruaDSM
    initSelectSubgrupo(selectOpcion.value, selectSubgrupo, selectGrupo.value);
     //el valor divNavSup es necesario para GruaDSMNoche, eliminar el select subgrupo
    initDivNavSup(selectOpcion.value, divNavSup);
    initRotulos(selectOpcion.value, rotulosSubgrupo);
    nuevaFecha();
}

function opcion(){
    const elementoActivo = document.querySelector('input[name="opcion"]:checked');
    if(elementoActivo.value === 'Num') {
        selectNum.disabled = false;
        selectLtr.disabled = true;
    } else if(elementoActivo.value === 'Ltr') {
        selectNum.disabled = true;
        selectLtr.disabled = false;
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
    poblarSelect(selectOpcion, CATEGORIAS);
    poblarSelect(selectNum, NUMEROS_REFUERZO);
    poblarSelect(selectLtr, LETRAS_REFUERZO);
}

// WHY: ventana deslizante de años (-2 atrás, +10 adelante desde el año en
//      curso) generada al cargar la página. Sustituye las <option> antes
//      hardcodeadas en el HTML; así el rango se "refresca" en cada visita y
//      el select nunca se queda corto al cambiar de año natural.
function poblarSelectYear() {
    const actual = new Date().getFullYear();
    const years = [];
    for (let y = actual - 2; y <= actual + 10; y++) years.push(y);
    poblarSelect(selectYear, years);
    selectYear.value = actual;
}

// WHY: el branding (logo + textos en hero/footer/title) se inyecta antes que
//      cualquier otra cosa visual para evitar el flash de "HTML neutro → HTML
//      con marca". El módulo @branding lo resuelve Vite a sicam.js o
//      whitelabel.js según --mode (ver vite.config.js).
applyBranding();

poblarSelectsEstaticos();
poblarSelectYear();

btn.addEventListener('click', nuevaFecha);
selectOpcion.addEventListener('change', initCalendario);
selectGrupo.addEventListener('change', () => {
    if (selectOpcion.value === 'GruaDSM') {
        initSelectSubgrupo(selectOpcion.value, selectSubgrupo, selectGrupo.value);
    }
});

document.getElementById("rdNum").addEventListener('click', opcion);
document.getElementById("rdLtr").addEventListener('click', opcion);


// WHY: initCalendario() ya cierra con nuevaFecha() internamente (vía la cadena
//      initRotulos → nuevaFecha). Llamarlo otra vez aquí provocaba un doble
//      build del DOM al cargar (flash visible).
initCalendario();

// WHY: inicializar Tom Select DESPUÉS de la primera render — para entonces
//      selectGrupo y selectSubgrupo ya están poblados, y TomSelect copia
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
[selectOpcion, selectYear, selectGrupo, selectSubgrupo, selectNum, selectLtr]
    .forEach(el => new TomSelect(el, tomConfig));
