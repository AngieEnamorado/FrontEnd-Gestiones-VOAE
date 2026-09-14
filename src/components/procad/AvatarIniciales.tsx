/**
 * Las iniciales de una persona en un círculo, delante de su nombre.
 *
 * En una tabla de gente, el nombre en texto plano se lee como un dato más entre
 * códigos y porcentajes. Un disco con las iniciales le devuelve cara: la fila
 * pasa a ser alguien y no un registro, y de paso da un punto de apoyo para el
 * ojo cuando se recorre la columna de arriba abajo.
 */

/** Las dos primeras iniciales; con un solo nombre, la que haya. */
export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
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
