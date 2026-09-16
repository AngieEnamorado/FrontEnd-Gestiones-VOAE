import type {
  ActividadProcad,
  CondicionadoPendiente,
  EmpleadoProcad,
  ExpulsionPendiente,
  MatriculaExcepcional,
  PeriodoInscripcion,
  RegistroAuditoria,
  SolicitudProcad,
  TipoAgrupacion,
  UsuarioProcad,
  VisoriaProcad,
} from "../types";

// Datos del panel de administración de PROCAD. A diferencia de las
// estadísticas, que solo se consultan, esto sí se modifica desde la interfaz:
// `ProcadContext` toma estos arreglos como estado inicial y a partir de ahí
// trabaja sobre su propia copia, para no mutar el módulo importado.

// --- Catálogos institucionales ---------------------------------------------

export const DISCIPLINAS_CATALOGO = [
  "danza",
  "teatro",
  "música",
  "coro",
  "literatura",
  "artes plásticas",
];

export const DEPORTES_CATALOGO = [
  "Fútbol 11",
  "Baloncesto",
  "Voleibol",
  "Ajedrez",
  "Atletismo",
  "Natación",
  "Taekwondo",
  "Karate Do",
  "Tenis de Mesa",
  "Montañismo y Escalada",
];

export const TIPOS_ACTIVIDAD_CATALOGO: Record<TipoAgrupacion, string[]> = {
  deportivo: ["Entrenamiento", "Partido amistoso", "Competencia oficial", "Torneo"],
  artistico: ["Ensayo", "Concierto", "Demostración de danza", "Presentación", "Festival"],
};

/** Catálogo institucional permanente: no lleva bandera de activo/inactivo. */
export const MOTIVOS_EXPULSION = [
  "Incumplimiento del reglamento",
  "Inasistencia reiterada",
  "Conducta indebida",
  "Falta de compromiso",
  "Otro",
];

// --- Personas ---------------------------------------------------------------

/**
 * Un colaborador externo no tiene contrato con la universidad, así que nunca
 * lleva `acceso: true`: el administrador actúa en el sistema en su nombre.
 * `alternarAcceso` en `ProcadContext` no deja cambiarlo.
 */
export const empleadosProcad: EmpleadoProcad[] = [
  {
    nombre: "Prof. Marco Aurelio Reyes",
    rol: "Encargado",
    centro: "Ciudad Universitaria (CU)",
    grupos: ["Fútbol 11"],
    acceso: true,
    esColaboradorExterno: false,
  },
  {
    nombre: "Lic. Fernanda Ochoa",
    rol: "Encargado",
    centro: "Ciudad Universitaria (CU)",
    grupos: ["Baloncesto"],
    acceso: false,
    esColaboradorExterno: true,
  },
  {
    nombre: "Prof. Daniel Suazo",
    rol: "Encargado",
    centro: "Ciudad Universitaria (CU)",
    grupos: ["Banda Marcial Alma Mater"],
    acceso: true,
    esColaboradorExterno: false,
  },
  {
    nombre: "Lic. Karla Núñez",
    rol: "Encargado",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    grupos: ["Voleibol", "Coro de Cámara UNAH Cortés"],
    acceso: true,
    esColaboradorExterno: false,
  },
  {
    nombre: "Mtro. Óscar Villeda",
    rol: "Encargado",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    grupos: ["Coro de Cámara UNAH Cortés"],
    acceso: false,
    esColaboradorExterno: true,
  },
  {
    nombre: "Ing. Paola Cálix",
    rol: "Enlace regional",
    centro: "Campus Comayagua",
    grupos: ["Atletismo", "Cuadro de Danza Folklórica Popol Vuh"],
    acceso: true,
    esColaboradorExterno: false,
  },
  {
    nombre: "Lic. Rodrigo Amaya",
    rol: "Encargado",
    centro: "Campus Copán",
    grupos: ["Fútbol 11 (Copán)"],
    acceso: false,
    esColaboradorExterno: true,
  },
];

