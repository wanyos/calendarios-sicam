# Migración webpack → Vite + auditoría de dependencias

**Fecha:** 2026-05-07
**Autor:** wanyos (con asistencia)
**Estado:** Aprobado, listo para implementar

## Contexto

Proyecto antiguo de **JavaScript vanilla** (HTML + CSS + JS, sin framework) que calcula calendarios de turnos de SICAM/EMT. Usa webpack 5 + babel como bundler. La carpeta del proyecto está bajo `vue/projects-emt/` por organización histórica, pero **no contiene Vue** ni ningún otro framework.

### Estado actual

- **Build:** webpack + babel + html-webpack-plugin → output a `build/`.
- **Entry:** `src/index.html` (template) + `src/index.js`.
- **Lógica:** 14 módulos en `src/calendarios/` (Conductor, Inspector, Grua, Buho, Parking, etc.).
- **CSS y assets:** `src/estilo.css` y `src/img/` se cargan vía `<link>` y `<img>` directos en HTML — NO se importan desde JS. Webpack actualmente no los procesa: están copiados a mano en `build/`.
- **Deploy:** `npm run build` produce `build/`, que se sube a producción manualmente. Los workflows de GitHub Actions (`.github/workflows/`) son legacy de pruebas con Azure y deben eliminarse.
- **`node_modules/` y `build/`** están commiteados al repo (sin `.gitignore` previo a esta tarea).

## Objetivos

1. Migrar de webpack a Vite (DX moderna, builds rápidos, dev server con HMR).
2. Eliminar dependencias muertas o redundantes.
3. Limpiar el repo de carpetas/archivos que no aportan (`node_modules/`, `build/`, workflows obsoletos).
4. **Sin romper el funcionamiento** — verificación manual antes/después.

### Fuera de alcance (YAGNI)

- Introducir Vue, React u otro framework. Se mantiene vanilla JS.
- Añadir TypeScript, ESLint o Prettier.
- Añadir tests automáticos.
- Refactorizar la lógica de los calendarios.

## Decisiones tomadas

| Decisión | Elegido | Alternativa descartada | Por qué |
|---|---|---|---|
| Alcance | Solo modernizar tooling | Reescribir como Vue 3 / solo auditoría | Mejor ratio riesgo/beneficio. |
| Verificación | Comparación manual antes/después | Tests automáticos / smoke test ciego | App pequeña, sin tests previos, verificación humana basta. |
| Estructura `src/` | Mantener `index.html` en `src/` | Mover a la raíz (convención Vite) | Cohesión del directorio `src/` actual. |
| Output dir | Mantener `build/` | Cambiar a `dist/` (default Vite) | Conserva el contrato con el proceso de deploy actual. |
| Branching | Rama `chore/migrate-vite` con merge `--no-ff` a `main` | Trabajar directo en `main` | Red de seguridad gratis, merge visible en log. |
| Commits | Uno por fase (3 commits + doc) | Un solo commit final | Permite `git revert` quirúrgico si algo falla. |

## Plan en 5 fases

### Fase 0 — Limpieza obvia (1 commit)

- Borrar `.github/workflows/azure-static-web-apps-orange-field-04b93e203.yml`.
- Borrar `.github/workflows/main_calendaremt.yml`.
- Borrar `.github/` si queda vacía.
- `git rm -r --cached node_modules/` (los archivos siguen en disco).
- `git rm -r --cached build/`.
- Ampliar `.gitignore` con `node_modules/`, `build/`, `dist/`.

**Commit:** `chore: remove obsolete azure workflows and untrack build/node_modules`

### Fase 1 — Capturar baseline (sin commit)

- `npm run build` con webpack actual.
- Copiar `build/` a `/tmp/calendarios-baseline-build/` como referencia inmutable.
- Servir con `npx serve build` y abrir en navegador.
- **Checklist manual:**
  - Cada opción del select: Conductor, Inspector, Inspector_Noche, Grua, GruaDSM, GruaDSM_Noche, ParkingDSM_100, ParkingDSM_50, Refuerzo_Nocturno, Buho.
  - Año bisiesto (2024) y no bisiesto (2025) — febrero debe mostrar 29 vs 28.
  - Refuerzo_Nocturno con radios Num/Ltr — ambos selects funcionales.

### Fase 2 — Migración a Vite (1 commit)

**Crear `vite.config.js`** en raíz:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
})
```

**Reemplazar scripts en `package.json`:**

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

**Instalar:** `npm install -D vite`.

**No tocar:** `src/index.html`, `src/index.js`, `src/calendarios/*`, `src/estilo.css`, `src/img/`.

**Commit:** `chore: migrate build tooling from webpack to vite`

### Fase 3 — Auditoría de dependencias (1 commit)

```bash
npm uninstall @babel/cli @babel/core @babel/preset-env babel-loader \
  css-loader html-webpack-plugin style-loader webpack webpack-cli
```

Borrar también `webpack.config.js`.

Resultado esperado en `package.json`: una sola devDep (`vite`), cero deps de runtime.

**Commit:** `chore: drop unused webpack and babel dependencies`

### Fase 4 — Verificación visual (sin commit)

- `npm run build` → comparar tamaño/estructura con baseline.
- `npm run preview` → re-pasar checklist completo de Fase 1.
- `npm run dev` → comprobar HMR con un cambio trivial en cualquier `.js`.

### Fase 5 — Merge (1 acción de git)

```bash
git checkout main
git merge --no-ff chore/migrate-vite
```

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Vite procesa los assets de forma incompatible | Baja | Comparar `build/` con baseline; los paths relativos en HTML son comportamiento estándar de Vite. |
| Algún navegador antiguo (IE11, Safari muy viejo) no soporta el target ES2020 default de esbuild | Desconocida | Confirmar lista de navegadores de soporte. Si necesario, añadir `@vitejs/plugin-legacy` o ajustar `build.target`. |
| Una dep "muerta" no era tan muerta (uso indirecto) | Muy baja | Fase 3 tiene su propio commit; `git revert` aislado restaura. |
| El proceso de deploy depende de detalles que no conocemos | Media | El script `npm run build` produce `build/` igual que antes — contrato preservado. |

## Cómo revertir

- **Una fase concreta falla:** `git revert <hash-del-commit-de-esa-fase>`.
- **Toda la migración falla:** descartar la rama (`git branch -D chore/migrate-vite`) sin mergear. `main` queda intacto.
- **Después del merge a `main` algo se rompe en producción:** `git revert -m 1 <hash-del-merge>` revierte la rama entera.
