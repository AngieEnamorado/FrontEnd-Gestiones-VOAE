import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import {
  historialDeEstudiante,
  horasConfirmadasEstudiante,
  porcentajeParticipacion,
} from "../../../data/voluntariadoSelectors";

const barraColor: Record<string, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  navy: "bg-unah-navy",
  rose: "bg-rose-500",
};

export default function MiHistorial() {
  const cuenta = estudianteActual.numeroCuenta;
  const horas = horasConfirmadasEstudiante(cuenta);
  const historial = historialDeEstudiante(cuenta).sort((a, b) => (a.actividad!.fecha < b.actividad!.fecha ? 1 : -1));

  return (
    <div className="pb-6">
      <div className="bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 py-7 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Horas totales</p>
        <p className="mt-1 text-[34px] font-extrabold leading-none">{horas}</p>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {estudianteActual.gruposIds.map((grupoId) => {
          const grupo = grupoPorId(grupoId);
          if (!grupo) return null;
          const porcentaje = porcentajeParticipacion(grupoId, cuenta);
          const elegible = porcentaje >= 50;
          return (
            <div key={grupoId} className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
              <p className="text-[12px] font-bold text-amber-800">{grupo.nombre}</p>
              <p className="mt-0.5 text-[20px] font-extrabold text-amber-700">{porcentaje}%</p>
              <p className="text-[11px] text-amber-600">
                {elegible ? "✓ Elegible a diploma — " : ""}Necesitas 50% de participación para ser elegible a diploma.
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-2.5 px-4">
        {historial.map(({ actividad, asistencia }) => {
          if (!actividad) return null;
          const grupo = grupoPorId(actividad.grupoId);
          return (
            <div key={actividad.id} className="flex overflow-hidden rounded-2xl bg-white shadow-sm">
              <span className={`w-1.5 shrink-0 ${grupo ? barraColor[grupo.logoColor] : "bg-slate-300"}`} />
              <div className="flex flex-1 items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-slate-800">{actividad.nombre}</p>
                  <p className="truncate text-[11px] text-slate-400">{grupo?.nombre} · {actividad.fecha}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-extrabold text-unah-navy">{asistencia?.horas ?? 0}h</p>
                  <p className={`text-[10.5px] font-semibold ${asistencia?.asistio ? "text-emerald-600" : "text-rose-600"}`}>
                    {asistencia?.asistio ? "Confirmada" : "No asistió"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
