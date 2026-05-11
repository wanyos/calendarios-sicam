// Config de branding para el build SICAM (mode por defecto).
// El archivo paralelo whitelabel.js debe mantener este mismo shape.

// WHY: el sufijo ?url fuerza a Vite a tratar el PNG como asset (lo procesa,
// le añade hash de contenido y lo copia a dist/assets). Sin él, un string
// hardcodeado funciona en dev pero se rompe en build: Vite no detecta la
// dependencia y el PNG no entra en el bundle.
import logoSrc from '../img/logo-sicam.png?url'

export default {
    enabled:     true,
    title:       'Calendarios · SICAM',
    eyebrow:     'Sindicato de Conductores · EMT Madrid',
    footerText:  '© Sicam EMT · Madrid',
    logoSrc,
    logoAlt:     'SICAM Madrid',
}
