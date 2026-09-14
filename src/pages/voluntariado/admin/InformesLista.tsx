import { Link } from "react-router-dom";
import { HiOutlineArrowDownTray, HiOutlineDocumentText } from "react-icons/hi2";
import BadgeEstadoInforme from "../../../components/voluntariado/BadgeEstadoInforme";
import { informesTrimestrales } from "../../../data/mockInformesVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { nombreCampus } from "../../../data/mockCatalogosVoluntariado";
import { participantesUnicos, horasTotalesDeGrupo } from "../../../data/voluntariadoSelectors";
import { generarReportePdf } from "../../../utils/exportarPdf";

function filas() {
  return informesTrimestrales.map((informe) => {
    const grupo = grupoPorId(informe.grupoId);
    return {
      informe,
      grupo,
      actividades: informe.actividadesIds.length,
      participantes: participantesUnicos(informe.actividadesIds),
      horas: grupo ? horasTotalesDeGrupo(grupo.id) : 0,
    };
  });
}

function descargarExcel() {
  const encabezados = ["Campus", "Grupo", "Estado", "Actividades", "Participantes", "Horas"];
  const lineas = filas().map((f) =>
    [nombreCampus(f.grupo?.campusId ?? ""), f.grupo?.nombre ?? "", f.informe.estado, f.actividades, f.participantes, f.horas]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const contenido = [encabezados.join(","), ...lineas].join("\r\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "informes-trimestrales.csv";
  enlace.click();
  URL.revokeObjectURL(url);
}

function descargarPdf() {
  generarReportePdf(
    "Voluntariado",
    "Informes trimestrales",
    [
      {
        titulo: "Resumen por grupo",
        columnas: ["Campus", "Grupo", "Estado", "Actividades", "Participantes", "Horas"],
        filas: filas().map((f) => [
          nombreCampus(f.grupo?.campusId ?? ""),
          f.grupo?.nombre ?? "",
          f.informe.estado,
          f.actividades,
          f.participantes,
          f.horas,
        ]),
      },
    ],
    "informes-trimestrales.pdf",
  );
}

export default function InformesLista() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-800">Informes trimestrales</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={descargarExcel}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-600 transition-colors duration-150 hover:bg-slate-100"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> Exportar Excel
          </button>
          <button
            type="button"
            onClick={descargarPdf}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition-colors duration-150 hover:bg-slate-100"
          >
            <HiOutlineDocumentText className="h-4 w-4" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Campus</th>
                <th className="px-5 py-3">Grupo</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Actividades</th>
                <th className="px-5 py-3">Participantes</th>
                <th className="px-5 py-3">Horas</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas().map((f) => (
                <tr key={f.informe.id} className="transition-colors duration-150 hover:bg-slate-100">
                  <td className="px-5 py-3.5 text-slate-600">{nombreCampus(f.grupo?.campusId ?? "")}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{f.grupo?.nombre}</td>
                  <td className="px-5 py-3.5"><BadgeEstadoInforme estado={f.informe.estado} /></td>
                  <td className="px-5 py-3.5 text-slate-500">{f.actividades}</td>
                  <td className="px-5 py-3.5 text-slate-500">{f.participantes}</td>
                  <td className="px-5 py-3.5 text-slate-500">{f.horas}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/voluntariado/informes/${f.informe.id}`} className="text-xs font-semibold text-unah-orange hover:underline">
                      Abrir ›
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
