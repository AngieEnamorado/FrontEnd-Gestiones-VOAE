import { PERIODOS, PERIODO_ACTUAL } from "../../data/mockProcadEstadisticas";
import { ordenarSeleccion } from "./secciones/catalogoTarjetas";
import type { FiltrosProcad, TipoAgrupacion } from "../../types";

/**
 * El puente entre el panel y el reporte personalizado.
 *
 * La selección y los filtros viajan en la URL y no en memoria: así el reporte
 * se puede recargar, guardar en marcadores o pasar a alguien más, y el camino
 * de vuelta —«seguir personalizando»— llega al armador con lo mismo que se
 * había elegido.
 */

export const FILTROS_INICIALES: FiltrosProcad = {
  periodo: PERIODO_ACTUAL,
  centro: "todos",
  tipo: "todos",
  agrupacion: "todas",
};

export const RUTA_REPORTE = "/procad/estadisticas/personalizado";
export const RUTA_PANEL = "/procad/estadisticas";

/** Nombre del parámetro con las métricas elegidas, en cada sentido del viaje. */
export const PARAM_REPORTE = "t";
export const PARAM_PERSONALIZAR = "personalizar";

/**
 * Cómo se muestra el reporte: con las gráficas del panel o con las cifras en
 * tablas, que es la forma que se adjunta a un oficio. Viaja en la URL como
 * todo lo demás, para que el enlace lleve también el modo en que se armó.
 */
export type ModoReporte = "graficas" | "tablas";
export const PARAM_VISTA = "v";

/**
 * Marca que el reporte se abrió para descargarlo, no para mirarlo: lo pone
 * «Exportar página PDF» cuando se pide en gráficas. El panel no puede
 * fotografiarlas por su cuenta —solo tiene montado el apartado de la pestaña
 * activa—, así que el trabajo lo hace esta página, que las dibuja todas. Se
 * borra de la URL en cuanto arranca la descarga, para que recargar o compartir
 * el enlace no la repita.
 */
export const PARAM_DESCARGA = "descargar";

export function modoDesdeParametros(params: URLSearchParams): ModoReporte {
  return params.get(PARAM_VISTA) === "tablas" ? "tablas" : "graficas";
}

export function construirConsulta(
  numeros: string[],
  filtros: FiltrosProcad,
  clave: string = PARAM_REPORTE,
  modo?: ModoReporte,
): string {
  const params = new URLSearchParams({
    [clave]: numeros.join(","),
    periodo: filtros.periodo,
    centro: filtros.centro,
    tipo: filtros.tipo,
    agrupacion: filtros.agrupacion,
  });
  if (modo) params.set(PARAM_VISTA, modo);
  return `?${params.toString()}`;
}

/** Solo deja pasar valores que existen; lo demás vuelve al valor por defecto. */
export function filtrosDesdeParametros(params: URLSearchParams): FiltrosProcad {
  const periodo = params.get("periodo");
  const tipo = params.get("tipo");

  return {
    periodo: PERIODOS.some((p) => p.id === periodo) ? periodo! : FILTROS_INICIALES.periodo,
    centro: params.get("centro") || FILTROS_INICIALES.centro,
    tipo:
      tipo === "deportivo" || tipo === "artistico"
        ? (tipo as TipoAgrupacion)
        : FILTROS_INICIALES.tipo,
    agrupacion: params.get("agrupacion") || FILTROS_INICIALES.agrupacion,
  };
}

/** Las métricas del parámetro, sin inventadas y en el orden del catálogo. */
export function numerosDesdeParametros(
  params: URLSearchParams,
  clave: string = PARAM_REPORTE,
): string[] {
  const crudo = params.get(clave);
  if (!crudo) return [];
  return ordenarSeleccion(crudo.split(",").map((n) => n.trim()));
}
