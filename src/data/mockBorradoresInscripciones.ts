import type { BorradorInscripcion } from "../types";

// Borradores de inscripción a gira guardados por el docente, aún sin enviar.
// Igual que mockBorradoresGiras.ts: distintos niveles de campos incompletos
// para probar los estados vacíos de la tabla de Borradores.
export const borradoresInscripciones: BorradorInscripcion[] = [
  {
    id: "BRI-2026-001",
    giraId: "GR-2026-021",
    nombreEstudiante: "PAOLA MICHELLE HERNANDEZ SOSA",
    numeroCuenta: "20211003344",
    fecha: "2026-08-15",
    // Carrera, correo, teléfono y ficha de salud todavía sin llenar.
  },
  {
    id: "BRI-2026-002",
    giraId: "GR-2026-022",
    // Datos del estudiante todavía sin capturar.
  },
  {
    id: "BRI-2026-003",
    nombreEstudiante: "JORGE LUIS PINEDA MARTINEZ",
    numeroCuenta: "20191008812",
    // Todavía no elige la gira.
  },
];
