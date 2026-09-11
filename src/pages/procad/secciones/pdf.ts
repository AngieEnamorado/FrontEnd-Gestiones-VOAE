import type { SeccionReportePdf } from "../../../utils/exportarPdf";
import { ETIQUETA_ESTADO } from "../../../components/procad/paleta";
import { MATRICULA_EXCEPCIONAL_TOTAL } from "../../../data/mockProcadEstadisticas";
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

function seccionB(ctx: ContextoSeccion): SeccionReportePdf[] {
  const asistencia = asistenciaPorAgrupacion(ctx);
  return [
    {
      titulo: "B · Participación y cumplimiento",
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

function seccionC(ctx: ContextoSeccion): SeccionReportePdf[] {
  return [
    {
      titulo: "C · Cobertura territorial",
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

function seccionD(ctx: ContextoSeccion): SeccionReportePdf[] {
  const pasos = pasosDelRecorrido(ctx);
  const estados = desgloseEstados(ctx);
  const razones = razonesDeAcceso(ctx);

  return [
    {
      titulo: "D · Recorrido de acceso al programa",
      columnas: ["Paso", "Estudiantes", "Conversión desde el inicio"],
      filas: pasos.map((p) => [p.label, p.valor, muestraPct(pctDe(p.valor, pasos[0].valor))]),
    },
    {
      titulo: "D · Solicitudes enviadas por estado",
      columnas: ["Estado", "Solicitudes", "%"],
      filas: estados.map((e) => [ETIQUETA_ESTADO[e.estado], e.valor, muestraPct(e.pct)]),
    },
    {
      titulo: "D · Tasa de aprobación por campus",
      columnas: ["Campus", "% aprobación"],
      filas: aprobacionPorCampus(ctx).map((f) => [f.nombre, muestraPct(f.valor)]),
    },
    {
      titulo: "D · Razones de acceso",
      columnas: ["Indicador", "Valor"],
      filas: [
        ["Aspirantes que cumplen el índice mínimo", muestraPct(razones.pctCumplenIndice)],
        ["Cobertura de visorías", muestraPct(razones.pctVisorias)],
      ],
    },
  ];
}

function seccionE(ctx: ContextoSeccion): SeccionReportePdf[] {
  const e = equidadYPermanencia(ctx);
  return [
    {
      titulo: "E · Equidad y permanencia",
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
      columnas: ["Carrera", "Estudiantes"],
      filas: participacionPorCarrera(ctx).map((c) => [c.nombre, c.valor ?? 0]),
    },
  ];
}

function seccionF(ctx: ContextoSeccion): SeccionReportePdf[] {
  if (ctx.datos.length === 0) return [];
  const series = seriesDeTendencia(ctx);
  return [
    {
      titulo: "F · Tendencia entre períodos",
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

function seccionG(ctx: ContextoSeccion): SeccionReportePdf[] {
  const { condicionados, conCondicionados, externos, selecciones } = casosEspeciales(ctx);

  const secciones: SeccionReportePdf[] = [
    {
      titulo: "G · Casos especiales",
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
      columnas: ["Agrupación", "Centro regional"],
      filas: externos.map((a) => [a.nombre, a.centro]),
    });
  }

  if (selecciones.length > 0) {
    secciones.push({
      titulo: "G · Selecciones multi-campus",
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

/** Las seis secciones del reporte, en el mismo orden que las pestañas. */
export function seccionesDelReporte(ctx: ContextoSeccion): SeccionReportePdf[] {
  return [
    ...seccionB(ctx),
    ...seccionC(ctx),
    ...seccionD(ctx),
    ...seccionE(ctx),
    ...seccionF(ctx),
    ...seccionG(ctx),
  ];
}
