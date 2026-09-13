import { useEffect } from "react";
import {
  HiOutlineChartBar,
  HiOutlineTableCells,
  HiOutlineXMark,
} from "react-icons/hi2";

/**
 * Con qué forma se descarga la página: con sus gráficas o con sus cifras.
 *
 * Se pregunta en vez de decidirlo el sistema porque los dos documentos sirven
 * para cosas distintas y las dos son legítimas: las gráficas se muestran en una
 * reunión, las cifras se adjuntan a un oficio. Adivinar cuál quiere el usuario
 * obligaría a la mitad de las veces a generar el otro y descartar el primero.
 *
 * Sigue el patrón de los modales de la plataforma: recibe `abierto` y devuelve
 * `null` cuando está cerrado; se cierra al tocar fuera, con Escape o con la ×.
 */
export default function DialogoFormatoPdf({
  abierto,
  onCerrar,
  onGraficas,
  onCifras,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onGraficas: () => void;
  onCifras: () => void;
}) {
  useEffect(() => {
    if (!abierto) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formato-pdf"
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="titulo-formato-pdf" className="text-lg font-bold text-slate-800">
            ¿Cómo querés el PDF?
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Va toda la página, con los filtros que tenés puestos y sin las tarjetas
          que hayas quitado. Las cifras son las mismas en las dos formas.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Opcion
            icono={<HiOutlineChartBar className="h-6 w-6" aria-hidden="true" />}
            titulo="Gráficas"
            descripcion="Como se ve en pantalla. Para presentar o revisar de un vistazo."
            onClick={onGraficas}
            autoFocus
          />
          <Opcion
            icono={<HiOutlineTableCells className="h-6 w-6" aria-hidden="true" />}
            titulo="Cifras"
            descripcion="Las tablas de datos. Es la forma que se adjunta a un oficio."
            onClick={onCifras}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-[background-color,color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Cada forma es un botón entero y no una fila con radio: se elige de una vez. */
function Opcion({
  icono,
  titulo,
  descripcion,
  onClick,
  autoFocus = false,
}: {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  onClick: () => void;
  autoFocus?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-left outline-none transition-[border-color,background-color,transform] duration-150 ease-suave hover:border-unah-navy/40 hover:bg-slate-50 focus-visible:border-unah-navy focus-visible:ring-2 focus-visible:ring-unah-navy/30 active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-unah-navy/5 text-unah-navy">
        {icono}
      </span>
      <span className="text-sm font-bold text-slate-800">{titulo}</span>
      <span className="text-xs leading-relaxed text-slate-500">{descripcion}</span>
    </button>
  );
}
