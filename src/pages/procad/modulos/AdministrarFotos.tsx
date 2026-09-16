import { useMemo, useRef, useState } from "react";
import {
  HiOutlineExclamationTriangle,
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { BotonLimpiar, BuscadorTabla, CLASE_FILTRO } from "../../../components/procad/BarraTabla";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import FormularioAlbum from "../../../components/procad/FormularioAlbum";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_TIPO,
  PUNTO_ESTADO,
} from "../../../components/procad/actividad";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad, type DestinoFotos } from "../../../context/ProcadContext";
import { urlFoto } from "../../../data/mockProcadGaleria";
import { enCorto } from "../../../utils/fechas";
import type {
  ActividadProcad,
  AlbumSuelto,
  DatosAlbumSuelto,
  FotoGaleria,
} from "../../../types";

type Procedencia = "todo" | "actividades" | "sueltos";
type Cobertura = "todas" | "con" | "sin";

/** Cuántas columnas ocupa la foto en el mosaico, dicho como se entiende. */
const TAMANOS: { span: FotoGaleria["span"]; label: string }[] = [
  { span: 2, label: "Chica" },
  { span: 3, label: "Normal" },
  { span: 4, label: "Grande" },
  { span: 6, label: "Panorámica" },
];

/** Los tipos que el navegador sabe enseñar; lo demás se descarta al soltarlo. */
function soloImagenes(archivos: FileList | null): File[] {
  return Array.from(archivos ?? []).filter((f) => f.type.startsWith("image/"));
}

