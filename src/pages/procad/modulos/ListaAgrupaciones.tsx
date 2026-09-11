import { useMemo, useState } from "react";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { ETIQUETA_TIPO } from "../../../components/procad/paleta";
import { agrupacionesProcad } from "../../../data/mockProcadEstadisticas";
import type { TipoAgrupacion } from "../../../types";

type FiltroTipo = TipoAgrupacion | "todos";

/** Todas las agrupaciones activas del período, en un solo lugar. */
export default function ListaAgrupaciones() {
  const [tipo, setTipo] = useState<FiltroTipo>("todos");

  const filtradas = useMemo(
    () => agrupacionesProcad.filter((a) => tipo === "todos" || a.tipo === tipo),
    [tipo],
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ChipsFiltro
          etiqueta="Filtrar por clasificación"
          activa={tipo}
          onCambiar={setTipo}
          opciones={[
            { id: "todos", label: "Todas" },
            { id: "deportivo", label: "Deportivas" },
            { id: "artistico", label: "Artísticas" },
          ]}
        />
        <p className="text-xs font-semibold text-slate-400">
          {filtradas.length} de {agrupacionesProcad.length} agrupaciones
        </p>
      </div>

      <TablaDatos
        anchoMinimo="1180px"
        columnas={[
          { label: "Agrupación" },
          { label: "Clasificación" },
          { label: "Centro" },
          { label: "Disciplina / Deporte" },
          { label: "Estudiantes", numerica: true },
          { label: "% elegibilidad", numerica: true },
          { label: "% cumplimiento", numerica: true },
          { label: "Selección" },
        ]}
        filas={filtradas.map((a) => [
          <span key={`n-${a.nombre}`} className="font-medium text-slate-700">
            {a.nombre}
          </span>,
          ETIQUETA_TIPO[a.tipo],
          a.centro,
          a.tipo === "deportivo" ? (a.deporte ?? "—") : (a.disciplinas ?? []).join(", ") || "—",
          a.estudiantes,
          `${a.elegibilidad}%`,
          `${a.cumplimiento}%`,
          a.esSeleccion ? (
            <PildoraEstado key={`s-${a.nombre}`} tono="activo">
              Sí
            </PildoraEstado>
          ) : (
            "—"
          ),
        ])}
      />

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Una agrupación artística puede cubrir más de una disciplina a la vez, por eso esa columna
        llega a listar varias.
      </p>
    </div>
  );
}
