import { aIso } from "../utils/fechas";
import type { ActividadProcad, AlbumGaleria, AlbumVisible } from "../types";

/**
 * Las fotos de las actividades de las agrupaciones. Un álbum por actividad:
 * el álbum no guarda de qué evento es, solo a qué actividad pertenece, y de
 * ella salen el título, el grupo y la fecha que se enseñan encima.
 *
 * Las que vienen aquí son imágenes de archivo: sirven para ver la pantalla
 * llena antes de que exista el servidor. Las que suba el administrador viven
 * en `ProcadContext` junto a estas y se distinguen solas —traen una URL
 * entera en vez de un identificador del CDN—.
 */

/**
 * De dónde se pide una foto, al ancho que se necesite.
 *
 * Una foto de archivo es un identificador y se le pide al CDN ya recortada.
 * Una que subió el administrador ya es una URL completa —`blob:` mientras la
 * sesión viva, `https:` cuando haya servidor— y se devuelve tal cual: no hay
 * a quién pedirle otro tamaño, y anteponerle el CDN la rompería.
 */
export function urlFoto(imagen: string, ancho: number): string {
  if (/^(blob:|data:|https?:)/.test(imagen)) return imagen;
  return `https://images.unsplash.com/${imagen}?auto=format&fit=crop&w=${ancho}&q=70`;
}

/**
 * Deja cada álbum con sus datos ya resueltos, que es como se mira.
 *
 * Los de una actividad los toman de ella al dibujar, no copiados: si el título
 * o la fecha vivieran guardados en el álbum, bastaría con corregir la
 * actividad para que la galería quedara diciendo otra cosa. Un álbum cuya
 * actividad ya no existe se cae de la lista en vez de dibujarse sin nombre.
 *
 * Los sueltos ya traen los suyos: no hay actividad de la que sacarlos.
 */
export function unirAlbumes(
  albumes: AlbumGaleria[],
  actividades: ActividadProcad[],
): AlbumVisible[] {
  const porId = new Map(actividades.map((a) => [a.id, a]));
  return albumes.flatMap((album): AlbumVisible[] => {
    if (album.origen === "suelto") {
      const { titulo, ...resto } = album;
      return [{ ...resto, actividad: titulo }];
    }
    const actividad = porId.get(album.actividadId);
    if (!actividad) return [];
    return [
      {
        ...album,
        actividad: actividad.titulo,
        grupo: actividad.grupo,
        tipo: actividad.tipo,
        centro: actividad.centro,
        fecha: aIso(actividad.fecha),
      },
    ];
  });
}

