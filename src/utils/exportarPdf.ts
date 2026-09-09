import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const COLOR_NAVY: [number, number, number] = [0, 56, 117];
const COLOR_ORANGE: [number, number, number] = [245, 130, 15];
const COLOR_TEXTO: [number, number, number] = [30, 41, 59];

type DocConAutoTabla = jsPDF & { lastAutoTable: { finalY: number } };

export interface SeccionReportePdf {
  titulo: string;
  columnas: string[];
  filas: (string | number)[][];
}

// Genera un PDF con encabezado institucional y una tabla por sección.
// Se usa tanto para el reporte completo del dashboard como para la
// descarga individual de un solo gráfico (una sección).
export function generarReportePdf(
  categoria: string,
  titulo: string,
  secciones: SeccionReportePdf[],
  nombreArchivo: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" }) as DocConAutoTabla;
  const margenX = 40;
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_ORANGE);
  doc.text(categoria.toUpperCase(), margenX, y);

  y += 22;
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(titulo, margenX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_NAVY);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-HN", { year: "numeric", month: "long", day: "numeric" })}`,
    anchoPagina - margenX,
    y,
    { align: "right" },
  );

  y += 22;

  for (const seccion of secciones) {
    if (y > altoPagina - 100) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXTO);
    doc.text(seccion.titulo, margenX, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      margin: { left: margenX, right: margenX },
      head: [seccion.columnas],
      body: seccion.filas,
      theme: "grid",
      styles: { fontSize: 9, textColor: COLOR_TEXTO, cellPadding: 6 },
      headStyles: { fillColor: COLOR_NAVY, textColor: 255, fontStyle: "bold" },
    });
    y = doc.lastAutoTable.finalY + 26;
  }

  doc.save(nombreArchivo);
}
