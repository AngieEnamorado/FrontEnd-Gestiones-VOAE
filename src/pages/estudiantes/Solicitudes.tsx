import { useMemo, useState } from "react";
import {
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineListBullet,
  HiOutlineHome,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineHeart,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { HiAcademicCap } from "react-icons/hi2";
import EstadisticaCard from "../../components/EstadisticaCard";
import EstadoBadge from "../../components/EstadoBadge";
import { estadisticasSolicitudes, solicitudes } from "../../data/mockSolicitudes";
import type { TipoBeca } from "../../types";

const iconosPorEstadistica = {
  total: { icon: HiOutlineListBullet, fondo: "bg-blue-50", icono: "text-blue-500", texto: "text-blue-700" },
  aprobadas: {
    icon: HiOutlineCheckCircle,
    fondo: "bg-emerald-50",
    icono: "text-emerald-500",
    texto: "text-emerald-700",
  },
  pendientes: {
    icon: HiOutlineClock,
    fondo: "bg-amber-50",
    icono: "text-amber-500",
    texto: "text-amber-700",
  },
  "en-revision": {
    icon: HiOutlineMagnifyingGlass,
    fondo: "bg-violet-50",
    icono: "text-violet-500",
    texto: "text-violet-700",
  },
  "espera-social": {
    icon: HiOutlineExclamationCircle,
    fondo: "bg-sky-50",
    icono: "text-sky-500",
    texto: "text-sky-700",
  },
  rechazadas: {
    icon: HiOutlineXCircle,
    fondo: "bg-rose-50",
    icono: "text-rose-500",
    texto: "text-rose-700",
  },
} as const;

export default function Solicitudes() {
  const [tab, setTab] = useState<TipoBeca>("academica");
  const [busqueda, setBusqueda] = useState("");

  const filas = useMemo(
    () =>
      solicitudes.filter(
        (s) =>
          s.tipoBeca === tab &&
          s.nombreEstudiante.toLowerCase().includes(busqueda.toLowerCase()),
      ),
    [tab, busqueda],
  );

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wider text-unah-orange">ESTUDIANTES</p>
          <h1 className="text-2xl font-bold text-slate-800">Solicitudes</h1>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
        >
          <HiOutlineArrowDownTray className="h-4 w-4" />
          Descargar Excel
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {estadisticasSolicitudes.map((stat) => {
          const conf = iconosPorEstadistica[stat.key as keyof typeof iconosPorEstadistica];
          return (
            <EstadisticaCard
              key={stat.key}
              icon={conf.icon}
              label={stat.label}
              valor={stat.valor}
              colorFondo={conf.fondo}
              colorIcono={conf.icono}
              colorTexto={conf.texto}
            />
          );
        })}
      </div>

      {/* Tabs de tipo de beca */}
      <div className="mt-6 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("academica")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "academica"
              ? "bg-unah-navy text-white shadow"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <HiAcademicCap className="h-4 w-4" />
          Beca Académica UNAH
        </button>
        <button
          type="button"
          onClick={() => setTab("bienestar")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            tab === "bienestar"
              ? "bg-unah-navy text-white shadow"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <HiOutlineHeart className="h-4 w-4" />
          Ayuda Económica Mi Bienestar
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre de estudiante..."
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
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white/80">
              <th className="px-4 py-3">N°</th>
              <th className="px-4 py-3">Estudiante / Cuenta</th>
              <th className="px-4 py-3">Beca solicitada</th>
              <th className="px-4 py-3">Beca aprobada</th>
              <th className="px-4 py-3">Carrera / Centro</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Opciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map((fila, idx) => (
              <tr key={fila.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 text-slate-400">{idx + 1}</td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-800">{fila.nombreEstudiante}</p>
                  <span className="mt-1 inline-block rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-500">
                    {fila.numeroCuenta}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-600">{fila.becaSolicitada}</td>
                <td className="px-4 py-4 text-slate-400">{fila.becaAprobada ?? "—"}</td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-700">{fila.carrera}</p>
                  <p className="text-xs text-slate-400">{fila.centro}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {fila.categoria}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <EstadoBadge estado={fila.estado} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      title="Ver"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    >
                      <HiOutlineEye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Detalle"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                    >
                      <HiOutlineListBullet className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Carrera"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                    >
                      <HiOutlineHome className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  No se encontraron solicitudes con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Mostrando {filas.length === 0 ? 0 : 1}-{filas.length} de {filas.length} solicitudes
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <HiOutlineChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <HiOutlineChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-unah-navy text-sm font-semibold text-white"
          >
            1
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <HiOutlineChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
          >
            <HiOutlineChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
