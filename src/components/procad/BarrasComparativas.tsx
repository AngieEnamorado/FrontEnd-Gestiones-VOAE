import SinDatos from "./SinDatos";
import { useEnVista } from "../../utils/useEnVista";
import { muestraPct } from "../../utils/procadMetricas";
import { COLOR_PISTA, COLOR_SERIE, colorUmbral } from "./paleta";

export interface FilaBarra {
  nombre: string;
  /** `null` cuando la razón no existe (denominador en 0), no cuando vale 0. */
  valor: number | null;
}

interface BarrasComparativasProps {
  filas: FilaBarra[];
  /**
   * `conteo` usa una sola serie y escala contra el valor más alto.
   * `porcentaje` escala contra 100 y colorea por umbral (bajo / medio / alto).
   */
  modo: "conteo" | "porcentaje";
  sufijo?: string;
  /** Nombre de la fila a resaltar; el resto se atenúa. */
  resaltada?: string | null;
  /** Cuántos decimales mostrar en modo conteo. */
  decimales?: number;
  /**
   * `umbral` colorea por bajo / medio / alto, y solo corresponde cuando un
   * valor bajo es de verdad un problema. `neutra` usa el color de serie: una
   * proporción como "cuántos son PROSENE" no es buena ni mala.
   */
  semantica?: "umbral" | "neutra";
}

export default function BarrasComparativas({
  filas,
  modo,
  sufijo = "",
  resaltada = null,
  decimales = 0,
  semantica = "umbral",
}: BarrasComparativasProps) {
  const [referencia, enVista] = useEnVista<HTMLUListElement>();

  const conDato = filas.filter((f) => f.valor !== null);
  if (conDato.length === 0) return <SinDatos />;

  // Ordenado de mayor a menor: la pregunta de estas tarjetas es siempre
  // "¿quién va adelante y quién se quedó atrás?".
  const ordenadas = [...filas].sort((a, b) => (b.valor ?? -1) - (a.valor ?? -1));
  const tope =
    modo === "porcentaje" ? 100 : Math.max(1, ...conDato.map((f) => f.valor as number));


  return (
    // Techo de alto con desplazamiento propio: se siguen viendo todas las
    // filas, pero una lista de diecisiete agrupaciones ya no mide el triple
    // que la tarjeta de al lado con cinco centros. Mismo recurso que usan las
    // tablas anchas de este panel.
    <ul
      ref={referencia}
      className="table-scrollbar flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1"
    >
      {ordenadas.map((fila) => {
        const atenuada = resaltada !== null && fila.nombre !== resaltada;
        const esResaltada = resaltada !== null && fila.nombre === resaltada;
        const ancho = fila.valor === null ? 0 : Math.min(100, (fila.valor / tope) * 100);
        const color =
          modo === "porcentaje" && semantica === "umbral"
            ? colorUmbral(fila.valor)
            : COLOR_SERIE;

        return (
          <li
            key={fila.nombre}
            className={`group/fila -mx-2 rounded-lg px-2 py-1 transition-[opacity,filter,background-color] duration-200 ease-suave hover:bg-slate-100 ${
              atenuada ? "opacity-40 grayscale-[0.6]" : "opacity-100"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={`min-w-0 truncate text-[13px] ${
                  esResaltada ? "font-bold text-unah-navy" : "text-slate-600"
                }`}
                title={fila.nombre}
              >
                {fila.nombre}
              </span>
              <span
                className="shrink-0 text-xs font-bold text-slate-500"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {modo === "porcentaje"
                  ? muestraPct(fila.valor)
                  : fila.valor === null
                    ? "—"
                    : `${fila.valor.toFixed(decimales)}${sufijo}`}
              </span>
            </div>

            <div
              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-sm"
              style={{ backgroundColor: COLOR_PISTA }}
            >
              {/* Extremo del dato redondeado, base cuadrada: la barra crece
                  desde la línea de inicio, no flota. */}
              <div
                className="h-full rounded-r-[4px] transition-[width,filter] duration-500 ease-suave group-hover/fila:brightness-110"
                style={{ width: enVista ? `${ancho}%` : 0, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
