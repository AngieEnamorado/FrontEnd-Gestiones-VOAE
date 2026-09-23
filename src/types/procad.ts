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
