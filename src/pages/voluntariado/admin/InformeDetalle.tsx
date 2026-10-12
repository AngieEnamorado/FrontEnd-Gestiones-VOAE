import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import BadgeEstadoInforme from "../../../components/voluntariado/BadgeEstadoInforme";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { estadoInforme, fechaCorta, formatoHoras, nombreTrimestre } from "../../../utils/voluntariado";

export default function InformeDetalle() {
  const { id } = useParams<{ id: string }>();
  const idInforme = Number(id);
  const navigate = useNavigate();
  const carga = useApi(() => voluntariadoApi.informe(idInforme), [idInforme]);
  const [comentarios, setComentarios] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const informe = carga.datos;
  if (!informe) {
    return (
      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
        {null}
      </EstadoCarga>
    );
  }

  const requiereComentarios = comentarios.trim().length === 0;
  const horas = informe.actividades.reduce((t, a) => t + a.horas, 0);
  // Solo un informe enviado se dictamina; la API rechaza cualquier otra transición.
  const dictaminable = informe.codigoEstado === "ENVIADO";

  async function resolver(estado: "ACEPTADO" | "OBSERVADO") {
    setResolviendo(true);
    setError(null);
    try {
      await voluntariadoApi.dictaminarInforme(idInforme, estado, comentarios.trim() || null);
      navigate("/voluntariado/informes");
    } catch (e) {
      setError(mensajeDeError(e));
      setResolviendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/voluntariado/informes" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
        ‹ Volver al listado
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-800">Informe {nombreTrimestre(informe)} · {informe.nombreGrupo}</h1>
              {informe.fechaLimiteInforme && (
                <p className="text-sm text-slate-500">Fecha límite: {fechaCorta(informe.fechaLimiteInforme)}</p>
              )}
            </div>
            <BadgeEstadoInforme estado={estadoInforme(informe.codigoEstado)} />
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 py-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-unah-navy">{informe.actividades.length}</p>
              <p className="text-[11px] font-semibold text-slate-400">ACTIVIDADES</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-unah-navy">{informe.totalParticipantes}</p>
              <p className="text-[11px] font-semibold text-slate-400">PARTICIPANTES</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-unah-navy">{formatoHoras(horas)}</p>
              <p className="text-[11px] font-semibold text-slate-400">HORAS</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2.5">Actividad</th>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Asistentes</th>
                  <th className="px-4 py-2.5">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {informe.actividades.map((a) => (
                  <tr key={a.idActividad} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{a.nombreActividad}</td>
                    <td className="px-4 py-2.5 text-slate-500">{fechaCorta(a.fechaActividad)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{a.asistentes}</td>
                    <td className="px-4 py-2.5 text-slate-500">{formatoHoras(a.horas)}</td>
                  </tr>
                ))}
                {informe.actividades.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                      El informe no incluye actividades.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {informe.observacionesAdmin && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">Observaciones</p>
              <p className="mt-1 text-sm text-violet-800">{informe.observacionesAdmin}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Revisión</h2>
          {dictaminable ? (
            <>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={4}
                placeholder="Comentarios (requerido para observar)"
                className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
              />
              {error && <p className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">{error}</p>}
              <button
                type="button"
                onClick={() => resolver("ACEPTADO")}
                disabled={resolviendo}
                className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Aceptar informe
              </button>
              <button
                type="button"
                onClick={() => resolver("OBSERVADO")}
                disabled={requiereComentarios || resolviendo}
                className="rounded-lg bg-violet-100 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Observar con comentarios
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              {informe.codigoEstado === "ACEPTADO"
                ? "Este informe ya fue aceptado."
                : "El grupo todavía no ha enviado este informe; se podrá revisar cuando lo envíe."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