export const usuariosProcad: UsuarioProcad[] = [
  {
    nombre: "Isaac Carranza",
    correo: "isaac.carranza@unah.hn",
    rol: "Administrador PROCAD",
    estado: "activo",
  },
  {
    nombre: "Prof. Marco Aurelio Reyes",
    correo: "marco.reyes@unah.hn",
    rol: "Encargado",
    estado: "activo",
  },
  { nombre: "Lic. Karla Núñez", correo: "karla.nunez@unah.hn", rol: "Enlace regional", estado: "activo" },
  { nombre: "Ing. Paola Cálix", correo: "paola.calix@unah.hn", rol: "Enlace regional", estado: "inactivo" },
];

// --- Casos por resolver -----------------------------------------------------

export const solicitudesProcad: SolicitudProcad[] = [
  {
    id: 301,
    nombre: "María Contreras",
    cuenta: "20191002345",
    identidad: "0801-2003-01234",
    correo: "maria.contreras@unah.hn",
    telefono: "9988-1234",
    grupo: "Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    sexo: "F",
    carrera: "Ingeniería en Sistemas",
    periodo: "II-2026",
    fechaSolicitud: "2026-08-19",
    indiceGlobal: 79,
    matriculaVerificada: true,
    contactoEmergencia: { nombre: "Marta Contreras (madre)", telefono: "9988-4321" },
    posicion: "Defensa",
    alergia: "Ninguna",
    experiencia: {
      texto:
        "Jugué 4 años en la liga estudiantil de San Pedro Sula. Participé en el torneo interuniversitario 2023.",
      archivos: ["certificado_liga_2023.pdf", "carta_recomendacion.jpg"],
    },
    indice: 82,
    estado: "pendiente",
  },
  {
    id: 302,
    nombre: "Jorge Aguilar",
    cuenta: "20182000456",
    identidad: "1801-2002-05678",
    correo: "jorge.aguilar@unah.hn",
    telefono: "9977-5566",
    grupo: "Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    sexo: "M",
    carrera: "Administración de Empresas",
    periodo: "II-2026",
    fechaSolicitud: "2026-08-20",
    indiceGlobal: 77,
    matriculaVerificada: true,
    contactoEmergencia: { nombre: "Luis Aguilar (padre)", telefono: "9977-1122" },
    posicion: "Portero",
    experiencia: {
      texto: "Jugador desde secundaria, pero mi índice de este período bajó por una materia difícil.",
      archivos: [],
    },
    indice: 74,
    estado: "pendiente",
  },
  {
    id: 303,
    nombre: "Diego Erazo",
    cuenta: "20197008345",
    identidad: "0801-2001-04455",
    correo: "diego.erazo@unah.hn",
    telefono: "9911-2288",
    grupo: "Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    sexo: "M",
    carrera: "Pedagogía",
    periodo: "II-2026",
    fechaSolicitud: "2026-08-21",
    indiceGlobal: 81,
    matriculaVerificada: true,
    contactoEmergencia: { nombre: "Rosa Erazo (madre)", telefono: "9911-3344" },
    posicion: "Mediocampista",
    alergia: "Ninguna",
    experiencia: {
      texto: "Selección departamental sub-18 entre 2021 y 2023.",
      archivos: ["constancia_seleccion.pdf"],
    },
    indice: 79,
    estado: "observada",
  },
  {
    id: 304,
    nombre: "Daniela Zúñiga",
    cuenta: "20201003789",
    identidad: "0801-2004-03210",
    correo: "daniela.zuniga@unah.hn",
    telefono: "9955-7788",
    grupo: "Banda Marcial Alma Mater",
    tipo: "artistico",
    centro: "Ciudad Universitaria (CU)",
    sexo: "F",
    carrera: "Música",
    periodo: "II-2026",
    fechaSolicitud: "2026-08-18",
    indiceGlobal: 90,
    matriculaVerificada: true,
    contactoEmergencia: { nombre: "Carlos Zúñiga (padre)", telefono: "9955-9911" },
    instrumento: "Trompeta",
    nivelExperiencia: "Avanzado",
    alergia: "Polen",
    experiencia: {
      texto: "Cinco años en la banda de mi colegio, tercera trompeta los dos últimos.",
      archivos: ["diploma_banda_2024.pdf"],
    },
    indice: 88,
    estado: "aprobada",
  },
  {
    id: 305,
    nombre: "Pablo Osorio",
    cuenta: "20194006234",
    identidad: "0501-2002-07766",
    correo: "pablo.osorio@unah.hn",
    telefono: "9933-4411",
    grupo: "Coro de Cámara UNAH Cortés",
    tipo: "artistico",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    sexo: "M",
    carrera: "Letras",
    periodo: "II-2026",
    fechaSolicitud: "2026-08-22",
    indiceGlobal: 74,
    matriculaVerificada: false,
    contactoEmergencia: { nombre: "Iris Osorio (hermana)", telefono: "9933-8877" },
    instrumento: "Voz — tenor",
    nivelExperiencia: "Intermedio",
    indice: 71,
    estado: "pendiente",
  },
  {
    id: 306,
    nombre: "Sofía Bautista",
    cuenta: "20205001122",
    identidad: "0801-2005-01199",
    correo: "sofia.bautista@unah.hn",
    telefono: "9922-6655",
    grupo: "Atletismo",
    tipo: "deportivo",
    centro: "Campus Comayagua",
    sexo: "F",
    carrera: "Enfermería",
    periodo: "II-2026",
    fechaSolicitud: "2026-08-23",
    indiceGlobal: 80,
    matriculaVerificada: true,
    contactoEmergencia: { nombre: "Delmy Bautista (madre)", telefono: "9922-1100" },
    alergia: "Ninguna",
    experiencia: {
      texto: "Corro 5 km desde 2022 en carreras municipales.",
      archivos: ["tiempos_5k.pdf"],
    },
    indice: 76,
    estado: "noCumple",
  },
];

