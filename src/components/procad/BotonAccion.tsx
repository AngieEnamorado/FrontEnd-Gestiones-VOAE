type TonoBoton = "aprobar" | "rechazar" | "observar" | "primario" | "neutro";

const ESTILOS: Record<TonoBoton, string> = {
  aprobar: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  rechazar: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  observar: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  primario: "border-unah-navy bg-unah-navy text-white hover:bg-unah-navy-dark",
  neutro: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
};

interface BotonAccionProps {
  tono?: TonoBoton;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}

/** Botón de acción de una fila de tabla o de una barra de herramientas. */
export default function BotonAccion({
  tono = "neutro",
  onClick,
  children,
  title,
}: BotonAccionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-[background-color,color,transform] duration-150 ease-suave active:scale-[0.97] ${ESTILOS[tono]}`}
    >
      {children}
    </button>
  );
}
