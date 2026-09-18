import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineDocumentText,
  HiOutlineHeart,
  HiOutlineIdentification,
  HiOutlineMap,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserPlus,
} from "react-icons/hi2";
import StepperFormulario, { type PasoFormulario } from "../../components/StepperFormulario";
import { useUsuarioActual } from "../../context/UserContext";
import { borradoresInscripciones } from "../../data/mockBorradoresInscripciones";
import { misGiras } from "../../data/mockMisGiras";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import { enCorto } from "../../utils/fechas";
import type { FichaSalud } from "../../types";

const todasLasGiras = [...misGiras, ...solicitudesGiras];

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange disabled:bg-slate-50 disabled:text-slate-400";
const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

const PASO_FICHA_ACOMPANANTE = "ficha-acompanante";

const PASOS: PasoFormulario[] = [
  { id: "gira", label: "La gira", icon: HiOutlineMap },
  { id: "datos", label: "Sus datos", icon: HiOutlineUser },
  { id: "acompanante", label: "Acompañante externo", icon: HiOutlineUserPlus },
  { id: "ficha-estudiante", label: "Su ficha de salud", icon: HiOutlineHeart },
  { id: PASO_FICHA_ACOMPANANTE, label: "Ficha del acompañante", icon: HiOutlineIdentification },
  { id: "documentos", label: "Documentos y observaciones", icon: HiOutlineDocumentText },
];

interface DocumentoRespaldo {
  id: string;
  tipo: string;
  nombre: string;
  enlace: string;
}

/** Una ficha de salud tal como se edita: todo texto, el contacto de emergencia aplanado. */
interface FichaForm {
  tipoSangre: string;
  alergias: string;
  condicionesMedicas: string;
  discapacidad: string;
  medicamentos: string;
  contactoNombre: string;
  contactoParentesco: string;
  contactoTelefono: string;
}

function fichaDesde(ficha?: FichaSalud): FichaForm {
  return {
    tipoSangre: ficha?.tipoSangre ?? "",
    alergias: ficha?.alergias ?? "",
    condicionesMedicas: ficha?.condicionesMedicas ?? "",
    discapacidad: ficha?.discapacidad ?? "",
    medicamentos: ficha?.medicamentos ?? "",
    contactoNombre: ficha?.contactoEmergencia?.nombre ?? "",
    contactoParentesco: ficha?.contactoEmergencia?.parentesco ?? "",
    contactoTelefono: ficha?.contactoEmergencia?.telefono ?? "",
  };
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

function CampoTexto({
  etiqueta,
  valor,
  onCambio,
  tipo = "text",
  placeholder,
  ancho,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (valor: string) => void;
  tipo?: "text" | "email" | "tel" | "date";
  placeholder?: string;
  ancho?: string;
}) {
  const id = useId();
  return (
    <div className={ancho}>
      <label htmlFor={id} className={claseLabel}>
        {etiqueta}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onCambio(e.target.value)}
        className={claseInput}
      />
    </div>
  );
}

function DatoResumen({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{valor || "No especificado"}</dd>
    </div>
  );
}

