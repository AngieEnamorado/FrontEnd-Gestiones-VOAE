// Una función por endpoint de voae-procad que usa el panel. Nada de lógica
// aquí: arma la ruta, pasa el cuerpo y tipa la respuesta (ver types/procad.ts).
import { apiCatalogo, apiProcad } from "./clienteProcad";
import type {
  AccesoApi,
  ActividadApi,
  AsistenciaApi,
  ConfiguracionGrupoApi,
  EstudianteApi,
  FormularioSolicitudApi,
  ListaPreferencialApi,
  ListaPreferencialDetalleApi,
  CampusApi,
  CatalogosProcadApi,
  CodigoEstadoExpulsion,
  CondicionadoApi,
  DecisionSolicitud,
  ExpulsionApi,
  GrupoApi,
  IntegrantesGrupoApi,
  MatriculaExcepcionalApi,
  PeriodoApi,
  PeriodoCatalogoApi,
  SaludApi,
  SolicitudApi,
  UsuarioApi,
  VisoriaApi,
} from "../types/procad";

/* ------------------------------ Solicitudes ------------------------------ */

export const listarSolicitudes = () => apiProcad.get<SolicitudApi[]>("/solicitudes");

/** El estudiante envía su solicitud de ingreso. */
export const crearSolicitud = (cuerpo: FormularioSolicitudApi & { idGrupo: number; idPeriodo: number }) =>
  apiProcad.post<SolicitudApi>("/solicitudes", cuerpo);

/** Corrige una solicitud OBSERVADO y la reenvía: vuelve a PENDIENTE. */
export const corregirSolicitud = (idSolicitud: number, cuerpo: FormularioSolicitudApi) =>
  apiProcad.put<SolicitudApi>(`/solicitudes/${idSolicitud}/correccion`, cuerpo);

/** El estudiante según Registro, si cumple el índice y sus solicitudes. 404 si la cuenta no existe. */
export const obtenerEstudiante = (numeroCuenta: string) =>
  apiProcad.get<EstudianteApi>(`/estudiantes/${encodeURIComponent(numeroCuenta)}`);

/** Las solicitudes de un grupo en un período: lo que ve su director. */
export const listarSolicitudesDeGrupo = (idGrupo: number, periodo?: number) =>
  apiProcad.get<SolicitudApi[]>("/solicitudes", { grupo: idGrupo, periodo });

/** Marca o desmarca al integrante como parte del equipo que compite. */
export const marcarEquipo = (idSolicitud: number, esEquipo: boolean) =>
  apiProcad.put<SolicitudApi>(`/solicitudes/${idSolicitud}/equipo`, { esEquipo });

export const resolverSolicitud = (
  idSolicitud: number,
  cuerpo: { decision: DecisionSolicitud; idPersona: number; observacion?: string },
) => apiProcad.post<SolicitudApi>(`/solicitudes/${idSolicitud}/resolucion`, cuerpo);

/* ----------------------------- Condicionados ----------------------------- */

/** Propuestas del director que esperan la firma del administrador. */
export const listarCondicionadosPropuestos = () =>
  apiProcad.get<CondicionadoApi[]>("/condicionados", { estado: "PROPUESTO" });

/** Paso 1 del condicionado: el director del grupo propone la excepción. */
export const proponerCondicionado = (idSolicitud: number, idPersonaPropone: number) =>
  apiProcad.post<SolicitudApi>("/condicionados", { idSolicitud, idPersonaPropone });

/** Propuestos y autorizados de un grupo: la lista de solicitudes no dice quién propuso. */
export const listarCondicionadosDeGrupo = (idGrupo: number, periodo?: number) =>
  apiProcad.get<CondicionadoApi[]>("/condicionados", { grupo: idGrupo, periodo });

export const autorizarCondicionado = (idSolicitud: number, idPersonaAutoriza: number) =>
  apiProcad.post<SolicitudApi>(`/condicionados/${idSolicitud}/autorizacion`, { idPersonaAutoriza });

