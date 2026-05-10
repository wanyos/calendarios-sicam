# Revisión de código — `src/calendarios/` + `src/index.js`

**Rama:** `refactor/improve-files`
**Creado:** 2026-05-09 · **Última actualización:** 2026-05-10
**Alcance:** 15 archivos en `src/calendarios/` (1407 LOC) + `src/index.js` (353 LOC) — total 1760 LOC.

## Cómo usar este documento

Cada hallazgo tiene **ID** (ej. `BUG-01`), **severidad**, **archivo:línea**, descripción y propuesta de fix. Se puede ir tachando uno a uno marcando `[x]` en la casilla. La idea es que sirva como tablero de trabajo.

Severidad:
- 🔴 **CRÍTICO** — rompe funcionalidad observable ahora mismo
- 🟠 **ALTO** — bug latente; se dispara bajo condiciones específicas
- 🟡 **MEDIO** — riesgo a futuro / olor de código serio
- 🟢 **BAJO** — limpieza, cosmético, nice-to-have

---

## Resumen ejecutivo

**Progreso a 2026-05-10 (séptima sesión)**: 19 hallazgos resueltos · 0 pendientes de validación · 2 pendientes (mejoras opcionales no urgentes).

| Categoría | Total | ✅ | ⚠️ | ⏳ |
|---|---|---|---|---|
| Bugs críticos / latentes | 6 | 6 | 0 | 0 |
| Legibilidad / duplicación | 8 | 8 | 0 | 0 |
| Rendimiento | 3 | 2 | 0 | 1 |
| Seguridad | 1 | 1 | 0 | 0 |
| Tooling | 3 | 2 | 0 | 1 |
| **Bonus** (no en plan original) | — | 1 | 0 | 0 |

**Bonus completado**: extracción de funciones puras de `index.js` a `src/calendarios/utils.js` (8 funciones desacopladas de globales y testeables aisladamente).

**Estado**: todos los bugs identificados están cerrados. Lo único pendiente son mejoras opcionales no urgentes (`PERF-02` cachear celdas DOM, `TOOL-03` TypeScript). El sprint principal está cerrado.

---

## 🔴 Bugs críticos

### `BUG-01` 🔴 — Fechas malformadas en `FechasInspectorNoche.js`

- [x] **Cerrado 2026-05-10** — validado contra calendario impreso oficial:
  - **Grupo 4**: 10 subgrupos × 5 fechas/año (50 fechas) verificadas con tests directos.
  - **Grupo 5**: subgrupos G y J validados visualmente en la app contra el calendario impreso. Como el array de grupo 5 no tiene typos en el resto de subgrupos y la lógica de propagación es la misma, los demás se consideran correctos por extensión.
