import { HiOutlineArrowDownTray, HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import PersonalizarTabla from "./PersonalizarTabla";
import type { VistaTabla } from "./vistaTabla";

/**
 * La barra que va encima de toda tabla de trabajo de PROCAD: los filtros del
 * módulo a la izquierda, cuántas filas quedan, qué columnas se ven y la
 * descarga.
 *
 * Está en un componente y no copiada en cada módulo porque el orden de esos
 * controles es lo que hace que las siete tablas del panel se manejen igual: en
 * cualquiera de ellas, «cuántas hay» está donde termina el filtrado y la
 * descarga es lo último, después de haber decidido qué se está mirando.
 */

/** Las píldoras de filtro: mismos bordes y tipografía que las del tablero. */
export const CLASE_FILTRO =
  "cursor-pointer truncate rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-800";

/** El buscador por texto, con su lupa dentro. */
export function BuscadorTabla({
  valor,
  onCambiar,
  marcador,
  etiqueta,
  ancho = "w-[210px]",
}: {
  valor: string;
  onCambiar: (v: string) => void;
  marcador: string;
  etiqueta: string;
  ancho?: string;
}) {
  return (
    <div className="relative">
      <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={marcador}
        autoComplete="off"
        aria-label={etiqueta}
        className={`${ancho} rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-[13px] font-semibold text-slate-600 shadow-sm outline-none transition-colors duration-150 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-unah-orange`}
      />
    </div>
  );
}

/** Aparece solo cuando hay algo que limpiar; si no, no ocupa sitio. */
export function BotonLimpiar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Limpiar filtros"
      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-500 shadow-sm transition-[color,background-color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
    >
      <HiOutlineXMark className="h-4 w-4" />
      Limpiar
    </button>
  );
}

interface BarraTablaProps {
  /** Los filtros propios del módulo: selects, buscador, botón de limpiar. */
  children?: React.ReactNode;
  /** Cuántas filas se están viendo, ya redactado por el módulo. */
  conteo: string;
  vista: VistaTabla;
  onDescargar: () => void;
  /** En falso, la descarga se apaga: no hay nada que llevarse. */
  hayFilas: boolean;
  /**
   * Lo único de la pantalla que crea algo, si lo hay. Va al final de la fila,
   * después de la descarga: así queda separado de los controles que solo miran.
   */
  accion?: React.ReactNode;
}

export default function BarraTabla({
  children,
  conteo,
  vista,
  onDescargar,
  hayFilas,
  accion,
}: BarraTablaProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}

      <p className="ml-auto text-xs font-semibold text-slate-400">{conteo}</p>

      <PersonalizarTabla vista={vista} />

      <button
        type="button"
        onClick={onDescargar}
        disabled={!hayFilas}
        title="Descargar lo que estás viendo: estas filas y estas columnas. Es un CSV, se abre con doble clic en Excel."
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
        Excel
      </button>

      {accion}
    </div>
  );
}
