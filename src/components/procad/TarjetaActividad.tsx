import { HiOutlinePhoto } from "react-icons/hi2";
import AvatarIniciales from "./AvatarIniciales";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  FONDO_SIN_PORTADA,
  ICONO_TIPO,
  PUNTO_ESTADO,
  TINTE_TIPO,
} from "./actividad";
import { urlFoto } from "../../data/mockProcadGaleria";
import type { ActividadProcad, FotoGaleria } from "../../types";

/**
 * Una actividad reportada, como ficha.
 *
 * La tarjeta no decide nada: reconoce. Lleva la foto para saber de qué evento
 * se habla antes de leer, el estado encima de ella, y al pie quién la mandó —
 * que en una pantalla donde todo lo reportan terceros es la mitad del
 * contexto—. Lo que hace falta para resolverla (la justificación, el respaldo,
 * la asistencia) está en el detalle, y por eso la tarjeta entera es el botón
 * que lo abre: no hay forma de validar sin haber pasado por la explicación.
 */
export default function TarjetaActividad({
  actividad,
  fotos,
  onAbrir,
}: {
  actividad: ActividadProcad;
  /** Las de su álbum; la primera es la portada. Vacío si aún no tiene. */
  fotos: FotoGaleria[];
  onAbrir: () => void;
}) {
  const portada = fotos[0];
  const IconoTipo = ICONO_TIPO[actividad.tipo];

  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`Ver el detalle de «${actividad.titulo}»`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-slate-900/5 transition-[transform,box-shadow] duration-300 ease-suave hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 focus-visible:-translate-y-1 active:translate-y-0"
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
        {portada ? (
          <img
            src={urlFoto(portada.imagen, 800)}
            alt=""
            loading="lazy"
            decoding="async"
            // El acercamiento es del 4%: lo justo para que la foto acuse el
            // cursor. Más y la tarjeta parece un carrusel publicitario.
            className="h-full w-full object-cover transition-transform duration-500 ease-suave group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1.5"
            style={{ backgroundImage: FONDO_SIN_PORTADA }}
          >
            <HiOutlinePhoto className="h-7 w-7 text-white/50" aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
              Sin fotos
            </p>
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${PUNTO_ESTADO[actividad.estado]}`}
          />
          {ETIQUETA_ESTADO[actividad.estado]}
        </span>

        {fotos.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/55 px-2 py-1 text-[11px] font-bold tabular-nums text-white backdrop-blur-sm">
            {fotos.length} fotos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${TINTE_TIPO[actividad.tipo]}`}
        >
          <IconoTipo className="h-3.5 w-3.5" aria-hidden="true" />
          {ETIQUETA_TIPO[actividad.tipo]}
        </span>

        <h3 className="mt-2.5 line-clamp-2 text-[15px] font-bold leading-snug text-slate-800">
          {actividad.titulo}
        </h3>

        <p className="mt-1.5 text-xs font-medium text-slate-500">
          {actividad.fecha} · {actividad.asistentes} de {actividad.inscritos} asistieron
        </p>

        {/* Quién la mandó, al pie y pegado abajo: así la fila de personas queda
            a la misma altura en toda la rejilla aunque los títulos midan una
            línea o dos. Sin regla de color encima: la separación la hace el
            aire, que no compite con la foto. */}
        <div className="mt-auto flex items-center gap-2.5 pt-4">
          <AvatarIniciales nombre={actividad.encargado.nombre} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-slate-700">
              {actividad.encargado.nombre}
            </p>
            <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500">
              {actividad.grupo}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
