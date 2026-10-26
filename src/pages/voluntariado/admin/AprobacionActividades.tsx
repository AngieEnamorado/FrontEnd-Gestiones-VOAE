import { useState } from "react";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import RolPruebaAdmin from "../../../components/voluntariado/RolPruebaAdmin";
import ConfirmarDictamen, { type Dictamen } from "../../../components/voluntariado/ConfirmarDictamen";
import { useRolAdminVoluntariado } from "../../../utils/rolAdminVoluntariado";
import { fechaCorta } from "../../../utils/voluntariado";

export default function AprobacionActividades() {
  const carga = useApi(() => voluntariadoApi.actividades({ estado: "SOLICITADA" }), []);
  const [enCurso, setEnCurso] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dictamen, setDictamen] = useState<Dictamen | null>(null);
  const rol = useRolAdminVoluntariado();
  // Se aprueba en el campus del grupo organizador.
  const pendientes = (carga.datos ?? []).filter((a) => rol.veCampus(a.campus));

  async function resolver(idActividad: number, estado: "APROBADA" | "RECHAZADA") {
    setEnCurso(idActividad);
    setError(null);
    try {
      await voluntariadoApi.resolverActividad(idActividad, estado);
      carga.recargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnCurso(null);
    }
  }

  function pedirConfirmacion(idActividad: number, nombre: string, estado: "APROBADA" | "RECHAZADA") {
    const textos: Record<typeof estado, Omit<Dictamen, "onConfirmar">> = {
      APROBADA: {
        titulo: `¿Aprobar «${nombre}»?`,
        descripcion: "Los estudiantes podrán inscribirse y el coordinador podrá pasar lista el día de la actividad.",
        confirmar: "Sí, aprobar",
        tono: "aprobar",
      },
      RECHAZADA: {
        titulo: `¿Rechazar «${nombre}»?`,
        descripcion: "El grupo verá la actividad como rechazada y nadie podrá inscribirse. No se puede deshacer desde el panel.",
        confirmar: "Sí, rechazar",
        tono: "rechazar",
      },
    };
    setDictamen({ ...textos[estado], onConfirmar: () => resolver(idActividad, estado) });
  }

  return (
    <div className="flex flex-col gap-4">
      <ConfirmarDictamen dictamen={dictamen} onCerrar={() => setDictamen(null)} />
      <RolPruebaAdmin />
      <h1 className="text-base font-bold text-slate-800">Aprobación de actividades</h1>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="flex flex-col gap-3">
          {pendientes.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
              No hay actividades pendientes de aprobación.
            </div>
          )}

          {pendientes.map((actividad) => (
            <div key={actividad.idActividad} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-800">{actividad.nombreActividad}</p>
                  {actividad.esConjunta && (
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                      CONJUNTA
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {actividad.nombreGrupo}
                  {actividad.coorganizadores ? ` + ${actividad.coorganizadores}` : ""} · {actividad.campus} ·{" "}
                  {fechaCorta(actividad.fechaActividad)} · {actividad.lugarActividad}
                </p>
                <p className="mt-1.5 text-sm text-slate-600">{actividad.objetivoActividad}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={enCurso === actividad.idActividad}
                  onClick={() => pedirConfirmacion(actividad.idActividad, actividad.nombreActividad, "APROBADA")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={enCurso === actividad.idActividad}
                  onClick={() => pedirConfirmacion(actividad.idActividad, actividad.nombreActividad, "RECHAZADA")}
                  className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200 disabled:opacity-60"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </EstadoCarga>
    </div>
  );
}
