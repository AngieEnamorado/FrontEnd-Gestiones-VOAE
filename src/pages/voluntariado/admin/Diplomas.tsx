import { useMemo, useState } from "react";
import { gruposVoluntariado } from "../../../data/mockGruposVoluntariado";
import { nombreCampus } from "../../../data/mockCatalogosVoluntariado";
import { porcentajeParticipacion } from "../../../data/voluntariadoSelectors";

const UMBRAL = 50;

export default function Diplomas() {
  const [emitidos, setEmitidos] = useState<Set<string>>(new Set());

  const filas = useMemo(
    () =>
      gruposVoluntariado.flatMap((grupo) =>
        grupo.miembros.map((miembro) => ({
          key: `${grupo.id}-${miembro.numeroCuenta}`,
          grupo,
          miembro,
          porcentaje: porcentajeParticipacion(grupo.id, miembro.numeroCuenta),
        })),
      ),
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Diplomas de reconocimiento</h1>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Estudiante</th>
                <th className="px-5 py-3">Grupo</th>
                <th className="px-5 py-3">Campus</th>
                <th className="px-5 py-3">% Participación</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((f) => {
                const elegible = f.porcentaje >= UMBRAL;
                const emitido = emitidos.has(f.key);
                return (
                  <tr key={f.key} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{f.miembro.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{f.grupo.nombre}</td>
                    <td className="px-5 py-3.5 text-slate-600">{nombreCampus(f.grupo.campusId)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-[70px] overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${f.porcentaje}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{f.porcentaje}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={!elegible || emitido}
                        onClick={() => setEmitidos((prev) => new Set(prev).add(f.key))}
                        className="rounded-lg bg-unah-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-unah-navy-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        {emitido ? "Diploma emitido ✓" : "Emitir diploma"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
