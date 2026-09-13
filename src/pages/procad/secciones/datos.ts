import type { FilaBarra } from "../../../components/procad/BarrasComparativas";
import type { PasoEmbudo } from "../../../components/procad/EmbudoAcceso";
import type { PuntoDispersion } from "../../../components/procad/Dispersion";
import { CARRERAS, CENTROS, PERIODOS } from "../../../data/mockProcadEstadisticas";
import {
  elegibilidadPromedio,
  escalarConteo,
  escalarPct,
  pctDe,
  pctSeguro,
  razon,
  suma,
  sumaSolicitudes,
  totalSolicitudes,
} from "../../../utils/procadMetricas";
import type { AgrupacionProcad, EstadoSolicitudProcad } from "../../../types";
import type { ContextoSeccion } from "./contexto";

// Todas las cifras que muestran las secciones B–G se derivan aquí, una sola
// vez. Las tarjetas y el PDF consumen estas mismas funciones, así que el
// reporte nunca puede decir algo distinto a lo que se ve en pantalla.

// ---------------------------------------------------------------------------
//  B · Participación y cumplimiento
// ---------------------------------------------------------------------------

export function promedioAsistidas(
  asistencias: number,
  estudiantes: number,
  indicePeriodo: number,
): number | null {
  const r = razon(
    escalarConteo(asistencias, indicePeriodo),
    escalarConteo(estudiantes, indicePeriodo),
  );
  return r === null ? null : Number(r.toFixed(1));
}

export function asistidasPorAgrupacion(ctx: ContextoSeccion): FilaBarra[] {
  return ctx.datos.map((a) => ({
    nombre: a.nombre,
    valor: promedioAsistidas(a.asistencias, a.estudiantes, ctx.indicePeriodo),
  }));
}

/**
 * Si hay una agrupación filtrada, esta tarjeta la resalta sobre el conjunto
 * amplio en vez de quedarse con una sola barra suelta.
 */
export function elegibilidadPorAgrupacion(ctx: ContextoSeccion): FilaBarra[] {
  const base = ctx.resaltada ? ctx.datosAmplios : ctx.datos;
  return base.map((a) => ({
    nombre: a.nombre,
    valor: escalarPct(a.elegibilidad, ctx.indicePeriodo),
  }));
}

export function cumplimientoPorAgrupacion(ctx: ContextoSeccion): FilaBarra[] {
  return ctx.datos.map((a) => ({
    nombre: a.nombre,
    valor: escalarPct(a.cumplimiento, ctx.indicePeriodo),
  }));
}

export function asistenciaPorAgrupacion(ctx: ContextoSeccion): FilaBarra[] {
  return ctx.datos.map((a) => ({
    nombre: a.nombre,
    valor: pctDe(a.asistencias, a.inscritos),
  }));
}

export function puntosElegibilidadCumplimiento(ctx: ContextoSeccion): PuntoDispersion[] {
  const puntos: PuntoDispersion[] = ctx.datos.map((a) => ({
    nombre: a.nombre,
    tipo: a.tipo,
    elegibilidad: escalarPct(a.elegibilidad, ctx.indicePeriodo),
    cumplimiento: escalarPct(a.cumplimiento, ctx.indicePeriodo),
  }));

  // Solo el caso más bajo en cumplimiento lleva etiqueta directa: es el único
  // que alguien tendría que ir a revisar. Etiquetar todos sería ruido.
  const peor = [...ctx.datos].sort((a, b) => a.cumplimiento - b.cumplimiento)[0];
  if (peor) {
    const punto = puntos.find((p) => p.nombre === peor.nombre);
    if (punto) punto.etiqueta = peor.nombre;
  }
  return puntos;
}

export function agrupacionesSinValidar(ctx: ContextoSeccion): string[] {
  return ctx.datos
    .filter((a) => escalarConteo(a.validadas, ctx.indicePeriodo) === 0)
    .map((a) => `${a.nombre} — ${a.centro}`);
}

// ---------------------------------------------------------------------------
//  C · Cobertura territorial
// ---------------------------------------------------------------------------

