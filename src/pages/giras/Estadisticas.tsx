import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LabelList,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import {
  HiOutlineMap,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineDocumentArrowDown,
  HiOutlineFunnel,
  HiOutlineXMark,
} from "react-icons/hi2";
import EstadisticaCard from "../../components/EstadisticaCard";
import { registrosGiras, CAMPUS } from "../../data/mockEstadisticasGiras";
import { generarReportePdf, type SeccionReportePdf } from "../../utils/exportarPdf";
import type { AlcanceViaje, EstadoSolicitud, FinalidadGira } from "../../types";

const COLOR_BLUE = "#2563eb";
const COLOR_EMERALD = "#10b981";
const COLOR_AMBER = "#f59e0b";
const COLOR_VIOLET = "#8b5cf6";
const COLOR_ROSE = "#f43f5e";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const FACULTAD_CORTA: Record<string, string> = {
  "Ciencias Espaciales": "C. Espaciales",
  "Ciencias Económicas, Administrativas y Contables": "C. Económicas",
  "Ciencias Sociales": "C. Sociales",
  "Ciencias Médicas": "C. Médicas",
  Ingeniería: "Ingeniería",
  "Humanidades y Artes": "Humanidades",
};

// Orden fijo de identidad para las 5 finalidades — nunca se reasigna según los
// datos filtrados, para que un color siempre represente la misma finalidad.
const FINALIDAD_COLOR: Record<FinalidadGira, string> = {
  Académica: COLOR_BLUE,
  Social: COLOR_EMERALD,
  Cultural: COLOR_AMBER,
  Deportiva: COLOR_VIOLET,
  Recreativa: COLOR_ROSE,
};
const ORDEN_FINALIDADES: FinalidadGira[] = ["Académica", "Social", "Cultural", "Deportiva", "Recreativa"];

const ESTADOS_FILTRO: EstadoSolicitud[] = [
  "APROBADA",
  "PENDIENTE",
  "RECHAZADA",
  "EN REVISIÓN",
  "ESPERA INF. SOCIAL",
];
const ALCANCES_FILTRO: AlcanceViaje[] = ["Local", "Nacional", "Internacional"];

interface Filtros {
  año: string;
  periodo: string;
  alcance: string;
  campus: string;
  estado: string;
}

const FILTROS_INICIALES: Filtros = {
  año: "Todos",
  periodo: "Todos",
  alcance: "Todas",
  campus: "Todos",
  estado: "Todos",
};

function formatearMonto(monto: number) {
  return monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";
const claseSelect =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-unah-orange";

function TarjetaGrafico({
  titulo,
  subtitulo,
  onDescargar,
  children,
}: {
  titulo: string;
  subtitulo: string;
  onDescargar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">{titulo}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{subtitulo}</p>
        </div>
        <button
          type="button"
          onClick={onDescargar}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50"
        >
          <HiOutlineDocumentArrowDown className="h-3.5 w-3.5" />
          Descargar PDF
        </button>
      </div>
      <div className="mt-4 h-72">{children}</div>
    </div>
  );
}

function CajaTooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
      {children}
    </div>
  );
}

function TooltipTendencia({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <CajaTooltip>
      <p className="mb-1 font-semibold text-slate-500">{label}</p>
      <p className="flex items-center gap-1.5">
        <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: COLOR_BLUE }} />
        <span className="font-bold text-slate-800">{payload[0].value}</span>
        <span className="text-slate-500">giras</span>
      </p>
    </CajaTooltip>
  );
}

function TooltipFacultad({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload as PuntoFacultad;
  return (
    <CajaTooltip>
      <p className="mb-1 font-semibold text-slate-600">{punto.facultad}</p>
      <p className="text-slate-500">
        <span className="font-bold text-slate-800">{punto.estudiantes}</span> estudiantes
      </p>
      <p className="text-slate-500">
        <span className="font-bold text-slate-800">{punto.giras}</span> giras
      </p>
    </CajaTooltip>
  );
}

function TooltipFinalidad({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload as PuntoFinalidad;
  return (
    <CajaTooltip>
      <p className="flex items-center gap-1.5 font-semibold text-slate-700">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: punto.color }} />
        {punto.finalidad}
      </p>
      <p className="mt-1 text-slate-500">
        <span className="font-bold text-slate-800">{punto.valor}</span> giras ({punto.porcentaje}%)
      </p>
    </CajaTooltip>
  );
}

