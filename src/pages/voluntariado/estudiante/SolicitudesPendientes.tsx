import { useState } from "react";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { fechaCorta, iniciales } from "../../../utils/voluntariado";

export default function SolicitudesPendientes() {
  const { idPersona, grupoCoordinado } = useSesionVoluntariado();
  const idGrupo = grupoCoordinado?.idGrupo;
  const [enCurso, setEnCurso] = useState<number | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const carga = useApi(
    () => (idGrupo ? voluntariadoApi.solicitudesUnion(idGrupo, "PENDIENTE") : Promise.resolve([])),
    [idGrupo],
  );
  const pendientes = carga.datos ?? [];

  // Resuelve el coordinador, no la VOAE: aprobar lo agrega al grupo como Miembro.
  async function resolver(idSolicitud: number, estado: "APROBADA" | "RECHAZADA") {
    setEnCurso(idSolicitud);
    setErrorAccion(null);
    try {
      await voluntariadoApi.resolverUnion(idSolicitud, estado, idPersona);
      carga.recargar();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      setEnCurso(null);
    }
  }

  return (
    <>
      <HeaderMovilDetalle titulo="Solicitudes de unión" subtitulo={grupoCoordinado?.nombreGrupo} />
      {errorAccion && <p className="mx-4 mt-3 rounded-lg bg-red-50 p-2.5 text-[12px] font-semibold text-red-600">{errorAccion}</p>}
      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="flex flex-col gap-3 px-4 py-4">
          {pendientes.length === 0 && (
            <p className="text-sm text-slate-400">No hay solicitudes de unión pendientes.</p>
          )}

          {pendientes.map((s) => {
            const nombre = `${s.nombrePersona} ${s.apellidosPersona}`;
            return (
              <div key={s.idSolicitudUnion} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                    {iniciales(nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-slate-800">{nombre}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      {s.numeroCuenta} · {s.carreraEstudiante} · {fechaCorta(s.fechaSolicitud)}
                    </p>
                  </div>
                </div>
                {s.mensajeSolicitud && (
                  <p className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-[12px] text-slate-600">“{s.mensajeSolicitud}”</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={enCurso === s.idSolicitudUnion}
                    onClick={() => resolver(s.idSolicitudUnion, "APROBADA")}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-[12.5px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    disabled={enCurso === s.idSolicitudUnion}
                    onClick={() => resolver(s.idSolicitudUnion, "RECHAZADA")}
                    className="flex-1 rounded-lg bg-red-100 py-2 text-[12.5px] font-semibold text-red-600 hover:bg-red-200 disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </EstadoCarga>
    </>
  );
}
