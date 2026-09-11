import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { informesTrimestrales } from "../../../data/mockInformesVoluntariado";
import { trimestres, nombreCampus } from "../../../data/mockCatalogosVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { actividadPorId } from "../../../data/mockActividadesVoluntariado";
import { inscripcionesDeActividad, asistenciaDeInscripcion, participantesUnicos, horasTotalesDeGrupo } from "../../../data/voluntariadoSelectors";

export default function InformeDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const informe = informesTrimestrales.find((i) => i.id === id);
  const [comentarios, setComentarios] = useState("");

  if (!informe) return <p className="text-sm text-slate-400">Informe no encontrado.</p>;

  const grupo = grupoPorId(informe.grupoId);
  const trimestre = trimestres.find((t) => t.id === informe.trimestreId);
  const requiereComentarios = comentarios.trim().length === 0;

  function resolver() {
    navigate("/voluntariado/informes");
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/voluntariado/informes" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
        ‹ Volver al listado
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Informe {trimestre?.nombre} · {grupo?.nombre}</h1>
            <p className="text-sm text-slate-500">{nombreCampus(grupo?.campusId ?? "")}</p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 py-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-unah-navy">{informe.actividadesIds.length}</p>
              <p className="text-[11px] font-semibold text-slate-400">ACTIVIDADES</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-unah-navy">{participantesUnicos(informe.actividadesIds)}</p>
              <p className="text-[11px] font-semibold text-slate-400">PARTICIPANTES</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-unah-navy">{grupo ? horasTotalesDeGrupo(grupo.id) : 0}</p>
              <p className="text-[11px] font-semibold text-slate-400">HORAS</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2.5">Actividad</th>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Participantes</th>
                  <th className="px-4 py-2.5">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {informe.actividadesIds.map((idAct) => {
                  const actividad = actividadPorId(idAct);
                  if (!actividad) return null;
                  const inscripciones = inscripcionesDeActividad(actividad.id);
                  const horas = inscripciones.reduce((t, i) => t + (asistenciaDeInscripcion(i.id)?.horas ?? 0), 0);
                  return (
                    <tr key={idAct}>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{actividad.nombre}</td>
                      <td className="px-4 py-2.5 text-slate-500">{actividad.fecha}</td>
                      <td className="px-4 py-2.5 text-slate-500">{inscripciones.length}</td>
                      <td className="px-4 py-2.5 text-slate-500">{horas}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Revisión</h2>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            rows={4}
            placeholder="Comentarios (requerido para observar)"
            className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
          />
          <button
            type="button"
            onClick={resolver}
            className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Aceptar informe
          </button>
          <button
            type="button"
            onClick={resolver}
            disabled={requiereComentarios}
            className="rounded-lg bg-violet-100 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Observar con comentarios
          </button>
        </div>
      </div>
    </div>
  );
}
