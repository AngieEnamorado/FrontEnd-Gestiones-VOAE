import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { HiOutlineArrowLeft, HiOutlineDocumentArrowDown } from "react-icons/hi2";
import FichaSolicitudGira from "../../components/FichaSolicitudGira";
import { obtenerGira, obtenerSolicitud } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { etiquetaPeriodo, fechaCorta, formatearMonto } from "../../utils/girasFormato";
import type { GiraApi, SolicitudGiraDetalle } from "../../types/giras";

const NO_ESPECIFICADO = "No especificado";

const COLOR_NAVY: [number, number, number] = [0, 56, 117];
const COLOR_ORANGE: [number, number, number] = [245, 130, 15];
const COLOR_TEXTO: [number, number, number] = [30, 41, 59];

type DocConAutoTabla = jsPDF & { lastAutoTable: { finalY: number } };

const unidos = (nombres: string[]) => nombres.join(", ") || NO_ESPECIFICADO;
const fechaODefecto = (fecha: string | null) => (fecha ? fechaCorta(fecha) : NO_ESPECIFICADO);

function descargarPdf(gira: GiraApi, solicitud: SolicitudGiraDetalle) {
  const totalCostos = solicitud.costos.reduce((suma, linea) => suma + linea.total, 0);
  const doc = new jsPDF({ unit: "pt", format: "a4" }) as DocConAutoTabla;
  const margenX = 40;
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_ORANGE);
  doc.text("GIRAS", margenX, y);

  y += 22;
  doc.setFontSize(18);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text("Detalles de la Gira", margenX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_NAVY);
  doc.text(`ID: GIR-${gira.idGira}   Estado: ${gira.nombreEstado}`, anchoPagina - margenX, y, { align: "right" });

  y += 24;

  function agregarSeccion(numero: number, titulo: string) {
    if (y > altoPagina - 100) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLOR_ORANGE);
    doc.text(`${numero}.`, margenX, y);
    doc.setTextColor(...COLOR_TEXTO);
    doc.text(titulo, margenX + 16, y);
    y += 10;
  }

  function agregarSubtitulo(texto: string) {
    if (y > altoPagina - 100) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_TEXTO);
    doc.text(texto, margenX, y);
    y += 8;
  }

  function tablaCampoValor(filas: [string, string][]) {
    autoTable(doc, {
      startY: y,
      margin: { left: margenX, right: margenX },
      head: [["Campo", "Valor"]],
      body: filas,
      theme: "grid",
      styles: { fontSize: 9, textColor: COLOR_TEXTO, cellPadding: 6 },
      headStyles: { fillColor: COLOR_NAVY, textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 170, fontStyle: "bold" } },
    });
    y = doc.lastAutoTable.finalY + 24;
  }

  // 1. Datos generales
  agregarSeccion(1, "Datos generales");
  tablaCampoValor([
    ["Campus que organiza", solicitud.nombreCampus],
    ["Alcance del viaje", solicitud.nombreAlcance ?? NO_ESPECIFICADO],
    ["Destino", solicitud.destinoGira ?? NO_ESPECIFICADO],
    ["Alojamiento", solicitud.alojamientoGira ?? NO_ESPECIFICADO],
    ["Período", etiquetaPeriodo(solicitud.anioPeriodo, solicitud.numeroPac)],
    ["Objetivo académico", solicitud.objetivoAcademico || NO_ESPECIFICADO],
  ]);

  // 2. Fechas y horarios
  agregarSeccion(2, "Fechas y horarios");
  tablaCampoValor([
    ["Fecha de salida", fechaODefecto(gira.fechaSalidaConfirmada)],
    ["Hora de salida", solicitud.horaSalidaPropuesta ?? NO_ESPECIFICADO],
    ["Fecha de retorno", fechaODefecto(gira.fechaRetornoConfirmada)],
    ["Hora de retorno", solicitud.horaRetornoPropuesta ?? NO_ESPECIFICADO],
    ["Apertura de inscripciones", fechaODefecto(solicitud.fechaInicioInscripcion)],
    ["Cierre de inscripciones", fechaODefecto(solicitud.fechaFinInscripcion)],
  ]);

  // 3. Alcance académico
  agregarSeccion(3, "Alcance académico");
  tablaCampoValor([
    ["Categorías participantes", unidos(solicitud.categorias.map((c) => c.nombre))],
    ["Facultades participantes", unidos(solicitud.facultades.map((f) => f.nombre))],
    ["Finalidad de la gira", unidos(solicitud.finalidades.map((f) => f.nombre))],
  ]);

  // 4. Personas
  agregarSeccion(4, "Personas");
  tablaCampoValor([
    ["Jefe de aprobación", gira.nombreJefeAprobacion ?? NO_ESPECIFICADO],
    ["Jefe de misión", gira.nombreJefeMision ?? NO_ESPECIFICADO],
    ["Estudiantes aproximados", String(solicitud.totalAproximadoEstudiantes)],
    ["Docentes aproximados", String(solicitud.totalAproximadoDocentes)],
    ["Inscritos", `${gira.totalInscritos} de ${gira.totalInscripciones}`],
  ]);

  agregarSubtitulo("Docentes acompañantes");
  autoTable(doc, {
    startY: y,
    margin: { left: margenX, right: margenX },
    head: [["Nombre"]],
    body:
      solicitud.docentes.length > 0
        ? solicitud.docentes.map((d) => [d.nombreCompleto ?? "—"])
        : [["Aún no se han agregado acompañantes."]],
    theme: "grid",
    styles: { fontSize: 9, textColor: COLOR_TEXTO, cellPadding: 6 },
    headStyles: { fillColor: COLOR_NAVY, textColor: 255, fontStyle: "bold" },
  });
  y = doc.lastAutoTable.finalY + 24;

  // 5. Transporte
  agregarSeccion(5, "Transporte");
  tablaCampoValor([
    ["¿Utiliza transporte de la universidad?", solicitud.usaTransporteUniversidad ? "Sí" : "No"],
    ["Medios de transporte utilizados", unidos(solicitud.transportes.map((t) => t.nombre))],
    [
      "Observaciones del traslado",
      solicitud.transportes
        .filter((t) => t.observacion)
        .map((t) => `${t.nombre}: ${t.observacion}`)
        .join(" · ") || NO_ESPECIFICADO,
    ],
  ]);

  // 6. Financiamiento y costos
  agregarSeccion(6, "Financiamiento y costos");
  tablaCampoValor([["Origen de los fondos", unidos(solicitud.financiamientos.map((f) => f.nombre))]]);

  agregarSubtitulo("Desglose de costos");
  autoTable(doc, {
    startY: y,
    margin: { left: margenX, right: margenX },
    head: [["Concepto", "Detalle", "Monto (L)"]],
    body:
      solicitud.costos.length > 0
        ? solicitud.costos.map((linea) => [linea.nombre, linea.descripcion ?? "", `L ${formatearMonto(linea.total)}`])
        : [["Aún no se han agregado líneas de costo.", "", ""]],
    theme: "grid",
    styles: { fontSize: 9, textColor: COLOR_TEXTO, cellPadding: 6 },
    headStyles: { fillColor: COLOR_NAVY, textColor: 255, fontStyle: "bold" },
  });
  y = doc.lastAutoTable.finalY + 20;

  if (y > altoPagina - 60) {
    doc.addPage();
    y = 50;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(`Total: L ${formatearMonto(totalCostos)}`, anchoPagina - margenX, y, { align: "right" });

  doc.save(`gira-GIR-${gira.idGira}.pdf`);
}

