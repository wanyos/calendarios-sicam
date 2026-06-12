# Lógica de Cálculo de Calendarios

## 1. Visión general

Este documento describe la lógica de cálculo de días libres del **motor de calendarios**
(carpeta `motor-calendarios/`). El sistema se diseña para **cualquier empresa u
organización**; los **10 tipos de calendario** actuales provienen de la implementación
original y se conservan como **casos de referencia validados** (cada uno representa una
categoría laboral: Conductor, Inspector, Grúa, etc.). Cada calendario define cómo se
reparten los **días libres**, **días de subgrupo** y **días comunes** a lo largo del año
para los empleados de un departamento, que se agrupan en **grupos de libres**.

**Reparto de papeles entre los dos documentos del diseño** (van a la par; ninguno
duplica al otro):

| Documento | Qué contiene |
|---|---|
| **Este** (`LOGICA_CALENDARIOS.md`) | Cómo **funciona el cálculo**: el motor explicado (§3), la factoría (§4), los datos de cada calendario (§5–§6), el modelo conceptual del dominio (§7) y la guía de implementación del backend (§8) |
| **`diseno-bd.md`** | El **diseño de la base de datos**: tablas, SQL, invariantes, flujos y decisiones — capa de configuración del motor (su §8) y capa de dominio/usuario (su §9) |

### Mapa de este documento

§2 estructura del motor · §3 cómo se calculan los libres · §4 la factoría ·
§5 los 10 calendarios uno a uno · §6 resumen y contrato de entradas ·
§7 modelo conceptual del dominio · §8 guía de implementación del backend.

### Conceptos clave

- **Grupo de libres**: conjunto de empleados que comparten el mismo patrón de días libres.
  Un calendario tiene entre 3 y 12 grupos.
- **Subgrupo**: subdivisión dentro de un grupo que determina días libres adicionales
  (días de subgrupo, de reducción…). Se identifica con letras (A–J) o números (1–50).
- **Subgrupos comunes (subComunes)**: días que aplican a conjuntos de subgrupos por
  paridad de letra (ACEGI vs BDFHJ).
- **Ciclo / Secuencia**: patrón repetitivo de días libres y trabajados que define el
  calendario.
- **Fecha ancla**: día concreto del pasado en el que se sabe con certeza que empezó el
  patrón (viene del calendario oficial impreso). De una sola ancla se deriva cualquier
  año (§3.0).

---

## 2. Estructura del motor (`motor-calendarios/`)

El motor vive **aislado** en la carpeta `motor-calendarios/`: JavaScript vanilla puro
(ES modules), sin DOM, sin navegador y sin dependencias externas. Es la **única fuente de
verdad** de la lógica de cálculo y lo que se entrega al backend. El código de UI de la
aplicación original (selects, rótulos, pintado de la rejilla) quedó fuera y no forma
parte de esta lógica.

### 2.1 Vista general de archivos

```
motor-calendarios/
├── index.js                   # Punto de entrada público: re-exporta el dispatcher y añade
│                              #   serializarFecha() y calcularCalendario() (helpers backend)
├── DatosFechas.js             # Router/dispatcher que redirige a cada calendario
├── FuncionesComunes.js        # Motor de iteración de fechas (core engine)
├── FechasFactory.js           # Factoría para calendarios con patrón compartido
├── FechasConductorInspector.js# Helpers compartidos por los 4 calendarios de la factoría
│                              #   (Conductor, Inspector, Inspector_Noche, Buho): offsets de grupo
├── FechasConductor.js         # Calendario: Conductor
├── FechasInspector.js         # Calendario: Inspector
├── FechasInspectorNoche.js    # Calendario: Inspector Nocturno
├── FechasBuho.js              # Calendario: Búho
├── FechasGrua.js              # Calendario: Grúa Asistencia Calle
├── FechasGruaDSM.js           # Calendario: Grúa DSM
├── FechasGruaDSMNoche.js      # Calendario: Grúa DSM Noche
├── FechasParkingDSM100.js     # Calendario: Parking DSM 100%
├── FechasParkingDSM50.js      # Calendario: Parking DSM 50%
├── FechasRefuerzoNocturno.js  # Calendario: Refuerzo Nocturno
└── README.md                  # Cómo importarlo + reglas de uso que no se pueden ignorar
```

### 2.2 Tipos de calendario (valores válidos de `tipoCalendario`)

Los 10 valores que acepta el dispatcher (`DatosFechas.js`), con su nombre descriptivo:

| `tipoCalendario` | Nombre descriptivo |
|---|---|
| `Conductor` | Conductor |
| `Inspector` | Inspector |
| `Inspector_Noche` | Inspector Noche |
| `Grua` | Grúa Asistencia Calle |
| `GruaDSM` | Grúa DM |
| `GruaDSM_Noche` | Grúa DM Noche |
| `ParkingDSM_100` | Parking DM 100% |
| `ParkingDSM_50` | Parking DM 50% |
| `Refuerzo_Nocturno` | Refuerzo Nocturno |
| `Buho` | Búho |

> Estos identificadores se conservan como **slugs estables** (campo `slug` del modelo de
> BD, `diseno-bd.md` §8.1). En el sistema final cada empresa crea sus calendarios con el
> nombre que quiera; estos 10 son los casos de referencia validados del motor.

---

## 3. Cómo se calculan los libres (el motor, explicado)

> Código: `FuncionesComunes.js` (3 funciones de iteración + 1 helper). Esta sección
> explica **el concepto** de cada mecanismo con ejemplos reales paso a paso; la
> referencia rápida de funciones está al final (§3.5).

### 3.0 La idea general (común a todos los tipos de libre)

Todos los tipos de libre se calculan con el **mismo esquema**:

1. Se parte de una **fecha ancla**: un día concreto del pasado (2020 o 2022) en el que se
   sabe con certeza que empezó el patrón (viene del calendario oficial impreso).
2. Desde ella se avanza siguiendo un **patrón cíclico** (cada tipo de libre tiene el suyo).
3. Cuando el avance entra en el **año pedido**, cada día que el patrón marca como libre
   se añade al resultado.

Como el patrón es cíclico, **una sola ancla genera cualquier año** (2024, 2026, 2030…)
sin guardar nada más. Lo único que cambia entre tipos de libre es **la forma del patrón**,
y solo existen **tres formas** (tres mecanismos):

| Mecanismo | Qué calcula | Forma del patrón | Función del motor |
|---|---|---|---|
| **A — Ciclo trabajo/libres** | Los **libres normales** (todos los calendarios) | Bloques de días libres seguidos, separados por tramos de trabajo | `getListaLibres` (§3.1) |
| **B — Intervalo variable** | Los días de **subgrupo** (casi todos) | Un día libre suelto cada X días, donde X recorre una secuencia que se repite | `getListaSubgrupo` (§3.2) |
| **C — Intervalo fijo** | **Días comunes**, **reducción**, **jornada parcial** (según calendario) | Un día libre suelto cada N días exactos, siempre la misma distancia | `getListaSubgrupoReduccion` (§3.3) |

Un calendario completo = **libres normales (mecanismo A, siempre) + los demás tipos que
tenga ese calendario** (B y/o C). Cada tipo se calcula **por separado, con su propia
ancla y su propio patrón**, y al final se juntan las listas. La tabla del §6 resume qué
tipos tiene cada uno de los 10 calendarios.

**Los ciclos y los días de la semana.** Todos los ciclos del sistema (35, 21, 42, 70,
84, 105, 280, 350) son **múltiplos de 7**. No es casualidad: los repartos de libres se
definen sobre la semana laboral, y eso ancla cada patrón a los días de la semana de
forma permanente. Consecuencias por mecanismo:

