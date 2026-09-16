import { useMemo, useState } from "react";
import { BotonLimpiar, BuscadorTabla, CLASE_FILTRO } from "../../../components/procad/BarraTabla";
import ChipsFiltro from "../../../components/procad/ChipsFiltro";
import DetalleActividad from "../../../components/procad/DetalleActividad";
import TarjetaActividad from "../../../components/procad/TarjetaActividad";
import { ORDEN_ESTADOS } from "../../../components/procad/actividad";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import type {
  ActividadProcad,
  EstadoActividadProcad,
  FotoGaleria,
  TipoAgrupacion,
} from "../../../types";

type Apartado = EstadoActividadProcad | "todas";

/** El nombre del apartado en plural, que es como se lee en un chip. */
const ETIQUETA_APARTADO: Record<EstadoActividadProcad, string> = {
  PENDIENTE_VALIDACION: "Pendientes",
  VALIDADA: "Validadas",
  OBSERVADA: "Observadas",
  RECHAZADA: "Rechazadas",
};

/** Lo que se lee cuando un apartado no tiene nada, dicho desde su propio caso. */
const VACIO: Record<Apartado, string> = {
  PENDIENTE_VALIDACION: "No hay actividades esperando su decisión.",
  VALIDADA: "Todavía no ha validado ninguna actividad.",
  OBSERVADA: "No hay actividades devueltas a su encargado.",
  RECHAZADA: "No ha rechazado ninguna actividad.",
  todas: "Ningún encargado ha reportado actividades.",
};

/**
 * Las actividades que reportan los encargados de las agrupaciones.
 *
 * Se ven como fichas y no como filas porque una actividad es un evento —tuvo
 * lugar, tiene fotos y alguien la organizó— y esas tres cosas no caben en una
 * fila sin volverla ilegible. La rejilla sirve para reconocerlas; resolverlas
 * se hace en el detalle, donde está la justificación.
 *
 * Los apartados son el estado: el administrador entra a lo que está pendiente,
 * y lo ya resuelto queda a un chip de distancia por si hay que consultarlo.
 */
