import { useEffect, useId, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import Interruptor from "../../../components/Interruptor";
import type { CatalogoGira, RegistroCatalogo } from "../../../types";

const claseInput =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";
const claseLabel = "mb-1.5 block text-xs font-semibold text-slate-500";

/** Lo que se captura en el formulario; ya viene limpio (código en mayúsculas, sin espacios sobrantes). */
export interface DatosRegistro {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

/** Qué abrió la modal: un registro nuevo (sin `registro`) o la edición de uno. */
export interface DialogoRegistro {
  registro?: RegistroCatalogo;
}

const FORMATO_CODIGO = /^[A-Z0-9_-]+$/;

function FormularioRegistro({
  dialogo,
  catalogo,
  onGuardar,
  onClose,
}: {
  dialogo: DialogoRegistro;
  catalogo: CatalogoGira;
  onGuardar: (datos: DatosRegistro) => void;
  onClose: () => void;
}) {
  const editando = dialogo.registro;
  const idTitulo = useId();
  const idCodigo = useId();
  const idNombre = useId();
  const idDescripcion = useId();

  const [codigo, setCodigo] = useState(editando?.codigo ?? "");
  const [nombre, setNombre] = useState(editando?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(editando?.descripcion ?? "");
  const [activo, setActivo] = useState(editando?.activo ?? true);
  // Los errores no aparecen mientras la persona todavía está escribiendo por
  // primera vez: solo después de intentar guardar.
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  useEffect(() => {
    function alPulsar(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [onClose]);

  const otros = catalogo.registros.filter((r) => r.id !== editando?.id);
  const codigoLimpio = codigo.trim().toUpperCase();
  const nombreLimpio = nombre.trim();

  let errorCodigo = "";
  if (!codigoLimpio) errorCodigo = "El código es obligatorio.";
  else if (!FORMATO_CODIGO.test(codigoLimpio))
    errorCodigo = "Usa solo letras, números, guion y guion bajo, sin espacios.";
  else if (otros.some((r) => r.codigo === codigoLimpio))
    errorCodigo = "Ya existe un registro con ese código en este catálogo.";

  let errorNombre = "";
  if (!nombreLimpio) errorNombre = "El nombre es obligatorio.";
  else if (otros.some((r) => r.nombre.toLowerCase() === nombreLimpio.toLowerCase()))
    errorNombre = "Ya existe un registro con ese nombre en este catálogo.";

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setIntentoGuardar(true);
    if (errorCodigo || errorNombre) return;
    onGuardar({
      codigo: codigoLimpio,
      nombre: nombreLimpio,
      descripcion: descripcion.trim(),
      activo,
    });
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
            <p className="mt-1 text-sm text-slate-400">{catalogo.nombre}</p>
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
            <label htmlFor={idCodigo} className={claseLabel}>
              Código
            </label>
            <input
              id={idCodigo}
              autoFocus
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej. BUS_UNI"
              aria-invalid={intentoGuardar && !!errorCodigo}
              className={`${claseInput} font-mono uppercase ${
                intentoGuardar && errorCodigo ? "border-rose-300" : "border-slate-200"
              }`}
            />
            {intentoGuardar && errorCodigo && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errorCodigo}</p>
            )}
          </div>

          <div>
            <label htmlFor={idNombre} className={claseLabel}>
              Nombre
            </label>
            <input
              id={idNombre}
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

          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Registro activo</p>
              <p className="text-xs text-slate-500">
                Un registro inactivo deja de ofrecerse en los formularios.
              </p>
            </div>
            <Interruptor
              encendido={activo}
              etiqueta="Registro activo"
              onCambiar={() => setActivo((v) => !v)}
            />
          </div>
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
            className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
          >
            {editando ? "Guardar cambios" : "Crear registro"}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Crear o editar un registro de una tabla tipo. Devuelve `null` con el diálogo
 * cerrado, y el formulario se monta de nuevo en cada apertura, así que nunca
 * arrastra lo que se escribió la vez anterior.
 */
export default function ModalRegistro({
  dialogo,
  catalogo,
  onGuardar,
  onClose,
}: {
  dialogo: DialogoRegistro | null;
  catalogo: CatalogoGira;
  onGuardar: (datos: DatosRegistro) => void;
  onClose: () => void;
}) {
  if (!dialogo) return null;
  return (
    <FormularioRegistro
      key={dialogo.registro?.id ?? "nuevo"}
      dialogo={dialogo}
      catalogo={catalogo}
      onGuardar={onGuardar}
      onClose={onClose}
    />
  );
}
