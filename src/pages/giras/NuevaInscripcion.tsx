import { useEffect, useMemo, useRef, useState } from "react";
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
import SinIdentidad from "../../components/giras/SinIdentidad";
import {
  actualizarInscripcion,
  crearInscripcion,
  enviarInscripcion,
  listarGiras,
  listarTodosLosCatalogos,
  listarUsuarios,
  obtenerInscripcion,
} from "../../api/giras";
import { mensajeDeError } from "../../api/cliente";
import { useConsulta } from "../../api/useConsulta";
import { useIdentidadGira, useRolGira } from "../../context/UserContext";
import { fechaCorta } from "../../utils/girasFormato";
import type {
  GiraApi,
  InscripcionGiraDetalle,
  RegistroCatalogoApi,
  UsuarioUnidadGira,
} from "../../types/giras";
import { CampoTexto, CamposFichaSalud, DatoResumen, SeccionFormulario } from "./nuevaInscripcion/Campos";
import {
  claseInput,
  claseLabel,
  cuerpoDesde,
  formularioDesde,
  formularioVacio,
  idLocal,
  type FichaForm,
  type FormularioInscripcion,
} from "./nuevaInscripcion/formulario";

const PASO_FICHA_ACOMPANANTE = "ficha-acompanante";

const PASOS: PasoFormulario[] = [
  { id: "gira", label: "La gira", icon: HiOutlineMap },
  { id: "datos", label: "Sus datos", icon: HiOutlineUser },
  { id: "acompanante", label: "Acompañante externo", icon: HiOutlineUserPlus },
  { id: "ficha-estudiante", label: "Su ficha de salud", icon: HiOutlineHeart },
  { id: PASO_FICHA_ACOMPANANTE, label: "Ficha del acompañante", icon: HiOutlineIdentification },
  { id: "documentos", label: "Documentos y observaciones", icon: HiOutlineDocumentText },
];

/** Una gira que ya terminó o se canceló no recibe inscripciones. */
const ESTADOS_CERRADOS = ["Cancelada", "Finalizada"];

interface Contexto {
  /** true si inscribe el jefe de misión en nombre de un estudiante. */
  esExcepcional: boolean;
  idTipoInscripcion: number;
  giras: GiraApi[];
  tiposDeSangre: RegistroCatalogoApi[];
  viajeros: UsuarioUnidadGira[];
  quienInscribe: UsuarioUnidadGira;
}