export const rechazarCondicionado = (idSolicitud: number, cuerpo: { idPersona: number; motivo?: string }) =>
  apiProcad.post<SolicitudApi>(`/condicionados/${idSolicitud}/rechazo`, cuerpo);

/* ------------------------------ Expulsiones ------------------------------ */

export const listarExpulsiones = (estado?: CodigoEstadoExpulsion, grupo?: number) =>
  apiProcad.get<ExpulsionApi[]>("/expulsiones", { estado, grupo });

/** El director pide sacar a un integrante; lo resuelve el administrador. */
export const solicitarExpulsion = (cuerpo: {
  idSolicitud: number;
  idPersonaSolicita: number;
  idMotivoExpulsion: number;
  detalleMotivo?: string;
}) => apiProcad.post<ExpulsionApi>("/expulsiones", cuerpo);

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

/** Un grupo con sus disciplinas y tipos de actividad: lo que los formularios del director necesitan. */
export const obtenerGrupo = (idGrupo: number) => apiProcad.get<GrupoApi>(`/grupos/${idGrupo}`);

export const listarIntegrantes = (idGrupo: number, periodo?: number) =>
  apiProcad.get<IntegrantesGrupoApi>(`/grupos/${idGrupo}/integrantes`, { periodo });

export const listarActividadesDeGrupo = (idGrupo: number, periodo: number) =>
  apiProcad.get<ActividadApi[]>("/actividades", { grupo: idGrupo, periodo });

export const crearActividad = (cuerpo: {
  idGrupo: number;
  idPeriodo: number;
  fechaActividad: string;
  idTipoActividad?: number;
  tituloActividad?: string;
  descripcionActividad?: string;
  horaActividad?: string;
  lugarActividad?: string;
  horasAbonadas?: number;
  justificacionActividad?: string;
  idPersonaReporta: number;
}) => apiProcad.post<ActividadApi>("/actividades", cuerpo);

/** Entrenamiento recurrente: la base lo expande en una actividad por cada día que toca. */
export const crearSerie = (cuerpo: {
  idGrupo: number;
  idPeriodo: number;
  idTipoActividad?: number;
  fechaInicioSerie: string;
  fechaFinSerie: string;
  horaSerie?: string;
  descripcionSerie?: string;
  /** 1 = lunes … 7 = domingo. */
  diasSemana: number[];
}) => apiProcad.post<unknown>("/series", cuerpo);

export const listarAsistencia = (idActividad: number) =>
  apiProcad.get<{ actividad: ActividadApi; asistencias: AsistenciaApi[] }>(`/actividades/${idActividad}/asistencia`);

export const registrarAsistencia = (
  idActividad: number,
  asistencias: {
    idSolicitud: number;
    asistio: boolean;
    esExcusado: boolean;
    justificacionExcusa?: string;
    /** Una excusa la valida un director del grupo o un administrador. */
    idPersonaValidaExcusa?: number;
  }[],
) => apiProcad.post<unknown>(`/actividades/${idActividad}/asistencia`, { asistencias });

export const listarActividades = () => apiProcad.get<ActividadApi[]>("/actividades");

export const validarActividad = (
  idActividad: number,
  cuerpo: { decision: "VALIDADA" | "RECHAZADA"; idPersonaValidadora: number; observacion?: string },
) => apiProcad.post<ActividadApi>(`/actividades/${idActividad}/validacion`, cuerpo);

export const listarVisorias = () => apiProcad.get<VisoriaApi[]>("/visorias");

export const listarVisoriasDeGrupo = (idGrupo: number, periodo: number) =>
  apiProcad.get<VisoriaApi[]>("/visorias", { grupo: idGrupo, periodo });

export const crearVisoria = (cuerpo: {
  idPeriodo: number;
  idCampus: number;
  idGrupo: number;
  fechaVisoria: string;
  horaVisoria?: string;
  idLugarVisoria?: number;
}) => apiProcad.post<VisoriaApi>("/visorias", cuerpo);

