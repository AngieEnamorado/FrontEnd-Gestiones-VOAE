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
  HiOutlineHandRaised,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineDocumentArrowDown,
  HiOutlineFunnel,
  HiOutlineXMark,
} from "react-icons/hi2";
import EstadisticaCard from "../../../components/EstadisticaCard";
import { registrosVoluntariado, CAMPUS, redesTematicas } from "../../../data/mockEstadisticasVoluntariado";
import { generarReportePdf, type SeccionReportePdf } from "../../../utils/exportarPdf";
import type { EstadoSolicitud } from "../../../types";

const COLOR_BLUE = "#2563eb";
const COLOR_EMERALD = "#10b981";
const COLOR_AMBER = "#f59e0b";
const COLOR_VIOLET = "#8b5cf6";
const COLOR_ROSE = "#f43f5e";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const CAMPUS_CORTO: Record<string, string> = {
  "Ciudad Universitaria": "C. Universitaria",
};

// Orden fijo de identidad para las 5 redes temáticas — nunca se reasigna
// según los datos filtrados, para que un color siempre represente la misma red.
const RED_COLOR: Record<string, string> = {
  ambiental: COLOR_EMERALD,
  salud: COLOR_ROSE,
  educativa: COLOR_BLUE,
  social: COLOR_AMBER,
  cultural: COLOR_VIOLET,
};
const ORDEN_REDES = redesTematicas.map((r) => r.id);

const ESTADOS_FILTRO: EstadoSolicitud[] = ["APROBADA", "PENDIENTE", "RECHAZADA", "DEVUELTA"];

interface Filtros {
  año: string;
  periodo: string;
  campus: string;
  red: string;
  estado: string;
}

const FILTROS_INICIALES: Filtros = {
  año: "Todos",
  periodo: "Todos",
  campus: "Todos",
  red: "Todas",
  estado: "Todos",
};

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
        <span className="text-slate-500">actividades</span>
      </p>
    </CajaTooltip>
  );
}

function TooltipCampus({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload as PuntoCampus;
  return (
    <CajaTooltip>
      <p className="mb-1 font-semibold text-slate-600">{punto.campus}</p>
      <p className="text-slate-500">
        <span className="font-bold text-slate-800">{punto.participantes}</span> participantes
      </p>
      <p className="text-slate-500">
        <span className="font-bold text-slate-800">{punto.actividades}</span> actividades
      </p>
    </CajaTooltip>
  );
}

function TooltipRed({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  const punto = payload[0].payload as PuntoRed;
  return (
    <CajaTooltip>
      <p className="flex items-center gap-1.5 font-semibold text-slate-700">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: punto.color }} />
        {punto.nombre}
      </p>
      <p className="mt-1 text-slate-500">
        <span className="font-bold text-slate-800">{punto.valor}</span> actividades ({punto.porcentaje}%)
      </p>
    </CajaTooltip>
  );
}

function TooltipGrupo({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <CajaTooltip>
      <p className="mb-1 font-semibold text-slate-600">{label}</p>
      <p className="text-slate-500">
        <span className="font-bold text-slate-800">{payload[0].value}</span> actividades
      </p>
    </CajaTooltip>
  );
}

interface PuntoCampus {
  campus: string;
  campusCorto: string;
  actividades: number;
  participantes: number;
}

interface PuntoRed {
  red: string;
  nombre: string;
  valor: number;
  porcentaje: number;
  color: string;
}

