import { inscripcionesPorGira } from "./mockInscripciones";
import { misGiras } from "./mockMisGiras";
import type { Inscripcion, SolicitudGira } from "../types";

// Las reglas de "esto es del estudiante X" en un solo lugar, para que
// Inscripciones, Mis giras y el detalle de una inscripción no las repitan.
// Una inscripción es de alguien cuando lleva su número de cuenta: el nombre
// puede escribirse distinto y no identifica a nadie.

export function esInscripcionDe(inscripcion: Inscripcion, numeroCuenta: string): boolean {
  return inscripcion.numeroCuenta === numeroCuenta;
}

/** Las giras en las que el estudiante tiene una inscripción, sea cual sea su estado. */
export function girasDelEstudiante(numeroCuenta: string): SolicitudGira[] {
  return misGiras.filter((gira) =>
    (inscripcionesPorGira[gira.id] ?? []).some((inscripcion) =>
      esInscripcionDe(inscripcion, numeroCuenta),
    ),
  );
}