/** Cita a la visoría a estudiantes con solicitud pendiente. */
export const citarEstudiantes = (idVisoria: number, solicitudes: number[]) =>
  apiProcad.post<VisoriaApi>(`/visorias/${idVisoria}/citados`, { solicitudes });

/** De BORRADOR a PROGRAMADA: desde ahí la ven los citados. */
export const programarVisoria = (idVisoria: number) =>
  apiProcad.post<VisoriaApi>(`/visorias/${idVisoria}/programar`);

/* ------------------------------ Configuración ----------------------------- */

export const listarCatalogos = () => apiProcad.get<CatalogosProcadApi>("/catalogos");

/** Con los accesos revocados: el panel los muestra para poder volver a otorgarlos. */
export const listarAccesos = () => apiProcad.get<AccesoApi[]>("/accesos", { todos: true });

/** Los grupos a los que una persona tiene acceso vigente: los que dirige. */
export const listarAccesosDePersona = (idPersona: number) =>
  apiProcad.get<AccesoApi[]>("/accesos", { persona: idPersona });

/** Otorga o revoca el acceso de la persona en todos sus grupos. */
export const cambiarAccesoPersona = (idPersona: number, activo: boolean) =>
  apiProcad.put<AccesoApi[]>(`/accesos/personas/${idPersona}`, { activo });

/** Quienes tienen un rol de PROCAD en la base (administradores, directores…). */
export const listarUsuarios = () => apiProcad.get<UsuarioApi[]>("/usuarios");

/** Desactiva o reactiva todos sus roles de PROCAD. */
export const cambiarEstadoUsuario = (idPersona: number, activo: boolean) =>
  apiProcad.put<UsuarioApi>(`/usuarios/${idPersona}`, { activo });

/* ------------------------ Elegibilidad del grupo ------------------------ */

export const listarConfiguracionGrupo = (idGrupo: number, periodo: number) =>
  apiProcad.get<ConfiguracionGrupoApi[]>("/periodos/configuracion", { grupo: idGrupo, periodo });

export const guardarConfiguracionGrupo = (cuerpo: {
  idGrupo: number;
  idPeriodo: number;
  minimoActividades?: number;
  minimoActividadesPorMes?: number;
  porcentajeMinimoEntrenamientos?: number;
}) => apiProcad.put<ConfiguracionGrupoApi>("/periodos/configuracion", cuerpo);

export const listarListasPreferenciales = (idGrupo: number) =>
  apiProcad.get<ListaPreferencialApi[]>("/listas-preferenciales", { grupo: idGrupo });

export const obtenerListaPreferencial = (idLista: number) =>
  apiProcad.get<ListaPreferencialDetalleApi>(`/listas-preferenciales/${idLista}`);

/** Toma la foto de los elegibles de hoy (Procad.vwElegibilidad). Una por grupo y período evaluado. */
export const generarListaPreferencial = (cuerpo: { idGrupo: number; idPeriodoEvaluado: number; idPeriodoAplicacion: number }) =>
  apiProcad.post<ListaPreferencialDetalleApi>("/listas-preferenciales", cuerpo);

/** La congela y la marca como enviada a Registro. */
export const enviarListaPreferencial = (idLista: number) =>
  apiProcad.post<ListaPreferencialDetalleApi>(`/listas-preferenciales/${idLista}/envio`);

/** A qué base llegó el backend y cuánto tardó. */
export const obtenerSalud = () => apiProcad.get<SaludApi>("/salud");

/* -------------------------------- Catálogo -------------------------------- */

export const obtenerPeriodoActivo = () => apiCatalogo.get<PeriodoApi>("/periodos/activo");

export const listarPeriodos = () => apiCatalogo.get<PeriodoCatalogoApi[]>("/periodos");

export const listarCampus = () => apiCatalogo.get<CampusApi[]>("/campus");