function Regresar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
    >
      <HiOutlineArrowLeft className="h-4 w-4" />
      Regresar
    </button>
  );
}

/**
 * El resumen de una gira: los datos con los que se aprobó (su solicitud) y el
 * estado en que va la gira. Reutiliza la ficha de la solicitud.
 */
export default function ResumenGira() {
  const navigate = useNavigate();
  const { id } = useParams();

  const idGira = Number(id);
  const gira = useConsulta(() => obtenerGira(idGira), [idGira]);
  const idSolicitud = gira.datos?.idSolicitud;
  const solicitud = useConsulta(
    () => (idSolicitud === undefined ? Promise.resolve(null) : obtenerSolicitud(idSolicitud)),
    [idSolicitud],
  );

  function regresarAMisGiras() {
    navigate("/giras/mis-giras");
  }

  if (!gira.datos || !solicitud.datos) {
    const cargando = gira.cargando || solicitud.cargando || (!gira.error && !solicitud.error && !gira.datos);
    return (
      <div className="flex flex-col gap-6">
        <Regresar onClick={regresarAMisGiras} />
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          {cargando ? "Cargando gira…" : (gira.error ?? solicitud.error ?? "No se encontró la gira solicitada.")}
        </div>
      </div>
    );
  }

  const datosGira = gira.datos;
  const datosSolicitud = solicitud.datos;

  return (
    <FichaSolicitudGira
      solicitud={datosSolicitud}
      onRegresar={regresarAMisGiras}
      titulo="Detalles de la Gira"
      identificador={`GIR-${datosGira.idGira}`}
      estado={datosGira.codigoEstado}
      acciones={
        <button
          type="button"
          onClick={() => descargarPdf(datosGira, datosSolicitud)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
        >
          <HiOutlineDocumentArrowDown className="h-4 w-4" />
          Descargar PDF
        </button>
      }
    />
  );
}
