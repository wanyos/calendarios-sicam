// WHY: separamos datos estáticos de la vista. Mantener listas en JS (en
//      lugar de hardcodearlas en index.html) facilita renombrar etiquetas,
//      añadir/quitar categorías y reutilizar las mismas listas si en el
//      futuro hay más selects o validaciones que las necesiten.
//
// Estructura mixta intencionada:
//   - CATEGORIAS usa { value, text } porque el value es un id interno
//     (con guiones bajos, "Inspector_Noche") y el text es lo que ve el
//     usuario ("Inspector Noche"). El helper de poblado en index.js
//     detecta el formato.
//   - NUMEROS_REFUERZO y LETRAS_REFUERZO van como arrays simples porque
//     value y text coinciden — envolverlos en { value, text } sería ruido.

export const CATEGORIAS = [
    { value: 'Conductor',         text: 'Conductor' },
    { value: 'Inspector',         text: 'Inspector' },
    { value: 'Inspector_Noche',   text: 'Inspector Noche' },
    { value: 'Grua',              text: 'Grua Asistencia Calle' },
    { value: 'GruaDSM',           text: 'Grua DM' },
    { value: 'GruaDSM_Noche',     text: 'Grua DM Noche' },
    { value: 'ParkingDSM_100',    text: 'Parking DM 100%' },
    { value: 'ParkingDSM_50',     text: 'Parking DM 50%' },
    { value: 'Refuerzo_Nocturno', text: 'Refuerzo Nocturno' },
    { value: 'Buho',              text: 'Buho' },
];

export const NUMEROS_REFUERZO = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const LETRAS_REFUERZO = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