- **Mecanismo A**: cada bloque del ciclo cae **siempre en los mismos días de la semana**,
  año tras año (ej. en §3.1: el bloque de "vie-sáb-dom" de Conductor será vie-sáb-dom
  para siempre).
- **Mecanismo B**: los saltos individuales (60, 65, 76, 79…) **no** son múltiplos de 7,
  así que el día de la semana va cambiando dentro del ciclo — pero el ciclo completo
  (280, 350) sí lo es, de modo que tras una vuelta entera se vuelve al mismo día de la
  semana. Por eso el **día de la semana del ancla identifica sin ambigüedad en qué punto
  del ciclo se está** (es el fundamento del mapa día→pos, §3.2).
- **Mecanismo C**: el paso (70, 84) es múltiplo de 7 → **todos los días de la serie caen
  siempre el mismo día de la semana** (de ahí nombres del dominio como "sábados comunes").

### 3.1 Mecanismo A — los libres normales (`getListaLibres`)

El patrón son **dos arrays paralelos** que se leen en alternancia:

- `libres = [2, 3, 2, 3]` → cuántos días libres **seguidos** tiene cada bloque.
- `trabajo = [8, 6, 7, 8]` → el **salto** en días de un bloque de libres al siguiente.

La lectura: 2 libres → salto 8 → 3 libres → salto 6 → 2 libres → salto 7 → 3 libres →
salto 8 → **y vuelta a empezar** (los dos arrays avanzan a la vez con el índice `pos`,
que al llegar al final vuelve a 0).

**Ejemplo real (Conductor, grupo 1)** — ancla `2020-01-01`:

```
día nº:   0  1 ···+8···› 9 10 11 ··+6··› 17 18 ··+7··› 25 26 27 ···+8···› 35 36 ...
          █  █           █  █  █          █  █          █  █  █            █  █ ...
bloque:   └ 2 ┘          └─ 3 ─┘          └ 2 ┘         └─ 3 ─┘            └ 2 ┘ (repite)
en 2020:  1-2 ene        10-12 ene        18-19 ene     26-28 ene          5-6 feb ...
```

El día 35 el patrón está exactamente igual que el día 0: **el ciclo dura 35 días**
(`totalSecuencia = 35`). En un año caben ~10,4 ciclos de Conductor.

**Leído en días de la semana** (la ancla 2020-01-01 fue miércoles, y 35 días = 5 semanas
exactas): el ciclo es una **rueda semanal** que se repite para siempre —

```
mié-jue  →  vie-sáb-dom  →  sáb-dom  →  dom-lun-mar  →  (vuelta a) mié-jue ...
 (2)           (3)            (2)           (3)            cada bloque, una semana después
```

Cada bloque libra **siempre los mismos días de la semana**, año tras año, porque el
ciclo es múltiplo de 7 (§3.0). Esta rueda es la forma en que el dominio define el
reparto ("un grupo libra dom-lun-mar, a la semana siguiente mié-jue…"); los dos arrays
son su codificación.

> ⚠️ **Trampa nº 1 — `trabajo[i]` es un salto, no un recuento.** El salto se mide
> **desde el último día libre de un bloque hasta el primer libre del bloque siguiente**.
> En el ejemplo: último libre del bloque 0 = día 1; `+8` → día 9 = primer libre del
> bloque 1. Entre medias hay **7** días trabajados reales (días 2–8), no 8. (En el
> código: el último día libre del bloque no avanza el cursor — guarda
> `if (a < totalLibres - 1)` — y después el cursor salta `trabajo[pos]` días.)

> ⚠️ **Trampa nº 2 — el ciclo NO es `Σ(libres) + Σ(trabajo)`.** Consecuencia de la
> trampa 1, la duración real del ciclo es:
>
> ```
> totalSecuencia = Σ libres − nBloques + Σ trabajo
> ```
>
> Conductor: `(2+3+2+3) − 4 + (8+6+7+8)` = `10 − 4 + 29` = **35** ✓ (la suma ingenua
> daría 39, que es incorrecto). Por eso `totalSecuencia` (35, 42, 70, 280…) se guarda
> **como dato** y el motor no lo recalcula. Es el error nº 1 a evitar al crear calendarios.

**El escalonado de grupos.** Todos los grupos de un calendario usan **los mismos dos
arrays**; lo único que cambia es **dónde arranca cada grupo**: un desplazamiento de la
ancla (offset en días) y una posición inicial distinta en los arrays (`pos`). Así los
libres quedan escalonados y cada día hay trabajadores disponibles. En Conductor:

| Grupo | Offset (días sobre la ancla) | `pos` inicial |
|---|---|---|
| 1 | 0 | 0 |
| 2 | +2 | 1 |
| 3 | +3 | 2 |
| 4 | +4 | 3 |
| 5 | +7 | 0 |

(Ej.: el grupo 2 arranca el 3-ene-2020 leyendo desde el bloque de 3 libres.)

### 3.2 Mecanismo B — los días de subgrupo (`getListaSubgrupo`)

Cada **subgrupo** (letra A–J o número 1–50, según calendario) recibe **un día libre
suelto cada cierto intervalo**, y el intervalo **varía siguiendo una secuencia** que se
repite. No hay bloques: cada paso produce exactamente un día libre.

- Cada subgrupo tiene **su propia fecha ancla** (en código, una matriz por grupo y subgrupo).
- La secuencia de intervalos es **la misma para todo el calendario**
  (Conductor: `[60, 65, 76, 79]`).
- **¿Por qué posición de la secuencia se empieza?** Depende del **día de la semana** en
  que cae la ancla del subgrupo, según un mapa fijo de cada calendario (en código, las
  funciones `getPosSecuenciaXxx`; el mapa de cada calendario está en §5; el día se lee
  con la convención `getDay()` de JS: 0=domingo … 6=sábado). Conductor:
  jueves→0, lunes→1, miércoles→2, martes→3.

**Ejemplo real (Conductor, grupo 1, subgrupo A)** — ancla `2020-03-04` (miércoles → pos 2):

```
2020-03-04 ─+76─› 2020-05-19 ─+79─› 2020-08-06 ─+60─› 2020-10-05 ─+65─› 2020-12-09 ─+76─› ...
  (pos 2)           (pos 3)           (pos 0)           (pos 1)           (pos 2, repite)
```

Los cuatro saltos suman `76+79+60+65 = 280` días: el ciclo del subgrupo. Como 280 no es
múltiplo del año natural, las fechas "viajan" por el calendario de un año al siguiente
(no caen en los mismos días cada año).

**Misma filosofía que los libres normales**: si el año pedido es posterior al del ancla,
`getFechaInit` (§3.4) planta el arranque en el año anterior, alineado con el ciclo del
subgrupo; se recorre la secuencia desde ahí y se descartan las fechas del año anterior.
Cada salto produce exactamente **un** día de subgrupo.

**Los días de la semana del subgrupo.** Consecuencia del §3.0 (saltos que no son
múltiplos de 7 dentro de un ciclo que sí lo es): los días de subgrupo de cada calendario
**rotan dentro de un conjunto fijo de días de la semana**. El conjunto sale de los días
en que caen sus anclas (los del mapa día→pos) más los saltos módulo 7. Conjuntos reales,
verificados ejecutando el motor (grupos 1–5 × todos los subgrupos × años 2024–2026):

