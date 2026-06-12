# motor-calendarios

Motor de cálculo de días libres de calendarios laborales cíclicos, **extraído y aislado**
del frontend original. Es **JavaScript vanilla puro (ES modules)**: no depende del DOM, del
navegador ni de ninguna librería externa. Pensado para entregarse al backend
(Fastify/Node) e importarse tal cual.

> Documentación completa de la lógica de negocio: [`../docs/LOGICA_CALENDARIOS.md`](../docs/LOGICA_CALENDARIOS.md).

## Qué contiene (y qué NO)

Se extrajo **solo** lo necesario para calcular fechas. Se dejó fuera todo el código
exclusivo de la aplicación (DOM, selects, rótulos, tom-select, branding, CSS).

| Incluido (motor puro) | Excluido (era de la app) |
|---|---|
| `FuncionesComunes.js` — motor de iteración | `index.js` — pegamento DOM/eventos |
| `FechasFactory.js` — factoría declarativa | `InitCabecera.js` — selects y rótulos |
| `FechasConductorInspector.js` — offsets de grupo | `Constantes.js` — listas de la UI |
| `DatosFechas.js` — dispatcher (API pública) | `utils.js` — pintado de la rejilla |
| Los 10 `FechasXxx.js` — un calendario cada uno | `estilo.css`, `index.html`, `branding/` |
| `index.js` — barrel + helpers de serialización | |

**14 archivos de motor** (copia byte a byte de `src/calendarios/`, lógica intacta y
validada) + `index.js` (barrel de conveniencia).

## Cómo se importa

```js
import {
    getDatosListaLibres,
    getDatosListaSubgrupo,
    getDatosListaSubComunes,
    calcularCalendario,   // conveniencia: devuelve las 3 listas ya en "YYYY-MM-DD"
    serializarFecha,      // Date -> "YYYY-MM-DD" en hora local (sin bug UTC)
} from './motor-calendarios/index.js';
```

### Uso típico en un backend

```js
// devuelve { libres: [...], subgrupo: [...], subComunes: [...] } en "YYYY-MM-DD"
const fechas = calcularCalendario('Conductor', 2026, 1, 'A');

// o, a más bajo nivel, objetos Date crudos:
const libres = getDatosListaLibres('Conductor', 2026, 1) ?? [];
```

## API pública

| Función | Devuelve |
|---|---|
| `getDatosListaLibres(tipo, year, grupo, grupoDos?)` | `Date[]` de días libres del grupo |
| `getDatosListaSubgrupo(tipo, year, grupo, subgrupo)` | `Date[]` de días del subgrupo |
| `getDatosListaSubComunes(tipo, year, grupo, subgrupo)` | `Date[]` de días comunes |
| `calcularCalendario(tipo, year, grupo, subgrupo, grupoDos?)` | `{ libres, subgrupo, subComunes }` en `"YYYY-MM-DD"` |
| `serializarFecha(date)` | `"YYYY-MM-DD"` en hora local |

`tipo` ∈ `Conductor`, `Inspector`, `Inspector_Noche`, `Grua`, `GruaDSM`,
`GruaDSM_Noche`, `ParkingDSM_100`, `ParkingDSM_50`, `Refuerzo_Nocturno`, `Buho`.

## Reglas que NO se pueden ignorar

1. **Blindar con `?? []`**: muchas combinaciones devuelven `undefined` (un tipo que no
   maneja esa lista, p.ej. GruaDSM_Noche no tiene subgrupo). `calcularCalendario` ya lo
   hace por dentro; si usas las `getDatos*` a pelo, hazlo tú.
2. **GruaDSM**: el `subgrupo` de `getDatosListaSubgrupo` es un **número** (1–50), no letra.
3. **ParkingDSM_50**: "Subgrupo" = días de **reducción**; "SubComunes" = jornada
   **parcial** (nombres invertidos respecto a lo intuitivo).
4. **Refuerzo_Nocturno**: `grupo` es `'A'`/`'B'`; el cuarto argumento (`grupoDos`) es un
   número (1–9) o letra (A–K). No usa subgrupo de letra estándar.
5. **Zona horaria**: las fechas se comparan en **hora local**. Al pasarlas a string usa
   `serializarFecha` (o construye `YYYY-MM-DD` desde `getFullYear/getMonth/getDate`).
   **Nunca** `toISOString().slice(0,10)`: desplaza un día en España (UTC+1/+2).
6. **No reescribir `getFechaInit`** (en `FuncionesComunes.js`): es una heurística
   histórica validada contra calendarios impresos oficiales. Cambiarla rompe las fechas.

## Verificación

El motor se cruzó contra el código original de `src/calendarios/` en **2961
comprobaciones** (10 tipos × varios grupos/años/subgrupos × 3 listas): **0 diferencias**.
La lógica es idéntica. La suite oficial vive en `../tests/calendarios/` (626+ tests
validados contra calendarios impresos) y puede reapuntarse a esta carpeta como red de
seguridad al integrarlo en el backend.
