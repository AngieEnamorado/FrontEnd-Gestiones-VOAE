import type { AgrupacionProcad, FiltrosProcad, ResumenCentro } from "../../../types";
import type { SeccionReportePdf } from "../../../utils/exportarPdf";

/**
 * Lo que cada sección necesita para dibujarse. Se arma una sola vez en la
 * página y se pasa igual a todas: así las seis secciones describen siempre la
 * misma rebanada de datos, y un filtro no puede significar una cosa en una
 * tarjeta y otra en la de al lado.
 */
export interface ContextoSeccion {
  /** Recorte completo: respeta los cuatro filtros. */
  datos: AgrupacionProcad[];
  /**
   * Recorte sin el filtro de agrupación. Lo usa la tarjeta que resalta una y
   * atenúa al resto: con el recorte completo no quedaría resto que atenuar.
   */
  datosAmplios: AgrupacionProcad[];
  /** Agrupaciones colapsadas por centro regional, ya escaladas al período. */
  centros: ResumenCentro[];
  indicePeriodo: number;
  filtros: FiltrosProcad;
  /** Nombre de la agrupación filtrada, o `null` si están todas. */
  resaltada: string | null;
}

/** Cada sección sabe armar su propio aporte al PDF, con las cifras que muestra. */
export type ConstructorPdf = (ctx: ContextoSeccion) => SeccionReportePdf[];
