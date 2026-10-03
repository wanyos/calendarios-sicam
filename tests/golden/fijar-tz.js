// WHY: módulo sin exports que solo fija la zona horaria. Debe ser el
//      PRIMER import de generar.js: los imports ESM se evalúan en orden,
//      así que esto corre antes de que los calendarios creen sus Date.
import { TZ_GOLDEN } from './config.js';

process.env.TZ = TZ_GOLDEN;