export function estudiantesPorAgrupacion(ctx: ContextoSeccion): FilaBarra[] {
  return ctx.datos.map((a) => ({
    nombre: a.nombre,
    valor: escalarConteo(a.estudiantes, ctx.indicePeriodo),
  }));
}

export function gruposPorCentro(ctx: ContextoSeccion): FilaBarra[] {
  return ctx.centros.map((c) => ({ nombre: c.nombre, valor: c.grupos }));
}

export function actividadesPorCentro(ctx: ContextoSeccion): FilaBarra[] {
  return ctx.centros.map((c) => ({ nombre: c.nombre, valor: c.actividades }));
}

export function distribucionPorTipo(ctx: ContextoSeccion) {
  const deportivas = ctx.datos.filter((a) => a.tipo === "deportivo");
  const artisticas = ctx.datos.filter((a) => a.tipo === "artistico");
  const estudiantesDeportivo = escalarConteo(suma(deportivas, "estudiantes"), ctx.indicePeriodo);
  const estudiantesArtistico = escalarConteo(suma(artisticas, "estudiantes"), ctx.indicePeriodo);
  return {
    gruposDeportivo: deportivas.length,
    gruposArtistico: artisticas.length,
    estudiantesDeportivo,
    estudiantesArtistico,
    total: estudiantesDeportivo + estudiantesArtistico,
  };
}

// ---------------------------------------------------------------------------
//  D · Acceso al programa
// ---------------------------------------------------------------------------

export function pasosDelRecorrido(ctx: ContextoSeccion): PasoEmbudo[] {
  const { datos, indicePeriodo } = ctx;
  return [
    {
      id: "aspirantes",
      label: "Aspirantes que consultaron el portal",
      corto: "Consultaron",
      valor: escalarConteo(suma(datos, "aspirantes"), indicePeriodo),
    },
    {
      id: "indice",
      label: "Cumplen el índice mínimo",
      corto: "Cumplen índice",
      valor: escalarConteo(suma(datos, "cumplenIndice"), indicePeriodo),
    },
    {
      id: "enviaron",
      label: "Enviaron solicitud",
      corto: "Enviaron",
      valor: escalarConteo(totalSolicitudes(datos), indicePeriodo),
    },
    {
      id: "citados",
      label: "Citados a visoría",
      corto: "Citados",
      valor: escalarConteo(suma(datos, "citados"), indicePeriodo),
    },
    {
      id: "aprobados",
      label: "Aprobados como integrantes",
      corto: "Aprobados",
      valor: escalarConteo(sumaSolicitudes(datos, "aprobada"), indicePeriodo),
    },
  ];
}

export interface FilaEstado {
  estado: EstadoSolicitudProcad;
  valor: number;
  pct: number | null;
}

export function desgloseEstados(ctx: ContextoSeccion): FilaEstado[] {
  const { datos, indicePeriodo } = ctx;
  const total = escalarConteo(totalSolicitudes(datos), indicePeriodo);
  const estados: EstadoSolicitudProcad[] = ["aprobada", "pendiente", "observada", "noCumple"];
  return estados.map((estado) => {
    const valor = escalarConteo(sumaSolicitudes(datos, estado), indicePeriodo);
    return { estado, valor, pct: pctDe(valor, total) };
  });
}

export function aprobacionPorCampus(ctx: ContextoSeccion): FilaBarra[] {
  return CENTROS.map((centro) => {
    const filas = ctx.datos.filter((a) => a.centro === centro);
    if (filas.length === 0) return null;
    return {
      nombre: centro,
      valor: pctDe(sumaSolicitudes(filas, "aprobada"), totalSolicitudes(filas)),
    };
  }).filter((f): f is FilaBarra => f !== null);
}

export function razonesDeAcceso(ctx: ContextoSeccion) {
  const aspirantes = suma(ctx.datos, "aspirantes");
  return {
    aspirantes: escalarConteo(aspirantes, ctx.indicePeriodo),
    pctCumplenIndice: pctDe(suma(ctx.datos, "cumplenIndice"), aspirantes),
    pctVisorias: pctDe(suma(ctx.datos, "citados"), aspirantes),
  };
}

