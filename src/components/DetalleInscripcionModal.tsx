import { useNavigate } from "react-router-dom";
import { HiOutlineXMark } from "react-icons/hi2";
import type { InscripcionGiraResumen } from "../types/giras";
import { etiquetaPeriodo, fechaCorta } from "../utils/girasFormato";
import EstadoGiraBadge from "./giras/EstadoGiraBadge";

interface DetalleInscripcionModalProps {
  inscripcion: InscripcionGiraResumen | null;
  /** Muestra el destino de la gira: útil en listados que combinan giras distintas. */
  mostrarDestino?: boolean;
  onClose: () => void;
}

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-400">{etiqueta}</span>
      <span className="text-right text-sm text-slate-600">{children}</span>
    </div>
  );
}

export default function DetalleInscripcionModal({
  inscripcion,
  mostrarDestino = false,
  onClose,
}: DetalleInscripcionModalProps) {
  const navigate = useNavigate();

  if (!inscripcion) return null;

  function verDetalles() {
    if (!inscripcion) return;
    onClose();
    navigate(`/giras/mis-giras/${inscripcion.idGira}/inscripciones/${inscripcion.idInscripcion}`);
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
          <Fila etiqueta="ID Inscripción">
            <span className="font-semibold text-blue-500">INS-{inscripcion.idInscripcion}</span>
          </Fila>
          <Fila etiqueta="Estudiante">
            <span className="font-bold text-slate-900">{inscripcion.nombreViajero}</span>
          </Fila>
          {mostrarDestino && <Fila etiqueta="Gira / Destino">{inscripcion.destinoGira ?? "—"}</Fila>}
          <Fila etiqueta="Estado">
            <EstadoGiraBadge codigo={inscripcion.codigoEstado} />
          </Fila>
          <Fila etiqueta="Fecha">{fechaCorta(inscripcion.fechaEnvio ?? inscripcion.fechaRegistro)}</Fila>
          <Fila etiqueta="Período">{etiquetaPeriodo(inscripcion.anioPeriodo, inscripcion.numeroPac)}</Fila>
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
