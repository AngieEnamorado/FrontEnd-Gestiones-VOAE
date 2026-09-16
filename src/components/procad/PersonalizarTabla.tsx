import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowsUpDown,
  HiOutlineMagnifyingGlass,
  HiOutlineViewColumns,
  HiOutlineXMark,
} from "react-icons/hi2";
import type { VistaTabla } from "./vistaTabla";

/**
 * Panel para elegir qué columnas de la tabla se ven y en qué orden.
 *
 * Sigue el mismo trato que el panel de tarjetas quitadas del tablero de
 * estadísticas: hoja lateral sobre un velo, la fila que se mueve se queda en su
 * sitio marcada con su contorno punteado, y con el puntero viaja su rótulo. El
 * gesto es el mismo en las dos pantallas a propósito: quien aprendió a
 * reordenar tarjetas ya sabe reordenar columnas.
 */
export default function PersonalizarTabla({ vista }: { vista: VistaTabla }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return vista.todas;
    return vista.todas.filter((c) => c.label.toLowerCase().includes(texto));
  }, [vista.todas, busqueda]);

  // Buscando no se reordena: la lista está recortada, así que «déjala encima de
  // esta» no dice dónde va respecto a las que no se están viendo.
  const sePuedeMover = busqueda.trim() === "" && vista.todas.length > 1;

  useEffect(() => {
    if (!abierto) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") setAbierto(false);
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-expanded={abierto}
        title="Elegir qué columnas se ven y en qué orden"
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-700"
      >
        <HiOutlineViewColumns className="h-3.5 w-3.5" />
        {vista.ocultasPorLaPersona === 0
          ? "Filtrar columnas por…"
          : vista.ocultasPorLaPersona === 1
            ? "1 columna oculta"
            : `${vista.ocultasPorLaPersona} columnas ocultas`}
      </button>

      {abierto && (
        <>
          {/* Sin velo ni desenfoque, a diferencia de los demás paneles: aquí lo
              que se está tocando es la tabla que hay detrás, y hay que verla
              cambiar mientras se apagan columnas. Solo queda la capa invisible
              que cierra al tocar fuera. */}
          <div
            aria-hidden="true"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-30"
          />

          <motion.aside
            initial={{ opacity: 0, transform: "translateX(32px)" }}
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            aria-label="Personalizar vista de la tabla"
            className="fixed inset-y-4 right-4 z-40 flex w-[calc(100%-2rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800">Personalizar vista</h2>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">
                  Elige qué columnas ves y en qué orden; se guarda en este navegador.
                  Para congelar una columna, usa su chincheta en el encabezado de la tabla.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-5 py-3">
              <div className="relative">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar columna…"
                  autoComplete="off"
                  aria-label="Buscar columna"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-unah-orange"
                />
              </div>
            </div>

            {/* La cuenta de lo que se está viendo, y el atajo para dejar la tabla
                en blanco de una vez —igual que en la referencia—. */}
            <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {vista.todas.length - vista.ocultas} de {vista.todas.length} visibles
              </p>
              <button
                type="button"
                onClick={vista.ocultarTodas}
                disabled={vista.ocultas === vista.todas.length}
                className="text-[11px] font-semibold text-slate-500 transition-colors duration-150 hover:text-unah-navy disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Ocultar todas
              </button>
            </div>

            <ListaColumnas vista={vista} filtradas={filtradas} sePuedeMover={sePuedeMover} />

            {/* Una sola salida de emergencia: «mostrar todas» y «restablecer»
                acababan haciendo lo mismo casi siempre, y esta hace las dos
                cosas —enciende lo apagado y devuelve el orden—. */}
            <div className="border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={vista.restablecer}
                title="Volver a las columnas y al orden con los que viene la tabla"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold text-unah-navy transition-colors duration-150 hover:bg-slate-50"
              >
                <HiOutlineArrowPath className="h-3.5 w-3.5" />
                Restablecer la vista
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </>
  );
}

/** Lo que hay que recorrer para que pulsar el asa pase a ser arrastrar. */
const UMBRAL = 5;

function ListaColumnas({
  vista,
  filtradas,
  sePuedeMover,
}: {
  vista: VistaTabla;
  filtradas: VistaTabla["todas"];
  sePuedeMover: boolean;
}) {
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [destino, setDestino] = useState<{ label: string; caja: DOMRect } | null>(null);
  const [enTraslado, setEnTraslado] = useState<{ label: string; y: number } | null>(null);
  const lista = useRef<HTMLUListElement>(null);

  function filaBajo(y: number, x: number, excepto: string): HTMLElement | null {
    return (
      document
        .elementsFromPoint(x, y)
        .map((el) => (el as HTMLElement).closest?.("[data-columna]") as HTMLElement | null)
        .find((el) => el && el.dataset.columna !== excepto) ?? null
    );
  }

  function tomar(label: string, evento: React.PointerEvent) {
    const salida = { x: evento.clientX, y: evento.clientY };
    let empezado = false;

    function alMover(e: PointerEvent) {
      if (!empezado) {
        if (Math.hypot(e.clientX - salida.x, e.clientY - salida.y) < UMBRAL) return;
        empezado = true;
        e.preventDefault();
        setArrastrando(label);
      }
      setEnTraslado({ label, y: e.clientY });
      const fila = filaBajo(e.clientY, e.clientX, label);
      setDestino(
        fila?.dataset.columna
          ? { label: fila.dataset.columna, caja: fila.getBoundingClientRect() }
          : null,
      );
    }

    function alLevantar(e: PointerEvent) {
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerup", alLevantar);
      window.removeEventListener("pointercancel", alLevantar);
      if (!empezado) return;

      const fila = filaBajo(e.clientY, e.clientX, label);
      setArrastrando(null);
      setDestino(null);
      setEnTraslado(null);
      if (fila?.dataset.columna) vista.reordenar(label, fila.dataset.columna);
    }

    window.addEventListener("pointermove", alMover);
    window.addEventListener("pointerup", alLevantar);
    window.addEventListener("pointercancel", alLevantar);
  }

  if (filtradas.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-sm font-bold text-slate-700">Ninguna columna se llama así</p>
        <p className="text-xs leading-relaxed text-slate-500">
          Prueba con otra palabra: la búsqueda mira el nombre de la columna, no lo que contiene.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul ref={lista} className="flex-1 overflow-y-auto px-3 py-2">
        {filtradas.map((columna) => (
          <li
            key={columna.label}
            data-columna={columna.label}
            className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${
              arrastrando === columna.label
                ? "border-2 border-dashed border-slate-300"
                : "border-2 border-transparent"
            }`}
          >
            {sePuedeMover ? (
              <button
                type="button"
                onPointerDown={(e) => tomar(columna.label, e)}
                title="Arrastrar para reordenar"
                aria-label={`Mover la columna ${columna.label}`}
                className="cursor-mano flex h-7 w-7 shrink-0 touch-none items-center justify-center rounded-lg text-slate-300 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
              >
                <HiOutlineArrowsUpDown className="h-4 w-4" />
              </button>
            ) : (
              <span className="h-7 w-7 shrink-0" aria-hidden="true" />
            )}

            {/* Congelar no se ofrece aquí: es algo que se decide mirando la
                tabla —hasta dónde deja de verse lo que importa al deslizar—,
                así que vive en la chincheta del encabezado y en ningún otro
                sitio. Este panel responde a una sola pregunta: qué columnas
                ves y en qué orden. */}
            <span
              className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                columna.oculta ? "text-slate-400" : "text-slate-700"
              }`}
            >
              {columna.label}
            </span>

            <Interruptor
              encendido={!columna.oculta}
              etiqueta={columna.label}
              onCambiar={() => vista.alternar(columna.label)}
            />
          </li>
        ))}
      </ul>

      {/* El sitio donde va a quedar la columna, con el mismo punteado del
          tablero de estadísticas. */}
      {arrastrando && destino && (
        <div
          aria-hidden="true"
          style={{
            top: destino.caja.top,
            left: destino.caja.left,
            width: destino.caja.width,
            height: destino.caja.height,
          }}
          className="pointer-events-none fixed z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-unah-navy/60 bg-unah-navy/5"
        >
          <span className="rounded-full bg-unah-navy px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
            ¡Suéltala aquí!
          </span>
        </div>
      )}

      {/* El rótulo que viaja con el puntero, para que se vea el traslado. */}
      {enTraslado && (
        <div
          aria-hidden="true"
          style={{ top: enTraslado.y, right: 40 }}
          className="pointer-events-none fixed z-[60] -translate-y-1/2 -rotate-2 rounded-xl border-2 border-dashed border-unah-navy bg-white/90 px-3.5 py-2 shadow-2xl shadow-slate-900/25 backdrop-blur-sm"
        >
          <span className="text-sm font-bold text-slate-800">{enTraslado.label}</span>
        </div>
      )}
    </>
  );
}

/** El interruptor de una columna: encendida se ve, apagada no. */
function Interruptor({
  encendido,
  etiqueta,
  onCambiar,
}: {
  encendido: boolean;
  etiqueta: string;
  onCambiar: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      aria-label={`Mostrar la columna ${etiqueta}`}
      onClick={onCambiar}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-suave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-unah-navy/40 ${
        encendido ? "bg-unah-navy" : "bg-slate-200"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 ease-suave ${
          encendido ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}
