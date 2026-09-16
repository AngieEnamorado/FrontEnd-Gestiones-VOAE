import { useEffect } from "react";
import { motion } from "motion/react";
import {
  HiOutlineArrowUturnLeft,
  HiOutlineCheck,
  HiOutlinePaperClip,
  HiOutlinePencil,
  HiOutlinePhoto,
  HiOutlineXMark,
} from "react-icons/hi2";
import AvatarIniciales from "./AvatarIniciales";
import BotonAccion from "./BotonAccion";
import {
  CAJA_ESTADO,
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  FONDO_SIN_PORTADA,
  ICONO_TIPO,
  PUNTO_ESTADO,
} from "./actividad";
import { urlFoto } from "../../data/mockProcadGaleria";
import type { ActividadProcad, EstadoActividadProcad, FotoGaleria } from "../../types";

/**
 * El expediente de una actividad reportada.
 *
 * Es donde se decide, y por eso enseña primero lo que hay que leer antes de
 * decidir: quién la mandó, por qué se hizo y con qué la respalda. La tarjeta
 * de la rejilla no lleva botones de validar justamente para que esta pantalla
 * sea el único camino: una actividad valida horas para decenas de estudiantes,
 * y eso no se firma desde una miniatura.
 *
 * Sigue el patrón de modales de la plataforma: recibe `actividad` en `null`
 * cuando está cerrado y se cierra al tocar fuera, con Escape o con la ×.
 */
