import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineArrowDownTray,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineEye,
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import DetalleGiraModal from "../../components/DetalleGiraModal";
import EstadoGiraBadge from "../../components/giras/EstadoGiraBadge";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { listarGiras } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { useEstudianteActual, useIdentidadGira, useRolGira } from "../../context/UserContext";
import { etiquetaPeriodo, fechaCorta } from "../../utils/girasFormato";
import type { GiraApi } from "../../types/giras";

const PERIODOS = [
  { valor: 1, etiqueta: "I Periodo" },
  { valor: 2, etiqueta: "II Periodo" },
  { valor: 3, etiqueta: "III Periodo" },
];

function descargarExcel(filas: GiraApi[]) {
  const encabezados = ["ID", "Destino", "Centro", "Período", "Fecha de salida", "Estado", "Inscritos"];
  const lineas = filas.map((fila) =>
    [
      `GIR-${fila.idGira}`,
      fila.destinoGira ?? "",
      fila.nombreCampus,
      etiquetaPeriodo(fila.anioPeriodo, fila.numeroPac),
      fechaCorta(fila.fechaSalidaConfirmada),
      fila.nombreEstado,
      `${fila.totalInscritos}/${fila.totalInscripciones}`,
    ]
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
  const { rol } = useRolGira();
  const estudiante = useEstudianteActual();
  const identidad = useIdentidadGira();
  // El estudiante solo consulta el detalle de la gira: el roster de inscritos
  // (y la tabla de inscripciones de cada gira) no es para él.
  const verInscripciones = rol !== "estudiante";
  const [busqueda, setBusqueda] = useState("");
  const [anio, setAnio] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [seleccionada, setSeleccionada] = useState<GiraApi | null>(null);

  const numeroCuenta = estudiante?.numeroCuenta;
  const idUsuario = identidad?.idUsuarioUnidad;
  const necesitaIdentidad = rol === "estudiante" || rol === "jefe-mision" || rol === "jefe-aprobacion";
  const sinIdentidad = necesitaIdentidad && (rol === "estudiante" ? !estudiante : !identidad);

  // Cada rol ve las suyas: el estudiante, aquellas en las que está inscrito; el
  // jefe de misión, las que organiza; el de aprobación, las que aprobó.
  const { datos, cargando, error } = useConsulta(async () => {
    if (rol === "estudiante") return numeroCuenta ? listarGiras({ numeroCuenta }) : [];
    if (rol === "jefe-mision") return idUsuario === undefined ? [] : listarGiras({ usuario: idUsuario });
    const todas = await listarGiras();
    return rol === "jefe-aprobacion" ? todas.filter((g) => g.idJefeAprobacion === idUsuario) : todas;
  }, [rol, numeroCuenta, idUsuario]);
  const giras = useMemo(() => datos ?? [], [datos]);

  const aniosDisponibles = useMemo(
    () => [...new Set(giras.map((g) => g.anioPeriodo).filter((a): a is number => a !== null))].sort((a, b) => b - a),
    [giras],
  );

  const filas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return giras.filter(
      (g) =>
        (!texto || `gir-${g.idGira}`.includes(texto) || (g.destinoGira ?? "").toLowerCase().includes(texto)) &&
        (!anio || g.anioPeriodo === Number(anio)) &&
        (!periodo || g.numeroPac === Number(periodo)),
    );
  }, [giras, busqueda, anio, periodo]);

  function limpiarFiltros() {
    setBusqueda("");
    setAnio("");
    setPeriodo("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Regresar
      </button>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Encabezado */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Mis Giras</h1>
            {rol === "jefe-aprobacion" && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">
                Estas son las giras que has aprobado como jefe de aprobación.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => descargarExcel(filas)}
            disabled={filas.length === 0}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors duration-150 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" />
            Descargar Excel
          </button>
        </div>

        {sinIdentidad ? (
          <div className="mt-6">
            <SinIdentidad
              rol={rol === "estudiante" ? "Estudiante" : rol === "jefe-mision" ? "Jefe de misión" : "Jefe de aprobación"}
            />
          </div>
        ) : (
          <>
            {/* Búsqueda y filtros */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por ID o destino..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
                />
              </div>

              <select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                aria-label="Filtrar por año"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-unah-orange"
              >
                <option value="">Todos los años</option>
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>

              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                aria-label="Filtrar por período"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-unah-orange"
              >
                <option value="">Todos los períodos</option>
                {PERIODOS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>

              <button
                type="button"
                title="Limpiar filtros"
                onClick={limpiarFiltros}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors duration-150 hover:bg-slate-100"
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
                    <th className="px-4 py-3">Centro</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filas.map((fila) => (
                    <tr key={fila.idGira} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          GIR-{fila.idGira}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{fila.destinoGira ?? "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.nombreCampus}</td>
                      <td className="px-4 py-4 text-slate-600">{etiquetaPeriodo(fila.anioPeriodo, fila.numeroPac)}</td>
                      <td className="px-4 py-4 text-slate-500">{fechaCorta(fila.fechaSalidaConfirmada)}</td>
                      <td className="px-4 py-4">
                        <EstadoGiraBadge codigo={fila.codigoEstado} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            title="Ver"
                            onClick={() => setSeleccionada(fila)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          >
                            <HiOutlineEye className="h-4 w-4" />
                          </button>
                          {verInscripciones && (
                            <button
                              type="button"
                              title="Inscripciones de la gira"
                              onClick={() => navigate(`/giras/mis-giras/${fila.idGira}/inscripciones`)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                              <HiOutlineUserGroup className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {cargando && giras.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                        Cargando giras…
                      </td>
                    </tr>
                  )}

                  {error && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm font-medium text-rose-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!cargando && !error && filas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                        {giras.length === 0
                          ? "Todavía no hay giras. Una gira se crea cuando se aprueba una solicitud."
                          : "No se encontraron giras con los filtros seleccionados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <DetalleGiraModal
        gira={seleccionada}
        onClose={() => setSeleccionada(null)}
        permiteVerInscripciones={verInscripciones}
      />
    </>
  );
}
