import type { Inscripcion } from "../types";

// Inscripciones de estudiantes por gira, indexadas por el ID de la gira (misGiras).
export const inscripcionesPorGira: Record<string, Inscripcion[]> = {
  "GR-2026-021": [
    {
      id: "INS-2026-041",
      nombreEstudiante: "MARIAJOSE BERGANZA DOMINGUEZ",
      estado: "APROBADA",
      fecha: "2026-08-20",
      periodo: "II Periodo 2026",
    },
    {
      id: "INS-2026-042",
      nombreEstudiante: "CALEB MIGUEL RODRIGUEZ LAGOS",
      estado: "PENDIENTE",
      fecha: "2026-08-21",
      periodo: "II Periodo 2026",
    },
    {
      id: "INS-2026-043",
      nombreEstudiante: "FRANCISCO JAVIER MEJIA SOSA",
      estado: "RECHAZADA",
      fecha: "2026-08-22",
      periodo: "II Periodo 2026",
    },
  ],
  "GR-2026-022": [
    {
      id: "INS-2026-051",
      nombreEstudiante: "DANIELA ALEJANDRA PAZ MATAMOROS",
      estado: "APROBADA",
      fecha: "2026-09-10",
      periodo: "II Periodo 2026",
    },
    {
      id: "INS-2026-052",
      nombreEstudiante: "JOSUE ANTONIO CASTELLANOS RIVERA",
      estado: "PENDIENTE",
      fecha: "2026-09-11",
      periodo: "II Periodo 2026",
    },
  ],
  "GR-2026-023": [
    {
      id: "INS-2026-061",
      nombreEstudiante: "GABRIELA MARIA DUBON PORTILLO",
      estado: "PENDIENTE",
      fecha: "2026-04-02",
      periodo: "I Periodo 2026",
    },
    {
      id: "INS-2026-062",
      nombreEstudiante: "OSCAR EDUARDO MEZA VELASQUEZ",
      estado: "APROBADA",
      fecha: "2026-04-03",
      periodo: "I Periodo 2026",
    },
  ],
  "GR-2026-024": [
    {
      id: "INS-2026-071",
      nombreEstudiante: "KATHERINE NICOLE ALVARADO CRUZ",
      estado: "RECHAZADA",
      fecha: "2026-03-15",
      periodo: "I Periodo 2026",
    },
  ],
  "GR-2026-025": [
    {
      id: "INS-2026-081",
      nombreEstudiante: "LUIS FERNANDO ORELLANA TORRES",
      estado: "APROBADA",
      fecha: "2026-10-25",
      periodo: "II Periodo 2026",
    },
    {
      id: "INS-2026-082",
      nombreEstudiante: "ANDREA SOFIA MARTINEZ FLORES",
      estado: "PENDIENTE",
      fecha: "2026-10-26",
      periodo: "II Periodo 2026",
    },
  ],
};
