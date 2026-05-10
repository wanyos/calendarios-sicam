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

**Progreso a 2026-05-10 (segunda sesión)**: 12 hallazgos resueltos · 1 aplicado pendiente validación · 5 pendientes (más 3 que requieren fuente externa o son refactores grandes).

| Categoría | Total | ✅ | ⚠️ | ⏳ |
|---|---|---|---|---|
| Bugs críticos / latentes | 6 | 3 | 1 | 2 |
| Legibilidad / duplicación | 8 | 6 | 0 | 2 |
| Rendimiento | 3 | 1 | 0 | 2 |
| Seguridad | 1 | 1 | 0 | 0 |
| Tooling | 3 | 2 | 0 | 1 |
| **Bonus** (no en plan original) | — | 1 | 0 | 0 |

**Bonus completado**: extracción de funciones puras de `index.js` a `src/calendarios/utils.js` (8 funciones desacopladas de globales y testeables aisladamente).

**Próximo paso recomendado**: `BUG-05` (reescribir `getFechaInit` eliminando la heurística mágica) — quirúrgico, con tests de caracterización ya escritos. Después `REF-01` (factoría `crearCalendario`) con la red de tests dándonos confianza.

---

## 🔴 Bugs críticos

### `BUG-01` 🔴 — Fechas malformadas en `FechasInspectorNoche.js`

