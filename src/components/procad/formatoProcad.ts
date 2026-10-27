/** Clases y formatos que comparten los formularios y tablas de PROCAD (ver CamposFormulario.tsx). */

export const CLASE_CAMPO =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-unah-orange disabled:bg-slate-50 disabled:text-slate-400";

/** Hoy en la zona de Honduras, como «AAAA-MM-DD», para el valor por defecto de un <input type="date">. */
export function hoyIso(): string {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** «2026-10-27T00:00:00Z» → «27 oct 2026». Las fechas de la base son de día, sin hora: se leen en UTC. */
export function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-HN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
