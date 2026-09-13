import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  HiOutlineCheckCircle,
  HiOutlineDocumentArrowDown,
  HiOutlineDocumentChartBar,
  HiOutlineEye,
  HiOutlineXMark,
} from "react-icons/hi2";
import TarjetasOcultas from "./TarjetasOcultas";
import DialogoFormatoPdf from "../../components/procad/DialogoFormatoPdf";
import { ProveedorVisibilidad, useVisibilidadTarjetas } from "./visibilidadTarjetas";
import { ProveedorArrastre } from "./arrastreTarjetas";
import SeccionA from "./secciones/SeccionA";
import SeccionB from "./secciones/SeccionB";
import SeccionC from "./secciones/SeccionC";
import SeccionD from "./secciones/SeccionD";
import SeccionE from "./secciones/SeccionE";
import SeccionF from "./secciones/SeccionF";
import SeccionG from "./secciones/SeccionG";
import { construirContexto } from "./secciones/contexto";
import { seriesDeEncabezado } from "./secciones/datos";
import { bloquesDelReporte } from "./secciones/pdf";
import { ContextoSeleccion, type ValorSeleccion } from "./seleccionReporte";
import {
  FILTROS_INICIALES,
  PARAM_DESCARGA,
  PARAM_PERSONALIZAR,
  RUTA_REPORTE,
  construirConsulta,
  filtrosDesdeParametros,
  modoDesdeParametros,
  numerosDesdeParametros,
} from "./enlaceReporte";
import {
  CENTROS,
  PERIODOS,
  agrupacionesProcad,
} from "../../data/mockProcadEstadisticas";
import { agrupacionesDisponibles } from "../../utils/procadMetricas";
import { NUMEROS_TARJETAS, ordenarSeleccion } from "./secciones/catalogoTarjetas";
import { generarReportePdf } from "../../utils/exportarPdf";
import { nombreDeReporte } from "../../utils/nombreDeReporte";
import { SELLO_PROCAD } from "./reportePdf";
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

/** Letra del apartado → su nombre, para las listas que solo tienen la letra. */
const ETIQUETAS_SECCION: Record<string, string> = Object.fromEntries(
  SECCIONES.map((s) => [s.id, s.label]),
);


