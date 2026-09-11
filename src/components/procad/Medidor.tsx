import { muestraPct, pctSeguro } from "../../utils/procadMetricas";
import { COLOR_PISTA, colorUmbral } from "./paleta";

interface MedidorProps {
  /** `null` cuando la razón no existe: el anillo queda vacío y el centro dice "—". */
  pct: number | null;
  etiquetaAccesible: string;
  tamano?: number;
}

/**
 * Anillo para un porcentaje protagonista. Es un medidor, no un gráfico de
 * pastel: muestra una sola cifra contra su total, y el número va escrito en el
 * centro para que el color solo acompañe.
 */
export default function Medidor({ pct, etiquetaAccesible, tamano = 116 }: MedidorProps) {
  const grosor = 13;
  const radio = (tamano - grosor) / 2;
  const centro = tamano / 2;
  const circunferencia = 2 * Math.PI * radio;
  const valor = pct === null ? 0 : pctSeguro(pct);
  const trazo = (circunferencia * valor) / 100;

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox={`0 0 ${tamano} ${tamano}`}
      className="shrink-0"
      role="img"
      aria-label={`${etiquetaAccesible}: ${muestraPct(pct)}`}
    >
      <circle
        cx={centro}
        cy={centro}
        r={radio}
        fill="none"
        stroke={COLOR_PISTA}
        strokeWidth={grosor}
      />
      <circle
        cx={centro}
        cy={centro}
        r={radio}
        fill="none"
        stroke={colorUmbral(pct)}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeDasharray={`${trazo.toFixed(1)} ${circunferencia.toFixed(1)}`}
        transform={`rotate(-90 ${centro} ${centro})`}
        style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.23, 1, 0.32, 1)" }}
      />
      <text
        x={centro}
        y={centro + 7}
        textAnchor="middle"
        className="fill-slate-800 text-[21px] font-extrabold"
        style={{ fontVariantNumeric: "proportional-nums" }}
      >
        {muestraPct(pct)}
      </text>
    </svg>
  );
}
