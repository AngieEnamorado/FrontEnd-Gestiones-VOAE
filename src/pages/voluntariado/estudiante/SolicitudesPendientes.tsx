import { useState } from "react";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { solicitudesUnionPendientes, solicitantesInfo } from "../../../data/mockSolicitudesVoluntariado";
import { grupoCoordinadoPor } from "../../../data/voluntariadoSelectors";

export default function SolicitudesPendientes() {
  const grupo = grupoCoordinadoPor(estudianteActual.numeroCuenta);
  const [resueltas, setResueltas] = useState<Set<string>>(new Set());

  const pendientes = grupo
    ? solicitudesUnionPendientes.filter((s) => s.grupoId === grupo.id && !resueltas.has(s.id))
    : [];

  function resolver(id: string) {
    setResueltas((prev) => new Set(prev).add(id));
  }

  return (
    <>
      <HeaderMovilDetalle titulo="Solicitudes de unión" subtitulo={grupo?.nombre} />
      <div className="flex flex-col gap-3 px-4 py-4">
        {pendientes.length === 0 && (
          <p className="text-sm text-slate-400">No hay solicitudes de unión pendientes.</p>
        )}

        {pendientes.map((s) => {
          const info = solicitantesInfo[s.estudianteCuenta];
          return (
            <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                  {info?.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-slate-800">{info?.nombre ?? s.estudianteCuenta}</p>
                  <p className="truncate text-[11px] text-slate-400">{s.estudianteCuenta} · {info?.carrera}</p>
                </div>
              </div>
              <span className="mt-2.5 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700">
                ✓ Matrícula válida
              </span>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => resolver(s.id)}
                  className="flex-1 rounded-lg bg-emerald-600 py-2 text-[12.5px] font-semibold text-white hover:bg-emerald-700"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => resolver(s.id)}
                  className="flex-1 rounded-lg bg-red-100 py-2 text-[12.5px] font-semibold text-red-600 hover:bg-red-200"
                >
                  Rechazar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
