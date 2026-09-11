import { muestraPct, pctSeguro } from "../../utils/procadMetricas";
import { COLOR_PISTA, colorUmbral } from "./paleta";

/**
 * Barra delgada dentro de una celda de tabla: se lee más rápido que el número
 * solo, sin costar otra tarjeta. El porcentaje va escrito al lado, así que el
 * color nunca carga solo el significado.
 */
export default function BarraEnCelda({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-400">—</span>;

  return (
    <span className="flex items-center justify-end gap-2">
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{muestraPct(pct)}</span>
      <span
        aria-hidden="true"
        className="block h-1.5 w-14 shrink-0 overflow-hidden rounded-sm"
        style={{ backgroundColor: COLOR_PISTA }}
      >
        <span
          className="block h-full rounded-r-[3px] transition-[width] duration-500 ease-suave"
          style={{ width: `${pctSeguro(pct)}%`, backgroundColor: colorUmbral(pct) }}
        />
      </span>
    </span>
  );
}