| Calendario | Días de la semana posibles (subgrupo) |
|---|---|
| Conductor | lun, mar, mié, jue |
| Inspector | lun, mar, mié, jue, vie |
| Inspector_Noche | dom, lun, mar, mié, jue |
| Buho | dom, lun, mar, mié |
| Grua | jue, vie |
| GruaDSM | lun, mar, mié, jue, vie |

Es decir: **nunca caen en sábado** en ningún calendario, y **el domingo solo aparece en
los nocturnos** (Buho, Inspector_Noche), cuyo "día" empieza la noche anterior (−1 día
respecto al equivalente diurno).

> ⚠️ El motor **no valida** esta propiedad: emerge de las anclas y secuencias oficiales.
> Al crear o editar la configuración de un calendario (CRUD sobre la BD) hay que
> respetarla — unas anclas o unos saltos mal elegidos producirían días de subgrupo en
> fin de semana.

### 3.3 Mecanismo C — días comunes, reducción y jornada parcial (`getListaSubgrupoReduccion`)

Como el B pero **sin secuencia**: un día libre cada **N días exactos, siempre la misma
distancia** (Conductor: cada 70). Solo necesita una ancla y el paso.

- **Días comunes** (Conductor, Inspector, Inspector_Noche, Buho): hay **dos series por
  grupo** según la **paridad de la letra** del subgrupo del trabajador — una serie para
  las letras impares A,C,E,G(,I) y otra para las pares B,D,F,H(,J), según cuántas letras
  tenga el calendario — cada una con su propia ancla.
- **Reducción / jornada parcial** (Parking): **una serie por grupo** (una sola ancla).

**Ejemplo real (Conductor, grupo 1, serie ACEGI)** — ancla `2020-02-29`, paso 70:

```
2020-02-29 ─+70─› 2020-05-09 ─+70─› 2020-07-18 ─+70─› 2020-09-26 ─+70─› ...
   sábado            sábado            sábado            sábado
```

Como el paso es múltiplo de 7, **todos los días de la serie caen el mismo día de la
semana** (aquí, todos sábados — §3.0).

**El día fijo de cada calendario, verificado ejecutando el motor** (todos los grupos ×
años 2024–2026):

| Calendario | Tipo de día (mec. C) | Día de la semana (siempre) |
|---|---|---|
| Conductor | Días comunes | **sábado** |
| Inspector | Días comunes | **sábado** |
| Inspector_Noche | Días comunes | **viernes** (nocturno: −1 día) |
| Buho | Días comunes | **viernes** (nocturno: −1 día) |
| ParkingDSM_100 | Reducción | **miércoles** |
| ParkingDSM_50 | Jornada parcial | **lunes** |

De ahí el nombre del dominio "**sábados comunes**" en los calendarios diurnos.

**Las dos series de paridad se intercalan.** En Conductor G1, la serie BDFH ancla en
`2020-01-25` y la ACEG en `2020-02-29`: **35 días de diferencia, justo medio ciclo**.
Cada trabajador tiene su sábado común cada 70 días; dentro del grupo, las dos mitades de
subgrupos se van alternando un sábado cada 35 días.

> ⚠️ Igual que en el subgrupo (§3.2): el motor **no valida** que el día resultante sea
> el "correcto" — el día fijo emerge del ancla elegida. Al crear/editar configuración,
> elegir el ancla en el día de la semana que toque.

### 3.4 De la ancla histórica a cualquier año: `getFechaInit(year, fechaFin, valorSecuencia)`

Las anclas son fechas de 2020/2022. Para calcular, por ejemplo, 2026 el motor **no
itera día a día seis años**: `getFechaInit` salta de golpe **ciclos completos** y
devuelve una fecha alineada con el patrón justo antes del año pedido; desde ahí, el
mecanismo que toque itera solo lo que falta.

**La idea que hay detrás** (el razonamiento original del algoritmo):

1. **Distancia ÷ ciclo**: se cuentan los días desde la ancla hasta cerca del año pedido
   (p.ej. 6543 días) y se dividen por la duración del ciclo. Los **ciclos completos** se
   pueden saltar de golpe (el patrón es idéntico tras cada ciclo); el **resto** de la
   división dice en qué punto del patrón se cae. Todo en **días enteros** — un día no se
   puede partir, por eso el código redondea la fracción al avanzar (`Math.round`).
2. **Quedarse corto a propósito**: en vez de aterrizar dentro del año pedido (donde no
   sabríamos a qué semana de la rueda corresponde el punto de caída), el algoritmo se
   planta **uno o dos meses antes, todavía en el año anterior**, pero **exactamente en el
   arranque de un ciclo completo**. Desde ahí se recorre el patrón con total certeza.
3. **Descartar el año anterior**: el bucle del mecanismo (§3.1–3.3) recorre el patrón
   desde esa fecha y **solo guarda las fechas cuyo año es el pedido** (la guarda
   `cursor.getFullYear() === year`). Las del "calentamiento" en el año anterior se
   descartan. Así las fechas devueltas siempre entran al año con el patrón bien alineado.

**Algoritmo** (`fechaFin` = ancla; `valorSecuencia` = duración del ciclo):
1. Aproxima una fecha hacia el final del año **anterior** al pedido:
   `mesAprox = 12 − valorSecuencia/30` (ciclo 35 → ~noviembre del año previo;
   ciclo 350 → ~enero, con más "calentamiento").
2. Caso borde: si esa fecha cae **antes** que la ancla (se pide un año anterior al año
   base del calendario), retrocede un ciclo desde la ancla y devuelve eso.
3. Calcula cuántos **ciclos completos** caben entre la ancla y la fecha aproximada.
4. Avanza la fecha aproximada hasta el inicio del **siguiente ciclo completo** → esa es
   la `fechaInit` que reciben los tres mecanismos.

> ⚠️ Es una **heurística histórica validada contra los calendarios impresos oficiales**.
> No reescribirla ni "mejorarla": se persisten sus *entradas* (ancla, `totalSecuencia`)
> y no se toca su lógica (§8.6).

### 3.5 Referencia rápida de funciones (`FuncionesComunes.js`)

| Función | Mecanismo | Entradas | Salida |
|---|---|---|---|
| `getFechaInit(year, fechaFin, valorSecuencia)` | alineado previo | año pedido, ancla, ciclo | fecha de arranque alineada |
| `getListaLibres(year, fechaInit, libres, trabajo, pos)` | A | arrays paralelos + pos inicial | `Date[]` libres normales |
| `getListaSubgrupo(year, fechaInit, secuencia, pos)` | B | secuencia de saltos + pos inicial | `Date[]` días de subgrupo |
| `getListaSubgrupoReduccion(year, fechaInit, totalSecuencia)` | C | paso fijo | `Date[]` comunes/reducción/parcial |
| `letraAIndice(letra)` | — | letra A–Z | índice 0–25 (acceso a matrices por letra) |

### 3.6 El método: cómo se modela cualquier calendario

Los 10 calendarios se modelaron siempre con el mismo procedimiento, partiendo del
calendario oficial impreso. Es el mismo método que seguirá quien defina un calendario
nuevo en el sistema (los datos resultantes son exactamente lo que pide el CRUD,
`diseno-bd.md` §8):

1. **Detectar el ciclo**: observar el calendario hasta encontrar el punto donde el patrón
   completo se repite. La duración será **múltiplo de 7** (§3.0) — si no lo es, el patrón
   está mal leído.
2. **Libres normales** → codificar la rueda semanal como **dos arrays** (`libres` y
   `trabajo`), con tantas posiciones como bloques tenga el ciclo, más el **ancla** (primer
   día del primer bloque conocido) y el `totalSecuencia` (fórmula de §3.1, ¡no la suma
   ingenua!). Después, el escalonado: offset y `pos` inicial de cada grupo.
