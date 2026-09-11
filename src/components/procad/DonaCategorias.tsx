import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";
import SinDatos from "./SinDatos";
import { useEnVista } from "../../utils/useEnVista";
import { muestraPct, pctDe } from "../../utils/procadMetricas";

export interface PorcionDona {
  nombre: string;
  valor: number;
  color: string;
}

interface DonaCategoriasProps {
  porciones: PorcionDona[];
  /** Qué se está contando, para la etiqueta del centro. */
  unidad: string;
}

function GloboPorcion({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const porcion = payload[0].payload as PorcionDona & { pct: number | null };
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="flex items-center gap-1.5 font-bold text-slate-700">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: porcion.color }}
        />
        {porcion.nombre}
      </p>
      <p className="mt-1 text-slate-500">
        <span className="font-bold text-slate-800">{porcion.valor}</span> ({muestraPct(porcion.pct)})
      </p>
    </div>
  );
}

/**
 * Parte sobre total con el total al centro. Sirve cuando son pocas categorías
 * y lo que importa es el reparto de un vistazo; la leyenda va al lado con el
 * valor de cada una, porque en un anillo las porciones parecidas no se
 * distinguen midiendo con el ojo.
 */
export default function DonaCategorias({ porciones, unidad }: DonaCategoriasProps) {
  const [referencia, enVista] = useEnVista<HTMLDivElement>();

  const total = porciones.reduce((acc, p) => acc + p.valor, 0);
  if (total === 0) return <SinDatos />;

  const conPct = porciones.map((p) => ({ ...p, pct: pctDe(p.valor, total) }));
  const visibles = conPct.filter((p) => p.valor > 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div ref={referencia} className="relative h-48 w-full max-w-[220px] shrink-0">
      {/* El contenedor guarda su alto siempre, así que montar el gráfico más
          tarde no mueve nada de la página. */}
        {enVista && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<GloboPorcion />} />
            <Pie
              data={visibles}
              dataKey="valor"
              nameKey="nombre"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              animationDuration={700}
              animationEasing="ease-out"
            >
              {visibles.map((p) => (
                <Cell key={p.nombre} fill={p.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-extrabold text-slate-800"
            style={{ fontVariantNumeric: "proportional-nums" }}
          >
            {total}
          </span>
          <span className="text-[11px] font-medium text-slate-400">{unidad}</span>
        </div>
      </div>

      <ul className="flex w-full max-w-sm flex-col gap-2">
        {conPct.map((p) => (
          <li key={p.nombre} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="truncate">{p.nombre}</span>
            </span>
            <span
              className="shrink-0 text-xs font-bold text-slate-500"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {p.valor} · {muestraPct(p.pct)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
