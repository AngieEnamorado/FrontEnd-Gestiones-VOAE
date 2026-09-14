import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { HiOutlineArrowLeft, HiOutlineDocumentArrowDown } from "react-icons/hi2";
import EstadoBadge from "../../components/EstadoBadge";
import { misGiras } from "../../data/mockMisGiras";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import type { SolicitudGira } from "../../types";

const todasLasGiras = [...misGiras, ...solicitudesGiras];

const NO_ESPECIFICADO = "No especificado";

function formatearFecha(fecha?: string) {
  if (!fecha) return null;
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-HN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatearMonto(monto: number) {
  return monto.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const COLOR_NAVY: [number, number, number] = [0, 56, 117];
const COLOR_ORANGE: [number, number, number] = [245, 130, 15];
const COLOR_TEXTO: [number, number, number] = [30, 41, 59];

type DocConAutoTabla = jsPDF & { lastAutoTable: { finalY: number } };

function descargarPdf(gira: SolicitudGira, totalCostos: number) {
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
  doc.text(`ID: ${gira.id}   Estado: ${gira.estado}`, anchoPagina - margenX, y, { align: "right" });

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
    ["Campus que organiza", gira.centro],
    ["Alcance del viaje", gira.alcanceViaje ?? NO_ESPECIFICADO],
    ["Destino", gira.destino],
    ["Alojamiento", gira.alojamiento ?? NO_ESPECIFICADO],
    ["Objetivo académico", gira.descripcion || NO_ESPECIFICADO],
  ]);

  // 2. Fechas y horarios
  agregarSeccion(2, "Fechas y horarios");
  tablaCampoValor([
    ["Fecha de salida", formatearFecha(gira.fecha) ?? NO_ESPECIFICADO],
    ["Hora de salida", gira.horaSalida ?? NO_ESPECIFICADO],
    ["Fecha de retorno", formatearFecha(gira.fechaRetorno) ?? NO_ESPECIFICADO],
    ["Hora de retorno", gira.horaRetorno ?? NO_ESPECIFICADO],
    ["Apertura de inscripciones", formatearFecha(gira.aperturaInscripciones) ?? NO_ESPECIFICADO],
    ["Cierre de inscripciones", formatearFecha(gira.cierreInscripciones) ?? NO_ESPECIFICADO],
  ]);

  // 3. Alcance académico
  agregarSeccion(3, "Alcance académico");
  tablaCampoValor([
    ["Carreras participantes", (gira.carrerasParticipantes ?? []).join(", ") || NO_ESPECIFICADO],
    ["Facultades participantes", (gira.facultadesParticipantes ?? []).join(", ") || NO_ESPECIFICADO],
    ["Finalidad de la gira", (gira.finalidadesGira ?? []).join(", ") || NO_ESPECIFICADO],
  ]);

  // 4. Personas
  agregarSeccion(4, "Personas");
  tablaCampoValor([
    ["Jefe de aprobación", gira.jefeAprobacion ?? NO_ESPECIFICADO],
    ["Jefe de misión", gira.docente],
    ["Estudiantes aproximados", gira.estudiantesAproximados?.toString() ?? NO_ESPECIFICADO],
    ["Docentes aproximados", gira.docentesAproximados?.toString() ?? NO_ESPECIFICADO],
  ]);

  agregarSubtitulo("Docentes acompañantes");
  autoTable(doc, {
    startY: y,
    margin: { left: margenX, right: margenX },
    head: [["Nombre", "Rol asignado"]],
    body:
      gira.docentesAcompanantes && gira.docentesAcompanantes.length > 0
        ? gira.docentesAcompanantes.map((a) => [a.nombre, a.rol])
        : [["Aún no se han agregado acompañantes.", ""]],
    theme: "grid",
    styles: { fontSize: 9, textColor: COLOR_TEXTO, cellPadding: 6 },
    headStyles: { fillColor: COLOR_NAVY, textColor: 255, fontStyle: "bold" },
  });
  y = doc.lastAutoTable.finalY + 24;

  // 5. Transporte
  agregarSeccion(5, "Transporte");
  tablaCampoValor([
    ["¿Utiliza transporte de la universidad?", gira.utilizaTransporteUniversidad ? "Sí" : "No"],
    ["Medios de transporte utilizados", (gira.mediosTransporte ?? []).join(", ") || NO_ESPECIFICADO],
    ["Observaciones del traslado", gira.observacionesTraslado || NO_ESPECIFICADO],
  ]);

  // 6. Financiamiento y costos
  agregarSeccion(6, "Financiamiento y costos");
  tablaCampoValor([["Origen de los fondos", (gira.origenFondos ?? []).join(", ") || NO_ESPECIFICADO]]);

  agregarSubtitulo("Desglose de costos");
  autoTable(doc, {
    startY: y,
    margin: { left: margenX, right: margenX },
    head: [["Concepto", "Detalle", "Monto (L)"]],
    body:
      gira.desgloseCostos && gira.desgloseCostos.length > 0
        ? gira.desgloseCostos.map((linea) => [
            linea.concepto,
            linea.detalle,
            `L ${formatearMonto(linea.monto)}`,
          ])
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

  doc.save(`gira-${gira.id}.pdf`);
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">
        {valor === undefined || valor === null || valor === "" ? NO_ESPECIFICADO : valor}
      </p>
    </div>
  );
}

function Tarjeta({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">
        <span className="mr-2 text-unah-orange">{numero}.</span>
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ListaEtiquetas({
  etiqueta,
  valores,
  vacio,
}: {
  etiqueta: string;
  valores?: string[];
  vacio: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      {!valores || valores.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">{vacio}</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {valores.map((valor) => (
            <span
              key={valor}
              className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
            >
              {valor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumenGira() {
  const navigate = useNavigate();
  const { id } = useParams();

  const gira = useMemo(() => todasLasGiras.find((g) => g.id === id), [id]);

  const totalCostos = useMemo(
    () => (gira?.desgloseCostos ?? []).reduce((acc, linea) => acc + linea.monto, 0),
    [gira],
  );

  function regresarAMisGiras() {
    navigate("/giras/mis-giras");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={regresarAMisGiras}
          className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Regresar
        </button>

        {gira && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => descargarPdf(gira, totalCostos)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
            >
              <HiOutlineDocumentArrowDown className="h-4 w-4" />
              Descargar PDF
            </button>
            <EstadoBadge estado={gira.estado} />
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Detalles de la Gira</h1>
      </div>

      {!gira ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No se encontró la gira solicitada.
        </div>
      ) : (
        <>
          {/* 1. Datos generales */}
          <Tarjeta numero={1} titulo="Datos generales">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Campo etiqueta="Campus que organiza" valor={gira.centro} />
              <Campo etiqueta="Alcance del viaje" valor={gira.alcanceViaje} />
              <Campo etiqueta="Destino" valor={gira.destino} />
              <Campo etiqueta="Alojamiento" valor={gira.alojamiento} />
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Objetivo académico
              </p>
              <p className="mt-1 text-sm text-slate-700">{gira.descripcion || NO_ESPECIFICADO}</p>
            </div>
          </Tarjeta>

          {/* 2. Fechas y horarios */}
          <Tarjeta numero={2} titulo="Fechas y horarios">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Campo etiqueta="Fecha de salida" valor={formatearFecha(gira.fecha)} />
              <Campo etiqueta="Hora de salida" valor={gira.horaSalida} />
              <Campo etiqueta="Fecha de retorno" valor={formatearFecha(gira.fechaRetorno)} />
              <Campo etiqueta="Hora de retorno" valor={gira.horaRetorno} />
              <Campo
                etiqueta="Apertura de inscripciones"
                valor={formatearFecha(gira.aperturaInscripciones)}
              />
              <Campo
                etiqueta="Cierre de inscripciones"
                valor={formatearFecha(gira.cierreInscripciones)}
              />
            </div>
          </Tarjeta>

          {/* 3. Alcance académico */}
          <Tarjeta numero={3} titulo="Alcance académico">
            <div className="grid gap-6 lg:grid-cols-2">
              <ListaEtiquetas
                etiqueta="Carreras participantes"
                valores={gira.carrerasParticipantes}
                vacio="No se han registrado carreras participantes."
              />
              <ListaEtiquetas
                etiqueta="Facultades participantes"
                valores={gira.facultadesParticipantes}
                vacio="No se han registrado facultades participantes."
              />
            </div>
            <div className="mt-5">
              <ListaEtiquetas
                etiqueta="Finalidad de la gira"
                valores={gira.finalidadesGira}
                vacio="No se ha registrado la finalidad de la gira."
              />
            </div>
          </Tarjeta>

          {/* 4. Personas */}
          <Tarjeta numero={4} titulo="Personas">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Campo etiqueta="Jefe de aprobación" valor={gira.jefeAprobacion} />
              <Campo etiqueta="Jefe de misión" valor={gira.docente} />
              <Campo etiqueta="Estudiantes aproximados" valor={gira.estudiantesAproximados} />
              <Campo etiqueta="Docentes aproximados" valor={gira.docentesAproximados} />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Docentes acompañantes
              </p>
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Rol asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gira.docentesAcompanantes && gira.docentesAcompanantes.length > 0 ? (
                      gira.docentesAcompanantes.map((acompanante) => (
                        <tr key={acompanante.nombre} className="transition-colors duration-150 hover:bg-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {acompanante.nombre}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{acompanante.rol}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-400">
                          Aún no se han agregado acompañantes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Tarjeta>

          {/* 5. Transporte */}
          <Tarjeta numero={5} titulo="Transporte">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                ¿Utiliza transporte de la universidad?
              </p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  gira.utilizaTransporteUniversidad
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {gira.utilizaTransporteUniversidad ? "Sí" : "No"}
              </span>
            </div>

            <div className="mt-5">
              <ListaEtiquetas
                etiqueta="Medios de transporte utilizados"
                valores={gira.mediosTransporte}
                vacio="No se han registrado medios de transporte."
              />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Observaciones del traslado
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {gira.observacionesTraslado || NO_ESPECIFICADO}
              </p>
            </div>
          </Tarjeta>

          {/* 6. Financiamiento y costos */}
          <Tarjeta numero={6} titulo="Financiamiento y costos">
            <ListaEtiquetas
              etiqueta="Origen de los fondos"
              valores={gira.origenFondos}
              vacio="No se ha registrado el origen de los fondos."
            />

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Desglose de costos
              </p>
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                      <th className="px-4 py-3">Concepto</th>
                      <th className="px-4 py-3">Detalle</th>
                      <th className="px-4 py-3">Monto (L)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gira.desgloseCostos && gira.desgloseCostos.length > 0 ? (
                      gira.desgloseCostos.map((linea) => (
                        <tr key={`${linea.concepto}-${linea.detalle}`} className="transition-colors duration-150 hover:bg-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-700">{linea.concepto}</td>
                          <td className="px-4 py-3 text-slate-600">{linea.detalle}</td>
                          <td className="px-4 py-3 text-slate-600">L {formatearMonto(linea.monto)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                          Aún no se han agregado líneas de costo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-right text-base font-bold text-slate-800">
                Total: L {formatearMonto(totalCostos)}
              </p>
            </div>
          </Tarjeta>
        </>
      )}
    </div>
  );
}
