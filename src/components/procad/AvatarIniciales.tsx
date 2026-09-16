/**
 * Las iniciales de una persona en un círculo, delante de su nombre.
 *
 * En una tabla de gente, el nombre en texto plano se lee como un dato más entre
 * códigos y porcentajes. Un disco con las iniciales le devuelve cara: la fila
 * pasa a ser alguien y no un registro, y de paso da un punto de apoyo para el
 * ojo cuando se recorre la columna de arriba abajo.
 */

/**
 * Los tratamientos que preceden al nombre del personal de la universidad.
 *
 * Se descartan antes de sacar las iniciales: «Prof. Marco Aurelio Reyes» es
 * MR y no PM. Casi todo el personal de PROCAD viene con tratamiento delante, y
 * sin esta lista media plantilla acababa con la misma inicial.
 */
const TRATAMIENTOS = new Set([
  "prof",
  "profa",
  "lic",
  "lica",
  "licda",
  "ing",
  "inga",
  "mtro",
  "mtra",
  "msc",
  "dr",
  "dra",
  "arq",
  "abg",
  "sr",
  "sra",
  "srta",
]);

/** Las dos primeras iniciales del nombre; con un solo nombre, la que haya. */
export function iniciales(nombre: string): string {
  const partes = nombre
    .split(" ")
    .filter(Boolean)
    .filter((parte) => !TRATAMIENTOS.has(parte.replace(/\.$/, "").toLowerCase()));

  return partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AvatarIniciales({
  nombre,
  className = "",
}: {
  nombre: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-unah-navy/8 text-[11px] font-bold tracking-wide text-unah-navy ${className}`}
    >
      {iniciales(nombre)}
    </span>
  );
}
