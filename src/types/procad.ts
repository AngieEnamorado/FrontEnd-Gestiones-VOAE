// Lo que devuelve voae-procad, tal cual: nombres de columna de la base de
// datos. Las pantallas no los usan directo: api/adaptadoresProcad.ts los
// convierte a los tipos de types/index.ts, que son los que ya usan.

export type CodigoEstadoSolicitud = "PENDIENTE" | "APROBADO" | "NO_CUMPLE_REQUISITO" | "OBSERVADO" | "EXPULSADO";
export type DecisionSolicitud = "APROBADO" | "OBSERVADO" | "NO_CUMPLE_REQUISITO";
export type CodigoEstadoExpulsion = "PENDIENTE" | "APROBADA" | "RECHAZADA";

export interface AdjuntoSolicitudApi {
  tipoAdjunto: "texto" | "pdf" | "imagen";
  contenidoTexto?: string | null;
  urlArchivo?: string | null;
}

/** Una fila de GET /solicitudes. */
export interface SolicitudApi {
  idSolicitud: number;
  idPersona: number;
  nombrePersona: string;
  apellidosPersona: string;
  correoPersona: string | null;
  numeroCuenta: string | null;
  telefonoPersona: string | null;
  sexoPersona: "M" | "F" | null;
  idGrupo: number;
  nombreGrupo: string;
  tipoGrupo: "deportivo" | "artistico";
  idCampus: number;
  nombreCampus: string;
  idPeriodo: number;
  anioPeriodo: number;
  numeroPac: number;
  codigoEstado: CodigoEstadoSolicitud;
  nombreEstado: string;
  cumpleIndiceMinimo: boolean;
  esEquipo: boolean;
  esCondicionado: boolean;
  carreraEstudiante: string | null;
  indicePeriodo: number | null;
  indiceGlobal: number | null;
  matriculaVerificada: boolean | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  nombrePosicion: string | null;
  nombreInstrumento: string | null;
  nivelExperiencia: "Principiante" | "Intermedio" | "Avanzado" | null;
  alergia: string | null;
  adjuntos: AdjuntoSolicitudApi[];
  fechaInscripcion: string | null;
  fechaActualizacion: string | null;
  fechaRegistro: string;
}

/** Una fila de GET /condicionados. */
export interface CondicionadoApi {
  idSolicitud: number;
  nombrePersona: string;
  apellidosPersona: string;
  numeroCuenta: string | null;
  nombreGrupo: string;
  esCondicionado: boolean;
  idPersonaProponeCondicionado: number | null;
  nombrePropone: string | null;
  apellidosPropone: string | null;
}

/** Una fila de GET /expulsiones. */
export interface ExpulsionApi {
  idSolicitudExpulsion: number;
  idSolicitud: number;
  nombrePersona: string;
  apellidosPersona: string;
  numeroCuenta: string | null;
  nombreGrupo: string;
  nombreMotivoExpulsion: string;
  detalleMotivo: string | null;
  codigoEstado: CodigoEstadoExpulsion;
  nombreSolicita: string;
  apellidosSolicita: string;
}

/** Una fila de GET /matriculas-excepcionales. */
export interface MatriculaExcepcionalApi {
  idMatriculaExcepcional: number;
  nombrePersona: string;
  apellidosPersona: string;
  numeroCuenta: string | null;
  idPeriodo: number;
  anioPeriodo: number;
  numeroPac: number;
  motivoExcepcion: string;
  estadoExcepcion: boolean;
}

/** GET /v1/catalogo/periodos/activo. */
export interface PeriodoApi {
  idPeriodo: number;
  anioPeriodo: number;
  numeroPac: number;
  fechaInicioPeriodo: string | null;
  fechaFinPeriodo: string | null;
}

/** Una fila de GET /grupos. Las listas llegan ya como arreglos. */
export interface GrupoApi {
  idGrupo: number;
  nombreGrupo: string;
  idTipoGrupo: number;
  idDeporte: number | null;
  tipoGrupo: "deportivo" | "artistico";
  nombreDeporte: string | null;
  categoriaSexo: "masculino" | "femenino" | "mixto";
  idCampus: number;
  nombreCampus: string;
  esSeleccion: boolean;
  activo: boolean;
  disciplinas: { idDisciplina: number; nombreDisciplina: string }[];
  tiposActividad: { idTipoActividad: number; nombreTipoActividad: string }[];
  /** Solicitudes APROBADO (del período pedido, o de todos). */
  integrantes: number;
}

export type CodigoEstadoActividad = "PENDIENTE_VALIDACION" | "VALIDADA" | "RECHAZADA";

