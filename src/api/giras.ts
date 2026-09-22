// Una función por endpoint de voae-giras. Nada de lógica aquí: solo arma la
// ruta, pasa el cuerpo y tipa la respuesta. Los nombres del cuerpo y de la
// respuesta son los de la base de datos (ver types/giras.ts).
import { apiGiras } from "./cliente";
import type { RolGira } from "../types";
import type {
  CatalogosApi,
  CuerpoInscripcionGira,
  CuerpoSolicitudGira,
  DecisionInscripcionGira,
  DecisionSolicitudGira,
  EstadoApi,
  GiraApi,
  InscripcionGiraDetalle,
  InscripcionGiraResumen,
  RegistroCatalogoApi,
  SolicitudGiraDetalle,
  SolicitudGiraResumen,
  UsuarioUnidadGira,
} from "../types/giras";

/* ------------------------------ Solicitudes ------------------------------ */

export interface FiltrosSolicitudes {
  /** Código tal cual: "Borrador", "Pendiente", "Correccion", "Aprobada", "Denegada"... */
  estado?: string;
  excluirBorradores?: boolean;
  campus?: number;
  anio?: number;
  /** 1, 2 o 3 (numeroPac). */
  periodo?: number;
  jefeMision?: number;
  jefeAprobacion?: number;
  q?: string;
}

export const listarSolicitudes = (filtros: FiltrosSolicitudes = {}) =>
  apiGiras.get<SolicitudGiraResumen[]>("/solicitudes", { ...filtros });

export const obtenerSolicitud = (id: number) => apiGiras.get<SolicitudGiraDetalle>(`/solicitudes/${id}`);

export const crearSolicitud = (cuerpo: CuerpoSolicitudGira) =>
  apiGiras.post<SolicitudGiraDetalle>("/solicitudes", cuerpo);

export const actualizarSolicitud = (id: number, cuerpo: CuerpoSolicitudGira) =>
  apiGiras.put<SolicitudGiraDetalle>(`/solicitudes/${id}`, cuerpo);

export const eliminarSolicitud = (id: number) => apiGiras.delete(`/solicitudes/${id}`);

export const enviarSolicitud = (id: number) => apiGiras.post<SolicitudGiraDetalle>(`/solicitudes/${id}/envio`);

export const dictaminarSolicitud = (
  id: number,
  cuerpo: {
    idJefeAprobacion: number;
    decision: DecisionSolicitudGira;
    justificacion?: string | null;
    idTipoCancelacion?: number | null;
  },
) => apiGiras.post<SolicitudGiraDetalle>(`/solicitudes/${id}/dictamen`, cuerpo);

/* ----------------------------- Inscripciones ----------------------------- */

export interface FiltrosInscripciones {
  gira?: number;
  estado?: string;
  excluirBorradores?: boolean;
  viajero?: number;
  numeroCuenta?: string;
  q?: string;
}

export const listarInscripciones = (filtros: FiltrosInscripciones = {}) =>
  apiGiras.get<InscripcionGiraResumen[]>("/inscripciones", { ...filtros });

export const obtenerInscripcion = (id: number) => apiGiras.get<InscripcionGiraDetalle>(`/inscripciones/${id}`);

export const crearInscripcion = (cuerpo: CuerpoInscripcionGira) =>
  apiGiras.post<InscripcionGiraDetalle>("/inscripciones", cuerpo);

export const actualizarInscripcion = (id: number, cuerpo: CuerpoInscripcionGira) =>
  apiGiras.put<InscripcionGiraDetalle>(`/inscripciones/${id}`, cuerpo);

export const eliminarInscripcion = (id: number) => apiGiras.delete(`/inscripciones/${id}`);

export const enviarInscripcion = (id: number) =>
  apiGiras.post<InscripcionGiraDetalle>(`/inscripciones/${id}/envio`);

export const dictaminarInscripcion = (
  id: number,
  cuerpo: { idJefeMision: number; decision: DecisionInscripcionGira; justificacion?: string | null },
) => apiGiras.post<InscripcionGiraDetalle>(`/inscripciones/${id}/dictamen`, cuerpo);

/* --------------------------------- Giras --------------------------------- */

export interface FiltrosGiras {
  estado?: string;
  campus?: number;
  /** "Mis giras" de quien organiza: jefe de misión o docente acompañante (idUsuarioUnidad). */
  usuario?: number;
  /** "Mis giras" del estudiante: aquellas donde tiene una inscripción. */
  numeroCuenta?: string;
}

export const listarGiras = (filtros: FiltrosGiras = {}) => apiGiras.get<GiraApi[]>("/giras", { ...filtros });

export const obtenerGira = (id: number) => apiGiras.get<GiraApi>(`/giras/${id}`);

/** Inscritos de una gira. Por defecto sin borradores: un borrador no lo ve el jefe de misión. */
export const listarInscripcionesDeGira = (id: number, filtros: { estado?: string; q?: string } = {}) =>
  apiGiras.get<InscripcionGiraResumen[]>(`/giras/${id}/inscripciones`, { ...filtros });

/* ------------------------- Usuarios, estados, tablas tipo ---------------- */

export type RolUsuarioGira = "jefe-mision" | "jefe-aprobacion" | "viajero" | "administrador" | "estadistico";

/**
 * Los roles de la interfaz que actúan sobre datos y el rol de la base con el que
 * se corresponden. Vicerrectoría y administrador no crean ni dictaminan nada
 * en Solicitudes ni en Inscripciones, así que no necesitan un usuario elegido.
 */
export const ROL_API_DE_ROL_GIRA: Partial<Record<RolGira, RolUsuarioGira>> = {
  "jefe-mision": "jefe-mision",
  "jefe-aprobacion": "jefe-aprobacion",
  estudiante: "viajero",
};

export const listarUsuarios = (
  filtros: { rol?: RolUsuarioGira; docentes?: boolean; campus?: number; q?: string } = {},
) => apiGiras.get<UsuarioUnidadGira[]>("/usuarios", { ...filtros });

export const listarEstados = (contexto: "solicitud" | "gira" | "inscripcion" | "dictamen") =>
  apiGiras.get<EstadoApi[]>(`/estados/${contexto}`);

/** Todas las tablas tipo activas, por slug, para poblar los formularios. */
export const listarTodosLosCatalogos = () => apiGiras.get<CatalogosApi>("/catalogos");

export const listarCatalogo = (slug: string, incluirInactivos = false) =>
  apiGiras.get<RegistroCatalogoApi[]>(`/catalogos/${slug}`, { todos: incluirInactivos });

export const crearRegistroCatalogo = (slug: string, cuerpo: Record<string, unknown>) =>
  apiGiras.post<RegistroCatalogoApi>(`/catalogos/${slug}`, cuerpo);

export const actualizarRegistroCatalogo = (slug: string, id: number, cuerpo: Record<string, unknown>) =>
  apiGiras.put<RegistroCatalogoApi>(`/catalogos/${slug}/${id}`, cuerpo);

export const eliminarRegistroCatalogo = (slug: string, id: number) =>
  apiGiras.delete(`/catalogos/${slug}/${id}`);
