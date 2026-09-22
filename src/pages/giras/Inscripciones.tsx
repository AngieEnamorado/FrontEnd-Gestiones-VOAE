import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineEye,
  HiOutlineArrowLeft,
  HiOutlineFolderOpen,
} from "react-icons/hi2";
import DetalleInscripcionModal from "../../components/DetalleInscripcionModal";
import EstadoGiraBadge from "../../components/giras/EstadoGiraBadge";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { listarGiras, listarInscripciones } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { useEstudianteActual, useIdentidadGira, useRolGira } from "../../context/UserContext";
import { etiquetaPeriodo, fechaCorta } from "../../utils/girasFormato";
import type { InscripcionGiraResumen } from "../../types/giras";

const PERIODOS = [
  { valor: 1, etiqueta: "I Periodo" },
  { valor: 2, etiqueta: "II Periodo" },
  { valor: 3, etiqueta: "III Periodo" },
];

/**
 * Las inscripciones que le corresponden a cada rol. Un estudiante ve solo su
 * historial; el jefe de misión, las de las giras que organiza; los demás roles
 * con acceso, todas las enviadas. Los borradores tienen su propia pantalla.
 */
async function cargarInscripciones(
  rol: string,
  numeroCuenta: string | undefined,
  idUsuario: number | undefined,
): Promise<InscripcionGiraResumen[]> {
  if (rol === "estudiante") {
    return numeroCuenta ? listarInscripciones({ numeroCuenta, excluirBorradores: true }) : [];
  }
  if (rol === "jefe-mision") {
    if (idUsuario === undefined) return [];
    const [giras, inscripciones] = await Promise.all([
      listarGiras({ usuario: idUsuario }),
      listarInscripciones({ excluirBorradores: true }),
    ]);
    const propias = new Set(giras.map((g) => g.idGira));
    return inscripciones.filter((i) => propias.has(i.idGira));
  }
  return listarInscripciones({ excluirBorradores: true });
}

export default function Inscripciones() {
  const navigate = useNavigate();
  const { rol } = useRolGira();
  const estudiante = useEstudianteActual();
  const identidad = useIdentidadGira();
  const [busqueda, setBusqueda] = useState("");
  const [anio, setAnio] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [seleccionada, setSeleccionada] = useState<InscripcionGiraResumen | null>(null);

  const numeroCuenta = estudiante?.numeroCuenta;
  const idUsuario = identidad?.idUsuarioUnidad;
  const necesitaIdentidad = rol === "estudiante" || rol === "jefe-mision";
  const sinIdentidad = necesitaIdentidad && (rol === "estudiante" ? !estudiante : !identidad);

  const { datos, cargando, error } = useConsulta(
    () => cargarInscripciones(rol, numeroCuenta, idUsuario),
    [rol, numeroCuenta, idUsuario],
  );
  const inscripciones = useMemo(() => datos ?? [], [datos]);

  const aniosDisponibles = useMemo(
    () =>
      [...new Set(inscripciones.map((i) => i.anioPeriodo).filter((a): a is number => a !== null))].sort(
        (a, b) => b - a,
      ),
    [inscripciones],
  );

  const filas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return inscripciones.filter(
      (i) =>
        (!texto ||
          `ins-${i.idInscripcion}`.includes(texto) ||
          (i.destinoGira ?? "").toLowerCase().includes(texto) ||
          i.nombreViajero.toLowerCase().includes(texto)) &&
        (!anio || i.anioPeriodo === Number(anio)) &&
        (!periodo || i.numeroPac === Number(periodo)),
    );
  }, [inscripciones, busqueda, anio, periodo]);

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
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Inscripciones</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/giras/inscripciones/borradores")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-slate-100"
            >
              <HiOutlineFolderOpen className="h-4 w-4" />
              Borradores
            </button>
            <button
              type="button"
              onClick={() => navigate("/giras/inscripciones/nueva")}
              className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-unah-navy-dark"
            >
              <HiOutlinePlus className="h-4 w-4" />
              Nueva inscripción
            </button>
          </div>
        </div>

        {sinIdentidad ? (
          <div className="mt-6">
            <SinIdentidad rol={rol === "estudiante" ? "Estudiante" : "Jefe de misión"} />
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
                  placeholder="Buscar por ID, destino o nombre..."
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
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">ID Inscripción</th>
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Gira / Destino</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filas.map((fila) => (
                    <tr key={fila.idInscripcion} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          INS-{fila.idInscripcion}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{fila.nombreViajero}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.destinoGira ?? "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{etiquetaPeriodo(fila.anioPeriodo, fila.numeroPac)}</td>
                      <td className="px-4 py-4 text-slate-500">{fechaCorta(fila.fechaEnvio ?? fila.fechaRegistro)}</td>
                      <td className="px-4 py-4">
                        <EstadoGiraBadge codigo={fila.codigoEstado} />
                      </td>
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

                  {cargando && inscripciones.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                        Cargando inscripciones…
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
                        {inscripciones.length === 0
                          ? "Todavía no hay inscripciones enviadas."
                          : "No se encontraron inscripciones con los filtros seleccionados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <DetalleInscripcionModal inscripcion={seleccionada} mostrarDestino onClose={() => setSeleccionada(null)} />
    </>
  );
}