export default function DetalleActividad({
  actividad,
  fotos,
  onCerrar,
  onResolver,
}: {
  actividad: ActividadProcad | null;
  /** Las de su álbum, en orden; la primera es la portada. */
  fotos: FotoGaleria[];
  onCerrar: () => void;
  onResolver: (actividad: ActividadProcad, estado: EstadoActividadProcad) => void;
}) {
  useEffect(() => {
    if (!actividad) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [actividad, onCerrar]);

  if (!actividad) return null;

  const portada = fotos[0];
  const IconoTipo = ICONO_TIPO[actividad.tipo];
  const pendiente = actividad.estado === "PENDIENTE_VALIDACION";
  const ausentes = actividad.inscritos - actividad.asistentes;
  const porcentaje =
    actividad.inscritos > 0 ? Math.round((actividad.asistentes / actividad.inscritos) * 100) : 0;

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
        aria-labelledby="detalle-actividad-titulo"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/30"
      >
        {/* La portada hace de cabecera. El velo que la cubre no es un adorno:
            sin él, un título blanco sobre una foto clara desaparece, y la foto
            que abre el expediente no se puede elegir. */}
        <div className="relative shrink-0 overflow-hidden">
          {portada ? (
            <img
              src={urlFoto(portada.imagen, 1200)}
              alt=""
              className="h-40 w-full object-cover sm:h-48"
            />
          ) : (
            <div className="h-40 w-full sm:h-48" style={{ backgroundImage: FONDO_SIN_PORTADA }} />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/45 to-slate-950/15"
          />

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar el detalle"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/30"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
                <IconoTipo className="h-3.5 w-3.5" aria-hidden="true" />
                {ETIQUETA_TIPO[actividad.tipo]}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${PUNTO_ESTADO[actividad.estado]}`}
                />
                {ETIQUETA_ESTADO[actividad.estado]}
              </span>
            </div>

            <h2
              id="detalle-actividad-titulo"
              className="mt-2 text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl"
            >
              {actividad.titulo}
            </h2>
            <p className="mt-1 text-[13px] font-medium text-white/80">
              {actividad.grupo} · {actividad.centro}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Quién la hizo, arriba del todo y con cara: en esta pantalla nada
              es del administrador —todo se lo mandaron—, así que saber de
              quién viene cambia cómo se lee el resto. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <AvatarIniciales nombre={actividad.encargado.nombre} className="h-10 w-10 text-[13px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">
                {actividad.encargado.nombre}
              </p>
              <p className="truncate text-xs text-slate-500">{actividad.encargado.rol}</p>
              <p className="truncate text-xs text-slate-500">{actividad.encargado.correo}</p>
            </div>
            <p className="w-full shrink-0 text-[11px] leading-snug text-slate-500 sm:ml-auto sm:w-auto sm:text-right">
              La envió el <span className="font-semibold text-slate-600">{actividad.enviada}</span>
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Cuándo">
              {actividad.fecha}
              <span className="ml-1.5 font-normal text-slate-500">{actividad.hora}</span>
            </Campo>
            <Campo etiqueta="Dónde">{actividad.lugar}</Campo>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                Asistencia
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">
                {actividad.asistentes} de {actividad.inscritos} inscritos
                <span className="ml-1.5 font-normal text-slate-500">
                  {ausentes === 0 ? "· nadie faltó" : `· faltaron ${ausentes}`}
                </span>
              </p>
              <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                role="img"
                aria-label={`${porcentaje}% de asistencia`}
              >
                <div
                  className="h-full rounded-full bg-unah-navy"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
            <Campo etiqueta="Horas que abona">
              {actividad.horas} h por asistente
              <span className="ml-1.5 font-normal text-slate-500">
                {actividad.estado === "VALIDADA"
                  ? "· ya abonadas"
                  : "· solo si queda validada"}
              </span>
            </Campo>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Justificación
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm leading-relaxed text-slate-600">
              {actividad.justificacion}
            </p>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Respaldo
            </p>
            {actividad.adjuntos.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {actividad.adjuntos.map((archivo) => (
                  <li key={archivo}>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      <HiOutlinePaperClip className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                      {archivo}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                No adjuntó nada. Sin lista de asistencia firmada no hay con qué comprobar quiénes
                estuvieron.
              </p>
            )}
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Fotos
            </p>
            {fotos.length > 0 ? (
              <>
                <ul className="flex flex-wrap gap-2">
                  {fotos.slice(0, 6).map((foto) => (
                    <li key={foto.id}>
                      <img
                        src={urlFoto(foto.imagen, 240)}
                        alt={foto.alt}
                        loading="lazy"
                        className="h-16 w-24 rounded-lg object-cover ring-1 ring-slate-900/10"
                      />
                    </li>
                  ))}
                  {fotos.length > 6 && (
                    <li className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                      +{fotos.length - 6}
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  La primera es la portada de la tarjeta. Se suben y se quitan en Galería.
                </p>
              </>
            ) : (
              <p className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                <HiOutlinePhoto className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                Todavía no tiene fotos. Se suben desde Galería.
              </p>
            )}
          </div>

          {actividad.resolucion && (
            <div className={`mt-4 rounded-xl border px-4 py-3 ${CAJA_ESTADO[actividad.estado]}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                {ETIQUETA_ESTADO[actividad.estado]} por {actividad.resolucion.por}
                <span className="ml-1.5 font-semibold normal-case tracking-normal text-slate-500">
                  {actividad.resolucion.fecha}
                </span>
              </p>
              {actividad.resolucion.motivo && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {actividad.resolucion.motivo}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-4 sm:px-6">
          {pendiente ? (
            <>
              <BotonAccion tono="aprobar" onClick={() => onResolver(actividad, "VALIDADA")}>
                <HiOutlineCheck className="h-4 w-4" />
                Validar
              </BotonAccion>
              <BotonAccion tono="observar" onClick={() => onResolver(actividad, "OBSERVADA")}>
                <HiOutlinePencil className="h-4 w-4" />
                Observar
              </BotonAccion>
              <BotonAccion tono="rechazar" onClick={() => onResolver(actividad, "RECHAZADA")}>
                <HiOutlineXMark className="h-4 w-4" />
                Rechazar
              </BotonAccion>
              <p className="ml-auto max-w-[17rem] text-right text-[11px] leading-snug text-slate-500">
                Validarla abona {actividad.horas} h a {actividad.asistentes} estudiantes.
              </p>
            </>
          ) : (
            <>
              {/* Reabrir existe porque una decisión tomada de más también es un
                  error, y sin esta salida la única forma de arreglarlo sería
                  pedirle al encargado que vuelva a mandar la actividad. */}
              <BotonAccion
                tono="neutro"
                onClick={() => onResolver(actividad, "PENDIENTE_VALIDACION")}
              >
                <HiOutlineArrowUturnLeft className="h-4 w-4" />
                Reabrir
              </BotonAccion>
              <p className="ml-auto max-w-[19rem] text-right text-[11px] leading-snug text-slate-500">
                Reabrirla la devuelve a pendiente y deshace lo que esta decisión hizo con las horas.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Un dato con su rótulo, en el mismo tono que la ficha del estudiante. */
function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{etiqueta}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">{children}</p>
    </div>
  );
}
