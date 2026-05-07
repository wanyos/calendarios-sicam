import { defineConfig } from 'vite'

export default defineConfig({
  // WHY: index.html vive en src/ junto al resto del código (estilo.css,
  // img/, calendarios/). Mantenemos esa estructura en lugar de mover
  // archivos solo para seguir la convención Vite por defecto.
  root: 'src',

  build: {
    // WHY: outDir es relativo al root, por eso '../build'. Mantiene
    // el contrato con el deploy actual: la carpeta de producción
    // sigue siendo build/ en la raíz del repo.
    outDir: '../build',

    // WHY: outDir está fuera del root, así que Vite por seguridad no
    // la vacía por defecto (para evitar borrados accidentales). Aquí
    // sabemos que es nuestra y queremos build limpio cada vez.
    emptyOutDir: true,
  },
})
