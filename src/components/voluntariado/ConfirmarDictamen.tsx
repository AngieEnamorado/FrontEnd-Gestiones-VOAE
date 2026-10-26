import { useEffect } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

export interface Dictamen {
  titulo: string;
  /** Qué pasa al confirmar, para que nadie dictamine sin saberlo. */
  descripcion: string;
  /** Texto del botón que confirma. */
  confirmar: string;
  tono: "aprobar" | "devolver" | "rechazar";
  /** El motivo o los comentarios que se van a enviar, tal como los leerán. */
  motivo?: string | null;
  /** Aviso para lo que conviene revisar antes de confirmar. */
  nota?: string;
  onConfirmar: () => void;
}

const ESTILO_CONFIRMAR: Record<Dictamen["tono"], string> = {
  aprobar: "bg-emerald-600 hover:bg-emerald-700",
  devolver: "bg-violet-600 hover:bg-violet-700",
  rechazar: "bg-red-600 hover:bg-red-700",
};

/**
 * Confirmación antes de dictaminar. Sigue el patrón de los modales de la
 * plataforma: recibe `dictamen` en `null` cuando está cerrado y se cierra al
 * tocar fuera, con Escape o con la X.
 */
export default function ConfirmarDictamen({
  dictamen,
  onCerrar,
}: {
  dictamen: Dictamen | null;
  onCerrar: () => void;
}) {
  useEffect(() => {
    if (!dictamen) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [dictamen, onCerrar]);

  if (!dictamen) return null;

  function confirmar() {
    if (!dictamen) return;
    dictamen.onConfirmar();
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmar-dictamen"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="titulo-confirmar-dictamen" className="text-lg font-bold text-slate-800">
            {dictamen.titulo}
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="shrink-0 text-slate-400 hover:text-slate-600">
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">{dictamen.descripcion}</p>

        {dictamen.motivo && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Motivo que se enviará</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{dictamen.motivo}</p>
          </div>
        )}

        {dictamen.nota && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800">
            {dictamen.nota}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            autoFocus
            onClick={confirmar}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${ESTILO_CONFIRMAR[dictamen.tono]}`}
          >
            {dictamen.confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