3. **Días de subgrupo / extra** → anotar **qué días de la semana son y con qué frecuencia
   se repiten**: si la distancia entre días es **constante** → mecanismo C (un paso + un
   ancla por serie); si **varía** → mecanismo B (array de saltos + ancla por subgrupo +
   mapa día→pos).
4. **Verificar** contra el calendario impreso (y con las propiedades de §3.0: ciclo
   múltiplo de 7, días de la semana en el conjunto esperado).

Una vez extraído el modelo (los datos), el cálculo de cualquier año es siempre el mismo y
no depende del calendario: `getFechaInit` planta el recorrido **en el año anterior al
pedido, en el arranque de un ciclo y sabiendo qué posición del array toca**; desde ahí se
recorre el patrón y se descarta todo lo que no sea del año pedido (§3.4).

---

## 4. La factoría Conductor/Inspector (`FechasFactory.js`)

4 calendarios comparten estructura y se construyen con la factoría
`crearCalendarioBasico`: **Conductor**, **Inspector**, **Inspector_Noche** y **Buho**.

### 4.1 Configuración de la factoría

```js
crearCalendarioBasico({ libres, subgrupo, subComunes })
```

Las tres secciones de la config son **exactamente los tres mecanismos del §3**:
`libres` → mecanismo A, `subgrupo` → mecanismo B, `subComunes` → mecanismo C.
Cada sección recibe:

#### `libres` (mecanismo A)
```
{
  fechaInicial: Date,       // Ancla del grupo 1
  secuencia: number[],      // Días libres por bloque (ej. [2,3,2,3])
  trabajo: number[],        // Saltos entre bloques (ej. [8,6,7,8])
  totalSecuencia: number    // Duración del ciclo (fórmula de §3.1)
}
```

#### `subgrupo` (mecanismo B)
```
{
  fechasIniciales: Date[][],  // Matriz [grupo-1][indiceLetra] → ancla del subgrupo
  secuencia: number[],        // Saltos entre días de subgrupo
  totalSecuencia: number,     // Ciclo completo del subgrupo
  getPosSecuencia: function   // Mapa día de semana → posición inicial en la secuencia
}
```

La matriz `fechasIniciales` tiene 5 filas (grupos 1–5) y N columnas (subgrupos). Se
accede con `[grupo-1][letraAIndice(letra)]`.

#### `subComunes` (mecanismo C)
```
{
  fechasIniciales: Date[][],  // Matriz [grupo-1][0|1] → 0=ACEGI, 1=BDFHJ
  totalSecuencia: number      // Paso fijo (normalmente 70 días)
}
```

### 4.2 Helpers compartidos (`FechasConductorInspector.js`)

- `getLibresConductorInspector(year, grupo, fechaInit, totalSec, libres, trabajo)`:
  alinea con `getFechaInit`, aplica el offset y la `pos` del grupo (tabla de §3.1) y
  llama a `getListaLibres`.
- `getListaSubgrupoConductorInspector(...)`: alinea si hace falta y llama a `getListaSubgrupo`.
- `getListaSubComunesConductorInspector(...)`: alinea si hace falta y llama a
  `getListaSubgrupoReduccion`.

---

## 5. Los 10 calendarios, uno a uno

> ⚠️ **Cuidado con los mapas día→pos del mecanismo B**: la secuencia numérica puede
> coincidir entre calendarios (Conductor = Buho, Inspector = Inspector_Noche), pero el
> **mapa día-de-semana→posición es distinto en cada uno**. No reutilizar el mapa de un
> calendario en otro.

### 5.1 Conductor

| Propiedad | Valor |
|---|---|
| Año base | 2020 |
| Ciclo libres | 35 días |
| Secuencia libres | `[2, 3, 2, 3]` |
| Secuencia trabajo | `[8, 6, 7, 8]` |
| Grupos | 5 (1-5) |
| Subgrupos | 8 letras (A-H) |
| Secuencia subgrupo | `[60, 65, 76, 79]` (ciclo 280 días) |
| SubComunes | Cada 70 días |
| Mapa día→pos (subgrupo) | jueves→0 (default), lunes→1, miércoles→2, martes→3 |

### 5.2 Inspector

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 35 días |
| Secuencia libres | `[2, 3, 2, 3]` |
| Secuencia trabajo | `[8, 6, 7, 8]` |
| Grupos | 5 (1-5) |
| Subgrupos | 10 letras (A-J) |
| Secuencia subgrupo | `[65, 76, 79, 64, 66]` (ciclo 350 días) |
| SubComunes | Cada 70 días |
| Mapa día→pos (subgrupo) | lunes→0 (default), miércoles→1, martes→2, jueves→3, viernes→4 |

### 5.3 Inspector Nocturno

Es idéntico a Inspector pero con todas las fechas desplazadas **−1 día** (turno
nocturno: el día empieza la noche anterior).

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Fecha inicio libres | 2022-01-04 (vs Inspector 2022-01-05) |
| Subgrupos | 10 letras (A-J), anclas = Inspector − 1 día |
| SubComunes | Anclas = Inspector − 1 día |
| Mapa día→pos (subgrupo) | domingo→0 (default), martes→1, lunes→2, miércoles→3, jueves→4 |

### 5.4 Búho (Buho)

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 35 días |
| Secuencia libres | `[2, 3, 2, 3]` |
| Secuencia trabajo | `[8, 6, 7, 8]` |
| Grupos | 5 (1-5) |
| Subgrupos | 8 letras (A-H) |
| Secuencia subgrupo | `[60, 65, 76, 79]` (ciclo 280 días) |
| SubComunes | Cada 70 días |
| Mapa día→pos (subgrupo) | miércoles→0 (default), domingo→1, martes→2, lunes→3 |

### 5.5 Grúa Asistencia Calle

**No usa la factoría** (implementación independiente). Sin días comunes.

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 35 días |
| Secuencia libres | `[2, 3, 2, 4]` |
| Secuencia trabajo | `[8, 6, 6, 8]` |
| Grupos | 5 (1-5) |
| Subgrupos | 3 letras (A, B, C) |
| Secuencia subgrupo | `[64, 41]` (ciclo 105 días) |
| Offsets de grupo (libres) | G2 +2 · G3 y G4 +3 · G5 +7 |

### 5.6 Grúa DSM

**No usa la factoría.** Sin días comunes.

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 35 días |
| Secuencia libres | `[5, 2, 2, 2]` |
| Secuencia trabajo | `[8, 8, 6, 6]` |
| Grupos | 5 (1-5) |
| Subgrupos | 50 números (1-50), **a nivel de calendario** |
| Secuencia subgrupo | `[59, 106, 1, 99, 85]` (ciclo 350 días) |
| Offsets de grupo (libres) | G2 +5 · G3 +7 · G4 y G5 misma fecha que G1 (cambia solo la `pos`) |

**Nota sobre subgrupos**: son numéricos y no dependen del grupo para el cálculo. En la
UI original, al elegir un grupo `g` el select ofrecía los 10 números
`{g, g+5, …, g+45}` (ej. grupo 1 → 1,6,11,…,46), aunque el motor acepta cualquier 1–50.

### 5.7 Grúa DSM Noche

Solo libres normales (sin subgrupo ni comunes).

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 21 días |
| Secuencia libres | `[5, 2]` |
| Secuencia trabajo | `[8, 8]` |
| Grupos | 3 (1-3) |
| Offsets de grupo | G2 +5 · G3 +7 |