export const condicionadosPendientes: CondicionadoPendiente[] = [
  {
    id: 401,
    nombre: "Kevin Martínez",
    cuenta: "20193004112",
    grupo: "Fútbol 11",
    propone: "Prof. Marco Aurelio Reyes",
    justificacion:
      "Muy comprometido en cada práctica; titular la temporada pasada, aunque su índice de este período no alcanza el mínimo.",
  },
];

export const expulsionesPendientes: ExpulsionPendiente[] = [
  {
    id: 501,
    nombre: "Andrés Mejía",
    cuenta: "20187002233",
    grupo: "Grupo Teatral Lucem Aspicio",
    solicita: "Prof. Daniel Suazo (a nombre de colaborador externo)",
    motivo: "Inasistencia reiterada",
    detalle: "Faltó a 6 de los últimos 8 ensayos sin justificación.",
  },
];

export const matriculasExcepcionales: MatriculaExcepcional[] = [
  {
    id: 601,
    nombre: "Renata Solís",
    cuenta: "20208005566",
    motivo: "Apoyo en la organización del Festival Cultural UNAH 2026",
    periodo: "II-2026",
  },
  {
    id: 602,
    nombre: "Iván Padilla",
    cuenta: "20176003344",
    motivo: "Representación institucional en el Congreso Nacional de Voluntariado",
    periodo: "II-2026",
  },
];

/**
 * Las actividades que reportan los encargados de las agrupaciones.
 *
 * Las ocho primeras tienen álbum en la galería —su primera foto es la portada
 * de la tarjeta—; las tres últimas no, y son las que enseñan cómo se ve una
 * actividad sin fotos. Hay actividades en los cuatro estados a propósito: los
 * apartados de la pantalla se prueban con contenido, no con listas vacías.
 */
