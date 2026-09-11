import { useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { estilosPorEstado } from "./EstadoBadge";
import type { EstadoSolicitud } from "../types";

interface SelectorEstadoProps {
  estado: EstadoSolicitud;
  onCambiar: (nuevoEstado: EstadoSolicitud) => void;
  opciones?: EstadoSolicitud[];
}

const OPCIONES_POR_DEFECTO: EstadoSolicitud[] = ["APROBADA", "PENDIENTE", "EN REVISIÓN", "RECHAZADA"];

const ETIQUETAS_ESTADO: Record<EstadoSolicitud, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Rechazada",
  "EN REVISIÓN": "En revisión",
  "ESPERA INF. SOCIAL": "Espera inf. social",
  DEVUELTA: "Devuelta",
};

// Modal de confirmación compartido por todos los usos de SelectorEstado: cambiar
// el estado nunca es inmediato, siempre pasa por este paso de confirmación.
function ModalConfirmarCambioEstado({
  nuevoEstado,
  onConfirmar,
  onCancelar,
}: {
  nuevoEstado: EstadoSolicitud;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-[#1E293B]">
          ¿Estás seguro de que deseas cambiar el estado?
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Estás a punto de cambiar el estado a{" "}
          <span className="font-semibold text-slate-700">{ETIQUETAS_ESTADO[nuevoEstado]}</span>. Una
          vez guardado el cambio, afectará el registro actual.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-xl bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
          >
            Sí, cambiar estado
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SelectorEstado({
  estado,
  onCambiar,
  opciones = OPCIONES_POR_DEFECTO,
}: SelectorEstadoProps) {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, setPendiente] = useState<EstadoSolicitud | null>(null);

  function elegir(nuevoEstado: EstadoSolicitud) {
    setAbierto(false);
    if (nuevoEstado === estado) return;
    setPendiente(nuevoEstado);
  }

  function confirmarCambio() {
    if (pendiente) onCambiar(pendiente);
    setPendiente(null);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold transition-colors ${estilosPorEstado[estado]}`}
      >
        {ETIQUETAS_ESTADO[estado]}
        <HiOutlineChevronDown className={`h-4 w-4 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar selector de estado"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg">
            {opciones.map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => elegir(opcion)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors hover:bg-slate-50 ${
                  opcion === estado ? "ring-1 ring-slate-200" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 ${estilosPorEstado[opcion]}`}
                >
                  {ETIQUETAS_ESTADO[opcion]}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {pendiente && (
        <ModalConfirmarCambioEstado
          nuevoEstado={pendiente}
          onConfirmar={confirmarCambio}
          onCancelar={() => setPendiente(null)}
        />
      )}
    </div>
  );
}
