import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HiOutlineXMark } from "react-icons/hi2";
import { ETIQUETA_TIPO } from "./actividad";
import { CENTROS } from "../../data/mockProcadEstadisticas";
import { hoyIso } from "../../utils/fechas";
import type { DatosAlbumSuelto, TipoAgrupacion } from "../../types";

/**
 * Los datos de un álbum que no cuelga de ninguna actividad.
 *
 * Un álbum de actividad no pide nada de esto: el título, la fecha y el campus
 * los pone la actividad. Uno suelto no tiene de dónde sacarlos, y sin ellos el
 * muro no sabría bajo qué día ni con qué nombre colgarlo, así que es lo mínimo
 * que hay que preguntar antes de dejar subir la primera foto.
 */

const CLASE_CAMPO =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-unah-orange";

export default function FormularioAlbum({
  abierto,
  inicial,
  onCerrar,
  onGuardar,
}: {
  abierto: boolean;
  /** Los datos actuales cuando se está editando; nada cuando se crea. */
  inicial?: DatosAlbumSuelto;
  onCerrar: () => void;
  onGuardar: (datos: DatosAlbumSuelto) => void;
}) {
  if (!abierto) return null;
  // La `key` remonta el cuerpo en cada apertura: así los campos empiezan con
  // lo que toca sin tener que limpiarlos a mano al cerrar.
  return <Cuerpo key={inicial?.titulo ?? "nuevo"} inicial={inicial} onCerrar={onCerrar} onGuardar={onGuardar} />;
}

function Cuerpo({
  inicial,
  onCerrar,
  onGuardar,
}: {
  inicial?: DatosAlbumSuelto;
  onCerrar: () => void;
  onGuardar: (datos: DatosAlbumSuelto) => void;
}) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "");
  const [grupo, setGrupo] = useState(inicial?.grupo ?? "");
  const [tipo, setTipo] = useState<TipoAgrupacion>(inicial?.tipo ?? "deportivo");
  const [centro, setCentro] = useState(inicial?.centro ?? CENTROS[0]);
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoyIso());
  const [falta, setFalta] = useState(false);

  useEffect(() => {
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  function guardar() {
    if (!titulo.trim()) {
      setFalta(true);
      return;
    }
    onGuardar({ titulo: titulo.trim(), grupo: grupo.trim(), tipo, centro, fecha });
    onCerrar();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <motion.div
        initial={{ opacity: 0, transform: "translateY(12px) scale(0.985)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="formulario-album-titulo"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/30"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5 sm:px-7">
          <div>
            <h2 id="formulario-album-titulo" className="text-lg font-bold text-slate-800">
              {inicial ? "Editar el álbum" : "Nuevo álbum suelto"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Para fotos de algo que no pasó por Actividades: una premiación, una visita, un
              aniversario del programa.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4 sm:px-7">
          <label className="block">
            <Rotulo>Título</Rotulo>
            <input
              type="text"
              value={titulo}
              autoFocus
              onChange={(e) => {
                setTitulo(e.target.value);
                setFalta(false);
              }}
              placeholder="Ej. Premiación de fin de año del programa"
              className={`${CLASE_CAMPO} ${falta ? "border-rose-400" : ""}`}
            />
            {falta && (
              <span className="mt-1 block text-xs font-semibold text-rose-600">
                El álbum necesita un título: es con lo que aparece en el muro.
              </span>
            )}
          </label>

          <label className="block">
            <Rotulo>Agrupación (opcional)</Rotulo>
            <input
              type="text"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              placeholder="Déjelo vacío si el evento es del programa entero"
              className={CLASE_CAMPO}
            />
          </label>

          <div>
            <Rotulo>Clasificación</Rotulo>
            <div className="mt-1 flex gap-2">
              {(["deportivo", "artistico"] as TipoAgrupacion[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  aria-pressed={tipo === t}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
                    tipo === t
                      ? "border-unah-navy bg-unah-navy text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {ETIQUETA_TIPO[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <Rotulo>Campus</Rotulo>
              <select
                value={centro}
                onChange={(e) => setCentro(e.target.value)}
                className={`${CLASE_CAMPO} cursor-pointer`}
              >
                {CENTROS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <Rotulo>Día</Rotulo>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={`${CLASE_CAMPO} cursor-pointer`}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 transition-colors duration-150 hover:text-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            className="rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
          >
            {inicial ? "Guardar" : "Crear álbum"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </span>
  );
}
