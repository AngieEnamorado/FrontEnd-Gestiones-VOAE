import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import SinDatos from "./SinDatos";
import { useEnVista } from "../../utils/useEnVista";
import { COLOR_EJE, COLOR_REJILLA, COLOR_SERIE } from "./paleta";

export interface ColumnaCategoria {
  /** Nombre completo, para el globo. */
  nombre: string;
  /** Versión corta para el eje, donde no cabe el nombre entero. */
  corto: string;
  valor: number;
}

interface ColumnasCategoriasProps {
  columnas: ColumnaCategoria[];
  unidad: string;
  alto?: number;
}

interface PropsGlobo extends Partial<TooltipContentProps<number, string>> {
  unidad: string;
}

function GloboColumna({ active, payload, unidad }: PropsGlobo) {
  if (!active || !payload || payload.length === 0) return null;
  const fila = payload[0].payload as ColumnaCategoria;
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-bold text-slate-700">{fila.nombre}</p>
      <p className="mt-1 text-slate-500">
        <span className="font-bold text-slate-800">{fila.valor}</span> {unidad}
      </p>
    </div>
  );
}

/**
 * Columnas verticales para pocas categorías de nombre corto. Frente a la lista
 * de barras horizontales, se comparan más rápido entre sí; por eso se usa solo
 * donde los nombres caben debajo sin recortarse.
 */
export default function ColumnasCategorias({
  columnas,
  unidad,
  alto = 280,
}: ColumnasCategoriasProps) {
  const [referencia, enVista] = useEnVista<HTMLDivElement>();

  if (columnas.length === 0) return <SinDatos />;

  return (
    <div ref={referencia} className="w-full" style={{ height: alto }}>
      {/* El contenedor guarda su alto siempre, así que montar el gráfico más
          tarde no mueve nada de la página. */}
      {enVista && (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={columnas} margin={{ top: 24, right: 8, bottom: 8, left: -12 }}>
          <CartesianGrid vertical={false} stroke={COLOR_REJILLA} />
          <XAxis
            dataKey="corto"
            tick={{ fontSize: 10.5, fill: COLOR_EJE }}
            tickLine={false}
            tickMargin={8}
            stroke={COLOR_REJILLA}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: COLOR_EJE }}
            tickLine={false}
            stroke={COLOR_REJILLA}
            width={44}
            allowDecimals={false}
          />
          <Tooltip content={<GloboColumna unidad={unidad} />} cursor={{ fill: "#f8fafc" }} />
          <Bar
            dataKey="valor"
            fill={COLOR_SERIE}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            animationDuration={700}
            animationEasing="ease-out"
          >
            <LabelList
              dataKey="valor"
              position="top"
              offset={8}
              style={{ fontSize: 11, fill: "#475569", fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}
