import type { AlbumGaleria } from "../types";

/**
 * Las fotos de las actividades de las agrupaciones, agrupadas por el evento en
 * que se tomaron.
 *
 * Las imágenes son de archivo mientras no exista el flujo de carga real: nadie
 * ha subido todavía una foto a esta plataforma, así que lo que se ve aquí son
 * fotografías libres que sirven para ver la pantalla funcionando y para acordar
 * cómo debe verse la galería. En cuanto se defina quién sube y con qué
 * permisos, este archivo se cambia por la respuesta del servidor y la pantalla
 * no se entera.
 */

/** Una foto servida desde el CDN de archivo, recortada al ancho que se pide. */
export function urlFoto(id: string, ancho: number): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${ancho}&q=70`;
}

export const albumesGaleria: AlbumGaleria[] = [
  {
    id: "alb-1",
    actividad: "Torneo interuniversitario de fútbol",
    grupo: "Selección Universitaria de Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-02-14",
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
    actividad: "Presentación en el Festival Cultural",
    grupo: "Banda Marcial Alma Mater",
    tipo: "artistico",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-02-20",
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
    actividad: "Muestra de danza folclórica",
    grupo: "Grupo de Danza Folclórica UNAH",
    tipo: "artistico",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    fecha: "2026-03-05",
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
    actividad: "Cuadrangular de baloncesto",
    grupo: "Baloncesto",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-03-12",
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
    actividad: "Concierto de fin de período",
    grupo: "Coro de Cámara UNAH Cortés",
    tipo: "artistico",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    fecha: "2026-03-21",
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
    actividad: "Eliminatoria de voleibol",
    grupo: "Voleibol (Choluteca)",
    tipo: "deportivo",
    centro: "Campus Choluteca (CURLP)",
    fecha: "2026-04-02",
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
    actividad: "Festival de teatro estudiantil",
    grupo: "Teatro Universitario",
    tipo: "artistico",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-04-18",
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
    actividad: "Encuentro de atletismo",
    grupo: "Atletismo",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-04-25",
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
