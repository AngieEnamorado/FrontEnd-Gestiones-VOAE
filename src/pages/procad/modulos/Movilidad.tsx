import { useMemo, useState } from "react";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import BotonAccion from "../../../components/procad/BotonAccion";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useProcad } from "../../../context/ProcadContext";
import { CENTROS, agrupacionesProcad } from "../../../data/mockProcadEstadisticas";
import { generarReportePdf } from "../../../utils/exportarPdf";
import { SELLO_PROCAD } from "../reportePdf";

const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";
const claseCampo =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition-colors focus:border-unah-orange";

/**
 * Apto para movilidad es quien tiene la solicitud aprobada: sin eso no hay
 * integrante que movilizar. El PDF es el documento que se entrega a Transporte
 * o a la unidad que corresponda.
 */
export default function Movilidad() {
  const { solicitudes } = useProcad();
  const [centro, setCentro] = useState("todos");
  const [agrupacion, setAgrupacion] = useState("todas");

  const aptos = useMemo(
    () =>
      solicitudes.filter((s) => {
        if (s.estado !== "aprobada") return false;
        if (centro !== "todos" && s.centro !== centro) return false;
        if (agrupacion !== "todas" && s.grupo !== agrupacion) return false;
        return true;
      }),
    [solicitudes, centro, agrupacion],
  );

  function generarPdf() {
    generarReportePdf(
      "PROCAD",
      "Estudiantes aptos para movilidad",
      [
        {
          titulo: "Filtros aplicados",
          columnas: ["Filtro", "Valor"],
          filas: [
            ["Campus", centro === "todos" ? "Todos" : centro],
            ["Agrupación", agrupacion === "todas" ? "Todas" : agrupacion],
            ["Criterio", "Integrantes con solicitud aprobada"],
          ],
        },
        {
          titulo: `Aptos para movilidad (${aptos.length})`,
          columnas: ["Estudiante", "Cuenta", "Agrupación", "Campus", "Índice"],
          filas: aptos.map((s) => [s.nombre, s.cuenta, s.grupo, s.centro, `${s.indice}%`]),
        },
      ],
      "procad-aptos-movilidad.pdf",
      SELLO_PROCAD,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className={claseLabel} htmlFor="mov-centro">
              Campus
            </label>
            <select
              id="mov-centro"
              value={centro}
              onChange={(e) => setCentro(e.target.value)}
              className={claseCampo}
            >
              <option value="todos">Todos</option>
              {CENTROS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[240px] flex-1">
            <label className={claseLabel} htmlFor="mov-agrupacion">
              Agrupación
            </label>
            <select
              id="mov-agrupacion"
              value={agrupacion}
              onChange={(e) => setAgrupacion(e.target.value)}
              className={claseCampo}
            >
              <option value="todas">Todas</option>
              {agrupacionesProcad.map((a) => (
                <option key={a.nombre} value={a.nombre}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 py-1">
            <p className="text-xs font-semibold text-slate-400">
              {aptos.length} apto{aptos.length === 1 ? "" : "s"}
            </p>
            <BotonAccion tono="primario" onClick={generarPdf}>
              <HiOutlineDocumentArrowDown className="h-3.5 w-3.5" />
              Generar PDF
            </BotonAccion>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <TablaDatos
          anchoMinimo="820px"
          columnas={[
            { label: "Estudiante" },
            { label: "Cuenta" },
            { label: "Agrupación" },
            { label: "Campus" },
            { label: "Índice", numerica: true },
          ]}
          filas={aptos.map((s) => [
            <span key={`n-${s.id}`} className="font-medium text-slate-700">
              {s.nombre}
            </span>,
            <span key={`c-${s.id}`} className="font-mono text-xs">
              {s.cuenta}
            </span>,
            s.grupo,
            s.centro,
            `${s.indice}%`,
          ])}
        />
      </div>
    </div>
  );
}
