import { useNavigate } from "react-router-dom";
import { HiOutlineXMark } from "react-icons/hi2";
import type { SolicitudGira } from "../types";
import EstadoBadge from "./EstadoBadge";

interface DetalleGiraModalProps {
  gira: SolicitudGira | null;
  onClose: () => void;
}

export default function DetalleGiraModal({ gira, onClose }: DetalleGiraModalProps) {
  const navigate = useNavigate();

  if (!gira) return null;

  function verDetalles() {
    if (!gira) return;
    onClose();
    navigate(`/giras/mis-giras/${gira.id}/resumen`);
  }

  function verInscripciones() {
    if (!gira) return;
    onClose();
    navigate(`/giras/mis-giras/${gira.id}/inscripciones`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Detalles de la Gira</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo: pares clave-valor */}
        <div className="mt-6 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">ID</span>
            <span className="text-sm font-semibold text-blue-500">{gira.id}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Estudiante</span>
            <span className="text-right text-sm font-bold text-slate-900">{gira.estudiante}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Curso / Categoría</span>
            <span className="text-right text-sm text-slate-600">{gira.categoria}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Docente</span>
            <span className="text-right text-sm text-slate-600">{gira.docente}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Destino</span>
            <span className="text-right text-sm text-slate-600">{gira.destino}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Fecha</span>
            <span className="text-right text-sm text-slate-600">{gira.fecha}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Estado</span>
            <EstadoBadge estado={gira.estado} />
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-4">
          <p className="text-sm text-slate-400">Descripción</p>
          <p className="mt-1 text-left text-sm text-slate-700">{gira.descripcion}</p>
        </div>

        {/* Acciones */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={verDetalles}
            className="rounded-xl border border-unah-navy py-3 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-50"
          >
            Ver detalles
          </button>
          <button
            type="button"
            onClick={verInscripciones}
            className="rounded-xl bg-unah-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
          >
            Ver inscripciones
          </button>
        </div>
      </div>
    </div>
  );
}
