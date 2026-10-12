import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlineCheck, HiOutlineExclamationTriangle } from "react-icons/hi2";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import BadgeEstadoVoluntariado from "../../../components/voluntariado/BadgeEstadoVoluntariado";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeRed } from "../../../utils/voluntariado";

const NOMBRE_DOCUMENTO: Record<string, string> = {
  ESTATUTOS: "Estatutos",
  LOGO: "Logo del grupo",
  ACTA: "Acta de junta",
};

export default function SolicitudGrupoDetalle() {
  const { id } = useParams<{ id: string }>();
  const idSolicitud = Number(id);
  const navigate = useNavigate();
  const carga = useApi(
    () => Promise.all([voluntariadoApi.solicitudGrupo(idSolicitud), voluntariadoApi.catalogos()]),
    [idSolicitud],
  );
  const [motivo, setMotivo] = useState("");
  const [redes, setRedes] = useState<number[]>([]);
  const [resolviendo, setResolviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuentasSinPersona, setCuentasSinPersona] = useState<string[] | null>(null);

  if (!carga.datos) {
    return (
      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
        {null}
      </EstadoCarga>
    );
  }

  const [solicitud, catalogos] = carga.datos;
  const pendiente = solicitud.codigoEstado === "PENDIENTE";
  const requiereMotivo = motivo.trim().length === 0;
  const requisitos = catalogos.requisitos.filter((r) => r.procesoRequisito === "SOLICITUD_GRUPO");

  function alternarRed(idRed: number) {
    setRedes((prev) => (prev.includes(idRed) ? prev.filter((r) => r !== idRed) : [...prev, idRed]));
  }

  async function resolver(estado: "APROBADA" | "RECHAZADA" | "DEVUELTA") {
    setResolviendo(true);
    setError(null);
    try {
      const resultado = await voluntariadoApi.resolverSolicitudGrupo(idSolicitud, estado, motivo.trim() || null, redes);
      // Una cuenta de la junta que aún no existe como persona no se inventa:
      // se avisa para que la agreguen a mano cuando exista.
      if (resultado.cuentasSinPersona?.length) {
        setCuentasSinPersona(resultado.cuentasSinPersona);
        carga.recargar();
        setResolviendo(false);
        return;
      }
      navigate("/voluntariado/solicitudes-grupos");
    } catch (e) {
      setError(mensajeDeError(e));
      setResolviendo(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/voluntariado/solicitudes-grupos" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
        ‹ Volver a la bandeja
      </Link>

      {cuentasSinPersona && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-[13px] font-semibold text-amber-800">
            Grupo creado. Estas cuentas de la junta no existen todavía en Registro y no se agregaron como miembros:{" "}
            {cuentasSinPersona.join(", ")}.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-800">{solicitud.nombreGrupo}</h1>
              <p className="text-sm text-slate-500">
                {solicitud.nombreCampus} · Solicitante: {solicitud.nombrePersona} {solicitud.apellidosPersona}
              </p>
            </div>
            <BadgeEstadoVoluntariado codigo={solicitud.codigoEstado} />
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Reseña y propósito</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{solicitud.resenaHistorica}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{solicitud.propositoGrupo}</p>
          </div>

          {(solicitud.misionGrupo || solicitud.visionGrupo) && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Misión</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{solicitud.misionGrupo}</p>
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Visión</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{solicitud.visionGrupo}</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Junta directiva propuesta</h2>
            <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {solicitud.juntaDirectiva.map((f) => (
                <div key={`${f.idCargo}-${f.numeroCuenta}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-600">{f.nombreCargo}</span>
                  <span className="text-right text-slate-500">
                    {f.nombre ?? <span className="text-amber-600">no está en Registro</span>} · {f.numeroCuenta}
                  </span>
                </div>
              ))}
              {solicitud.juntaDirectiva.length === 0 && <p className="px-4 py-2.5 text-sm text-slate-400">— sin asignar —</p>}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Fundadores ({solicitud.fundadores.length})
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {solicitud.fundadores.map((m) => (
                <span
                  key={m.numeroCuenta}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    m.matriculaValida ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {m.matriculaValida ? <HiOutlineCheck className="h-3.5 w-3.5" /> : <HiOutlineExclamationTriangle className="h-3.5 w-3.5" />}
                  {m.nombre ?? m.numeroCuenta}
                </span>
              ))}
            </div>
          </div>

          {solicitud.actividadesProyectadas.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Actividades proyectadas</h2>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                {solicitud.actividadesProyectadas.map((a) => (
                  <li key={a.nombreActividad}>
                    {a.nombreActividad}
                    {a.fechaTentativa && <span className="text-slate-400"> · {a.fechaTentativa.slice(0, 7)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Documentos</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {requisitos.map((r) => (
                <ChipDocumento
                  key={r.idRequisitoAdjunto}
                  label={NOMBRE_DOCUMENTO[r.tipoRequisito] ?? r.tipoRequisito}
                  adjunto={solicitud.adjuntos.some((a) => a.idRequisitoAdjunto === r.idRequisitoAdjunto)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Decisión</h2>
          {pendiente ? (
            <>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-slate-500">Redes temáticas del grupo</p>
                <div className="flex flex-wrap gap-1.5">
                  {catalogos.redes.map((r) => {
                    const activa = redes.includes(r.idRedTematica);
                    return (
                      <button
                        key={r.idRedTematica}
                        type="button"
                        onClick={() => alternarRed(r.idRedTematica)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          activa ? claseChipColor[colorDeRed(r.idRedTematica)] : "bg-slate-50 text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        {r.nombreRedTematica}
                      </button>
                    );
                  })}
                </div>
              </div>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Motivo (requerido para rechazar o devolver)"
                className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
              />
              {error && <p className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">{error}</p>}
              <button
                type="button"
                onClick={() => resolver("APROBADA")}
                disabled={resolviendo}
                className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Aprobar grupo
              </button>
              <button
                type="button"
                onClick={() => resolver("DEVUELTA")}
                disabled={requiereMotivo || resolviendo}
                className="rounded-lg bg-violet-100 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Devolver para corrección
              </button>
              <button
                type="button"
                onClick={() => resolver("RECHAZADA")}
                disabled={requiereMotivo || resolviendo}
                className="rounded-lg bg-red-100 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Rechazar
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-600">
              <p>Esta solicitud ya fue resuelta.</p>
              {solicitud.motivoResolucion && (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-slate-600">{solicitud.motivoResolucion}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChipDocumento({ label, adjunto }: { label: string; adjunto: boolean }) {
  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
        adjunto ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
      }`}
    >
      {label} {adjunto ? "✓" : "—"}
    </span>
  );
}
