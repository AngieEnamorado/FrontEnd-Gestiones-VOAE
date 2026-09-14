import type { ColumnaTabla } from "./TablaDatos";
import type { VistaTabla } from "./vistaTabla";
import { descargarCsv } from "../../utils/exportarCsv";

/**
 * Una columna de una tabla de PROCAD, con las dos formas del mismo dato: cómo
 * se dibuja en pantalla y cómo se escribe en el archivo que se descarga.
 *
 * Van juntas para que no puedan separarse. Si estuvieran en dos listas, el día
 * que alguien cambie una columna y olvide la otra, lo que se descarga diría
 * algo distinto de lo que se está viendo, y nadie lo notaría hasta que el
 * archivo ya esté adjunto a un oficio.
 */
export interface CampoTabla<T, A = void> {
  label: string;
  numerica?: boolean;
  /** Centra la columna; para las que solo llevan un icono. */
  centrada?: boolean;
  /** Arranca apagada; se enciende desde «Filtrar columnas por…». */
  ocultaAlInicio?: boolean;
  /** Las columnas que solo son botones no tienen nada que exportar. */
  exportable?: boolean;
  texto: (registro: T) => string;
  celda: (registro: T, acciones: A) => React.ReactNode;
}

/** Lo que `TablaDatos` necesita saber de los campos. */
export function columnasDe<T, A>(campos: CampoTabla<T, A>[]): ColumnaTabla[] {
  return campos.map(({ label, numerica, centrada, ocultaAlInicio }) => ({
    label,
    numerica,
    centrada,
    ocultaAlInicio,
  }));
}

/**
 * Las filas, en el orden en que se declararon los campos. `TablaDatos` se
 * encarga de recortarlas y reordenarlas según la vista, así que aquí siempre
 * van completas.
 */
export function filasDe<T, A>(
  campos: CampoTabla<T, A>[],
  registros: T[],
  acciones: A,
): React.ReactNode[][] {
  // Cada celda va sola dentro de su `td`, así que no necesita clave.
  return registros.map((registro) => campos.map((campo) => campo.celda(registro, acciones)));
}

/**
 * Descarga lo que se está viendo: las filas ya filtradas y las columnas
 * visibles en el orden actual, sin las que solo son botones.
 */
export function descargarTabla<T, A>(
  nombre: string,
  campos: CampoTabla<T, A>[],
  vista: VistaTabla,
  registros: T[],
) {
  const elegidos = vista.indices.map((i) => campos[i]).filter((c) => c.exportable !== false);
  descargarCsv(
    `${nombre}-${new Date().toISOString().slice(0, 10)}.csv`,
    elegidos.map((c) => c.label),
    registros.map((registro) => elegidos.map((c) => c.texto(registro))),
  );
}
