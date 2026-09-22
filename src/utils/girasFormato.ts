// Cómo se muestran en pantalla algunos datos que la API de Giras devuelve crudos.
import { enCorto } from "./fechas";

const NUMERAL_PAC: Record<number, string> = { 1: "I", 2: "II", 3: "III" };

/** «II Periodo 2026» a partir del año y el número de PAC; «—» si la solicitud no cae en ningún período. */
export function etiquetaPeriodo(anio: number | null, numeroPac: number | null): string {
  if (anio === null || numeroPac === null) return "—";
  return `${NUMERAL_PAC[numeroPac] ?? numeroPac} Periodo ${anio}`;
}

/** «14 feb 2026» a partir de «2026-02-14»; «—» si no hay fecha. */
export function fechaCorta(fecha: string | null | undefined): string {
  return fecha ? enCorto(fecha.slice(0, 10)) : "—";
}

export function formatearMonto(monto: number): string {
  return monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
