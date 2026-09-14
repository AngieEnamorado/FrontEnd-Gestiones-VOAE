import { useEffect } from "react";
import { motion } from "motion/react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineXMark } from "react-icons/hi2";
import { urlFoto } from "../../data/mockProcadGaleria";
import type { AlbumGaleria } from "../../types";

/** Qué foto se está mirando: el álbum y en qué posición de él. */
export interface FotoAbierta {
  album: AlbumGaleria;
  indice: number;
}

/**
 * La foto a tamaño completo, sobre fondo negro.
 *
 * Sigue el patrón de modales de la plataforma —recibe `foto` en `null` cuando
 * está cerrada y se cierra al tocar fuera, con Escape o con la ×—, y añade lo
 * que cualquiera espera de un visor de fotos: las flechas del teclado recorren
 * el álbum sin volver a la cuadrícula.
 *
 * El pie no es decorativo: en una galería de trabajo, saber de qué actividad y
 * de qué agrupación es la foto que se está mirando es la mitad de para qué se
 * abre.
 */
export default function VisorFoto({
  foto,
  onCerrar,
  onMover,
}: {
  foto: FotoAbierta | null;
  onCerrar: () => void;
  /** −1 anterior, +1 siguiente; da la vuelta al llegar al extremo. */
  onMover: (direccion: 1 | -1) => void;
}) {
  useEffect(() => {
    if (!foto) return;
    function alPresionar(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight") onMover(1);
      if (e.key === "ArrowLeft") onMover(-1);
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [foto, onCerrar, onMover]);

  if (!foto) return null;

  const { album, indice } = foto;
  const actual = album.fotos[indice];
  const sola = album.fotos.length === 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 p-4 backdrop-blur-sm sm:p-8"
      onClick={onCerrar}
    >
      <button
        type="button"
        onClick={onCerrar}
        title="Cerrar"
        aria-label="Cerrar la foto"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20"
      >
        <HiOutlineXMark className="h-5 w-5" />
      </button>

      {!sola && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMover(-1);
            }}
            title="Foto anterior"
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:left-6"
          >
            <HiOutlineChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMover(1);
            }}
            title="Foto siguiente"
            aria-label="Foto siguiente"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:right-6"
          >
            <HiOutlineChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <motion.figure
        // La `key` remonta la figura al cambiar de foto: es lo que hace que la
        // entrada vuelva a correr y que pasar de una a otra se note.
        key={actual.id}
        initial={{ opacity: 0, transform: "scale(0.985)" }}
        animate={{ opacity: 1, transform: "scale(1)" }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`${album.actividad}: foto ${indice + 1} de ${album.fotos.length}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-5xl flex-col items-center gap-4"
      >
        <img
          src={urlFoto(actual.imagen, 1600)}
          alt={actual.alt}
          className="max-h-[74vh] w-auto rounded-xl object-contain shadow-2xl shadow-black/60"
        />

        <figcaption className="w-full max-w-2xl text-center">
          <p className="text-sm font-bold text-white">{album.actividad}</p>
          <p className="mt-0.5 text-[13px] text-white/60">
            {album.grupo} · {album.centro}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/45">{actual.alt}</p>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
            {indice + 1} / {album.fotos.length}
          </p>
        </figcaption>
      </motion.figure>
    </div>
  );
}