export const actividadesProcad: ActividadProcad[] = [
  {
    id: 701,
    titulo: "Torneo interuniversitario de fútbol",
    grupo: "Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Prof. Marco Aurelio Reyes",
      rol: "Encargado de la agrupación",
      correo: "marco.reyes@unah.edu.hn",
    },
    fecha: "14 feb 2026",
    hora: "9:00 AM",
    lugar: "Estadio Universitario, Ciudad Universitaria",
    inscritos: 24,
    asistentes: 22,
    horas: 4,
    justificacion:
      "Fase de grupos del torneo interuniversitario, con UNITEC, UTH y CEUTEC. Es la competencia federada del período y de ella sale la convocatoria a la selección universitaria.",
    adjuntos: ["Lista de asistencia firmada.pdf", "Acta del torneo.pdf"],
    enviada: "16 feb 2026",
    estado: "VALIDADA",
    resolucion: { por: "Lic. Wilmer Cárcamo", fecha: "17 feb 2026" },
  },
  {
    id: 702,
    titulo: "Presentación en el Festival Cultural",
    grupo: "Banda Marcial Alma Mater",
    tipo: "artistico",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Prof. Daniel Suazo",
      rol: "Encargado de la agrupación",
      correo: "daniel.suazo@unah.edu.hn",
    },
    fecha: "20 feb 2026",
    hora: "4:00 PM",
    lugar: "Plaza La Merced, Tegucigalpa",
    inscritos: 48,
    asistentes: 45,
    horas: 3,
    justificacion:
      "Participación de la banda en el Festival Cultural de la ciudad, por invitación de la alcaldía. Es la presentación con más público del período y la que la universidad usa en su memoria anual.",
    adjuntos: ["Lista de asistencia firmada.pdf", "Invitación de la alcaldía.pdf"],
    enviada: "21 feb 2026",
    estado: "VALIDADA",
    resolucion: { por: "Lic. Wilmer Cárcamo", fecha: "23 feb 2026" },
  },
  {
    id: 703,
    titulo: "Muestra de danza folclórica",
    grupo: "Cuadro de Danza Folklórica Popol Vuh",
    tipo: "artistico",
    centro: "Campus Comayagua",
    encargado: {
      nombre: "Ing. Paola Cálix",
      rol: "Enlace regional",
      correo: "paola.calix@unah.edu.hn",
    },
    fecha: "5 mar 2026",
    hora: "10:00 AM",
    lugar: "Auditorio del Campus Comayagua",
    inscritos: 26,
    asistentes: 19,
    horas: 3,
    justificacion:
      "Muestra abierta a la comunidad del campus con los cuatro bailes montados este período. Sirve de ensayo general para la gira regional de abril.",
    adjuntos: ["Programa de la muestra.pdf"],
    enviada: "6 mar 2026",
    estado: "OBSERVADA",
    resolucion: {
      por: "Lic. Wilmer Cárcamo",
      fecha: "9 mar 2026",
      motivo:
        "Falta la lista de asistencia firmada. Sin ella no se pueden abonar las horas, porque siete de los veintiséis inscritos no aparecen como asistentes y no hay cómo comprobarlo.",
    },
  },
  {
    id: 704,
    titulo: "Cuadrangular de baloncesto",
    grupo: "Baloncesto",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Lic. Fernanda Ochoa",
      rol: "Colaboradora externa · registrada por el administrador",
      correo: "fernanda.ochoa@externo.hn",
    },
    fecha: "12 mar 2026",
    hora: "2:00 PM",
    lugar: "Gimnasio Universitario, Ciudad Universitaria",
    inscritos: 20,
    asistentes: 18,
    horas: 5,
    justificacion:
      "Cuadrangular de preparación con equipos de la liga mayor, antes de la eliminatoria nacional universitaria. Dos jornadas en un mismo día, ida y vuelta contra cada equipo.",
    adjuntos: ["Lista de asistencia firmada.pdf", "Rol de juegos.pdf"],
    enviada: "13 mar 2026",
    estado: "PENDIENTE_VALIDACION",
  },
  {
    id: 705,
    titulo: "Concierto de fin de período",
    grupo: "Coro de Cámara UNAH Cortés",
    tipo: "artistico",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    encargado: {
      nombre: "Lic. Karla Núñez",
      rol: "Encargada de la agrupación",
      correo: "karla.nunez@unah.edu.hn",
    },
    fecha: "21 mar 2026",
    hora: "6:00 PM",
    lugar: "Auditorio del Campus Cortés",
    inscritos: 32,
    asistentes: 30,
    horas: 4,
    justificacion:
      "Concierto de cierre con el repertorio trabajado durante el período, abierto al público del campus. Cierra el ciclo de ensayos y es la única presentación formal del coro este trimestre.",
    adjuntos: ["Lista de asistencia firmada.pdf", "Programa de mano.pdf"],
    enviada: "22 mar 2026",
    estado: "PENDIENTE_VALIDACION",
  },
  {
    id: 706,
    titulo: "Eliminatoria de voleibol",
    grupo: "Voleibol (Choluteca)",
    tipo: "deportivo",
    centro: "Campus Choluteca (CURLP)",
    encargado: {
      nombre: "Lic. Karla Núñez",
      rol: "Encargada de la agrupación",
      correo: "karla.nunez@unah.edu.hn",
    },
    fecha: "2 abr 2026",
    hora: "8:00 AM",
    lugar: "Cancha techada del Campus Choluteca",
    inscritos: 16,
    asistentes: 14,
    horas: 6,
    justificacion:
      "Eliminatoria regional del sur. El equipo que gane representa a la zona en el nacional universitario de mayo.",
    adjuntos: ["Lista de asistencia firmada.pdf"],
    enviada: "3 abr 2026",
    estado: "PENDIENTE_VALIDACION",
  },
  {
    id: 707,
    titulo: "Festival de teatro estudiantil",
    grupo: "Grupo Teatral Lucem Aspicio",
    tipo: "artistico",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Lic. Andrea Zelaya",
      rol: "Encargada de la agrupación",
      correo: "andrea.zelaya@unah.edu.hn",
    },
    fecha: "18 abr 2026",
    hora: "7:00 PM",
    lugar: "Teatro Universitario, Ciudad Universitaria",
    inscritos: 22,
    asistentes: 21,
    horas: 5,
    justificacion:
      "Estreno del montaje del período dentro del festival de teatro estudiantil, con tres funciones en la misma semana. Participaron cinco universidades.",
    adjuntos: ["Lista de asistencia firmada.pdf", "Programa del festival.pdf"],
    enviada: "19 abr 2026",
    estado: "VALIDADA",
    resolucion: { por: "Lic. Wilmer Cárcamo", fecha: "20 abr 2026" },
  },
  {
    id: 708,
    titulo: "Encuentro de atletismo",
    grupo: "Atletismo",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Ing. Paola Cálix",
      rol: "Enlace regional",
      correo: "paola.calix@unah.edu.hn",
    },
    fecha: "25 abr 2026",
    hora: "6:30 AM",
    lugar: "Pista atlética, Ciudad Universitaria",
    inscritos: 30,
    asistentes: 24,
    horas: 4,
    justificacion:
      "Encuentro de marcas para clasificar a la selección universitaria de atletismo. Se corrieron las pruebas de velocidad y medio fondo.",
    adjuntos: ["Planilla de marcas.pdf"],
    enviada: "26 abr 2026",
    estado: "OBSERVADA",
    resolucion: {
      por: "Lic. Wilmer Cárcamo",
      fecha: "28 abr 2026",
      motivo:
        "La planilla de marcas no sustituye a la lista de asistencia: en ella solo aparecen los que compitieron, no los que estuvieron. Reenvíela con la lista firmada por los treinta inscritos.",
    },
  },
  {
    id: 709,
    titulo: "Partido amistoso vs. UNITEC",
    grupo: "Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Prof. Marco Aurelio Reyes",
      rol: "Encargado de la agrupación",
      correo: "marco.reyes@unah.edu.hn",
    },
    fecha: "28 abr 2026",
    hora: "3:00 PM",
    lugar: "Cancha auxiliar, Ciudad Universitaria",
    inscritos: 24,
    asistentes: 9,
    horas: 3,
    justificacion: "Partido de preparación acordado con el cuerpo técnico de UNITEC.",
    adjuntos: [],
    enviada: "29 abr 2026",
    estado: "RECHAZADA",
    resolucion: {
      por: "Lic. Wilmer Cárcamo",
      fecha: "30 abr 2026",
      motivo:
        "No estaba en el plan del período y no se pidió autorización previa. Además se presentaron nueve de veinticuatro, así que tampoco cumple el mínimo de asistencia para contar como actividad del programa.",
    },
  },
  {
    id: 710,
    titulo: "Taller de expresión corporal",
    grupo: "Grupo Teatral Lucem Aspicio",
    tipo: "artistico",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Lic. Andrea Zelaya",
      rol: "Encargada de la agrupación",
      correo: "andrea.zelaya@unah.edu.hn",
    },
    fecha: "6 may 2026",
    hora: "1:00 PM",
    lugar: "Sala de ensayo, Edificio de Arte",
    inscritos: 18,
    asistentes: 17,
    horas: 2,
    justificacion:
      "Taller impartido por una maestra invitada del Teatro Nacional, dentro de la formación del elenco para el montaje del siguiente período.",
    adjuntos: ["Lista de asistencia firmada.pdf"],
    enviada: "7 may 2026",
    estado: "PENDIENTE_VALIDACION",
  },
  {
    id: 711,
    titulo: "Jornada de limpieza del campus",
    grupo: "Selección Universitaria de Fútbol 11",
    tipo: "deportivo",
    centro: "Ciudad Universitaria (CU)",
    encargado: {
      nombre: "Prof. Marco Aurelio Reyes",
      rol: "Encargado de la agrupación",
      correo: "marco.reyes@unah.edu.hn",
    },
    fecha: "9 may 2026",
    hora: "7:00 AM",
    lugar: "Predios de la Ciudad Universitaria",
    inscritos: 26,
    asistentes: 26,
    horas: 3,
    justificacion:
      "Jornada de limpieza de los predios, organizada por el equipo como aporte a la comunidad universitaria.",
    adjuntos: ["Lista de asistencia firmada.pdf", "Fotografías de la jornada.pdf"],
    enviada: "10 may 2026",
    estado: "RECHAZADA",
    resolucion: {
      por: "Lic. Wilmer Cárcamo",
      fecha: "11 may 2026",
      motivo:
        "La jornada es válida, pero no es una actividad de PROCAD: corresponde a Voluntariado y por ahí se le abonan las horas. Preséntela en esa ventanilla para que no se pierda.",
    },
  },
];

