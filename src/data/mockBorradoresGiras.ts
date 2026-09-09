import type { BorradorGira } from "../types";

// Borradores de solicitud de gira guardados por el docente, aún sin enviar.
// Se guardan a propósito con distintos niveles de campos incompletos para
// probar los estados vacíos de la tabla de Borradores.
export const borradoresGiras: BorradorGira[] = [
  {
    id: "BR-2026-001",
    destino: "Gracias, Lempira",
    categoria: "Historia y Arquitectura Colonial",
    centro: "CIUDAD UNIVERSITARIA",
    periodo: "II Periodo 2026",
    fecha: "2026-11-14",
    docente: "Erin Matute",
    descripcion:
      "Recorrido por el centro histórico y la Fortaleza de San Cristóbal para el curso de Historia Colonial.",
    alcanceViaje: "Nacional",
    carrerasParticipantes: ["Historia"],
    facultadesParticipantes: ["Ciencias Sociales"],
    finalidadesGira: ["Académica", "Cultural"],
  },
  {
    id: "BR-2026-002",
    destino: "Trujillo, Colón",
    docente: "Erin Matute",
    // Categoría, centro, período y fecha todavía sin llenar.
  },
  {
    id: "BR-2026-003",
    categoria: "Biología Marina",
    centro: "CURLA",
    periodo: "II Periodo 2026",
    docente: "Erin Matute",
    // Destino y fecha todavía sin llenar.
  },
  {
    id: "BR-2026-004",
    docente: "Erin Matute",
    // Borrador recién creado, casi todos los campos están vacíos.
  },
];
