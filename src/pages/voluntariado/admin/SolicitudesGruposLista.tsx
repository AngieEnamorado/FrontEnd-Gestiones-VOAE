import { Link } from "react-router-dom";
import BadgeEstadoVoluntariado from "../../../components/voluntariado/BadgeEstadoVoluntariado";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { fechaCorta } from "../../../utils/voluntariado";

export default function SolicitudesGruposLista() {
  const carga = useApi(() => voluntariadoApi.solicitudesGrupos(), []);
  const solicitudes = carga.datos ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Solicitudes de grupos nuevos</h1>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Campus</th>
                  <th className="px-5 py-3">Nombre propuesto</th>
                  <th className="px-5 py-3">Solicitante</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitudes.map((s) => (
                  <tr key={s.idSolicitudGrupoNuevo} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-5 py-3.5 text-slate-600">{s.nombreCampus}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{s.nombreGrupo}</td>
                    <td className="px-5 py-3.5 text-slate-600">{s.nombrePersona} {s.apellidosPersona}</td>
                    <td className="px-5 py-3.5 text-slate-500">{fechaCorta(s.fechaSolicitud)}</td>
                    <td className="px-5 py-3.5"><BadgeEstadoVoluntariado codigo={s.codigoEstado} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/voluntariado/solicitudes-grupos/${s.idSolicitudGrupoNuevo}`}
                        className="text-xs font-semibold text-unah-orange hover:underline"
                      >
                        {s.codigoEstado === "PENDIENTE" ? "Revisar ›" : "Ver ›"}
                      </Link>
                    </td>
                  </tr>
                ))}

                {solicitudes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                      No hay solicitudes de grupos nuevos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </EstadoCarga>
    </div>
  );
}
