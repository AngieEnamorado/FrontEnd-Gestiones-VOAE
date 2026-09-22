// La etiqueta de estado de Giras. Recibe el CÓDIGO tal como lo devuelve la API
// ("Pendiente", "Correccion", "Inscripcion abierta"...): a diferencia de
// EstadoBadge, que sirve a los otros módulos, aquí no hay una lista cerrada en
// mayúsculas. Un código que no se conozca sale en gris en vez de romper.

const ESTILOS: Record<string, string> = {
  Borrador: "bg-slate-100 text-slate-600",
  Pendiente: "bg-amber-100 text-amber-700",
  Correccion: "bg-violet-100 text-violet-700",
  Aprobada: "bg-emerald-100 text-emerald-700",
  Denegada: "bg-rose-100 text-rose-700",
  Cancelada: "bg-rose-100 text-rose-700",
  Expirada: "bg-slate-100 text-slate-500",
  Inscrito: "bg-emerald-100 text-emerald-700",
  Rechazada: "bg-rose-100 text-rose-700",
  "Pendiente de reconfirmacion": "bg-amber-100 text-amber-700",
  "No reconfirmada": "bg-rose-100 text-rose-700",
  "Cancelada por gira": "bg-rose-100 text-rose-700",
  "Pendiente de transporte": "bg-amber-100 text-amber-700",
  "Inscripcion abierta": "bg-sky-100 text-sky-700",
  "En ejecucion": "bg-blue-100 text-blue-700",
  Finalizada: "bg-emerald-100 text-emerald-700",
};

/** Cómo se lee un código en pantalla (la base guarda "Correccion" sin tilde). */
const ETIQUETA_ESTADO: Record<string, string> = {
  Correccion: "Corrección",
  "Inscripcion abierta": "Inscripción abierta",
  "En ejecucion": "En ejecución",
  "Pendiente de reconfirmacion": "Pendiente de reconfirmación",
};

export default function EstadoGiraBadge({ codigo }: { codigo: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        ESTILOS[codigo] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {ETIQUETA_ESTADO[codigo] ?? codigo}
    </span>
  );
}
