import { useState } from "react";
import { HiOutlineCalendarDays, HiOutlineMapPin } from "react-icons/hi2";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { hoyIso } from "../../../utils/fechas";
import { etiquetaTipoParticipante, fechaCorta } from "../../../utils/voluntariado";

export default function ActividadesDisponibles() {
  const { idPersona } = useSesionVoluntariado();
  const [enCurso, setEnCurso] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const carga = useApi(
    () => Promise.all([voluntariadoApi.actividades({ estado: "APROBADA" }), voluntariadoApi.participacionesDePersona(idPersona)]),
    [idPersona],
  );
  const [actividades, participaciones] = carga.datos ?? [[], []];
  const hoy = hoyIso();

  const disponibles = actividades
    .filter((a) => fechaCorta(a.fechaActividad) >= hoy)
    .sort((a, b) => (fechaCorta(a.fechaActividad) < fechaCorta(b.fechaActividad) ? -1 : 1));

  // El tipo de participante lo decide la API según la membresía, no el cliente.
  async function ejecutar(idActividad: number, accion: () => Promise<unknown>) {
    setEnCurso(idActividad);
    setErrorAccion(null);
    try {
      await accion();
      carga.recargar();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      setEnCurso(null);
    }
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-[17px] font-bold text-slate-800">Actividades disponibles</h1>
      {errorAccion && <p className="mt-2 rounded-lg bg-red-50 p-2.5 text-[12px] font-semibold text-red-600">{errorAccion}</p>}

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="mt-4 flex flex-col gap-3">
          {disponibles.length === 0 && (
            <p className="text-sm text-slate-400">No hay actividades aprobadas próximas.</p>
          )}

          {disponibles.map((actividad) => {
            const propia = participaciones.find(
              (p) => p.idActividad === actividad.idActividad && p.codigoEstado === "INSCRITO",
            );
            const ocupada = enCurso === actividad.idActividad;

            return (
              <div key={actividad.idActividad} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-bold text-slate-800">{actividad.nombreActividad}</p>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10.5px] font-bold text-unah-navy">
                    {actividad.totalInscritos} inscritos
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {actividad.nombreGrupo}
                  {actividad.coorganizadores ? ` + ${actividad.coorganizadores}` : ""}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{actividad.objetivoActividad}</p>

                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <HiOutlineCalendarDays className="h-3.5 w-3.5" />
                    {fechaCorta(actividad.fechaActividad)}
                  </span>
                  <span className="flex items-center gap-1">
                    <HiOutlineMapPin className="h-3.5 w-3.5" />
                    {actividad.lugarActividad}
                  </span>
                </div>

                {propia ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                    <p className="text-[12px] font-semibold text-emerald-700">
                      ✓ Inscrito como {etiquetaTipoParticipante[propia.tipoParticipante]}
                    </p>
                    <button
                      type="button"
                      disabled={ocupada}
                      onClick={() => ejecutar(actividad.idActividad, () => voluntariadoApi.cancelarInscripcion(actividad.idActividad, idPersona))}
                      className="text-[12px] font-semibold text-rose-600 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={ocupada}
                    onClick={() => ejecutar(actividad.idActividad, () => voluntariadoApi.inscribirse(actividad.idActividad, idPersona))}
                    className="mt-3 w-full rounded-xl bg-unah-navy py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
                  >
                    {ocupada ? "Inscribiendo…" : "Inscribirme"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </EstadoCarga>
    </div>
  );
}
