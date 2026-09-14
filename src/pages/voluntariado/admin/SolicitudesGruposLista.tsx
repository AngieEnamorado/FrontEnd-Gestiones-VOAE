import { Link } from "react-router-dom";
import EstadoBadge from "../../../components/EstadoBadge";
import { solicitudesGrupoVoluntariado } from "../../../data/mockGruposVoluntariado";
import { nombreCampus } from "../../../data/mockCatalogosVoluntariado";

export default function SolicitudesGruposLista() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Solicitudes de grupos nuevos</h1>

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
              {solicitudesGrupoVoluntariado.map((s) => {
                const solicitante = s.miembros.find((m) => m.numeroCuenta === s.solicitanteCuenta);
                return (
                  <tr key={s.id} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-5 py-3.5 text-slate-600">{nombreCampus(s.campusId)}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{s.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{solicitante?.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-500">{s.fechaSolicitud}</td>
                    <td className="px-5 py-3.5"><EstadoBadge estado={s.estado} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/voluntariado/solicitudes-grupos/${s.id}`}
                        className="text-xs font-semibold text-unah-orange hover:underline"
                      >
                        Revisar ›
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {solicitudesGrupoVoluntariado.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    No hay solicitudes de grupos nuevos pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
