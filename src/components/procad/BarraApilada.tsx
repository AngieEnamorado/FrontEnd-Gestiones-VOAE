import Globo from "./Globo";
import SinDatos from "./SinDatos";
import { pctSeguro } from "../../utils/procadMetricas";

export interface SegmentoApilado {
  valor: number;
  color: string;
  label: string;
}

interface BarraApiladaProps {
  segmentos: SegmentoApilado[];
  total: number;
  /** Barra alta: para la proporción protagonista de una tarjeta. */
  alta?: boolean;
}

/**
 * Parte-sobre-total en una sola barra. Lo que separa los segmentos es un hueco
 * del color de la superficie, no un borde dibujado: el borde agrega tinta que
 * no es dato.
 */
export default function BarraApilada({ segmentos, total, alta = false }: BarraApiladaProps) {
  if (!total) return <SinDatos mensaje="Sin datos." />;

  const visibles = segmentos.filter((s) => s.valor > 0);
  if (visibles.length === 0) return <SinDatos mensaje="Sin datos." />;

  return (
    <div className={`flex w-full gap-0.5 ${alta ? "h-8" : "h-[18px]"}`}>
      {visibles.map((seg, i) => {
        const ancho = pctSeguro((seg.valor / total) * 100);
        const redondeo =
          visibles.length === 1
            ? "rounded-[5px]"
            : i === 0
              ? "rounded-l-[5px]"
              : i === visibles.length - 1
                ? "rounded-r-[5px]"
                : "";

        return (
          <div
            key={seg.label}
            tabIndex={0}
            aria-label={`${seg.label}: ${seg.valor}, ${Math.round(ancho)}%`}
            className={`group/marca relative flex min-w-0 items-center justify-center transition-[width] duration-500 ease-suave ${redondeo}`}
            style={{ width: `${ancho}%`, backgroundColor: seg.color }}
          >
            {/* La etiqueta solo entra si cabe con aire a los lados; si no,
                queda en el globo y en el pie de la tarjeta. */}
            {ancho >= 14 && (
              <span
                className={`truncate px-1 font-bold text-white ${alta ? "text-[11.5px]" : "text-[10px]"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {seg.valor}
              </span>
            )}
            <Globo titulo={seg.label} detalle={`${seg.valor} · ${Math.round(ancho)}%`} />
          </div>
        );
      })}
    </div>
  );
}
