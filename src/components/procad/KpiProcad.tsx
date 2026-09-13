import { HiOutlineArrowTrendingDown, HiOutlineArrowTrendingUp, HiOutlineMinus } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useConteoAnimado } from "../../utils/useConteoAnimado";
import { useEnVista } from "../../utils/useEnVista";
import { useSeleccionReporte } from "../../pages/procad/seleccionReporte";
import CasillaSeleccion from "./CasillaSeleccion";

/**
 * Tono de la tarjeta. Es identidad, no dato: sirve para que cada cifra se
 * reconozca de un vistazo, no para decir si el número es bueno o malo — de eso
 * se encarga la variación.
 */
export type TonoKpi = "azul" | "ambar" | "esmeralda" | "violeta" | "cielo" | "destacada";

const TONOS: Record<
  TonoKpi,
  {
    fondo: string;
    /** Mismo fondo apenas un punto más oscuro: sólo para señalar el hover. */
    fondoHover: string;
    /**
     * Los dos reflejos, arriba a la derecha y abajo a la izquierda. Ambos salen
     * del mismo color que la linea del sparkline y con la misma opacidad en
     * todos los tonos: es lo unico que mantiene a las seis tarjetas con la
     * misma presencia de color. Si cada tono elige su propio matiz, unas se ven
     * lavadas y otras saturadas.
     */
    brillo: string;
    brilloBajo: string;
    /**
     * El filo iluminado del borde superior. Va por tono porque es contraste, no
     * color: el mismo blanco que sobre un fondo claro apenas se insinua, sobre
     * el navy de la destacada se convierte en una franja.
     */
    filo: string;
    /**
     * La banda del destello. Tambien va por tono: el mismo blanco que sobre el
     * navy es un reflejo evidente, sobre un fondo claro no se ve pasar.
     */
    destello: string;
    icono: string;
    cifra: string;
    etiqueta: string;
    linea: string;
    anillo: string;
  }