function TooltipDestino({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <CajaTooltip>
      <p className="mb-1 font-semibold text-slate-600">{label}</p>
      <p className="text-slate-500">
        <span className="font-bold text-slate-800">{payload[0].value}</span> giras
      </p>
    </CajaTooltip>
  );
}

interface PuntoFacultad {
  facultad: string;
  facultadCorta: string;
  giras: number;
  estudiantes: number;
}

interface PuntoFinalidad {
  finalidad: FinalidadGira;
  valor: number;
  porcentaje: number;
  color: string;
}

export default function Estadisticas() {
  const [borrador, setBorrador] = useState<Filtros>(FILTROS_INICIALES);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

  const registrosFiltrados = useMemo(
    () =>
      registrosGiras.filter(
        (r) =>
          (filtros.año === "Todos" || r.año === Number(filtros.año)) &&
          (filtros.periodo === "Todos" || r.periodo === filtros.periodo) &&
          (filtros.alcance === "Todas" || r.alcance === filtros.alcance) &&
          (filtros.campus === "Todos" || r.campus === filtros.campus) &&
          (filtros.estado === "Todos" || r.estado === filtros.estado),
      ),
    [filtros],
  );

  const totalGiras = registrosFiltrados.length;
  const girasAprobadas = registrosFiltrados.filter((r) => r.estado === "APROBADA").length;
  const estudiantesParticipantes = registrosFiltrados.reduce((acc, r) => acc + r.estudiantes, 0);
  const inversionTotal = registrosFiltrados.reduce((acc, r) => acc + r.costo, 0);

  const tendenciaMensual = useMemo(() => {
    const conteos = new Array(12).fill(0);
    for (const r of registrosFiltrados) {
      conteos[Number(r.fecha.slice(5, 7)) - 1] += 1;
    }
    return MESES_CORTOS.map((mes, indice) => ({ mes, giras: conteos[indice] }));
  }, [registrosFiltrados]);

  const porFacultad = useMemo(() => {
    const mapa = new Map<string, { giras: number; estudiantes: number }>();
    for (const r of registrosFiltrados) {
      const actual = mapa.get(r.facultad) ?? { giras: 0, estudiantes: 0 };
      actual.giras += 1;
      actual.estudiantes += r.estudiantes;
      mapa.set(r.facultad, actual);
    }
    const puntos: PuntoFacultad[] = Array.from(mapa.entries()).map(([facultad, valores]) => ({
      facultad,
      facultadCorta: FACULTAD_CORTA[facultad] ?? facultad,
      ...valores,
    }));
    return puntos.sort((a, b) => b.estudiantes - a.estudiantes);
  }, [registrosFiltrados]);

  const porFinalidad = useMemo(() => {
    const mapa = new Map<FinalidadGira, number>();
    for (const r of registrosFiltrados) {
      mapa.set(r.finalidad, (mapa.get(r.finalidad) ?? 0) + 1);
    }
    const total = registrosFiltrados.length || 1;
    const puntos: PuntoFinalidad[] = ORDEN_FINALIDADES.map((finalidad) => {
      const valor = mapa.get(finalidad) ?? 0;
      return {
        finalidad,
        valor,
        porcentaje: Math.round((valor / total) * 100),
        color: FINALIDAD_COLOR[finalidad],
      };
    });
    return puntos;
  }, [registrosFiltrados]);

  const topDestinos = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const r of registrosFiltrados) {
      mapa.set(r.destino, (mapa.get(r.destino) ?? 0) + 1);
    }
    return Array.from(mapa.entries())
      .map(([destino, giras]) => ({ destino, giras }))
      .sort((a, b) => b.giras - a.giras)
      .slice(0, 7);
  }, [registrosFiltrados]);

  function aplicarFiltros() {
    setFiltros(borrador);
  }

  function limpiarFiltros() {
    setBorrador(FILTROS_INICIALES);
    setFiltros(FILTROS_INICIALES);
  }

  function seccionFiltrosPdf(): SeccionReportePdf {
    return {
      titulo: "Filtros aplicados",
      columnas: ["Filtro", "Valor"],
      filas: [
        ["Año", filtros.año],
        ["Período", filtros.periodo],
        ["Alcance", filtros.alcance],
        ["Campus", filtros.campus],
        ["Estado", filtros.estado],
      ],
    };
  }

  function descargarTendenciaPdf() {
    generarReportePdf(
      "GIRAS",
      "Tendencia de Giras por Mes",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Tendencia de giras por mes",
          columnas: ["Mes", "Giras"],
          filas: tendenciaMensual.map((p) => [p.mes, p.giras]),
        },
      ],
      "giras-tendencia-mensual.pdf",
    );
  }

  function descargarFacultadPdf() {
    generarReportePdf(
      "GIRAS",
      "Giras y Estudiantes por Facultad",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Giras y estudiantes por facultad",
          columnas: ["Facultad", "Giras", "Estudiantes"],
          filas: porFacultad.map((p) => [p.facultad, p.giras, p.estudiantes]),
        },
      ],
      "giras-por-facultad.pdf",
    );
  }

  function descargarFinalidadPdf() {
    generarReportePdf(
      "GIRAS",
      "Distribución por Alcance y Finalidad",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Distribución por finalidad",
          columnas: ["Finalidad", "Giras", "Porcentaje"],
          filas: porFinalidad.map((p) => [p.finalidad, p.valor, `${p.porcentaje}%`]),
        },
      ],
      "giras-por-finalidad.pdf",
    );
  }

  function descargarDestinosPdf() {
    generarReportePdf(
      "GIRAS",
      "Top Destinos Más Frecuentados",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Top destinos más frecuentados",
          columnas: ["Destino", "Giras"],
          filas: topDestinos.map((p) => [p.destino, p.giras]),
        },
      ],
      "giras-top-destinos.pdf",
    );
  }

  function exportarReporteCompleto() {
    generarReportePdf(
      "GIRAS",
      "Estadísticas y Métricas de Giras",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Métricas rápidas",
          columnas: ["Indicador", "Valor"],
          filas: [
            ["Total giras realizadas", totalGiras],
            ["Giras aprobadas", girasAprobadas],
            ["Estudiantes participantes", estudiantesParticipantes],
            ["Inversión total ejecutada", `L ${formatearMonto(inversionTotal)}`],
          ],
        },
        {
          titulo: "Tendencia de giras por mes",
          columnas: ["Mes", "Giras"],
          filas: tendenciaMensual.map((p) => [p.mes, p.giras]),
        },
        {
          titulo: "Giras y estudiantes por facultad",
          columnas: ["Facultad", "Giras", "Estudiantes"],
          filas: porFacultad.map((p) => [p.facultad, p.giras, p.estudiantes]),
        },
        {
          titulo: "Distribución por finalidad",
          columnas: ["Finalidad", "Giras", "Porcentaje"],
          filas: porFinalidad.map((p) => [p.finalidad, p.valor, `${p.porcentaje}%`]),
        },
        {
          titulo: "Top destinos más frecuentados",
          columnas: ["Destino", "Giras"],
          filas: topDestinos.map((p) => [p.destino, p.giras]),
        },
      ],
      "giras-estadisticas-reporte-completo.pdf",
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Estadísticas y Métricas de Giras
          </h1>
        </div>

        <button
          type="button"
          onClick={exportarReporteCompleto}
          className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          <HiOutlineDocumentArrowDown className="h-4 w-4" />
          Exportar Reporte Completo (PDF)
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[140px] flex-1">
            <label className={claseLabel}>Año</label>
            <select
              value={borrador.año}
              onChange={(e) => setBorrador((prev) => ({ ...prev, año: e.target.value }))}
              className={claseSelect}
            >
              <option>Todos</option>
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>

          <div className="min-w-[160px] flex-1">
            <label className={claseLabel}>Período</label>
            <select
              value={borrador.periodo}
              onChange={(e) => setBorrador((prev) => ({ ...prev, periodo: e.target.value }))}
              className={claseSelect}
            >
              <option>Todos</option>
              <option>I Periodo</option>
              <option>II Periodo</option>
            </select>
          </div>

          <div className="min-w-[160px] flex-1">
            <label className={claseLabel}>Tipo de alcance</label>
            <select
              value={borrador.alcance}
              onChange={(e) => setBorrador((prev) => ({ ...prev, alcance: e.target.value }))}
              className={claseSelect}
            >
              <option>Todas</option>
              {ALCANCES_FILTRO.map((alcance) => (
                <option key={alcance}>{alcance}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px] flex-1">
            <label className={claseLabel}>Campus / Centro</label>
            <select
              value={borrador.campus}
              onChange={(e) => setBorrador((prev) => ({ ...prev, campus: e.target.value }))}
              className={claseSelect}
            >
              <option>Todos</option>
              {CAMPUS.map((campus) => (
                <option key={campus}>{campus}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[200px] flex-1">
            <label className={claseLabel}>Estado de la gira</label>
            <select
              value={borrador.estado}
              onChange={(e) => setBorrador((prev) => ({ ...prev, estado: e.target.value }))}
              className={claseSelect}
            >
              <option>Todos</option>
              {ESTADOS_FILTRO.map((estado) => (
                <option key={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
            >
              <HiOutlineXMark className="h-4 w-4" />
              Limpiar
            </button>
            <button
              type="button"
              onClick={aplicarFiltros}
              className="flex items-center gap-1.5 rounded-lg bg-unah-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
            >
              <HiOutlineFunnel className="h-4 w-4" />
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <EstadisticaCard
          icon={HiOutlineMap}
          label="Total giras realizadas"
          valor={totalGiras}
          colorFondo="bg-blue-50"
          colorIcono="text-blue-500"
          colorTexto="text-blue-700"
        />
        <EstadisticaCard
          icon={HiOutlineCheckCircle}
          label="Giras aprobadas"
          valor={girasAprobadas}
          colorFondo="bg-emerald-50"
          colorIcono="text-emerald-500"
          colorTexto="text-emerald-700"
        />
        <EstadisticaCard
          icon={HiOutlineUserGroup}
          label="Estudiantes participantes"
          valor={estudiantesParticipantes}
          colorFondo="bg-amber-50"
          colorIcono="text-amber-500"
          colorTexto="text-amber-700"
        />
        <EstadisticaCard
          icon={HiOutlineBanknotes}
          label="Inversión total ejecutada"
          valor={`L ${formatearMonto(inversionTotal)}`}
          colorFondo="bg-purple-50"
          colorIcono="text-purple-500"
          colorTexto="text-purple-700"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TarjetaGrafico
          titulo="Tendencia de Giras por Mes"
          subtitulo="Volumen de giras realizadas a lo largo del año"
          onDescargar={descargarTendenciaPdf}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tendenciaMensual} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGiras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_BLUE} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={COLOR_BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={30}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip content={<TooltipTendencia />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="giras"
                stroke={COLOR_BLUE}
                strokeWidth={2}
                fill="url(#colorGiras)"
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="Giras y Estudiantes por Facultad"
          subtitulo="Qué facultades organizan más giras y movilizan más estudiantes"
          onDescargar={descargarFacultadPdf}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porFacultad} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="facultadCorta"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={30}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip content={<TooltipFacultad />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="estudiantes" fill={COLOR_EMERALD} radius={[4, 4, 0, 0]} maxBarSize={26}>
                <LabelList
                  dataKey="giras"
                  position="top"
                  formatter={(valor) => `${valor ?? 0} giras`}
                  style={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="Distribución por Alcance y Finalidad"
          subtitulo="Proporción de giras académicas, sociales, culturales, deportivas y recreativas"
          onDescargar={descargarFinalidadPdf}
        >
          <div className="flex h-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-44 flex-1 sm:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<TooltipFinalidad />} />
                  <Pie
                    data={porFinalidad.filter((p) => p.valor > 0)}
                    dataKey="valor"
                    nameKey="finalidad"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={2}
                    cornerRadius={4}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {porFinalidad
                      .filter((p) => p.valor > 0)
                      .map((p) => (
                        <Cell key={p.finalidad} fill={p.color} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{totalGiras}</span>
                <span className="text-[11px] font-medium text-slate-400">Giras</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {porFinalidad.map((p) => (
                <div key={p.finalidad} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.finalidad}
                  </span>
                  <span className="font-semibold text-slate-800">{p.porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="Top Destinos Más Frecuentados"
          subtitulo="Ciudades y lugares más visitados en las giras académicas"
          onDescargar={descargarDestinosPdf}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topDestinos}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="destino"
                width={130}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10.5, fill: "#475569" }}
              />
              <Tooltip content={<TooltipDestino />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="giras" fill={COLOR_VIOLET} radius={[0, 4, 4, 0]} maxBarSize={16}>
                <LabelList
                  dataKey="giras"
                  position="right"
                  style={{ fontSize: 10.5, fill: "#64748b", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TarjetaGrafico>
      </div>
    </div>
  );
}
