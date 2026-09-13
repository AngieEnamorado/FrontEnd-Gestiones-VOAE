import { useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlineArrowsPointingOut, HiOutlineXMark } from "react-icons/hi2";
import { useVisibilidadTarjetas } from "../../pages/procad/visibilidadTarjetas";
import { useSeleccionReporte } from "../../pages/procad/seleccionReporte";
import { useArrastreTarjetas } from "../../pages/procad/arrastreTarjetas";
import CasillaSeleccion from "./CasillaSeleccion";

interface TarjetaEstadisticaProps {
  /**
   * Número de la métrica en la especificación del programa. Ya no se imprime
   * —en su lugar va el punto naranja—, pero sigue haciendo falta: es con ese
   * número con el que Vicerrectoría y VOAE se refieren a cada cifra en los
   * documentos de requerimientos, así que se queda al alcance del cursor y en
   * los títulos del reporte PDF.
   */
  numero: string;
  titulo: string;
  nota?: string;
  /** Ocupa el ancho completo de la rejilla en vez de media columna. */
  ancha?: boolean;
  etiqueta?: React.ReactNode;
  children: React.ReactNode;
}

export default function TarjetaEstadistica({
  numero,
  titulo,
  nota,
  ancha = false,
  etiqueta,
  children,
}: TarjetaEstadisticaProps) {
  const { seccionActiva, soloLectura, registrar, ocultar, estaOculta, posicionDe } =
    useVisibilidadTarjetas();
  const seleccion = useSeleccionReporte();
  const marcada = seleccion.activo && seleccion.estaSeleccionada(numero);
  const arrastre = useArrastreTarjetas();
  const enVuelo = arrastre.arrastrando === numero;
  /** Solo se reordena en el panel, y no mientras se está marcando un reporte. */
  const seMueve = !soloLectura && !seleccion.activo;

  // Se apunta en el catálogo la primera vez que se dibuja, para que la lista de
  // ocultas sepa cómo se llama y de qué apartado salió.
  useEffect(() => {
    registrar({ numero, titulo, seccion: seccionActiva });
  }, [registrar, numero, titulo, seccionActiva]);

  if (estaOculta(numero)) return null;


  return (
    // `layout` no es adorno: cuando se quita o se devuelve una tarjeta, las
    // demas se deslizan a su nuevo sitio en vez de saltar.
    <motion.section
      layout
      data-tarjeta={numero}
      transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
      style={{ order: posicionDe(numero) }}
      // Mientras se arma un reporte, la tarjeta entera es la casilla: se marca
      // pulsando en cualquier parte de ella, no solo en el cuadrito.
      {...(seleccion.activo
        ? {
            role: "checkbox",
            "aria-checked": marcada,
            "aria-label": titulo,
            tabIndex: 0,
            onClick: () => seleccion.alternar(numero),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key !== " " && e.key !== "Enter") return;
              e.preventDefault();
              seleccion.alternar(numero);
            },
          }
        : {})}
      className={`group/tarjeta relative flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm transition-[box-shadow,background-color] duration-200 ease-suave sm:p-6 ${
        ancha ? "lg:col-span-2" : ""
      } ${
        seleccion.activo
          ? `cursor-pointer outline-none ${
              marcada
                ? "ring-2 ring-unah-orange"
                : "ring-1 ring-slate-200 hover:ring-unah-navy/40 focus-visible:ring-2 focus-visible:ring-unah-navy"
            }`
          : ""
      }`}
    >
      {/* Mientras se la mueve, la tarjeta no se va ni se apaga: se queda entera
          y se marca con el mismo contorno punteado del hueco de destino, para
          que se lea «esta es la que estoy moviendo» y no «esta se borró».
          En gris y sin relleno: el mismo lenguaje que el destino, pero apagado,
          porque el sitio al que va es el que tiene que llamar la atención. */}
      {enVuelo && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl border-2 border-dashed border-slate-300"
        />
      )}

      {seleccion.activo && (
        <span className="absolute right-4 top-4 z-10">
          <CasillaSeleccion marcada={marcada} />
        </span>
      )}

      {/* El asa para reordenar. La tarjeta entera no arrastra —dentro hay
          gráficas que se exploran con el puntero, y un tirón accidental movería
          el tablero sin querer—: se agarra de aquí, con la misma mano que las
          fichas del panel de quitadas. */}
      {seMueve && (
        <button
          type="button"
          onPointerDown={(e) => arrastre.tomar({ numero, titulo }, e)}
          title="Arrastrar para reordenar"
          aria-label={`Mover la tarjeta ${titulo}`}
          className="cursor-mano absolute right-11 top-3 z-10 flex h-7 w-7 touch-none items-center justify-center rounded-lg text-slate-300 opacity-0 transition-[opacity,background-color,color] duration-150 ease-suave hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover/tarjeta:opacity-100"
        >
          <HiOutlineArrowsPointingOut className="h-4 w-4" />
        </button>
      )}

      {/* Quitar la tarjeta. Aparece al acercarse o al llegar con el teclado: es
          una acción de limpieza ocasional, no algo que deba estar pidiendo
          atención mientras se leen las cifras. En el reporte personalizado no
          está: allí la selección ya se hizo en el armador. */}
      {!soloLectura && !seleccion.activo && (
        <button
          type="button"
          onClick={() => ocultar(numero)}
          title="Quitar esta tarjeta"
          aria-label={`Quitar la tarjeta ${titulo}`}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-[opacity,background-color,color] duration-150 ease-suave hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover/tarjeta:opacity-100"
        >
          <HiOutlineXMark className="h-4 w-4" />
        </button>
      )}

      <div className={`min-w-0 ${seMueve ? "pr-16" : soloLectura && !seleccion.activo ? "" : "pr-8"}`}>
        <h3
          className="text-base font-bold text-slate-800"
          title={`Métrica ${numero} de la especificación`}
        >
          <span
            aria-hidden="true"
            className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-unah-orange align-middle"
          />
          {titulo}
          {etiqueta}
        </h3>
        {nota && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{nota}</p>}
      </div>

      <div className="mt-5 flex-1">{children}</div>
    </motion.section>
  );
}
