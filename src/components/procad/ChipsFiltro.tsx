export interface OpcionChip<T extends string> {
  id: T;
  label: string;
  /**
   * Cuántos elementos caen en esta opción. Cuando lo lleva, el chip deja de
   * ser solo un filtro y pasa a decir de antemano qué va a encontrar el que lo
   * pulse —incluido el cero, que evita el viaje—.
   */
  conteo?: number;
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
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-[background-color,color,border-color] duration-150 ${
              seleccionada
                ? "border-unah-navy bg-unah-navy text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {o.label}
            {o.conteo !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  seleccionada
                    ? "bg-white/20 text-white"
                    : o.conteo === 0
                      ? "bg-slate-100 text-slate-300"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {o.conteo}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
