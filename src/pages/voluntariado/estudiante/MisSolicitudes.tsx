import EstadoBadge from "../../../components/EstadoBadge";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { solicitudesEstudianteVoluntariado } from "../../../data/mockSolicitudesVoluntariado";

export default function MisSolicitudes() {
  const solicitudes = solicitudesEstudianteVoluntariado.filter(
    (s) => s.estudianteCuenta === estudianteActual.numeroCuenta,
  );

  return (
    <div className="px-4 py-4">
      <h1 className="text-[17px] font-bold text-slate-800">Mis solicitudes</h1>

      <div className="mt-4 flex flex-col gap-3">
        {solicitudes.length === 0 && <p className="text-sm text-slate-400">Aún no has enviado solicitudes.</p>}

        {solicitudes.map((s) => (
          <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13.5px] font-bold text-slate-800">{s.titulo}</p>
              <EstadoBadge estado={s.estado} />
            </div>
            <p className="mt-1 text-[11.5px] capitalize text-slate-400">{s.tipo} · {s.fecha}</p>

            {s.motivoDecision && (
              <div className="mt-2.5 rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-500">Motivo</p>
                <p className="mt-0.5 text-[12.5px] text-slate-600">{s.motivoDecision}</p>
              </div>
            )}

            {s.estado === "DEVUELTA" && (
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-violet-600 py-2 text-[12.5px] font-semibold text-white hover:bg-violet-700"
              >
                Corregir y reenviar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
