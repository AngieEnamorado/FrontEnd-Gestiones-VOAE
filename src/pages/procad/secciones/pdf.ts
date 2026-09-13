import type { SeccionReportePdf } from "../../../utils/exportarPdf";
import { ETIQUETA_ESTADO } from "../../../components/procad/paleta";
import { MATRICULA_EXCEPCIONAL_TOTAL, PERIODOS } from "../../../data/mockProcadEstadisticas";
import { escalarConteo, escalarPct, muestraPct, pctDe, promedioODash } from "../../../utils/procadMetricas";
import type { ContextoSeccion } from "./contexto";
import {
  ETIQUETAS_PERIODO,
  aprobacionPorCampus,
  asistenciaPorAgrupacion,
  casosEspeciales,
  desgloseEstados,
  equidadYPermanencia,
  participacionPorCarrera,
  pasosDelRecorrido,
  promedioAsistidas,
  razonesDeAcceso,
  seriesDeTendencia,
} from "./datos";

// El reporte en PDF se arma con las mismas funciones de `datos.ts` que dibujan
// las tarjetas: si una cifra cambia en pantalla, cambia en el PDF, sin tener
// que acordarse de actualizar dos lugares.
//
// Cada tabla declara además de qué tarjetas sale (`tarjetas`). Una tabla suele
// juntar varias —la de Participación lleva cuatro columnas, una por tarjeta—,
// así que el PDF de un reporte personalizado incluye la tabla completa cuando
// al menos una de sus tarjetas fue elegida.

/** Una tabla del PDF, con las tarjetas del panel que resume. */
type TablaPdf = SeccionReportePdf & { tarjetas: string[] };

type ConstructorPdf = (ctx: ContextoSeccion) => TablaPdf[];

function seccionB(ctx: ContextoSeccion): TablaPdf[] {
  const asistencia = asistenciaPorAgrupacion(ctx);
  return [
    {
      titulo: "B · Participación y cumplimiento",
      tarjetas: ["7", "8", "9", "11"],
      columnas: [
        "Agrupación",
        "Prom. asistidas",
        "% elegibilidad",
        "% cumplimiento",
        "% asistencia",
      ],
      filas: ctx.datos.map((a, i) => [
        a.nombre,
        promedioODash(promedioAsistidas(a.asistencias, a.estudiantes, ctx.indicePeriodo)),
        muestraPct(escalarPct(a.elegibilidad, ctx.indicePeriodo)),
        muestraPct(escalarPct(a.cumplimiento, ctx.indicePeriodo)),
        muestraPct(asistencia[i]?.valor ?? null),
      ]),
    },
  ];
}

function seccionC(ctx: ContextoSeccion): TablaPdf[] {
  return [
    {
      titulo: "C · Cobertura territorial",
      tarjetas: ["13", "14", "15", "16", "17", "18"],
      columnas: [
        "Centro regional",
        "Grupos",
        "Estudiantes",
        "Actividades",
        "Deportivo",
        "Artístico",
        "% elegibilidad",
      ],
      filas: ctx.centros.map((c) => [
        c.nombre,
        c.grupos,
        c.estudiantes,
        c.actividades,
        c.estudiantesDeportivo,
        c.estudiantesArtistico,
        muestraPct(c.elegibilidad),
      ]),
    },
  ];
}

function seccionD(ctx: ContextoSeccion): TablaPdf[] {
  const pasos = pasosDelRecorrido(ctx);
  const estados = desgloseEstados(ctx);
  const razones = razonesDeAcceso(ctx);

  return [
    {
      titulo: "D · Recorrido de acceso al programa",
      tarjetas: ["19"],
      columnas: ["Paso", "Estudiantes", "Conversión desde el inicio"],
      filas: pasos.map((p) => [p.label, p.valor, muestraPct(pctDe(p.valor, pasos[0].valor))]),
    },
    {
      titulo: "D · Solicitudes enviadas por estado",
      tarjetas: ["19"],
      columnas: ["Estado", "Solicitudes", "%"],
      filas: estados.map((e) => [ETIQUETA_ESTADO[e.estado], e.valor, muestraPct(e.pct)]),
    },
    {
      titulo: "D · Tasa de aprobación por campus",
      tarjetas: ["20"],
      columnas: ["Campus", "% aprobación"],
      filas: aprobacionPorCampus(ctx).map((f) => [f.nombre, muestraPct(f.valor)]),
    },
    {
      titulo: "D · Razones de acceso",
      tarjetas: ["21", "22"],
      columnas: ["Indicador", "Valor"],
      filas: [
        ["Aspirantes que cumplen el índice mínimo", muestraPct(razones.pctCumplenIndice)],
        ["Cobertura de visorías", muestraPct(razones.pctVisorias)],
      ],
    },
  ];
}

