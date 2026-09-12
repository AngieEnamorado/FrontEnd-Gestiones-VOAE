import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentCheck,
  HiOutlineDocumentArrowDown,
  HiOutlineEye,
  HiOutlineTrophy,
  HiOutlineUserGroup,
  HiOutlineXMark,
} from "react-icons/hi2";
import KpiProcad from "../../components/procad/KpiProcad";
import TarjetasOcultas from "./TarjetasOcultas";
import { ProveedorVisibilidad, useVisibilidadTarjetas } from "./visibilidadTarjetas";
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

/* Los filtros ya no son campos de formulario con su etiqueta encima, sino
   pildoras en la barra superior: se leen como controles del panel, no como un
   formulario que hay que llenar antes de ver nada.

   Cada pildora lleva un ancho fijo, el de su valor por defecto. Un <select>
   normal se dimensiona por su opcion mas larga —por eso «Todos los centros»
   ocupaba el ancho de «Campus Cortes / Valle de Sula (CURC)»—, y dejarlo medir
   su contenido hacia que la fila se recolocara con cada eleccion. Fijo, la fila
   no se mueve nunca: lo que no cabe se corta con puntos suspensivos. */
const clasePildora =
  "cursor-pointer truncate rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:text-slate-800";

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


export default function EstadisticasProcad() {
  // El apartado activo vive aqui, fuera del proveedor, porque el proveedor lo
  // necesita para etiquetar cada tarjeta que se registra.
  const [seccionActiva, setSeccionActiva] = useState<IdSeccion>("B");

  return (
    <ProveedorVisibilidad seccionActiva={seccionActiva}>
      <PanelEstadisticas seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} />
    </ProveedorVisibilidad>
  );
}

