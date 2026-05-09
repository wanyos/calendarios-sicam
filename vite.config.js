import { defineConfig } from 'vite'

export default defineConfig({
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

  build: {
    // WHY: outDir es relativo al root, por eso '../build'. Mantiene
    // el contrato con el deploy actual: la carpeta de producción
    // sigue siendo build/ en la raíz del repo.
    outDir: '../dist',

    // WHY: outDir está fuera del root, así que Vite por seguridad no
    // la vacía por defecto (para evitar borrados accidentales). Aquí
    // sabemos que es nuestra y queremos build limpio cada vez.
    emptyOutDir: true,
  },
})
