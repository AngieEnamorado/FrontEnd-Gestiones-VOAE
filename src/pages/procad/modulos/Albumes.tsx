import { useCallback, useMemo, useState } from "react";
import { BotonLimpiar, BuscadorTabla } from "../../../components/procad/BarraTabla";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import VisorFoto, { type FotoAbierta } from "../../../components/procad/VisorFoto";
import { unirAlbumes, urlFoto } from "../../../data/mockProcadGaleria";
import { useProcad } from "../../../context/ProcadContext";
import type { AlbumVisible, TipoAgrupacion } from "../../../types";

type FiltroTipo = TipoAgrupacion | "todos";

/**
 * Cuántas de las seis columnas ocupa cada foto. Las clases van escritas enteras
 * y no compuestas: Tailwind lee el código fuente, y una clase armada con una
 * plantilla no existe en la hoja de estilos.
 *
 * En pantalla angosta todo ocupa el ancho completo —dos columnas de dos— porque
 * una foto a media pantalla de teléfono ya no es una foto, es un sello.
 */
const SPAN: Record<number, string> = {
  2: "col-span-2 lg:col-span-2",
  3: "col-span-2 sm:col-span-2 lg:col-span-3",
  4: "col-span-2 sm:col-span-4 lg:col-span-4",
  6: "col-span-2 sm:col-span-4 lg:col-span-6",
};

/**
 * Una inclinación pequeña y fija para cada foto, sacada de su id.
 *
 * Es lo que separa una galería de una cuadrícula: las fotos parecen puestas
 * sobre la mesa y no pegadas a una rejilla. Tiene que ser determinista —misma
 * foto, mismo ángulo siempre— porque si cambiara en cada dibujado, la pantalla
 * temblaría con cada filtro.
 */
function inclinacion(id: string): number {
  let suma = 0;
  for (let i = 0; i < id.length; i += 1) suma = (suma * 31 + id.charCodeAt(i)) % 1000;
  return ((suma % 29) - 14) / 10;
}

const MES_CORTO = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const ETIQUETA_TIPO: Record<TipoAgrupacion, string> = {
  deportivo: "Deportiva",
  artistico: "Artística",
};

