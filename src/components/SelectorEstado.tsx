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

export default function SelectorEstado({
  estado,
  onCambiar,
  opciones = OPCIONES_POR_DEFECTO,
}: SelectorEstadoProps) {
  const [abierto, setAbierto] = useState(false);

  function elegir(nuevoEstado: EstadoSolicitud) {
    onCambiar(nuevoEstado);
    setAbierto(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${estilosPorEstado[estado]}`}
      >
        {estado}
        <HiOutlineChevronDown className={`h-3.5 w-3.5 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar selector de estado"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg">
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
                  {opcion}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
