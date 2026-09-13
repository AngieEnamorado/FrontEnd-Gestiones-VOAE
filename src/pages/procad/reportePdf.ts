import type { OpcionesReportePdf } from "../../utils/exportarPdf";

/**
 * La marca de los reportes de PROCAD: sello de autoría en encabezado y pie, y
 * un punto naranja encabezando cada tabla.
 *
 * Va aquí y no dentro del exportador porque el exportador es de toda la
 * plataforma: Giras, Voluntariado y los demás módulos siguen sacando sus PDF
 * como siempre, y esto es lo que PROCAD les suma a los suyos.
 */
export const SELLO_PROCAD: OpcionesReportePdf = { sello: true, bullet: true };
