import { useEffect, useId, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import Interruptor from "../../../components/Interruptor";
import { mensajeDeError } from "../../../api/cliente";
import type { RegistroCatalogoApi } from "../../../types/giras";
import { APLICA_A, type DefinicionTablaTipo } from "./catalogosGira";

const claseInput =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";
const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

/** Qué abrió la modal: un registro nuevo (sin `registro`) o la edición de uno. */
export interface DialogoRegistro {
  registro?: RegistroCatalogoApi;
}

function FormularioRegistro({
  dialogo,
  tabla,
  onGuardar,
  onClose,
}: {
  dialogo: DialogoRegistro;
  tabla: DefinicionTablaTipo;
  onGuardar: (datos: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const editando = dialogo.registro;
  const idTitulo = useId();
  const idNombre = useId();
  const idDescripcion = useId();
  const idAplicaA = useId();

  const [nombre, setNombre] = useState(editando?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(editando?.descripcion ?? "");
  const [aplicaA, setAplicaA] = useState(String(editando?.["aplicaA"] ?? "AMBAS"));
  const [requiereMotivo, setRequiereMotivo] = useState(editando?.["requiereMotivo"] === true);
  const [activo, setActivo] = useState(editando?.activo ?? true);
  // Los errores no aparecen mientras la persona todavía está escribiendo por
  // primera vez: solo después de intentar guardar.
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  useEffect(() => {
    function alPulsar(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [onClose]);

  const nombreLimpio = nombre.trim();
  const errorNombre = nombreLimpio ? "" : "El nombre es obligatorio.";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setIntentoGuardar(true);
    if (errorNombre || guardando) return;

    const datos: Record<string, unknown> = { nombre: nombreLimpio };
    if (tabla.conDescripcion) datos["descripcion"] = descripcion.trim();
    if (tabla.extras?.includes("aplicaA")) datos["aplicaA"] = aplicaA;
    if (tabla.extras?.includes("requiereMotivo")) datos["requiereMotivo"] = requiereMotivo;
    if (tabla.conEstado) datos["activo"] = activo;

    setGuardando(true);
    setErrorApi(null);
    try {
      await onGuardar(datos);
    } catch (causa) {
      // Un nombre repetido, por ejemplo, vuelve como 409 con su mensaje.
      setErrorApi(mensajeDeError(causa));
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        noValidate
        onSubmit={enviar}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={idTitulo} className="text-xl font-bold text-slate-800 sm:text-2xl">
              {editando ? "Editar registro" : "Nuevo registro"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{tabla.nombre}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor={idNombre} className={claseLabel}>
              Nombre
            </label>
            <input
              id={idNombre}
              autoFocus
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-invalid={intentoGuardar && !!errorNombre}
              className={`${claseInput} ${
                intentoGuardar && errorNombre ? "border-rose-300" : "border-slate-200"
              }`}
            />
            {intentoGuardar && errorNombre && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errorNombre}</p>
            )}
          </div>

          {tabla.conDescripcion && (
            <div>
              <label htmlFor={idDescripcion} className={claseLabel}>
                Descripción <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <textarea
                id={idDescripcion}
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={`${claseInput} resize-none border-slate-200`}
              />
            </div>
          )}

          {tabla.extras?.includes("aplicaA") && (
            <div>
              <label htmlFor={idAplicaA} className={claseLabel}>
                Se puede usar en
              </label>
              <select
                id={idAplicaA}
                value={aplicaA}
                onChange={(e) => setAplicaA(e.target.value)}
                className={`${claseInput} border-slate-200`}
              >
                {APLICA_A.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tabla.extras?.includes("requiereMotivo") && (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Exige motivo</p>
                <p className="text-xs text-slate-500">
                  Quien inscribe debe indicar quién es y por qué (inscripción excepcional).
                </p>
              </div>
              <Interruptor
                encendido={requiereMotivo}
                etiqueta="Exige motivo"
                onCambiar={() => setRequiereMotivo((v) => !v)}
              />
            </div>
          )}

          {tabla.conEstado && (
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">Registro activo</p>
                <p className="text-xs text-slate-500">
                  Un registro inactivo deja de ofrecerse en los formularios.
                </p>
              </div>
              <Interruptor encendido={activo} etiqueta="Registro activo" onCambiar={() => setActivo((v) => !v)} />
            </div>
          )}

          {errorApi && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {errorApi}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00264d] disabled:opacity-60"
          >
            {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear registro"}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Crear o editar un registro de una tabla tipo. Devuelve `null` con el diálogo
 * cerrado, y el formulario se monta de nuevo en cada apertura, así que nunca
 * arrastra lo que se escribió la vez anterior. `onGuardar` habla con la API y
 * cierra el diálogo si sale bien; si falla, el mensaje se muestra aquí mismo.
 */
export default function ModalRegistro({
  dialogo,
  tabla,
  onGuardar,
  onClose,
}: {
  dialogo: DialogoRegistro | null;
  tabla: DefinicionTablaTipo;
  onGuardar: (datos: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  if (!dialogo) return null;
  return (
    <FormularioRegistro
      key={dialogo.registro?.id ?? "nuevo"}
      dialogo={dialogo}
      tabla={tabla}
      onGuardar={onGuardar}
      onClose={onClose}
    />
  );
}
