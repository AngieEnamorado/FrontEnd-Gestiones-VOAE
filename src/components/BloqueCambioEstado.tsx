import SelectorEstado from "./SelectorEstado";
import type { EstadoSolicitud } from "../types";

/**
 * La tarjeta del pie de un detalle donde se dictamina: título, una línea de
 * aviso y el selector de estado (que ya pide confirmación). Es la misma en la
 * solicitud y en la inscripción para que el gesto se vea igual en las dos.
 */
export default function BloqueCambioEstado({
  titulo,
  estado,
  onCambiar,
}: {
  titulo: string;
  estado: EstadoSolicitud;
  onCambiar: (estado: EstadoSolicitud) => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-bold text-slate-800">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cambiarlo pide una confirmación antes de guardarse.
        </p>
      </div>
      <SelectorEstado estado={estado} onCambiar={onCambiar} direccion="arriba" />
    </div>
  );
}
