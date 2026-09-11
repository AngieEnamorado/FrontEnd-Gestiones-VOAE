import { HiOutlineArrowTrendingDown, HiOutlineArrowTrendingUp, HiOutlineMinus } from "react-icons/hi2";
import Sparkline from "./Sparkline";

interface KpiProcadProps {
  /** Número de la métrica en la especificación del programa. */
  numero: string;
  etiqueta: string;
  /** Ya formateado: la tarjeta no decide si lleva %, decimales o separador. */
  valor: string;
  serie: number[];
  indiceActivo: number;
  /** Sufijo del delta: " pp" para puntos porcentuales, vacío para conteos. */
  sufijoDelta?: string;
  /** Requerimiento que obliga a reportar esta cifra, si hay alguno. */
  requisito?: string;
  /** Una sola por vista: la cifra con la que encabeza el panel. */
  destacada?: boolean;
}

function Delta({
  serie,
  indice,
  sufijo,
  destacada,
}: {
  serie: number[];
  indice: number;
  sufijo: string;
  destacada: boolean;
}) {
  const base = "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold";

  if (indice <= 0) {
    return (
      <span className={`${base} ${destacada ? "bg-white/15 text-blue-50" : "bg-slate-100 text-slate-500"}`}>
        sin período previo
      </span>
    );
  }

  const diferencia = Math.round((serie[indice] - serie[indice - 1]) * 10) / 10;

  if (diferencia === 0) {
    return (
      <span className={`${base} ${destacada ? "bg-white/15 text-blue-50" : "bg-slate-100 text-slate-500"}`}>
        <HiOutlineMinus className="h-3 w-3" aria-hidden="true" />
        sin cambio
      </span>
    );
  }

  const subio = diferencia > 0;
  const Icono = subio ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown;
  const tono = destacada
    ? "bg-white/15 text-white"
    : subio
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";

  return (
    <span className={`${base} ${tono}`}>
      <Icono className="h-3 w-3" aria-hidden="true" />
      {`${subio ? "+" : ""}${diferencia}${sufijo}`}
      <span className="sr-only">respecto al período anterior</span>
    </span>
  );
}

export default function KpiProcad({
  numero,
  etiqueta,
  valor,
  serie,
  indiceActivo,
  sufijoDelta = "",
  requisito,
  destacada = false,
}: KpiProcadProps) {
  return (
    <div
      className={`flex flex-col rounded-2xl p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-suave hover:-translate-y-0.5 ${
        destacada
          ? "bg-gradient-to-br from-unah-navy to-unah-navy-dark hover:shadow-lg hover:shadow-unah-navy/25"
          : "bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Cifras proporcionales, no tabulares: a este tamaño el ancho fijo de
            dígito deja huecos raros dentro del número. */}
        <p
          className={`text-3xl font-extrabold leading-none ${destacada ? "text-white" : "text-unah-navy"}`}
          style={{ fontVariantNumeric: "proportional-nums" }}
        >
          {valor}
        </p>
        <Delta serie={serie} indice={indiceActivo} sufijo={sufijoDelta} destacada={destacada} />
      </div>

      <p
        className={`mt-3 text-xs font-semibold leading-snug ${destacada ? "text-blue-100" : "text-slate-500"}`}
      >
        <span className={destacada ? "text-blue-200" : "text-slate-400"}>{numero} · </span>
        {etiqueta}
        {requisito && (
          <span
            title={`Cifra exigida por ${requisito}`}
            className={`ml-1.5 inline-block rounded px-1.5 py-px align-middle text-[9px] font-bold tracking-wide ${
              destacada ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"
            }`}
          >
            {requisito}
          </span>
        )}
      </p>

      <Sparkline
        serie={serie}
        indiceActivo={indiceActivo}
        color={destacada ? "#ffffff" : undefined}
        colorAnillo={destacada ? "#00254e" : undefined}
      />
    </div>
  );
}
