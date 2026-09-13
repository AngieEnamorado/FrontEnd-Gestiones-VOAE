import { obtenerUsuarioDeSesion } from "../data/currentUser";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** «Erin» → «erin»; «José Ramón» → «jose». Sin tildes ni espacios. */
function comoNombreDeArchivo(nombreCompleto: string): string {
  const primero = nombreCompleto.trim().split(/\s+/)[0] ?? "usuario";
  return (
    primero
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "usuario"
  );
}

/**
 * El nombre del archivo: `reporte-erin-12-sep-2026.pdf`.
 *
 * Quién lo sacó y cuándo van en el propio nombre, no solo dentro del
 * documento: estos PDF se adjuntan a correos y se guardan en carpetas
 * compartidas, donde lo único que se ve es el nombre del archivo.
 *
 * El usuario se lee de la sesión aquí dentro para que ningún reporte pueda
 * guardarse sin firma por olvido de quien lo genera.
 */
export function nombreDeReporte(): string {
  const usuario = obtenerUsuarioDeSesion();
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = MESES[hoy.getMonth()];
  return `reporte-${comoNombreDeArchivo(usuario.nombreCompleto)}-${dia}-${mes}-${hoy.getFullYear()}.pdf`;
}

/**
 * Quita el «F · » de los títulos que traen la letra del apartado.
 *
 * La letra es jerga de la especificación del programa —sirve para hablar de
 * «la sección F» entre quienes escribieron los requerimientos— y no le dice
 * nada a quien recibe el documento: en su lugar va un punto naranja, como en
 * las tarjetas del panel.
 */
export function sinLetraDeApartado(titulo: string): string {
  return titulo.replace(/^[A-G]\s·\s/, "");
}
