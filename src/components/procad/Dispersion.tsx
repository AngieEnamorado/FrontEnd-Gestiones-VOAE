import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  type TooltipContentProps,
} from "recharts";
import Leyenda from "./Leyenda";
import SinDatos from "./SinDatos";
import { COLOR_EJE, COLOR_REJILLA, COLOR_TIPO, ETIQUETA_TIPO } from "./paleta";
import type { TipoAgrupacion } from "../../types";

export interface PuntoDispersion {
  nombre: string;
  tipo: TipoAgrupacion;
  elegibilidad: number;
  cumplimiento: number;
  /** Solo el caso que vale la pena señalar lleva etiqueta directa. */
  etiqueta?: string;
}

function GloboPunto({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload as PuntoDispersion;
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="flex items-center gap-1.5 font-bold text-slate-700">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: COLOR_TIPO[punto.tipo] }}
        />
        {punto.nombre}
      </p>
      <p className="mt-1 text-slate-500">
        Elegibilidad <span className="font-bold text-slate-800">{punto.elegibilidad}%</span>
      </p>
      <p className="text-slate-500">
        Cumplimiento <span className="font-bold text-slate-800">{punto.cumplimiento}%</span>
      </p>
    </div>
  );
}

const TICKS = [0, 25, 50, 75, 100];

export default function Dispersion({ puntos }: { puntos: PuntoDispersion[] }) {
  if (puntos.length === 0) return <SinDatos />;

  const porTipo: { tipo: TipoAgrupacion; datos: PuntoDispersion[] }[] = [
    { tipo: "deportivo", datos: puntos.filter((p) => p.tipo === "deportivo") },
    { tipo: "artistico", datos: puntos.filter((p) => p.tipo === "artistico") },
  ];

  return (
    <div>
      <Leyenda
        entradas={[
          { color: COLOR_TIPO.deportivo, label: ETIQUETA_TIPO.deportivo },
          { color: COLOR_TIPO.artistico, label: ETIQUETA_TIPO.artistico },
        ]}
      />
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 28, bottom: 28, left: 0 }}>
            <CartesianGrid stroke={COLOR_REJILLA} />
            <XAxis
              type="number"
              dataKey="elegibilidad"
              domain={[0, 100]}
              ticks={TICKS}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: COLOR_EJE }}
              tickLine={false}
              stroke={COLOR_REJILLA}
              label={{
                value: "% elegibilidad alcanzada",
                position: "insideBottom",
                offset: -16,
                style: { fontSize: 11, fill: COLOR_EJE },
              }}
            />
            <YAxis
              type="number"
              dataKey="cumplimiento"
              domain={[0, 100]}
              ticks={TICKS}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fontSize: 11, fill: COLOR_EJE }}
              tickLine={false}
              stroke={COLOR_REJILLA}
              width={44}
              label={{
                value: "% cumplimiento",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: COLOR_EJE, textAnchor: "middle" },
              }}
            />
            {/* El hit area es más grande que el punto: una marca de 11px no se
                caza con el cursor en el centro exacto. */}
            <ZAxis range={[120, 120]} />
            <Tooltip content={<GloboPunto />} />
            {porTipo.map(({ tipo, datos }) => (
              <Scatter
                key={tipo}
                name={ETIQUETA_TIPO[tipo]}
                data={datos}
                fill={COLOR_TIPO[tipo]}
                stroke="#ffffff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="etiqueta"
                  position="right"
                  offset={10}
                  style={{ fontSize: 10.5, fill: COLOR_EJE, fontWeight: 600 }}
                />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
