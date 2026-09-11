import { useMemo, useRef, useState } from "react";
import { HiOutlineDocumentArrowDown, HiOutlineEye, HiOutlineXMark } from "react-icons/hi2";
import KpiProcad from "../../components/procad/KpiProcad";
import SeccionB from "./secciones/SeccionB";
import SeccionC from "./secciones/SeccionC";
import SeccionD from "./secciones/SeccionD";
import SeccionE from "./secciones/SeccionE";
import SeccionF from "./secciones/SeccionF";
import SeccionG from "./secciones/SeccionG";
import type { ContextoSeccion } from "./secciones/contexto";
import { seccionesDelReporte } from "./secciones/pdf";
import {
  CENTROS,
  PERIODOS,
  PERIODO_ACTUAL,
  agrupacionesProcad,
} from "../../data/mockProcadEstadisticas";
import {
  agrupacionesDisponibles,
  elegibilidadPromedio,
  escalarConteo,
  escalarPct,
  filtrarParaCentros,
  filtrarPorAgrupacion,
  filtrarPorTipoYCentro,
  indiceDePeriodo,
  pctDe,
  razon,
  resumenPorCentro,
  suma,
} from "../../utils/procadMetricas";
import { generarReportePdf, type SeccionReportePdf } from "../../utils/exportarPdf";
import { useRolProcad } from "../../context/UserContext";
import type { FiltrosProcad, TipoAgrupacion } from "../../types";

const FILTROS_INICIALES: FiltrosProcad = {
  periodo: PERIODO_ACTUAL,
  centro: "todos",
  tipo: "todos",
  agrupacion: "todas",
};

const SECCIONES = [
  {
    id: "B",
    label: "Participación y cumplimiento",
    intro: "Cómo asisten y cómo cumplen las agrupaciones del filtro.",
  },
  {
    id: "C",
    label: "Cobertura territorial",
    intro: "Dónde está el programa y cómo se reparte entre los campus.",
  },
  {
    id: "D",
    label: "Acceso al programa",
    intro: "El recorrido de las solicitudes, desde el aspirante hasta el integrante aprobado.",
  },
  { id: "E", label: "Equidad y permanencia", intro: "Quién participa y quién se queda." },
  { id: "F", label: "Tendencia", intro: "Evolución del filtro actual entre períodos." },
  {
    id: "G",
    label: "Casos especiales",
    intro:
      "Condicionados, colaboradores externos, matrícula excepcional y selecciones multi-campus.",
  },
] as const;

type IdSeccion = (typeof SECCIONES)[number]["id"];

const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";
const claseSelect =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none transition-colors focus:border-unah-orange";

