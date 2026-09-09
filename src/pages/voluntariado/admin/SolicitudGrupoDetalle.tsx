import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlineCheck } from "react-icons/hi2";
import { solicitudesGrupoVoluntariado } from "../../../data/mockGruposVoluntariado";
import { nombreCampus, redPorId } from "../../../data/mockCatalogosVoluntariado";
import { claseChipColor } from "../../../components/voluntariado/colores";

export default function SolicitudGrupoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const solicitud = solicitudesGrupoVoluntariado.find((s) => s.id === id);
  const [motivo, setMotivo] = useState("");

  if (!solicitud) {
    return <p className="text-sm text-slate-400">Solicitud no encontrada.</p>;
  }

  const solicitante = solicitud.miembros.find((m) => m.numeroCuenta === solicitud.solicitanteCuenta);
  const requiereMotivo = motivo.trim().length === 0;

  function resolver() {
    navigate("/voluntariado/solicitudes-grupos");
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/voluntariado/solicitudes-grupos" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
        ‹ Volver a la bandeja
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{solicitud.nombre}</h1>
            <p className="text-sm text-slate-500">{nombreCampus(solicitud.campusId)} · Solicitante: {solicitante?.nombre}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {solicitud.redesIds.map((redId) => {
              const red = redPorId(redId);
              if (!red) return null;
              return (
                <span key={redId} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${claseChipColor[red.color]}`}>
                  {red.nombre}
                </span>
              );
            })}
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Reseña y propósito</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{solicitud.reseñaHistorica}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{solicitud.campoAccion}</p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Junta directiva propuesta</h2>
            <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {solicitud.juntaDirectiva.map((f) => (
                <div key={f.cargo} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-600">{f.cargo}</span>
                  <span className="text-slate-500">{f.numeroCuenta || "— sin asignar —"}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Fundadores validados ({solicitud.miembros.length})
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {solicitud.miembros.map((m) => (
                <span
                  key={m.numeroCuenta}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                >
                  <HiOutlineCheck className="h-3.5 w-3.5" />
                  {m.nombre}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Documentos</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <ChipDocumento label="Estatutos" adjunto={solicitud.documentos.estatutos} />
              <ChipDocumento label="Logo del grupo" adjunto={solicitud.documentos.logo} />
              <ChipDocumento label="Acta de junta" adjunto={solicitud.documentos.actaJunta} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Decisión</h2>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            placeholder="Motivo (requerido para rechazar o devolver)"
            className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
          />
          <button
            type="button"
            onClick={resolver}
            className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Aprobar grupo
          </button>
          <button
            type="button"
            onClick={resolver}
            disabled={requiereMotivo}
            className="rounded-lg bg-violet-100 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Devolver para corrección
          </button>
          <button
            type="button"
            onClick={resolver}
            disabled={requiereMotivo}
            className="rounded-lg bg-red-100 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Rechazar
          </button>
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
