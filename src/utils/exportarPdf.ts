import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerUsuarioDeSesion } from "../data/currentUser";
import { sinLetraDeApartado } from "./nombreDeReporte";

const COLOR_NAVY: [number, number, number] = [0, 56, 117];
const COLOR_ORANGE: [number, number, number] = [245, 130, 15];
const COLOR_TEXTO: [number, number, number] = [30, 41, 59];
const COLOR_PIE: [number, number, number] = [100, 116, 139];

/** Alto reservado al pie, para que nada se le monte encima. */
export const ALTO_PIE = 56;

/** Margen lateral de todos los reportes de la plataforma. */
export const MARGEN_X = 40;

type DocConAutoTabla = jsPDF & { lastAutoTable: { finalY: number } };

export interface SeccionReportePdf {
  titulo: string;
  columnas: string[];
  filas: (string | number)[][];
}

/**
 * Añadidos que hoy solo pide PROCAD. Van apagados por defecto para que los
 * reportes de Giras, Voluntariado y los demás módulos salgan exactamente como
 * salían: quien quiera el sello o el punto, lo enciende.
 */
export interface OpcionesReportePdf {
  /** Autor en el encabezado y pie con «Generado por … · Página X de Y». */
  sello?: boolean;
  /** Punto naranja antes del título de cada tabla, sin la letra del apartado. */
  bullet?: boolean;
}

// Arma el PDF con encabezado institucional y una tabla por sección. Se usa
// tanto para el reporte completo del dashboard como para la descarga
// individual de un solo gráfico (una sección) o para un reporte compuesto.
function construirReportePdf(
  categoria: string,
  titulo: string,
  secciones: SeccionReportePdf[],
  opciones: OpcionesReportePdf = {},
): DocConAutoTabla {
  const doc = new jsPDF({ unit: "pt", format: "a4" }) as DocConAutoTabla;
  const margenX = MARGEN_X;
  const altoPagina = doc.internal.pageSize.getHeight();
  let y = encabezadoInstitucional(doc, categoria, titulo, opciones.sello);

  for (const seccion of secciones) {
    if (y > altoPagina - 100) {
      doc.addPage();
      y = 50;
    }
    // Con `bullet`, un punto naranja encabeza cada tabla —igual que las
    // tarjetas del panel— y el título pierde la letra del apartado, que es
    // jerga de la especificación. Sin él, el título va como siempre.
    if (opciones.bullet) {
      doc.setFillColor(...COLOR_ORANGE);
      doc.circle(margenX + 2, y - 3.5, 2.2, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXTO);
    doc.text(
      opciones.bullet ? sinLetraDeApartado(seccion.titulo) : seccion.titulo,
      opciones.bullet ? margenX + 11 : margenX,
      y,
    );
    y += 10;

    autoTable(doc, {
      startY: y,
      // El hueco de abajo solo hace falta cuando hay pie que respetar; sin
      // sello, la tabla usa el margen de siempre y pagina como paginaba.
      margin: { left: margenX, right: margenX, ...(opciones.sello ? { bottom: ALTO_PIE } : {}) },
      head: [seccion.columnas],
      body: seccion.filas,
      theme: "grid",
      styles: { fontSize: 9, textColor: COLOR_TEXTO, cellPadding: 6 },
      headStyles: { fillColor: COLOR_NAVY, textColor: 255, fontStyle: "bold" },
    });
    y = doc.lastAutoTable.finalY + 26;
  }

  if (opciones.sello) sellarPaginas(doc, margenX);
  return doc;
}

/**
 * El encabezado institucional: la categoría en naranja, el título y la fecha.
 * Devuelve la altura en la que puede empezar el contenido.
 *
 * Con `conAutor` añade debajo quién lo generó. Lo usan por igual el reporte de
 * tablas y el de gráficas de PROCAD: los dos documentos salen del mismo sistema
 * y tienen que abrirse igual.
 */
export function encabezadoInstitucional(
  doc: jsPDF,
  categoria: string,
  titulo: string,
  conAutor = false,
): number {
  const anchoPagina = doc.internal.pageSize.getWidth();
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_ORANGE);
  doc.text(categoria.toUpperCase(), MARGEN_X, y);

  y += 22;
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(titulo, MARGEN_X, y);

  const fecha = new Date().toLocaleDateString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_NAVY);
  doc.text(`Generado el ${fecha}`, anchoPagina - MARGEN_X, y, { align: "right" });

  if (!conAutor) return y + 22;

  // El pie repite el autor en todas las páginas, pero quien recibe el
  // documento tiene que verlo al abrirlo, sin buscar abajo.
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_PIE);
  doc.text(`por ${obtenerUsuarioDeSesion().nombreCompleto}`, anchoPagina - MARGEN_X, y + 12, {
    align: "right",
  });

  return y + 26;
}

/**
 * El sello de autoría, al pie de cada página: quién sacó el documento, cuándo y
 * de cuántas páginas es.
 *
 * Un reporte de estos se adjunta a un oficio y circula impreso, fuera del
 * sistema; una vez en papel, nada dice de dónde salió ni quién lo pidió. Por
 * eso el nombre va en todas las páginas y no solo en la primera: las hojas se
 * separan.
 *
 * El usuario se lee aquí y no se recibe como parámetro para que ningún reporte
 * pueda salir sin sello por olvido de quien lo genera.
 */
export function sellarPaginas(doc: jsPDF, margenX: number = MARGEN_X) {
  const usuario = obtenerUsuarioDeSesion();
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const total = doc.getNumberOfPages();
  const momento = new Date().toLocaleString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const sello = `Generado por ${usuario.nombreCompleto} (${usuario.nombreUsuario}) · ${momento}`;

  for (let pagina = 1; pagina <= total; pagina += 1) {
    doc.setPage(pagina);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margenX, altoPagina - 40, anchoPagina - margenX, altoPagina - 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_PIE);
    doc.text(sello, margenX, altoPagina - 28);
    doc.text(`Página ${pagina} de ${total}`, anchoPagina - margenX, altoPagina - 28, {
      align: "right",
    });
  }
}

/** Descarga el reporte como archivo. */
export function generarReportePdf(
  categoria: string,
  titulo: string,
  secciones: SeccionReportePdf[],
  nombreArchivo: string,
  opciones?: OpcionesReportePdf,
) {
  construirReportePdf(categoria, titulo, secciones, opciones).save(nombreArchivo);
}

/**
 * El mismo reporte, pero abierto en el visor del navegador con el diálogo de
 * impresión ya levantado. Si el navegador bloquea la ventana emergente se
 * descarga el archivo, que es lo que el usuario pidió al final de cuentas.
 */
export function imprimirReportePdf(
  categoria: string,
  titulo: string,
  secciones: SeccionReportePdf[],
  nombreArchivo: string,
  opciones?: OpcionesReportePdf,
) {
  const doc = construirReportePdf(categoria, titulo, secciones, opciones);
  doc.autoPrint();
  const ventana = window.open(String(doc.output("bloburl")), "_blank");
  if (!ventana) doc.save(nombreArchivo);
}
