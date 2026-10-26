import { Fragment, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import EvidenciaActividad from "./EvidenciaActividad";
import BadgeEstadoInforme from "../../../components/voluntariado/BadgeEstadoInforme";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import RolPruebaAdmin from "../../../components/voluntariado/RolPruebaAdmin";
import ConfirmarDictamen, { type Dictamen } from "../../../components/voluntariado/ConfirmarDictamen";
import FueraDeCampus from "../../../components/voluntariado/FueraDeCampus";
import { useRolAdminVoluntariado } from "../../../utils/rolAdminVoluntariado";
import { estadoInforme, fechaCorta, formatoHoras, nombreTrimestre } from "../../../utils/voluntariado";

export default function InformeDetalle() {
  const { id } = useParams<{ id: string }>();
  const idInforme = Number(id);
  const navigate = useNavigate();
  const carga = useApi(() => voluntariadoApi.informe(idInforme), [idInforme]);
  const rol = useRolAdminVoluntariado();
  // El informe no trae campus: para el enlace se lee del grupo.
  const idGrupo = carga.datos?.idGrupo;
  const grupo = useApi(
    () => (rol.esEnlace && idGrupo ? voluntariadoApi.grupo(idGrupo) : Promise.resolve(undefined)),
    [rol.esEnlace, idGrupo],
  );
  const [comentarios, setComentarios] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abiertas, setAbiertas] = useState<Set<number>>(new Set());
  const [dictamen, setDictamen] = useState<Dictamen | null>(null);

  function alternar(idActividad: number) {
    setAbiertas((previas) => {
      const siguientes = new Set(previas);
      if (siguientes.has(idActividad)) siguientes.delete(idActividad);
      else siguientes.add(idActividad);
      return siguientes;
    });
  }

  const informe = carga.datos;
  const campusPendiente = rol.esEnlace && informe !== undefined && grupo.datos === undefined;
  if (!informe || campusPendiente) {
    return (
      <EstadoCarga
        cargando={carga.cargando || grupo.cargando}
        error={carga.error ?? grupo.error}
        onReintentar={() => {
          carga.recargar();
          grupo.recargar();
        }}
        listo={false}
      >
        {null}
      </EstadoCarga>
    );
  }

  if (rol.esEnlace && grupo.datos && !grupo.datos.campus.some((c) => c.idCampus === rol.idCampus)) {
    return <FueraDeCampus campus={rol.nombreCampus} volverA="/voluntariado/informes" textoVolver="Volver al listado" />;
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

  function pedirConfirmacion(estado: "ACEPTADO" | "OBSERVADO") {
    const textos: Record<typeof estado, Omit<Dictamen, "onConfirmar">> = {
      ACEPTADO: {
        titulo: `¿Aceptar el informe de «${informe.nombreGrupo}»?`,
        descripcion:
          "El informe queda cerrado: el grupo ya no podrá cambiar sus actividades ni las fotos de evidencia. No se puede deshacer.",
        confirmar: "Sí, aceptar informe",
        tono: "aprobar",
        motivo: comentarios.trim() || null,
      },
      OBSERVADO: {
        titulo: "¿Observar el informe?",
        descripcion: `«${informe.nombreGrupo}» recibirá estos comentarios y podrá corregir el informe y reenviarlo.`,
        confirmar: "Sí, observar",
        tono: "devolver",
        motivo: comentarios.trim(),
      },
    };
    setDictamen({ ...textos[estado], onConfirmar: () => resolver(estado) });
  }

  return (
    <div className="flex flex-col gap-4">
      <ConfirmarDictamen dictamen={dictamen} onCerrar={() => setDictamen(null)} />
      <RolPruebaAdmin />
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

          {informe.actividades.length > 0 && (
            <p className="text-xs text-slate-500">
              Revisa los resultados, las fotos y el informe económico de cada actividad antes de dictaminar.
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2.5">Actividad</th>
                  <th className="px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Asistentes</th>
                  <th className="px-4 py-2.5">Horas</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {informe.actividades.map((a) => {
                  const abierta = abiertas.has(a.idActividad);
                  return (
                    <Fragment key={a.idActividad}>
                      <tr className="transition-colors duration-150 hover:bg-slate-100">
                        <td className="px-4 py-2.5 font-medium text-slate-700">{a.nombreActividad}</td>
                        <td className="px-4 py-2.5 text-slate-500">{fechaCorta(a.fechaActividad)}</td>
                        <td className="px-4 py-2.5 text-slate-500">{a.asistentes}</td>
                        <td className="px-4 py-2.5 text-slate-500">{formatoHoras(a.horas)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => alternar(a.idActividad)}
                            aria-expanded={abierta}
                            className="whitespace-nowrap text-xs font-semibold text-unah-navy hover:underline"
                          >
                            {abierta ? "Ocultar evidencia ▴" : "Ver evidencia ▾"}
                          </button>
                        </td>
                      </tr>
                      {abierta && (
                        <tr>
                          <td colSpan={5} className="bg-white p-0">
                            <EvidenciaActividad idActividad={a.idActividad} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {informe.actividades.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
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
                onClick={() => pedirConfirmacion("ACEPTADO")}
                disabled={resolviendo}
                className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Aceptar informe
              </button>
              <button
                type="button"
                onClick={() => pedirConfirmacion("OBSERVADO")}
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
