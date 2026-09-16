/**
 * Fechas, en un solo sitio.
 *
 * Los datos de la plataforma traen la fecha de dos formas —unas ya escritas
 * como se leen («14 feb 2026») y otras en ISO («2026-02-14»)— y cada pantalla
 * se las apañaba como podía. Lo que obliga a ordenarlo es el calendario de
 * visorías: para saber en qué casilla cae un día hay que contar días, y eso no
 * se hace sobre un texto.
 *
 * Todo lo de aquí trabaja en hora local y arma el ISO a mano. `toISOString()`
 * pasa por UTC, y en Honduras (UTC−6) eso corre las fechas un día hacia atrás:
 * una visoría del 1 de febrero aparecería en enero.
 */

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** La semana empieza en lunes, como el calendario académico. */
export const DIAS_CORTOS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

/** «2026-02-14» a partir de sus tres números, sin pasar por UTC. */
export function iso(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** «14 feb 2026» → «2026-02-14»; lo que no entienda, cadena vacía. */
export function aIso(texto: string): string {
  const partes = texto.trim().split(/\s+/);
  const dia = Number(partes[0]);
  const mes = MESES_CORTOS.indexOf((partes[1] ?? "").toLowerCase().slice(0, 3));
  const anio = Number(partes[2]);
  if (!dia || mes === -1 || !anio) return "";
  return iso(anio, mes, dia);
}

/** Los tres números de un ISO, ya separados. */
export function partes(fecha: string): { anio: number; mes: number; dia: number } {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return { anio, mes: mes - 1, dia };
}

/** «2026-02-14» → «14 feb 2026». */
export function enCorto(fecha: string): string {
  const { anio, mes, dia } = partes(fecha);
  return `${dia} ${MESES_CORTOS[mes]} ${anio}`;
}

/** «2026-02-14» → «sábado 14 de febrero de 2026». */
export function enLargo(fecha: string): string {
  const { anio, mes, dia } = partes(fecha);
  const nombre = new Date(anio, mes, dia).toLocaleDateString("es-HN", { weekday: "long" });
  return `${nombre} ${dia} de ${MESES[mes]} de ${anio}`;
}

/** «febrero 2026», para el encabezado de un calendario. */
export function nombreDelMes(anio: number, mes: number): string {
  return `${MESES[mes]} ${anio}`;
}

/**
 * Las seis semanas que dibuja un mes, cada una con sus siete días en ISO.
 *
 * Siempre seis filas, aunque al mes le sobren: si la cuadrícula creciera y
 * menguara al cambiar de mes, el calendario daría un salto en cada pulsación y
 * los días bailarían de sitio. Los días de los meses vecinos vienen incluidos
 * —se dibujan apagados— porque una semana partida a la mitad se lee peor que
 * una semana entera.
 */
export function semanasDelMes(anio: number, mes: number): string[][] {
  const primero = new Date(anio, mes, 1);
  // getDay() cuenta desde el domingo; aquí la semana abre el lunes.
  const desplazamiento = (primero.getDay() + 6) % 7;
  const inicio = new Date(anio, mes, 1 - desplazamiento);

  return Array.from({ length: 6 }, (_, semana) =>
    Array.from({ length: 7 }, (_, dia) => {
      const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + semana * 7 + dia);
      return iso(d.getFullYear(), d.getMonth(), d.getDate());
    }),
  );
}

/** El mes siguiente o el anterior, sin que diciembre se salga del año. */
export function moverMes(anio: number, mes: number, pasos: number): { anio: number; mes: number } {
  const total = anio * 12 + mes + pasos;
  return { anio: Math.floor(total / 12), mes: ((total % 12) + 12) % 12 };
}

/** El día de hoy en ISO, para marcarlo en la cuadrícula. */
export function hoyIso(): string {
  const h = new Date();
  return iso(h.getFullYear(), h.getMonth(), h.getDate());
}
