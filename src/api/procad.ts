// Una función por endpoint de voae-procad que usa el panel. Nada de lógica
// aquí: arma la ruta, pasa el cuerpo y tipa la respuesta (ver types/procad.ts).
import { apiCatalogo, apiProcad } from "./clienteProcad";
import type {
  AccesoApi,
  ActividadApi,
  CampusApi,
  CatalogosProcadApi,
  CodigoEstadoExpulsion,
  CondicionadoApi,
  DecisionSolicitud,
  ExpulsionApi,
  GrupoApi,
  MatriculaExcepcionalApi,
  PeriodoApi,
  PeriodoCatalogoApi,
  SolicitudApi,
  VisoriaApi,
} from "../types/procad";

/* ------------------------------ Solicitudes ------------------------------ */

export const listarSolicitudes = () => apiProcad.get<SolicitudApi[]>("/solicitudes");

export const resolverSolicitud = (
  idSolicitud: number,
  cuerpo: { decision: DecisionSolicitud; idPersona: number; observacion?: string },
) => apiProcad.post<SolicitudApi>(`/solicitudes/${idSolicitud}/resolucion`, cuerpo);

/* ----------------------------- Condicionados ----------------------------- */

/** Propuestas del director que esperan la firma del administrador. */
export const listarCondicionadosPropuestos = () =>
  apiProcad.get<CondicionadoApi[]>("/condicionados", { estado: "PROPUESTO" });

export const autorizarCondicionado = (idSolicitud: number, idPersonaAutoriza: number) =>
  apiProcad.post<SolicitudApi>(`/condicionados/${idSolicitud}/autorizacion`, { idPersonaAutoriza });

export const rechazarCondicionado = (idSolicitud: number, cuerpo: { idPersona: number; motivo?: string }) =>
  apiProcad.post<SolicitudApi>(`/condicionados/${idSolicitud}/rechazo`, cuerpo);

/* ------------------------------ Expulsiones ------------------------------ */

export const listarExpulsiones = (estado?: CodigoEstadoExpulsion) =>
  apiProcad.get<ExpulsionApi[]>("/expulsiones", { estado });

export const resolverExpulsion = (
  idExpulsion: number,
  cuerpo: { decision: "APROBADA" | "RECHAZADA"; idPersonaResuelve: number; observacion?: string },
) => apiProcad.post<ExpulsionApi>(`/expulsiones/${idExpulsion}/resolucion`, cuerpo);

/* ------------------------ Matrículas excepcionales ------------------------ */

export const listarMatriculasExcepcionales = () =>
  apiProcad.get<MatriculaExcepcionalApi[]>("/matriculas-excepcionales");

export const crearMatriculaExcepcional = (cuerpo: {
  numeroCuenta: string;
  idPeriodo: number;
  motivoExcepcion: string;
  idPersonaAutoriza: number;
}) => apiProcad.post<MatriculaExcepcionalApi>("/matriculas-excepcionales", cuerpo);

/* ------------------------------ Agrupaciones ------------------------------ */

/** `integrantes` cuenta los APROBADO del período, si se pide uno. */
export const listarGrupos = (periodo?: number) => apiProcad.get<GrupoApi[]>("/grupos", { periodo });

export const listarActividades = () => apiProcad.get<ActividadApi[]>("/actividades");

export const validarActividad = (
  idActividad: number,
  cuerpo: { decision: "VALIDADA" | "RECHAZADA"; idPersonaValidadora: number; observacion?: string },
) => apiProcad.post<ActividadApi>(`/actividades/${idActividad}/validacion`, cuerpo);

export const listarVisorias = () => apiProcad.get<VisoriaApi[]>("/visorias");

/* ------------------------------ Configuración ----------------------------- */

export const listarCatalogos = () => apiProcad.get<CatalogosProcadApi>("/catalogos");

/** Con los accesos revocados: el panel los muestra para poder volver a otorgarlos. */
export const listarAccesos = () => apiProcad.get<AccesoApi[]>("/accesos", { todos: true });

/** Otorga o revoca el acceso de la persona en todos sus grupos. */
export const cambiarAccesoPersona = (idPersona: number, activo: boolean) =>
  apiProcad.put<AccesoApi[]>(`/accesos/personas/${idPersona}`, { activo });

/* -------------------------------- Catálogo -------------------------------- */

export const obtenerPeriodoActivo = () => apiCatalogo.get<PeriodoApi>("/periodos/activo");

export const listarPeriodos = () => apiCatalogo.get<PeriodoCatalogoApi[]>("/periodos");

export const listarCampus = () => apiCatalogo.get<CampusApi[]>("/campus");
