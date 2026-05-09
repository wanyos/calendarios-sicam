# Revisión de código — `src/calendarios/` + `src/index.js`

**Rama:** `refactor/improve-files`
**Fecha:** 2026-05-09
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

| Categoría | Hallazgos | Más urgente |
|---|---|---|
| Bugs críticos | 2 | `BUG-01` — fechas malformadas en `FechasInspectorNoche.js` |
| Bugs latentes / alto riesgo | 4 | `BUG-03` — `comprobarDia` muta listas globales con `.shift()` |
| Rendimiento | 3 | `PERF-02` — re-build completo del DOM en cada cambio |
| Legibilidad / duplicación | 8 | `REF-01` — patrón repetido en 8 archivos `FechasXxx.js` |
| Seguridad | 1 | `SEC-01` — sin riesgo crítico (todo `createTextNode`) — solo nota |
| Tooling ausente | 3 | `TOOL-01` — sin ESLint, sin tests, sin tipos |

**Recomendación**: arrancar por `BUG-01` y `BUG-02` (correctness), luego `TOOL-01` (instalar ESLint), después `REF-01` (refactor del patrón duplicado), y finalmente perf/cosmético.

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

- [ ] **Archivo**: [src/index.js:59-78](src/index.js#L59-L78)
- **Riesgo**: `comprobarDia()` hace `listaLibresYear.shift()`, `listaSubgrupoYear.shift()`, `listaSubComunesYear.shift()` para "consumir" cada fecha que pinta. Funciona porque las listas vienen ordenadas y las celdas se procesan en el mismo orden. Pero:
  1. **Acopla el algoritmo a un orden estricto**. Si en el futuro se quiere recorrer los meses en otro orden (ej. usuario navega a un mes específico) o re-pintar parcialmente, todo se rompe silenciosamente.
  2. **No se puede re-renderizar sin recargar las listas** (porque ya están vacías). De hecho, `nuevaFecha()` siempre llama a `setDatos()` que las reconstruye — esto **no es por elegancia**, es porque sin reconstruirlas el segundo render fallaría.
- **Fix sugerido**: cambiar `.shift()` por un índice/cursor por lista, o mejor: convertir las listas en un `Set<string>` con claves `"YYYY-MM-DD"` y hacer `set.has(...)`. Coste O(1) por celda, sin estado mutable, sin orden requerido.
  ```js
  // construcción una sola vez
  const setLibres = new Set(listaLibres.map(d => d.toISOString().slice(0,10)));
  // consulta
  if (setLibres.has(`${year}-${mes}-${dia}`)) return "libres";
  ```

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

- [ ] **Archivo**: [src/calendarios/InitCabecera.js:161-170](src/calendarios/InitCabecera.js#L161-L170)
- **Riesgo**: el primer elemento del array se inserta como **number** (`array.push(valor)`) y los siguientes como **string** (`array.push(valor.toString())`). Si después se compara con `===`, hay riesgo de bug.
  ```js
  array.push(valor);              // number
  for (...) {
    valor += 5;
    array.push(valor.toString()); // string
  }
  ```
- **Fix sugerido**: unificar a string desde el principio (`array.push(String(valor))`). Coherente con el resto del código que trata los valores de selects como strings.

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

- [ ] **Archivos**: `FechasBuho.js`, `FechasConductor.js`, `FechasGrua.js`, `FechasInspector.js`, `FechasInspectorNoche.js`
- **Problema**: cada uno define un `getNumeroSubgrupo(subgrupo)` que mapea "A" → 0, "B" → 1, etc. con un `switch`. Es la misma función con distinta longitud (Conductor llega a H, Inspector a J).
- **Fix sugerido**: una sola función en `FuncionesComunes.js`:
  ```js
  export const letraAIndice = (letra) => letra ? letra.toUpperCase().charCodeAt(0) - 65 : 0;
  ```
  Cuatro líneas en vez de N switches de 8-10 cases.

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

- [ ] **Archivo**: [src/calendarios/FechasBuho.js:80](src/calendarios/FechasBuho.js#L80)
  ```js
  //miercoles = 0, domingo = 1, martes = 2, lunes =1
  ```
  pero `getDay()` devuelve **0 = domingo**, **1 = lunes**, **2 = martes**, **3 = miércoles** (estándar JS). El comentario describe **posiciones de un array**, no el valor de `getDay()`. Confunde.
- **Fix sugerido**: reescribir el comentario para distinguir claramente "día de la semana JS" vs "índice en la secuencia".

### `REF-07` 🟡 — Naming inconsistente (camelCase vs snake_case)

- [ ] **Archivo**: [src/index.js](src/index.js)
- **Problema**: variables mezclan `camelCase` (`tipoCalendario`, `arrayMes`) con `snake_case` (`select_grupo`, `num_dia`, `cont_tabla`).
- **Fix sugerido**: estandarizar a `camelCase` en JS (convención del lenguaje). No es urgente — es un refactor mecánico que puede esperar.

### `REF-08` 🟡 — Acoplamiento DOM frágil en `initRotulos`

- [ ] **Archivo**: [src/calendarios/InitCabecera.js:49-53](src/calendarios/InitCabecera.js#L49-L53)
  ```js
  let libre = div.firstElementChild;
  let subgrupo = libre.nextElementSibling;
  let sub1 = subgrupo.nextElementSibling;
  let sub2 = div.lastElementChild;
  ```
- **Problema**: si en el HTML alguien reordena los `<h4>` o añade uno nuevo, esta función rompe silenciosamente. No hay validación.
- **Fix sugerido**: usar selectores explícitos con `data-rol`:
  ```html
  <h4 data-rol="libre" class="libres">Libre</h4>
  ```
  ```js
  const libre = div.querySelector('[data-rol="libre"]');
  ```
  Más verbose, pero el HTML y el JS no pueden divergir sin que falle ruidosamente.

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

- [ ] **Archivo**: [src/index.js:34-37](src/index.js#L34-L37)
  ```js
  function startDay(monthNumber) {
      let start = new Date(currentDate.getFullYear(), monthNumber - 1, 1);
      return ((start.getDay() - 1) == -1) ? 6 : start.getDay() - 1;
  }
  ```
- **Problema**: `getDay()` se llama dos veces. El coste es despreciable, pero la línea es difícil de leer.
- **Fix sugerido**:
  ```js
  function startDay(monthNumber) {
    const day = new Date(currentDate.getFullYear(), monthNumber - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;  // domingo (0) → 6, resto → day-1
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

- [ ] **Estado**: no hay carpeta `tests/` ni framework configurado.
- **Por qué importa**: la lógica de fechas es la **lógica de negocio del proyecto entero**. Bugs como `BUG-01` (fechas malformadas) viven indetectados durante meses. Sin tests, cualquier refactor (`REF-01`) es ruleta rusa.
- **Fix sugerido (priorizado)**:
  1. **Vitest** (integración nativa con Vite, que ya usas).
     ```bash
     npm install -D vitest
     ```
  2. **Empezar pequeño** — un test por cada `getListaLibresXxx` que verifique:
     - Se devuelven N fechas para un año dado
     - Las fechas están en orden creciente
     - La primera y última fecha caen dentro del año pedido
  3. **Snapshot tests** para cada combinación tipo+grupo+subgrupo: capturan el array completo y avisan si cambia. Útil para refactorizar `REF-01` con confianza.

### `TOOL-03` 🟢 — Sin TypeScript

- [ ] **Por qué importa**: tipar `getDay()` (devuelve 0-6), `tipoCalendario` (union de 10 strings), `secuencia` (array de números) reduciría una clase entera de bugs.
- **Coste**: migración gradual con `// @ts-check` + JSDoc, sin tocar `.js → .ts`. Es viable.
- **Prioridad**: **baja** — no es urgente. Pero si se hace `REF-01` (factoría), el momento ideal para añadir tipos es entonces.

---

## 🗺️ Plan de acción sugerido

Orden recomendado (de menor a mayor impacto en el código):

| # | Tarea | Beneficio | Riesgo |
|---|---|---|---|
| 1 | `BUG-02` (doble nuevaFecha) | Quita flash al cargar | Bajo |
| 2 | `REF-03` (limpiar comentarios CommonJS) | Limpieza visual masiva | Nulo |
| 3 | `TOOL-01` (instalar ESLint) | Detecta otros problemas auto | Nulo |
| 4 | `REF-04`, `REF-05` (con auto-fix de ESLint) | Coherencia | Nulo |
| 5 | **`BUG-01`** (fechas malformadas Inspector_Noche) | **Crítico de correctness** | Medio (verificar valores) |
| 6 | `BUG-04` (GruaDSM grupos 4-5) | Aclarar diseño o fix | Medio (verificar diseño) |
| 7 | `TOOL-02` (Vitest + tests básicos) | Red de seguridad | Bajo |
| 8 | `BUG-03` (refactor `comprobarDia` con Set) | Robustez | Medio (cambia algoritmo) |
| 9 | `BUG-05` (reescribir `getFechaInit`) | Eliminar magia | Alto (lógica núcleo) |
| 10 | `REF-02` (helper letra→índice) | Reduce duplicación | Bajo |
| 11 | `REF-08` (data-rol en HTML) | Robustez DOM | Bajo |
| 12 | `REF-01` (factoría `crearCalendario`) | **Refactor mayor** | Alto, requiere `TOOL-02` antes |
| 13 | `PERF-01`, `PERF-03` (micro-perf) | Marginal | Medio |
| 14 | `REF-07` (naming uniforme) | Cosmético | Bajo |
| 15 | `TOOL-03` (TypeScript con JSDoc) | Tipos sin migración | Bajo |

**Mi recomendación de primer sprint**: tareas 1-5 en orden. Esas cinco resuelven un bug de correctness, dejan el código mucho más limpio y montan la herramienta que detecta el resto. Es ~1-2 sesiones de trabajo y bajo riesgo.

---

## Apéndice — Métricas

- **LOC totales revisados**: 1760
- **LOC duplicado estimado** (refactor `REF-01`): ~600
- **Funciones públicas (`export`)**: 27
- **Funciones privadas**: ~45
- **Archivos con comentarios CommonJS obsoletos**: 7
- **Comparaciones `==` no estrictas**: 6 (todas en `index.js`)

## Apéndice — Lo que NO he revisado en esta pasada

- `index.html` y `estilo.css` (fuera del alcance pedido — son la vista, no la lógica de fechas).
- `package.json` / `vite.config.js` (configuración de build).
- `FechasGruaDSM.js` arrays de fechas: posibles errores tipo `BUG-01` que requieren validación contra fuente externa.
- Compatibilidad navegador / `.browserslistrc`.

Si quieres extender el análisis a esos puntos, lo añadimos a este mismo documento en una segunda pasada.
