import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineDocumentArrowDown,
  HiOutlineLink,
  HiOutlinePrinter,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { ProveedorVisibilidad } from "./visibilidadTarjetas";
import SeccionA from "./secciones/SeccionA";
import SeccionB from "./secciones/SeccionB";
import SeccionC from "./secciones/SeccionC";
import SeccionD from "./secciones/SeccionD";
import SeccionE from "./secciones/SeccionE";
import SeccionF from "./secciones/SeccionF";
import SeccionG from "./secciones/SeccionG";
import { construirContexto } from "./secciones/contexto";
import { seriesDeEncabezado } from "./secciones/datos";
import { bloquesDeSeleccion } from "./secciones/pdf";
import { APARTADOS, CATALOGO_TARJETAS, NUMEROS_TARJETAS } from "./secciones/catalogoTarjetas";
import {
  PARAM_DESCARGA,
  PARAM_PERSONALIZAR,
  PARAM_VISTA,
  RUTA_PANEL,
  construirConsulta,
  filtrosDesdeParametros,
  modoDesdeParametros,
  numerosDesdeParametros,
  type ModoReporte,
} from "./enlaceReporte";
import TablasDelReporte from "./TablasDelReporte";
import ChipsFiltro from "../../components/procad/ChipsFiltro";
import { generarReportePdf } from "../../utils/exportarPdf";
import { nombreDeReporte } from "../../utils/nombreDeReporte";
import { SELLO_PROCAD } from "./reportePdf";
import { generarPdfDeGraficas, type ApartadoImprimible } from "../../utils/exportarGraficasPdf";
import { useUsuarioActual } from "../../context/UserContext";
import { PERIODOS } from "../../data/mockProcadEstadisticas";
import type { ContextoSeccion } from "./secciones/contexto";

const TITULO = "Reporte personalizado de estadísticas";
/** Cuando no se recortó nada, el documento no es «personalizado»: es el panel. */
const TITULO_COMPLETO = "Estadísticas de Participación";

/** Cada apartado con gráficas sabe dibujarse solo; A va aparte, son cifras. */
const SECCIONES: Record<string, (props: { ctx: ContextoSeccion }) => React.ReactNode> = {
  B: SeccionB,
  C: SeccionC,
  D: SeccionD,
  E: SeccionE,
  F: SeccionF,
  G: SeccionG,
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
      {children}
    </span>
  );
}

/**
 * El reporte personalizado: una página con solo las estadísticas que el usuario
 * eligió en el panel.
 *
 * Tiene dos modos y los dos salen de los mismos datos: las gráficas del panel
 * —las mismas tarjetas, con sus animaciones— o las cifras en tablas, que es la
 * forma que se adjunta a un oficio. Lo que se ve es lo que se imprime y lo que
 * se descarga; el modo elige el documento.
 *
 * Qué se muestra, con qué filtros y en qué modo vive en la URL, así que la
 * página se puede recargar, compartir o guardar en marcadores.
 */
