import { useEffect } from "react";
import { motion } from "motion/react";
import {
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";
import BotonAccion from "./BotonAccion";
import PildoraEstado from "./PildoraEstado";
import { enLargo } from "../../utils/fechas";
import type { VisoriaProcad } from "../../types";

/**
 * Una visoría, abierta desde el calendario.
 *
 * Existe porque en la cuadrícula una visoría es una línea de once píxeles: se
 * ve que está, no de qué se trata. Aquí caben el campus, cuántos están citados
 * y —lo que de verdad hace falta antes de programar— si ese día ya hay otra
 * prueba en el mismo sitio.
 *
 * Sigue el patrón de modales de la plataforma: recibe `visoria` en `null`
 * cuando está cerrado y se cierra al tocar fuera, con Escape o con la ×.
 */
export default function DetalleVisoria({
  visoria,
  choque,
  onCerrar,
  onProgramar,
}: {
  visoria: VisoriaProcad | null;
  /** La otra visoría del mismo día y campus, si la hay. */
  choque: VisoriaProcad | null;
  onCerrar: () => void;
  onProgramar: (visoria: VisoriaProcad) => void;
}) {
  useEffect(() => {
    if (!visoria) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [visoria, onCerrar]);

  if (!visoria) return null;

  const borrador = visoria.estado === "BORRADOR";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <motion.div
        initial={{ opacity: 0, transform: "translateY(12px) scale(0.985)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-visoria-titulo"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/30"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5 sm:px-7">
          <div className="min-w-0">
            <PildoraEstado tono={borrador ? "pendiente" : "activo"}>
              {borrador ? "Borrador" : "Programada"}
            </PildoraEstado>
            <h2
              id="detalle-visoria-titulo"
              className="mt-2 text-lg font-bold leading-tight text-slate-800"
            >
              {visoria.grupo}
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">{visoria.centro}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-5 sm:px-7">
          <dl className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Día">{enLargo(visoria.fecha)}</Campo>
            <Campo etiqueta="Hora">{visoria.hora}</Campo>
            <Campo etiqueta="Citados">{visoria.citados} aspirantes</Campo>
          </dl>

          {choque && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-900">
              <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Ese día hay otra visoría en el mismo campus: {choque.grupo}, a las {choque.hora}. Se
              reparten la cancha, los evaluadores y a quien se apuntó a las dos.
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            {borrador
              ? "En borrador la visoría solo existe para usted. Al programarla, los citados quedan notificados de la fecha."
              : "Los aspirantes citados ya fueron notificados de esta fecha."}
          </p>
        </div>

        {borrador && (
          <div className="flex justify-end border-t border-slate-100 px-6 py-4 sm:px-7">
            <BotonAccion tono="primario" onClick={() => onProgramar(visoria)}>
              <HiOutlineCalendarDays className="h-4 w-4" />
              Programar
            </BotonAccion>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-slate-700">{children}</dd>
    </div>
  );
}