/** Una fila de GET /actividades. */
export interface ActividadApi {
  idActividad: number;
  idGrupo: number;
  nombreGrupo: string;
  tipoGrupo: "deportivo" | "artistico";
  nombreCampus: string;
  idPeriodo: number;
  codigoEstado: CodigoEstadoActividad;
  fechaActividad: string;
  nombreTipoActividad: string | null;
  idSerie: number | null;
  descripcionActividad: string | null;
  nombreValidadora: string | null;
  apellidosValidadora: string | null;
  observacionValidacion: string | null;
  fechaValidacion: string | null;
  usuarioRegistro: string;
  fechaRegistro: string;
  inscritos: number;
  presentes: number;
  /** El detalle que reporta el encargado. Las actividades de una serie no lo traen. */
  tituloActividad: string | null;
  /** «HH:MM». */
  horaActividad: string | null;
  lugarActividad: string | null;
  horasAbonadas: number | null;
  justificacionActividad: string | null;
  idPersonaReporta: number | null;
  nombreReporta: string | null;
  apellidosReporta: string | null;
  correoReporta: string | null;
  adjuntos: { idAdjuntoActividad: number; nombreArchivo: string; urlArchivo: string }[];
}

/** Una fila de GET /visorias. */
export interface VisoriaApi {
  idVisoria: number;
  idPeriodo: number;
  nombreCampus: string;
  fechaVisoria: string;
  /** «HH:MM», o null si no se fijó hora. */
  horaVisoria: string | null;
  nombreLugar: string | null;
  nombreAula: string | null;
  idGrupo: number | null;
  nombreGrupo: string | null;
  estadoVisoria: "BORRADOR" | "PROGRAMADA";
  citados: number;
}

/* ------------------------------ Configuración ----------------------------- */

interface FilaCatalogo {
  id: number;
  activo: boolean;
}

/** GET /catalogos: cada tabla de referencia de Procad, solo las filas activas. */
export interface CatalogosProcadApi {
  tiposGrupo: (FilaCatalogo & { idTipoGrupo: number; nombreTipoGrupo: "deportivo" | "artistico" })[];
  deportes: (FilaCatalogo & { nombreDeporte: string })[];
  disciplinas: (FilaCatalogo & { nombreDisciplina: string })[];
  tiposActividad: (FilaCatalogo & { nombreTipoActividad: string; idTipoGrupo: number })[];
  motivosExpulsion: (FilaCatalogo & { nombreMotivoExpulsion: string })[];
  posiciones: (FilaCatalogo & { nombrePosicion: string; idDeporte: number })[];
  instrumentos: (FilaCatalogo & { nombreInstrumento: string })[];
  lugaresVisoria: (FilaCatalogo & { nombreLugar: string; idTipoGrupo: number; idCampus: number })[];
}

/** Una fila de GET /accesos: una persona en un grupo. */
export interface AccesoApi {
  idAcceso: number;
  idPersona: number;
  nombrePersona: string;
  apellidosPersona: string;
  correoPersona: string | null;
  idGrupo: number;
  nombreGrupo: string;
  nombreCampus: string;
  esColaboradorExterno: boolean;
  activo: boolean;
}

/** Una fila de GET /usuarios: una persona con sus roles de PROCAD (sin INTEGRANTE). */
export interface UsuarioApi {
  idPersona: number;
  nombrePersona: string | null;
  apellidosPersona: string | null;
  correoPersona: string | null;
  /** Codigos separados por coma: «ADMINISTRADOR_PROCAD, DIRECTOR». */
  roles: string;
  activo: boolean;
}

/** GET /v1/catalogo/campus. */
export interface CampusApi {
  idCampus: number;
  nombreCampus: string;
  estadoCampus: boolean;
}

/** GET /v1/catalogo/periodos. */
export interface PeriodoCatalogoApi extends PeriodoApi {
  estadoPeriodo: boolean;
}

/** Una fila de GET /grupos/{id}/integrantes: una solicitud APROBADO del grupo. */
export interface IntegranteApi {
  idSolicitud: number;
  idPersona: number;
  numeroCuenta: string | null;
  nombrePersona: string | null;
  apellidosPersona: string | null;
  correoPersona: string | null;
  telefonoPersona: string | null;
  idPeriodo: number;
  esEquipo: boolean;
  fechaInscripcion: string | null;
  nombreCampus: string;
  /** Selecciones a las que fue convocado desde este grupo. */
  selecciones: { idGrupo: number; nombreGrupo: string }[];
}