### 5.8 Parking DSM 100%

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 70 días |
| Secuencia libres | `[3, 3, 2, 4, 2, 4, 2, 4]` |
| Secuencia trabajo | `[8, 6, 6, 8, 7, 6, 6, 7]` |
| Grupos | 10 (1-10) |
| Subgrupos | 1 por grupo (el mismo número del grupo) |
| Días de reducción | Cada 70 días desde la ancla del grupo (mecanismo C) |

### 5.9 Parking DSM 50%

| Propiedad | Valor |
|---|---|
| Año base | 2022 |
| Ciclo libres | 42 días |
| Secuencia libres | `[4, 3]` |
| Secuencia trabajo | `[15, 22]` |
| Grupos | 12 (1-12) |
| Días parciales (Jda.Parcial) | Intervalo fijo cada **84** días desde la ancla (mecanismo C) |
| Días de reducción | Ciclo de **42** días con dos arrays (mecanismo A): libres `[11, 3, 7]`, trabajo `[8, 5, 11]` |

> Verificación del ciclo de reducción con la fórmula de §3.1:
> `Σ[11,3,7] − 3 bloques + Σ[8,5,11] = 21 − 3 + 24 = 42` ✓.

**⚠️ Inversión nombre-de-función ↔ rótulo de UI (no tocar sin validar contra el calendario impreso).**
ParkingDSM_50 es el único con dos tipos de día extra, y su cableado es contraintuitivo:

| Función en código | Slot del dispatcher (`DatosFechas.js`) | Clase CSS (app original) | Rótulo en la UI original |
|---|---|---|---|
| `getListaReduccionParkingDSM50` (ciclo 42) | `getDatosListaSubgrupo` ("subgrupo") | `subgrupo` | **"Jda.Parcial"** |
| `getListaSubgrupoParkingDSM50` (cada 84) | `getDatosListaSubComunes` ("subComunes") | `sub2` | **"D.Reducción"** |

Es decir, **el nombre de la función y el rótulo que ve el usuario están cruzados**: la
función llamada *Reduccion* alimenta el rótulo *Jda.Parcial*, y viceversa. No se ha
podido determinar si el bug está en el nombre o en el rótulo (haría falta el calendario
impreso oficial). **Para el backend, mapea por el dato validado contra el impreso, no por
el nombre de la función.** (Mismo patrón menor en ParkingDSM_100: `getListaSubgrupoParkingDSM100`
calcula en realidad la *reducción* y se sirve por el slot `subComunes`.)

### 5.10 Refuerzo Nocturno

El calendario más complejo. Solo tiene libres normales (mecanismo A), pero su punto de
inicio es especial.

| Propiedad | Valor |
|---|---|
| Año base | 2022 (ancla 2022-01-02) |
| Ciclo libres | 280 días |
| Secuencia libres | Array de **57 elementos**, `Σ = 88` (ver código) |
| Secuencia trabajo | Array de **57 elementos**, `Σ = 249` (ver código) |
| Grupos | 2 letras (A, B) |
| "grupoDos" | Número (1-9) o letra (A-K) |

**Particularidades** (detalle completo y modelo de datos en `diseno-bd.md` §8.3):
- El selector adicional **`grupoDos`** (número 1–9 o letra A–K) determina, junto con el
  grupo, la **posición inicial** en la secuencia mediante 4 tablas de mapeo
  (`getPosAN`, `getPosAL`, `getPosBN`, `getPosBL`). Ej.: A+1 → pos 31; A+letra A → pos 43;
  B+1 → pos 3; B+letra A → pos 14.
- **No hay offsets de fecha por grupo**: todos comparten la misma ancla; el escalonado
  se hace solo por `pos`.
- Si `grupoDos = '5'`, se restan **3 días** a la fecha de inicio (**después** de
  alinearla con `getFechaInit`).
- Verificación del ciclo con la fórmula de §3.1: `88 − 57 + 249 = 280` ✓.

---

## 6. Resumen de Configuración por Calendario

| Calendario | Grupos | Subgrupos | Ciclo libres (mec. A) | Ciclo subgrupo (mec. B) | Ciclo subcomún/extra (mec. C) |
|---|---|---|---|---|---|
| Conductor | 5 (1-5) | 8 letras A-H | 35 días | 280 días | 70 días |
| Inspector | 5 (1-5) | 10 letras A-J | 35 días | 350 días | 70 días |
| Inspector_Noche | 5 (1-5) | 10 letras A-J | 35 días | 350 días | 70 días |
| Buho | 5 (1-5) | 8 letras A-H | 35 días | 280 días | 70 días |
| Grua | 5 (1-5) | 3 letras A-C | 35 días | 105 días | — |
| GruaDSM | 5 (1-5) | 50 números 1-50 | 35 días | 350 días | — |
| GruaDSM_Noche | 3 (1-3) | — | 21 días | — | — |
| ParkingDSM_100 | 10 (1-10) | 1 por grupo | 70 días | — | 70 días |
| ParkingDSM_50 | 12 (1-12) | — (sin letra) | 42 días | reducción: ciclo 42 (slot "subgrupo") | parcial: cada 84 (slot "subComunes") |
| Refuerzo_Nocturno | 2 (A,B) | 9 nums + 11 letras | 280 días | — | — |

### 6.1 Contrato de entradas por calendario (para validación del backend)

Qué argumentos acepta el dispatcher por tipo. `grupo` es **int** salvo en Refuerzo
(string `'A'`/`'B'`). Las celdas "—" indican que ese argumento se ignora para ese tipo.

| Calendario | `grupo` válido | `subgrupo` válido | `grupoDos` | Notas |
|---|---|---|---|---|
| Conductor | 1–5 | `A`–`H` | — | |
| Inspector | 1–5 | `A`–`J` | — | |
| Inspector_Noche | 1–5 | `A`–`J` | — | |
| Buho | 1–5 | `A`–`H` | — | |
| Grua | 1–5 | `A`–`C` | — | |
| GruaDSM | 1–5 | **número** 1–50 | — | la UI ofrece, por grupo `g`, los 10 números `{g, g+5, …, g+45}` (`getArrayGruaDSM`); el motor acepta cualquier 1–50 |
| GruaDSM_Noche | 1–3 | — | — | solo libres |
| ParkingDSM_100 | 1–10 | — | — | el "subgrupo" lo deriva del grupo (1 por grupo); va por slot `subComunes` (reducción) |
| ParkingDSM_50 | 1–12 | — | — | sin selección de subgrupo; reducción y parcial se derivan del grupo (ver §5.9) |
| Refuerzo_Nocturno | `A`, `B` | — | Num `1`–`9` **o** Ltr `A`–`K` | `grupoDos` es obligatorio; determina la `pos` (4 tablas de mapeo). `grupoDos='5'` además resta 3 días |

> **Reglas de borde a validar**: GruaDSM con `subgrupo` no numérico o fuera de 1–50 →
> el motor accede a `subgrupo[n-1]` y puede dar `undefined`/excepción (mismo
> comportamiento que el original). El backend debe rechazar (400) antes de llegar al motor.

---

## 7. Modelo conceptual del dominio (el sistema alrededor del motor)

> Esta sección describe el **modelo de negocio** en el que vive el motor. El diseño de BD
> que lo materializa (tablas, SQL, invariantes, flujos, decisiones y su histórico) está en
> **`diseno-bd.md`**: capa de configuración del motor en su §8, capa de dominio/usuario en
> su §9. **Aquí no se duplica nada de eso.**

### 7.1 Generalización multiempresa

Los 10 calendarios del código son casos concretos de un modelo más general, que permite
que el backend soporte **nuevos calendarios sin tocar código** (salvo que se necesite una
función de cálculo nueva):

