import type {
  ActividadVoluntariado,
  InscripcionActividadVoluntariado,
  RegistroAsistenciaVoluntariado,
} from "../types";

export const actividadesVoluntariado: ActividadVoluntariado[] = [
  // Ya ejecutadas — alimentan "Mi historial" del estudiante.
  {
    id: "act-tutorias-marzo",
    nombre: "Tutorías sabatinas — marzo",
    objetivo: "Apoyo escolar en matemáticas y español para niñez de 3° a 6° grado.",
    grupoId: "manos-que-ayudan",
    esConjunta: false,
    fecha: "2026-03-14",
    lugar: "Escuela Simón Bolívar, Tegucigalpa",
    cupo: 20,
    periodoAcademico: "I Periodo 2026",
    estado: "APROBADA",
    fotosEvidencia: 4,
    resultados: "Se atendieron 18 niños con avances visibles en lectoescritura.",
  },
  {
    id: "act-reforestacion-abril",
    nombre: "Reforestación Río Guacerique",
    objetivo: "Sembrar 300 árboles nativos en la cuenca del río Guacerique.",
    grupoId: "ecounah",
    esConjunta: false,
    fecha: "2026-04-18",
    lugar: "Cuenca Río Guacerique, Tegucigalpa",
    cupo: 40,
    periodoAcademico: "I Periodo 2026",
    estado: "APROBADA",
    fotosEvidencia: 4,
    resultados: "Se sembraron 320 árboles con apoyo de la comunidad local.",
  },
  {
    id: "act-feria-salud-mayo",
    nombre: "Feria de salud y educación comunitaria",
    objetivo: "Jornada conjunta de salud preventiva y apoyo escolar en Olanchito.",
    grupoId: "brigada-de-salud",
    esConjunta: true,
    grupoCoorganizadorId: "manos-que-ayudan",
    fecha: "2026-05-09",
    lugar: "Olanchito, Yoro",
    cupo: 35,
    periodoAcademico: "II Periodo 2026",
    estado: "APROBADA",
    fotosEvidencia: 4,
    resultados: "Se brindaron 150 consultas médicas y 60 niños recibieron tutoría.",
  },
  {
    id: "act-reciclaje-junio",
    nombre: "Campaña de reciclaje electrónico",
    objetivo: "Recolección de residuos electrónicos en los edificios administrativos.",
    grupoId: "ecounah",
    esConjunta: false,
    fecha: "2026-06-20",
    lugar: "Ciudad Universitaria",
    cupo: 15,
    periodoAcademico: "II Periodo 2026",
    estado: "APROBADA",
    fotosEvidencia: 3,
    resultados: "Se recolectaron 180 kg de residuos electrónicos para reciclaje certificado.",
  },

  // Próxima — es la que se usa para inscripción y para "Pasar lista".
  {
    id: "act-tutorias-sabatina",
    nombre: "Tutorías sabatinas — septiembre",
    objetivo: "Apoyo escolar en matemáticas y español para niñez de 3° a 6° grado.",
    grupoId: "manos-que-ayudan",
    esConjunta: false,
    fecha: "2026-09-19",
    lugar: "Escuela Simón Bolívar, Tegucigalpa",
    cupo: 25,
    periodoAcademico: "II Periodo 2026",
    estado: "APROBADA",
    fotosEvidencia: 0,
  },
  {
    id: "act-taller-teatro",
    nombre: "Taller de teatro comunitario",
    objetivo: "Taller abierto de expresión escénica para jóvenes del occidente del país.",
    grupoId: "voces-culturales",
    esConjunta: false,
    fecha: "2026-09-26",
    lugar: "Casa de la Cultura, Comayagua",
    cupo: 30,
    periodoAcademico: "II Periodo 2026",
    estado: "APROBADA",
    fotosEvidencia: 0,
  },

  // Pendientes de aprobación — alimentan "Aprobación de actividades" (admin).
  {
    id: "act-colecta-viveres",
    nombre: "Colecta de víveres zona sur",
    objetivo: "Recolección y distribución de víveres para familias afectadas por temporada lluviosa.",
    grupoId: "unidos-por-choluteca",
    esConjunta: false,
    fecha: "2026-10-03",
    lugar: "Choluteca, Choluteca",
    cupo: 20,
    periodoAcademico: "II Periodo 2026",
    estado: "PENDIENTE",
    fotosEvidencia: 0,
  },
  {
    id: "act-feria-ambiental-conjunta",
    nombre: "Feria ambiental conjunta",
    objetivo: "Feria de concientización ambiental con talleres de reciclaje y siembra.",
    grupoId: "ecounah",
    esConjunta: true,
    grupoCoorganizadorId: "voces-culturales",
    fecha: "2026-10-10",
    lugar: "Ciudad Universitaria",
    cupo: 50,
    periodoAcademico: "II Periodo 2026",
    estado: "PENDIENTE",
    fotosEvidencia: 0,
  },
];