export default function ReportePersonalizado() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const usuario = useUsuarioActual();
  const [copiado, setCopiado] = useState(false);
  /** Fotografiar las gráficas toma un momento; el aviso lo cuenta. */
  const [generando, setGenerando] = useState(false);
  const [avance, setAvance] = useState({ hechas: 0, total: 0 });
  const [falloPdf, setFalloPdf] = useState(false);
  const lienzo = useRef<HTMLDivElement>(null);

  const numeros = useMemo(() => numerosDesdeParametros(params), [params]);
  const modo = modoDesdeParametros(params);
  const filtros = useMemo(() => filtrosDesdeParametros(params), [params]);
  const contexto = useMemo(() => construirContexto(filtros), [filtros]);
  const kpis = useMemo(() => seriesDeEncabezado(contexto.datos), [contexto.datos]);

  const { indicePeriodo } = contexto;
  const ocultas = useMemo(() => NUMEROS_TARJETAS.filter((n) => !numeros.includes(n)), [numeros]);
  /** Se llega aquí con todo marcado desde «Exportar página PDF»; entonces no hay recorte que anunciar. */
  const titulo = ocultas.length === 0 ? TITULO_COMPLETO : TITULO;

  /** Los apartados que aportan algo a este reporte, en su orden de siempre. */
  const apartados = useMemo(
    () =>
      APARTADOS.filter((a) =>
        CATALOGO_TARJETAS.some((t) => t.seccion === a.id && numeros.includes(t.numero)),
      ),
    [numeros],
  );

  // Las tablas del reporte: las mismas que ve el modo tablas y las mismas que
  // se escriben en el PDF. Una sola lista, para que lo que se descarga no pueda
  // diferir de lo que se estaba viendo.
  const bloques = useMemo(
    () =>
      bloquesDeSeleccion(
        contexto,
        {
          asistidas: kpis.asistidas[indicePeriodo],
          preferencial: kpis.preferencial[indicePeriodo],
          elegibilidad: kpis.elegibilidad[indicePeriodo],
          estudiantes: kpis.estudiantes[indicePeriodo],
          agrupaciones: kpis.agrupaciones[indicePeriodo],
          actividades: kpis.actividades[indicePeriodo],
        },
        numeros,
      ),
    [contexto, kpis, indicePeriodo, numeros],
  );

  function volverAPersonalizar() {
    navigate(`${RUTA_PANEL}${construirConsulta(numeros, filtros, PARAM_PERSONALIZAR, modo)}`);
  }

  function cambiarModo(siguiente: ModoReporte) {
    const nuevos = new URLSearchParams(params);
    nuevos.set(PARAM_VISTA, siguiente);
    setParams(nuevos, { replace: true });
  }

  function descargarPdfDeTablas() {
    generarReportePdf("PROCAD", titulo, bloques, nombreDeReporte(), SELLO_PROCAD);
  }

  /** El recorte en una línea, para que el PDF de gráficas diga de dónde sale. */
  function resumenDeFiltros() {
    return [
      PERIODOS[indicePeriodo].label,
      filtros.centro === "todos" ? "Todos los centros" : filtros.centro,
      filtros.tipo === "todos" ? "Todo tipo" : filtros.tipo,
      filtros.agrupacion === "todas" ? "Todas las agrupaciones" : filtros.agrupacion,
    ].join("  ·  ");
  }

  // Las gráficas se fotografían de la propia página: es la única forma de que
  // el archivo salga igual a lo que se está viendo.
  async function descargarPdfDeGraficas() {
    if (!lienzo.current) return;
    setFalloPdf(false);
    setAvance({ hechas: 0, total: 0 });
    setGenerando(true);
    try {
      const apartadosAFoto: ApartadoImprimible[] = [
        ...lienzo.current.querySelectorAll("[data-apartado]"),
      ]
        .map((seccion) => ({
          titulo: (seccion as HTMLElement).dataset.apartado ?? "",
          tarjetas: [...seccion.querySelectorAll("[data-tarjeta],[data-kpi]")] as HTMLElement[],
        }))
        .filter((a) => a.tarjetas.length > 0);

      await generarPdfDeGraficas(
        "PROCAD",
        titulo,
        resumenDeFiltros(),
        apartadosAFoto,
        nombreDeReporte(),
        (hechas, total) => setAvance({ hechas, total }),
      );
    } catch {
      setFalloPdf(true);
    } finally {
      setGenerando(false);
    }
  }

  /**
   * Se llegó con la orden de descargar, desde «Exportar página PDF» del panel:
   * allá solo está montado el apartado de la pestaña activa, y una gráfica que
   * no está dibujada no se puede fotografiar, así que el trabajo se hace aquí,
   * donde están todas. El parámetro se borra antes de empezar para que recargar
   * o compartir el enlace no vuelva a disparar la descarga.
   */
  const descargaPedida = useRef(false);
  useEffect(() => {
    if (descargaPedida.current || !params.has(PARAM_DESCARGA)) return;
    descargaPedida.current = true;

    const limpios = new URLSearchParams(params);
    limpios.delete(PARAM_DESCARGA);
    setParams(limpios, { replace: true });

    // Un respiro para que la página se pinte: el fotógrafo espera a que las
    // gráficas animen, pero primero tienen que existir.
    setTimeout(() => {
      if (modo === "tablas") descargarPdfDeTablas();
      else void descargarPdfDeGraficas();
    }, 300);
    // Las dos descargas se recrean en cada render: meterlas en la lista haría
    // que el efecto se reevaluara siempre, y no hace falta —`descargaPedida` es
    // lo que garantiza que corra una sola vez, la primera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, setParams, modo]);

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles no hay nada que avisar: el enlace sigue
      // estando en la barra de direcciones, que es de donde saldría a mano.
    }
  }

  // El contenido se arma una sola vez por cada cambio real de datos y se
  // guarda como elemento. Mientras se genera el PDF, el contador de avance
  // hace re-renderizar la página treinta y tres veces; sin esto, cada una
  // volvería a dibujar las treinta y tres gráficas y la descarga pasaba de
  // veinte segundos a más de un minuto.
  const contenido = useMemo(
    () => (
          <div ref={lienzo} className="flex flex-col gap-6">
            {modo === "tablas" ? (
              <TablasDelReporte bloques={bloques} />
            ) : (
              apartados.map((apartado) => (
                <section
                  key={apartado.id}
                  aria-label={apartado.label}
                  // Sin la letra del apartado: es jerga de la especificación.
                  // Lo que encabeza es el punto naranja, como en las tarjetas.
                  data-apartado={apartado.label}
                >
                  <h2 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 rounded-full bg-unah-orange"
                    />
                    {apartado.label}
                  </h2>

                  {apartado.id === "A" ? (
                    <SeccionA kpis={kpis} indicePeriodo={indicePeriodo} soloNumeros={numeros} />
                  ) : (
                    // Cada apartado se dibuja con su propio componente, escondiendo
                    // lo que no se eligió: las tarjetas, sus gráficas y sus entradas
                    // escalonadas son exactamente las del panel.
                    <ProveedorVisibilidad
                      seccionActiva={apartado.id}
                      ocultasIniciales={ocultas}
                      soloLectura
                    >
                      {(() => {
                        const Seccion = SECCIONES[apartado.id];
                        return <Seccion ctx={contexto} />;
                      })()}
                    </ProveedorVisibilidad>
                  )}
                </section>
              ))
            )}
          </div>
    ),
    [modo, bloques, apartados, kpis, indicePeriodo, numeros, ocultas, contexto],
  );

  if (numeros.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white px-8 py-14 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <HiOutlineSquares2X2 className="h-7 w-7 text-unah-navy/50" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-bold text-slate-800">Este reporte no tiene estadísticas</h1>
        <p className="text-sm leading-relaxed text-slate-500">
          Un reporte personalizado se arma desde el panel: elija allí las estadísticas que quiere
          reunir y vuelva aquí con ellas.
        </p>
        <Link
          to={`${RUTA_PANEL}${construirConsulta([], filtros, PARAM_PERSONALIZAR)}`}
          className="mt-1 flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
        >
          <HiOutlineAdjustmentsHorizontal className="h-4 w-4" />
          Elegir estadísticas
        </Link>
      </div>
    );
  }

  return (
    // `reporte-procad` es la marca que enciende los estilos de impresión: van
    // condicionados a ella para que el resto de la plataforma imprima como
    // siempre.
    <div className="reporte-procad flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-4">
        <div className="min-w-0">
          <Link
            to={RUTA_PANEL}
            className="no-imprimir mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-unah-navy"
          >
            <HiOutlineArrowLeft className="h-3.5 w-3.5" />
            Estadísticas de Participación
          </Link>
          <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
          {/* El mismo criterio que el del PDF: si no se recortó nada, llamarlo
              «personalizado» sería mentir —es la página entera—. */}
          <h1 className="text-2xl font-bold text-balance break-words text-slate-800 sm:text-3xl">
            {ocultas.length === 0 ? "Todas las estadísticas" : "Reporte personalizado"}
          </h1>

          {/* El recorte del que salen las cifras y quién lo sacó, a la vista: un
              reporte que se imprime y circula tiene que decir de qué período y
              de qué campus habla, sin depender de que alguien lo recuerde. */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Chip>
              {numeros.length} {numeros.length === 1 ? "estadística" : "estadísticas"}
            </Chip>
            <Chip>{PERIODOS[indicePeriodo].label}</Chip>
            <Chip>{filtros.centro === "todos" ? "Todos los centros" : filtros.centro}</Chip>
            {filtros.tipo !== "todos" && <Chip>{filtros.tipo}</Chip>}
            {filtros.agrupacion !== "todas" && <Chip>{filtros.agrupacion}</Chip>}
            <span className="text-[11px] text-slate-400">
              Generado el{" "}
              {new Date().toLocaleDateString("es-HN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              por <b className="font-semibold text-slate-500">{usuario.nombreCompleto}</b>
            </span>
          </div>
        </div>

        <div className="no-imprimir flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={volverAPersonalizar}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-[background-color,color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-unah-navy active:scale-[0.98]"
          >
            <HiOutlineAdjustmentsHorizontal className="h-4 w-4" />
            Seguir personalizando
          </button>
          <button
            type="button"
            onClick={copiarEnlace}
            title="Copiar el enlace de este reporte"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-[background-color,color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-unah-navy active:scale-[0.98]"
          >
            {copiado ? (
              <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
            ) : (
              <HiOutlineLink className="h-4 w-4" />
            )}
            {copiado ? "Enlace copiado" : "Copiar enlace"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            title={
              modo === "graficas"
                ? "Imprime esta página tal como se ve, con sus gráficas"
                : "Imprime estas tablas tal como se ven"
            }
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 shadow-sm transition-[background-color,color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-unah-navy active:scale-[0.98]"
          >
            <HiOutlinePrinter className="h-4 w-4" />
            Imprimir
          </button>

          {/* Los dos modos se descargan, cada uno como se ve: el de tablas se
              escribe fila por fila y el de gráficas se fotografía de esta misma
              página. Por eso el botón es uno solo. */}
          <button
            type="button"
            disabled={generando}
            onClick={modo === "tablas" ? descargarPdfDeTablas : descargarPdfDeGraficas}
            title={
              modo === "tablas"
                ? "Descarga estas mismas tablas como PDF"
                : "Descarga estas mismas gráficas como PDF"
            }
            className="flex items-center gap-2 rounded-full bg-unah-navy px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            <HiOutlineDocumentArrowDown className="h-4 w-4" />
            {generando ? "Preparando el PDF…" : "Descargar PDF"}
          </button>
        </div>
      </div>

      {/* Mientras se prepara, la página se recorre sola para que todas las
          gráficas se dibujen. Sin este aviso, ese recorrido parece que la
          pantalla se volvió loca; con él se entiende que está trabajando, y de
          paso no se toca nada a media faena. El aviso cuenta el avance, no el
          procedimiento: al usuario le importa cuánto falta, no cómo se hace. */}
      {generando && (
        <div className="no-imprimir fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            role="status"
            aria-live="polite"
            className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-white px-7 py-8 text-center shadow-xl"
          >
            <span className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-unah-navy"
                  style={{ animation: `punto-late 900ms ${i * 140}ms infinite ease-in-out` }}
                />
              ))}
            </span>
            <p className="text-sm font-bold text-slate-800">Preparando el PDF</p>
            <p className="text-xs leading-relaxed text-slate-500">
              {avance.total > 0
                ? `Armando el documento: ${avance.hechas} de ${avance.total} estadísticas.`
                : "Esto toma unos segundos."}
            </p>
          </div>
        </div>
      )}

      {falloPdf && (
        <p className="no-imprimir rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
          No se pudo armar el PDF con las gráficas en este navegador. Puede usar «Imprimir» y elegir
          «Guardar como PDF», o cambiar a «Cifras en tablas» y descargarlo desde ahí.
        </p>
      )}

      {/* Los dos modos del mismo reporte. Lo que se ve aquí es lo que sale por
          la impresora o por el archivo: el modo elige el documento. */}
      <div className="no-imprimir flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="text-xs font-semibold text-slate-500">Ver este reporte como</span>
        <ChipsFiltro
          etiqueta="Modo del reporte"
          activa={modo}
          onCambiar={cambiarModo}
          opciones={[
            { id: "graficas", label: "Gráficas" },
            { id: "tablas", label: "Cifras en tablas" },
          ]}
        />
        <span className="text-[11px] leading-relaxed text-slate-400">
          {modo === "graficas"
            ? "Las mismas gráficas del panel. Se imprime y se descarga tal cual se ve."
            : "Las mismas cifras en tablas, como se adjuntan a un oficio. Es exactamente lo que lleva el PDF."}
        </span>
      </div>

      {contenido}

      {/* Solo en papel: repite el sello al cierre, igual que el pie del PDF. */}
      <p className="solo-impresion border-t border-slate-200 pt-3 text-[10px] text-slate-500">
        Impreso por {usuario.nombreCompleto} ({usuario.nombreUsuario}) el{" "}
        {new Date().toLocaleString("es-HN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        · PROCAD — Becas VOAE, UNAH
      </p>

      <p className="no-imprimir text-center text-[11px] leading-relaxed text-slate-400">
        Las cifras son las mismas en los dos modos: cambia la forma de mostrarlas, no el dato.
      </p>
    </div>
  );
}