function PanelEstadisticas({
  seccionActiva,
  setSeccionActiva,
}: {
  seccionActiva: IdSeccion;
  setSeccionActiva: (id: IdSeccion) => void;
}) {
  const { rol } = useRolProcad();
  const { ocultas, catalogo } = useVisibilidadTarjetas();
  const [filtros, setFiltros] = useState<FiltrosProcad>(FILTROS_INICIALES);
  const refsPestanas = useRef<Record<string, HTMLButtonElement | null>>({});
  /** +1 si la sección elegida está a la derecha de la anterior, -1 si a la izquierda. */
  const [direccion, setDireccion] = useState(1);
  /** Posición y ancho de la pestaña activa, para el subrayado que se desliza. */
  const [indicador, setIndicador] = useState({ x: 0, y: 0, ancho: 0 });

  function irASeccion(id: IdSeccion) {
    if (id === seccionActiva) return;
    const desde = SECCIONES.findIndex((s) => s.id === seccionActiva);
    const hasta = SECCIONES.findIndex((s) => s.id === id);
    setDireccion(hasta > desde ? 1 : -1);
    setSeccionActiva(id);
  }

  // El subrayado se mide del botón real en vez de dibujarse dentro de él: uno
  // solo que se desplaza se lee como un objeto que viaja, mientras que un borde
  // por botón solo puede aparecer y desaparecer. `useLayoutEffect` para medir
  // antes de pintar y que nunca arranque desde una posición equivocada.
  useLayoutEffect(() => {
    function medir() {
      const boton = refsPestanas.current[seccionActiva];
      if (boton)
        setIndicador({
          x: boton.offsetLeft,
          y: boton.offsetTop + boton.offsetHeight - 2,
          ancho: boton.offsetWidth,
        });
    }
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [seccionActiva]);

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
    irASeccion(siguiente.id);
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

    // «Que se imprima como este»: un apartado del que se quitaron todas sus
    // tarjetas no aparece en el reporte. El recorte es por apartado y no por
    // tarjeta porque las tablas del PDF agrupan varias cifras en una sola —la
    // de Participacion lleva las cinco juntas—, asi que quitar una tarjeta
    // suelta no tiene una fila que corresponda.
    const apartadosVacios = new Set(
      SECCIONES.filter((seccionPdf) => {
        const suyas = catalogo.filter((t) => t.seccion === seccionPdf.id);
        return suyas.length > 0 && suyas.every((t) => ocultas.includes(t.numero));
      }).map((seccionPdf) => seccionPdf.id as string),
    );

    generarReportePdf(
      "PROCAD",
      "Estadísticas de Participación",
      secciones.filter((bloque) => !apartadosVacios.has(bloque.titulo.slice(0, 1))),
      "procad-estadisticas.pdf",
    );
  }

  const seccion = SECCIONES.find((s) => s.id === seccionActiva) ?? SECCIONES[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado: el titulo y los cuatro filtros en una sola franja. Antes
          los filtros ocupaban una tarjeta propia y, con el aviso, la primera
          pantalla se iba entera en controles sin mostrar un solo dato. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
          <h1 className="text-2xl font-bold text-balance break-words text-slate-800 sm:text-3xl">
            Estadísticas de Participación
          </h1>
          {/* Lo que sigue después de leer estas cifras depende de quién las lee:
              el administrador puede ir a resolver; Vicerrectoría no gestiona. */}
          <p className="mt-1.5 flex max-w-2xl items-start gap-1.5 text-xs leading-relaxed text-slate-500">
            <HiOutlineEye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-unah-navy" aria-hidden="true" />
            <span>
              <b className="font-semibold text-unah-navy">Panel de consulta.</b>{" "}
              {rol === "administrador"
                ? "Aquí solo se leen cifras de participación; la gestión operativa vive en los demás módulos de PROCAD."
                : "Vicerrectoría consulta las estadísticas del programa; la gestión operativa la realiza el administrador."}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Período"
            value={filtros.periodo}
            onChange={(e) => cambiarFiltro({ periodo: e.target.value })}
            className={`${clasePildora} w-[212px]`}
          >
            {PERIODOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Campus o centro regional"
            value={filtros.centro}
            onChange={(e) => cambiarFiltro({ centro: e.target.value })}
            className={`${clasePildora} w-[168px]`}
          >
            <option value="todos">Todos los centros</option>
            {CENTROS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Tipo de agrupación"
            value={filtros.tipo}
            onChange={(e) => cambiarFiltro({ tipo: e.target.value as TipoAgrupacion | "todos" })}
            className={`${clasePildora} w-[112px]`}
          >
            <option value="todos">Todo tipo</option>
            <option value="deportivo">Deportivo</option>
            <option value="artistico">Artístico</option>
          </select>

          <select
            aria-label="Agrupación"
            value={filtros.agrupacion}
            onChange={(e) => cambiarFiltro({ agrupacion: e.target.value })}
            className={`${clasePildora} w-[204px]`}
          >
            <option value="todas">Todas las agrupaciones</option>
            {opcionesAgrupacion.map((a) => (
              <option key={a.nombre} value={a.nombre}>
                {a.nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFiltros(FILTROS_INICIALES)}
            title="Limpiar filtros"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-500 shadow-sm transition-[color,background-color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
          >
            <HiOutlineXMark className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Limpiar</span>
          </button>

          <button
            type="button"
            onClick={exportarReporte}
            className="flex items-center gap-2 rounded-full bg-unah-navy px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
          >
            <HiOutlineDocumentArrowDown className="h-4 w-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* A · Cifras de encabezado */}
      <section aria-label="Cifras de encabezado">
        <p className="mb-3 text-xs text-slate-500">
          Cifras de encabezado, cada una con su variación respecto al período anterior.
        </p>
        <div className="entra-escalonado grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiProcad
            numero="1"
            etiqueta="Promedio de actividades asistidas por estudiante"
            icono={HiOutlineCalendarDays}
            tono="azul"
            valor={kpis.asistidas[indicePeriodo]}
            decimales={1}
            serie={kpis.asistidas}
            indiceActivo={indicePeriodo}
            requisito="RF-24"
          />
          <KpiProcad
            numero="4"
            etiqueta="Estudiantes en agrupaciones"
            icono={HiOutlineUserGroup}
            tono="destacada"
            valor={kpis.estudiantes[indicePeriodo]}
            serie={kpis.estudiantes}
            indiceActivo={indicePeriodo}
          />
          <KpiProcad
            numero="2"
            etiqueta="En matrícula preferencial"
            icono={HiOutlineAcademicCap}
            tono="ambar"
            valor={kpis.preferencial[indicePeriodo]}
            sufijo="%"
            serie={kpis.preferencial}
            indiceActivo={indicePeriodo}
            sufijoDelta=" pp"
            requisito="RF-24"
          />
          <KpiProcad
            numero="3"
            etiqueta="Elegibilidad"
            icono={HiOutlineCheckBadge}
            tono="esmeralda"
            valor={kpis.elegibilidad[indicePeriodo]}
            sufijo="%"
            serie={kpis.elegibilidad}
            indiceActivo={indicePeriodo}
            sufijoDelta=" pp"
          />
          <KpiProcad
            numero="5"
            etiqueta="Agrupaciones activas"
            icono={HiOutlineTrophy}
            tono="violeta"
            valor={kpis.agrupaciones[indicePeriodo]}
            serie={kpis.agrupaciones}
            indiceActivo={indicePeriodo}
          />
          <KpiProcad
            numero="6"
            etiqueta="Actividades validadas"
            icono={HiOutlineClipboardDocumentCheck}
            tono="cielo"
            valor={kpis.actividades[indicePeriodo]}
            serie={kpis.actividades}
            indiceActivo={indicePeriodo}
          />
        </div>
      </section>

      {/* Las seis secciones. El margen extra las separa de las cifras: sin el,
          la tira de pestañas se pega a la ultima fila de tarjetas y parece
          parte de ellas. */}
      <div className="mt-3">
        <p className="mb-2 text-center text-[11px] text-slate-400">
          Elige un apartado para ver sus gráficas
        </p>

        <div
          role="tablist"
          aria-label="Secciones de estadísticas"
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            moverPestana(e.key === "ArrowRight" ? 1 : -1);
          }}
          className="relative flex flex-wrap justify-center gap-x-1 border-b border-slate-200"
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
                onClick={() => irASeccion(s.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
                  activa ? "text-unah-navy" : "text-slate-500 hover:text-unah-navy"
                }`}
              >
                {s.label}
              </button>
            );
          })}

          {/* Se mueve con transform y no con `left`/`width`: así el navegador no
              rehace el diseño en cada fotograma. El ancho sale de escalar una
              barra de 1px, con el origen a la izquierda. */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 h-0.5 w-px origin-left rounded-full bg-unah-orange transition-transform duration-[280ms] ease-mueve"
            style={{
              transform: `translate3d(${indicador.x}px, ${indicador.y}px, 0) scaleX(${indicador.ancho})`,
            }}
          />
        </div>

        <div
          id="panel-seccion"
          role="tabpanel"
          aria-labelledby={`pestana-${seccion.id}`}
          className="pt-5"
        >
          <div
            key={seccionActiva}
            className="panel-entra"
            style={{ "--direccion": direccion } as React.CSSProperties}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <p className="text-xs text-slate-500">{seccion.intro}</p>
              <TarjetasOcultas
                etiquetasSeccion={Object.fromEntries(SECCIONES.map((x) => [x.id, x.label]))}
              />
            </div>
            {seccionActiva === "B" && <SeccionB ctx={contexto} />}
            {seccionActiva === "C" && <SeccionC ctx={contexto} />}
            {seccionActiva === "D" && <SeccionD ctx={contexto} />}
            {seccionActiva === "E" && <SeccionE ctx={contexto} />}
            {seccionActiva === "F" && <SeccionF ctx={contexto} />}
            {seccionActiva === "G" && <SeccionG ctx={contexto} />}
          </div>
        </div>
      </div>
    </div>
  );
}