// ---------------------------------------------------------------------------
//  E · Equidad y permanencia
// ---------------------------------------------------------------------------

export function equidadYPermanencia(ctx: ContextoSeccion) {
  const { datos, indicePeriodo } = ctx;
  const estudiantes = escalarConteo(suma(datos, "estudiantes"), indicePeriodo);
  const mujeres = escalarConteo(suma(datos, "sexoF"), indicePeriodo);
  const hombres = Math.max(0, estudiantes - mujeres);
  const expulsiones = escalarConteo(suma(datos, "expulsiones"), indicePeriodo);
  const prosene = escalarConteo(suma(datos, "prosene"), indicePeriodo);

  return {
    estudiantes,
    mujeres,
    hombres,
    pctMujeres: pctDe(mujeres, estudiantes),
    pctHombres: pctDe(hombres, estudiantes),
    expulsiones,
    retencion: estudiantes
      ? pctSeguro(Math.round((1 - expulsiones / estudiantes) * 100))
      : null,
    prosene,
    pctProsene: pctDe(prosene, estudiantes),
  };
}

export function participacionPorCarrera(ctx: ContextoSeccion): FilaBarra[] {
  return CARRERAS.map((nombre, i) => ({
    nombre,
    valor: escalarConteo(
      ctx.datos.reduce((acc, a) => acc + (a.carreras[i] || 0), 0),
      ctx.indicePeriodo,
    ),
  })).filter((c) => (c.valor ?? 0) > 0);
}

// ---------------------------------------------------------------------------
//  F · Tendencia
// ---------------------------------------------------------------------------

export const ETIQUETAS_PERIODO = PERIODOS.map((p) => p.label.replace(" (actual)", ""));

/**
 * Versión corta para el eje. "II Trimestre 2026" no cabe en los extremos del
 * gráfico y se recortaba; el nombre completo sigue apareciendo en el globo.
 */
export const ETIQUETAS_PERIODO_CORTAS = PERIODOS.map((p) =>
  p.label.replace(" (actual)", "").replace("Trimestre", "Tri."),
);

export function seriesDeTendencia(ctx: ContextoSeccion) {
  const { datos } = ctx;
  const elegibilidad = Math.round(elegibilidadPromedio(datos));
  const estudiantes = suma(datos, "estudiantes");
  const validadas = suma(datos, "validadas");

  return {
    elegibilidad: PERIODOS.map((_, i) => escalarPct(elegibilidad, i)),
    estudiantes: PERIODOS.map((_, i) => escalarConteo(estudiantes, i)),
    actividades: PERIODOS.map((_, i) => escalarConteo(validadas, i)),
  };
}

// ---------------------------------------------------------------------------
//  G · Casos especiales
// ---------------------------------------------------------------------------

export function casosEspeciales(ctx: ContextoSeccion) {
  const { datos, indicePeriodo } = ctx;
  return {
    condicionados: escalarConteo(suma(datos, "condicionados"), indicePeriodo),
    conCondicionados: datos.filter((a) => a.condicionados > 0),
    externos: datos.filter((a) => a.colaboradorExterno),
    selecciones: datos.filter((a) => a.esSeleccion),
  };
}

// ---------------------------------------------------------------------------
//  A · Cifras de encabezado
// ---------------------------------------------------------------------------

/** Las seis cifras de encabezado, cada una como serie completa de períodos. */
export interface SeriesEncabezado {
  asistidas: number[];
  preferencial: number[];
  elegibilidad: number[];
  estudiantes: number[];
  agrupaciones: number[];
  actividades: number[];
}

/**
 * Cada cifra sale como serie y no como número suelto: la tarjeta necesita la
 * serie entera para dibujar su tendencia y para comparar contra el período
 * anterior.
 */
export function seriesDeEncabezado(datos: AgrupacionProcad[]): SeriesEncabezado {
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
}
