import { useNavigate } from "react-router-dom";
import { HiOutlineXMark } from "react-icons/hi2";
import type { SolicitudGiraResumen } from "../types/giras";
import { fechaCorta } from "../utils/girasFormato";
import EstadoGiraBadge from "./giras/EstadoGiraBadge";

interface DetalleSolicitudGiraModalProps {
  solicitud: SolicitudGiraResumen | null;
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

export default function DetalleSolicitudGiraModal({ solicitud, onClose }: DetalleSolicitudGiraModalProps) {
  const navigate = useNavigate();

  if (!solicitud) return null;

  function verDetalleCompleto() {
    if (!solicitud) return;
    onClose();
    navigate(`/giras/solicitudes/${solicitud.idSolicitud}`);
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
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Detalle de Solicitud</h2>
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
          <Fila etiqueta="ID">
            <span className="font-semibold text-blue-500">SOL-{solicitud.idSolicitud}</span>
          </Fila>
          <Fila etiqueta="Jefe de misión">
            <span className="font-bold text-slate-900">{solicitud.nombreJefeMision ?? "—"}</span>
          </Fila>
          <Fila etiqueta="Categorías">{solicitud.categorias ?? "—"}</Fila>
          <Fila etiqueta="Jefe de aprobación">{solicitud.nombreJefeAprobacion ?? "—"}</Fila>
          <Fila etiqueta="Destino">{solicitud.destinoGira ?? "—"}</Fila>
          <Fila etiqueta="Fecha de salida">{fechaCorta(solicitud.fechaSalidaPropuesta)}</Fila>
          <Fila etiqueta="Estado">
            <EstadoGiraBadge codigo={solicitud.codigoEstado} />
          </Fila>
        </div>

        {/* Descripción */}
        <div className="mt-4">
          <p className="text-sm text-slate-400">Objetivo académico</p>
          <p className="mt-1 text-left text-sm text-slate-700">{solicitud.objetivoAcademico ?? "No especificado"}</p>
        </div>

        {/* Acción */}
        <button
          type="button"
          onClick={verDetalleCompleto}
          className="mt-6 w-full rounded-xl bg-unah-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
}
