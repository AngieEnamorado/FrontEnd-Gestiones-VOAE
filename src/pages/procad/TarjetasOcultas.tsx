import { useState } from "react";
import { motion } from "motion/react";
import {
  HiOutlineArrowPath,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineXMark,
} from "react-icons/hi2";
import { useVisibilidadTarjetas } from "./visibilidadTarjetas";
import { traerALaVista, useArrastreTarjetas, type Colocacion } from "./arrastreTarjetas";

/**
 * Panel lateral de tarjetas quitadas.
 *
 * El botón está siempre: con el panel completo dice que no falta nada, y
 * cuando se ha quitado alguna lleva la cuenta. Quitar se hace solo con la × de
 * cada tarjeta.
 *
 * Devolver, de dos maneras: «Colocar» la manda a su sitio de siempre —el que le
 * da la especificación—, y arrastrarla la deja donde se suelte. Por eso conviven
 * las dos: el botón es el camino seguro, el arrastre el que elige el hueco.
 */
export default function TarjetasOcultas({
  etiquetasSeccion,
}: {
  etiquetasSeccion: Record<string, string>;
}) {
  const { ocultas, catalogo, mostrar, mostrarTodas, reordenar } =
    useVisibilidadTarjetas();
  const [abierto, setAbierto] = useState(false);
  // El arrastre —el hueco marcado, el rótulo y el desplazamiento de la página—
  // es el mismo que el de las tarjetas del tablero, así que sale del contexto.
  const { arrastrando, tomar } = useArrastreTarjetas();

  /** Al soltar: la tarjeta vuelve al tablero, en el hueco que se haya marcado. */
  function soltar(numero: string, sobre: Colocacion | null) {
    mostrar(numero);
    if (sobre) reordenar(numero, sobre.numero, sobre.donde);
    // Vuelve a un tablero que puede estar en otra pantalla: se la enseña.
    traerALaVista(numero);
  }

  const fichas = ocultas
    .map((numero) => catalogo.find((t) => t.numero === numero))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-expanded={abierto}
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-500 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-700"
      >
        <HiOutlineSquares2X2 className="h-3.5 w-3.5" />
        {ocultas.length === 0
          ? "Tarjetas"
          : ocultas.length === 1
            ? "1 tarjeta quitada"
            : `${ocultas.length} tarjetas quitadas`}
      </button>

      {abierto && (
        <>
          {/* El mismo velo que los modales de la plataforma: oscurece y desenfoca
              en vez de aplanar con un gris opaco. Asi el panel de tarjetas se
              lee como una capa por encima del tablero —que sigue ahi, borroso,
              detras— y no como otra pantalla que lo sustituye. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ opacity: 0, transform: "translateX(32px)" }}
            animate={{ opacity: 1, transform: "translateX(0px)" }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            aria-label="Tarjetas quitadas"
            data-panel-quitadas=""
            // `overflow-hidden` recorta el contenido contra las esquinas
          // redondeadas, pero tambien recortaria la tarjeta que se esta
          // arrastrando: mientras hay una en vuelo, el panel deja de recortar.
          className={`fixed inset-y-4 right-4 z-40 flex w-[calc(100%-2rem)] max-w-[400px] flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 ${
            arrastrando ? "" : "overflow-hidden"
          }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800">
                  Tarjetas quitadas
                </h2>
                <p className="mt-0.5 text-xs leading-snug text-slate-500">
                  Arrástrala al panel para elegir el hueco, o usa «Colocar».
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

            {fichas.length === 0 ? (
              // Sin nada quitado el panel no se queda mudo: dice que está completo,
              // que es justamente la respuesta a por qué esta lista está vacía.
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <HiOutlineCheckCircle
                    className="h-7 w-7 text-emerald-600"
                    aria-hidden="true"
                  />
                </span>
                <p className="text-sm font-bold text-slate-700">
                  Estás usando todas las tarjetas
                </p>
                <p className="text-xs leading-relaxed text-slate-500">
                  No has quitado ninguna. Si quitas alguna con su ×, aparecerá
                  aquí para que puedas devolverla cuando quieras.
                </p>
              </div>
            ) : (
              <ul
                className="flex-1 overflow-y-auto px-5"
              >
                {fichas.map((ficha) => (
                  // Mientras se la mueve, la ficha se queda aquí marcada con su
                  // contorno punteado —igual que las tarjetas del tablero— y lo
                  // que viaja con el puntero es su rótulo. No se arrastra la
                  // ficha misma: vive en un panel fijo, y al desplazarse la
                  // página se iba por debajo de la ventana y se perdía de vista.
                  <li
                    key={ficha.numero}
                    className={`py-4 ${
                      arrastrando === ficha.numero
                        ? "rounded-xl border-2 border-dashed border-slate-300"
                        : "border-b border-dashed border-slate-200 last:border-b-0"
                    }`}
                  >
                    <div
                      onPointerDown={(e) =>
                        tomar({ numero: ficha.numero, titulo: ficha.titulo }, e, (sobre) =>
                          soltar(ficha.numero, sobre),
                        )
                      }
                      className="cursor-mano flex touch-none select-none gap-3.5 rounded-xl px-2"
                    >
                      {/* Marcador de la tarjeta. Todavía es genérico: no es una vista
                      previa de su gráfica. */}
                      <span className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-xl bg-slate-50">
                        <HiOutlineChartBar
                          className="h-7 w-7 text-unah-navy/40"
                          aria-hidden="true"
                        />
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-bold leading-snug text-slate-800">
                          {ficha.titulo}
                        </span>
                        <span className="mt-1.5 w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                          #
                          {etiquetasSeccion[ficha.seccion] ??
                            "Cifras de encabezado"}
                        </span>

                        <button
                          type="button"
                          data-no-arrastra=""
                          onClick={() => mostrar(ficha.numero)}
                          className="mt-2.5 flex w-fit items-center gap-1 rounded-full bg-unah-navy px-3 py-1 text-[11px] font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
                        >
                          <HiOutlinePlus className="h-3 w-3" />
                          Colocar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {fichas.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    mostrarTodas();
                    setAbierto(false);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-semibold text-unah-navy transition-colors duration-150 hover:bg-slate-50"
                >
                  <HiOutlineArrowPath className="h-3.5 w-3.5" />
                  Devolver todas
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </>
  );
}
