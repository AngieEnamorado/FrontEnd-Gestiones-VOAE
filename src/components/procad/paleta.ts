import type { EstadoSolicitudProcad, TipoAgrupacion } from "../../types";

// Paleta de los gráficos de PROCAD. Está aquí, y no repartida en cada
// componente, porque un color tiene que significar siempre lo mismo: si
// "deportivo" es azul en una tarjeta, lo es en todas, sin importar el orden en
// que los datos filtrados lo devuelvan.

/**
 * Identidad (categórico). Orden fijo: el color sigue a la entidad, nunca a su
 * posición en la lista. Verificado con el validador de paletas: banda de
 * luminosidad, piso de croma, separación para daltonismo (ΔE 26.7 protan) y
 * contraste contra la superficie, todos aprobados.
 */
export const COLOR_TIPO: Record<TipoAgrupacion, string> = {
  deportivo: "#2C6BC4",
  artistico: "#C07D18",
};

export const ETIQUETA_TIPO: Record<TipoAgrupacion, string> = {
  deportivo: "Deportivo",
  artistico: "Artístico",
};

/** Serie única para conteos, cuando no hay identidad que distinguir. */
export const COLOR_SERIE = COLOR_TIPO.deportivo;

/**
 * Umbrales (estado, no identidad). Un porcentaje por debajo de 40 es un
 * problema, no una categoría más. El número siempre se imprime junto a la
 * barra: el color acompaña, nunca es el único canal.
 */
export const UMBRAL_BAJO = 40;
export const UMBRAL_ALTO = 70;

export const COLOR_UMBRAL = {
  bajo: "#e11d48",
  medio: "#d97706",
  alto: "#059669",
  sinDato: "#cbd5e1",
} as const;

export function colorUmbral(pct: number | null): string {
  if (pct === null) return COLOR_UMBRAL.sinDato;
  if (pct < UMBRAL_BAJO) return COLOR_UMBRAL.bajo;
  if (pct < UMBRAL_ALTO) return COLOR_UMBRAL.medio;
  return COLOR_UMBRAL.alto;
}

/** Estados de una solicitud, alineados con los colores de `EstadoBadge`. */
export const COLOR_ESTADO: Record<EstadoSolicitudProcad, string> = {
  aprobada: "#059669",
  observada: "#d97706",
  noCumple: "#e11d48",
  pendiente: "#64748b",
};

export const ETIQUETA_ESTADO: Record<EstadoSolicitudProcad, string> = {
  aprobada: "Aprobada",
  observada: "Observada",
  noCumple: "No cumple requisito",
  pendiente: "Pendiente",
};

export const ORDEN_ESTADOS: EstadoSolicitudProcad[] = [
  "aprobada",
  "pendiente",
  "observada",
  "noCumple",
];

// Cromo del gráfico: retrocede para que el dato sea lo único que pesa.
export const COLOR_REJILLA = "#e2e8f0";
export const COLOR_EJE = "#94a3b8";
export const COLOR_PISTA = "#eef1f7";
/** La superficie de la tarjeta: es la que separa marcas que se tocan. */
export const COLOR_SUPERFICIE = "#ffffff";