export default function EstadisticasProcad() {
  const { rol } = useRolProcad();
  const [filtros, setFiltros] = useState<FiltrosProcad>(FILTROS_INICIALES);
  const [seccionActiva, setSeccionActiva] = useState<IdSeccion>("B");
  const refsPestanas = useRef<Record<string, HTMLButtonElement | null>>({});

  const indicePeriodo = indiceDePeriodo(filtros.periodo);

  // Cambiar tipo o centro puede dejar seleccionada una agrupación que ya no
  // existe en el recorte. En ese caso el filtro de agrupación vuelve a "todas"
  // en lugar de quedar apuntando a nada.
  function cambiarFiltro(cambio: Partial<FiltrosProcad>) {
    setFiltros((previo) => {
      const siguiente = { ...previo, ...cambio };
      if (cambio.tipo !== undefined || cambio.centro !== undefined) {
        const disponibles = agrupacionesDisponibles(agrupacionesProcad, siguiente);
        if (!disponibles.some((a) => a.nombre === siguiente.agrupacion)) {
          siguiente.agrupacion = "todas";
        }
      }
      return siguiente;
    });
  }

  const opcionesAgrupacion = useMemo(
    () => agrupacionesDisponibles(agrupacionesProcad, filtros),
    [filtros],
  );

  const contexto = useMemo<ContextoSeccion>(() => {
    const datos = filtrarPorAgrupacion(agrupacionesProcad, filtros);
    return {
      datos,
      datosAmplios: filtrarPorTipoYCentro(agrupacionesProcad, filtros),
      centros: resumenPorCentro(filtrarParaCentros(agrupacionesProcad, filtros), indicePeriodo),
      indicePeriodo,
      filtros,
      resaltada: filtros.agrupacion === "todas" ? null : filtros.agrupacion,
    };
  }, [filtros, indicePeriodo]);

  // Las seis cifras de encabezado, cada una como serie completa de períodos: la
  // tarjeta necesita la serie para dibujar su tendencia y para calcular la
  // variación contra el período anterior.
  const kpis = useMemo(() => {
    const datos = contexto.datos;
    const estudiantes = suma(datos, "estudiantes");
    const asistencias = suma(datos, "asistencias");
    const preferencial = suma(datos, "preferencial");
    const validadas = suma(datos, "validadas");
    const elegibilidad = Math.round(elegibilidadPromedio(datos));

    const porPeriodo = <T,>(calcular: (i: number) => T) => PERIODOS.map((_, i) => calcular(i));

    return {
      asistidas: porPeriodo((i) => {
        const r = razon(escalarConteo(asistencias, i), escalarConteo(estudiantes, i));
        return r === null ? 0 : Number(r.toFixed(1));
      }),
      preferencial: porPeriodo((i) => {
        const pct = pctDe(escalarConteo(preferencial, i), escalarConteo(estudiantes, i));
        return pct === null ? 0 : escalarPct(pct, i);
      }),
      elegibilidad: porPeriodo((i) => escalarPct(elegibilidad, i)),
      estudiantes: porPeriodo((i) => escalarConteo(estudiantes, i)),
      agrupaciones: porPeriodo((i) => Math.max(1, escalarConteo(datos.length, i))),
      actividades: porPeriodo((i) => escalarConteo(validadas, i)),
    };
  }, [contexto.datos]);

  function moverPestana(direccion: 1 | -1) {
    const actual = SECCIONES.findIndex((s) => s.id === seccionActiva);
    const siguiente = SECCIONES[(actual + direccion + SECCIONES.length) % SECCIONES.length];
    setSeccionActiva(siguiente.id);
    refsPestanas.current[siguiente.id]?.focus();
  }

  function exportarReporte() {
    const periodo = PERIODOS[indicePeriodo];
    const secciones: SeccionReportePdf[] = [
      {
        titulo: "Filtros aplicados",
        columnas: ["Filtro", "Valor"],
        filas: [
          ["Período", periodo.label],
          ["Campus / centro regional", filtros.centro === "todos" ? "Todos" : filtros.centro],
          ["Tipo", filtros.tipo === "todos" ? "Todos" : filtros.tipo],
          ["Agrupación", filtros.agrupacion === "todas" ? "Todas" : filtros.agrupacion],
        ],
      },
      {
        titulo: "A · Cifras de encabezado",
        columnas: ["Indicador", "Valor"],
        filas: [
          [
            "1 · Promedio de actividades asistidas por estudiante",
            kpis.asistidas[indicePeriodo].toFixed(1),
          ],
          ["2 · En matrícula preferencial", `${kpis.preferencial[indicePeriodo]}%`],
          ["3 · Elegibilidad", `${kpis.elegibilidad[indicePeriodo]}%`],
          ["4 · Estudiantes en agrupaciones", kpis.estudiantes[indicePeriodo]],
          ["5 · Agrupaciones activas", kpis.agrupaciones[indicePeriodo]],
          ["6 · Actividades validadas", kpis.actividades[indicePeriodo]],
        ],
      },
      ...seccionesDelReporte(contexto),
    ];

    generarReportePdf(
      "PROCAD",
      "Estadísticas de Participación",
      secciones,
      "procad-estadisticas.pdf",
    );
  }

  const seccion = SECCIONES.find((s) => s.id === seccionActiva) ?? SECCIONES[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
          <h1 className="text-2xl font-bold text-balance break-words text-slate-800 sm:text-3xl">
            Estadísticas de Participación
          </h1>
        </div>

        <button
          type="button"
          onClick={exportarReporte}
          className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
        >
          <HiOutlineDocumentArrowDown className="h-4 w-4" />
          Exportar reporte (PDF)
        </button>
      </div>

      <p className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-slate-500">
        <HiOutlineEye className="mt-0.5 h-4 w-4 shrink-0 text-unah-navy" aria-hidden="true" />
        {/* Lo que sigue después de leer estas cifras depende de quién las lee:
            el administrador puede ir a resolver; Vicerrectoría no gestiona. */}
        <span>
          <b className="font-semibold text-unah-navy">Panel de consulta.</b>{" "}
          {rol === "administrador"
            ? "Aquí solo se leen cifras de participación; la gestión operativa —solicitudes, catálogos, usuarios— vive en los demás módulos de PROCAD."
            : "Vicerrectoría consulta las estadísticas de participación del programa. La gestión operativa —solicitudes, catálogos, usuarios— la realiza el administrador de PROCAD."}
        </span>
      </p>

      {/* Filtros: una sola fila arriba de todo, y todas las tarjetas se rehacen
          contra la misma rebanada de datos. */}
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[190px] flex-1">
            <label className={claseLabel} htmlFor="procad-periodo">
              Período
            </label>
            <select
              id="procad-periodo"
              value={filtros.periodo}
              onChange={(e) => cambiarFiltro({ periodo: e.target.value })}
              className={claseSelect}
            >
              {PERIODOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px] flex-1">
            <label className={claseLabel} htmlFor="procad-centro">
              Campus / centro regional
            </label>
            <select
              id="procad-centro"
              value={filtros.centro}
              onChange={(e) => cambiarFiltro({ centro: e.target.value })}
              className={claseSelect}
            >
              <option value="todos">Todos los centros</option>
              {CENTROS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px] flex-1">
            <label className={claseLabel} htmlFor="procad-tipo">
              Tipo
            </label>
            <select
              id="procad-tipo"
              value={filtros.tipo}
              onChange={(e) => cambiarFiltro({ tipo: e.target.value as TipoAgrupacion | "todos" })}
              className={claseSelect}
            >
              <option value="todos">Todos</option>
              <option value="deportivo">Deportivo</option>
              <option value="artistico">Artístico</option>
            </select>
          </div>

          <div className="min-w-[220px] flex-1">
            <label className={claseLabel} htmlFor="procad-agrupacion">
              Agrupación
            </label>
            <select
              id="procad-agrupacion"
              value={filtros.agrupacion}
              onChange={(e) => cambiarFiltro({ agrupacion: e.target.value })}
              className={claseSelect}
            >
              <option value="todas">Todas</option>
              {opcionesAgrupacion.map((a) => (
                <option key={a.nombre} value={a.nombre}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setFiltros(FILTROS_INICIALES)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-[color,background-color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
          >
            <HiOutlineXMark className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </div>

      {/* A · Cifras de encabezado */}
      <section aria-label="Cifras de encabezado">
        <p className="mb-3 text-xs text-slate-500">
          <span className="font-bold text-unah-orange">A.</span> Cifras de encabezado, cada una con
          su variación respecto al período anterior.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiProcad
            numero="1"
            etiqueta="Promedio de actividades asistidas por estudiante"
            valor={kpis.asistidas[indicePeriodo].toFixed(1)}
            serie={kpis.asistidas}
            indiceActivo={indicePeriodo}
            requisito="RF-24"
          />
          <KpiProcad
            numero="2"
            etiqueta="En matrícula preferencial"
            valor={`${kpis.preferencial[indicePeriodo]}%`}
            serie={kpis.preferencial}
            indiceActivo={indicePeriodo}
            sufijoDelta=" pp"
            requisito="RF-24"
          />
          <KpiProcad
            numero="3"
            etiqueta="Elegibilidad"
            valor={`${kpis.elegibilidad[indicePeriodo]}%`}
            serie={kpis.elegibilidad}
            indiceActivo={indicePeriodo}
            sufijoDelta=" pp"
          />
          <KpiProcad
            numero="4"
            etiqueta="Estudiantes en agrupaciones"
            valor={String(kpis.estudiantes[indicePeriodo])}
            serie={kpis.estudiantes}
            indiceActivo={indicePeriodo}
            destacada
          />
          <KpiProcad
            numero="5"
            etiqueta="Agrupaciones activas"
            valor={String(kpis.agrupaciones[indicePeriodo])}
            serie={kpis.agrupaciones}
            indiceActivo={indicePeriodo}
          />
          <KpiProcad
            numero="6"
            etiqueta="Actividades validadas"
            valor={String(kpis.actividades[indicePeriodo])}
            serie={kpis.actividades}
            indiceActivo={indicePeriodo}
          />
        </div>
      </section>

      {/* Secciones B–G */}
      <div>
        <div
          role="tablist"
          aria-label="Secciones de estadísticas"
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            moverPestana(e.key === "ArrowRight" ? 1 : -1);
          }}
          className="table-scrollbar flex gap-1 overflow-x-auto border-b border-slate-200"
        >
          {SECCIONES.map((s) => {
            const activa = s.id === seccionActiva;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  refsPestanas.current[s.id] = el;
                }}
                type="button"
                role="tab"
                id={`pestana-${s.id}`}
                aria-selected={activa}
                aria-controls="panel-seccion"
                tabIndex={activa ? 0 : -1}
                onClick={() => setSeccionActiva(s.id)}
                className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
                  activa
                    ? "border-unah-orange text-unah-navy"
                    : "border-transparent text-slate-500 hover:text-unah-navy"
                }`}
              >
                <span className={activa ? "text-unah-orange" : "text-slate-400"}>{s.id}</span>
                {s.label}
              </button>
            );
          })}
        </div>

        <div
          id="panel-seccion"
          role="tabpanel"
          aria-labelledby={`pestana-${seccion.id}`}
          className="pt-5"
        >
          <p className="mb-4 text-xs text-slate-500">{seccion.intro}</p>
          {seccionActiva === "B" && <SeccionB ctx={contexto} />}
          {seccionActiva === "C" && <SeccionC ctx={contexto} />}
          {seccionActiva === "D" && <SeccionD ctx={contexto} />}
          {seccionActiva === "E" && <SeccionE ctx={contexto} />}
          {seccionActiva === "F" && <SeccionF ctx={contexto} />}
          {seccionActiva === "G" && <SeccionG ctx={contexto} />}
        </div>
      </div>
    </div>
  );
}
