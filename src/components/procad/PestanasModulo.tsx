import { useRef } from "react";

export interface OpcionPestana<T extends string> {
  id: T;
  label: string;
  /** Letra o número que precede al nombre, cuando la secuencia significa algo. */
  prefijo?: string;
  /** Cuántos casos esperan resolución en esta pestaña. */
  pendientes?: number;
}

interface PestanasModuloProps<T extends string> {
  opciones: OpcionPestana<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  etiqueta: string;
  /** Prefijo de los `id` del DOM, para que dos grupos de pestañas no choquen. */
  nombre: string;
}

/**
 * Barra de pestañas de un módulo. Se mueve con las flechas del teclado y solo
 * la pestaña activa entra en el orden de tabulación, que es como se espera que
 * funcione un `tablist`: una pulsación de Tab para llegar al grupo, flechas
 * para recorrerlo.
 */
export default function PestanasModulo<T extends string>({
  opciones,
  activa,
  onCambiar,
  etiqueta,
  nombre,
}: PestanasModuloProps<T>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function mover(direccion: 1 | -1) {
    const actual = opciones.findIndex((o) => o.id === activa);
    const siguiente = opciones[(actual + direccion + opciones.length) % opciones.length];
    onCambiar(siguiente.id);
    refs.current[siguiente.id]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        mover(e.key === "ArrowRight" ? 1 : -1);
      }}
      className="table-scrollbar flex gap-1 overflow-x-auto border-b border-slate-200"
    >
      {opciones.map((o) => {
        const seleccionada = o.id === activa;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[o.id] = el;
            }}
            type="button"
            role="tab"
            id={`${nombre}-${o.id}`}
            aria-selected={seleccionada}
            aria-controls={`panel-${nombre}`}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onCambiar(o.id)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
              seleccionada
                ? "border-unah-orange text-unah-navy"
                : "border-transparent text-slate-500 hover:text-unah-navy"
            }`}
          >
            {o.prefijo && (
              <span className={seleccionada ? "text-unah-orange" : "text-slate-400"}>
                {o.prefijo}
              </span>
            )}
            {o.label}
            {o.pendientes ? (
              <span
                className="ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-unah-orange px-1.5 text-[10px] font-bold text-white"
                title={`${o.pendientes} pendiente(s)`}
              >
                {o.pendientes}
                <span className="sr-only"> pendientes</span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