function Formulario({
  inicial,
  inscripcion,
  contexto,
}: {
  inicial: FormularioInscripcion;
  /** La inscripción que se edita (borrador o en corrección); undefined si es nueva. */
  inscripcion?: InscripcionGiraDetalle;
  contexto: Contexto;
}) {
  const navigate = useNavigate();
  const { esExcepcional, giras, tiposDeSangre, viajeros, quienInscribe } = contexto;

  const [f, setF] = useState<FormularioInscripcion>(inicial);
  const [pasoActivo, setPasoActivo] = useState(0);
  const [mostrarConfirmacionEnvio, setMostrarConfirmacionEnvio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inicioFormularioRef = useRef<HTMLDivElement>(null);

  const enCorreccion = inscripcion?.codigoEstado === "Correccion";
  const gira = giras.find((g) => String(g.idGira) === f.idGira);
  const observacionDelDictamen = enCorreccion ? inscripcion?.dictamenes[0]?.justificacionDictamen : null;

  // El paso de la ficha del acompañante solo existe si viaja con uno; si no,
  // sigue en la barra pero apagado y la navegación lo salta.
  const pasos = PASOS.map((paso) =>
    paso.id === PASO_FICHA_ACOMPANANTE ? { ...paso, deshabilitado: !f.tieneAcompanante } : paso,
  );

  function vecinoAplicable(desde: number, sentido: 1 | -1): number | null {
    for (let i = desde + sentido; i >= 0 && i < pasos.length; i += sentido) {
      if (!pasos[i].deshabilitado) return i;
    }
    return null;
  }
  const indiceAnterior = vecinoAplicable(pasoActivo, -1);
  const indiceSiguiente = vecinoAplicable(pasoActivo, 1);

  useEffect(() => {
    inicioFormularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pasoActivo]);

  function cambiar(parcial: Partial<FormularioInscripcion>) {
    setF((previo) => ({ ...previo, ...parcial }));
  }

  /** Lo que la base exige aunque sea un borrador; devuelve el mensaje, o null si está bien. */
  function problema(): string | null {
    if (!f.idGira) return "Elige la gira a la que se inscribe.";
    if (esExcepcional && !f.idViajero) return "Elige al estudiante que se inscribe.";
    // El trigger de inscripciones excepcionales lo exige desde el primer guardado.
    if (esExcepcional && !f.motivoExcepcion.trim()) return "Escribe el motivo de la excepción para poder guardar.";
    if (f.tieneAcompanante) {
      const a = f.acompanante;
      if (!a.nombre.trim() || !a.fechaNacimiento || !a.correoViajero.trim()) {
        return "Completa el nombre, la fecha de nacimiento y el correo del acompañante.";
      }
    }
    return null;
  }

  /** Guarda (POST o PUT) y, si `enviar`, la manda a revisión. */
  async function guardar(enviar: boolean) {
    const motivo = problema();
    if (motivo) {
      setMostrarConfirmacionEnvio(false);
      setError(motivo);
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      const cuerpo = cuerpoDesde(f, {
        idTipoInscripcion: contexto.idTipoInscripcion,
        idInscribidorExcepcional: esExcepcional ? quienInscribe.idUsuarioUnidad : null,
      });
      if (inscripcion) {
        await actualizarInscripcion(inscripcion.idInscripcion, cuerpo);
        if (enviar) await enviarInscripcion(inscripcion.idInscripcion);
      } else {
        await crearInscripcion({
          ...cuerpo,
          idGira: Number(f.idGira),
          idViajero: esExcepcional ? Number(f.idViajero) : quienInscribe.idUsuarioUnidad,
          enviar,
        });
      }
      navigate(enviar || enCorreccion ? "/giras/inscripciones" : "/giras/inscripciones/borradores");
    } catch (causa) {
      setMostrarConfirmacionEnvio(false);
      setError(mensajeDeError(causa));
    } finally {
      setGuardando(false);
    }
  }

  function regresar() {
    navigate(inscripcion && !enCorreccion ? "/giras/inscripciones/borradores" : "/giras/inscripciones");
  }

  function cambiarFicha(cual: "fichaEstudiante" | "fichaAcompanante", campo: keyof FichaForm, valor: string) {
    setF((previo) => ({ ...previo, [cual]: { ...previo[cual], [campo]: valor } }));
  }

  function cambiarDocumento(id: string, campo: "tipoDocumento" | "nombre" | "linkDocumento", valor: string) {
    setF((previo) => ({
      ...previo,
      documentos: previo.documentos.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)),
    }));
  }

  // Las giras que se ofrecen: la que ya tiene el borrador siempre, y de las demás solo las abiertas
  // (el jefe de misión, que inscribe de forma excepcional, ve también las que aún no abren inscripción).
  const girasOfrecidas = giras.filter(
    (g) =>
      String(g.idGira) === f.idGira ||
      (esExcepcional ? !ESTADOS_CERRADOS.includes(g.codigoEstado) : g.codigoEstado === "Inscripcion abierta"),
  );
  const estudianteElegido = viajeros.find((v) => String(v.idUsuarioUnidad) === f.idViajero);
  const datosDelEstudiante = esExcepcional ? estudianteElegido : quienInscribe;

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
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
              {enCorreccion ? "Corregir Inscripción" : inscripcion ? "Editar Borrador de Inscripción" : "Nueva Inscripción"}
            </h1>
            {inscripcion && <p className="mt-1 text-sm text-slate-400">INS-{inscripcion.idInscripcion}</p>}
          </div>
        </div>

        {observacionDelDictamen && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm font-bold text-violet-800">El jefe de misión pidió correcciones</p>
            <p className="mt-1 text-sm leading-relaxed text-violet-700">{observacionDelDictamen}</p>
          </div>
        )}

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
              value={f.idGira}
              onChange={(e) => cambiar({ idGira: e.target.value })}
              disabled={!!inscripcion}
              className={claseInput}
            >
              <option value="" disabled>
                Selecciona la gira a la que se inscribe
              </option>
              {girasOfrecidas.map((g) => (
                <option key={g.idGira} value={g.idGira}>
                  {g.destinoGira ?? "Sin destino"} — GIR-{g.idGira}
                </option>
              ))}
            </select>
            {girasOfrecidas.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No hay giras con inscripciones abiertas. Una gira se crea al aprobarse su solicitud.
              </p>
            )}

            {gira ? (
              <div className="mt-5 rounded-xl border border-unah-navy/20 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gira seleccionada</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{gira.destinoGira ?? "Sin destino"}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {gira.nombreCampus} · Jefe de misión: {gira.nombreJefeMision ?? "—"}
                </p>
                <dl className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3">
                  <DatoResumen etiqueta="Salida" valor={gira.fechaSalidaConfirmada ? fechaCorta(gira.fechaSalidaConfirmada) : null} />
                  <DatoResumen etiqueta="Retorno" valor={gira.fechaRetornoConfirmada ? fechaCorta(gira.fechaRetornoConfirmada) : null} />
                  <DatoResumen
                    etiqueta="Cierre de inscripciones"
                    valor={gira.fechaFinInscripcion ? fechaCorta(gira.fechaFinInscripcion) : null}
                  />
                </dl>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Elige una gira para ver su resumen antes de continuar.</p>
            )}
          </SeccionFormulario>
        )}

        {/* 2. Sus datos */}
        {pasoActivo === 1 && (
          <SeccionFormulario numero={2} titulo={esExcepcional ? "Datos del estudiante" : "Sus datos"}>
            {esExcepcional && (
              <div className="mb-5">
                <label htmlFor="viajero" className={claseLabel}>
                  Estudiante que se inscribe
                </label>
                <select
                  id="viajero"
                  value={f.idViajero}
                  onChange={(e) => cambiar({ idViajero: e.target.value })}
                  disabled={!!inscripcion}
                  className={claseInput}
                >
                  <option value="" disabled>
                    Selecciona al estudiante
                  </option>
                  {viajeros.map((v) => (
                    <option key={v.idUsuarioUnidad} value={v.idUsuarioUnidad}>
                      {v.nombreCompleto}
                      {v.numeroCuenta ? ` · ${v.numeroCuenta}` : ""}
                    </option>
                  ))}
                </select>
                {viajeros.length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">No hay estudiantes (rol Viajero) en la base de datos.</p>
                )}
              </div>
            )}

            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DatoResumen etiqueta="Nombre completo" valor={datosDelEstudiante?.nombreCompleto} />
              <DatoResumen etiqueta="Número de cuenta" valor={datosDelEstudiante?.numeroCuenta} />
              <DatoResumen etiqueta="Correo" valor={datosDelEstudiante?.correoPersona} />
              <DatoResumen etiqueta="Teléfono de contacto" valor={datosDelEstudiante?.telefonoPersona} />
            </dl>
            <p className="mt-3 text-xs text-slate-400">Estos datos vienen del expediente y no se editan aquí.</p>

            {esExcepcional ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-slate-600">
                  Inscripción excepcional: la registras tú en nombre del estudiante.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <CampoTexto etiqueta="Quién inscribe" valor={quienInscribe.nombreCompleto} onCambio={() => {}} deshabilitado />
                  <CampoTexto
                    etiqueta="Motivo de la excepción"
                    placeholder="Ej. El estudiante estaba fuera del país..."
                    maxLength={500}
                    valor={f.motivoExcepcion}
                    onCambio={(v) => cambiar({ motivoExcepcion: v })}
                  />
                </div>
              </div>
            ) : null}
          </SeccionFormulario>
        )}

        {/* 3. Acompañante externo */}
        {pasoActivo === 2 && (
          <SeccionFormulario numero={3} titulo="Acompañante externo">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={f.tieneAcompanante}
                onChange={(e) => cambiar({ tieneAcompanante: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
              />
              Viaja con un acompañante externo a la universidad
            </label>

            {f.tieneAcompanante ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CampoTexto
                  etiqueta="Nombre completo"
                  maxLength={120}
                  valor={f.acompanante.nombre}
                  onCambio={(v) => cambiar({ acompanante: { ...f.acompanante, nombre: v } })}
                />
                <CampoTexto
                  etiqueta="Fecha de nacimiento"
                  tipo="date"
                  valor={f.acompanante.fechaNacimiento}
                  onCambio={(v) => cambiar({ acompanante: { ...f.acompanante, fechaNacimiento: v } })}
                />
                <CampoTexto
                  etiqueta="Correo"
                  tipo="email"
                  maxLength={120}
                  valor={f.acompanante.correoViajero}
                  onCambio={(v) => cambiar({ acompanante: { ...f.acompanante, correoViajero: v } })}
                />
                <CampoTexto
                  etiqueta="Teléfono"
                  tipo="tel"
                  maxLength={30}
                  valor={f.acompanante.telefonoViajeroExterno}
                  onCambio={(v) => cambiar({ acompanante: { ...f.acompanante, telefonoViajeroExterno: v } })}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                Si viaja solo, sigue al siguiente paso. Si marcas la casilla, se habilita también la ficha de salud
                del acompañante.
              </p>
            )}
          </SeccionFormulario>
        )}

        {/* 4. Su ficha de salud */}
        {pasoActivo === 3 && (
          <SeccionFormulario numero={4} titulo="Su ficha de salud">
            <CamposFichaSalud
              ficha={f.fichaEstudiante}
              tiposDeSangre={tiposDeSangre}
              onCambio={(campo, valor) => cambiarFicha("fichaEstudiante", campo, valor)}
            />
          </SeccionFormulario>
        )}

        {/* 5. Ficha del acompañante (solo si viaja con uno) */}
        {pasoActivo === 4 && f.tieneAcompanante && (
          <SeccionFormulario numero={5} titulo="Ficha del acompañante">
            <CamposFichaSalud
              ficha={f.fichaAcompanante}
              tiposDeSangre={tiposDeSangre}
              onCambio={(campo, valor) => cambiarFicha("fichaAcompanante", campo, valor)}
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
                onClick={() =>
                  cambiar({ documentos: [...f.documentos, { id: idLocal(), tipoDocumento: "", nombre: "", linkDocumento: "" }] })
                }
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
                  {f.documentos.map((documento) => (
                    <tr key={documento.id} className="transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label="Tipo de documento"
                          maxLength={40}
                          placeholder="Ej. Carné de estudiante"
                          value={documento.tipoDocumento}
                          onChange={(e) => cambiarDocumento(documento.id, "tipoDocumento", e.target.value)}
                          className={claseInput}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label="Nombre del documento"
                          maxLength={200}
                          placeholder="Ej. carne_estudiante.pdf"
                          value={documento.nombre}
                          onChange={(e) => cambiarDocumento(documento.id, "nombre", e.target.value)}
                          className={claseInput}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          aria-label="Enlace del documento"
                          maxLength={400}
                          placeholder="https://..."
                          value={documento.linkDocumento}
                          onChange={(e) => cambiarDocumento(documento.id, "linkDocumento", e.target.value)}
                          className={claseInput}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          title="Quitar documento"
                          onClick={() => cambiar({ documentos: f.documentos.filter((d) => d.id !== documento.id) })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {f.documentos.length === 0 && (
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
                maxLength={1000}
                placeholder="Notas u observaciones generales sobre la inscripción..."
                value={f.observaciones}
                onChange={(e) => cambiar({ observaciones: e.target.value })}
                className={`${claseInput} resize-none`}
              />
            </div>
          </SeccionFormulario>
        )}

        {error && (
          <p role="alert" className="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </p>
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
              Al enviarla queda pendiente de revisión del jefe de misión y ya no podrás editarla.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => guardar(false)}
              disabled={guardando}
              className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-200 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : enCorreccion ? "Guardar cambios" : "Guardar borrador"}
            </button>
            {indiceSiguiente === null ? (
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEnvio(true)}
                disabled={guardando}
                className="rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark disabled:opacity-60"
              >
                {enCorreccion ? "Reenviar inscripción" : "Enviar inscripción"}
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
            <h2 className="text-xl font-bold text-[#1E293B]">¿Estás seguro de que quieres enviar la inscripción?</h2>
            <p className="mt-3 text-sm text-slate-500">
              Una vez enviada, la inscripción quedará pendiente de revisión y no podrás realizarle cambios ni
              modificaciones.
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
                onClick={() => guardar(true)}
                disabled={guardando}
                className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                {guardando ? "Enviando…" : "Sí, enviar inscripción"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Carga lo que el formulario ofrece (giras, tipos de sangre, tipos de
 * inscripción, estudiantes) y, si se edita un borrador, la inscripción; con
 * todo listo monta el formulario ya inicializado. Un estudiante se inscribe
 * solo; el jefe de misión inscribe a nombre de un estudiante (excepcional).
 */
export default function NuevaInscripcion() {
  const { borradorId } = useParams();
  const { rol } = useRolGira();
  const identidad = useIdentidadGira();

  const esExcepcional = rol === "jefe-mision";
  const puedeInscribir = rol === "estudiante" || rol === "jefe-mision";

  const giras = useConsulta(() => listarGiras(), []);
  const catalogos = useConsulta(() => listarTodosLosCatalogos(), []);
  const viajeros = useConsulta(
    () => (esExcepcional ? listarUsuarios({ rol: "viajero" }) : Promise.resolve([])),
    [esExcepcional],
  );
  const idInscripcion = borradorId ? Number(borradorId) : null;
  const inscripcion = useConsulta(
    () => (idInscripcion === null ? Promise.resolve(null) : obtenerInscripcion(idInscripcion)),
    [idInscripcion],
  );

  // El tipo de inscripción se busca en la tabla tipo por lo que exige, no por su id ni su nombre.
  const idTipoInscripcion = useMemo(() => {
    const tipos = catalogos.datos?.["inscripcion"] ?? [];
    const tipo = tipos.find((t) => t.activo && (t["requiereMotivo"] === true) === esExcepcional);
    return tipo?.id ?? null;
  }, [catalogos.datos, esExcepcional]);

  if (!puedeInscribir) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        Solo un estudiante o un jefe de misión pueden registrar una inscripción.
      </p>
    );
  }
  if (!identidad) return <SinIdentidad rol={esExcepcional ? "Jefe de misión" : "Estudiante"} />;

  const error = giras.error ?? catalogos.error ?? viajeros.error ?? inscripcion.error;
  if (error) return <p className="rounded-2xl bg-white p-6 text-sm font-medium text-rose-600 shadow-sm">{error}</p>;

  const esperandoInscripcion = idInscripcion !== null && inscripcion.datos === null;
  if (!giras.datos || !catalogos.datos || !viajeros.datos || esperandoInscripcion) {
    return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">Cargando formulario…</p>;
  }
  if (idTipoInscripcion === null) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm font-medium text-rose-600 shadow-sm">
        No hay un tipo de inscripción activo para {esExcepcional ? "inscripciones excepcionales" : "inscripciones autogestionadas"}.
        Revisa la tabla tipo «Tipos de inscripción» en Configuraciones.
      </p>
    );
  }

  const editando = inscripcion.datos ?? undefined;
  return (
    <Formulario
      key={editando?.idInscripcion ?? "nueva"}
      inicial={editando ? formularioDesde(editando) : formularioVacio()}
      inscripcion={editando}
      contexto={{
        esExcepcional,
        idTipoInscripcion,
        giras: giras.datos,
        tiposDeSangre: catalogos.datos["sangre"] ?? [],
        viajeros: viajeros.datos,
        quienInscribe: identidad,
      }}
    />
  );
}
