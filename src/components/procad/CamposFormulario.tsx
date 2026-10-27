/**
 * Piezas de los formularios de PROCAD que viven dentro de la página (no en un
 * modal): registrar una actividad, programar una visoría, la solicitud del
 * estudiante. Mismo campo y mismo rótulo que el formulario de álbum, para que
 * todos se lean como de la misma casa.
 */

export function Rotulo({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{children}</span>;
}

/** Un campo con su rótulo, la marca de opcional y, si falta, por qué. */
export function Campo({
  etiqueta,
  opcional,
  error,
  ayuda,
  className = "",
  children,
}: {
  etiqueta: string;
  opcional?: boolean;
  error?: string | null;
  ayuda?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <Rotulo>
        {etiqueta}
        {opcional && <span className="font-medium normal-case tracking-normal text-slate-400"> · opcional</span>}
      </Rotulo>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>
      ) : (
        ayuda && <span className="mt-1 block text-xs text-slate-400">{ayuda}</span>
      )}
    </label>
  );
}

/**
 * Un formulario que se abre en la misma página, encima de la lista a la que
 * va a agregar: el que registra ve a la vez lo que ya existe.
 */
export function PanelFormulario({
  titulo,
  descripcion,
  onCancelar,
  onEnviar,
  enviando,
  textoEnviar,
  children,
}: {
  titulo: string;
  descripcion?: string;
  onCancelar?: () => void;
  onEnviar: () => void;
  enviando: boolean;
  textoEnviar: string;
  children: React.ReactNode;
}) {
  return (
    <form
      className="rounded-2xl bg-white shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!enviando) onEnviar();
      }}
    >
      <div className="px-5 pt-5 sm:px-6">
        <h2 className="text-base font-bold text-slate-800">{titulo}</h2>
        {descripcion && <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">{descripcion}</p>}
      </div>
      <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">{children}</div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 transition-colors duration-150 hover:text-slate-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          {enviando ? "Guardando…" : textoEnviar}
        </button>
      </div>
    </form>
  );
}