function seccionE(ctx: ContextoSeccion): TablaPdf[] {
  const e = equidadYPermanencia(ctx);
  return [
    {
      titulo: "E · Equidad y permanencia",
      tarjetas: ["23", "25", "26"],
      columnas: ["Indicador", "Valor"],
      filas: [
        ["Integrantes en el filtro", e.estudiantes],
        ["Mujeres", `${e.mujeres} (${muestraPct(e.pctMujeres)})`],
        ["Hombres", `${e.hombres} (${muestraPct(e.pctHombres)})`],
        ["Expulsiones aprobadas", e.expulsiones],
        ["Retención", muestraPct(e.retencion)],
        ["Estudiantes PROSENE", `${e.prosene} (${muestraPct(e.pctProsene)})`],
      ],
    },
    {
      titulo: "E · Participación por carrera",
      tarjetas: ["24"],
      columnas: ["Carrera", "Estudiantes"],
      filas: participacionPorCarrera(ctx).map((c) => [c.nombre, c.valor ?? 0]),
    },
  ];
}

function seccionF(ctx: ContextoSeccion): TablaPdf[] {
  if (ctx.datos.length === 0) return [];
  const series = seriesDeTendencia(ctx);
  return [
    {
      titulo: "F · Tendencia entre períodos",
      tarjetas: ["27", "28"],
      columnas: ["Período", "% elegibilidad", "Estudiantes inscritos", "Actividades validadas"],
      filas: ETIQUETAS_PERIODO.map((etiqueta, i) => [
        etiqueta,
        `${series.elegibilidad[i]}%`,
        series.estudiantes[i],
        series.actividades[i],
      ]),
    },
  ];
}

function seccionG(ctx: ContextoSeccion): TablaPdf[] {
  const { condicionados, conCondicionados, externos, selecciones } = casosEspeciales(ctx);

  const secciones: TablaPdf[] = [
    {
      titulo: "G · Casos especiales",
      tarjetas: ["29", "30", "31", "32"],
      columnas: ["Indicador", "Valor"],
      filas: [
        ["Condicionados por excepción de talento", condicionados],
        ["Agrupaciones con colaborador externo", externos.length],
        ["Matrículas excepcionales otorgadas", MATRICULA_EXCEPCIONAL_TOTAL],
        ["Selecciones multi-campus activas", selecciones.length],
      ],
    },
  ];

  if (conCondicionados.length > 0) {
    secciones.push({
      titulo: "G · Agrupaciones con condicionados",
      tarjetas: ["29"],
      columnas: ["Agrupación", "Condicionados"],
      filas: conCondicionados.map((a) => [
        a.nombre,
        escalarConteo(a.condicionados, ctx.indicePeriodo),
      ]),
    });
  }

  if (externos.length > 0) {
    secciones.push({
      titulo: "G · Agrupaciones con colaborador externo",
      tarjetas: ["30"],
      columnas: ["Agrupación", "Centro regional"],
      filas: externos.map((a) => [a.nombre, a.centro]),
    });
  }

  if (selecciones.length > 0) {
    secciones.push({
      titulo: "G · Selecciones multi-campus",
      tarjetas: ["31"],
      columnas: ["Selección", "Campus administrativo", "Convocados"],
      filas: selecciones.map((s) => [
        s.nombre,
        s.centro,
        escalarConteo(s.estudiantes, ctx.indicePeriodo),
      ]),
    });
  }

  return secciones;
}

/** Las seis cifras de encabezado ya resueltas al período que se está viendo. */
export interface CifrasEncabezado {
  asistidas: number;
  preferencial: number;
  elegibilidad: number;
  estudiantes: number;
  agrupaciones: number;
  actividades: number;
}

/**
 * Una tabla del reporte, con la etiqueta que la ata a su apartado. El `id` es
 * lo que marca el usuario al armar el reporte; el `grupo` es la letra del
 * apartado, con la que se recorta lo que no se está viendo.
 */
export interface BloqueReporte extends TablaPdf {
  id: string;
  grupo: string;
}