export default function Estadisticas() {
  const [borrador, setBorrador] = useState<Filtros>(FILTROS_INICIALES);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

  const registrosFiltrados = useMemo(
    () =>
      registrosVoluntariado.filter(
        (r) =>
          (filtros.año === "Todos" || r.año === Number(filtros.año)) &&
          (filtros.periodo === "Todos" || r.periodo === filtros.periodo) &&
          (filtros.campus === "Todos" || r.campus === filtros.campus) &&
          (filtros.red === "Todas" || r.red === filtros.red) &&
          (filtros.estado === "Todos" || r.estado === filtros.estado),
      ),
    [filtros],
  );

  const totalActividades = registrosFiltrados.length;
  const actividadesAprobadas = registrosFiltrados.filter((r) => r.estado === "APROBADA").length;
  const totalParticipantes = registrosFiltrados.reduce((acc, r) => acc + r.participantes, 0);
  const totalHoras = registrosFiltrados.reduce((acc, r) => acc + r.horas, 0);

  const tendenciaMensual = useMemo(() => {
    const conteos = new Array(12).fill(0);
    for (const r of registrosFiltrados) {
      conteos[Number(r.fecha.slice(5, 7)) - 1] += 1;
    }
    return MESES_CORTOS.map((mes, indice) => ({ mes, actividades: conteos[indice] }));
  }, [registrosFiltrados]);

  const porCampus = useMemo(() => {
    const mapa = new Map<string, { actividades: number; participantes: number }>();
    for (const r of registrosFiltrados) {
      const actual = mapa.get(r.campus) ?? { actividades: 0, participantes: 0 };
      actual.actividades += 1;
      actual.participantes += r.participantes;
      mapa.set(r.campus, actual);
    }
    const puntos: PuntoCampus[] = Array.from(mapa.entries()).map(([campus, valores]) => ({
      campus,
      campusCorto: CAMPUS_CORTO[campus] ?? campus,
      ...valores,
    }));
    return puntos.sort((a, b) => b.participantes - a.participantes);
  }, [registrosFiltrados]);

  const porRed = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const r of registrosFiltrados) {
      mapa.set(r.red, (mapa.get(r.red) ?? 0) + 1);
    }
    const total = registrosFiltrados.length || 1;
    const puntos: PuntoRed[] = ORDEN_REDES.map((redId) => {
      const valor = mapa.get(redId) ?? 0;
      const nombre = redesTematicas.find((r) => r.id === redId)?.nombre ?? redId;
      return {
        red: redId,
        nombre,
        valor,
        porcentaje: Math.round((valor / total) * 100),
        color: RED_COLOR[redId],
      };
    });
    return puntos;
  }, [registrosFiltrados]);

  const topGrupos = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const r of registrosFiltrados) {
      mapa.set(r.grupo, (mapa.get(r.grupo) ?? 0) + 1);
    }
    return Array.from(mapa.entries())
      .map(([grupo, actividades]) => ({ grupo, actividades }))
      .sort((a, b) => b.actividades - a.actividades)
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
        ["Campus", filtros.campus],
        ["Red temática", filtros.red],
        ["Estado", filtros.estado],
      ],
    };
  }

  function descargarTendenciaPdf() {
    generarReportePdf(
      "VOLUNTARIADO",
      "Tendencia de Actividades por Mes",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Tendencia de actividades por mes",
          columnas: ["Mes", "Actividades"],
          filas: tendenciaMensual.map((p) => [p.mes, p.actividades]),
        },
      ],
      "voluntariado-tendencia-mensual.pdf",
    );
  }

  function descargarCampusPdf() {
    generarReportePdf(
      "VOLUNTARIADO",
      "Participantes y Actividades por Campus",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Participantes y actividades por campus",
          columnas: ["Campus", "Actividades", "Participantes"],
          filas: porCampus.map((p) => [p.campus, p.actividades, p.participantes]),
        },
      ],
      "voluntariado-por-campus.pdf",
    );
  }

  function descargarRedPdf() {
    generarReportePdf(
      "VOLUNTARIADO",
      "Distribución por Red Temática",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Distribución por red temática",
          columnas: ["Red temática", "Actividades", "Porcentaje"],
          filas: porRed.map((p) => [p.nombre, p.valor, `${p.porcentaje}%`]),
        },
      ],
      "voluntariado-por-red-tematica.pdf",
    );
  }

  function descargarGruposPdf() {
    generarReportePdf(
      "VOLUNTARIADO",
      "Top Grupos con Más Actividades",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Top grupos con más actividades",
          columnas: ["Grupo", "Actividades"],
          filas: topGrupos.map((p) => [p.grupo, p.actividades]),
        },
      ],
      "voluntariado-top-grupos.pdf",
    );
  }

  function exportarReporteCompleto() {
    generarReportePdf(
      "VOLUNTARIADO",
      "Estadísticas y Métricas de Voluntariado",
      [
        seccionFiltrosPdf(),
        {
          titulo: "Métricas rápidas",
          columnas: ["Indicador", "Valor"],
          filas: [
            ["Total actividades realizadas", totalActividades],
            ["Actividades aprobadas", actividadesAprobadas],
            ["Participantes", totalParticipantes],
            ["Horas totales de voluntariado", `${totalHoras.toLocaleString("es-HN")} h`],
          ],
        },
        {
          titulo: "Tendencia de actividades por mes",
          columnas: ["Mes", "Actividades"],
          filas: tendenciaMensual.map((p) => [p.mes, p.actividades]),
        },
        {
          titulo: "Participantes y actividades por campus",
          columnas: ["Campus", "Actividades", "Participantes"],
          filas: porCampus.map((p) => [p.campus, p.actividades, p.participantes]),
        },
        {
          titulo: "Distribución por red temática",
          columnas: ["Red temática", "Actividades", "Porcentaje"],
          filas: porRed.map((p) => [p.nombre, p.valor, `${p.porcentaje}%`]),
        },
        {
          titulo: "Top grupos con más actividades",
          columnas: ["Grupo", "Actividades"],
          filas: topGrupos.map((p) => [p.grupo, p.actividades]),
        },
      ],
      "voluntariado-estadisticas-reporte-completo.pdf",
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wider text-unah-orange">VOLUNTARIADO</p>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Estadísticas y Métricas de Voluntariado
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

          <div className="min-w-[200px] flex-1">
            <label className={claseLabel}>Campus / Centro</label>
            <select
              value={borrador.campus}
              onChange={(e) => setBorrador((prev) => ({ ...prev, campus: e.target.value }))}
              className={claseSelect}
            >
              <option>Todos</option>
              {CAMPUS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px] flex-1">
            <label className={claseLabel}>Red temática</label>
            <select
              value={borrador.red}
              onChange={(e) => setBorrador((prev) => ({ ...prev, red: e.target.value }))}
              className={claseSelect}
            >
              <option value="Todas">Todas</option>
              {redesTematicas.map((red) => (
                <option key={red.id} value={red.id}>
                  {red.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px] flex-1">
            <label className={claseLabel}>Estado</label>
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
          icon={HiOutlineHandRaised}
          label="Total actividades realizadas"
          valor={totalActividades}
          colorFondo="bg-blue-50"
          colorIcono="text-blue-500"
          colorTexto="text-blue-700"
        />
        <EstadisticaCard
          icon={HiOutlineCheckCircle}
          label="Actividades aprobadas"
          valor={actividadesAprobadas}
          colorFondo="bg-emerald-50"
          colorIcono="text-emerald-500"
          colorTexto="text-emerald-700"
        />
        <EstadisticaCard
          icon={HiOutlineUsers}
          label="Participantes"
          valor={totalParticipantes}
          colorFondo="bg-amber-50"
          colorIcono="text-amber-500"
          colorTexto="text-amber-700"
        />
        <EstadisticaCard
          icon={HiOutlineClock}
          label="Horas totales de voluntariado"
          valor={`${totalHoras.toLocaleString("es-HN")} h`}
          colorFondo="bg-purple-50"
          colorIcono="text-purple-500"
          colorTexto="text-purple-700"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TarjetaGrafico
          titulo="Tendencia de Actividades por Mes"
          subtitulo="Volumen de actividades de voluntariado realizadas a lo largo del año"
          onDescargar={descargarTendenciaPdf}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tendenciaMensual} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActividades" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="actividades"
                stroke={COLOR_BLUE}
                strokeWidth={2}
                fill="url(#colorActividades)"
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="Participantes y Actividades por Campus"
          subtitulo="Qué campus organizan más actividades y movilizan más participantes"
          onDescargar={descargarCampusPdf}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porCampus} margin={{ top: 20, right: 8, left: -16, bottom: 24 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="campusCorto"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={30}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip content={<TooltipCampus />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="participantes" fill={COLOR_EMERALD} radius={[4, 4, 0, 0]} maxBarSize={26}>
                <LabelList
                  dataKey="actividades"
                  position="top"
                  formatter={(valor) => `${valor ?? 0} act.`}
                  style={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="Distribución por Red Temática"
          subtitulo="Proporción de actividades ambientales, de salud, educativas, sociales y culturales"
          onDescargar={descargarRedPdf}
        >
          <div className="flex h-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative h-44 flex-1 sm:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<TooltipRed />} />
                  <Pie
                    data={porRed.filter((p) => p.valor > 0)}
                    dataKey="valor"
                    nameKey="nombre"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={2}
                    cornerRadius={4}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {porRed
                      .filter((p) => p.valor > 0)
                      .map((p) => (
                        <Cell key={p.red} fill={p.color} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{totalActividades}</span>
                <span className="text-[11px] font-medium text-slate-400">Actividades</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {porRed.map((p) => (
                <div key={p.red} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.nombre}
                  </span>
                  <span className="font-semibold text-slate-800">{p.porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        </TarjetaGrafico>

        <TarjetaGrafico
          titulo="Top Grupos con Más Actividades"
          subtitulo="Grupos de voluntariado con mayor volumen de actividades realizadas"
          onDescargar={descargarGruposPdf}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topGrupos}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="grupo"
                width={150}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10.5, fill: "#475569" }}
              />
              <Tooltip content={<TooltipGrupo />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="actividades" fill={COLOR_VIOLET} radius={[0, 4, 4, 0]} maxBarSize={16}>
                <LabelList
                  dataKey="actividades"
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