/**
 * El calendario de visorías del período.
 *
 * Las fechas van en ISO porque el calendario cuenta días con ellas. Hay dos
 * coincidencias puestas a propósito: el 19 de febrero se cruzan dos visorías
 * en Ciudad Universitaria —que es el choque que el administrador tiene que
 * ver— y el mismo día hay una tercera en Cortés, que no choca con nada porque
 * es otro campus y otra gente.
 */
export const visoriasProcad: VisoriaProcad[] = [
  {
    id: 801,
    grupo: "Selección Universitaria de Fútbol 11",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-01-20",
    hora: "7:00 AM",
    citados: 38,
    estado: "PROGRAMADA",
  },
  {
    id: 802,
    grupo: "Fútbol 11",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-01-27",
    hora: "9:00 AM",
    citados: 47,
    estado: "PROGRAMADA",
  },
  {
    id: 803,
    grupo: "Voleibol (Choluteca)",
    centro: "Campus Choluteca (CURLP)",
    fecha: "2026-02-17",
    hora: "3:00 PM",
    citados: 14,
    estado: "BORRADOR",
  },
  {
    id: 804,
    grupo: "Banda Marcial Alma Mater",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-02-19",
    hora: "9:00 AM",
    citados: 31,
    estado: "PROGRAMADA",
  },
  {
    id: 805,
    grupo: "Baloncesto",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-02-19",
    hora: "2:00 PM",
    citados: 22,
    estado: "PROGRAMADA",
  },
  {
    id: 806,
    grupo: "Coro de Cámara UNAH Cortés",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    fecha: "2026-02-19",
    hora: "10:00 AM",
    citados: 18,
    estado: "PROGRAMADA",
  },
  {
    id: 807,
    grupo: "Atletismo",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-02-24",
    hora: "6:30 AM",
    citados: 26,
    estado: "PROGRAMADA",
  },
  {
    id: 808,
    grupo: "Grupo Teatral Lucem Aspicio",
    centro: "Ciudad Universitaria (CU)",
    fecha: "2026-02-26",
    hora: "4:00 PM",
    citados: 19,
    estado: "BORRADOR",
  },
  {
    id: 809,
    grupo: "Cuadro de Danza Folklórica Popol Vuh",
    centro: "Campus Comayagua",
    fecha: "2026-03-03",
    hora: "10:00 AM",
    citados: 12,
    estado: "PROGRAMADA",
  },
  {
    id: 810,
    grupo: "Fútbol 11 (Copán)",
    centro: "Campus Copán",
    fecha: "2026-03-05",
    hora: "8:00 AM",
    citados: 23,
    estado: "BORRADOR",
  },
  {
    id: 811,
    grupo: "Danza Garífuna AFROCURLA",
    centro: "Campus Atlántida (CURLA)",
    fecha: "2026-03-10",
    hora: "2:00 PM",
    citados: 15,
    estado: "PROGRAMADA",
  },
  {
    id: 812,
    grupo: "Artis Amantis - Teatro",
    centro: "Campus El Paraíso",
    fecha: "2026-03-12",
    hora: "1:00 PM",
    citados: 9,
    estado: "BORRADOR",
  },
];

