type TonoPildora = "activo" | "inactivo" | "pendiente" | "negativo" | "info";

const ESTILOS: Record<TonoPildora, string> = {
  activo: "bg-emerald-50 text-emerald-700",
  inactivo: "bg-slate-100 text-slate-500",
  pendiente: "bg-amber-50 text-amber-700",
  negativo: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700",
};

/**
 * Etiqueta de estado para las tablas de administración. Sigue el mismo
 * lenguaje que `EstadoBadge`, pero sobre estados propios de PROCAD (acceso,
 * períodos, validación) en vez de los de una beca.
 */
export default function PildoraEstado({ tono, children }: { tono: TonoPildora; children: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILOS[tono]}`}
    >
      {children}
    </span>
  );
}
