import type { EstadoSolicitud } from "../types";

const estilosPorEstado: Record<EstadoSolicitud, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  APROBADA: "bg-emerald-100 text-emerald-700",
  RECHAZADA: "bg-rose-100 text-rose-700",
  "EN REVISIÓN": "bg-violet-100 text-violet-700",
  "ESPERA INF. SOCIAL": "bg-sky-100 text-sky-700",
};

export default function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estilosPorEstado[estado]}`}
    >
      {estado}
    </span>
  );
}
