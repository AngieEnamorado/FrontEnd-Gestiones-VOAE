import { actividadesVoluntariado, inscripcionesVoluntariado, registrosAsistenciaVoluntariado } from "./mockActividadesVoluntariado";
import { gruposVoluntariado } from "./mockGruposVoluntariado";
import type { ActividadVoluntariado } from "../types";

export function grupoCoordinadoPor(estudianteCuenta: string) {
  return gruposVoluntariado.find((g) => g.coordinadorCuenta === estudianteCuenta);
}

// Derivados reutilizados por varias pantallas (nunca se guardan en estado,
// se recalculan a partir de los mocks — igual regla que sigue el mockup).

export function actividadesDeGrupo(grupoId: string): ActividadVoluntariado[] {
  return actividadesVoluntariado.filter((a) => a.grupoId === grupoId || a.grupoCoorganizadorId === grupoId);
}

export function actividadesEjecutadasDeGrupo(grupoId: string): ActividadVoluntariado[] {
  const hoy = "2026-09-09";
  return actividadesDeGrupo(grupoId).filter((a) => a.fecha < hoy);
}

export function inscripcionesDeActividad(actividadId: string) {
  return inscripcionesVoluntariado.filter((i) => i.actividadId === actividadId);
}

export function asistenciaDeInscripcion(inscripcionId: string) {
  return registrosAsistenciaVoluntariado.find((r) => r.inscripcionId === inscripcionId);
}

export function horasConfirmadasEstudiante(estudianteCuenta: string): number {
  return inscripcionesVoluntariado
    .filter((i) => i.estudianteCuenta === estudianteCuenta)
    .reduce((total, i) => total + (asistenciaDeInscripcion(i.id)?.horas ?? 0), 0);
}

export function historialDeEstudiante(estudianteCuenta: string) {
  return inscripcionesVoluntariado
    .filter((i) => i.estudianteCuenta === estudianteCuenta)
    .map((i) => ({
      inscripcion: i,
      actividad: actividadesVoluntariado.find((a) => a.id === i.actividadId),
      asistencia: asistenciaDeInscripcion(i.id),
    }))
    .filter((r) => r.actividad);
}

// % de participación del estudiante sobre las actividades ejecutadas de un
// grupo — base del umbral de elegibilidad a diploma (50%).
export function porcentajeParticipacion(grupoId: string, estudianteCuenta: string): number {
  const ejecutadas = actividadesEjecutadasDeGrupo(grupoId);
  if (ejecutadas.length === 0) return 0;
  const asistidas = ejecutadas.filter((actividad) =>
    inscripcionesDeActividad(actividad.id).some(
      (i) => i.estudianteCuenta === estudianteCuenta && asistenciaDeInscripcion(i.id)?.asistio,
    ),
  ).length;
  return Math.round((asistidas / ejecutadas.length) * 100);
}

export function horasTotalesDeGrupo(grupoId: string): number {
  return actividadesDeGrupo(grupoId).reduce((total, actividad) => {
    const horasActividad = inscripcionesDeActividad(actividad.id).reduce(
      (subtotal, i) => subtotal + (asistenciaDeInscripcion(i.id)?.horas ?? 0),
      0,
    );
    return total + horasActividad;
  }, 0);
}

// No existe un campo real de género en el mock (Registro lo proveería en
// producción) — se deriva de forma determinística solo para poder mostrar
// el desglose de la maqueta sin tener que anotar género en cada miembro.
export function generoDe(numeroCuenta: string): "M" | "F" {
  return Number(numeroCuenta.slice(-1)) % 2 === 0 ? "F" : "M";
}

export function desgloseGenero(cuentas: string[]): { f: number; m: number } {
  const f = cuentas.filter((c) => generoDe(c) === "F").length;
  return { f, m: cuentas.length - f };
}

export function participantesUnicos(actividadIds: string[]): number {
  const cuentas = new Set<string>();
  actividadIds.forEach((id) => inscripcionesDeActividad(id).forEach((i) => cuentas.add(i.estudianteCuenta)));
  return cuentas.size;
}
