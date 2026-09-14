import { useState } from "react";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { gruposVoluntariado } from "../../../data/mockGruposVoluntariado";
import { nombreCampus, redPorId } from "../../../data/mockCatalogosVoluntariado";

export default function GestionGrupos() {
  const [reasignando, setReasignando] = useState<string | null>(null);
  const [coordinadores, setCoordinadores] = useState<Record<string, string>>({});

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Gestión de grupos</h1>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Grupo</th>
                <th className="px-5 py-3">Campus</th>
                <th className="px-5 py-3">Coordinador</th>
                <th className="px-5 py-3">Redes temáticas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gruposVoluntariado.map((grupo) => {
                const cuentaCoordinador = coordinadores[grupo.id] ?? grupo.coordinadorCuenta;
                const coordinador = grupo.miembros.find((m) => m.numeroCuenta === cuentaCoordinador);
                return (
                  <tr key={grupo.id} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <LogoGrupo iniciales={grupo.logoIniciales} color={grupo.logoColor} tamano="sm" />
                        <span className="font-semibold text-slate-800">{grupo.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{nombreCampus(grupo.campusId)}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {reasignando === grupo.id ? (
                        <select
                          autoFocus
                          value={cuentaCoordinador}
                          onChange={(e) => {
                            setCoordinadores((prev) => ({ ...prev, [grupo.id]: e.target.value }));
                            setReasignando(null);
                          }}
                          onBlur={() => setReasignando(null)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          {grupo.miembros.map((m) => (
                            <option key={m.numeroCuenta} value={m.numeroCuenta}>{m.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        coordinador?.nombre
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {grupo.redesIds.map((redId) => {
                          const red = redPorId(redId);
                          if (!red) return null;
                          return (
                            <span key={redId} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${claseChipColor[red.color]}`}>
                              {red.nombre}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700">Activo</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setReasignando(grupo.id)}
                        className="text-xs font-semibold text-unah-orange hover:underline"
                      >
                        Reasignar ›
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
