import type { GrupoVoluntariado, RedTematica } from "../types";
import type { TrimestreApi } from "../api/voluntariado";

// Presentación derivada de los datos de Voluntariado: lo que la base no
// guarda (colores, monogramas) pero las pantallas necesitan dibujar.

/** Las fechas llegan como ISO de medianoche UTC; cortar evita que UTC−6 las corra un día. */
export function fechaCorta(fecha: string | null | undefined): string {
  return fecha ? fecha.slice(0, 10) : "";
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const COLORES_LOGO: GrupoVoluntariado["logoColor"][] = ["amber", "emerald", "rose", "violet", "navy"];
const COLORES_RED: RedTematica["color"][] = ["emerald", "rose", "blue", "amber", "violet"];

/** Mientras no haya logo subido, el monograma toma un color fijo por grupo. */
export function colorDeGrupo(idGrupo: number): GrupoVoluntariado["logoColor"] {
  return COLORES_LOGO[idGrupo % COLORES_LOGO.length];
}

/** Color estable por red: el mismo id siempre da el mismo color en todas las pantallas. */
export function colorDeRed(idRed: number): RedTematica["color"] {
  return COLORES_RED[idRed % COLORES_RED.length];
}

/** "1,3" → [1, 3], para las listas que la API agrega con STRING_AGG. */
export function listaDeIds(texto: string | null | undefined): number[] {
  return texto ? texto.split(",").map(Number) : [];
}

const ROMANOS = ["I", "II", "III", "IV"];

export function nombreTrimestre(t: { anioTrimestre: number; numeroTrimestre: number }): string {
  return `${ROMANOS[t.numeroTrimestre - 1]} Trimestre ${t.anioTrimestre}`;
}

export function nombrePac(anio: number, numeroPac: number): string {
  return `${ROMANOS[numeroPac - 1]} PAC ${anio}`;
}

/** El trimestre que contiene la fecha dada, o el último que ya empezó. */
export function trimestreDeFecha(trimestres: TrimestreApi[], fecha: string): TrimestreApi | undefined {
  const contiene = trimestres.find(
    (t) => fechaCorta(t.fechaInicioTrimestre) <= fecha && fecha <= fechaCorta(t.fechaFinTrimestre),
  );
  if (contiene) return contiene;
  return [...trimestres]
    .filter((t) => fechaCorta(t.fechaInicioTrimestre) <= fecha)
    .sort((a, b) => b.anioTrimestre - a.anioTrimestre || b.numeroTrimestre - a.numeroTrimestre)[0];
}

export const etiquetaTipoParticipante = {
  VOLUNTARIO_ACTIVO: "voluntario activo",
  ESTUDIANTE_PARTICIPANTE: "participante",
} as const;

/** "EN_CAPTURA" → "EN CAPTURA", la forma que usa BadgeEstadoInforme. */
export function estadoInforme(codigo: string) {
  return codigo.replace("_", " ") as "EN CAPTURA" | "ENVIADO" | "OBSERVADO" | "ACEPTADO";
}

/** 1234.5 → "L. 1,234.50". */
export function formatoLempiras(monto: number): string {
  return `L. ${monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatoHoras(horas: number): string {
  return Number.isInteger(horas) ? String(horas) : horas.toFixed(1);
}
