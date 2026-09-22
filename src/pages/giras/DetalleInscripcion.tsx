import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";
import BloqueDictamen, { type OpcionDictamen } from "../../components/giras/BloqueDictamen";
import EstadoGiraBadge from "../../components/giras/EstadoGiraBadge";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { dictaminarInscripcion, obtenerGira, obtenerInscripcion, obtenerSolicitud } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { useEstudianteActual, useIdentidadGira, useRolGira } from "../../context/UserContext";
import { fechaCorta, formatearMonto } from "../../utils/girasFormato";
import type { DecisionInscripcionGira, FichaSaludGira } from "../../types/giras";

const NO_ESPECIFICADO = "No especificado";

const OPCIONES: OpcionDictamen[] = [
  { valor: "Inscrito", etiqueta: "Aprobar la inscripción", exigeJustificacion: false },
  { valor: "Correccion", etiqueta: "Devolver a corrección", exigeJustificacion: true },
  { valor: "Rechazada", etiqueta: "Rechazar", exigeJustificacion: true },
];

function Tarjeta({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
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

function BloqueFichaSalud({ ficha }: { ficha: FichaSaludGira | null }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Campo etiqueta="Tipo de sangre" valor={ficha?.nombreTipoSangre} />
        <Campo etiqueta="Alergias" valor={ficha?.alergias} />
        <Campo etiqueta="Condiciones médicas" valor={ficha?.condicionesMedicas} />
        <Campo etiqueta="Discapacidad / apoyos" valor={ficha?.discapacidad} />
        <Campo etiqueta="Medicamentos" valor={ficha?.medicamentos} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contacto de emergencia</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Nombre" valor={ficha?.contactoEmergenciaNombre} />
          <Campo etiqueta="Parentesco" valor={ficha?.contactoEmergenciaParentesco} />
          <Campo etiqueta="Teléfono" valor={ficha?.contactoEmergenciaTelefono} />
        </div>
      </div>
    </>
  );
}

function Regresar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
    >
      <HiOutlineArrowLeft className="h-4 w-4" />
      Regresar
    </button>
  );
}