> = {
  azul: {
    fondo: "bg-blue-100/55",
    fondoHover: "hover:bg-blue-100/70",
    brillo: "bg-[#3b82f6]/35",
    brilloBajo: "bg-[#3b82f6]/20",
    filo: "bg-white/70",
    destello: "via-white/45",
    icono: "bg-white/70 text-blue-500",
    cifra: "text-blue-900",
    etiqueta: "text-blue-700/70",
    linea: "#3b82f6",
    anillo: "#eff6ff",
  },
  ambar: {
    fondo: "bg-amber-100/55",
    fondoHover: "hover:bg-amber-100/70",
    brillo: "bg-[#f59e0b]/35",
    brilloBajo: "bg-[#f59e0b]/20",
    filo: "bg-white/70",
    destello: "via-white/45",
    icono: "bg-white/70 text-amber-500",
    cifra: "text-amber-900",
    etiqueta: "text-amber-700/70",
    linea: "#f59e0b",
    anillo: "#fffbeb",
  },
  esmeralda: {
    fondo: "bg-emerald-100/55",
    fondoHover: "hover:bg-emerald-100/70",
    brillo: "bg-[#10b981]/35",
    brilloBajo: "bg-[#10b981]/20",
    filo: "bg-white/70",
    destello: "via-white/45",
    icono: "bg-white/70 text-emerald-500",
    cifra: "text-emerald-900",
    etiqueta: "text-emerald-700/70",
    linea: "#10b981",
    anillo: "#ecfdf5",
  },
  violeta: {
    fondo: "bg-violet-100/55",
    fondoHover: "hover:bg-violet-100/70",
    brillo: "bg-[#8b5cf6]/35",
    brilloBajo: "bg-[#8b5cf6]/20",
    filo: "bg-white/70",
    destello: "via-white/45",
    icono: "bg-white/70 text-violet-500",
    cifra: "text-violet-900",
    etiqueta: "text-violet-700/70",
    linea: "#8b5cf6",
    anillo: "#f5f3ff",
  },
  cielo: {
    fondo: "bg-sky-100/55",
    fondoHover: "hover:bg-sky-100/70",
    brillo: "bg-[#0ea5e9]/35",
    brilloBajo: "bg-[#0ea5e9]/20",
    filo: "bg-white/70",
    destello: "via-white/45",
    icono: "bg-white/70 text-sky-500",
    cifra: "text-sky-900",
    etiqueta: "text-sky-700/70",
    linea: "#0ea5e9",
    anillo: "#f0f9ff",
  },
  destacada: {
    fondo: "bg-gradient-to-br from-unah-navy/90 to-unah-navy-dark/95",
    fondoHover: "hover:from-unah-navy/95 hover:to-unah-navy-dark",
    brillo: "bg-[#38bdf8]/35",
    brilloBajo: "bg-[#38bdf8]/20",
    filo: "bg-white/15",
    destello: "via-white/30",
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
  const seleccion = useSeleccionReporte();
  const marcada = seleccion.activo && seleccion.estaSeleccionada(numero);

  return (
    <div
      ref={referencia}
      // `data-kpi` y no `data-tarjeta`: el arrastre del panel de tarjetas
      // quitadas busca ese otro atributo para saber dónde soltar, y las cifras
      // de encabezado no participan de eso. Aquí sirve para que el reporte en
      // PDF sepa qué fotografiar.
      data-kpi={numero}
      // Igual que las gráficas: al armar un reporte, la cifra entera se marca.
      {...(seleccion.activo
        ? {
            role: "checkbox",
            "aria-checked": marcada,
            "aria-label": etiqueta,
            tabIndex: 0,
            onClick: () => seleccion.alternar(numero),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key !== " " && e.key !== "Enter") return;
              e.preventDefault();
              seleccion.alternar(numero);
            },
          }
        : {})}
      className={`con-destello relative flex flex-col overflow-hidden rounded-3xl p-4 shadow-[0_12px_32px_-14px_rgba(10,35,80,0.45)] backdrop-blur-xl transition-[background-color,box-shadow] duration-200 ease-suave ${estilo.fondo} ${estilo.fondoHover} ${
        seleccion.activo
          ? `cursor-pointer outline-none ${
              marcada
                ? "ring-2 ring-unah-orange"
                : "ring-1 ring-white/40 hover:ring-unah-navy/30 focus-visible:ring-2 focus-visible:ring-unah-navy"
            }`
          : ""
      }`}
    >
      {/* El vidrio son tres luces: el filo iluminado de arriba y dos reflejos en
          esquinas opuestas. Viven dentro de la tarjeta, no en un campo de color
          compartido detras de la fila: asi el overflow-hidden los recorta en el
          borde y cada tarjeta se queda con su propio tono, sin manchar a la
          vecina ni asomar por los huecos de la rejilla. Van en -z para quedar
          sobre el fondo de la tarjeta pero debajo de la cifra. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-px ${estilo.filo}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-14 -z-10 h-36 w-36 rounded-full blur-2xl ${estilo.brillo}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-16 -left-14 -z-10 h-40 w-40 rounded-full blur-2xl ${estilo.brilloBajo}`}
      />
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${estilo.icono}`}
        >
          <Icono className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <span className="flex items-center gap-2">
          <Delta serie={serie} indice={indiceActivo} sufijo={sufijoDelta} destacada={destacada} />
          {seleccion.activo && <CasillaSeleccion marcada={marcada} sobreOscuro={destacada} />}
        </span>
      </div>

      {/* Cifras proporcionales, no tabulares: a este tamaño el ancho fijo de
          dígito deja huecos raros dentro del número. */}
      <p
        className={`mt-2.5 text-[28px] font-extrabold leading-none ${estilo.cifra}`}
        style={{ fontVariantNumeric: "proportional-nums" }}
      >
        {contado.toFixed(decimales)}
        {sufijo}
      </p>

      <p
        title={`Cifra ${numero} de la especificación`}
        className={`mt-1.5 text-[11px] font-semibold leading-snug ${estilo.etiqueta}`}
      >
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

      <p className={`mt-1.5 text-[10px] leading-none ${estilo.etiqueta}`}>
        {indiceActivo > 0
          ? `vs ${serie[indiceActivo - 1].toFixed(decimales)}${sufijo} el período anterior`
          : "sin período previo"}
      </p>

      {/* Va al final y por encima del contenido: un reflejo pasa sobre la
          superficie, no por debajo de lo que hay impreso en ella. */}
      <span
        aria-hidden="true"
        className={`destello pointer-events-none absolute -top-[60%] z-10 h-[220%] w-[45%] -skew-x-[18deg] bg-gradient-to-r from-transparent to-transparent ${estilo.destello}`}
      />
    </div>
  );
}
