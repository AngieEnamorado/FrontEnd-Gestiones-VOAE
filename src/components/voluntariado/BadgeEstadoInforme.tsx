import type { EstadoInformeTrimestral } from "../../types";

const estilos: Record<EstadoInformeTrimestral, string> = {
  "EN CAPTURA": "bg-amber-100 text-amber-700",
  ENVIADO: "bg-sky-100 text-sky-700",
  OBSERVADO: "bg-violet-100 text-violet-700",
  ACEPTADO: "bg-emerald-100 text-emerald-700",
};

export default function BadgeEstadoInforme({ estado }: { estado: EstadoInformeTrimestral }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estilos[estado]}`}
    >
      {estado}
    </span>
  );
}
