import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiChevronLeft,
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineEye,
} from "react-icons/hi2";
import DetalleSolicitudGiraModal from "../../components/DetalleSolicitudGiraModal";
import { misGiras } from "../../data/mockMisGiras";
import type { SolicitudGira } from "../../types";

function descargarExcel(filas: SolicitudGira[]) {
  const encabezados = ["ID", "Destino", "Categoría", "Centro", "Período", "Fecha"];
  const lineas = filas.map((fila) =>
    [fila.id, fila.destino, fila.categoria, fila.centro, fila.periodo, fila.fecha]
      .map((valor) => `"${valor.replace(/"/g, '""')}"`)
      .join(","),
  );
  const contenido = [encabezados.join(","), ...lineas].join("\r\n");
  const blob = new Blob(["﻿" + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "mis-giras.csv";
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function MisGiras() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<SolicitudGira | null>(null);

  const filas = useMemo(
    () =>
      misGiras.filter(
        (g) =>
          g.id.toLowerCase().includes(busqueda.toLowerCase()) ||
          g.destino.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [busqueda],
  );

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Encabezado */}
        <button
          type="button"
          onClick={() => navigate("/estudiantes/solicitudes")}
          className="flex items-center gap-1.5 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
        >
          <HiChevronLeft className="h-4 w-4" />
          Regresar
        </button>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Mis Giras</h1>
          </div>

          <button
            type="button"
            onClick={() => descargarExcel(filas)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" />
            Descargar Excel
          </button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por ID o destino..."
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

          <button
            type="button"
            title="Limpiar filtros"
            onClick={() => setBusqueda("")}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50"
          >
            <HiOutlineArrowPath className="h-4 w-4" />
          </button>
        </div>

        {/* Tabla */}
        <div className="table-scrollbar mt-4 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="bg-[#003366] text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Centro</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Fecha</th>
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
                  <td className="px-4 py-4 font-medium text-slate-700">{fila.destino}</td>
                  <td className="px-4 py-4 text-slate-600">{fila.categoria}</td>
                  <td className="px-4 py-4 text-slate-600">{fila.centro}</td>
                  <td className="px-4 py-4 text-slate-600">{fila.periodo}</td>
                  <td className="px-4 py-4 text-slate-500">{fila.fecha}</td>
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
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No se encontraron giras con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetalleSolicitudGiraModal solicitud={seleccionada} onClose={() => setSeleccionada(null)} />
    </>
  );
}
