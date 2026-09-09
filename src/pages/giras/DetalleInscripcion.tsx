import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import { estilosPorEstado } from "../../components/EstadoBadge";
import { misGiras } from "../../data/mockMisGiras";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import { inscripcionesPorGira } from "../../data/mockInscripciones";
import type { EstadoSolicitud, FichaSalud } from "../../types";

const todasLasGiras = [...misGiras, ...solicitudesGiras];

const NO_ESPECIFICADO = "No especificado";

const opcionesEstado: { valor: EstadoSolicitud; etiqueta: string }[] = [
  { valor: "APROBADA", etiqueta: "Aprobada" },
  { valor: "PENDIENTE", etiqueta: "Pendiente" },
  { valor: "EN REVISIÓN", etiqueta: "En revisión" },
  { valor: "RECHAZADA", etiqueta: "Rechazada" },
];

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

function IndicadorSiNo({ etiqueta, valor }: { etiqueta: string; valor?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <span
        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          valor ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {valor ? "Sí" : "No"}
      </span>
    </div>
  );
}

function BloqueFichaSalud({ ficha }: { ficha?: FichaSalud }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Tipo de sangre" valor={ficha?.tipoSangre} />
        <Campo etiqueta="Alergias" valor={ficha?.alergias} />
        <Campo etiqueta="Condiciones médicas" valor={ficha?.condicionesMedicas} />
        <Campo etiqueta="Discapacidad / apoyos" valor={ficha?.discapacidad} />
        <Campo etiqueta="Medicamentos" valor={ficha?.medicamentos} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Contacto de emergencia
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Nombre" valor={ficha?.contactoEmergencia?.nombre} />
          <Campo etiqueta="Parentesco" valor={ficha?.contactoEmergencia?.parentesco} />
          <Campo etiqueta="Teléfono" valor={ficha?.contactoEmergencia?.telefono} />
        </div>
      </div>
    </>
  );
}