function bloqueFiltros(ctx: ContextoSeccion): TablaPdf {
  const { filtros } = ctx;
  return {
    titulo: "Filtros aplicados",
    tarjetas: [],
    columnas: ["Filtro", "Valor"],
    filas: [
      ["Período", PERIODOS[ctx.indicePeriodo].label],
      ["Campus / centro regional", filtros.centro === "todos" ? "Todos" : filtros.centro],
      ["Tipo", filtros.tipo === "todos" ? "Todos" : filtros.tipo],
      ["Agrupación", filtros.agrupacion === "todas" ? "Todas" : filtros.agrupacion],
    ],
  };
}

/**
 * La tabla de cifras de encabezado. A diferencia del resto, esta sí se recorta
 * tarjeta por tarjeta: cada cifra es una fila suya, así que si el reporte lleva
 * dos de las seis, la tabla lleva esas dos.
 */
function bloqueEncabezado(cifras: CifrasEncabezado, numeros?: string[]): TablaPdf {
  const filas: { numero: string; fila: (string | number)[] }[] = [
    {
      numero: "1",
      fila: ["1 · Promedio de actividades asistidas por estudiante", cifras.asistidas.toFixed(1)],
    },
    { numero: "2", fila: ["2 · En matrícula preferencial", `${cifras.preferencial}%`] },
    { numero: "3", fila: ["3 · Elegibilidad", `${cifras.elegibilidad}%`] },
    { numero: "4", fila: ["4 · Estudiantes en agrupaciones", cifras.estudiantes] },
    { numero: "5", fila: ["5 · Agrupaciones activas", cifras.agrupaciones] },
    { numero: "6", fila: ["6 · Actividades validadas", cifras.actividades] },
  ];
  const elegidas = numeros ? filas.filter((f) => numeros.includes(f.numero)) : filas;

  return {
    titulo: "A · Cifras de encabezado",
    tarjetas: elegidas.map((f) => f.numero),
    columnas: ["Indicador", "Valor"],
    filas: elegidas.map((f) => f.fila),
  };
}

/** Los apartados que aportan tablas, en el mismo orden que las pestañas. */
const CONSTRUCTORES: { grupo: string; construir: ConstructorPdf }[] = [
  { grupo: "B", construir: seccionB },
  { grupo: "C", construir: seccionC },
  { grupo: "D", construir: seccionD },
  { grupo: "E", construir: seccionE },
  { grupo: "F", construir: seccionF },
  { grupo: "G", construir: seccionG },
];

/**
 * Todo lo que el panel puede llevarse a un PDF, tabla por tabla: el contexto
 * de los filtros, las cifras de encabezado y lo que aporta cada apartado.
 *
 * De aquí salen todos los reportes —el completo y el personalizado—, así que
 * uno no puede traer una cifra que el otro no tenga.
 */
export function bloquesDelReporte(ctx: ContextoSeccion, cifras: CifrasEncabezado): BloqueReporte[] {
  const bloques: BloqueReporte[] = [
    { id: "filtros", grupo: "filtros", ...bloqueFiltros(ctx) },
    { id: "A-1", grupo: "A", ...bloqueEncabezado(cifras) },
  ];

  for (const { grupo, construir } of CONSTRUCTORES) {
    construir(ctx).forEach((seccion, i) => {
      bloques.push({ id: `${grupo}-${i + 1}`, grupo, ...seccion });
    });
  }

  return bloques;
}

/**
 * Las tablas que le tocan a un reporte personalizado: las de las tarjetas
 * elegidas, más los filtros, que siempre encabezan el documento para que se
 * sepa de qué recorte salieron las cifras.
 */
export function bloquesDeSeleccion(
  ctx: ContextoSeccion,
  cifras: CifrasEncabezado,
  numeros: string[],
): BloqueReporte[] {
  const encabezado = bloqueEncabezado(cifras, numeros);
  const bloques: BloqueReporte[] = [{ id: "filtros", grupo: "filtros", ...bloqueFiltros(ctx) }];

  if (encabezado.filas.length > 0) {
    bloques.push({ id: "A-1", grupo: "A", ...encabezado });
  }

  for (const { grupo, construir } of CONSTRUCTORES) {
    construir(ctx).forEach((seccion, i) => {
      if (seccion.tarjetas.some((t) => numeros.includes(t))) {
        bloques.push({ id: `${grupo}-${i + 1}`, grupo, ...seccion });
      }
    });
  }

  return bloques;
}