- [x] **Aplicado 2026-05-09** — valores deducidos por patrón, **pendiente validación contra calendario impreso oficial**
- **Archivo**: [src/calendarios/FechasInspectorNoche.js:18-26](src/calendarios/FechasInspectorNoche.js#L18-L26)
- **Síntoma original**: si el usuario seleccionaba **Inspector Noche → grupo 4 → subgrupo J** o **grupo 5 → subgrupo J**, el calendario arrancaba desde una fecha completamente equivocada (octubre 2023 o julio 2031 respectivamente).
- **Causa**: dos `new Date()` con argumentos truncados — faltaba la coma del día:
  ```js
  new Date(2022,21)        // mes 21 → JS rebalancea a octubre 2023
  new Date(2022,114)       // mes 114 → julio 2031
  ```
- **Valores aplicados**:
  ```js
  // grupo 4 [J]: era (2022,21) → (2022, 1, 21)  // 21 febrero 2022
  // grupo 5 [J]: era (2022,114) → (2022, 1, 14)  // 14 febrero 2022
  ```
- **Razonamiento**: el array de InspectorNoche tiene un patrón consistente "-1 día respecto a Inspector" en los otros 9 subgrupos del grupo. Los valores aplicados respetan ese patrón. Adicionalmente, la firma del typo (`(2022, 1, 21)` con coma perdida → `(2022, 21)`) refuerza la deducción.
- **🔬 ACCIÓN PENDIENTE — validación**: probar la app con **Inspector Noche grupo 4 subgrupo J año 2026** y comparar contra el calendario impreso oficial. Si las fechas coinciden, este bug se cierra definitivamente. Si no coinciden, los valores correctos deben tomarse del calendario impreso y este `BUG-01` se reabre. Mismo procedimiento para grupo 5 J.

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

- [ ] **Archivo**: [src/calendarios/FechasGruaDSM.js:22-28](src/calendarios/FechasGruaDSM.js#L22-L28)
- **Riesgo**: el `switch` solo maneja `case 2:` (+5 días) y `case 3:` (+7 días). Pero **GruaDSM tiene grupos 1-5** según [InitCabecera.js:11](src/calendarios/InitCabecera.js#L11). Para grupos 4 y 5 la fecha **no se ajusta** (devuelve la fecha del grupo 1). En cambio, `getPos` sí maneja los 5 grupos. Esa asimetría es sospechosa.
  - Es **posible** que sea correcto: que los grupos 4 y 5 *empiecen* el mismo día que el grupo 1 pero estén desfasados solo en `pos` (que indica el punto del ciclo). En ese caso es diseño correcto pero **completamente sin documentar**.
  - Es **posible** que sea bug y nadie lo haya detectado porque pocos usuarios usen GruaDSM grupos 4 o 5.
- **Fix sugerido**: validar contra la fuente externa (igual que `BUG-01`). Si es diseño intencional, añadir un comentario `// WHY: grupos 4-5 comparten fecha de inicio con grupo 1; el desfase lo aporta getPos`. Si es bug, completar el switch.

### `BUG-05` 🟠 — `getFechaInit` con matemática mágica sin documentar

- [ ] **Archivo**: [src/calendarios/FuncionesComunes.js:3-16](src/calendarios/FuncionesComunes.js#L3-L16)
- **Riesgo**: la función calcula una fecha de inicio "óptima" para iterar hasta el año pedido. Usa heurísticas opacas:
  ```js
  let mes = 12 - (parseInt(valorSecuencia) / 30);  // ¿por qué /30?
  ...
  let p_dec = parseFloat(re % 1);                  // parte decimal
  let t_dias = parseFloat((valorSecuencia * 0.01) * (1 - p_dec) * 100);  // ¿?
  ```
  - El `parseInt(valorSecuencia)` es **redundante** (ya es un número).
  - `(valorSecuencia * 0.01) * (1 - p_dec) * 100` se simplifica a `valorSecuencia * (1 - p_dec)` — los dos factores `*0.01 * 100` se cancelan.
  - La división `/30` aproxima "días por mes" — frágil con secuencias largas.
- **Por qué es ALTO y no MEDIO**: si la secuencia cambia (ej. nuevo calendario con `totalSecuencia = 350`), no hay forma fiable de saber si la heurística sigue funcionando. Riesgo de regresión silenciosa.
- **Fix sugerido**: reescribir como una función explícita: dado `fechaFin0` (la fecha conocida en `año0`) y un `año` objetivo, calcular `nFechaFin0 + k * totalSecuencia` donde `k` es el menor entero tal que `nFechaFin0 + k * totalSecuencia` cae dentro o justo antes del `año` objetivo. Eso es matemática limpia y testable. Crítico añadir tests que cubran varios años.

### `BUG-06` 🟠 — `getArrayGruaDSM` mezcla tipos number/string

- [x] **Resuelto 2026-05-10** — todos los `push` convierten a string con `String(valor)`. Comentario WHY añadido explicando el motivo.
- **Archivo**: [src/calendarios/InitCabecera.js:161-170](src/calendarios/InitCabecera.js#L161-L170)

---

## 🟡 Mejoras de legibilidad y mantenibilidad

### `REF-01` 🟡 — Patrón duplicado en 8 archivos `FechasXxx.js`

- [ ] **Archivos afectados**: `FechasBuho.js`, `FechasConductor.js`, `FechasGrua.js`, `FechasGruaDSM.js`, `FechasGruaDSMNoche.js`, `FechasInspector.js`, `FechasInspectorNoche.js`, `FechasParkingDSM100.js`, `FechasParkingDSM50.js`
- **Problema**: cada archivo repite la misma estructura:
  1. Función pública `getListaLibresXxx(year, grupo)` que define `fechaInit`, `secuenciaLibres`, `secuenciaTrabajo`, `totalSecuencia`, ajusta por grupo y delega.
  2. `getFechaInicioGrupo` con un `switch(grupo)` que aplica un offset distinto.
  3. `getPos` con otro `switch(grupo)`.
  4. Array de fechas iniciales por subgrupo.
  5. Función pública `getListaSubgrupoXxx`.
  6. `getFechaSubgrupoYYYY` / `getNumeroSubgrupo` / `getPosSecuencia` con switches casi idénticos.
- **Coste actual**: si se descubre un bug en uno de los patrones, hay que aplicar el fix en N sitios. Si se quiere añadir un calendario nuevo, hay que copiar-pegar y modificar. Mucha superficie para errores.
- **Fix sugerido**: una **factoría declarativa**:
  ```js
  // FechasFactory.js
  export function crearCalendario({ fechaInicial, secuenciaLibres, secuenciaTrabajo, totalSecuencia, offsetsPorGrupo, posPorGrupo, subgrupos, ... }) {
    return {
      getListaLibres: (year, grupo) => { ... },
      getListaSubgrupo: (year, grupo, subgrupo) => { ... },
      ...
    };
  }
  // FechasConductor.js queda en una decena de líneas:
  export const calConductor = crearCalendario({
    fechaInicial: new Date(2020, 0, 1),
    secuenciaLibres: [2, 3, 2, 3],
    ...
  });
  ```
  Reduce ~70% de LOC de este directorio y centraliza el cambio de bugs.
- **Cuidado**: este refactor es invasivo. Hacer **después** de `TOOL-02` (tests), porque sin tests no hay manera segura de garantizar equivalencia funcional.

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

- [ ] **Archivo**: [src/index.js](src/index.js)
- **Problema**: variables mezclan `camelCase` (`tipoCalendario`, `arrayMes`) con `snake_case` (`select_grupo`, `num_dia`, `cont_tabla`).
- **Fix sugerido**: estandarizar a `camelCase` en JS (convención del lenguaje). No es urgente — es un refactor mecánico que puede esperar.

### `REF-08` 🟡 — Acoplamiento DOM frágil en `initRotulos`

- [x] **Resuelto 2026-05-10** — añadido `data-rol="libre|subgrupo|sub1|sub2"` a los `<h4>` en `index.html`. `initRotulos` busca por `querySelector('[data-rol="..."]')` en vez de navegar por `firstElementChild` / `nextElementSibling`. La variable `libre` se eliminó porque nunca cambia su visibilidad (siempre visible) — vive en el HTML por coherencia visual y se gestiona vía CSS estático.
- **Archivos**: [src/index.html](src/index.html#L83-L92), [src/calendarios/InitCabecera.js:49-58](src/calendarios/InitCabecera.js#L49-L58)

---

## ⚡ Rendimiento

### `PERF-01` 🟡 — Creación masiva de `Date` en bucles

- [ ] **Archivos**: [FuncionesComunes.js:29,32,49,66](src/calendarios/FuncionesComunes.js#L29)
  ```js
  fechaInit = new Date(fechaInit.getFullYear(), fechaInit.getMonth(), fechaInit.getDate() + 1);
  ```
- **Problema**: cada iteración del bucle crea un nuevo objeto `Date` con 3 lookups (`getFullYear`, `getMonth`, `getDate`). Para un año = ~365 iteraciones por calendario, multiplicado por 3 listas (libres, subgrupo, comunes) = ~1000+ objetos `Date` creados por carga.
- **Coste actual**: en hardware moderno son ~5-15ms. Imperceptible. Pero es un patrón que escala mal.
- **Fix sugerido**: mutar el mismo `Date`:
  ```js
  fechaInit.setDate(fechaInit.getDate() + 1);
  // o:
  fechaInit.setTime(fechaInit.getTime() + 86400000);
  ```
  Reduce GC pressure y simplifica el código.
  - **OJO**: si las fechas se almacenan en un array (`lista.push(fechaInit)`) y luego se mutan, el array entero apunta al mismo Date final → **bug**. Hay que **clonar al push**: `lista.push(new Date(fechaInit))`. Esto es un refactor con riesgo, no urgente.

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
| 5 | `BUG-01` fechas malformadas (⚠️ pendiente validación) | `f522151` |
| 6 | `TOOL-02` Vitest + suite completa de smoke tests | `553c83e` + `ccf0c90` |
| 7 | `BUG-03` `comprobarDia` con Set + `BONUS-01` extracción a `utils.js` + tests del núcleo | `9bb920c` |
| 8 | `PERF-03` doble `getDay()` (de paso con la extracción) | `9bb920c` |
| 9 | `SEC-01` revisado (sin riesgos) | revisión inicial |
| 10 | `BUG-06` tipos string en `getArrayGruaDSM` | (sin commitear todavía) |
| 11 | `REF-02` helper `letraAIndice` compartido | (sin commitear todavía) |
| 12 | `REF-06` comentario corregido en `FechasBuho.js` | (sin commitear todavía) |
| 13 | `REF-08` `data-rol` para `initRotulos` | (sin commitear todavía) |

### ⏳ Pendiente

Orden recomendado (refactores quirúrgicos primero, cosmético al final):

| # | Tarea | Beneficio | Riesgo | Estimado |
|---|---|---|---|---|
| 1 | `BUG-05` reescribir `getFechaInit` (eliminar magia) | Núcleo entendible | Medio | 30 min (con tests) |
| 2 | **`REF-01`** factoría `crearCalendario` | **Refactor mayor (~600 LOC menos)** | Medio (con tests) | 1-2 sesiones |
| 3 | `PERF-01` mutar Date en bucles de `FuncionesComunes` | Marginal | Medio | 20 min |
| 4 | `REF-07` naming uniforme camelCase | Cosmético | Nulo | 15 min |
| 5 | `BUG-04` documentar/fix GruaDSM grupos 4-5 | Aclarar diseño | Medio (validación externa) | requiere fuente |
| 6 | `BUG-01` validación oficial Inspector_Noche J | Cierre del bug | — | requiere calendario impreso |
| 7 | `PERF-02` cachear celdas DOM | Render más rápido | Medio | 1 sesión |
| 8 | `TOOL-03` TypeScript con JSDoc gradual | Tipos sin migración | Bajo | varias sesiones |

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
- **Bugs críticos abiertos**: 0 · **bugs latentes pendientes**: 2 (`BUG-04`, `BUG-05`)

## Apéndice — Lo que NO he revisado en esta pasada

- `index.html` y `estilo.css` (fuera del alcance pedido — son la vista, no la lógica de fechas).
- `package.json` / `vite.config.js` (configuración de build).
- `FechasGruaDSM.js` arrays de fechas: posibles errores tipo `BUG-01` que requieren validación contra fuente externa.
- Compatibilidad navegador / `.browserslistrc`.

Si quieres extender el análisis a esos puntos, lo añadimos a este mismo documento en una segunda pasada.
