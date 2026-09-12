import { useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlineXMark } from "react-icons/hi2";
import { useVisibilidadTarjetas } from "../../pages/procad/visibilidadTarjetas";

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
  const { seccionActiva, registrar, ocultar, estaOculta, posicionDe } = useVisibilidadTarjetas();

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
      className={`group/tarjeta relative flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm sm:p-6 ${
        ancha ? "lg:col-span-2" : ""
      }`}
    >
      {/* Quitar la tarjeta. Aparece al acercarse o al llegar con el teclado: es
          una acción de limpieza ocasional, no algo que deba estar pidiendo
          atención mientras se leen las cifras. */}
      <button
        type="button"
        onClick={() => ocultar(numero)}
        title="Quitar esta tarjeta"
        aria-label={`Quitar la tarjeta ${titulo}`}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-[opacity,background-color,color] duration-150 ease-suave hover:bg-slate-100 hover:text-slate-600 focus-visible:opacity-100 group-hover/tarjeta:opacity-100"
      >
        <HiOutlineXMark className="h-4 w-4" />
      </button>

      <div className="min-w-0 pr-8">
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
