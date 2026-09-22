import { useNavigate } from "react-router-dom";
import { HiOutlineXMark } from "react-icons/hi2";
import type { GiraApi } from "../types/giras";
import { etiquetaPeriodo, fechaCorta } from "../utils/girasFormato";
import EstadoGiraBadge from "./giras/EstadoGiraBadge";

interface DetalleGiraModalProps {
  gira: GiraApi | null;
  onClose: () => void;
  /** Ofrece también "Ver inscripciones". Un estudiante no ve el roster de la gira. */
  permiteVerInscripciones?: boolean;
}

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-slate-400">{etiqueta}</span>
      <span className="text-right text-sm text-slate-600">{children}</span>
    </div>
  );
}

export default function DetalleGiraModal({ gira, onClose, permiteVerInscripciones = true }: DetalleGiraModalProps) {
  const navigate = useNavigate();

  if (!gira) return null;

  function verDetalles() {
    if (!gira) return;
    onClose();
    navigate(`/giras/mis-giras/${gira.idGira}/resumen`);
  }

  function verInscripciones() {
    if (!gira) return;
    onClose();
    navigate(`/giras/mis-giras/${gira.idGira}/inscripciones`);
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
          <Fila etiqueta="ID">
            <span className="font-semibold text-blue-500">GIR-{gira.idGira}</span>
          </Fila>
          <Fila etiqueta="Destino">
            <span className="font-bold text-slate-900">{gira.destinoGira ?? "—"}</span>
          </Fila>
          <Fila etiqueta="Jefe de misión">{gira.nombreJefeMision ?? "—"}</Fila>
          <Fila etiqueta="Campus">{gira.nombreCampus}</Fila>
          <Fila etiqueta="Período">{etiquetaPeriodo(gira.anioPeriodo, gira.numeroPac)}</Fila>
          <Fila etiqueta="Fecha de salida">{fechaCorta(gira.fechaSalidaConfirmada)}</Fila>
          <Fila etiqueta="Inscritos">
            {gira.totalInscritos} de {gira.totalInscripciones}
          </Fila>
          <Fila etiqueta="Estado">
            <EstadoGiraBadge codigo={gira.codigoEstado} />
          </Fila>
        </div>

        {/* Descripción */}
        <div className="mt-4">
          <p className="text-sm text-slate-400">Objetivo académico</p>
          <p className="mt-1 text-left text-sm text-slate-700">{gira.objetivoAcademico ?? "No especificado"}</p>
        </div>

        {/* Acciones */}
        {permiteVerInscripciones ? (
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
        ) : (
          <button
            type="button"
            onClick={verDetalles}
            className="mt-6 w-full rounded-xl bg-unah-navy py-3 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
          >
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
}
