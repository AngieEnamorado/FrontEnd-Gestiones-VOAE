import { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { useUsuarioActual } from "../../context/UserContext";
import { borradoresInscripciones } from "../../data/mockBorradoresInscripciones";
import { misGiras } from "../../data/mockMisGiras";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";

const todasLasGiras = [...misGiras, ...solicitudesGiras];

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange disabled:bg-slate-50 disabled:text-slate-400";
const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

interface DocumentoRespaldo {
  id: string;
  tipo: string;
  nombre: string;
  enlace: string;
}

let contadorId = 0;
function generarId() {
  contadorId += 1;
  return `tmp-${contadorId}`;
}

function SeccionFormulario({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">
        <span className="mr-2 text-unah-orange">{numero}.</span>
        {titulo}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function NuevaInscripcion() {
  const navigate = useNavigate();
  const usuario = useUsuarioActual();
  const { borradorId } = useParams();
  const borrador = useMemo(
    () => borradoresInscripciones.find((b) => b.id === borradorId),
    [borradorId],
  );

  const [giraId, setGiraId] = useState(borrador?.giraId ?? "");
  const [esExcepcional, setEsExcepcional] = useState(borrador?.esExcepcional ?? false);
  const [tieneAcompanante, setTieneAcompanante] = useState(borrador?.tieneAcompanante ?? false);
  const [documentos, setDocumentos] = useState<DocumentoRespaldo[]>(() =>
    (borrador?.documentos ?? []).map((d) => ({ id: generarId(), ...d })),
  );
  const [mostrarConfirmacionEnvio, setMostrarConfirmacionEnvio] = useState(false);

  function agregarDocumento() {
    setDocumentos((prev) => [...prev, { id: generarId(), tipo: "", nombre: "", enlace: "" }]);
  }

  function actualizarDocumento(id: string, campo: keyof Omit<DocumentoRespaldo, "id">, valor: string) {
    setDocumentos((prev) => prev.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)));
  }

  function quitarDocumento(id: string) {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  }

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
  }

  function confirmarEnvio() {
    setMostrarConfirmacionEnvio(false);
    navigate("/giras/inscripciones");
  }

  function manejarGuardarBorrador() {
    navigate("/giras/inscripciones/borradores");
  }

  function regresar() {
    navigate(borrador ? "/giras/inscripciones/borradores" : "/giras/inscripciones");
  }

  return (
    <>
      <form onSubmit={manejarEnvio} className="flex flex-col gap-6">
        {/* Encabezado */}
        <div>
          <button
            type="button"
            onClick={regresar}
            className="flex items-center gap-2 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Regresar
          </button>

          <div className="mt-4">
            <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              {borrador ? "Editar Borrador de Inscripción" : "Nueva Inscripción"}
            </h1>
            {borrador && <p className="mt-1 text-sm text-slate-400">Borrador {borrador.id}</p>}
          </div>
        </div>

        {/* 1. Gira y datos del estudiante */}
        <SeccionFormulario numero={1} titulo="Gira y Datos del Estudiante">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={claseLabel}>Gira</label>
              <select
                value={giraId}
                onChange={(e) => setGiraId(e.target.value)}
                className={claseInput}
              >
                <option value="" disabled>
                  Selecciona la gira a la que se inscribe
                </option>
                {todasLasGiras.map((gira) => (
                  <option key={gira.id} value={gira.id}>
                    {gira.destino} — {gira.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={claseLabel}>Nombre completo del estudiante</label>
              <input
                type="text"
                placeholder="Ej. María José Berganza Domínguez"
                defaultValue={borrador?.nombreEstudiante ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Número de cuenta</label>
              <input
                type="text"
                placeholder="Ej. 20191005678"
                defaultValue={borrador?.numeroCuenta ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Carrera y facultad</label>
              <input
                type="text"
                placeholder="Ej. Arqueología — Facultad de Ciencias Sociales"
                defaultValue={borrador?.carreraFacultad ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Correo institucional</label>
              <input
                type="email"
                placeholder="nombre.apellido@unah.hn"
                defaultValue={borrador?.correoInstitucional ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Teléfono de contacto</label>
              <input
                type="tel"
                placeholder="+504 0000-0000"
                defaultValue={borrador?.telefonoContacto ?? ""}
                className={claseInput}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={esExcepcional}
                onChange={(e) => setEsExcepcional(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
              />
              Inscripción excepcional (la registra otra persona en nombre del estudiante)
            </label>

            {esExcepcional && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={claseLabel}>Quién inscribe</label>
                  <input
                    type="text"
                    defaultValue={borrador?.inscritoPor ?? usuario.nombreCompleto}
                    className={claseInput}
                  />
                </div>
                <div>
                  <label className={claseLabel}>Motivo de la excepción</label>
                  <input
                    type="text"
                    placeholder="Ej. El estudiante estaba fuera del país..."
                    defaultValue={borrador?.motivoExcepcion ?? ""}
                    className={claseInput}
                  />
                </div>
              </div>
            )}
          </div>
        </SeccionFormulario>

        {/* 2. Acompañante externo */}
        <SeccionFormulario numero={2} titulo="Acompañante Externo">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={tieneAcompanante}
              onChange={(e) => setTieneAcompanante(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
            />
            Viaja con un acompañante externo a la universidad
          </label>

          {tieneAcompanante && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={claseLabel}>Nombre completo</label>
                <input
                  type="text"
                  defaultValue={borrador?.acompanante?.nombreCompleto ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Fecha de nacimiento</label>
                <input
                  type="date"
                  defaultValue={borrador?.acompanante?.fechaNacimiento ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Correo</label>
                <input
                  type="email"
                  defaultValue={borrador?.acompanante?.correo ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Teléfono</label>
                <input
                  type="tel"
                  defaultValue={borrador?.acompanante?.telefono ?? ""}
                  className={claseInput}
                />
              </div>
            </div>
          )}
        </SeccionFormulario>

        {/* 3. Ficha de salud del estudiante */}
        <SeccionFormulario numero={3} titulo="Ficha de Salud del Estudiante">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={claseLabel}>Tipo de sangre</label>
              <input
                type="text"
                placeholder="Ej. O+"
                defaultValue={borrador?.fichaSaludEstudiante?.tipoSangre ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Alergias</label>
              <input
                type="text"
                defaultValue={borrador?.fichaSaludEstudiante?.alergias ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Condiciones médicas</label>
              <input
                type="text"
                defaultValue={borrador?.fichaSaludEstudiante?.condicionesMedicas ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Discapacidad / apoyos</label>
              <input
                type="text"
                defaultValue={borrador?.fichaSaludEstudiante?.discapacidad ?? ""}
                className={claseInput}
              />
            </div>
            <div>
              <label className={claseLabel}>Medicamentos</label>
              <input
                type="text"
                defaultValue={borrador?.fichaSaludEstudiante?.medicamentos ?? ""}
                className={claseInput}
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Contacto de emergencia
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={claseLabel}>Nombre</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludEstudiante?.contactoEmergencia?.nombre ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Parentesco</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludEstudiante?.contactoEmergencia?.parentesco ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Teléfono</label>
                <input
                  type="tel"
                  defaultValue={borrador?.fichaSaludEstudiante?.contactoEmergencia?.telefono ?? ""}
                  className={claseInput}
                />
              </div>
            </div>
          </div>
        </SeccionFormulario>

        {/* 4. Ficha de salud del acompañante externo */}
        {tieneAcompanante && (
          <SeccionFormulario numero={4} titulo="Ficha de Salud del Acompañante Externo">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={claseLabel}>Tipo de sangre</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludAcompanante?.tipoSangre ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Alergias</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludAcompanante?.alergias ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Condiciones médicas</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludAcompanante?.condicionesMedicas ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Discapacidad / apoyos</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludAcompanante?.discapacidad ?? ""}
                  className={claseInput}
                />
              </div>
              <div>
                <label className={claseLabel}>Medicamentos</label>
                <input
                  type="text"
                  defaultValue={borrador?.fichaSaludAcompanante?.medicamentos ?? ""}
                  className={claseInput}
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contacto de emergencia
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={claseLabel}>Nombre</label>
                  <input
                    type="text"
                    defaultValue={borrador?.fichaSaludAcompanante?.contactoEmergencia?.nombre ?? ""}
                    className={claseInput}
                  />
                </div>
                <div>
                  <label className={claseLabel}>Parentesco</label>
                  <input
                    type="text"
                    defaultValue={borrador?.fichaSaludAcompanante?.contactoEmergencia?.parentesco ?? ""}
                    className={claseInput}
                  />
                </div>
                <div>
                  <label className={claseLabel}>Teléfono</label>
                  <input
                    type="tel"
                    defaultValue={borrador?.fichaSaludAcompanante?.contactoEmergencia?.telefono ?? ""}
                    className={claseInput}
                  />
                </div>
              </div>
            </div>
          </SeccionFormulario>
        )}

        {/* 5. Documentos */}
        <SeccionFormulario numero={tieneAcompanante ? 5 : 4} titulo="Documentos Adjuntos">
          <div className="flex items-center justify-between">
            <p className={claseLabel}>Documentos de respaldo</p>
            <button
              type="button"
              onClick={agregarDocumento}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-slate-50"
            >
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Agregar documento
            </button>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Enlace / URL</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentos.map((documento) => (
                  <tr key={documento.id} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Ej. Carné de estudiante"
                        value={documento.tipo}
                        onChange={(e) => actualizarDocumento(documento.id, "tipo", e.target.value)}
                        className={claseInput}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Ej. carne_estudiante.pdf"
                        value={documento.nombre}
                        onChange={(e) => actualizarDocumento(documento.id, "nombre", e.target.value)}
                        className={claseInput}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={documento.enlace}
                        onChange={(e) => actualizarDocumento(documento.id, "enlace", e.target.value)}
                        className={claseInput}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        title="Quitar documento"
                        onClick={() => quitarDocumento(documento.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {documentos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                      Aún no se han agregado documentos de respaldo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SeccionFormulario>

        {/* 6. Observaciones */}
        <SeccionFormulario numero={tieneAcompanante ? 6 : 5} titulo="Observaciones">
          <textarea
            rows={3}
            placeholder="Notas u observaciones generales sobre la inscripción..."
            defaultValue={borrador?.observaciones ?? ""}
            className={`${claseInput} resize-none`}
          />
        </SeccionFormulario>

        {/* Acciones */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400 sm:max-w-xs">
            Al enviarla queda registrada en el roster de la gira y ya no podrás editarla.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={manejarGuardarBorrador}
              className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-200"
            >
              Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => setMostrarConfirmacionEnvio(true)}
              className="rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
            >
              Enviar inscripción
            </button>
          </div>
        </div>
      </form>

      {mostrarConfirmacionEnvio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setMostrarConfirmacionEnvio(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#1E293B]">
              ¿Estás seguro de que quieres enviar la inscripción?
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Una vez enviada, la inscripción quedará pendiente de revisión y no podrás realizarle
              cambios ni modificaciones.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEnvio(false)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEnvio}
                className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Sí, enviar inscripción
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