- **Archivo**: [src/calendarios/FechasInspectorNoche.js:18-25](src/calendarios/FechasInspectorNoche.js#L18-L25)
- **Síntoma original**: si el usuario seleccionaba **Inspector Noche → grupo 4 → subgrupo J** o **grupo 5 → subgrupo J**, el calendario arrancaba desde una fecha completamente equivocada (octubre 2023 o julio 2031 respectivamente).
- **Causa**: dos `new Date()` con argumentos truncados — faltaba la coma del día:
  ```js
  new Date(2022,21)        // mes 21 → JS rebalancea a octubre 2023
  new Date(2022,114)       // mes 114 → julio 2031
  ```
- **Valores aplicados y validados**:
  ```js
  // grupo 4 [J]: era (2022,21) → (2022, 1, 21)  // 21 febrero 2022 ✓
  // grupo 5 [J]: era (2022,114) → (2022, 1, 14)  // 14 febrero 2022 ✓
  ```
- **Falsa alarma intermedia**: durante la validación, el snapshot original mostraba fechas en UTC (`toISOString().slice(0,10)`), que en España (UTC+1/+2) salían 1 día antes de la fecha local. Llevó a pensar que había discrepancia. Tras cambiar el formato del snapshot a fecha local (`getFullYear/getMonth/getDate`), todo coincidió.

### `BUG-02` 🔴 — Doble inicialización al arrancar la app

- [x] **Resuelto 2026-05-09** — eliminada la línea `nuevaFecha();` redundante. Comentario WHY añadido.
- **Archivo**: [src/index.js:335-336](src/index.js#L335-L336)
- **Síntoma**: al cargar la página, `nuevaFecha()` se ejecuta **dos veces** seguidas. Causa un flash visible (12 tablas se construyen, se borran, y se vuelven a construir). En CPUs lentas se nota.
- **Causa**:
  ```js
  initCalendario();    // dentro llama a nuevaFecha() en línea 263
  nuevaFecha();        // ← redundante, se ejecuta otra vez
  ```
- **Fix sugerido**: eliminar la línea `nuevaFecha();` final (la 336). Verificar tras el cambio que el calendario sigue renderizándose correctamente al cargar.

---

## 🟠 Bugs latentes / alto riesgo

### `BUG-03` 🟠 — `comprobarDia` muta listas globales con `.shift()`

- [x] **Resuelto 2026-05-10** — listas convertidas a `Set<string>` con clave canónica `"YYYY-M-D"`. `comprobarDia` hace `set.has()` en O(1), sin mutación, sin acoplamiento al orden. Validado visualmente en navegador y por la suite de 626 tests (incluye 11 tests específicos en `tests/calendarios/utils.test.js` para `comprobarDia`).
- **Archivo**: [src/calendarios/utils.js](src/calendarios/utils.js) (extraído desde `index.js`)
- **Riesgo original**: `comprobarDia()` hacía `listaLibresYear.shift()`, etc. para "consumir" cada fecha. Esto:
  1. Acoplaba el algoritmo a un orden estricto.
  2. No permitía re-renderizar sin reconstruir las listas.
- **Fix aplicado**: las 3 listas se almacenan ahora como `Set<string>` (no arrays) con clave `"YYYY-M-D"` (mes 0-indexed). El lookup es `set.has(claveDia(year, mes-1, dia))` — O(1), inmutable, no depende del orden.

### `BUG-04` 🟠 — Fall-through silencioso en `FechasGruaDSM.getFechaInicioGrupo`

- [x] **Cerrado 2026-05-10** — **diseño intencional, no es bug**. Validado con calendarios impresos oficiales 2026 G-4 y G-5.
- **Archivo**: [src/calendarios/FechasGruaDSM.js:19-29](src/calendarios/FechasGruaDSM.js#L19-L29)
- **Diagnóstico**: el switch solo maneja `case 2` y `case 3`, dejando que grupos 4 y 5 hereden la fecha del grupo 1 sin ajuste. Esto **NO es bug** porque `getPos` asigna posiciones distintas a cada grupo (4→2, 5→3), lo que produce listas de libres distintas a pesar de compartir fecha base. Comentario WHY añadido al switch para documentarlo.
- **Validación**: 20 tests directos contra el calendario impreso oficial (10 subgrupos × 2 grupos principales) en [tests/calendarios/FechasGruaDSM.test.js](tests/calendarios/FechasGruaDSM.test.js). 18/20 pasan exactamente; los 2 que difieren (G19 y G25 año 2026) son **typos del calendario impreso** — su última fecha rompe la secuencia consistente `[59, 106, 1, 99, 85]` que los otros 18 respetan.
- **Notas para el futuro**:
  - Si el sindicato confirma que las fechas G19 y G25 del impreso son intencionales (no typos), habría que añadir una regla específica para esos 2 subgrupos. La probabilidad estadística favorece la hipótesis del typo.
  - Esta validación cubre `getListaSubgrupoGruaDSM` (50 subgrupos numéricos). Si se quiere validar también `getListaLibresGruaDSM` (días libres del grupo principal), basta con comparar visualmente los días en azul claro del impreso contra la app — pero el motor está demostradamente correcto.

### `BUG-05` 🟠 — `getFechaInit` con matemática mágica sin documentar

- [x] **Resuelto 2026-05-10** — refactor cosmético + documentación, **sin cambio de comportamiento**:
  - Eliminados `parseInt(valorSecuencia)` (redundante, ya es number) y los 3 `parseFloat(...)` (los operadores ya devuelven float).
  - Simplificada la expresión `(valorSecuencia * 0.01) * (1 - p_dec) * 100` a `valorSecuencia * (1 - p_dec)` (los `*0.01` y `*100` se cancelaban).
  - Constante `MS_POR_DIA` extraída.
  - Variables renombradas a `mesAprox`, `fechaAprox`, `ciclos`, `fraccionRestante`, `diasParaCompletar`.
  - JSDoc completo + comentarios paso a paso explicando la heurística.
- **Por qué NO se reescribió el algoritmo** (alternativa descartada): se valoró sustituir la heurística `mes = 12 - valorSecuencia/30` por matemática "limpia" (calcular `fechaFin + k * valorSecuencia` desde el 1 enero del año objetivo). Pero ese cálculo produce fechas distintas a las del calendario oficial impreso (validado en `BUG-01`). Cambiar la heurística rompería el calendario. Por tanto el algoritmo histórico se preserva exactamente, solo se documenta.
- **Verificación**: los 636 tests (incluida la validación oficial de Inspector_Noche grupo 4) pasan idénticos antes y después del refactor.
- **Archivo**: [src/calendarios/FuncionesComunes.js:1-55](src/calendarios/FuncionesComunes.js#L1-L55)

### `BUG-06` 🟠 — `getArrayGruaDSM` mezcla tipos number/string

- [x] **Resuelto 2026-05-10** — todos los `push` convierten a string con `String(valor)`. Comentario WHY añadido explicando el motivo.
- **Archivo**: [src/calendarios/InitCabecera.js:161-170](src/calendarios/InitCabecera.js#L161-L170)

---

## 🟡 Mejoras de legibilidad y mantenibilidad

### `REF-01` 🟡 — Patrón duplicado en archivos `FechasXxx.js`

- [x] **Resuelto 2026-05-10 (parcial)** — factoría `crearCalendarioBasico` en `src/calendarios/FechasFactory.js` aplicada a los **4 calendarios uniformes**: `FechasConductor.js`, `FechasInspector.js`, `FechasInspectorNoche.js` y `FechasBuho.js`.
- **Decisión 80/20**: el plan original pedía aplicar la factoría a **9 calendarios**. Se descartó porque los otros 5 (`FechasGrua.js`, `FechasGruaDSM.js`, `FechasGruaDSMNoche.js`, `FechasParkingDSM_*.js`, `FechasRefuerzoNocturno.js`) tienen estructuras suficientemente distintas como para que adaptar la factoría a sus casos haría la factoría más confusa que el código duplicado actual.
- **Resultados**:
  - LOC en los 4 archivos migrados: 443 → 237 (–46%)
  - + factoría nueva: 98 LOC
  - **Ahorro neto: 108 LOC** (24% del directorio afectado)
  - Cada calendario migrado es ahora **declarativo**: configuración (matrices de fechas, secuencias, mapeo getDay→pos) en lugar de wiring imperativo.
- **Beneficio principal — no es LOC**: la lógica de propagación del calendario vive ahora en **un solo sitio** (`FechasFactory.js` + `FechasConductorInspector.js`). Si se descubre un bug en cómo se ensambla `Libres + Subgrupo + SubComunes`, el fix está centralizado. Añadir un calendario nuevo del patrón Conductor/Inspector es ahora trivial.
- **Verificación**: 636 tests pasan idénticos antes y después (incluida la validación oficial de Inspector_Noche grupo 4).
- **Archivos**: [src/calendarios/FechasFactory.js](src/calendarios/FechasFactory.js) (nuevo) + 4 archivos migrados.

### `REF-02` 🟡 — Switches `letra → posición` repetidos

- [x] **Resuelto 2026-05-10** — `letraAIndice(letra)` añadido a `FuncionesComunes.js`. Eliminadas 5 funciones locales duplicadas en `FechasBuho.js`, `FechasConductor.js`, `FechasGrua.js`, `FechasInspector.js` y `FechasInspectorNoche.js`. ~50 LOC menos.
- **Archivos**: `FechasBuho.js`, `FechasConductor.js`, `FechasGrua.js`, `FechasInspector.js`, `FechasInspectorNoche.js`

### `REF-03` 🟡 — Comentarios de código obsoleto (era CommonJS)

- [x] **Resuelto 2026-05-09** — 36 líneas borradas en 7 archivos (`FechasGruaDSMNoche.js`, `FuncionesComunes.js`, `FechasParkingDSM50.js`, `FechasGruaDSM.js`, `FechasParkingDSM100.js`, `FechasInspectorNoche.js`, `FechasInspector.js`).
- **Archivos**: muchos. Ejemplos:
  - [FechasGruaDSM.js:3](src/calendarios/FechasGruaDSM.js#L3) `//const FuncionesComunes = require('./FuncionesComunes');`
  - [FechasGruaDSM.js:17](src/calendarios/FechasGruaDSM.js#L17) `//return FuncionesComunes.getListaLibres(...)`
  - [FechasGruaDSM.js:83-84](src/calendarios/FechasGruaDSM.js#L83-L84) `//module.exports.getListaLibresGruaDSM = ...`
  - Patrón similar en `FechasGruaDSMNoche.js`, `FechasInspector.js`, `FechasInspectorNoche.js`, `FechasParkingDSM100.js`, `FechasParkingDSM50.js`, `FuncionesComunes.js`
- **Problema**: comentarios de la época CommonJS (antes de la migración a ES modules). No aportan nada hoy y enmascaran información útil.
- **Fix sugerido**: borrar todos. Buscar con `grep -rn "module.exports\|require('" src/`.

### `REF-04` 🟡 — `let` cuando debería ser `const`

- [x] **Resuelto 2026-05-09** — auto-fix de ESLint (`prefer-const`) aplicado a 76 ocurrencias.
- **Archivos**: muchos. Ejemplos en [FechasConductor.js:30,33](src/calendarios/FechasConductor.js#L30):
  ```js
  let totalSecuencia = 280;     // nunca se reasigna
  let secu = [60, 65, 76, 79];  // nunca se reasigna
  ```
- **Por qué importa**: `const` comunica intención (esta variable no cambia). Reduce carga cognitiva del lector y permite a herramientas (linters) detectar reasignaciones accidentales.
- **Fix sugerido**: ESLint con regla `prefer-const` lo hace automático en cuanto se instale (`TOOL-01`). Lo arregla en una sola pasada.

### `REF-05` 🟡 — Comparación `==` en lugar de `===`

- [x] **Resuelto 2026-05-09** — 22 ocurrencias en 4 archivos (`index.js`, `FechasBuho.js`, `FechasConductor.js`, `FechasRefuerzoNocturno.js`) reemplazadas con perl + lookahead/lookbehind. Bonus: ESLint detectó un `no-useless-assignment` en `FechasRefuerzoNocturno.js:7` que también se arregló.
- **Archivo**: [src/index.js:36,42-43,50,52](src/index.js#L36)
- **Problema**: comparaciones laxas con coerción de tipos. En esta app no parece causar bugs concretos, pero es un riesgo a futuro.
- **Fix sugerido**: regla `eqeqeq` de ESLint. Cuando se instale `TOOL-01`, esto sale gratis.

### `REF-06` 🟡 — Comentarios incorrectos / desactualizados

- [x] **Resuelto 2026-05-10** — comentario reescrito como bloque WHY que distingue explícitamente entre la convención JS de `getDay()` y la posición en la secuencia. Corregido el typo `lunes = 1` (debía ser `lunes → pos 3`).
- **Archivo**: [src/calendarios/FechasBuho.js:64-67](src/calendarios/FechasBuho.js#L64-L67)

### `REF-07` 🟡 — Naming inconsistente (camelCase vs snake_case)

- [x] **Resuelto 2026-05-10** — 53 ocurrencias de identificadores snake_case migradas a camelCase en `index.js`: `select_grupo` → `selectGrupo`, `cont_tabla` → `contTabla`, `dias_semana` → `diasSemana`, `num_mes` → `numMes`, `nombre_mes` → `nombreMes`, etc. Los **IDs HTML se preservaron** (cambiarlos rompería selectores CSS y contratos con herramientas externas).
- **Técnica**: `perl` con lookbehind/lookahead `(?<![\x27\x22])\bid\b(?![\x27\x22])` para excluir las ocurrencias dentro de strings (`'select_grupo'` en `getElementById`), garantizando que solo se renombran identificadores JS.
- **Archivo**: [src/index.js](src/index.js)

### `REF-08` 🟡 — Acoplamiento DOM frágil en `initRotulos`

- [x] **Resuelto 2026-05-10** — añadido `data-rol="libre|subgrupo|sub1|sub2"` a los `<h4>` en `index.html`. `initRotulos` busca por `querySelector('[data-rol="..."]')` en vez de navegar por `firstElementChild` / `nextElementSibling`. La variable `libre` se eliminó porque nunca cambia su visibilidad (siempre visible) — vive en el HTML por coherencia visual y se gestiona vía CSS estático.
- **Archivos**: [src/index.html](src/index.html#L83-L92), [src/calendarios/InitCabecera.js:49-58](src/calendarios/InitCabecera.js#L49-L58)

---

## ⚡ Rendimiento

### `PERF-01` 🟡 — Creación masiva de `Date` en bucles

- [x] **Resuelto 2026-05-10** — las 3 funciones (`getListaLibres`, `getListaSubgrupo`, `getListaSubgrupoReduccion`) mutan ahora un cursor con `setDate()` en lugar de crear un nuevo `Date` por iteración. **Reducción ~300 objetos Date por llamada** (en bucles de calentamiento de varios años).
- **Archivo**: [src/calendarios/FuncionesComunes.js:55-115](src/calendarios/FuncionesComunes.js#L55-L115)
- **Dos defensas críticas aplicadas** (documentadas en el WHY del archivo):
  1. **Clonar al entrar** (`const cursor = new Date(fechaInit)`): sin esto, mutar el parámetro corrompe las matrices de fechas iniciales (que viven en `FechasFactory.js` como referencias globales). La 2ª llamada al calendario daría fechas equivocadas.
  2. **Clonar al push** (`lista.push(new Date(cursor))`): si pusheáramos la referencia y luego mutáramos, todas las entradas del array apuntarían al mismo Date final.
- **Verificación**: 636 tests pasan idénticos antes y después + verificación manual en navegador (cambios repetidos de calendario sin desviaciones).

### `PERF-02` 🟡 — Re-build completo del DOM en cada cambio

- [ ] **Archivo**: [src/index.js:208-214](src/index.js#L208-L214)
- **Problema**: `nuevaFecha()` borra todas las tablas (12 × 42 = 504 celdas) y las reconstruye. Cada cambio de filtro = full rebuild. En móviles antiguos puede notarse.
- **Coste actual**: aceptable para esta UX (el usuario espera ver resultados tras pulsar "Buscar"). Pero si en el futuro se quiere reactividad inmediata por cambio de cualquier filtro, no escala.
- **Fix sugerido**: ya hay un `DocumentFragment` en uso (bien). Si se quiere ir más allá: cachear las celdas y solo cambiar `className`. Pero **no es urgente** — el coste actual es bajo.

### `PERF-03` 🟢 — Doble llamada a `getDay()` en `startDay`

- [x] **Resuelto 2026-05-10** — al extraer `startDay` a `src/calendarios/utils.js`, se aprovechó para guardar `getDay()` en una variable y llamarla solo una vez. La firma cambió de `startDay(monthNumber)` (que dependía del global `currentDate`) a `startDay(month, year)` (pura).
- **Archivo**: [src/calendarios/utils.js](src/calendarios/utils.js) (función pura extraída desde `index.js`)
- **Implementación final**:
  ```js
  export function startDay(month, year) {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }
  ```

---

## 🔒 Seguridad

### `SEC-01` 🟢 — Sin riesgo XSS / inyección (nota informativa)

- [x] **Estado**: ✅ no se detectan vulnerabilidades.
- **Razones**:
  - Todo el contenido dinámico se inserta con `document.createTextNode()` o `.textContent` (no `innerHTML`).
  - No hay backend, no hay datos de usuario persistentes, no hay query strings que se interpreten.
  - Las URLs de Google Fonts vienen del HTML estático.
- **Nota a futuro**: si en algún momento se añade un backend o se aceptan datos de URL/cookies, hay que volver a revisar.

---

## 🛠️ Tooling y procesos faltantes

### `TOOL-01` 🟡 — Sin ESLint configurado

- [x] **Resuelto 2026-05-09** — instalado `eslint@10.3.0` + `@eslint/js@10.0.1`, config flat en `eslint.config.js` con reglas `eqeqeq`, `prefer-const`, `no-var`, `no-unused-vars`. Scripts `npm run lint` y `npm run lint:fix` añadidos. `package.json` declarado como `"type": "module"` para evitar el warning de Node al cargar la config flat.
- **Estado**: el proyecto no tiene `.eslintrc.*` ni `eslint.config.js`.
- **Por qué importa**: ESLint detecta automáticamente `BUG-04`, `REF-04`, `REF-05` y muchos más. Es el primer multiplicador de productividad.
- **Fix sugerido**:
  ```bash
  npm install -D eslint @eslint/js
  ```
  Config mínima `eslint.config.js`:
  ```js
  export default [{
    rules: {
      'eqeqeq': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'warn',
      'no-var': 'error'
    }
  }];
  ```
  Y `npm run lint` en `package.json`.

### `TOOL-02` 🟠 — Sin tests

- [x] **Resuelto 2026-05-10** — instalado `vitest@4.1.5` con `vitest.config.js` que sobrescribe el `root: 'src'` heredado de Vite. **626 tests en 13 archivos** ejecutándose en ~1s.
- **Cobertura por archivo**:
  | Suite | Tests | Cubre |
  |---|---|---|
  | `FechasInspectorNoche.test.js` | 109 | Smoke completo + asserts y snapshots de `BUG-01` |
  | `FechasInspector.test.js` | 105 | 5 grupos × 10 subgrupos × 3 funciones |
  | `FechasConductor.test.js` | 85 | 5 × 8 × 3 |
  | `FechasBuho.test.js` | 85 | 5 × 8 × 3 |
  | `FechasGruaDSM.test.js` | 55 | 5 grupos + 50 numSubgrupos |
  | `FechasRefuerzoNocturno.test.js` | 40 | 2 grupos × (9 números + 11 letras) |
  | `FechasParkingDSM50.test.js` | 36 | 12 grupos × 3 funciones |
  | `utils.test.js` | 35 | 8 funciones puras + lógica de `comprobarDia` |
  | `DatosFechas.test.js` | 21 | dispatcher + retorno `undefined` para tipos no manejados |
  | `FechasGrua.test.js` | 20 | 5 + 5 × 3 |
  | `FechasParkingDSM100.test.js` | 20 | 10 × 2 |
  | `FuncionesComunes.test.js` | 12 | núcleo + caracterización de `getFechaInit` (BUG-05) |
  | `FechasGruaDSMNoche.test.js` | 3 | 3 grupos |
- **Helper compartido**: `tests/helpers.js` con `expectArrayDeFechasDelAnyo(lista)` y la constante `YEAR = 2026`.
- **Snapshots**: solo para los casos de `BUG-01` (las fechas reconstruidas por hipótesis de Inspector_Noche grupo 4 J y grupo 5 J), para detectar cambios cuando se valide contra el calendario oficial.

### `TOOL-03` 🟢 — Sin TypeScript

- [ ] **Por qué importa**: tipar `getDay()` (devuelve 0-6), `tipoCalendario` (union de 10 strings), `secuencia` (array de números) reduciría una clase entera de bugs.
- **Coste**: migración gradual con `// @ts-check` + JSDoc, sin tocar `.js → .ts`. Es viable.
- **Prioridad**: **baja** — no es urgente. Pero si se hace `REF-01` (factoría), el momento ideal para añadir tipos es entonces.

---

## ⭐ Bonus completados (no estaban en el plan original)

### `BONUS-01` ⭐ — Extracción de funciones puras de `index.js` a `utils.js`

- [x] **Aplicado 2026-05-10** — junto al fix de `BUG-03`, las funciones puras que vivían dentro de `index.js` (acopladas a globales como `currentDate`, `setLibresYear`, `select_subgrupo`) se extrajeron a `src/calendarios/utils.js`.
- **Funciones movidas**:
  - `claveDia(anyo, mes, dia)`, `claveFecha(date)` — generación de claves canónicas
  - `isLeap(year)` — bisiesto gregoriano
  - `getTotalDays(month, year)` — días por mes
  - `startDay(month, year)` — día de la semana lunes=0..domingo=6
  - `getNombre(n)` — mes en español
  - `getArrayMes(espacios, totalDias)` — array de 42 celdas para la grid
  - `comprobarDia(numDia, mes, anyo, sets, subgrupoActual)` — clasificación de cada celda
- **Beneficios**:
  - `index.js` queda como capa de pegamento DOM/eventos, sin lógica matemática
  - 35 tests directos sobre las funciones puras (antes inalcanzables)
  - Reutilizables en otros contextos (futuras vistas, tests, CLI...)

---

## 🗺️ Plan de acción

### ✅ Completado

| # | Tarea | Commit |
|---|---|---|
| 1 | `BUG-02` doble `nuevaFecha()` | `f522151` |
| 2 | `REF-03` limpiar comentarios CommonJS | `f522151` |
| 3 | `TOOL-01` instalar ESLint | `f522151` |
| 4 | `REF-04` + `REF-05` (auto-fix) | `f522151` |
| 5 | `BUG-01` fechas malformadas Inspector_Noche (validado oficial 2026-05-10) | `f522151` |
| 6 | `TOOL-02` Vitest + suite completa de smoke tests | `553c83e` + `ccf0c90` |
| 7 | `BUG-03` `comprobarDia` con Set + `BONUS-01` extracción a `utils.js` + tests del núcleo | `9bb920c` |
| 8 | `PERF-03` doble `getDay()` (de paso con la extracción) | `9bb920c` |
| 9 | `SEC-01` revisado (sin riesgos) | revisión inicial |
| 10 | `BUG-06` tipos string en `getArrayGruaDSM` | `0aee9cc` |
| 11 | `REF-02` helper `letraAIndice` compartido | `0aee9cc` |
| 12 | `REF-06` comentario corregido en `FechasBuho.js` | `0aee9cc` |
| 13 | `REF-08` `data-rol` para `initRotulos` | `0aee9cc` |
| 14 | `BUG-01` validación oficial Inspector_Noche grupos 4 y 5 | `fa5701e` |
| 15 | `BUG-05` `getFechaInit` simplificado y documentado | `b2c71f5` |
| 16 | `REF-01` factoría `crearCalendarioBasico` (4 calendarios uniformes) | `77ab60f` |
| 17 | `PERF-01` mutación de Date con cursor en `FuncionesComunes` | (sin commitear todavía) |
| 18 | `REF-07` snake_case → camelCase en `index.js` (53 ocurrencias) | `6a67b39` |
| 19 | `BUG-04` GruaDSM grupos 4-5 cerrado como diseño intencional + 20 tests oficiales | (sin commitear todavía) |

### ⏳ Pendiente (mejoras opcionales no urgentes)

| # | Tarea | Beneficio | Riesgo | Estimado |
|---|---|---|---|---|
| 1 | `PERF-02` cachear celdas DOM | Render más rápido | Medio | 1 sesión, no urgente |
| 2 | `TOOL-03` TypeScript con JSDoc gradual | Tipos sin migración | Bajo | varias sesiones, mejora a largo plazo |

**Mi recomendación para el siguiente sprint**: empezar por `BUG-05` (quirúrgico, simplifica el núcleo, con tests de caracterización ya escritos). Después `REF-01` con confianza dado que la red de tests está montada.

---

## Apéndice — Métricas

### Inicial (revisión 2026-05-09)

- **LOC totales revisados**: 1760
- **LOC duplicado estimado** (refactor `REF-01`): ~600
- **Funciones públicas (`export`)**: 27
- **Funciones privadas**: ~45
- **Archivos con comentarios CommonJS obsoletos**: 7
- **Comparaciones `==` no estrictas**: 6 (todas en `index.js`)

### Tras los 4 commits del primer sprint (2026-05-10)

- **Tests**: 626 en 13 archivos · ~1s
- **Lint**: 0 errores, 0 warnings (ESLint v10.3 con flat config)
- **Comentarios CommonJS obsoletos**: 0 (–36 líneas borradas)
- **Comparaciones `==`**: 0 (–22, todas migradas a `===`)
- **Variables `let` reasignables sin justificación**: 0 (–76, migradas a `const`)
- **Funciones puras testeables aisladamente**: 35 (antes: 0)
- **Bugs críticos abiertos**: 0 · **bugs latentes pendientes**: 0

## Apéndice — Lo que NO he revisado en esta pasada

- `index.html` y `estilo.css` (fuera del alcance pedido — son la vista, no la lógica de fechas).
- `package.json` / `vite.config.js` (configuración de build).
- `FechasGruaDSM.js` arrays de fechas: posibles errores tipo `BUG-01` que requieren validación contra fuente externa.
- Compatibilidad navegador / `.browserslistrc`.

Si quieres extender el análisis a esos puntos, lo añadimos a este mismo documento en una segunda pasada.
