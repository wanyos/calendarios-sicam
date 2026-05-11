import { defineConfig } from 'vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// WHY: en módulos ESM no existen __dirname ni __filename. Los reconstruimos
// a partir de import.meta.url para poder resolver rutas absolutas dentro
// del config.
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => ({
  // WHY: rutas relativas en el HTML generado (./assets/...) en lugar
  // de absolutas (/assets/...). Permite servir el build desde cualquier
  // ubicación: Live Server abriendo /build/index.html, file:// directo,
  // raíz de un dominio o un subpath. Esta app no usa router, así que
  // no hay caso donde las rutas absolutas sean preferibles.
  base: './',

  // WHY: index.html vive en src/ junto al resto del código (estilo.css,
  // img/, calendarios/). Mantenemos esa estructura en lugar de mover
  // archivos solo para seguir la convención Vite por defecto.
  root: 'src',

  // WHY: alias intercambiable según el --mode de build. Por defecto
  // (mode === 'development' al hacer `vite` o 'production' al hacer
  // `vite build`) se carga la config SICAM. Con `--mode whitelabel`
  // se carga la config sin marca. El código consumer importa siempre
  // desde '@branding' sin saber cuál de los dos está activo.
  resolve: {
    alias: {
      '@branding': resolve(
        __dirname,
        mode === 'whitelabel'
          ? 'src/branding/whitelabel.js'
          : 'src/branding/sicam.js'
      ),
    },
  },

  build: {
    // WHY: outDir es relativo al root (que es 'src'), por eso lleva '../'.
    // Cada build escribe a su propia carpeta para que los dos artefactos
    // puedan coexistir en disco — la página externa (WordPress) recibe la
    // carpeta tal cual y espera el index.html en la raíz, así que el build
    // SICAM mantiene el nombre convencional 'dist/' y el white-label va a
    // 'dist-wl/' paralelo. emptyOutDir solo vacía la suya, no la hermana.
    outDir: mode === 'whitelabel' ? '../dist-wl' : '../dist',

    // WHY: outDir está fuera del root, así que Vite por seguridad no
    // la vacía por defecto (para evitar borrados accidentales). Aquí
    // sabemos que es nuestra y queremos build limpio cada vez.
    emptyOutDir: true,
  },
}))
