// Estados de Voluntariado tal como vienen de Catalogo.tblEstados (actividades,
// participaciones y solicitudes). EstadoBadge cubre otro juego de estados, el
// de becas, así que aquí va el mapeo propio del módulo.
const estilos: Record<string, string> = {
  SOLICITADA: "bg-amber-100 text-amber-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  APROBADA: "bg-emerald-100 text-emerald-700",
  EJECUTADA: "bg-sky-100 text-sky-700",
  RECHAZADA: "bg-rose-100 text-rose-700",
  CANCELADA: "bg-slate-100 text-slate-500",
  DEVUELTA: "bg-violet-100 text-violet-700",
  INSCRITO: "bg-blue-50 text-unah-navy",
  ASISTIO: "bg-emerald-100 text-emerald-700",
  NO_ASISTIO: "bg-rose-100 text-rose-700",
  CANCELADO: "bg-slate-100 text-slate-500",
};

export default function BadgeEstadoVoluntariado({ codigo }: { codigo: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
        estilos[codigo] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {codigo.replace("_", " ")}
    </span>
  );
}
