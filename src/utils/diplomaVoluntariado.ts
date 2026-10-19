// Diploma de reconocimiento de Voluntariado, en PDF y generado en el navegador.
//
// No usa utils/exportarPdf.ts: ese arma reportes con tablas (encabezado,
// autoTable, pie paginado) y el diploma es una sola hoja con otro diseño.
import { jsPDF } from "jspdf";
import logoUnah from "../assets/Logos/LogoUnahBlanco.png";

export interface DatosDiploma {
  idDiploma: number;
  nombreCompleto: string;
  numeroCuenta: string | null;
  nombreGrupo: string;
  campus: string | null;
  /** Período que cubre, p. ej. "2026". */
  ventana: string;
  porcentaje: number;
  actividadesAsistidas: number;
  actividadesGrupo: number;
  fechaEmision: string | null;
}

const NAVY: [number, number, number] = [0, 56, 117];
const NARANJA: [number, number, number] = [245, 130, 15];
const GRIS: [number, number, number] = [71, 85, 105];

async function imagenComoDataUrl(url: string): Promise<string | null> {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise((resolver) => {
      const lector = new FileReader();
      lector.onload = () => resolver(String(lector.result));
      lector.onerror = () => resolver(null);
      lector.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function fechaLarga(fecha: string | null): string {
  const d = fecha ? new Date(fecha) : new Date();
  return d.toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Tegucigalpa" });
}

export async function descargarDiploma(datos: DatosDiploma): Promise<void> {
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const ancho = pdf.internal.pageSize.getWidth();
  const alto = pdf.internal.pageSize.getHeight();
  const centro = ancho / 2;

  // Marco doble.
  pdf.setDrawColor(...NAVY);
  pdf.setLineWidth(1.6);
  pdf.rect(8, 8, ancho - 16, alto - 16);
  pdf.setDrawColor(...NARANJA);
  pdf.setLineWidth(0.6);
  pdf.rect(12, 12, ancho - 24, alto - 24);

  // Franja superior con el logo (blanco, por eso va sobre azul).
  pdf.setFillColor(...NAVY);
  pdf.rect(12, 12, ancho - 24, 30, "F");
  const logo = await imagenComoDataUrl(logoUnah);
  // Comprimido: sin esto el PNG del logo infla el PDF a cerca de 1 MB.
  if (logo) pdf.addImage(logo, "PNG", 20, 15, 42, 24, undefined, "FAST");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Universidad Nacional Autónoma de Honduras", centro + 12, 25, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.text("Vicerrectoría de Orientación y Asuntos Estudiantiles · Voluntariado Universitario", centro + 12, 33, {
    align: "center",
  });

  pdf.setTextColor(...NAVY);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.text("DIPLOMA DE RECONOCIMIENTO", centro, 66, { align: "center" });
  pdf.setDrawColor(...NARANJA);
  pdf.setLineWidth(1);
  pdf.line(centro - 45, 71, centro + 45, 71);

  pdf.setTextColor(...GRIS);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(13);
  pdf.text("Se otorga a", centro, 85, { align: "center" });

  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.text(datos.nombreCompleto, centro, 99, { align: "center" });
  if (datos.numeroCuenta) {
    pdf.setTextColor(...GRIS);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Número de cuenta ${datos.numeroCuenta}`, centro, 107, { align: "center" });
  }

  const lugar = datos.campus ? `${datos.nombreGrupo} (${datos.campus})` : datos.nombreGrupo;
  const cuerpo =
    `por su participación como voluntario(a) en el grupo ${lugar}, ` +
    `con una asistencia del ${Math.round(datos.porcentaje)}% ` +
    `(${datos.actividadesAsistidas} de ${datos.actividadesGrupo} actividades ejecutadas) durante ${datos.ventana}.`;
  pdf.setTextColor(51, 65, 85);
  pdf.setFontSize(13);
  pdf.text(pdf.splitTextToSize(cuerpo, ancho - 90), centro, 122, { align: "center", lineHeightFactor: 1.5 });

  // Firma y datos de emisión.
  const yFirma = alto - 40;
  pdf.setDrawColor(...GRIS);
  pdf.setLineWidth(0.3);
  pdf.line(centro - 40, yFirma, centro + 40, yFirma);
  pdf.setFontSize(10.5);
  pdf.setTextColor(...GRIS);
  pdf.text("Coordinación de Voluntariado · VOAE", centro, yFirma + 6, { align: "center" });

  pdf.setFontSize(9);
  pdf.text(`Emitido el ${fechaLarga(datos.fechaEmision)}`, 22, alto - 20);
  pdf.text(`Folio N.º ${String(datos.idDiploma).padStart(5, "0")}`, ancho - 22, alto - 20, { align: "right" });

  const nombreArchivo = `diploma-voluntariado-${datos.nombreCompleto}-${datos.ventana}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .toLowerCase();
  pdf.save(`${nombreArchivo}.pdf`);
}
