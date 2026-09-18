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
import EstadoBadge from "../../components/EstadoBadge";
import DetalleInscripcionModal from "../../components/DetalleInscripcionModal";
import { useEstudianteActual, useRolGira } from "../../context/UserContext";
import { esInscripcionDe } from "../../data/inscripcionesSelectors";
import { misGiras } from "../../data/mockMisGiras";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import { inscripcionesPorGira } from "../../data/mockInscripciones";
import type { Inscripcion } from "../../types";

const todasLasGiras = [...misGiras, ...solicitudesGiras];

interface InscripcionConGira extends Inscripcion {
  giraId: string;
  destino: string;
  categoria: string;
  centro: string;
}

// Vista global: une el roster por gira (mockInscripciones.ts) con los datos
// de cada gira para poder listar todas las inscripciones del docente sin que
// tenga que entrar gira por gira, igual que Solicitudes agrega las giras que
// solicitó en una sola tabla.
const todasLasInscripciones: InscripcionConGira[] = Object.entries(inscripcionesPorGira).flatMap(
  ([giraId, inscripciones]) => {
    const gira = todasLasGiras.find((g) => g.id === giraId);
    return inscripciones.map((inscripcion) => ({
      ...inscripcion,
      giraId,
      destino: gira?.destino ?? "—",
      categoria: gira?.categoria ?? "—",
      centro: gira?.centro ?? "—",
    }));
  },
);

export default function Inscripciones() {
  const navigate = useNavigate();
  const { rol } = useRolGira();
  const { numeroCuenta } = useEstudianteActual();
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<InscripcionConGira | null>(null);

  // Un estudiante solo ve su propio historial, nunca el de los demás.
  const filas = useMemo(() => {
    const propias =
      rol === "estudiante"
        ? todasLasInscripciones.filter((i) => esInscripcionDe(i, numeroCuenta))
        : todasLasInscripciones;
    return propias.filter(
      (i) =>
        i.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.destino.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [busqueda, rol, numeroCuenta]);

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
                <th className="px-4 py-3">Gira / Destino</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Centro</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((fila) => (
                <tr key={fila.id} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
                      {fila.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-700">{fila.destino}</td>
                  <td className="px-4 py-4 text-slate-600">{fila.categoria}</td>
                  <td className="px-4 py-4 text-slate-600">{fila.centro}</td>
                  <td className="px-4 py-4 text-slate-500">{fila.fecha}</td>
                  <td className="px-4 py-4">
                    <EstadoBadge estado={fila.estado} />
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

              {filas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No se encontraron inscripciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetalleInscripcionModal
        inscripcion={seleccionada}
        giraId={seleccionada?.giraId ?? ""}
        destino={seleccionada?.destino}
        onClose={() => setSeleccionada(null)}
      />
    </>
  );
}
