import { useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlinePaperClip, HiOutlineXMark } from "react-icons/hi2";
import logoUnahBlanco from "../../assets/Logos/LogoUnahBlanco.png";
import BotonAccion from "./BotonAccion";
import { INDICE_MINIMO } from "../../data/mockProcadEstadisticas";
import type { EstadoSolicitudProcad, SolicitudProcad } from "../../types";

/**
 * La ficha del estudiante que solicita entrar a una agrupación.
 *
 * La tabla resuelve en fila —aprobar, observar, no cumple— pero para decidir de
 * verdad hace falta ver a la persona: cómo contactarla, qué contó de su
 * trayectoria y qué adjuntó. Eso no cabe en una fila sin volverla ilegible, así
 * que vive aquí.
 *
 * La cabecera es la del carnet institucional —franja naranja rayada, escudo y
 * las iniciales— porque este documento se lee como una credencial: identifica a
 * alguien antes de decir nada sobre su caso. Debajo, la información de decisión
 * en el gris de siempre.
 *
 * Sigue el patrón de modales de la plataforma: recibe `solicitud` en `null`
 * cuando está cerrada y se cierra al tocar fuera, con Escape o con la ×.
 */

const ETIQUETA_ESTADO: Record<EstadoSolicitudProcad, string> = {
  aprobada: "Aprobada",
  pendiente: "Pendiente",
  observada: "Observada",
  noCumple: "No cumple",
};

const PUNTO_ESTADO: Record<EstadoSolicitudProcad, string> = {
  aprobada: "bg-emerald-500",
  pendiente: "bg-unah-navy",
  observada: "bg-blue-500",
  noCumple: "bg-rose-500",
};

const TIPO: Record<SolicitudProcad["tipo"], string> = {
  deportivo: "Deportiva",
  artistico: "Artística",
};