- **Empresa**: entidad de más alto nivel. El sistema es **multiempresa**.
- **Departamento**: división organizativa dentro de una empresa. El nombre es solo una
  etiqueta (cada empresa puede llamarlo "departamento", "sección", "división"…). Una
  empresa tiene varios departamentos y **cada departamento tiene su propio calendario**.
- **Calendario del departamento**: un conjunto de **tipos de libre**. Cada tipo tiene un
  nombre descriptivo y se calcula con **uno de los tres mecanismos del §3**; sus datos
  base (anclas, secuencias, offsets) viven en BD y **el motor vive en código**.
  Crear/editar/borrar un calendario = gestionar esos datos.
- **Usuario**: pertenece a una empresa y está **adscrito** a un departamento (con su
  grupo/subgrupo si el calendario lo requiere). Su calendario personal = los libres
  calculados de su departamento **+ sus libres personales** (vacaciones, días pedidos,
  cambios, faltas), que son lo único que se persiste.

> Mapeo con el código actual: `tipoCalendario` (Conductor, Inspector…) es hoy un proxy de
> "calendario de un departamento". Al generalizar, un calendario deja de ser un string
> hardcodeado y pasa a ser una fila de BD con su configuración (`diseno-bd.md` §8.1).

### 7.2 Regla de no solapamiento (invariante del dominio)

- Por diseño, un libre de un tipo **nunca** cae en la misma fecha que un libre de otro
  tipo. Por tanto **cada fecha tiene una única categoría**: día de trabajo, o un tipo
  concreto de libre (normal, subgrupo, reducción…).
- **Excepción — los festivos**: un festivo **sí puede coincidir** con un día libre de
  cualquier tipo (normal, subgrupo, comunes…). Los festivos son una **capa aparte** que
  se superpone al calendario, no compiten con los tipos de libre (diseño en curso:
  paso 5 del tablero de `diseno-bd.md`).

> ⚠️ **Matiz frente al código.** La app original aplica un orden de prioridad
> `libres > subgrupo > subComunes` al pintar, para desempatar si una fecha cayera en
> varias listas. Eso **no contradice** la regla: el dominio garantiza que no debería
> haber solape; la prioridad es una **defensa por si lo hubiera**. Si con datos reales
> aparece un solape, es señal de error en la configuración, no de comportamiento esperado.

### 7.3 Lógica del usuario (roles, alta, consulta y cambios)

**Roles y alta de usuarios** (diseño de BD completo en `diseno-bd.md` §9.1):
- Dos roles de momento: **ADMINISTRADOR** y **USER**.
- **El registro de una empresa es un alta completa**: datos de la empresa + datos de su
  **primer administrador** (toda empresa tiene mínimo uno) + **mínimo un departamento con
  los datos de su calendario base** (ciclo días de trabajo / días libres, que es
  obligatorio para crear cualquier departamento).
- La empresa nace **desactivada**: hasta que su primer administrador valide el email y
  active su cuenta, la empresa entera está inactiva (nadie de ella puede operar).
- Los usuarios los **crea el administrador** de su empresa — **no hay auto-registro**
  (la única excepción es el registro de la propia empresa: lo rellena su **primer
  administrador**, que es también un empleado).
- El administrador gestiona además la **estructura**: crea nuevos departamentos (siempre
  con su calendario y tipo de libre base) y crea/edita/elimina **tipos de libre** en
  cualquier departamento de su empresa, con **previsualización** de un año de muestra
  antes de guardar (el motor no valida las propiedades semanales, §3.2–§3.3).
- Cada usuario tiene **su propio email** (también el administrador), que es su
  identificador de login, **único dentro de su empresa** (los datos se tratan a nivel de
  empresa, sin unicidades globales). La misma persona puede tener cuenta en **varias
  empresas** con el mismo email — son cuentas independientes; si al hacer login las
  credenciales coinciden en más de una empresa, se le pide **elegir empresa**.
- **Activación por email**: al crear cualquier usuario (administrador inicial incluido)
  se le envía un enlace con un token de un solo uso y caducidad. Al pulsarlo establece su
  **primera contraseña** y la cuenta pasa a `ACTIVO`. Hasta entonces no puede hacer login.
- **Contraseñas**: caducidad cada X meses (parámetro de la app; se compara contra
  `password_cambiada_en`) y recuperación de contraseña olvidada con el mismo mecanismo
  de token por email.
- Una vez activo, el empleado consulta **su propio calendario**: los libres del
  departamento al que está destinado (calculados por el motor) **+ sus libres
  personales** (vacaciones, días pedidos, cambios, faltas).

**Datos de destino (adscripción):**
- Todo usuario está destinado a un departamento — **también el administrador**, que es un
  trabajador más con permisos de gestión (su destino se indica en el registro de la
  empresa). En el alta de cada usuario se indica **obligatoriamente** su **departamento**
  y, si el calendario del departamento lo requiere, su **grupo/subgrupo** de asignación.
- Se crea su **adscripción** con `fecha_inicio` y sin `fecha_fin` (vigente).

**Consulta pública (sin registro ni login):**
- Ver los **calendarios genéricos** de cualquier departamento (elegir calendario, grupo,
  subgrupo y año) **no requiere registro ni login** — es la funcionalidad de la
  aplicación original y sigue siendo pública. Solo expone estructura y fechas
  calculadas; nunca datos de usuarios ni libres personales.
- El login solo es necesario para el **calendario personal** (y para la gestión, según
  el rol).

**Consulta del calendario personal de un año** (por defecto, el año del sistema):
- Se traen los libres del usuario usando las fechas de inicio/fin de sus adscripciones:
  los libres **solo se pintan dentro de los tramos de adscripción**.
- **Caso normal**: una sola adscripción cubre el año → se calculan los libres de ese año
  para su grupo/subgrupo.
- **Ingreso a mitad de año**: si el usuario entró en mayo, en el calendario de ese año
  solo se le pintan libres desde mayo (antes no pertenecía al departamento).
- **Cambio a mitad de año**: el usuario cambió de grupo o departamento una o más veces
  dentro del año. Se recorren las adscripciones del rango y, **para cada tramo**, se
  aplican los libres del destino correspondiente: el destino antiguo pinta **hasta el
  día anterior al cambio** y el nuevo **desde el día del cambio** (la `fecha_fin` es
  exclusiva).
- **Baja**: tras la fecha de baja no se pinta nada más.
- La adscripción vigente no tiene fecha de fin (`NULL`, que cumple el papel del clásico
  centinela "31-12-2999" — vigencia indefinida): la baja o el cambio ponen la fecha real.

**Libres personales (se superponen al calendario genérico):**
- Tipos: **vacaciones**, **día pedido a la empresa**, **cambio con compañero** (y con la
  empresa), **baja** y **falta**. Se registran como **día suelto o franja**, con ambos
  extremos inclusivos ("del 15-08 al 31-08" incluye el 31).
- **Validaciones**: el rango debe caer dentro de la adscripción del usuario; **solo
  fechas futuras** para vacaciones, días pedidos y cambios (bajas y faltas son hechos
  consumados: se registran a posteriori); no se puede pedir/cambiar un día que **ya es
  libre** del calendario genérico (no aplica a vacaciones ni bajas, que cubren franjas);
  en un cambio, el día **ganado** debe ser de **trabajo** propio y el día **cedido** un
  **libre genérico** propio; **cupo de vacaciones** de 30 días naturales/año
  (configurable por empresa), **prorrateado** por el tiempo de adscripción del año
  (ingresos/bajas a mitad de año ≈ 2,5 días/mes), más los pendientes del año anterior —
  que **caducan el 31 de marzo** (configurable).
