import { HiOutlineMusicalNote, HiOutlineTrophy } from "react-icons/hi2";
import type { EstadoActividadProcad, TipoAgrupacion } from "../../types";

/**
 * Cómo se nombra y cómo se pinta una actividad.
 *
 * Vive aparte porque lo usan la tarjeta, el detalle y los apartados de la
 * pantalla a la vez: si cada uno tradujera `OBSERVADA` por su cuenta, tarde o
 * temprano la tarjeta diría una cosa y el detalle otra.
 */

export const ETIQUETA_ESTADO: Record<EstadoActividadProcad, string> = {
  PENDIENTE_VALIDACION: "Pendiente",
  VALIDADA: "Validada",
  OBSERVADA: "Observada",
  RECHAZADA: "Rechazada",
};

/** El orden en que se recorren: primero lo que espera, al final lo cerrado. */
export const ORDEN_ESTADOS: EstadoActividadProcad[] = [
  "PENDIENTE_VALIDACION",
  "VALIDADA",
  "OBSERVADA",
  "RECHAZADA",
];

/**
 * El punto de color del estado. Es un punto y no un fondo porque la píldora va
 * encima de una fotografía: un disco de 6px se lee sobre cualquier imagen, y
 * un relleno de color tendría que pelearse con lo que hay detrás.
 */
export const PUNTO_ESTADO: Record<EstadoActividadProcad, string> = {
  PENDIENTE_VALIDACION: "bg-amber-500",
  VALIDADA: "bg-emerald-500",
  OBSERVADA: "bg-blue-500",
  RECHAZADA: "bg-rose-500",
};

/** El tono de la caja donde se lee lo que se resolvió, del color del estado. */
export const CAJA_ESTADO: Record<EstadoActividadProcad, string> = {
  PENDIENTE_VALIDACION: "border-amber-200 bg-amber-50/70",
  VALIDADA: "border-emerald-200 bg-emerald-50/70",
  OBSERVADA: "border-blue-200 bg-blue-50/70",
  RECHAZADA: "border-rose-200 bg-rose-50/70",
};

export const ETIQUETA_TIPO: Record<TipoAgrupacion, string> = {
  deportivo: "Deportiva",
  artistico: "Artística",
};

export const ICONO_TIPO = {
  deportivo: HiOutlineTrophy,
  artistico: HiOutlineMusicalNote,
} as const;

/** El tinte de la píldora de clasificación, del mismo par en toda la pantalla. */
export const TINTE_TIPO: Record<TipoAgrupacion, string> = {
  deportivo: "bg-unah-navy/8 text-unah-navy",
  artistico: "bg-unah-orange/12 text-unah-orange-dark",
};

/**
 * El degradado rayado del carnet institucional, en navy, para la portada de
 * una actividad que todavía no tiene fotos.
 *
 * No es un rectángulo gris de relleno: una actividad sin álbum es un estado
 * normal y frecuente —las fotos llegan días después del evento—, así que se
 * dibuja con la misma tela que el resto del sistema en vez de parecer un
 * hueco donde algo falló.
 */
export const FONDO_SIN_PORTADA =
  "repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 14px, rgba(255,255,255,0) 14px 36px), linear-gradient(140deg, #06478e 0%, #003875 55%, #00254e 100%)";