/** Las dos primeras iniciales del nombre, como en un carnet. */
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function FichaEstudiante({
  solicitud,
  onClose,
  onResolver,
}: {
  solicitud: SolicitudProcad | null;
  onClose: () => void;
  /** Resolver desde la ficha; sin esta prop la ficha es solo de lectura. */
  onResolver?: (id: number, nombre: string, estado: EstadoSolicitudProcad) => void;
}) {
  useEffect(() => {
    if (!solicitud) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [solicitud, onClose]);

  if (!solicitud) return null;

  const cumple = solicitud.indice >= INDICE_MINIMO;
  const experiencia = solicitud.experiencia;
  const puedeResolver = onResolver && solicitud.estado === "pendiente";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, transform: "translateY(12px) scale(0.985)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-estudiante-nombre"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/30"
      >
        {/* Cabecera de carnet. Las rayas van en el fondo y no en un elemento
            aparte, para que ninguna se cuele por encima del texto. */}
        <div
          className="relative shrink-0 px-6 pb-6 pt-5 sm:px-8"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.11) 0 18px, rgba(255,255,255,0) 18px 46px), linear-gradient(118deg, #fbb040 0%, #f5820f 58%, #e07708 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <img
              src={logoUnahBlanco}
              alt="Universidad Nacional Autónoma de Honduras"
              className="h-14 w-auto drop-shadow-sm"
            />
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-unah-navy text-sm font-bold tracking-wide text-white shadow-md shadow-unah-navy/25"
              >
                {iniciales(solicitud.nombre)}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar la ficha"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors duration-150 hover:bg-black/10 hover:text-white"
              >
                <HiOutlineXMark className="h-5 w-5" />
              </button>
            </div>
          </div>

          <dl className="mt-5 space-y-3">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-950/60">
                Cuenta
              </dt>
              <dd className="font-mono text-xl font-bold leading-tight text-amber-950">
                {solicitud.cuenta}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-950/60">
                Nombre
              </dt>
              <dd
                id="ficha-estudiante-nombre"
                className="text-xl font-bold uppercase leading-tight tracking-wide text-amber-950"
              >
                {solicitud.nombre}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-950/60">
                Identidad
              </dt>
              <dd className="font-mono text-base font-bold leading-tight text-amber-950">
                {solicitud.identidad}
              </dd>
            </div>
          </dl>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <Campo etiqueta="Agrupación">
              {TIPO[solicitud.tipo]} · {solicitud.grupo}
            </Campo>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${PUNTO_ESTADO[solicitud.estado]}`}
              />
              {ETIQUETA_ESTADO[solicitud.estado]}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Carrera">{solicitud.carrera}</Campo>
            <Campo etiqueta="Campus">{solicitud.centro}</Campo>
            <Campo etiqueta="Correo">{solicitud.correo}</Campo>
            <Campo etiqueta="Teléfono">{solicitud.telefono}</Campo>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Índice del período">
              <span className={cumple ? "text-emerald-600" : "text-rose-600"}>
                {cumple ? "Cumple" : "No alcanza el mínimo"}
              </span>
              <span className="ml-1.5 font-normal text-slate-400">
                {solicitud.indice}% de {INDICE_MINIMO}% exigido
              </span>
            </Campo>
            <Campo etiqueta="Índice global">{solicitud.indiceGlobal}%</Campo>
            <Campo etiqueta="Matrícula">
              {solicitud.matriculaVerificada ? (
                "Verificada contra Registro"
              ) : (
                <span className="text-amber-700">Sin verificar</span>
              )}
            </Campo>
            <Campo etiqueta="Solicitada">
              {new Date(`${solicitud.fechaSolicitud}T12:00:00`).toLocaleDateString("es-HN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              <span className="ml-1.5 font-normal text-slate-400">
                para el período {solicitud.periodo}
              </span>
            </Campo>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Experiencia
            </p>
            {experiencia && (experiencia.texto || experiencia.archivos.length > 0) ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
                {experiencia.texto && (
                  <p className="text-sm leading-relaxed text-slate-600">{experiencia.texto}</p>
                )}
                {experiencia.archivos.length > 0 && (
                  <ul className={`flex flex-wrap gap-2 ${experiencia.texto ? "mt-3" : ""}`}>
                    {experiencia.archivos.map((archivo) => (
                      <li key={archivo}>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                          <HiOutlinePaperClip
                            className="h-3.5 w-3.5 text-slate-400"
                            aria-hidden="true"
                          />
                          {archivo}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                No contó nada de su trayectoria.
              </p>
            )}
          </div>

          {/* Lo propio de la agrupación a la que entra: una deportiva reparte
              posiciones, una artística instrumentos. Se enseña lo que aplica. */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {solicitud.tipo === "deportivo" ? (
              <Campo etiqueta="Posición">
                {solicitud.posicion ?? <span className="text-slate-400">Sin definir</span>}
              </Campo>
            ) : (
              <Campo etiqueta="Instrumento o voz">
                {solicitud.instrumento ?? <span className="text-slate-400">Sin definir</span>}
              </Campo>
            )}
            <Campo etiqueta="Nivel declarado">
              {solicitud.nivelExperiencia ?? <span className="text-slate-400">No declaró</span>}
            </Campo>
            <Campo etiqueta="Alergia">
              {solicitud.alergia || <span className="text-slate-400">No declaró</span>}
            </Campo>
            <Campo etiqueta="Sexo">{solicitud.sexo === "F" ? "Femenino" : "Masculino"}</Campo>
          </div>

          <div className="mt-4">
            <Campo etiqueta="Contacto de emergencia">
              {solicitud.contactoEmergencia.nombre}
              <span className="ml-2 font-mono text-xs font-normal text-slate-400">
                {solicitud.contactoEmergencia.telefono}
              </span>
            </Campo>
          </div>
        </div>

        {puedeResolver && (
          <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 px-6 py-4 sm:px-8">
            <BotonAccion
              tono="aprobar"
              onClick={() => onResolver(solicitud.id, solicitud.nombre, "aprobada")}
            >
              Aprobar
            </BotonAccion>
            <BotonAccion
              tono="observar"
              onClick={() => onResolver(solicitud.id, solicitud.nombre, "observada")}
            >
              Observar
            </BotonAccion>
            <BotonAccion
              tono="rechazar"
              onClick={() => onResolver(solicitud.id, solicitud.nombre, "noCumple")}
            >
              No cumple
            </BotonAccion>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/** Un dato con su rótulo, en el mismo tono en toda la ficha. */
function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{etiqueta}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">{children}</p>
    </div>
  );
}
