import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
} from "react-icons/hi2";
import EstadoBadge from "../../components/EstadoBadge";
import DetalleInscripcionModal from "../../components/DetalleInscripcionModal";
import { misGiras } from "../../data/mockMisGiras";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import { inscripcionesPorGira } from "../../data/mockInscripciones";
import type { Inscripcion } from "../../types";

const todasLasGiras = [...misGiras, ...solicitudesGiras];

function descargarExcel(gira: string, filas: Inscripcion[]) {
  const encabezados = ["ID Inscripción", "Nombre estudiante", "Estado", "Fecha", "Período"];
  const lineas = filas.map((fila) =>
    [fila.id, fila.nombreEstudiante, fila.estado, fila.fecha, fila.periodo]
      .map((valor) => `"${valor.replace(/"/g, '""')}"`)
      .join(","),
  );
  const contenido = [encabezados.join(","), ...lineas].join("\r\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `inscripciones-${gira}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function InscripcionesGira() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<Inscripcion | null>(null);

  const gira = useMemo(() => todasLasGiras.find((g) => g.id === id), [id]);
  const inscripciones = useMemo(() => (id ? inscripcionesPorGira[id] ?? [] : []), [id]);

  const filas = useMemo(
    () =>
      inscripciones.filter(
        (i) =>
          i.id.toLowerCase().includes(busqueda.toLowerCase()) ||
          i.nombreEstudiante.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [inscripciones, busqueda],
  );

  function regresarAMisGiras() {
    navigate("/giras/mis-giras");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={regresarAMisGiras}
          className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Regresar
        </button>

        <button
          type="button"
          onClick={() => descargarExcel(id ?? "gira", filas)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" />
          Descargar Excel
        </button>
      </div>

      {!gira ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No se encontró la gira solicitada.
        </div>
      ) : (
        <>
          {/* Información general de la gira */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Información general de la gira</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  ID Gira
                </p>
                <span className="mt-1 inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                  {gira.id}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Destino
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{gira.destino}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Categoría / Carrera
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{gira.categoria}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Centro
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{gira.centro}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Período
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{gira.periodo}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Fecha
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{gira.fecha}</p>
              </div>
            </div>
          </div>

          {/* Tabla de inscripciones */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">Inscripciones registradas</h2>

            {/* Búsqueda y filtros */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por ID o nombre del estudiante..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
                />
              </div>

              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-unah-orange">
                <option>Todos los años</option>
                <option>2026</option>
                <option>2025</option>
              </select>

              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-unah-orange">
                <option>Todos los períodos</option>
                <option>I Periodo</option>
                <option>II Periodo</option>
                <option>III Periodo</option>
              </select>
            </div>

            {/* Tabla */}
            <div className="table-scrollbar mt-4 overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead>
                  <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">ID Inscripción</th>
                    <th className="px-4 py-3">Nombre estudiante</th>
                    <th className="px-4 py-3">Estado de inscripción</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3 text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filas.map((fila) => (
                    <tr key={fila.id} className="bg-white hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          {fila.id}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">
                        {fila.nombreEstudiante}
                      </td>
                      <td className="px-4 py-4">
                        <EstadoBadge estado={fila.estado} />
                      </td>
                      <td className="px-4 py-4 text-slate-500">{fila.fecha}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.periodo}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            title="Ver"
                            onClick={() => setSeleccionada(fila)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                        No se encontraron inscripciones con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <DetalleInscripcionModal inscripcion={seleccionada} onClose={() => setSeleccionada(null)} />
    </div>
  );
}
