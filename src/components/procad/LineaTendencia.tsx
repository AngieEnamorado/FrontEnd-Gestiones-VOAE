import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import SinDatos from "./SinDatos";
import { useEnVista } from "../../utils/useEnVista";
import { COLOR_EJE, COLOR_REJILLA, COLOR_SERIE } from "./paleta";

interface LineaTendenciaProps {
  serie: number[];
  /** Nombre corto de cada período, para el eje. */
  etiquetas: string[];
  /** Nombre completo de cada período, para el globo. */
  etiquetasLargas?: string[];
  /** El período que se está viendo: el único punto marcado y etiquetado. */
  indiceActivo: number;
  esPorcentaje?: boolean;
  /** Nombre de la unidad para el globo: "estudiantes", "actividades". */
  unidad?: string;
  alto?: number;
  ariaLabel: string;
}

interface PuntoTendencia {
  etiqueta: string;
  etiquetaLarga: string;
  valor: number;
  etiquetaValor?: string;
}

interface PropsGlobo extends Partial<TooltipContentProps<number, string>> {
  esPorcentaje: boolean;
  unidad: string;
}

function GloboTendencia({ active, payload, esPorcentaje, unidad }: PropsGlobo) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload as PuntoTendencia;
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-bold text-slate-600">{punto.etiquetaLarga}</p>
      <p className="flex items-center gap-1.5 text-slate-500">
        <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: COLOR_SERIE }} />
        <span className="font-bold text-slate-800">
          {payload[0].value}
          {esPorcentaje ? "%" : ""}
        </span>
        {!esPorcentaje && unidad}
      </p>
    </div>
  );
}

export default function LineaTendencia({
  serie,
  etiquetas,
  etiquetasLargas,
  indiceActivo,
  esPorcentaje = false,
  unidad = "",
  alto = 230,
  ariaLabel,
}: LineaTendenciaProps) {
  const [referencia, enVista] = useEnVista<HTMLDivElement>();

  if (serie.length < 2) return <SinDatos />;

  const datos: PuntoTendencia[] = serie.map((valor, i) => ({
    etiqueta: etiquetas[i],
    etiquetaLarga: etiquetasLargas?.[i] ?? etiquetas[i],
    valor,
    // Solo el período activo lleva etiqueta directa: un número sobre cada
    // punto se vuelve ruido y nadie lo lee.
    etiquetaValor: i === indiceActivo ? `${valor}${esPorcentaje ? "%" : ""}` : undefined,
  }));

  let indiceMaximo = 0;
  serie.forEach((v, i) => {
    if (v > serie[indiceMaximo]) indiceMaximo = i;
  });
  const anotarMaximo = indiceMaximo !== indiceActivo && serie[indiceMaximo] > 0;

  return (
    <div ref={referencia} className="w-full" style={{ height: alto }} role="img" aria-label={ariaLabel}>
      {/* El contenedor guarda su alto siempre, así que montar el gráfico más
          tarde no mueve nada de la página. */}
      {enVista && (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={datos} margin={{ top: 28, right: 34, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="areaTendenciaProcad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR_SERIE} stopOpacity={0.16} />
              <stop offset="100%" stopColor={COLOR_SERIE} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Rejilla de línea fina y continua: el punteado agrega ruido y se
              lee como "umbral" cuando solo es una referencia. */}
          <CartesianGrid vertical={false} stroke={COLOR_REJILLA} />
          <XAxis
            dataKey="etiqueta"
            tick={{ fontSize: 10.5, fill: COLOR_EJE }}
            tickLine={false}
            tickMargin={8}
            stroke={COLOR_REJILLA}
            interval={0}
            minTickGap={0}
          />
          <YAxis
            domain={esPorcentaje ? [0, 100] : [0, "auto"]}
            ticks={esPorcentaje ? [0, 25, 50, 75, 100] : undefined}
            tickFormatter={(v: number) => `${v}${esPorcentaje ? "%" : ""}`}
            tick={{ fontSize: 10.5, fill: COLOR_EJE }}
            tickLine={false}
            stroke={COLOR_REJILLA}
            width={48}
            allowDecimals={false}
          />
          <Tooltip
            content={<GloboTendencia esPorcentaje={esPorcentaje} unidad={unidad} />}
            cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={COLOR_SERIE}
            strokeWidth={2}
            strokeLinecap="round"
            fill="url(#areaTendenciaProcad)"
            animationDuration={750}
            animationEasing="ease-out"
            dot={{ r: 4, fill: COLOR_SERIE, stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: COLOR_SERIE, stroke: "#ffffff", strokeWidth: 2 }}
          >
            <LabelList
              dataKey="etiquetaValor"
              position="top"
              offset={12}
              style={{ fontSize: 11, fill: COLOR_SERIE, fontWeight: 700 }}
            />
          </Area>

          {anotarMaximo && (
            <ReferenceDot
              x={etiquetas[indiceMaximo]}
              y={serie[indiceMaximo]}
              r={5}
              fill={COLOR_SERIE}
              stroke="#ffffff"
              strokeWidth={2}
              label={{
                value: "Máximo",
                position: "top",
                offset: 12,
                style: { fontSize: 10, fill: "#475569", fontWeight: 700 },
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
