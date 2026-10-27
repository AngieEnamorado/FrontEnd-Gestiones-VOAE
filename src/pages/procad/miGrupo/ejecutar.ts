/**
 * Cómo las pestañas de "Mi grupo" le piden a la página que corra una acción:
 * `accion` recibe el idPersona de quien firma, `mensajeExito` es lo que se
 * confirma si sale bien, y `recargarTambien` vuelve a leer lo que esa pestaña
 * muestra aparte de las solicitudes.
 */
export type Ejecutar = (
  accion: (idPersona: number) => Promise<unknown>,
  mensajeExito: string,
  recargarTambien?: () => void,
) => Promise<void>;
