export interface OpcionChip<T extends string> {
  id: T;
  label: string;
}

interface ChipsFiltroProps<T extends string> {
  opciones: OpcionChip<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  etiqueta: string;
}

/**
 * Fila de chips para cortar el contenido de un módulo sin cambiar de página
 * (el tipo de agrupación, la hoja del catálogo, la clase de reporte). Es el
 * nivel más liviano de navegación: no cambia la URL ni el título.
 */
export default function ChipsFiltro<T extends string>({
  opciones,
  activa,
  onCambiar,
  etiqueta,
}: ChipsFiltroProps<T>) {
  return (
    <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const seleccionada = o.id === activa;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={seleccionada}
            onClick={() => onCambiar(o.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-[background-color,color,border-color] duration-150 ${
              seleccionada
                ? "border-unah-navy bg-unah-navy text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
