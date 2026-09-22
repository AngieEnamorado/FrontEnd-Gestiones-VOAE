import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineEye,
  HiOutlineArrowLeft,
  HiOutlineFolderOpen,
  HiOutlineListBullet,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineMagnifyingGlassCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";
import EstadisticaCard from "../../components/EstadisticaCard";
import DetalleSolicitudGiraModal from "../../components/DetalleSolicitudGiraModal";
import EstadoGiraBadge from "../../components/giras/EstadoGiraBadge";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { listarSolicitudes } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { useIdentidadGira, useRolGira } from "../../context/UserContext";
import { etiquetaPeriodo, fechaCorta } from "../../utils/girasFormato";
import type { SolicitudGiraResumen } from "../../types/giras";

const PERIODOS = [
  { valor: 1, etiqueta: "I Periodo" },
  { valor: 2, etiqueta: "II Periodo" },
  { valor: 3, etiqueta: "III Periodo" },
];

export default function Solicitudes() {
  const navigate = useNavigate();
  const { rol } = useRolGira();
  const identidad = useIdentidadGira();
  const [busqueda, setBusqueda] = useState("");
  const [anio, setAnio] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [seleccionada, setSeleccionada] = useState<SolicitudGiraResumen | null>(null);

  // Cada rol ve lo suyo: el jefe de misión, lo que envió; el de aprobación, lo
  // que le toca dictaminar. Los borradores tienen su propia pantalla.
  const idUsuario = identidad?.idUsuarioUnidad;
  const { datos, cargando, error } = useConsulta(
    () =>
      idUsuario === undefined
        ? Promise.resolve([])
        : listarSolicitudes({
            excluirBorradores: true,
            ...(rol === "jefe-aprobacion" ? { jefeAprobacion: idUsuario } : { jefeMision: idUsuario }),
          }),
    [rol, idUsuario],
  );
  const solicitudes = useMemo(() => datos ?? [], [datos]);

  const aniosDisponibles = useMemo(
    () =>
      [...new Set(solicitudes.map((s) => s.anioPeriodo).filter((a): a is number => a !== null))].sort((a, b) => b - a),
    [solicitudes],
  );

  const estadisticas = useMemo(
    () => ({
      total: solicitudes.length,
      aprobadas: solicitudes.filter((s) => s.codigoEstado === "Aprobada").length,
      pendientes: solicitudes.filter((s) => s.codigoEstado === "Pendiente").length,
      enCorreccion: solicitudes.filter((s) => s.codigoEstado === "Correccion").length,
      denegadas: solicitudes.filter((s) => s.codigoEstado === "Denegada").length,
    }),
    [solicitudes],
  );

  const filas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return solicitudes.filter(
      (s) =>
        (!texto ||
          `sol-${s.idSolicitud}`.toLowerCase().includes(texto) ||
          (s.destinoGira ?? "").toLowerCase().includes(texto)) &&
        (!anio || s.anioPeriodo === Number(anio)) &&
        (!periodo || s.numeroPac === Number(periodo)),
    );
  }, [solicitudes, busqueda, anio, periodo]);

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
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Solicitudes</h1>
          </div>

          {rol === "jefe-mision" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/giras/solicitudes/borradores")}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-slate-100"
              >
                <HiOutlineFolderOpen className="h-4 w-4" />
                Borradores
              </button>
              <button
                type="button"
                onClick={() => navigate("/giras/solicitudes/nueva")}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors duration-150 hover:bg-slate-100"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Nueva solicitud
              </button>
            </div>
          )}
        </div>

        {!identidad ? (
          <div className="mt-6">
            <SinIdentidad rol={rol === "jefe-aprobacion" ? "Jefe de aprobación" : "Jefe de misión"} />
          </div>
        ) : (
          <>
            {/* Tarjetas de resumen: el jefe de misión no las ve, el título baja
                directo a la búsqueda. */}
            {rol !== "jefe-mision" && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <EstadisticaCard
                  icon={HiOutlineListBullet}
                  label="Total"
                  valor={estadisticas.total}
                  colorFondo="bg-blue-50"
                  colorIcono="text-blue-500"
                  colorTexto="text-blue-700"
                />
                <EstadisticaCard
                  icon={HiOutlineCheckCircle}
                  label="Aprobadas"
                  valor={estadisticas.aprobadas}
                  colorFondo="bg-emerald-50"
                  colorIcono="text-emerald-500"
                  colorTexto="text-emerald-700"
                />
                <EstadisticaCard
                  icon={HiOutlineClock}
                  label="Pendientes"
                  valor={estadisticas.pendientes}
                  colorFondo="bg-amber-50"
                  colorIcono="text-amber-500"
                  colorTexto="text-amber-700"
                />
                <EstadisticaCard
                  icon={HiOutlineMagnifyingGlassCircle}
                  label="En corrección"
                  valor={estadisticas.enCorreccion}
                  colorFondo="bg-purple-50"
                  colorIcono="text-purple-500"
                  colorTexto="text-purple-700"
                />
                <EstadisticaCard
                  icon={HiOutlineXCircle}
                  label="Denegadas"
                  valor={estadisticas.denegadas}
                  colorFondo="bg-rose-50"
                  colorIcono="text-rose-500"
                  colorTexto="text-rose-700"
                />
              </div>
            )}

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
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Destino</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Centro</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-center">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filas.map((fila) => (
                    <tr key={fila.idSolicitud} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                          SOL-{fila.idSolicitud}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">{fila.destinoGira ?? "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.categorias ?? "—"}</td>
                      <td className="px-4 py-4 text-slate-600">{fila.nombreCampus}</td>
                      <td className="px-4 py-4 text-slate-600">{etiquetaPeriodo(fila.anioPeriodo, fila.numeroPac)}</td>
                      <td className="px-4 py-4 text-slate-500">{fechaCorta(fila.fechaSalidaPropuesta)}</td>
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

                  {cargando && solicitudes.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                        Cargando solicitudes…
                      </td>
                    </tr>
                  )}

                  {error && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm font-medium text-rose-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!cargando && !error && filas.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                        {solicitudes.length === 0
                          ? "Todavía no hay solicitudes enviadas."
                          : "No se encontraron solicitudes con los filtros seleccionados."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <DetalleSolicitudGiraModal solicitud={seleccionada} onClose={() => setSeleccionada(null)} />
    </>
  );
}
