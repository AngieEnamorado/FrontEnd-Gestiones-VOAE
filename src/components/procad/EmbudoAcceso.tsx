import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import SinDatos from "./SinDatos";
import { useEnVista } from "../../utils/useEnVista";
import { muestraPct, pctDe } from "../../utils/procadMetricas";
import { COLOR_EJE, COLOR_REJILLA, COLOR_SERIE } from "./paleta";

export interface PasoEmbudo {
  id: string;
  /** Texto completo del paso, para el globo. */
  label: string;
  /** Versión corta para el eje, donde no hay espacio. */
  corto: string;
  valor: number;
}

interface EmbudoAccesoProps {
  pasos: PasoEmbudo[];
  /** El paso que importa: queda en color pleno y el resto en un tono claro. */
  idDestacado: string;
}

/** Tono claro del mismo azul: el resto del embudo retrocede sin dejar de ser la misma serie. */
const COLOR_TENUE = "#A8C3E8";

interface FilaEmbudo extends PasoEmbudo {
  conversion: number | null;
  caida: number | null;
}

function GloboPaso({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const paso = payload[0].payload as FilaEmbudo;
  return (
    <div className="max-w-[240px] rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-bold text-slate-700">{paso.label}</p>
      <p className="mt-1 text-slate-500">
        <span className="font-bold text-slate-800">{paso.valor}</span> estudiantes
      </p>
      <p className="text-slate-500">
        Conversión desde el inicio: <span className="font-bold">{muestraPct(paso.conversion)}</span>
      </p>
      <p className="text-slate-500">
        {paso.caida === null
          ? "Primer paso del recorrido."
          : `Caída respecto al paso anterior: −${paso.caida}%`}
      </p>
    </div>
  );
}

/**
 * El recorrido de acceso al programa, paso a paso. Son columnas desde cero, no
 * un eje recortado: con la base movida, una caída del 10% se vería como si
 * fuera la mitad, y el embudo ya se lee solo con los valores reales.
 */
export default function EmbudoAcceso({ pasos, idDestacado }: EmbudoAccesoProps) {
  const [referencia, enVista] = useEnVista<HTMLDivElement>();

  const validos = pasos.filter((p) => p.valor >= 0);
  if (validos.length === 0) return <SinDatos />;

  const inicio = validos[0].valor;
  const filas: FilaEmbudo[] = validos.map((paso, i) => ({
    ...paso,
    conversion: pctDe(paso.valor, inicio),
    caida: i === 0 ? null : pctDe(validos[i - 1].valor - paso.valor, validos[i - 1].valor),
  }));

  return (
    <div ref={referencia} className="h-[280px] w-full">
      {/* El contenedor guarda su alto siempre, así que montar el gráfico más
          tarde no mueve nada de la página. */}
      {enVista && (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filas} margin={{ top: 24, right: 8, bottom: 8, left: -12 }}>
          <CartesianGrid vertical={false} stroke={COLOR_REJILLA} />
          <XAxis
            dataKey="corto"
            tick={{ fontSize: 10.5, fill: COLOR_EJE }}
            tickLine={false}
            stroke={COLOR_REJILLA}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10.5, fill: COLOR_EJE }}
            tickLine={false}
            stroke={COLOR_REJILLA}
            width={48}
            allowDecimals={false}
          />
          <Tooltip content={<GloboPaso />} cursor={{ fill: "#f8fafc" }} />
          <Bar
            dataKey="valor"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {filas.map((fila) => (
              <Cell
                key={fila.id}
                fill={fila.id === idDestacado ? COLOR_SERIE : COLOR_TENUE}
              />
            ))}
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
