import { COLOR_SERIE, COLOR_SUPERFICIE } from "./paleta";

interface SparklineProps {
  serie: number[];
  /** Índice del período que se está viendo: es el único punto que se marca. */
  indiceActivo: number;
  color?: string;
  /** El anillo que separa el punto de la línea: siempre el color de la superficie. */
  colorAnillo?: string;
}

/**
 * Tendencia mínima dentro de una tarjeta de KPI. No lleva ejes ni valores: la
 * cifra exacta ya está arriba, y esta línea solo responde "¿venía subiendo?".
 */
export default function Sparkline({
  serie,
  indiceActivo,
  color = COLOR_SERIE,
  colorAnillo = COLOR_SUPERFICIE,
}: SparklineProps) {
  if (serie.length < 2) return null;

  const ancho = 240;
  const alto = 44;
  const margen = 5;
  const max = Math.max(...serie);
  const min = Math.min(...serie);
  const constante = max === min;
  const rango = max - min || 1;
  const x = (i: number) => margen + (i * (ancho - 2 * margen)) / (serie.length - 1);
  // Una serie sin variación se dibuja a media altura: pegada al piso se leería
  // como una raya de separación, no como una tendencia plana.
  const y = (v: number) =>
    constante ? alto / 2 : alto - margen - ((v - min) / rango) * (alto - 2 * margen);

  const puntos = serie.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className="mt-3 block h-11 w-full overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={puntos}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle
        cx={x(indiceActivo)}
        cy={y(serie[indiceActivo])}
        r="4"
        fill={color}
        stroke={colorAnillo}
        strokeWidth="2"
      />
    </svg>
  );
}
