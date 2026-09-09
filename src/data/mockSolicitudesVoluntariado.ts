import type { SolicitudVoluntariado } from "../types";

// "Mis solicitudes" del estudiante de sesión (ver mockEstudianteVoluntariado.ts):
// unión a grupo y actividades, en distintos estados para cubrir todos los
// badges (pendiente, rechazada, en revisión, devuelta).
export const solicitudesEstudianteVoluntariado: SolicitudVoluntariado[] = [
  {
    id: "sol-est-union-voces",
    tipo: "union a grupo",
    titulo: "Unión a Voces Culturales",
    estudianteCuenta: "20191000001",
    grupoId: "voces-culturales",
    estado: "PENDIENTE",
    fecha: "2026-09-02",
  },
  {
    id: "sol-est-union-brigada",
    tipo: "union a grupo",
    titulo: "Unión a Brigada de Salud UNAH",
    estudianteCuenta: "20191000001",
    grupoId: "brigada-de-salud",
    estado: "RECHAZADA",
    fecha: "2026-07-20",
    motivoDecision: "El grupo requiere estar matriculado en Medicina o Enfermería.",
  },
  {
    id: "sol-est-actividad-bingo",
    tipo: "actividad",
    titulo: "Bingo solidario — recaudación de fondos",
    estudianteCuenta: "20191000001",
    grupoId: "manos-que-ayudan",
    estado: "EN REVISIÓN",
    fecha: "2026-08-30",
  },
  {
    id: "sol-est-union-choluteca",
    tipo: "union a grupo",
    titulo: "Unión a Unidos por Choluteca",
    estudianteCuenta: "20191000001",
    grupoId: "unidos-por-choluteca",
    estado: "DEVUELTA",
    fecha: "2026-06-05",
    motivoDecision: "Debes indicar tu campus de procedencia y carta de compromiso.",
  },
];

// Solicitudes de unión pendientes que un coordinador debe aprobar/rechazar
// (pantalla "Solicitudes de unión pendientes" del grupo que coordina).
export const solicitudesUnionPendientes: SolicitudVoluntariado[] = [
  {
    id: "sol-union-katherine-b",
    tipo: "union a grupo",
    titulo: "Solicitud de unión",
    estudianteCuenta: "20241000901",
    grupoId: "manos-que-ayudan",
    estado: "PENDIENTE",
    fecha: "2026-09-05",
  },
  {
    id: "sol-union-emerson-b",
    tipo: "union a grupo",
    titulo: "Solicitud de unión",
    estudianteCuenta: "20241000902",
    grupoId: "manos-que-ayudan",
    estado: "PENDIENTE",
    fecha: "2026-09-06",
  },
];

export const solicitantesInfo: Record<string, { nombre: string; carrera: string }> = {
  "20241000901": { nombre: "Fernanda Zepeda", carrera: "Pedagogía" },
  "20241000902": { nombre: "Isaac Núñez", carrera: "Trabajo Social" },
};