/** Los campos de una ficha de salud; sirven igual para el estudiante y para su acompañante. */
function CamposFichaSalud({
  ficha,
  onCambio,
}: {
  ficha: FichaForm;
  onCambio: (campo: keyof FichaForm, valor: string) => void;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampoTexto
          etiqueta="Tipo de sangre"
          placeholder="Ej. O+"
          valor={ficha.tipoSangre}
          onCambio={(v) => onCambio("tipoSangre", v)}
        />
        <CampoTexto
          etiqueta="Alergias"
          valor={ficha.alergias}
          onCambio={(v) => onCambio("alergias", v)}
        />
        <CampoTexto
          etiqueta="Condiciones médicas"
          valor={ficha.condicionesMedicas}
          onCambio={(v) => onCambio("condicionesMedicas", v)}
        />
        <CampoTexto
          etiqueta="Discapacidad / apoyos"
          valor={ficha.discapacidad}
          onCambio={(v) => onCambio("discapacidad", v)}
        />
        <CampoTexto
          etiqueta="Medicamentos"
          valor={ficha.medicamentos}
          onCambio={(v) => onCambio("medicamentos", v)}
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Contacto de emergencia
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoTexto
            etiqueta="Nombre"
            valor={ficha.contactoNombre}
            onCambio={(v) => onCambio("contactoNombre", v)}
          />
          <CampoTexto
            etiqueta="Parentesco"
            valor={ficha.contactoParentesco}
            onCambio={(v) => onCambio("contactoParentesco", v)}
          />
          <CampoTexto
            etiqueta="Teléfono"
            tipo="tel"
            valor={ficha.contactoTelefono}
            onCambio={(v) => onCambio("contactoTelefono", v)}
          />
        </div>
      </div>
    </>
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
  const [pasoActivo, setPasoActivo] = useState(0);

  // Todo el formulario vive aquí y no en los inputs: solo el paso activo está
  // montado, y lo escrito en un paso tiene que sobrevivir a que se cambie de paso.
  const [giraId, setGiraId] = useState(borrador?.giraId ?? "");
  const [estudiante, setEstudiante] = useState({
    nombre: borrador?.nombreEstudiante ?? "",
    cuenta: borrador?.numeroCuenta ?? "",
    carrera: borrador?.carreraFacultad ?? "",
    correo: borrador?.correoInstitucional ?? "",
    telefono: borrador?.telefonoContacto ?? "",
  });
  const [esExcepcional, setEsExcepcional] = useState(borrador?.esExcepcional ?? false);
  const [excepcion, setExcepcion] = useState({
    inscritoPor: borrador?.inscritoPor ?? usuario.nombreCompleto,
    motivo: borrador?.motivoExcepcion ?? "",
  });
  const [tieneAcompanante, setTieneAcompanante] = useState(borrador?.tieneAcompanante ?? false);
  const [acompanante, setAcompanante] = useState({
    nombreCompleto: borrador?.acompanante?.nombreCompleto ?? "",
    fechaNacimiento: borrador?.acompanante?.fechaNacimiento ?? "",
    correo: borrador?.acompanante?.correo ?? "",
    telefono: borrador?.acompanante?.telefono ?? "",
  });
  const [fichaEstudiante, setFichaEstudiante] = useState(() =>
    fichaDesde(borrador?.fichaSaludEstudiante),
  );
  const [fichaAcompanante, setFichaAcompanante] = useState(() =>
    fichaDesde(borrador?.fichaSaludAcompanante),
  );
  const [documentos, setDocumentos] = useState<DocumentoRespaldo[]>(() =>
    (borrador?.documentos ?? []).map((d) => ({ id: generarId(), ...d })),
  );
  const [observaciones, setObservaciones] = useState(borrador?.observaciones ?? "");
  const [mostrarConfirmacionEnvio, setMostrarConfirmacionEnvio] = useState(false);

  const gira = todasLasGiras.find((g) => g.id === giraId);

  // El paso de la ficha del acompañante solo existe si viaja con uno; si no,
  // sigue en la barra pero apagado y la navegación lo salta.
  const pasos = PASOS.map((paso) =>
    paso.id === PASO_FICHA_ACOMPANANTE ? { ...paso, deshabilitado: !tieneAcompanante } : paso,
  );

  function vecinoAplicable(desde: number, sentido: 1 | -1): number | null {
    for (let i = desde + sentido; i >= 0 && i < pasos.length; i += sentido) {
      if (!pasos[i].deshabilitado) return i;
    }
    return null;
  }
  const indiceAnterior = vecinoAplicable(pasoActivo, -1);
  const indiceSiguiente = vecinoAplicable(pasoActivo, 1);

  const inicioFormularioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inicioFormularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pasoActivo]);

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
            <HiChevronLeft className="h-4 w-4" />
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

        <StepperFormulario pasos={pasos} pasoActivo={pasoActivo} onIr={setPasoActivo} />

        <div ref={inicioFormularioRef} />

        {/* 1. La gira */}
        {pasoActivo === 0 && (
          <SeccionFormulario numero={1} titulo="La gira">
            <label htmlFor="gira" className={claseLabel}>
              Gira a la que se inscribe
            </label>
            <select
              id="gira"
              value={giraId}
              onChange={(e) => setGiraId(e.target.value)}
              className={claseInput}
            >
              <option value="" disabled>
                Selecciona la gira a la que se inscribe
              </option>
              {todasLasGiras.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.destino} — {g.id}
                </option>
              ))}
            </select>

            {gira ? (
              <div className="mt-5 rounded-xl border border-unah-navy/20 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Gira seleccionada
                </p>
                <p className="mt-1 text-lg font-bold text-slate-800">{gira.destino}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {gira.categoria} · Jefe de misión: {gira.docente}
                </p>
                <dl className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3">
                  <DatoResumen etiqueta="Salida" valor={enCorto(gira.fecha)} />
                  <DatoResumen
                    etiqueta="Retorno"
                    valor={gira.fechaRetorno ? enCorto(gira.fechaRetorno) : undefined}
                  />
                  <DatoResumen
                    etiqueta="Cierre de inscripciones"
                    valor={gira.cierreInscripciones ? enCorto(gira.cierreInscripciones) : undefined}
                  />
                </dl>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Elige una gira para ver su resumen antes de continuar.
              </p>
            )}
          </SeccionFormulario>
        )}

        {/* 2. Sus datos */}
        {pasoActivo === 1 && (
          <SeccionFormulario numero={2} titulo="Sus datos">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                etiqueta="Nombre completo del estudiante"
                placeholder="Ej. María José Berganza Domínguez"
                valor={estudiante.nombre}
                onCambio={(v) => setEstudiante((p) => ({ ...p, nombre: v }))}
              />
              <CampoTexto
                etiqueta="Número de cuenta"
                placeholder="Ej. 20191005678"
                valor={estudiante.cuenta}
                onCambio={(v) => setEstudiante((p) => ({ ...p, cuenta: v }))}
              />
              <CampoTexto
                etiqueta="Carrera y facultad"
                placeholder="Ej. Arqueología — Facultad de Ciencias Sociales"
                valor={estudiante.carrera}
                onCambio={(v) => setEstudiante((p) => ({ ...p, carrera: v }))}
              />
              <CampoTexto
                etiqueta="Correo institucional"
                tipo="email"
                placeholder="nombre.apellido@unah.hn"
                valor={estudiante.correo}
                onCambio={(v) => setEstudiante((p) => ({ ...p, correo: v }))}
              />
              <CampoTexto
                etiqueta="Teléfono de contacto"
                tipo="tel"
                placeholder="+504 0000-0000"
                valor={estudiante.telefono}
                onCambio={(v) => setEstudiante((p) => ({ ...p, telefono: v }))}
              />
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
                  <CampoTexto
                    etiqueta="Quién inscribe"
                    valor={excepcion.inscritoPor}
                    onCambio={(v) => setExcepcion((p) => ({ ...p, inscritoPor: v }))}
                  />
                  <CampoTexto
                    etiqueta="Motivo de la excepción"
                    placeholder="Ej. El estudiante estaba fuera del país..."
                    valor={excepcion.motivo}
                    onCambio={(v) => setExcepcion((p) => ({ ...p, motivo: v }))}
                  />
                </div>
              )}
            </div>
          </SeccionFormulario>
        )}

        {/* 3. Acompañante externo */}
        {pasoActivo === 2 && (
          <SeccionFormulario numero={3} titulo="Acompañante externo">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={tieneAcompanante}
                onChange={(e) => setTieneAcompanante(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
              />
              Viaja con un acompañante externo a la universidad
            </label>

            {tieneAcompanante ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CampoTexto
                  etiqueta="Nombre completo"
                  valor={acompanante.nombreCompleto}
                  onCambio={(v) => setAcompanante((p) => ({ ...p, nombreCompleto: v }))}
                />
                <CampoTexto
                  etiqueta="Fecha de nacimiento"
                  tipo="date"
                  valor={acompanante.fechaNacimiento}
                  onCambio={(v) => setAcompanante((p) => ({ ...p, fechaNacimiento: v }))}
                />
                <CampoTexto
                  etiqueta="Correo"
                  tipo="email"
                  valor={acompanante.correo}
                  onCambio={(v) => setAcompanante((p) => ({ ...p, correo: v }))}
                />
                <CampoTexto
                  etiqueta="Teléfono"
                  tipo="tel"
                  valor={acompanante.telefono}
                  onCambio={(v) => setAcompanante((p) => ({ ...p, telefono: v }))}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Si viajas solo, sigue al siguiente paso. Si marcas la casilla, se habilita también
                la ficha de salud de tu acompañante.
              </p>
            )}
          </SeccionFormulario>
        )}

        {/* 4. Su ficha de salud */}
        {pasoActivo === 3 && (
          <SeccionFormulario numero={4} titulo="Su ficha de salud">
            <CamposFichaSalud
              ficha={fichaEstudiante}
              onCambio={(campo, valor) => setFichaEstudiante((p) => ({ ...p, [campo]: valor }))}
            />
          </SeccionFormulario>
        )}

        {/* 5. Ficha del acompañante (solo si viaja con uno) */}
        {pasoActivo === 4 && tieneAcompanante && (
          <SeccionFormulario numero={5} titulo="Ficha del acompañante">
            <CamposFichaSalud
              ficha={fichaAcompanante}
              onCambio={(campo, valor) => setFichaAcompanante((p) => ({ ...p, [campo]: valor }))}
            />
          </SeccionFormulario>
        )}

        {/* 6. Documentos y observaciones */}
        {pasoActivo === 5 && (
          <SeccionFormulario numero={6} titulo="Documentos y observaciones">
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
                    <tr
                      key={documento.id}
                      className="transition-colors duration-150 hover:bg-slate-100"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label="Tipo de documento"
                          placeholder="Ej. Carné de estudiante"
                          value={documento.tipo}
                          onChange={(e) => actualizarDocumento(documento.id, "tipo", e.target.value)}
                          className={claseInput}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label="Nombre del documento"
                          placeholder="Ej. carne_estudiante.pdf"
                          value={documento.nombre}
                          onChange={(e) =>
                            actualizarDocumento(documento.id, "nombre", e.target.value)
                          }
                          className={claseInput}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label="Enlace del documento"
                          placeholder="https://..."
                          value={documento.enlace}
                          onChange={(e) =>
                            actualizarDocumento(documento.id, "enlace", e.target.value)
                          }
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

            <div className="mt-6">
              <label htmlFor="observaciones" className={claseLabel}>
                Observaciones
              </label>
              <textarea
                id="observaciones"
                rows={3}
                placeholder="Notas u observaciones generales sobre la inscripción..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className={`${claseInput} resize-none`}
              />
            </div>
          </SeccionFormulario>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {indiceAnterior !== null && (
              <button
                type="button"
                onClick={() => setPasoActivo(indiceAnterior)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <HiChevronLeft className="h-4 w-4" />
                Anterior
              </button>
            )}
            <p className="text-xs text-slate-400 sm:max-w-xs">
              Al enviarla queda registrada en el roster de la gira y ya no podrás editarla.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={manejarGuardarBorrador}
              className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-200"
            >
              Guardar borrador
            </button>
            {indiceSiguiente === null ? (
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEnvio(true)}
                className="rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
              >
                Enviar inscripción
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPasoActivo(indiceSiguiente)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
              >
                Siguiente
                <HiChevronRight className="h-4 w-4" />
              </button>
            )}
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
