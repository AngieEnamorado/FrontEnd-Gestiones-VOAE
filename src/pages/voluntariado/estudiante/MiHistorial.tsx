import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeGrupo, fechaCorta, formatoHoras } from "../../../utils/voluntariado";

const barraColor: Record<string, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  navy: "bg-unah-navy",
  rose: "bg-rose-500",
};

export default function MiHistorial() {
  const { idPersona } = useSesionVoluntariado();
  const carga = useApi(
    () => Promise.all([voluntariadoApi.participacionesDePersona(idPersona), voluntariadoApi.participacionMiembros()]),
    [idPersona],
  );
  const [participaciones, diplomas] = carga.datos ?? [[], { umbral: 0, miembros: [] }];

  // El historial son las participaciones ya confirmadas; las inscripciones
  // vigentes aparecen en Inicio y en Actividades.
  const historial = participaciones.filter((p) => p.codigoEstado === "ASISTIO" || p.codigoEstado === "NO_ASISTIO");
  const horas = historial.reduce((total, p) => total + (p.codigoEstado === "ASISTIO" ? p.horasParticipacion ?? 0 : 0), 0);
  // El porcentaje y el umbral los calcula la API: el cliente no decide quién es elegible.
  const porGrupo = diplomas.miembros.filter((m) => m.idPersona === idPersona);

  return (
    <div className="pb-6">
      <div className="bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 py-7 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Horas totales</p>
        <p className="mt-1 text-[34px] font-extrabold leading-none">{formatoHoras(horas)}</p>
      </div>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="flex flex-col gap-3 px-4 pt-4">
          {porGrupo.map((g) => {
            const elegible = g.porcentajeParticipacion >= diplomas.umbral;
            return (
              <div key={g.idGrupo} className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                <p className="text-[12px] font-bold text-amber-800">{g.nombreGrupo}</p>
                <p className="mt-0.5 text-[20px] font-extrabold text-amber-700">{Math.round(g.porcentajeParticipacion)}%</p>
                <p className="text-[11px] text-amber-600">
                  {g.actividadesAsistidas} de {g.actividadesGrupo} actividades ejecutadas.{" "}
                  {elegible ? "✓ Elegible a diploma." : `Necesitas ${diplomas.umbral}% de participación para ser elegible a diploma.`}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2.5 px-4">
          {historial.length === 0 && (
            <p className="text-[13px] text-slate-400">Aún no tienes asistencias confirmadas.</p>
          )}
          {historial.map((p) => {
            const asistio = p.codigoEstado === "ASISTIO";
            return (
              <div key={p.idParticipacion} className="flex overflow-hidden rounded-2xl bg-white shadow-sm">
                <span className={`w-1.5 shrink-0 ${barraColor[colorDeGrupo(p.idGrupo)]}`} />
                <div className="flex flex-1 items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-slate-800">{p.nombreActividad}</p>
                    <p className="truncate text-[11px] text-slate-400">{p.nombreGrupo} · {fechaCorta(p.fechaActividad)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-extrabold text-unah-navy">{formatoHoras(p.horasParticipacion ?? 0)}h</p>
                    <p className={`text-[10.5px] font-semibold ${asistio ? "text-emerald-600" : "text-rose-600"}`}>
                      {asistio ? "Confirmada" : "No asistió"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </EstadoCarga>
    </div>
  );
}