export default function DetalleInscripcion() {
  const navigate = useNavigate();
  const { id, inscripcionId } = useParams();

  const { rol } = useRolGira();
  const estudiante = useEstudianteActual();
  const identidad = useIdentidadGira();

  const idInscripcion = Number(inscripcionId);
  const idGira = Number(id);
  const inscripcion = useConsulta(() => obtenerInscripcion(idInscripcion), [idInscripcion]);
  const gira = useConsulta(() => obtenerGira(idGira), [idGira]);
  // El medio de transporte vive en la solicitud de la que nació la gira.
  const idSolicitud = gira.datos?.idSolicitud;
  const solicitud = useConsulta(
    () => (idSolicitud === undefined ? Promise.resolve(null) : obtenerSolicitud(idSolicitud)),
    [idSolicitud],
  );

  function regresarAInscripciones() {
    // navigate(-1) en vez de una ruta fija: esta página se abre tanto desde el
    // roster de una gira puntual como desde el listado global de Inscripciones,
    // y debe regresar a la que corresponda según de dónde vino el usuario.
    navigate(-1);
  }

  if ((inscripcion.cargando && !inscripcion.datos) || (gira.cargando && !gira.datos)) {
    return (
      <div className="flex flex-col gap-6">
        <Regresar onClick={regresarAInscripciones} />
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Cargando inscripción…
        </div>
      </div>
    );
  }

  const datos = inscripcion.datos;
  const giraDatos = gira.datos;
  // Un estudiante solo abre sus propias inscripciones: si escribe la URL de la
  // de otra persona, para él es como si no existiera.
  const ajena = !!datos && rol === "estudiante" && datos.numeroCuenta !== estudiante?.numeroCuenta;

  if (!datos || !giraDatos || ajena) {
    return (
      <div className="flex flex-col gap-6">
        <Regresar onClick={regresarAInscripciones} />
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          {inscripcion.error ?? gira.error ?? "No se encontró la inscripción solicitada."}
        </div>
      </div>
    );
  }

  const aportePorEstudiante =
    giraDatos.totalAproximadoEstudiantes > 0 ? giraDatos.costos / giraDatos.totalAproximadoEstudiantes : null;

  async function dictaminar(decision: string, justificacion: string | null) {
    if (!identidad) return;
    await dictaminarInscripcion(idInscripcion, {
      idJefeMision: identidad.idUsuarioUnidad,
      decision: decision as DecisionInscripcionGira,
      justificacion,
    });
    inscripcion.recargar();
  }

  // Aprobar o rechazar la inscripción le toca al jefe de misión, y solo mientras
  // esté pendiente. Esta ruta también la abren el estudiante y el jefe de
  // aprobación, y ellos solo leen.
  let pie;
  if (rol === "jefe-mision") {
    if (!identidad) pie = <SinIdentidad rol="Jefe de misión" />;
    else if (datos.codigoEstado === "Pendiente") {
      pie = (
        <BloqueDictamen
          titulo="Dictamen de la inscripción"
          descripcion="Al registrarlo cambia el estado de la inscripción y queda en el historial."
          opciones={OPCIONES}
          onConfirmar={dictaminar}
        />
      );
    }
  } else if (rol === "estudiante" && datos.codigoEstado === "Correccion") {
    pie = (
      <section className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-violet-800">Tu inscripción fue devuelta a corrección</h2>
          <p className="mt-1 text-sm text-violet-700">Corrígela y vuelve a enviarla.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/giras/inscripciones/borradores/${datos.idInscripcion}/editar`)}
          className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
        >
          Corregir y reenviar
        </button>
      </section>
    );
  }

  const tieneAcompanante = datos.acompanante !== null;
  const transportes = solicitud.datos?.transportes.map((t) => t.nombre).join(", ");

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <Regresar onClick={regresarAInscripciones} />

      <div>
        <p className="text-xs font-bold tracking-wider text-[#D97706]">ESTUDIANTES</p>
        <h1 className="text-2xl font-bold text-[#1E293B] sm:text-3xl">Detalles de la Inscripción</h1>
        <p className="mt-2 flex items-center gap-3">
          <span className="inline-block rounded-md bg-pink-100 px-2 py-1 font-mono text-xs font-semibold text-rose-800">
            INS-{datos.idInscripcion}
          </span>
          <EstadoGiraBadge codigo={datos.codigoEstado} />
        </p>
      </div>

      {/* Resumen superior de la gira */}
      <div className="rounded-2xl border border-unah-navy/20 bg-slate-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gira asociada</p>
        <h2 className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">{giraDatos.destinoGira ?? NO_ESPECIFICADO}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {giraDatos.nombreCampus} · Jefe de misión: {giraDatos.nombreJefeMision ?? NO_ESPECIFICADO}
        </p>

        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Campo
            etiqueta="Salida"
            valor={
              giraDatos.fechaSalidaConfirmada
                ? `${fechaCorta(giraDatos.fechaSalidaConfirmada)} · ${giraDatos.horaSalidaPropuesta ?? NO_ESPECIFICADO}`
                : null
            }
          />
          <Campo
            etiqueta="Retorno"
            valor={
              giraDatos.fechaRetornoConfirmada
                ? `${fechaCorta(giraDatos.fechaRetornoConfirmada)} · ${giraDatos.horaRetornoPropuesta ?? NO_ESPECIFICADO}`
                : null
            }
          />
          <Campo etiqueta="Transporte" valor={transportes} />
          <Campo
            etiqueta="Aporte"
            valor={aportePorEstudiante !== null ? `L ${formatearMonto(aportePorEstudiante)}` : null}
          />
        </div>
      </div>

      {/* 1. Datos del estudiante */}
      <Tarjeta numero={1} titulo="Datos del Estudiante">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Campo etiqueta="Nombre completo" valor={datos.nombreViajero} />
          <Campo etiqueta="Número de cuenta" valor={datos.numeroCuenta} />
          <Campo etiqueta="Carrera" valor={datos.carreraEstudiante} />
          <Campo etiqueta="Correo" valor={datos.correoPersona} />
          <Campo etiqueta="Teléfono de contacto" valor={datos.telefonoPersona} />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <IndicadorSiNo etiqueta="Inscripción excepcional" valor={datos.esExcepcional} />

          {datos.esExcepcional && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Quién inscribió" valor={datos.nombreInscribidorExcepcional} />
              <Campo etiqueta="Motivo" valor={datos.motivoExcepcion} />
            </div>
          )}
        </div>
      </Tarjeta>

      {/* 2. Acompañante externo */}
      <Tarjeta numero={2} titulo="Acompañante Externo">
        <IndicadorSiNo etiqueta="Viaja con acompañante externo" valor={tieneAcompanante} />

        {datos.acompanante && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Campo etiqueta="Nombre completo" valor={datos.acompanante.nombre} />
            <Campo etiqueta="Fecha de nacimiento" valor={fechaCorta(datos.acompanante.fechaNacimiento)} />
            <Campo etiqueta="Correo" valor={datos.acompanante.correoViajero} />
            <Campo etiqueta="Teléfono" valor={datos.acompanante.telefonoViajeroExterno} />
          </div>
        )}
      </Tarjeta>

      {/* 3. Ficha de salud del estudiante */}
      <Tarjeta numero={3} titulo="Ficha de Salud del Estudiante">
        <BloqueFichaSalud ficha={datos.fichaSaludEstudiante} />
      </Tarjeta>

      {/* 4. Ficha de salud del acompañante externo */}
      {tieneAcompanante && (
        <Tarjeta numero={4} titulo="Ficha de Salud del Acompañante Externo">
          <BloqueFichaSalud ficha={datos.fichaSaludAcompanante} />
        </Tarjeta>
      )}

      {/* 5. Documentos adjuntos */}
      <Tarjeta numero={tieneAcompanante ? 5 : 4} titulo="Documentos Adjuntos">
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
              {datos.documentos.length > 0 ? (
                datos.documentos.map((documento) => (
                  <tr key={documento.idInscripcionDocumento} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-700">{documento.tipoDocumento}</td>
                    <td className="px-4 py-3 text-slate-600">{documento.nombre}</td>
                    <td className="px-4 py-3">
                      <a
                        href={documento.linkDocumento}
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
      <Tarjeta numero={tieneAcompanante ? 6 : 5} titulo="Observaciones">
        <p className="text-sm text-slate-700">{datos.observaciones || NO_ESPECIFICADO}</p>
      </Tarjeta>

      {/* Historial de dictámenes */}
      {datos.dictamenes.length > 0 && (
        <Tarjeta numero={tieneAcompanante ? 7 : 6} titulo="Historial de dictámenes">
          <ul className="flex flex-col gap-3">
            {datos.dictamenes.map((d) => (
              <li key={d.idInscripcionDictamen} className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EstadoGiraBadge
                    codigo={d.codigoEstado === "Aprobado" ? "Inscrito" : d.codigoEstado === "Denegado" ? "Rechazada" : d.codigoEstado}
                  />
                  <span className="text-xs text-slate-400">
                    {d.nombreJefeMision ?? "—"} · {fechaCorta(d.fechaDictamen)}
                  </span>
                </div>
                {d.justificacionDictamen && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{d.justificacionDictamen}</p>
                )}
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      {pie}
    </div>
  );
}