export default function Actividades({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { actividades, albumes, resolverActividad } = useProcad();
  const [apartado, setApartado] = useState<Apartado>("PENDIENTE_VALIDACION");
  const [tipo, setTipo] = useState<TipoAgrupacion | "todos">("todos");
  const [texto, setTexto] = useState("");
  const [abierta, setAbierta] = useState<ActividadProcad | null>(null);

  /**
   * Las fotos de cada actividad, para no recorrer los álbumes por tarjeta. Los
   * álbumes sueltos no cuelgan de ninguna actividad y por eso no entran: no
   * hay tarjeta a la que puedan ponerle portada.
   */
  const fotosPorActividad = useMemo(() => {
    const mapa = new Map<number, FotoGaleria[]>();
    for (const album of albumes) {
      if (album.origen === "actividad") mapa.set(album.actividadId, album.fotos);
    }
    return mapa;
  }, [albumes]);

  /** El filtro de texto y clasificación, antes de repartir por apartado. */
  const buscadas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return actividades.filter((a) => {
      if (tipo !== "todos" && a.tipo !== tipo) return false;
      if (!busqueda) return true;
      return (
        a.titulo.toLowerCase().includes(busqueda) ||
        a.grupo.toLowerCase().includes(busqueda) ||
        a.encargado.nombre.toLowerCase().includes(busqueda)
      );
    });
  }, [actividades, tipo, texto]);

  // Los conteos salen de lo ya buscado y no del total: un chip que promete
  // cuatro pendientes y al pulsarlo enseña una es peor que no llevar número.
  const conteos = useMemo(() => {
    const cuenta = {} as Record<EstadoActividadProcad, number>;
    for (const estado of ORDEN_ESTADOS) cuenta[estado] = 0;
    for (const a of buscadas) cuenta[a.estado] += 1;
    return cuenta;
  }, [buscadas]);

  const mostradas = useMemo(
    () => (apartado === "todas" ? buscadas : buscadas.filter((a) => a.estado === apartado)),
    [buscadas, apartado],
  );

  const hayFiltros = tipo !== "todos" || texto.trim() !== "";

  function confirmar(a: ActividadProcad, nuevoEstado: EstadoActividadProcad) {
    // Cerrar el detalle se hace al confirmar y no al pulsar: mientras el
    // diálogo pregunta, detrás sigue estando lo que se está decidiendo.
    const resolver = (motivo?: string) => {
      resolverActividad(a.id, nuevoEstado, motivo);
      setAbierta(null);
    };

    if (nuevoEstado === "OBSERVADA") {
      abrirDialogo({
        titulo: `Observar «${a.titulo}»`,
        descripcion: `${a.grupo}. Explique qué debe corregir ${a.encargado.nombre} para que pueda validarla.`,
        confirmar: "Observar",
        tono: "primario",
        campos: [
          {
            id: "motivo",
            label: "Motivo",
            multilinea: true,
            marcador: "Ej. Falta la lista de asistencia firmada.",
          },
        ],
        onConfirmar: (valores) => resolver(valores.motivo),
      });
      return;
    }

    if (nuevoEstado === "RECHAZADA") {
      abrirDialogo({
        titulo: `¿Rechazar «${a.titulo}»?`,
        descripcion: `${a.grupo}. Al rechazarla no cuenta para la elegibilidad de nadie, y sus ${a.horas} h no se abonan. Diga por qué.`,
        confirmar: "Sí, rechazar",
        tono: "rechazar",
        campos: [
          {
            id: "motivo",
            label: "Motivo del rechazo",
            multilinea: true,
            marcador: "Ej. No estaba en el plan del período.",
          },
        ],
        onConfirmar: (valores) => resolver(valores.motivo),
      });
      return;
    }

    if (nuevoEstado === "PENDIENTE_VALIDACION") {
      abrirDialogo({
        titulo: `¿Reabrir «${a.titulo}»?`,
        descripcion: `${a.grupo}. Vuelve a quedar pendiente de su decisión y se deshace lo que la resolución anterior hizo con las horas.`,
        confirmar: "Sí, reabrir",
        tono: "primario",
        onConfirmar: () => resolver(),
      });
      return;
    }

    abrirDialogo({
      titulo: `¿Validar «${a.titulo}»?`,
      descripcion: `${a.grupo}. Al validarla, sus ${a.horas} h se abonan a los ${a.asistentes} que asistieron y la actividad empieza a contar para la elegibilidad de todos ellos.`,
      confirmar: "Sí, validar",
      tono: "aprobar",
      onConfirmar: () => resolver(),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
        Las reportan los encargados de cada agrupación. Hasta que usted no la valide, la asistencia
        de una actividad no cuenta para la elegibilidad de nadie. Toque una para ver quién la mandó,
        por qué se hizo y con qué la respalda.
      </p>

      <ChipsFiltro
        etiqueta="Apartado de las actividades"
        activa={apartado}
        onCambiar={setApartado}
        opciones={[
          ...ORDEN_ESTADOS.map((estado) => ({
            id: estado as Apartado,
            label: ETIQUETA_APARTADO[estado],
            conteo: conteos[estado],
          })),
          { id: "todas" as Apartado, label: "Todas", conteo: buscadas.length },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoAgrupacion | "todos")}
          aria-label="Clasificación de la agrupación"
          className={`${CLASE_FILTRO} w-[170px]`}
        >
          <option value="todos">Toda clasificación</option>
          <option value="deportivo">Deportivas</option>
          <option value="artistico">Artísticas</option>
        </select>

        <BuscadorTabla
          valor={texto}
          onCambiar={setTexto}
          marcador="Actividad, grupo o encargado"
          etiqueta="Buscar por actividad, agrupación o encargado"
          ancho="w-[250px]"
        />

        {hayFiltros && (
          <BotonLimpiar
            onClick={() => {
              setTipo("todos");
              setTexto("");
            }}
          />
        )}

        <p className="ml-auto text-xs font-semibold text-slate-500">
          {mostradas.length === actividades.length
            ? `${actividades.length} actividades`
            : `${mostradas.length} de ${actividades.length}`}
        </p>
      </div>

      {mostradas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-sm italic text-slate-500">
          {hayFiltros ? "Ninguna actividad coincide con lo que buscó." : VACIO[apartado]}
        </p>
      ) : (
        <div
          // La `key` remonta la rejilla al cambiar de apartado: es lo que hace
          // que las tarjetas vuelvan a entrar escalonadas y que el cambio de
          // sección se lea como tal, y no como un cambio de contenido a secas.
          key={apartado}
          className="entra-escalonado grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {mostradas.map((actividad) => (
            <TarjetaActividad
              key={actividad.id}
              actividad={actividad}
              fotos={fotosPorActividad.get(actividad.id) ?? []}
              onAbrir={() => setAbierta(actividad)}
            />
          ))}
        </div>
      )}

      <DetalleActividad
        // Se busca de nuevo en la lista para que el detalle siga al estado: si
        // se reabre desde dentro, lo que se ve detrás del diálogo ya es lo
        // nuevo, no la copia con la que se abrió.
        actividad={abierta ? (actividades.find((a) => a.id === abierta.id) ?? null) : null}
        fotos={abierta ? (fotosPorActividad.get(abierta.id) ?? []) : []}
        onCerrar={() => setAbierta(null)}
        onResolver={confirmar}
      />
    </div>
  );
}