/** GET /grupos/{id}/integrantes. */
export interface IntegrantesGrupoApi {
  idGrupo: number;
  nombreGrupo: string;
  esSeleccion: boolean;
  integrantes: IntegranteApi[];
}

/** Una marca de GET /actividades/{id}/asistencia. */
export interface AsistenciaApi {
  idAsistencia: number;
  idSolicitud: number;
  numeroCuenta: string | null;
  nombrePersona: string | null;
  apellidosPersona: string | null;
  asistio: boolean | null;
  esExcusado: boolean;
  justificacionExcusa: string | null;
  estadoAsistencia: "INSCRITO" | "PRESENTE" | "AUSENTE" | "EXCUSADO";
}

/** Una fila de GET /periodos/configuracion: la regla de elegibilidad del grupo en el período. */
export interface ConfiguracionGrupoApi {
  idConfiguracion: number;
  idGrupo: number;
  tipoGrupo: "deportivo" | "artistico";
  idPeriodo: number;
  minimoActividades: number | null;
  minimoActividadesPorMes: number | null;
  porcentajeMinimoEntrenamientos: number | null;
}

/** Una fila de GET /listas-preferenciales. */
export interface ListaPreferencialApi {
  idLista: number;
  idGrupo: number;
  idPeriodoEvaluado: number;
  anioEvaluado: number;
  pacEvaluado: number;
  idPeriodoAplicacion: number;
  anioAplicacion: number;
  pacAplicacion: number;
  codigoEstado: "GENERADA" | "ENVIADA";
  nombreEstado: string;
  cantidadElegibles: number;
  fechaGeneracion: string;
  fechaEnvio: string | null;
}

/** GET /listas-preferenciales/{id}: la lista con sus elegibles. */
export interface ListaPreferencialDetalleApi extends ListaPreferencialApi {
  detalles: {
    idListaDetalle: number;
    idSolicitud: number;
    numeroCuenta: string | null;
    nombrePersona: string | null;
    apellidosPersona: string | null;
    carreraEstudiante: string | null;
    actividadesAsistidas: number | null;
  }[];
}

export type NivelExperiencia = "Principiante" | "Intermedio" | "Avanzado";

/** Una solicitud vista por su dueño, en GET /estudiantes/{cuenta}. */
export interface SolicitudEstudianteApi {
  idSolicitud: number;
  idGrupo: number;
  nombreGrupo: string;
  tipoGrupo: "deportivo" | "artistico";
  nombreCampus: string;
  idPeriodo: number;
  anioPeriodo: number;
  numeroPac: number;
  codigoEstado: CodigoEstadoSolicitud;
  nombreEstado: string;
  cumpleIndiceMinimo: boolean;
  esEquipo: boolean;
  esCondicionado: boolean;
  condicionadoPropuesto: boolean;
  fechaInscripcion: string | null;
  fechaActualizacion: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  idPosicion: number | null;
  idInstrumento: number | null;
  nivelExperiencia: NivelExperiencia | null;
  alergia: string | null;
  experiencia: string | null;
  /** Lo último que se anotó al cambiarla de estado: el motivo, si se la observaron. */
  ultimaObservacion: string | null;
}

/** GET /estudiantes/{cuenta}: el estudiante según Registro, y sus solicitudes. */
export interface EstudianteApi {
  numeroCuenta: string;
  /** null si nunca ha pedido entrar a un grupo: la base lo crea con su primera solicitud. */
  idPersona: number | null;
  nombrePersona: string | null;
  apellidosPersona: string | null;
  correoInstitucional: string | null;
  telefono: string | null;
  genero: string | null;
  idCampus: number | null;
  nombreCampus: string | null;
  carrera: string | null;
  indicePeriodo: number | null;
  indiceGlobal: number | null;
  matriculado: boolean;
  indiceMinimo: number;
  cumpleIndiceMinimo: boolean;
  solicitudes: SolicitudEstudianteApi[];
}

/** Lo que el estudiante llena para pedir entrar (o para corregir una observada). */
export interface FormularioSolicitudApi {
  numeroCuenta: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  aceptoReglamento: true;
  idPosicion?: number;
  idInstrumento?: number;
  nivelExperiencia?: NivelExperiencia;
  alergia?: string;
  experiencia?: string;
}

/** GET /salud. Servidor, IP y base los informa la propia base, no la configuración. */
export interface SaludApi {
  funcion: string;
  ok: boolean;
  msConsulta: number;
  ahoraEnBase: string | null;
  /** IP del servidor SQL vista desde la conexión: 10.8.x.x en la universidad. */
  ipServidor: string | null;
  servidor: string | null;
  base: string | null;
  contenedorFrio: boolean;
}
