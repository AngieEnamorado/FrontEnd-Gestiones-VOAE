import type {
  AgrupacionProcad,
  EstadoSolicitudProcad,
  FiltrosProcad,
  ResumenCentro,
} from "../types";
import { CENTROS, PERIODOS } from "../data/mockProcadEstadisticas";

// Matemática del panel de estadísticas de PROCAD. Vive aparte de los
// componentes porque varias secciones necesitan las mismas operaciones, y
// porque estas reglas (qué pasa cuando un denominador es 0, cómo se reconstruye
// un período anterior) son del dominio, no de la presentación.

/** Recorta un porcentaje al rango 0–100 y convierte cualquier basura en 0. */
export function pctSeguro(valor: number): number {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/**
 * División protegida. Varias métricas del programa son razones cuyo
 * denominador puede ser 0 — una agrupación sin actividades validadas no tiene
 * inscritos — y en ese caso la razón no existe: devuelve `null`, no 0. Un 0
 * diría "asistió nadie", y lo cierto es "no hubo a qué asistir".
 */
export function razon(numerador: number, denominador: number): number | null {
  const d = Number(denominador) || 0;
  if (d <= 0) return null;
  return (Number(numerador) || 0) / d;
}

export function pctDe(numerador: number, denominador: number): number | null {
  const r = razon(numerador, denominador);
  return r === null ? null : pctSeguro(Math.round(r * 100));
}

/** Un porcentaje que no existe se muestra como raya, nunca como 0%. */
export function muestraPct(valor: number | null): string {
  return valor === null ? "—" : `${valor}%`;
}

export function promedioODash(valor: number | null, decimales = 1): string {
  return valor === null ? "—" : valor.toFixed(decimales);
}

// ---------------------------------------------------------------------------
//  Escalado por período
// ---------------------------------------------------------------------------
// Los datos simulados describen el período actual. Para dibujar la tendencia
// hacia atrás, cada período tiene un `factor` (escala los conteos) y una
// `elegibilidad` de referencia (escala los porcentajes).

export function indiceDePeriodo(periodoId: string): number {
  const i = PERIODOS.findIndex((p) => p.id === periodoId);
  return i === -1 ? PERIODOS.length - 1 : i;
}

/** Escala un conteo al período indicado. */
export function escalarConteo(valor: number, indicePeriodo: number): number {
  return Math.round((Number(valor) || 0) * PERIODOS[indicePeriodo].factor);
}

/** Escala un porcentaje al período indicado. */
export function escalarPct(valor: number, indicePeriodo: number): number {
  const referencia = PERIODOS[PERIODOS.length - 1].elegibilidad || 1;
  const proporcion = PERIODOS[indicePeriodo].elegibilidad / referencia;
  return pctSeguro(Math.round((Number(valor) || 0) * proporcion));
}

// ---------------------------------------------------------------------------
//  Sumas
// ---------------------------------------------------------------------------

// El `-?` quita la opcionalidad de las claves: sin él, los campos opcionales
// (deporte, disciplinas) meten `undefined` en la unión y deja de servir como
// índice.
type CampoNumerico = {
  [K in keyof AgrupacionProcad]-?: AgrupacionProcad[K] extends number ? K : never;
}[keyof AgrupacionProcad];

export function suma(datos: AgrupacionProcad[], campo: CampoNumerico): number {
  return datos.reduce((acc, a) => acc + (Number(a[campo]) || 0), 0);
}

export function sumaSolicitudes(datos: AgrupacionProcad[], estado: EstadoSolicitudProcad): number {
  return datos.reduce((acc, a) => acc + (Number(a.solicitudes[estado]) || 0), 0);
}

export function totalSolicitudes(datos: AgrupacionProcad[]): number {
  return (
    sumaSolicitudes(datos, "pendiente") +
    sumaSolicitudes(datos, "aprobada") +
    sumaSolicitudes(datos, "noCumple") +
    sumaSolicitudes(datos, "observada")
  );
}

/** Elegibilidad promedio ponderada por cantidad de estudiantes. */
export function elegibilidadPromedio(datos: AgrupacionProcad[]): number {
  const estudiantes = suma(datos, "estudiantes");
  if (!estudiantes) return 0;
  return datos.reduce((acc, a) => acc + a.estudiantes * a.elegibilidad, 0) / estudiantes;
}

// ---------------------------------------------------------------------------
//  Filtros
// ---------------------------------------------------------------------------
// Son tres recortes distintos a propósito, y cada sección usa el que le toca.

/** El recorte completo: respeta los cuatro filtros. Es el de uso general. */
export function filtrarPorAgrupacion(
  agrupaciones: AgrupacionProcad[],
  filtros: FiltrosProcad,
): AgrupacionProcad[] {
  return agrupaciones.filter(
    (a) =>
      (filtros.tipo === "todos" || a.tipo === filtros.tipo) &&
      (filtros.centro === "todos" || a.centro === filtros.centro) &&
      (filtros.agrupacion === "todas" || a.nombre === filtros.agrupacion),
  );
}

/**
 * Ignora el filtro de centro: lo usan las tarjetas que comparan centros entre
 * sí, donde recortar a un solo centro dejaría una sola barra.
 */
export function filtrarParaCentros(
  agrupaciones: AgrupacionProcad[],
  filtros: FiltrosProcad,
): AgrupacionProcad[] {
  return agrupaciones.filter(
    (a) =>
      (filtros.tipo === "todos" || a.tipo === filtros.tipo) &&
      (filtros.agrupacion === "todas" || a.nombre === filtros.agrupacion),
  );
}

/**
 * Ignora el filtro de agrupación: lo usa la tarjeta que resalta una agrupación
 * y atenúa al resto. Con el recorte completo no quedaría "resto" que atenuar,
 * porque ya vendría reducido a una sola fila.
 */
export function filtrarPorTipoYCentro(
  agrupaciones: AgrupacionProcad[],
  filtros: FiltrosProcad,
): AgrupacionProcad[] {
  return agrupaciones.filter(
    (a) =>
      (filtros.tipo === "todos" || a.tipo === filtros.tipo) &&
      (filtros.centro === "todos" || a.centro === filtros.centro),
  );
}

/** Las agrupaciones que puede ofrecer el select, dado el tipo y el centro elegidos. */
export function agrupacionesDisponibles(
  agrupaciones: AgrupacionProcad[],
  filtros: Pick<FiltrosProcad, "tipo" | "centro">,
): AgrupacionProcad[] {
  return agrupaciones.filter(
    (a) =>
      (filtros.tipo === "todos" || a.tipo === filtros.tipo) &&
      (filtros.centro === "todos" || a.centro === filtros.centro),
  );
}

// ---------------------------------------------------------------------------
//  Agregación por centro regional
// ---------------------------------------------------------------------------

export function resumenPorCentro(
  datos: AgrupacionProcad[],
  indicePeriodo: number,
): ResumenCentro[] {
  return CENTROS.map((centro) => {
    const filas = datos.filter((a) => a.centro === centro);
    const estudiantes = suma(filas, "estudiantes");
    return {
      nombre: centro,
      grupos: filas.length,
      estudiantes: escalarConteo(estudiantes, indicePeriodo),
      actividades: escalarConteo(suma(filas, "validadas"), indicePeriodo),
      estudiantesDeportivo: escalarConteo(
        suma(
          filas.filter((a) => a.tipo === "deportivo"),
          "estudiantes",
        ),
        indicePeriodo,
      ),
      estudiantesArtistico: escalarConteo(
        suma(
          filas.filter((a) => a.tipo === "artistico"),
          "estudiantes",
        ),
        indicePeriodo,
      ),
      elegibilidad: estudiantes
        ? escalarPct(Math.round(elegibilidadPromedio(filas)), indicePeriodo)
        : null,
    };
  }).filter((c) => c.grupos > 0);
}