/** «playa-01.jpg» → «playa 01»: un punto de partida para la descripción. */
function descripcionDeArchivo(nombre: string): string {
  return nombre.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

/**
 * Subir, quitar y ordenar las fotos.
 *
 * Está en su propia pestaña y no encima del muro porque son dos trabajos
 * distintos: allá se mira y aquí se toca.
 *
 * Las fotos tienen dos sitios adonde ir. Casi siempre van a una actividad, y
 * por eso la lista de actividades va primero e incluye las que todavía no
 * tienen ninguna foto —que son justo a las que hay que subirles—. Pero no todo
 * lo que se fotografía pasó por Actividades, así que debajo están los álbumes
 * sueltos, que se abren aquí mismo y no dependen de nadie.
 */
export default function AdministrarFotos({
  abrirDialogo,
}: {
  abrirDialogo: (d: Dialogo) => void;
}) {
  const {
    actividades,
    albumes,
    agregarFotos,
    crearAlbumSuelto,
    editarAlbumSuelto,
    eliminarAlbum,
    quitarFoto,
    ponerDePortada,
    describirFoto,
    redimensionarFoto,
  } = useProcad();

  const [procedencia, setProcedencia] = useState<Procedencia>("todo");
  const [cobertura, setCobertura] = useState<Cobertura>("todas");
  const [texto, setTexto] = useState("");
  /** La foto abierta para describirla o cambiarle el tamaño, si hay alguna. */
  const [editando, setEditando] = useState<string | null>(null);
  /** El álbum suelto que se está editando, o `true` si se está creando uno. */
  const [formulario, setFormulario] = useState<AlbumSuelto | true | null>(null);

  const fotosPorActividad = useMemo(() => {
    const mapa = new Map<number, { albumId: string; fotos: FotoGaleria[] }>();
    for (const album of albumes) {
      if (album.origen === "actividad") {
        mapa.set(album.actividadId, { albumId: album.id, fotos: album.fotos });
      }
    }
    return mapa;
  }, [albumes]);

  const sueltos = useMemo(
    () => albumes.filter((a): a is AlbumSuelto => a.origen === "suelto"),
    [albumes],
  );

  const busqueda = texto.trim().toLowerCase();

  const actividadesVisibles = useMemo(() => {
    if (procedencia === "sueltos") return [];
    return actividades.filter((a) => {
      const cuantas = fotosPorActividad.get(a.id)?.fotos.length ?? 0;
      if (cobertura === "con" && cuantas === 0) return false;
      if (cobertura === "sin" && cuantas > 0) return false;
      if (!busqueda) return true;
      return a.titulo.toLowerCase().includes(busqueda) || a.grupo.toLowerCase().includes(busqueda);
    });
  }, [actividades, fotosPorActividad, procedencia, cobertura, busqueda]);

  const sueltosVisibles = useMemo(() => {
    if (procedencia === "actividades") return [];
    return sueltos.filter((a) => {
      if (cobertura === "con" && a.fotos.length === 0) return false;
      if (cobertura === "sin" && a.fotos.length > 0) return false;
      if (!busqueda) return true;
      return a.titulo.toLowerCase().includes(busqueda) || a.grupo.toLowerCase().includes(busqueda);
    });
  }, [sueltos, procedencia, cobertura, busqueda]);

  const totalFotos = albumes.reduce((suma, a) => suma + a.fotos.length, 0);
  const hayFiltros = cobertura !== "todas" || busqueda !== "";

  function subir(destino: DestinoFotos, archivos: File[]) {
    if (archivos.length === 0) return;
    agregarFotos(
      destino,
      archivos.map((archivo) => ({
        // Mientras no exista el servidor, la foto es un `blob:` que solo
        // entiende esta pestaña del navegador. Cuando lo haya, aquí se sube el
        // archivo y se guarda la URL que devuelva: nada más de esta pantalla
        // cambia.
        imagen: URL.createObjectURL(archivo),
        alt: descripcionDeArchivo(archivo.name),
        span: 3,
      })),
    );
  }

  function quitar(albumId: string, foto: FotoGaleria) {
    // Una foto subida ocupa memoria del navegador hasta que se suelta su URL;
    // las de archivo no tienen nada que soltar.
    if (foto.imagen.startsWith("blob:")) URL.revokeObjectURL(foto.imagen);
    if (editando === foto.id) setEditando(null);
    quitarFoto(albumId, foto.id);
  }

  function confirmarBorrado(album: AlbumSuelto) {
    abrirDialogo({
      titulo: `¿Eliminar el álbum «${album.titulo}»?`,
      descripcion:
        album.fotos.length > 0
          ? `Se van con él sus ${album.fotos.length} ${album.fotos.length === 1 ? "foto" : "fotos"}, y no hay manera de recuperarlas.`
          : "Todavía no tiene fotos, así que no se pierde nada.",
      confirmar: "Sí, eliminar",
      tono: "rechazar",
      onConfirmar: () => {
        for (const foto of album.fotos) {
          if (foto.imagen.startsWith("blob:")) URL.revokeObjectURL(foto.imagen);
        }
        eliminarAlbum(album.id);
      },
    });
  }

  function guardarFormulario(datos: DatosAlbumSuelto) {
    if (formulario === true) crearAlbumSuelto(datos);
    else if (formulario) editarAlbumSuelto(formulario.id, datos);
  }

  const controles = (albumId: string | undefined) => ({
    editando,
    onEditar: setEditando,
    onQuitar: (foto: FotoGaleria) => albumId && quitar(albumId, foto),
    onPortada: (foto: FotoGaleria) => albumId && ponerDePortada(albumId, foto.id),
    onDescribir: (foto: FotoGaleria, alt: string) => albumId && describirFoto(albumId, foto.id, alt),
    onRedimensionar: (foto: FotoGaleria, span: FotoGaleria["span"]) =>
      albumId && redimensionarFoto(albumId, foto.id, span),
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Las fotos van a una actividad —y entonces la primera es la portada de su tarjeta— o a un
        álbum suelto, para lo que no pasó por Actividades. Arrastre imágenes sobre el recuadro
        punteado o toque «Añadir fotos»; toque una foto ya subida para describirla o cambiarle el
        tamaño en el mosaico.
      </p>

      <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-900">
        <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Mientras no exista el servidor, lo que suba vive solo en este navegador: al recargar la
        página, la galería vuelve a las fotos de archivo.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <ChipsFiltro
          etiqueta="Procedencia del álbum"
          activa={procedencia}
          onCambiar={setProcedencia}
          opciones={[
            { id: "todo", label: "Todo" },
            { id: "actividades", label: "De actividades", conteo: actividades.length },
            { id: "sueltos", label: "Sueltos", conteo: sueltos.length },
          ]}
        />

        <select
          value={cobertura}
          onChange={(e) => setCobertura(e.target.value as Cobertura)}
          aria-label="Qué álbumes ver"
          className={`${CLASE_FILTRO} w-[185px]`}
        >
          <option value="todas">Con y sin fotos</option>
          <option value="con">Solo los que tienen</option>
          <option value="sin">Solo los que no tienen</option>
        </select>

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Actividad, álbum o grupo"
          etiqueta="Buscar por actividad, álbum o agrupación"
          ancho="w-[230px]"
        />

        {hayFiltros && (
          <BotonLimpiar
            onClick={() => {
              setCobertura("todas");
              setTexto("");
            }}
          />
        )}

        <p className="ml-auto text-xs font-semibold text-slate-500">
          {albumes.length} {albumes.length === 1 ? "álbum" : "álbumes"} · {totalFotos} fotos
        </p>
      </div>

      {/* Cada sección se dibuja siempre que su filtro la deje pasar, aunque
          esté vacía. Antes un «no hay nada» común se las comía a las dos, y
          con ello el botón de crear: quedaba imposible abrir el primer álbum
          suelto justo cuando no había ninguno. */}
      <div className="flex flex-col gap-6">
        {procedencia !== "sueltos" && (
          <section className="flex flex-col gap-3">
            <Encabezado
              titulo="De actividades"
              explicacion="Su primera foto sale de portada en la tarjeta de la actividad."
            />
            {actividadesVisibles.length === 0 ? (
              <Vacio>Ninguna actividad coincide con lo que buscó.</Vacio>
            ) : (
              actividadesVisibles.map((actividad) => {
                const album = fotosPorActividad.get(actividad.id);
                return (
                  <Album
                    key={actividad.id}
                    cabecera={<CabeceraActividad actividad={actividad} fotos={album?.fotos ?? []} />}
                    fotos={album?.fotos ?? []}
                    etiquetaSubir={`Añadir fotos a «${actividad.titulo}»`}
                    onSubir={(archivos) => subir({ actividadId: actividad.id }, archivos)}
                    {...controles(album?.albumId)}
                  />
                );
              })
            )}
          </section>
        )}

        {procedencia !== "actividades" && (
          <section className="flex flex-col gap-3">
            <Encabezado
              titulo="Álbumes sueltos"
              explicacion="Para lo que no pasó por Actividades: una premiación, una visita, un aniversario. Llevan su propio nombre y su propio día."
              accion={<BotonNuevo onClick={() => setFormulario(true)} />}
            />
            {sueltosVisibles.length === 0 ? (
              <Vacio>
                {sueltos.length === 0
                  ? "Todavía no hay ninguno."
                  : "Ningún álbum suelto coincide con lo que buscó."}
              </Vacio>
            ) : (
              sueltosVisibles.map((album) => (
                <Album
                  key={album.id}
                  cabecera={
                    <CabeceraSuelto
                      album={album}
                      onEditar={() => setFormulario(album)}
                      onEliminar={() => confirmarBorrado(album)}
                    />
                  }
                  fotos={album.fotos}
                  etiquetaSubir={`Añadir fotos a «${album.titulo}»`}
                  onSubir={(archivos) => subir({ albumId: album.id }, archivos)}
                  {...controles(album.id)}
                />
              ))
            )}
          </section>
        )}
      </div>

      <FormularioAlbum
        abierto={formulario !== null}
        inicial={
          formulario && formulario !== true
            ? {
                titulo: formulario.titulo,
                grupo: formulario.grupo,
                tipo: formulario.tipo,
                centro: formulario.centro,
                fecha: formulario.fecha,
              }
            : undefined
        }
        onCerrar={() => setFormulario(null)}
        onGuardar={guardarFormulario}
      />
    </div>
  );
}

function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-8 text-center text-sm italic text-slate-500">
      {children}
    </p>
  );
}