function Album({
  album,
  onAbrir,
}: {
  album: AlbumVisible;
  onAbrir: (foto: FotoAbierta) => void;
}) {
  const fecha = new Date(`${album.fecha}T12:00:00`);

  return (
    <section className="mb-12 last:mb-0">
      {/* El día en grande y hueco, como en los álbumes por fecha: da un ancla
          que se reconoce al desplazarse rápido, sin gritar más que las fotos. */}
      <header className="mb-5 flex flex-wrap items-end justify-between gap-x-5 gap-y-2 border-b border-white/12 pb-4">
        <div className="flex items-end gap-4">
          <span
            aria-hidden="true"
            className="select-none text-[56px] font-black leading-[0.8] text-transparent sm:text-[72px]"
            style={{ WebkitTextStroke: "1.5px #f5820f" }}
          >
            {fecha.getDate()}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-unah-orange">
              {MES_CORTO[fecha.getMonth()]} {fecha.getFullYear()} · {ETIQUETA_TIPO[album.tipo]}
            </p>
            <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">{album.actividad}</h3>
            <p className="mt-0.5 text-[13px] text-white/55">
              {album.grupo ? `${album.grupo} · ${album.centro}` : album.centro}
            </p>
          </div>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
          {album.fotos.length} fotos
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {album.fotos.map((foto, i) => (
          // Marco color hueso y sombra propia: cada foto es un objeto suelto
          // sobre el fondo oscuro, no un recorte de la rejilla. Al acercarse se
          // endereza y se levanta, que es lo que hace una foto que se va a
          // tomar en la mano.
          <button
            key={foto.id}
            type="button"
            onClick={() => onAbrir({ album, indice: i })}
            title={foto.alt}
            aria-label={`Ampliar: ${foto.alt}`}
            style={{ "--inclina": `${inclinacion(foto.id)}deg` } as React.CSSProperties}
            className={`${SPAN[foto.span]} group relative rotate-[var(--inclina)] rounded-[3px] bg-[#fdf8f1] p-[5px] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] duration-300 ease-suave hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_22px_46px_-14px_rgba(245,130,15,0.5)] focus-visible:z-10 focus-visible:-translate-y-1.5 focus-visible:rotate-0 active:scale-[0.97] sm:p-[7px]`}
          >
            <img
              src={urlFoto(foto.imagen, foto.span >= 4 ? 1200 : 800)}
              alt=""
              loading="lazy"
              decoding="async"
              // La foto ancha va a 3:1 y no más panorámica: así queda de la
              // misma altura que las de 3:2 que tiene al lado, y el álbum se
              // lee como filas parejas con una que abre, no como un cartel
              // seguido de fotos pequeñas.
              className={`w-full object-cover ${
                foto.span === 6 ? "aspect-[3/2] sm:aspect-[3/1]" : "aspect-[3/2]"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * El muro de la galería: las fotos de cada actividad, para mirarlas.
 *
 * Va sobre fondo oscuro y no sobre la tarjeta blanca del resto del panel: una
 * fotografía se ve mejor contra el negro, y el corte también avisa de que aquí
 * no se toca nada —subir y quitar es la otra pestaña—. Separarlas no es una
 * concesión: los marcos inclinados y el mosaico desigual son justo lo que no
 * aguanta una botonera encima de cada foto.
 */
export default function Albumes() {
  const { albumes: guardados, actividades } = useProcad();
  // Un álbum sin fotos no se cuelga: en el muro sería un encabezado con un
  // hueco debajo. Existe —se ve y se llena en «Administrar fotos»—, pero aquí
  // no hay nada que mirar todavía.
  const albumesGaleria = useMemo(
    () => unirAlbumes(guardados, actividades).filter((a) => a.fotos.length > 0),
    [guardados, actividades],
  );
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [texto, setTexto] = useState("");
  const [abierta, setAbierta] = useState<FotoAbierta | null>(null);

  const albumes = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return albumesGaleria.filter((a) => {
      if (tipo !== "todos" && a.tipo !== tipo) return false;
      if (
        busqueda &&
        !a.actividad.toLowerCase().includes(busqueda) &&
        !a.grupo.toLowerCase().includes(busqueda)
      ) {
        return false;
      }
      return true;
    });
  }, [albumesGaleria, tipo, texto]);

  const fotos = albumes.reduce((total, a) => total + a.fotos.length, 0);
  const hayFiltros = tipo !== "todos" || texto.trim() !== "";

  // Da la vuelta en los extremos: al mirar fotos, tropezar con un botón muerto
  // en la última es peor que volver a la primera.
  const mover = useCallback((direccion: 1 | -1) => {
    setAbierta((previo) => {
      if (!previo) return previo;
      const cuantas = previo.album.fotos.length;
      return { ...previo, indice: (previo.indice + direccion + cuantas) % cuantas };
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Las fotos agrupadas por el evento en que se tomaron. Casi todos los álbumes son de una
        actividad —y su primera foto sale de portada en la tarjeta—; los demás son sueltos, de algo
        que no pasó por Actividades. Para subir o quitar fotos, vaya a «Administrar fotos».
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <ChipsFiltro
          etiqueta="Filtrar por clasificación"
          activa={tipo}
          onCambiar={setTipo}
          opciones={[
            { id: "todos", label: "Todas" },
            { id: "deportivo", label: "Deportivas" },
            { id: "artistico", label: "Artísticas" },
          ]}
        />

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Actividad o agrupación"
          etiqueta="Buscar por actividad o agrupación"
          ancho="w-[230px]"
        />

        {hayFiltros && (
          <BotonLimpiar
            onClick={() => {
              setTipo("todos");
              setTexto("");
            }}
          />
        )}

        <p className="ml-auto text-xs font-semibold text-slate-400">
          {albumes.length === albumesGaleria.length
            ? `${albumesGaleria.length} ${albumesGaleria.length === 1 ? "álbum" : "álbumes"} · ${fotos} fotos`
            : `${albumes.length} de ${albumesGaleria.length} álbumes`}
        </p>
      </div>

      <div className="rounded-3xl bg-unah-navy-dark px-5 py-8 shadow-sm sm:px-8 sm:py-10">
        {albumes.length === 0 ? (
          <p className="py-10 text-center text-sm italic text-white/60">
            Ningún álbum coincide con lo que buscó.
          </p>
        ) : (
          albumes.map((album) => (
            <Album key={album.id} album={album} onAbrir={setAbierta} />
          ))
        )}
      </div>

      <VisorFoto foto={abierta} onCerrar={() => setAbierta(null)} onMover={mover} />
    </div>
  );
}