/** Solo un período puede estar activo a la vez, y uno cerrado no vuelve a abrirse. */
export const periodosInscripcion: PeriodoInscripcion[] = [
  { label: "I Trimestre 2026", estado: "cerrado" },
  { label: "II Trimestre 2026", estado: "activo" },
  { label: "III Trimestre 2026", estado: "programado" },
];

export const auditoriaProcad: RegistroAuditoria[] = [
  {
    fecha: "8 sep 2026, 10:14",
    actor: "Isaac Carranza",
    accion: "Autorizó condicionado",
    detalle: "Ana Lucía Reyes — Fútbol 11",
  },
  {
    fecha: "6 sep 2026, 16:02",
    actor: "Isaac Carranza",
    accion: "Resolvió expulsión",
    detalle: "Aprobada — Luis Fonseca, Voleibol (Choluteca)",
  },
  {
    fecha: "3 sep 2026, 09:41",
    actor: "Isaac Carranza",
    accion: "Otorgó matrícula excepcional",
    detalle: "Renata Solís — Festival Cultural UNAH 2026",
  },
  {
    fecha: "29 ago 2026, 14:20",
    actor: "Isaac Carranza",
    accion: "Validó actividad",
    detalle: "Torneo interuniversitario — Baloncesto",
  },
  {
    fecha: "20 ago 2026, 08:55",
    actor: "Isaac Carranza",
    accion: "Activó período",
    detalle: "II Trimestre 2026",
  },
];
