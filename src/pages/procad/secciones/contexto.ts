import type { AgrupacionProcad, FiltrosProcad, ResumenCentro } from "../../../types";
import { agrupacionesProcad } from "../../../data/mockProcadEstadisticas";
import {
  filtrarParaCentros,
  filtrarPorAgrupacion,
  filtrarPorTipoYCentro,
  indiceDePeriodo,
  resumenPorCentro,
} from "../../../utils/procadMetricas";
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

/**
 * Arma el contexto a partir de los filtros. Vive aquí y no en la página porque
 * el reporte personalizado —que es otra ruta— tiene que recortar los datos
 * exactamente igual que el panel; si cada uno lo hiciera por su cuenta, el
 * reporte podría enseñar otra rebanada.
 */
export function construirContexto(filtros: FiltrosProcad): ContextoSeccion {
  const indicePeriodo = indiceDePeriodo(filtros.periodo);
  return {
    datos: filtrarPorAgrupacion(agrupacionesProcad, filtros),
    datosAmplios: filtrarPorTipoYCentro(agrupacionesProcad, filtros),
    centros: resumenPorCentro(filtrarParaCentros(agrupacionesProcad, filtros), indicePeriodo),
    indicePeriodo,
    filtros,
    resaltada: filtros.agrupacion === "todas" ? null : filtros.agrupacion,
  };
}