// Inscripciones de la estudiante de sesión en actividades ya ejecutadas
// (alimentan "Mi historial") y su asistencia confirmada con horas.
export const inscripcionesVoluntariado: InscripcionActividadVoluntariado[] = [
  { id: "insc-ana-tutorias-marzo", actividadId: "act-tutorias-marzo", estudianteCuenta: "20191000001", tipoParticipante: "voluntario activo" },
  { id: "insc-ana-reforestacion-abril", actividadId: "act-reforestacion-abril", estudianteCuenta: "20191000001", tipoParticipante: "voluntario activo" },
  { id: "insc-ana-feria-salud-mayo", actividadId: "act-feria-salud-mayo", estudianteCuenta: "20191000001", tipoParticipante: "voluntario activo" },
  { id: "insc-ana-reciclaje-junio", actividadId: "act-reciclaje-junio", estudianteCuenta: "20191000001", tipoParticipante: "voluntario activo" },
  { id: "insc-ana-taller-teatro", actividadId: "act-taller-teatro", estudianteCuenta: "20191000001", tipoParticipante: "participante" },

  // Inscritos en la próxima actividad de manos-que-ayudan — roster de "Pasar lista".
  { id: "insc-katherine-tutorias-sab", actividadId: "act-tutorias-sabatina", estudianteCuenta: "20221000512", tipoParticipante: "voluntario activo" },
  { id: "insc-emerson-tutorias-sab", actividadId: "act-tutorias-sabatina", estudianteCuenta: "20221000630", tipoParticipante: "voluntario activo" },
  { id: "insc-carlos-tutorias-sab", actividadId: "act-tutorias-sabatina", estudianteCuenta: "20191000045", tipoParticipante: "voluntario activo" },
  // No es miembro del grupo pero se inscribió como "voluntario activo" — dispara la advertencia.
  { id: "insc-bryan-tutorias-sab", actividadId: "act-tutorias-sabatina", estudianteCuenta: "20241000777", tipoParticipante: "voluntario activo" },
  // Asistente externo — participante, no voluntario del grupo.
  { id: "insc-michelle-tutorias-sab", actividadId: "act-tutorias-sabatina", estudianteCuenta: "20241000888", tipoParticipante: "participante" },
];

// Nombres de las personas inscritas que no tienen mock de grupo propio
// (se usan solo para mostrar el roster de "Pasar lista").
export const nombresInscritos: Record<string, string> = {
  "20221000512": "Katherine Suazo",
  "20221000630": "Emerson Zelaya",
  "20191000045": "Carlos Rivera",
  "20241000777": "Bryan Castillo",
  "20241000888": "Michelle Rápalo",
};

export const registrosAsistenciaVoluntariado: RegistroAsistenciaVoluntariado[] = [
  { inscripcionId: "insc-ana-tutorias-marzo", asistio: true, horas: 12 },
  { inscripcionId: "insc-ana-reforestacion-abril", asistio: true, horas: 8 },
  { inscripcionId: "insc-ana-feria-salud-mayo", asistio: true, horas: 10 },
  { inscripcionId: "insc-ana-reciclaje-junio", asistio: true, horas: 7.5 },
];

export function actividadPorId(id: string): ActividadVoluntariado | undefined {
  return actividadesVoluntariado.find((a) => a.id === id);
}
