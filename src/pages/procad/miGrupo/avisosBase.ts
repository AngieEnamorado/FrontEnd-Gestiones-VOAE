/**
 * Actividades y visorías leen columnas que la base de la universidad
 * (10.8.13.19) todavía no tiene: están en sql/procad_sobre_v2.sql del backend
 * y solo la DEGT puede aplicarlas. Mientras tanto el backend responde 500, y
 * eso se le explica a quien mira en vez de dejarle un «Error interno».
 */
export function explicarErrorDeColumnas(error: string): string {
  return /error interno/i.test(error)
    ? "Esta parte todavía no funciona con la base de la universidad: le faltan columnas de actividades y visorías (sql/procad_sobre_v2.sql). Queda pendiente de la decisión con la DEGT."
    : error;
}
