import { useState } from "react";
import { actividadesVoluntariado } from "../../../data/mockActividadesVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { nombreCampus } from "../../../data/mockCatalogosVoluntariado";

export default function AprobacionActividades() {
  const [resueltas, setResueltas] = useState<Set<string>>(new Set());
  const pendientes = actividadesVoluntariado.filter((a) => a.estado === "PENDIENTE" && !resueltas.has(a.id));

  function resolver(id: string) {
    setResueltas((prev) => new Set(prev).add(id));
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Aprobación de actividades</h1>

      <div className="flex flex-col gap-3">
        {pendientes.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            No hay actividades pendientes de aprobación.
          </div>
        )}

        {pendientes.map((actividad) => {
          const grupo = grupoPorId(actividad.grupoId);
          const coorganizador = actividad.grupoCoorganizadorId ? grupoPorId(actividad.grupoCoorganizadorId) : undefined;
          return (
            <div key={actividad.id} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-800">{actividad.nombre}</p>
                  {actividad.esConjunta && (
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-700">
                      CONJUNTA
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {grupo?.nombre}{coorganizador ? ` + ${coorganizador.nombre}` : ""} · {nombreCampus(grupo?.campusId ?? "")} · {actividad.fecha} · {actividad.lugar}
                </p>
                <p className="mt-1.5 text-sm text-slate-600">{actividad.objetivo}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => resolver(actividad.id)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => resolver(actividad.id)}
                  className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-200"
                >
                  Rechazar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