function Encabezado({
  titulo,
  explicacion,
  accion,
}: {
  titulo: string;
  explicacion: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-slate-600">{titulo}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{explicacion}</p>
      </div>
      {accion}
    </div>
  );
}

function BotonNuevo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-unah-navy bg-unah-navy px-3 py-1.5 text-xs font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.97]"
    >
      <HiOutlinePlus className="h-4 w-4" />
      Nuevo álbum suelto
    </button>
  );
}

function CabeceraActividad({
  actividad,
  fotos,
}: {
  actividad: ActividadProcad;
  fotos: FotoGaleria[];
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${PUNTO_ESTADO[actividad.estado]}`}
          />
          {ETIQUETA_ESTADO[actividad.estado]}
        </span>
        <h4 className="text-[15px] font-bold text-slate-800">{actividad.titulo}</h4>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {ETIQUETA_TIPO[actividad.tipo]} · {actividad.grupo} · {actividad.fecha} ·{" "}
        {cuentaFotos(fotos.length)}
      </p>
    </div>
  );
}

function CabeceraSuelto({
  album,
  onEditar,
  onEliminar,
}: {
  album: AlbumSuelto;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
            Suelto
          </span>
          <h4 className="text-[15px] font-bold text-slate-800">{album.titulo}</h4>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {ETIQUETA_TIPO[album.tipo]}
          {album.grupo && ` · ${album.grupo}`} · {enCorto(album.fecha)} · {album.centro} ·{" "}
          {cuentaFotos(album.fotos.length)}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <BotonIcono etiqueta="Editar los datos del álbum" onClick={onEditar}>
          <HiOutlinePencilSquare className="h-4 w-4" />
        </BotonIcono>
        <BotonIcono etiqueta="Eliminar el álbum" onClick={onEliminar} peligroso>
          <HiOutlineTrash className="h-4 w-4" />
        </BotonIcono>
      </div>
    </div>
  );
}

function BotonIcono({
  etiqueta,
  onClick,
  peligroso = false,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  peligroso?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={etiqueta}
      aria-label={etiqueta}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors duration-150 ${
        peligroso
          ? "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          : "hover:border-slate-300 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function cuentaFotos(cuantas: number): string {
  if (cuantas === 0) return "sin fotos";
  return `${cuantas} ${cuantas === 1 ? "foto" : "fotos"}`;
}

/** La tira de fotos de un álbum, con su zona para soltar y su editor. */
function Album({
  cabecera,
  fotos,
  etiquetaSubir,
  editando,
  onEditar,
  onSubir,
  onQuitar,
  onPortada,
  onDescribir,
  onRedimensionar,
}: {
  cabecera: React.ReactNode;
  fotos: FotoGaleria[];
  etiquetaSubir: string;
  editando: string | null;
  onEditar: (id: string | null) => void;
  onSubir: (archivos: File[]) => void;
  onQuitar: (foto: FotoGaleria) => void;
  onPortada: (foto: FotoGaleria) => void;
  onDescribir: (foto: FotoGaleria, alt: string) => void;
  onRedimensionar: (foto: FotoGaleria, span: FotoGaleria["span"]) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [encima, setEncima] = useState(false);
  const abierta = fotos.find((f) => f.id === editando) ?? null;

  return (
    <section
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 sm:p-6"
      onDragOver={(e) => {
        e.preventDefault();
        setEncima(true);
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        e.preventDefault();
        setEncima(false);
        onSubir(soloImagenes(e.dataTransfer.files));
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {cabecera}

        <button
          type="button"
          onClick={() => entrada.current?.click()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-[background-color,transform] duration-150 ease-suave hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97]"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Añadir fotos
        </button>
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label={etiquetaSubir}
          onChange={(e) => {
            onSubir(soloImagenes(e.target.files));
            // Se vacía para que subir dos veces el mismo archivo funcione: sin
            // esto el segundo `change` no llega, porque el valor no cambió.
            e.target.value = "";
          }}
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-3">
        {fotos.map((foto, i) => {
          const esPortada = i === 0;
          const seleccionada = foto.id === editando;
          return (
            <li key={foto.id} className="relative">
              <button
                type="button"
                onClick={() => onEditar(seleccionada ? null : foto.id)}
                aria-pressed={seleccionada}
                title={foto.alt}
                aria-label={`Editar la foto: ${foto.alt}`}
                className={`block overflow-hidden rounded-xl transition-[box-shadow,transform] duration-150 ease-suave hover:-translate-y-0.5 ${
                  seleccionada
                    ? "ring-2 ring-unah-orange ring-offset-2"
                    : "ring-1 ring-slate-900/10 hover:ring-slate-900/20"
                }`}
              >
                <img
                  src={urlFoto(foto.imagen, 320)}
                  alt=""
                  loading="lazy"
                  className="h-24 w-36 object-cover"
                />
              </button>

              {esPortada && (
                <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-md bg-unah-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white">
                  Portada
                </span>
              )}

              <div className="absolute right-1.5 top-1.5 flex gap-1">
                {!esPortada && (
                  <button
                    type="button"
                    onClick={() => onPortada(foto)}
                    title="Usar de portada"
                    aria-label={`Usar de portada: ${foto.alt}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-white hover:text-unah-navy"
                  >
                    <HiOutlineStar className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onQuitar(foto)}
                  title="Quitar la foto"
                  aria-label={`Quitar la foto: ${foto.alt}`}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-rose-600 hover:text-white"
                >
                  <HiOutlineXMark className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            onClick={() => entrada.current?.click()}
            className={`flex h-24 w-36 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors duration-150 ${
              encima
                ? "border-unah-orange bg-unah-orange/8 text-unah-orange-dark"
                : "border-slate-300 text-slate-500 hover:border-unah-navy hover:text-unah-navy"
            }`}
          >
            <HiOutlinePhoto className="h-5 w-5" aria-hidden="true" />
            <span className="px-2 text-center text-[11px] font-semibold leading-tight">
              {encima ? "Suelte aquí" : "Arrastre o toque"}
            </span>
          </button>
        </li>
      </ul>

      {/* El editor de una foto se abre debajo de la tira y no encima de la
          miniatura: en un recuadro de 96px no cabe un campo de texto, y un
          globo flotante taparía justo las fotos con las que se compara. */}
      {abierta && (
        <div className="mt-3 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <label className="min-w-[240px] flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Qué se ve en la foto
            </span>
            <input
              type="text"
              value={abierta.alt}
              onChange={(e) => onDescribir(abierta, e.target.value)}
              placeholder="Ej. Saludo del elenco al final"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-unah-orange"
            />
          </label>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Tamaño en el mosaico
            </span>
            <div className="mt-1 flex gap-1.5">
              {TAMANOS.map((t) => (
                <button
                  key={t.span}
                  type="button"
                  onClick={() => onRedimensionar(abierta, t.span)}
                  aria-pressed={abierta.span === t.span}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors duration-150 ${
                    abierta.span === t.span
                      ? "border-unah-navy bg-unah-navy text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEditar(null)}
            className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors duration-150 hover:text-slate-700"
          >
            Listo
          </button>
        </div>
      )}
    </section>
  );
}
