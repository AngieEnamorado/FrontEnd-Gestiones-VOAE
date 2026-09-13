import { useMemo, useState } from "react";
import { HiOutlineDocumentArrowDown } from "react-icons/hi2";
import BotonAccion from "../../../components/procad/BotonAccion";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import TablaDatos, { type ColumnaTabla } from "../../../components/procad/TablaDatos";
import { CENTROS, PERIODOS, agrupacionesProcad } from "../../../data/mockProcadEstadisticas";
import { escalarConteo, suma } from "../../../utils/procadMetricas";
import { generarReportePdf } from "../../../utils/exportarPdf";
import { SELLO_PROCAD } from "../reportePdf";

type Corte = "agrupacion" | "campus" | "periodo";

const TITULOS: Record<Corte, string> = {
  agrupacion: "Reporte por agrupación",
  campus: "Reporte por campus",
  periodo: "Reporte por período",
};

/**
 * Los mismos números del panel de estadísticas, pero en forma de tabla para
 * llevárselos. Aquí no hay gráficos a propósito: esto es lo que se adjunta a
 * un oficio, no lo que se lee en pantalla.
 */
export default function TablaReportes() {
  const [corte, setCorte] = useState<Corte>("agrupacion");

  const { columnas, filas } = useMemo<{
    columnas: ColumnaTabla[];
    filas: (string | number)[][];
  }>(() => {
    if (corte === "agrupacion") {
      return {
        columnas: [
          { label: "Agrupación" },
          { label: "Estudiantes", numerica: true },
          { label: "Act. validadas", numerica: true },
          { label: "% elegibilidad", numerica: true },
        ],
        filas: agrupacionesProcad.map((a) => [
          a.nombre,
          a.estudiantes,
          a.validadas,
          `${a.elegibilidad}%`,
        ]),
      };
    }

    if (corte === "campus") {
      return {
        columnas: [
          { label: "Campus" },
          { label: "Grupos", numerica: true },
          { label: "Estudiantes", numerica: true },
          { label: "Act. validadas", numerica: true },
        ],
        filas: CENTROS.map((c) => {
          const rows = agrupacionesProcad.filter((a) => a.centro === c);
          if (rows.length === 0) return null;
          return [c, rows.length, suma(rows, "estudiantes"), suma(rows, "validadas")];
        }).filter((f): f is (string | number)[] => f !== null),
      };
    }

    return {
      columnas: [
        { label: "Período" },
        { label: "Estudiantes", numerica: true },
        { label: "Act. validadas", numerica: true },
        { label: "% elegibilidad", numerica: true },
      ],
      filas: PERIODOS.map((p, i) => [
        p.label.replace(" (actual)", ""),
        escalarConteo(suma(agrupacionesProcad, "estudiantes"), i),
        escalarConteo(suma(agrupacionesProcad, "validadas"), i),
        `${p.elegibilidad}%`,
      ]),
    };
  }, [corte]);

  function exportar() {
    generarReportePdf(
      "PROCAD",
      TITULOS[corte],
      [{ titulo: TITULOS[corte], columnas: columnas.map((c) => c.label), filas }],
      `procad-reporte-${corte}.pdf`,
      SELLO_PROCAD,
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ChipsFiltro
          etiqueta="Tipo de reporte"
          activa={corte}
          onCambiar={setCorte}
          opciones={[
            { id: "agrupacion", label: "Por agrupación" },
            { id: "campus", label: "Por campus" },
            { id: "periodo", label: "Por período" },
          ]}
        />
        <BotonAccion tono="primario" onClick={exportar}>
          <HiOutlineDocumentArrowDown className="h-3.5 w-3.5" />
          Exportar a PDF
        </BotonAccion>
      </div>

      <TablaDatos anchoMinimo="640px" columnas={columnas} filas={filas} />
    </div>
  );
}
