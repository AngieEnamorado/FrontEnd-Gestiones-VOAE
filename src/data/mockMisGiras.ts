import type { SolicitudGira } from "../types";

// Giras donde el usuario en sesión (Erin Matute) figura como docente / jefe de misión.
export const misGiras: SolicitudGira[] = [
  {
    id: "GR-2026-021",
    estudiante: "Grupo de Arqueología III",
    docente: "Erin Matute",
    destino: "Copán Ruinas, Copán",
    categoria: "Arqueología y Patrimonio Cultural",
    centro: "CIUDAD UNIVERSITARIA",
    periodo: "II Periodo 2026",
    fecha: "2026-09-18",
    estado: "APROBADA",
    descripcion:
      "Gira de campo con estudiantes de Arqueología III al Parque Arqueológico de Copán para prácticas de registro y catalogación de piezas.",
  },
  {
    id: "GR-2026-022",
    estudiante: "Grupo de Biología Marina II",
    docente: "Erin Matute",
    destino: "Roatán, Islas de la Bahía",
    categoria: "Biología Marina",
    centro: "CURLA",
    periodo: "II Periodo 2026",
    fecha: "2026-10-02",
    estado: "PENDIENTE",
    descripcion:
      "Monitoreo de arrecifes coralinos y toma de muestras para el laboratorio de biología marina.",
  },
  {
    id: "GR-2026-023",
    estudiante: "Grupo de Historia Colonial",
    docente: "Erin Matute",
    destino: "Comayagua",
    categoria: "Historia y Arquitectura Colonial",
    centro: "CIUDAD UNIVERSITARIA",
    periodo: "I Periodo 2026",
    fecha: "2026-04-14",
    estado: "EN REVISIÓN",
    descripcion:
      "Recorrido guiado por el centro histórico y museos de Comayagua para el proyecto de curso de Historia Colonial.",
  },
  {
    id: "GR-2026-024",
    estudiante: "Grupo de Ingeniería Agronómica",
    docente: "Erin Matute",
    destino: "La Esperanza, Intibucá",
    categoria: "Ingeniería Agronómica",
    centro: "CURLP",
    periodo: "I Periodo 2026",
    fecha: "2026-03-22",
    estado: "RECHAZADA",
    descripcion:
      "Gira técnica a fincas cafetaleras de altura para evaluar prácticas de cultivo sostenible.",
  },
  {
    id: "GR-2026-025",
    estudiante: "Grupo de Trabajo Social",
    docente: "Erin Matute",
    destino: "Marcala, La Paz",
    categoria: "Trabajo Social Comunitario",
    centro: "CIUDAD UNIVERSITARIA",
    periodo: "II Periodo 2026",
    fecha: "2026-11-05",
    estado: "ESPERA INF. SOCIAL",
    descripcion:
      "Diagnóstico participativo con comunidades rurales para el curso de práctica de Trabajo Social.",
  },
];