- **Las vacaciones pisan los libres**: la franja cubre los libres genéricos que caigan
  dentro — ni se sacan de la franja ni se recuperan después — y cuentan para el cupo.
  **Regla anti-abuso**: entre los periodos de vacaciones del año debe haber un mínimo de
  **6 libres genéricos cubiertos dentro de los 30 días** (cifra confirmada), aunque se
  cojan en varios periodos; con menos de 30 días gastados el mínimo es **proporcional**
  (10 días → 2 libres). Evita cambiar libres con compañeros para fabricar tramos largos
  de trabajo y colocar ahí las vacaciones.
- **Autogestión, sin aprobación de momento**: el usuario es el **administrador de su
  propio calendario** — crea, edita, cambia de fechas y elimina sus registros. El
  sistema valida cada operación: si es viable se anota y se pinta; si no, aviso y no se
  guarda. Sin notificaciones por email (fuera de alcance de momento).
- **El cambio es una anotación personal**: en una sección propia, el usuario indica el
  día que **gana** (su trabajo → libre), el día que **cede** (su libre → trabajo) y, si
  es con compañero, sus datos como **texto informativo** — no hay lista de compañeros ni
  registro espejo en la cuenta del otro. El calendario personal solo lo ve su propio
  usuario: **tampoco el administrador**, que ve el suyo (como usuario) y los públicos.

(Diseño completo de los libres personales: `diseno-bd.md` §9.4.)

**Festivos:**
- Lista **por empresa** (según su ubicación), común a todos sus departamentos. La carga
  **a mano** el administrador: a final de año introduce los festivos del año siguiente
  en un apartado/modal propio.
- Es una **capa informativa**: se pinta superpuesta a lo que haya ese día (trabajo o
  libre de cualquier tipo) y **no genera ni consume nada**. Qué hace el trabajador con
  el festivo (trabajarlo generando un libre, cobrarlo o librarlo) depende de cada
  empresa y queda fuera del alcance del sistema de momento.
- Visible también en la **consulta pública** (no es dato personal).

(Diseño de festivos: `diseno-bd.md` §9.5.)

**Cambios de grupo / departamento (cierran y abren adscripción):**
- **Cambio de grupo** (mismo departamento): `fecha_fin` en la adscripción anterior +
  nueva adscripción con `fecha_inicio` y grupo/subgrupo nuevos.
- **Cambio de departamento**: `fecha_fin` en el departamento antiguo + nueva
  adscripción en el nuevo departamento con su grupo/subgrupo.
- **Convención de fechas**: la `fecha_fin` es **exclusiva** — el día del cambio ya aplica
  el destino nuevo (sin huecos ni solapes). Se permiten cambios **programados a futuro**.
- **Baja**: se cierra la adscripción vigente y la cuenta pasa a desactivada; el histórico
  se conserva (las consultas a años pasados siguen funcionando). Reincorporación = cuenta
  activa de nuevo + adscripción nueva.
- **Edición de datos**: el administrador edita los datos de los usuarios de su empresa;
  el usuario, sus datos de contacto. **Cambiar el email** (es el login) exige validarlo
  con un enlace enviado al email nuevo; hasta entonces sigue valiendo el antiguo.

(El diseño completo de la adscripción — tabla, constraint anti-solape, flujos — está en
`diseno-bd.md` §9.2.)

### 7.4 El calendario del usuario NO se persiste

Decisión central del diseño: el calendario de libres de un usuario **se calcula al vuelo**
a partir de (1) sus adscripciones vigentes en el rango consultado, (2) la configuración
del calendario de cada (departamento, grupo, subgrupo) y (3) las funciones del motor. A
los libres calculados se les **superponen** sus libres personales (vacaciones, cambios,
faltas…), que son **lo único que se persiste** sobre libres del usuario. Diseño completo
en `diseno-bd.md` §9 (los trade-offs originales, en su §5 histórico).

---

## 8. Guía de implementación del backend (Fastify + Prisma + TypeScript)

Stack destino: **Fastify + Prisma + TypeScript** sobre **PostgreSQL**. Antes de crear el
esquema, leer las **notas Prisma/TypeScript** de `diseno-bd.md` §0 (constraints que no
caben en `schema.prisma`, la trampa de `@db.Date`, e importar el motor JS desde TS).

### 8.1 El motor ya está extraído; cómo se invoca

La extracción ya está hecha: `motor-calendarios/` es JS puro (ES modules), sin DOM ni
dependencias, **verificado contra el código original en 2961 comprobaciones con 0
diferencias** (ver su `README.md`). El backend lo importa tal cual desde
`motor-calendarios/index.js`, que expone el dispatcher y dos helpers:
`serializarFecha()` (Date → `"YYYY-MM-DD"` en hora local) y `calcularCalendario()`
(devuelve las 3 listas ya serializadas — justo lo que un endpoint necesita responder).

El **único punto de entrada** del cálculo es el dispatcher, con 3 funciones:

```js
const listaLibres     = getDatosListaLibres(tipo, year, grupo, grupoDos) ?? [];
const listaSubgrupo   = getDatosListaSubgrupo(tipo, year, grupo, subgrupo) ?? [];
const listaSubComunes = getDatosListaSubComunes(tipo, year, grupo, subgrupo) ?? [];
```

> ⚠️ El `?? []` **no es opcional**: muchos tipos no manejan las 3 listas y devuelven
> `undefined` (ej. GruaDSM_Noche no tiene subgrupo). El backend debe devolver `[]` en
> esos casos, nunca `null`/`undefined`. (`calcularCalendario` ya lo hace por dentro.)

Cuidado con dos mapeos contraintuitivos del dispatcher (ver §5):
- **GruaDSM**: en `getDatosListaSubgrupo` el subgrupo es un **número** (1–50), no letra.
- **ParkingDSM_50**: lo que el dispatcher llama "Subgrupo" es la **reducción**, y lo que
  llama "SubComunes" es la **jornada parcial**. No invertir las columnas al modelar.

> La forma más rápida de tener un backend funcional **hoy**: importar el motor y exponer
> `calcularCalendario` tras un endpoint HTTP. La persistencia/CRUD (§8.3) se añade
> después. **Recomendado hacerlo en dos fases** para no bloquear el backend en el modelado.

### 8.2 Estructura de proyecto orientativa (adaptar a la del proyecto existente)

```
backend/
├── prisma/
│   ├── schema.prisma             # esquema de diseno-bd.md §8–§9 (ver su §0: los
│   └── migrations/               #   EXCLUDE/CHECK se editan a mano en el SQL)
├── src/
│   ├── server.ts                 # Fastify: plugins, CORS, registro de rutas
│   ├── motor/                    # ← motor-calendarios/ importado tal cual (JS ESM)
│   ├── repositories/
│   │   └── calendarioRepo.ts     # lectura/escritura de la config (Prisma)
│   ├── services/
│   │   └── calendarioService.ts  # carga config BD → motor → fechas serializadas
│   ├── schemas/
│   │   └── calendario.schema.ts  # JSON Schema por ruta (validación + serialización)
│   └── routes/
│       ├── calendarios.ts        # CRUD de definiciones
│       └── fechas.ts             # cálculo (sustituye al dispatcher como API pública)
└── package.json
```

### 8.3 Dos fases de persistencia

**Fase 1 — motor + endpoint (sin BD de config).** Las constantes siguen en el código;
el backend solo expone el cálculo. Cero riesgo de romper fechas.