export const albumesGaleria: AlbumGaleria[] = [
  {
    id: "alb-1",
    origen: "actividad",
    actividadId: 701,
    fotos: [
      { id: "f1", imagen: "photo-1522778119026-d647f0596c20", alt: "El estadio durante el partido, visto desde la grada", span: 6 },
      { id: "f2", imagen: "photo-1517927033932-b3d18e61fb3a", alt: "El balón entrando en la portería", span: 3 },
      { id: "f3", imagen: "photo-1434648957308-5e6a859697e8", alt: "Partido en marcha visto desde la grada alta", span: 3 },
      { id: "f4", imagen: "photo-1517747614396-d21a78b850e8", alt: "La cancha desde lo alto antes del saque", span: 2 },
      { id: "f5", imagen: "photo-1574629810360-7efbbe195018", alt: "Golpeo del balón sobre el césped", span: 2 },
      { id: "f6", imagen: "photo-1489944440615-453fc2b6a9a9", alt: "El estadio iluminado al final del partido", span: 2 },
    ],
  },
  {
    id: "alb-2",
    origen: "actividad",
    actividadId: 702,
    fotos: [
      { id: "f7", imagen: "photo-1711336622443-d53a1f1156bc", alt: "Banda marcial en formación", span: 4 },
      { id: "f8", imagen: "photo-1616382519098-57806dfc551a", alt: "Sección de metales tocando", span: 2 },
      { id: "f9", imagen: "photo-1638752096399-4b6a40939e21", alt: "Percusión de la banda durante el desfile", span: 3 },
      { id: "f10", imagen: "photo-1617052241384-b24d3ebce241", alt: "Trompetista de la banda", span: 3 },
      { id: "f11", imagen: "photo-1569949236204-2cbfaa21fbd2", alt: "Público siguiendo la presentación", span: 2 },
      { id: "f12", imagen: "photo-1558023784-f8343393cb06", alt: "Instrumentos listos antes de salir", span: 2 },
      { id: "f13", imagen: "photo-1484508005949-1293190f1c8b", alt: "Director marcando el compás", span: 2 },
    ],
  },
  {
    id: "alb-3",
    origen: "actividad",
    actividadId: 703,
    fotos: [
      { id: "f14", imagen: "photo-1585873587499-4c2b179c6c51", alt: "Pareja de baile folclórico en escena", span: 3 },
      { id: "f15", imagen: "photo-1634566520253-c6b8f84a0f60", alt: "Telas en movimiento durante el baile", span: 3 },
      { id: "f16", imagen: "photo-1463592177119-bab2a00f3ccb", alt: "Las bailarinas en línea durante la presentación", span: 6 },
      { id: "f17", imagen: "photo-1652111132299-ff1056c87b35", alt: "Detalle del calzado durante el zapateo", span: 2 },
      { id: "f18", imagen: "photo-1597591516654-72b726d644da", alt: "El grupo formado antes de salir a escena", span: 2 },
      { id: "f19", imagen: "photo-1667386426758-1036cf655323", alt: "Saludo final del grupo", span: 2 },
    ],
  },
  {
    id: "alb-4",
    origen: "actividad",
    actividadId: 704,
    fotos: [
      { id: "f20", imagen: "photo-1546519638-68e109498ffc", alt: "El balón atravesando el aro", span: 4 },
      { id: "f21", imagen: "photo-1627627256672-027a4613d028", alt: "El balón, antes de saltar a la cancha", span: 2 },
      { id: "f22", imagen: "photo-1519861531473-9200262188bf", alt: "Balón en una cancha al aire libre", span: 3 },
      { id: "f23", imagen: "photo-1574623452334-1e0ac2b3ccb4", alt: "Los balones antes del calentamiento", span: 3 },
      { id: "f24", imagen: "photo-1577471488278-16eec37ffcc2", alt: "Ataque durante el partido", span: 2 },
      { id: "f25", imagen: "photo-1515523110800-9415d13b84a8", alt: "El aro visto desde abajo", span: 2 },
      { id: "f26", imagen: "photo-1608245449230-4ac19066d2d0", alt: "Clavada en el último cuarto", span: 2 },
    ],
  },
  {
    id: "alb-5",
    origen: "actividad",
    actividadId: 705,
    fotos: [
      { id: "f27", imagen: "photo-1610254449353-5698372fa83b", alt: "El coro cantando en el auditorio", span: 6 },
      { id: "f28", imagen: "photo-1726095091581-77f2877cba95", alt: "El atril del director antes de empezar", span: 3 },
      { id: "f29", imagen: "photo-1593678820334-91d5f99be314", alt: "El coro completo durante el concierto", span: 3 },
      { id: "f30", imagen: "photo-1482627750753-afdba16659ef", alt: "Partitura abierta bajo las luces", span: 2 },
      { id: "f31", imagen: "photo-1548795835-264877304664", alt: "Ensayo general con las luces puestas", span: 2 },
      { id: "f32", imagen: "photo-1577928988314-333ee58c5296", alt: "El auditorio lleno durante la última pieza", span: 2 },
    ],
  },
  {
    id: "alb-6",
    origen: "actividad",
    actividadId: 706,
    fotos: [
      { id: "f33", imagen: "photo-1612872087720-bb876e2e67d1", alt: "Remate sobre la red", span: 3 },
      { id: "f34", imagen: "photo-1547347298-4074fc3086f0", alt: "Equipo de voleibol celebrando el punto", span: 3 },
      { id: "f35", imagen: "photo-1592656094267-764a45160876", alt: "Balón sobre la arena entre set y set", span: 2 },
      { id: "f36", imagen: "photo-1588492069485-d05b56b2831d", alt: "El balón oficial de la eliminatoria", span: 2 },
      { id: "f37", imagen: "photo-1619296094543-99aca1aa1f9e", alt: "Partido al atardecer, visto desde fuera de la cancha", span: 2 },
    ],
  },
  {
    id: "alb-7",
    origen: "actividad",
    actividadId: 707,
    fotos: [
      { id: "f38", imagen: "photo-1603647228752-7637a91fc9c7", alt: "Escena de la obra bajo las luces", span: 4 },
      { id: "f39", imagen: "photo-1576724196706-3f23f51ea351", alt: "Escena de la obra con el elenco completo", span: 2 },
      { id: "f40", imagen: "photo-1603647284638-60268b672f55", alt: "Actores en escena", span: 3 },
      { id: "f41", imagen: "photo-1562329265-95a6d7a83440", alt: "La sala antes de que entre el público", span: 3 },
      { id: "f42", imagen: "photo-1603647228760-f267ba43bf5a", alt: "Ensayo de una escena a dos", span: 2 },
      { id: "f43", imagen: "photo-1646105372611-0d775e5ccda2", alt: "Saludo del elenco al final", span: 2 },
    ],
  },
  {
    id: "alb-8",
    origen: "actividad",
    actividadId: 708,
    fotos: [
      { id: "f44", imagen: "photo-1461896836934-ffe607ba8211", alt: "Salida de la carrera en la pista", span: 6 },
      { id: "f45", imagen: "photo-1461897104016-0b3b00cc81ee", alt: "Salida de los velocistas desde los tacos", span: 3 },
      { id: "f46", imagen: "photo-1590333748338-d629e4564ad9", alt: "Grupo de corredores en plena prueba", span: 3 },
      { id: "f47", imagen: "photo-1526676537331-7747bf8278fc", alt: "Corredores en plena prueba de velocidad", span: 2 },
      { id: "f48", imagen: "photo-1584415942461-0b87dda9cc2b", alt: "Atleta en el carril durante la vuelta", span: 2 },
      { id: "f49", imagen: "photo-1532444458054-01a7dd3e9fca", alt: "Corredor cruzando la meta", span: 2 },
    ],
  },
];
