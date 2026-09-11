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
    grupo: "Fútbol 11",
    centro: "Ciudad Universitaria (CU)",
    indice: 82,
    estado: "pendiente",
  },
  {
    id: 302,
    nombre: "Jorge Aguilar",
    cuenta: "20182000456",
    grupo: "Fútbol 11",
    centro: "Ciudad Universitaria (CU)",
    indice: 74,
    estado: "pendiente",
  },
  {
    id: 303,
    nombre: "Diego Erazo",
    cuenta: "20197008345",
    grupo: "Fútbol 11",
    centro: "Ciudad Universitaria (CU)",
    indice: 79,
    estado: "observada",
  },
  {
    id: 304,
    nombre: "Daniela Zúñiga",
    cuenta: "20201003789",
    grupo: "Banda Marcial Alma Mater",
    centro: "Ciudad Universitaria (CU)",
    indice: 88,
    estado: "aprobada",
  },
  {
    id: 305,
    nombre: "Pablo Osorio",
    cuenta: "20194006234",
    grupo: "Coro de Cámara UNAH Cortés",
    centro: "Campus Cortés / Valle de Sula (CURC)",
    indice: 71,
    estado: "pendiente",
  },
  {
    id: 306,
    nombre: "Sofía Bautista",
    cuenta: "20205001122",
    grupo: "Atletismo",
    centro: "Campus Comayagua",
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

export const actividadesProcad: ActividadProcad[] = [
  {
    id: 701,
    titulo: "Partido amistoso vs. UNITEC",
    grupo: "Fútbol 11",
    fecha: "25 ene 2026",
    inscritos: 22,
    estado: "PENDIENTE_VALIDACION",
  },
  {
    id: 702,
    titulo: "Presentación Festival Cultural",
    grupo: "Banda Marcial Alma Mater",
    fecha: "20 feb 2026",
    inscritos: 45,
    estado: "PENDIENTE_VALIDACION",
  },
  {
    id: 703,
    titulo: "Torneo interuniversitario",
    grupo: "Baloncesto",
    fecha: "2 feb 2026",
    inscritos: 18,
    estado: "VALIDADA",
  },
];

export const visoriasProcad: VisoriaProcad[] = [
  {
    id: 801,
    grupo: "Voleibol (Choluteca)",
    centro: "Campus Choluteca (CURLP)",
    fecha: "15 feb 2026",
    hora: "3:00 PM",
    citados: 14,
    estado: "BORRADOR",
  },
  {
    id: 802,
    grupo: "Fútbol 11",
    centro: "Ciudad Universitaria (CU)",
    fecha: "20 ene 2026",
    hora: "9:00 AM",
    citados: 47,
    estado: "PROGRAMADA",
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
