import { useEffect, useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

export interface CampoDialogo {
  id: string;
  label: string;
  /** Un área de texto cuando la respuesta es una explicación, no un dato. */
  multilinea?: boolean;
  marcador?: string;
}

export interface Dialogo {
  titulo: string;
  descripcion: string;
  /** Texto del botón que confirma. */
  confirmar: string;
  tono: "aprobar" | "rechazar" | "primario";
  /** Nota al pie, para lo que el usuario debe saber antes de decidir. */
  nota?: string;
  /** Campos obligatorios; el diálogo no confirma hasta que estén llenos. */
  campos?: CampoDialogo[];
  onConfirmar: (valores: Record<string, string>) => void;
}

const ESTILO_CONFIRMAR: Record<Dialogo["tono"], string> = {
  aprobar: "bg-emerald-600 hover:bg-emerald-700",
  rechazar: "bg-rose-600 hover:bg-rose-700",
  primario: "bg-unah-navy hover:bg-unah-navy-dark",
};

const claseCampoBase =
  "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400";

/**
 * El cuerpo del diálogo. Está aparte para poder montarlo con una `key` por
 * diálogo: así cada apertura empieza con los campos vacíos sin tener que
 * limpiarlos a mano después de renderizar.
 */
function CuerpoDialogo({ dialogo, onCerrar }: { dialogo: Dialogo; onCerrar: () => void }) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [faltantes, setFaltantes] = useState<string[]>([]);

  function confirmar() {
    const sinLlenar = (dialogo.campos ?? [])
      .filter((c) => !(valores[c.id] ?? "").trim())
      .map((c) => c.id);
    if (sinLlenar.length > 0) {
      setFaltantes(sinLlenar);
      return;
    }
    dialogo.onConfirmar(valores);
    onCerrar();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-dialogo-procad"
      className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-7"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="titulo-dialogo-procad" className="text-lg font-bold text-slate-800">
          {dialogo.titulo}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">{dialogo.descripcion}</p>

      {dialogo.campos?.map((campo, i) => {
        const falta = faltantes.includes(campo.id);
        const clase = `${claseCampoBase} ${
          falta ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-unah-orange"
        }`;
        const comunes = {
          id: `dialogo-${campo.id}`,
          autoFocus: i === 0,
          placeholder: campo.marcador,
          value: valores[campo.id] ?? "",
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValores((v) => ({ ...v, [campo.id]: e.target.value })),
        };

        return (
          <div key={campo.id} className="mt-4">
            <label
              htmlFor={`dialogo-${campo.id}`}
              className="mb-1.5 block text-xs font-semibold text-slate-500"
            >
              {campo.label}
            </label>
            {campo.multilinea ? (
              <textarea {...comunes} rows={3} className={`${clase} resize-y`} />
            ) : (
              <input {...comunes} type="text" className={clase} />
            )}
            {falta && <p className="mt-1.5 text-xs text-rose-600">Este campo es obligatorio.</p>}
          </div>
        );
      })}

      {dialogo.nota && (
        <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-xs leading-relaxed text-blue-800">
          {dialogo.nota}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-[background-color,color,transform] duration-150 ease-suave hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirmar}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-suave active:scale-[0.98] ${ESTILO_CONFIRMAR[dialogo.tono]}`}
        >
          {dialogo.confirmar}
        </button>
      </div>
    </div>
  );
}

/**
 * Confirmación de una acción que cambia el estado de algo. Sigue el patrón de
 * los modales de la plataforma: recibe `dialogo` en `null` cuando está cerrado
 * y se cierra al tocar fuera, con Escape o con la X.
 */
export default function DialogoConfirmacion({
  dialogo,
  onCerrar,
}: {
  dialogo: Dialogo | null;
  onCerrar: () => void;
}) {
  useEffect(() => {
    if (!dialogo) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [dialogo, onCerrar]);

  if (!dialogo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <CuerpoDialogo key={dialogo.titulo} dialogo={dialogo} onCerrar={onCerrar} />
    </div>
  );
}