**Fase 2 — persistir la configuración.** Mover anclas, secuencias y offsets a BD con el
esquema de `diseno-bd.md` §8. El motor lee la config desde BD en vez de hardcodearla; el
CRUD edita esa config. `crearCalendarioBasico(config)` **ya recibe la config como
objeto**, así que basta construir ese objeto desde las filas de BD en lugar de desde
`FechasConductor.js`.

**Opcional — caché de resultados.** Tabla `calendario_resultado(calendario_id, year,
grupo, subgrupo, …jsonb)` para no recalcular años consultados a menudo. Invalidar al
editar la config. Es **caché, no fuente de verdad**.

### 8.4 Endpoints (resumen ejecutable)

| Método | Ruta | Sustituye a | Notas |
|---|---|---|---|
| `GET` | `/calendarios/:tipo/fechas?year&grupo&subgrupo&grupoDos` | las 3 `getDatos*` | devuelve `{libres,subgrupo,subComunes}` en `YYYY-MM-DD`; faltantes = `[]` |
| `GET` | `/calendarios/:tipo/grupos` | select de grupos de la app original | grupos válidos del tipo |
| `GET` | `/calendarios/:tipo/subgrupos?grupo` | select de subgrupos de la app original | en GruaDSM depende del grupo (`getArrayGruaDSM`) |
| `GET/POST/PUT/DELETE` | `/calendarios[/:id]` | — | CRUD de definiciones (Fase 2) |

Ejemplo de la ruta de cálculo:

```
GET /calendarios/Conductor/fechas?year=2026&grupo=1&subgrupo=A
→ { "libres": ["2026-01-04", ...], "subgrupo": ["2026-01-15", ...], "subComunes": [...] }
```

> ⚠️ **Refuerzo_Nocturno NO usa `subgrupo`**: el cuarto argumento es **`grupoDos`**
> (número `1`–`9` o letra `A`–`K`), y `grupo` es `'A'`/`'B'`. Ejemplo:
> `GET /calendarios/Refuerzo_Nocturno/fechas?year=2026&grupo=A&grupoDos=5`.
> (Un error frecuente del intento anterior fue tratar `grupoDos` como si fuera `subgrupo`.)

> **Fase 2 (config en BD)**: este contrato de 3 slots es el de la **Fase 1** (motor
> hardcodeado, compatible con la app original). Cuando la configuración viva en BD lo
> sustituye el contrato **por tipos de libre** — lista de N tipos + festivos — definido
> en `diseno-bd.md` §9.7, con la misma serialización y la misma regla del `[]`.

### 8.5 Validación con JSON Schema (nativo de Fastify)

Validar en cada ruta de cálculo, devolviendo 400 si algo no encaja (los valores válidos
por calendario están en la tabla del §6.1):

- `tipo` ∈ los 10 `tipoCalendario` (§2.2).
- `year` entero en rango razonable (p.ej. 2020–2050).
- `grupo`: dentro de los válidos del tipo (1..N, o `A`/`B` en Refuerzo). Ojo: Refuerzo
  usa grupo string; el resto lo parsea a int (la app original ya distinguía).
- `subgrupo`: dentro de los válidos del tipo (y, en GruaDSM, del grupo).
- `grupoDos`: **requerido solo** para `Refuerzo_Nocturno`.

### 8.6 Trampas y notas de implementación (no saltárselas)

1. **Zona horaria al serializar fechas.** El motor compara en **hora local**
   (`getFullYear/getMonth/getDate`). `toISOString().slice(0,10)` desplaza **un día** en
   España (UTC+1/+2). Serializar siempre con `serializarFecha` (o construir `YYYY-MM-DD`
   desde los getters locales). En BD, fechas civiles como **`DATE`** (nunca `timestamptz`).
2. **Mes 0-indexed en JavaScript**: en `new Date(year, month, day)` los meses van de 0
   (enero) a 11 (diciembre). La app original usa internamente claves
   `${year}-${month}-${day}` con mes 0-indexed solo para comparar en memoria; para
   persistir o exponer por API, siempre `"YYYY-MM-DD"` 1-indexed con cero a la izquierda.
   No confundir ambos formatos.
3. **Día de semana**: JS devuelve domingo=0 … sábado=6 (`getDay()`). Los mapas día→pos
   del mecanismo B usan esa convención.
4. **No reescribir `getFechaInit`.** Heurística histórica validada contra calendarios
   impresos. Persistir sus *entradas* (anclas, `totalSecuencia`), no tocar su lógica.
5. **Clonar los `Date`** si se manipula el motor: las matrices de anclas son referencias
   de módulo; mutarlas corrompe llamadas posteriores (el motor ya clona internamente).
6. **Orden de prioridad** al clasificar un día: `libres > subgrupo > subComunes`
   (§7.2). Mantenerlo si el backend devuelve días ya clasificados.
7. **Las particularidades ya están modeladas en BD** (`diseno-bd.md` §8): subgrupo
   numérico de GruaDSM y a nivel calendario (`subgrupo.tipo`, `grupo_id` NULL), doble
   tipo extra de ParkingDSM_50 (dos `tipo_libre`), y Refuerzo_Nocturno (config
   relacional `cfg_refuerzo` + `cfg_refuerzo_pos`; el backend valida con 400 las
   combinaciones inexistentes en vez de degradar a `pos 0` como el código original).
8. **Años bisiestos**: regla gregoriana estándar; el motor la hereda de `Date` de JS.
9. **Nota histórica (BUG-01)**: `FechasInspectorNoche.js` tuvo typos `new Date(2022,21)`
   (faltaba el día) que JS rebalanceaba a otros años. Ya corregido; sirve de recordatorio
   para validar fechas literales al hacer el seed.

### 8.7 Red de seguridad: los tests existentes

`tests/calendarios/` tiene **626+ tests** validados contra calendarios impresos
oficiales (puede reapuntarse a `motor-calendarios/`). Al portar el motor al backend,
**reutilizar esa suite** garantiza que el backend produce fechas **idénticas** a las
validadas. Es la mejor defensa contra regresiones silenciosas al introducir la
persistencia (Fase 2): la versión data-driven debe pasar la suite completa leyendo su
configuración desde BD, **más** un harness de equivalencia BD ↔ motor hardcodeado (10
calendarios × grupos/subgrupos × varios años, 0 diferencias — `diseno-bd.md` §9.8).

### 8.8 Mapa archivo → destino en el backend

| Archivo (`motor-calendarios/`) | Responsabilidad | Destino |
|---|---|---|
| `index.js` | API pública + `serializarFecha`/`calcularCalendario` | ✅ punto de import del backend |
| `DatosFechas.js` | Dispatcher tipo→función | ➡️ se vuelve el endpoint `/fechas` |
| `FuncionesComunes.js` | Motor de iteración | ✅ importar tal cual |
| `FechasFactory.js` | Factoría declarativa | ✅ importar (config desde BD en Fase 2) |
| `FechasConductorInspector.js` | Offsets de grupo compartidos | ✅ importar |
| `FechasConductor/Inspector/InspectorNoche/Buho.js` | Config declarativa | ➡️ su config pasa a ser datos de BD |
| `FechasGrua/GruaDSM/GruaDSMNoche/Parking*/Refuerzo*.js` | Lógica propia | ✅ importar; su config → BD |

Responsabilidades que estaban en la aplicación original (fuera del motor) y se sustituyen:

| Responsabilidad original | Sustituida por |
|---|---|
| Listas de los selects (categorías, grupos, subgrupos) | endpoints `/grupos`, `/subgrupos` + tablas de BD |
| Pintado de la rejilla, clases CSS, rótulos | el frontend que consuma la API |