export default function EstadisticasProcad() {
  // El apartado activo vive aqui, fuera del proveedor, porque el proveedor lo
  // necesita para etiquetar cada tarjeta que se registra.
  const [seccionActiva, setSeccionActiva] = useState<IdSeccion>("B");

  return (
    <ProveedorVisibilidad seccionActiva={seccionActiva}>
      {/* Dentro de la visibilidad: el arrastre necesita saber reordenar. */}
      <ProveedorArrastre>
        <PanelEstadisticas seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} />
      </ProveedorArrastre>
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
  const { ocultas, catalogo, mostrarTodas } = useVisibilidadTarjetas();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // Se vuelve del reporte con «seguir personalizando»: la URL trae los filtros
  // con los que se armó y lo que ya estaba elegido, así que el panel arranca
  // como estaba y con el armador abierto.
  const volviendo = params.has(PARAM_PERSONALIZAR);
  const [filtros, setFiltros] = useState<FiltrosProcad>(() =>
    volviendo ? filtrosDesdeParametros(params) : FILTROS_INICIALES,
  );
  /**
   * Las métricas marcadas para el reporte, o `null` cuando no se está armando
   * ninguno. No hay ventana aparte: al entrar en este modo, el panel se
   * convierte en el armador.
   */
  const [seleccionadas, setSeleccionadas] = useState<string[] | null>(() =>
    volviendo ? numerosDesdeParametros(params, PARAM_PERSONALIZAR) : null,
  );
  const armando = seleccionadas !== null;
  /** Con qué modo se estaba viendo el reporte del que se volvió, si se volvió. */
  const [modoPrevio] = useState(() => modoDesdeParametros(params));
  const refsPestanas = useRef<Record<string, HTMLButtonElement | null>>({});
  /** +1 si la sección elegida está a la derecha de la anterior, -1 si a la izquierda. */
  const [direccion, setDireccion] = useState(1);
  /** Posición y ancho de la pestaña activa, para el subrayado que se desliza. */
  const [indicador, setIndicador] = useState({ x: 0, y: 0, ancho: 0 });
  /** Abierto mientras se elige con qué forma descargar la página. */
  const [eligiendoFormato, setEligiendoFormato] = useState(false);

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

  const contexto = useMemo(() => construirContexto(filtros), [filtros]);
  const kpis = useMemo(() => seriesDeEncabezado(contexto.datos), [contexto.datos]);
  const { indicePeriodo } = contexto;

  // Los parámetros se limpian en cuanto se leyeron: así recargar la página no
  // vuelve a abrir el armador, y la URL del panel queda como siempre.
  useEffect(() => {
    if (volviendo) setParams({}, { replace: true });
  }, [volviendo, setParams]);

  function moverPestana(direccion: 1 | -1) {
    const actual = SECCIONES.findIndex((s) => s.id === seccionActiva);
    const siguiente = SECCIONES[(actual + direccion + SECCIONES.length) % SECCIONES.length];
    irASeccion(siguiente.id);
    refsPestanas.current[siguiente.id]?.focus();
  }

  // Todo lo que el panel puede llevarse a un PDF, tabla por tabla.
  //
  // «Que se imprima como este»: un apartado del que se quitaron todas sus
  // tarjetas no aparece ni en el reporte completo ni en la lista del compuesto.
  // El recorte es por apartado y no por tarjeta porque las tablas del PDF
  // agrupan varias cifras en una sola —la de Participación lleva las cinco
  // juntas—, así que quitar una tarjeta suelta no tiene una fila que quitar.
  const bloques = useMemo(() => {
    const apartadosVacios = new Set(
      SECCIONES.filter((seccionPdf) => {
        const suyas = catalogo.filter((t) => t.seccion === seccionPdf.id);
        return suyas.length > 0 && suyas.every((t) => ocultas.includes(t.numero));
      }).map((seccionPdf) => seccionPdf.id as string),
    );

    return bloquesDelReporte(contexto, {
      asistidas: kpis.asistidas[indicePeriodo],
      preferencial: kpis.preferencial[indicePeriodo],
      elegibilidad: kpis.elegibilidad[indicePeriodo],
      estudiantes: kpis.estudiantes[indicePeriodo],
      agrupaciones: kpis.agrupaciones[indicePeriodo],
      actividades: kpis.actividades[indicePeriodo],
    }).filter((bloque) => !apartadosVacios.has(bloque.grupo));
  }, [contexto, kpis, indicePeriodo, catalogo, ocultas]);

  /**
   * La página entera en PDF, con las cifras en tablas. Sale de aquí mismo: las
   * tablas se escriben con los datos, no se fotografían, así que no hace falta
   * tener dibujado ningún apartado.
   */
  function exportarCifras() {
    setEligiendoFormato(false);
    generarReportePdf(
      "PROCAD",
      "Estadísticas de Participación",
      bloques,
      nombreDeReporte(),
      SELLO_PROCAD,
    );
  }

  /**
   * La página entera en PDF, con sus gráficas.
   *
   * El panel tiene montado solo el apartado de la pestaña activa —los demás ni
   * existen en la página—, y una gráfica que no está dibujada no se puede
   * fotografiar. Así que la descarga se delega en la página del reporte, que
   * dibuja todos los apartados de una vez: se abre con todo lo que hay en
   * pantalla marcado y con la orden de descargar al terminar de dibujarse.
   */
  function exportarGraficas() {
    setEligiendoFormato(false);
    const visibles = NUMEROS_TARJETAS.filter((n) => !ocultas.includes(n));
    navigate(
      `${RUTA_REPORTE}${construirConsulta(visibles, filtros, undefined, "graficas")}&${PARAM_DESCARGA}=1`,
    );
  }

  // Entrar a armar devuelve las tarjetas quitadas: si una no está en pantalla
  // no se puede marcar, y encontrarse con que «falta» una estadística sin saber
  // por qué sería peor que recuperar el panel completo.
  function empezarAArmar() {
    mostrarTodas();
    setSeleccionadas([]);
  }

  const valorSeleccion = useMemo<ValorSeleccion>(
    () => ({
      activo: armando,
      estaSeleccionada: (numero) => seleccionadas?.includes(numero) ?? false,
      alternar: (numero) =>
        setSeleccionadas((previo) =>
          previo === null
            ? previo
            : previo.includes(numero)
              ? previo.filter((n) => n !== numero)
              : [...previo, numero],
        ),
    }),
    [armando, seleccionadas],
  );

  // El reporte personalizado no se dibuja aquí: la selección y los filtros se
  // van en la URL y el reporte es otra página, que se puede recargar, guardar
  // en marcadores o compartir.
  function generarPersonalizado() {
    if (!seleccionadas || seleccionadas.length === 0) return;
    // El modo del reporte —gráficas o tablas— vuelve como venía: si se llegó
    // aquí desde un reporte en tablas, al regenerarlo sigue en tablas.
    navigate(
      `${RUTA_REPORTE}${construirConsulta(ordenarSeleccion(seleccionadas), filtros, undefined, modoPrevio)}`,
    );
  }

  const seccion = SECCIONES.find((s) => s.id === seccionActiva) ?? SECCIONES[0];

  return (
    <ContextoSeleccion.Provider value={valorSeleccion}>
    {/* El hueco de abajo es para la barra flotante: sin el, la ultima fila de
        tarjetas se queda debajo de ella y no hay forma de marcarla. */}
    <div className={`flex flex-col gap-5 ${armando ? "pb-24" : ""}`}>
      {/* Encabezado: el titulo y los cuatro filtros en una sola franja. Antes
          los filtros ocupaban una tarjeta propia y, con el aviso, la primera
          pantalla se iba entera en controles sin mostrar un solo dato.

          Mientras se arma un reporte, el titulo cede su sitio a la instruccion:
          el panel deja de ser algo que se lee y pasa a ser algo que se marca,
          asi que quien manda en la pantalla es esa instruccion. Los filtros se
          quedan, porque el recorte tambien se elige aqui. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        {armando ? (
          <div className="panel-entra min-w-0 max-w-2xl">
            <p className="text-xs font-bold tracking-wider text-unah-orange">
              REPORTE PERSONALIZADO
            </p>
            <h1 className="text-2xl font-bold text-balance break-words text-slate-800 sm:text-3xl">
              Seleccione lo que quiere personalizar
            </h1>
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
              <HiOutlineCheckCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-unah-orange"
                aria-hidden="true"
              />
              <span>
                Pulse las estadísticas que quiere incluir: las cifras de arriba y las gráficas de
                cualquier apartado. Lo marcado se conserva al cambiar de apartado y al cambiar los
                filtros.{" "}
                <button
                  type="button"
                  onClick={() => setSeleccionadas(null)}
                  className="font-semibold text-unah-navy underline-offset-2 transition-colors hover:text-unah-orange hover:underline"
                >
                  Cancelar
                </button>
              </span>
            </p>
          </div>
        ) : (
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
        )}

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

          {/* Las dos formas de exportar van juntas en su propia caja: cuando la
              fila no cabe, bajan las dos de una vez en vez de partirse y dejar
              una arriba con los filtros y la otra sola en el renglón de abajo. */}
          {!armando && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={empezarAArmar}
              title="Elegir estadísticas y armar un reporte solo con ellas"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-[background-color,color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-unah-navy active:scale-[0.98]"
            >
              <HiOutlineDocumentChartBar className="h-4 w-4" />
              Reporte personalizado
            </button>

            <button
              type="button"
              onClick={() => setEligiendoFormato(true)}
              title="Descargar toda la página, con los filtros y las tarjetas que tenés ahora"
              className="flex items-center gap-2 rounded-full bg-unah-navy px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
            >
              <HiOutlineDocumentArrowDown className="h-4 w-4" />
              Exportar página PDF
            </button>
          </div>
          )}
        </div>
      </div>

      {/* A · Cifras de encabezado */}
      <section aria-label="Cifras de encabezado">
        <p className="mb-3 text-xs text-slate-500">
          Cifras de encabezado, cada una con su variación respecto al período anterior.
        </p>
        <SeccionA kpis={kpis} indicePeriodo={indicePeriodo} />
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
              {!armando && <TarjetasOcultas etiquetasSeccion={ETIQUETAS_SECCION} />}
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

      {/* Aparece en cuanto hay una marcada, abajo a la derecha: mientras se
          recorren los apartados no estorba, y cuando ya hay algo que generar
          esta siempre a mano sin tener que volver arriba. */}
      {seleccionadas !== null && seleccionadas.length > 0 && (
        // Entra con rebote y en navy, no en blanco: sobre un panel que es todo
        // tarjetas claras, una barra clara se confundía con una más. Oscura y
        // con el naranja institucional adentro, se lee como lo único que hay
        // que pulsar cuando ya se eligió.
        <motion.div
          initial={{ opacity: 0, transform: "translateY(20px) scale(0.96)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.42 }}
          className="fixed bottom-6 right-6 z-40 flex max-w-[calc(100vw-3rem)] items-center gap-2 rounded-full border border-unah-navy-dark bg-unah-navy p-2 shadow-2xl shadow-unah-navy/35"
        >
          {/* Cancelar también desde aquí: al final de un apartado largo, el
              enlace de arriba queda fuera de la pantalla. */}
          <button
            type="button"
            onClick={() => setSeleccionadas(null)}
            aria-label="Cancelar el reporte personalizado"
            title="Cancelar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors duration-150 hover:bg-white/15 hover:text-white"
          >
            <HiOutlineXMark className="h-4 w-4" />
          </button>
          <span className="hidden pl-1 text-xs font-semibold text-white/70 sm:inline">
            <b className="text-white">{seleccionadas.length}</b>{" "}
            {seleccionadas.length === 1 ? "estadística" : "estadísticas"}
          </span>
          <button
            type="button"
            onClick={generarPersonalizado}
            className="flex items-center gap-2 rounded-full bg-unah-orange px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-unah-orange/30 transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-orange-dark active:scale-[0.98]"
          >
            <HiOutlineDocumentChartBar className="h-4.5 w-4.5" />
            Generar reporte personalizado
          </button>
        </motion.div>
      )}

      <DialogoFormatoPdf
        abierto={eligiendoFormato}
        onCerrar={() => setEligiendoFormato(false)}
        onGraficas={exportarGraficas}
        onCifras={exportarCifras}
      />
    </div>
    </ContextoSeleccion.Provider>
  );
}