export default function DetalleInscripcion() {
  const navigate = useNavigate();
  const { id, inscripcionId } = useParams();

  const gira = useMemo(() => todasLasGiras.find((g) => g.id === id), [id]);
  const inscripcion = useMemo(
    () => (id ? (inscripcionesPorGira[id] ?? []).find((i) => i.id === inscripcionId) : undefined),
    [id, inscripcionId],
  );

  const [estadoActual, setEstadoActual] = useState<EstadoSolicitud | null>(
    inscripcion?.estado ?? null,
  );

  const totalCostos = useMemo(
    () => (gira?.desgloseCostos ?? []).reduce((acc, linea) => acc + linea.monto, 0),
    [gira],
  );
  const aportePorEstudiante =
    gira && gira.estudiantesAproximados ? totalCostos / gira.estudiantesAproximados : null;

  function regresarAInscripciones() {
    navigate(`/giras/mis-giras/${id}/inscripciones`);
  }

  if (!gira || !inscripcion || !estadoActual) {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={regresarAInscripciones}
          className="flex w-fit items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Regresar
        </button>
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No se encontró la inscripción solicitada.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={regresarAInscripciones}
          className="flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Regresar
        </button>

        <select
          value={estadoActual}
          onChange={(e) => setEstadoActual(e.target.value as EstadoSolicitud)}
          className={`rounded-full border-none px-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-unah-orange ${estilosPorEstado[estadoActual]}`}
        >
          {opcionesEstado.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-bold tracking-wider text-[#D97706]">ESTUDIANTES</p>
        <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">
          Detalles de la Inscripción
        </h1>
      </div>

      {/* Resumen superior de la gira */}
      <div className="rounded-2xl border border-unah-navy/20 bg-slate-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gira asociada</p>
        <h2 className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">{gira.destino}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {gira.categoria} · Jefa de misión: {gira.docente}
        </p>

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo
            etiqueta="Salida"
            valor={
              formatearFecha(gira.fecha)
                ? `${formatearFecha(gira.fecha)} · ${gira.horaSalida ?? NO_ESPECIFICADO}`
                : null
            }
          />
          <Campo
            etiqueta="Retorno"
            valor={
              formatearFecha(gira.fechaRetorno)
                ? `${formatearFecha(gira.fechaRetorno)} · ${gira.horaRetorno ?? NO_ESPECIFICADO}`
                : null
            }
          />
          <Campo etiqueta="Transporte" valor={(gira.mediosTransporte ?? []).join(", ")} />
          <Campo
            etiqueta="Aporte"
            valor={aportePorEstudiante !== null ? `L ${formatearMonto(aportePorEstudiante)}` : null}
          />
        </div>
      </div>

      {/* 1. Datos del estudiante */}
      <Tarjeta numero={1} titulo="Datos del Estudiante">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Nombre completo" valor={inscripcion.nombreEstudiante} />
          <Campo etiqueta="Número de cuenta" valor={inscripcion.numeroCuenta} />
          <Campo etiqueta="Carrera y facultad" valor={inscripcion.carreraFacultad} />
          <Campo etiqueta="Correo institucional" valor={inscripcion.correoInstitucional} />
          <Campo etiqueta="Teléfono de contacto" valor={inscripcion.telefonoContacto} />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <IndicadorSiNo etiqueta="Inscripción excepcional" valor={inscripcion.esExcepcional} />

          {inscripcion.esExcepcional && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Quién inscribió" valor={inscripcion.inscritoPor} />
              <Campo etiqueta="Motivo" valor={inscripcion.motivoExcepcion} />
            </div>
          )}
        </div>
      </Tarjeta>

      {/* 2. Acompañante externo */}
      <Tarjeta numero={2} titulo="Acompañante Externo">
        <IndicadorSiNo etiqueta="Viaja con acompañante externo" valor={inscripcion.tieneAcompanante} />

        {inscripcion.tieneAcompanante && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo etiqueta="Nombre completo" valor={inscripcion.acompanante?.nombreCompleto} />
            <Campo
              etiqueta="Fecha de nacimiento"
              valor={formatearFecha(inscripcion.acompanante?.fechaNacimiento)}
            />
            <Campo etiqueta="Correo" valor={inscripcion.acompanante?.correo} />
            <Campo etiqueta="Teléfono" valor={inscripcion.acompanante?.telefono} />
          </div>
        )}
      </Tarjeta>

      {/* 3. Ficha de salud del estudiante */}
      <Tarjeta numero={3} titulo="Ficha de Salud del Estudiante">
        <BloqueFichaSalud ficha={inscripcion.fichaSaludEstudiante} />
      </Tarjeta>

      {/* 4. Ficha de salud del acompañante externo */}
      {inscripcion.tieneAcompanante && (
        <Tarjeta numero={4} titulo="Ficha de Salud del Acompañante Externo">
          <BloqueFichaSalud ficha={inscripcion.fichaSaludAcompanante} />
        </Tarjeta>
      )}

      {/* 5. Documentos adjuntos */}
      <Tarjeta numero={inscripcion.tieneAcompanante ? 5 : 4} titulo="Documentos Adjuntos">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">Tipo de documento</th>
                <th className="px-4 py-3">Nombre del archivo</th>
                <th className="px-4 py-3">Enlace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inscripcion.documentos && inscripcion.documentos.length > 0 ? (
                inscripcion.documentos.map((documento) => (
                  <tr key={`${documento.tipo}-${documento.nombre}`}>
                    <td className="px-4 py-3 font-medium text-slate-700">{documento.tipo}</td>
                    <td className="px-4 py-3 text-slate-600">{documento.nombre}</td>
                    <td className="px-4 py-3">
                      <a
                        href={documento.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Ver documento
                        <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-400">
                    No se han adjuntado documentos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      {/* 6. Observaciones */}
      <Tarjeta numero={inscripcion.tieneAcompanante ? 6 : 5} titulo="Observaciones">
        <p className="text-sm text-slate-700">{inscripcion.observaciones || NO_ESPECIFICADO}</p>
      </Tarjeta>
    </div>
  );
}
