import type { SolicitudGira } from "../types";

// Datos de ejemplo para poblar la tabla de "Solicitudes" dentro de Giras.
export const solicitudesGiras: SolicitudGira[] = [
  {
    id: "GR-2026-014",
    estudiante: "MARIAJOSE BERGANZA DOMINGUEZ",
    docente: "Dr. Mario Enrique Cálix",
    destino: "Copán Ruinas, Copán",
    categoria: "Arqueología y Patrimonio Cultural",
    centro: "CIUDAD UNIVERSITARIA",
    periodo: "II Periodo 2026",
    fecha: "2026-08-12",
    estado: "APROBADA",
    descripcion:
      "Visita de campo al Parque Arqueológico de Copán para el estudio de estelas mayas y técnicas de conservación de patrimonio cultural, con actividades de registro y catalogación en sitio.",
  },
  {
    id: "GR-2026-015",
    estudiante: "CALEB MIGUEL RODRIGUEZ LAGOS",
    docente: "Licda. Ana Gabriela Funez",
    destino: "Roatán, Islas de la Bahía",
    categoria: "Biología Marina",
    centro: "CURLA",
    periodo: "II Periodo 2026",
    fecha: "2026-08-20",
    estado: "PENDIENTE",
    descripcion:
      "Práctica de campo para el monitoreo de arrecifes coralinos y especies marinas, incluyendo inmersiones de reconocimiento y toma de muestras para el laboratorio de biología marina.",
  },
  {
    id: "GR-2026-016",
    estudiante: "FRANCISCO JAVIER MEJIA SOSA",
    docente: "Ing. Carlos Roberto Zelaya",
    destino: "La Esperanza, Intibucá",
    categoria: "Ingeniería Agronómica",
    centro: "CURLP",
    periodo: "I Periodo 2026",
    fecha: "2026-03-05",
    estado: "RECHAZADA",
    descripcion:
      "Gira técnica a fincas cafetaleras de altura para evaluar prácticas de cultivo sostenible; solicitud rechazada por falta de disponibilidad de transporte institucional en la fecha indicada.",
  },
  {
    id: "GR-2026-017",
    estudiante: "DANIELA ALEJANDRA PAZ MATAMOROS",
    docente: "Dra. Reina Isabel Cáceres",
    destino: "Comayagua",
    categoria: "Historia y Arquitectura Colonial",
    centro: "CIUDAD UNIVERSITARIA",
    periodo: "II Periodo 2026",
    fecha: "2026-09-01",
    estado: "APROBADA",
    descripcion:
      "Recorrido guiado por el centro histórico y museos de Comayagua para el análisis de arquitectura colonial hondureña, con levantamiento fotográfico para el proyecto de curso.",
  },
];
