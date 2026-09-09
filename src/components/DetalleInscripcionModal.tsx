import { useNavigate } from "react-router-dom";
import { HiOutlineXMark } from "react-icons/hi2";
import type { Inscripcion } from "../types";
import EstadoBadge from "./EstadoBadge";

interface DetalleInscripcionModalProps {
  inscripcion: Inscripcion | null;
  giraId: string;
  onClose: () => void;
}

export default function DetalleInscripcionModal({
  inscripcion,
  giraId,
  onClose,
}: DetalleInscripcionModalProps) {
  const navigate = useNavigate();

  if (!inscripcion) return null;

  function verDetalles() {
    if (!inscripcion) return;
    onClose();
    navigate(`/giras/mis-giras/${giraId}/inscripciones/${inscripcion.id}`);
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
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Detalle de Inscripción</h2>
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
            <span className="text-sm text-slate-400">ID Inscripción</span>
            <span className="text-sm font-semibold text-blue-500">{inscripcion.id}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Estudiante</span>
            <span className="text-right text-sm font-bold text-slate-900">
              {inscripcion.nombreEstudiante}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Estado</span>
            <EstadoBadge estado={inscripcion.estado} />
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Fecha</span>
            <span className="text-right text-sm text-slate-600">{inscripcion.fecha}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-slate-400">Período</span>
            <span className="text-right text-sm text-slate-600">{inscripcion.periodo}</span>
          </div>
        </div>

        {/* Acción */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={verDetalles}
            className="rounded-xl bg-unah-navy px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}
