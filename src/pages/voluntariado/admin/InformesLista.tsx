import { Link } from "react-router-dom";
import { HiOutlineArrowDownTray, HiOutlineDocumentText } from "react-icons/hi2";
import BadgeEstadoInforme from "../../../components/voluntariado/BadgeEstadoInforme";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type InformeResumenApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { estadoInforme, formatoHoras, nombreTrimestre } from "../../../utils/voluntariado";
import { generarReportePdf } from "../../../utils/exportarPdf";

const ENCABEZADOS = ["Campus", "Grupo", "Trimestre", "Estado", "Actividades", "Participantes", "Horas"];

// La exportación usa las mismas filas que la tabla, así no pueden discrepar.
function filas(informes: InformeResumenApi[]) {
  return informes.map((i) => [
    i.campus ?? "",
    i.nombreGrupo,
    nombreTrimestre(i),
    estadoInforme(i.codigoEstado),
    i.totalActividades,
    i.totalParticipantes,
    formatoHoras(i.horasTotales),
  ]);
}

function descargarExcel(informes: InformeResumenApi[]) {
  const lineas = filas(informes).map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const contenido = [ENCABEZADOS.join(","), ...lineas].join("\r\n");
  const blob = new Blob(["\ufeff" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "informes-trimestrales.csv";
  enlace.click();
  URL.revokeObjectURL(url);
}

function descargarPdf(informes: InformeResumenApi[]) {
  generarReportePdf(
    "Voluntariado",
    "Informes trimestrales",
    [{ titulo: "Resumen por grupo", columnas: ENCABEZADOS, filas: filas(informes) }],
    "informes-trimestrales.pdf",
  );
}

export default function InformesLista() {
  const carga = useApi(() => voluntariadoApi.informes(), []);
  const informes = carga.datos ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-800">Informes trimestrales</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => descargarExcel(informes)}
            disabled={informes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-600 transition-colors duration-150 hover:bg-slate-100"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> Exportar Excel
          </button>
          <button
            type="button"
            onClick={() => descargarPdf(informes)}
            disabled={informes.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition-colors duration-150 hover:bg-slate-100"
          >
            <HiOutlineDocumentText className="h-4 w-4" /> Exportar PDF
          </button>
        </div>
      </div>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Campus</th>
                <th className="px-5 py-3">Grupo</th>
                <th className="px-5 py-3">Trimestre</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Actividades</th>
                <th className="px-5 py-3">Participantes</th>
                <th className="px-5 py-3">Horas</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {informes.map((i) => (
                <tr key={i.idInformeTrimestral} className="transition-colors duration-150 hover:bg-slate-100">
                  <td className="px-5 py-3.5 text-slate-600">{i.campus}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{i.nombreGrupo}</td>
                  <td className="px-5 py-3.5 text-slate-500">{nombreTrimestre(i)}</td>
                  <td className="px-5 py-3.5"><BadgeEstadoInforme estado={estadoInforme(i.codigoEstado)} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{i.totalActividades}</td>
                  <td className="px-5 py-3.5 text-slate-500">{i.totalParticipantes}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatoHoras(i.horasTotales)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/voluntariado/informes/${i.idInformeTrimestral}`} className="text-xs font-semibold text-unah-orange hover:underline">
                      Abrir ›
                    </Link>
                  </td>
                </tr>
              ))}
              {informes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">
                    Todavía no hay informes trimestrales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </EstadoCarga>
    </div>
  );
}
