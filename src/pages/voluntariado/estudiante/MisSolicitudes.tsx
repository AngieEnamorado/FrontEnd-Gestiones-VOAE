import { Link } from "react-router-dom";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import BadgeEstadoVoluntariado from "../../../components/voluntariado/BadgeEstadoVoluntariado";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi, type SolicitudPersonaApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { fechaCorta } from "../../../utils/voluntariado";

const TIPO: Record<SolicitudPersonaApi["tipo"], string> = {
  UNION: "unión a grupo",
  GRUPO: "creación de grupo",
  ACTIVIDAD: "actividad",
};

export default function MisSolicitudes() {
  const { idPersona } = useSesionVoluntariado();
  const carga = useApi(() => voluntariadoApi.solicitudesDePersona(idPersona), [idPersona]);
  const solicitudes = carga.datos ?? [];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-bold text-slate-800">Mis solicitudes</h1>
        <Link to="/voluntariado/portal-estudiante/grupos/nuevo" className="text-xs font-semibold text-unah-orange">
          + Crear grupo
        </Link>
      </div>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="mt-4 flex flex-col gap-3">
          {solicitudes.length === 0 && <p className="text-sm text-slate-400">Aún no has enviado solicitudes.</p>}

          {solicitudes.map((s) => (
            <div key={`${s.tipo}-${s.id}`} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13.5px] font-bold text-slate-800">{s.titulo}</p>
                <BadgeEstadoVoluntariado codigo={s.codigoEstado} />
              </div>
              <p className="mt-1 text-[11.5px] text-slate-400">{TIPO[s.tipo]} · {fechaCorta(s.fecha)}</p>

              {s.motivo && (
                <div className="mt-2.5 rounded-lg bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold text-slate-500">Motivo</p>
                  <p className="mt-0.5 text-[12.5px] text-slate-600">{s.motivo}</p>
                </div>
              )}

              {s.tipo === "GRUPO" && s.codigoEstado === "DEVUELTA" && (
                <Link
                  to="/voluntariado/portal-estudiante/grupos/nuevo"
                  className="mt-3 block w-full rounded-lg bg-violet-600 py-2 text-center text-[12.5px] font-semibold text-white hover:bg-violet-700"
                >
                  Corregir y reenviar
                </Link>
              )}
            </div>
          ))}
        </div>
      </EstadoCarga>
    </div>
  );
}
