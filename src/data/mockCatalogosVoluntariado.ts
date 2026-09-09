import type { Campus, CargoJuntaDirectiva, RedTematica, Trimestre } from "../types";

// Catálogos base del módulo de Voluntariado. En producción vienen de la API;
// aquí quedan fijos para poder derivar todo lo demás (grupos, actividades).
export const campus: Campus[] = [
  { id: "cu", nombre: "Ciudad Universitaria" },
  { id: "curla", nombre: "CURLA" },
  { id: "curlp", nombre: "CURLP" },
  { id: "curc", nombre: "CURC" },
  { id: "curoc", nombre: "CUROC" },
  { id: "unah-tec", nombre: "UNAH-TEC" },
  { id: "unah-vs", nombre: "UNAH-VS" },
  { id: "choluteca", nombre: "Choluteca" },
  { id: "danli", nombre: "Danlí" },
  { id: "juticalpa", nombre: "Juticalpa" },
];

export const redesTematicas: RedTematica[] = [
  { id: "ambiental", nombre: "Red Ambiental", color: "emerald" },
  { id: "salud", nombre: "Red de Salud", color: "rose" },
  { id: "educativa", nombre: "Red Educativa", color: "blue" },
  { id: "social", nombre: "Red Social", color: "amber" },
  { id: "cultural", nombre: "Red Cultural", color: "violet" },
];

export const trimestres: Trimestre[] = [
  { id: "2026-t1", nombre: "I Trimestre 2026", fechaLimite: "2026-04-15" },
  { id: "2026-t2", nombre: "II Trimestre 2026", fechaLimite: "2026-07-15" },
  { id: "2026-t3", nombre: "III Trimestre 2026", fechaLimite: "2026-10-15" },
  { id: "2026-t4", nombre: "IV Trimestre 2026", fechaLimite: "2027-01-15" },
];

export const cargosJuntaDirectiva: CargoJuntaDirectiva[] = [
  "Presidente",
  "Vicepresidente",
  "Secretario",
  "Tesorero",
  "Fiscal",
  "Vocal",
];

export function nombreCampus(campusId: string): string {
  return campus.find((c) => c.id === campusId)?.nombre ?? campusId;
}

export function redPorId(redId: string): RedTematica | undefined {
  return redesTematicas.find((r) => r.id === redId);
}
