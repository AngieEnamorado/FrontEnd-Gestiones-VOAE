import { HiOutlineArrowTrendingDown, HiOutlineArrowTrendingUp, HiOutlineMinus } from "react-icons/hi2";
import type { IconType } from "react-icons";
import Sparkline from "./Sparkline";
import { useConteoAnimado } from "../../utils/useConteoAnimado";
import { useEnVista } from "../../utils/useEnVista";

/**
 * Tono de la tarjeta. Es identidad, no dato: sirve para que cada cifra se
 * reconozca de un vistazo, no para decir si el número es bueno o malo — de eso
 * se encarga la variación.
 */
export type TonoKpi = "azul" | "ambar" | "esmeralda" | "violeta" | "cielo" | "destacada";

const TONOS: Record<
  TonoKpi,
  { fondo: string; icono: string; cifra: string; etiqueta: string; linea: string; anillo: string }
> = {
  azul: {
    fondo: "bg-blue-50",
    icono: "bg-white/70 text-blue-500",
    cifra: "text-blue-900",
    etiqueta: "text-blue-700/70",
    linea: "#3b82f6",
    anillo: "#eff6ff",
  },
  ambar: {
    fondo: "bg-amber-50",
    icono: "bg-white/70 text-amber-500",
    cifra: "text-amber-900",
    etiqueta: "text-amber-700/70",
    linea: "#f59e0b",
    anillo: "#fffbeb",
  },
  esmeralda: {
    fondo: "bg-emerald-50",
    icono: "bg-white/70 text-emerald-500",
    cifra: "text-emerald-900",
    etiqueta: "text-emerald-700/70",
    linea: "#10b981",
    anillo: "#ecfdf5",
  },
  violeta: {
    fondo: "bg-violet-50",
    icono: "bg-white/70 text-violet-500",
    cifra: "text-violet-900",
    etiqueta: "text-violet-700/70",
    linea: "#8b5cf6",
    anillo: "#f5f3ff",
  },
  cielo: {
    fondo: "bg-sky-50",
    icono: "bg-white/70 text-sky-500",
    cifra: "text-sky-900",
    etiqueta: "text-sky-700/70",
    linea: "#0ea5e9",
    anillo: "#f0f9ff",
  },
  destacada: {
    fondo: "bg-gradient-to-br from-unah-navy to-unah-navy-dark",
    icono: "bg-white/15 text-white",
    cifra: "text-white",
    etiqueta: "text-blue-100",
    linea: "#ffffff",
    anillo: "#00254e",
  },
};

interface KpiProcadProps {
  /** Número de la métrica en la especificación del programa. */
  numero: string;
  etiqueta: string;
  icono: IconType;
  tono: TonoKpi;
  /** El valor crudo: la tarjeta se encarga de contarlo y de darle formato. */
  valor: number;
  decimales?: number;
  sufijo?: string;
  serie: number[];
  indiceActivo: number;
  /** Sufijo de la variación: " pp" para puntos porcentuales, vacío para conteos. */
  sufijoDelta?: string;
  /** Requerimiento que obliga a reportar esta cifra, si hay alguno. */
  requisito?: string;
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
  const base =
    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold";
  const neutro = destacada ? "bg-white/15 text-blue-50" : "bg-white/70 text-slate-500";

  if (indice <= 0) {
    return <span className={`${base} ${neutro}`}>sin período previo</span>;
  }

  const diferencia = Math.round((serie[indice] - serie[indice - 1]) * 10) / 10;

  if (diferencia === 0) {
    return (
      <span className={`${base} ${neutro}`}>
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
      ? "bg-white/80 text-emerald-700"
      : "bg-white/80 text-rose-700";

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
  icono: Icono,
  tono,
  valor,
  decimales = 0,
  sufijo = "",
  serie,
  indiceActivo,
  sufijoDelta = "",
  requisito,
}: KpiProcadProps) {
  const [referencia, enVista] = useEnVista<HTMLDivElement>();
  const contado = useConteoAnimado(valor, enVista);
  const estilo = TONOS[tono];
  const destacada = tono === "destacada";

  return (
    <div
      ref={referencia}
      className={`flex flex-col rounded-2xl p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-suave hover:-translate-y-0.5 ${
        destacada ? "hover:shadow-lg hover:shadow-unah-navy/25" : "hover:shadow-md"
      } ${estilo.fondo}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${estilo.icono}`}
        >
          <Icono className="h-5 w-5" aria-hidden="true" />
        </span>
        <Delta serie={serie} indice={indiceActivo} sufijo={sufijoDelta} destacada={destacada} />
      </div>

      {/* Cifras proporcionales, no tabulares: a este tamaño el ancho fijo de
          dígito deja huecos raros dentro del número. */}
      <p
        className={`mt-3.5 text-3xl font-extrabold leading-none ${estilo.cifra}`}
        style={{ fontVariantNumeric: "proportional-nums" }}
      >
        {contado.toFixed(decimales)}
        {sufijo}
      </p>

      <p className={`mt-2 text-xs font-semibold leading-snug ${estilo.etiqueta}`}>
        <span className="opacity-70">{numero} · </span>
        {etiqueta}
        {requisito && (
          <span
            title={`Cifra exigida por ${requisito}`}
            className={`ml-1.5 inline-block rounded px-1.5 py-px align-middle text-[9px] font-bold tracking-wide ${
              destacada ? "bg-white/20 text-white" : "bg-white/80 text-slate-600"
            }`}
          >
            {requisito}
          </span>
        )}
      </p>

      <Sparkline
        serie={serie}
        indiceActivo={indiceActivo}
        color={estilo.linea}
        colorAnillo={estilo.anillo}
      />
    </div>
  );
}
