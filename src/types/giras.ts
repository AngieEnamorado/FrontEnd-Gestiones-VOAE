// Giras · contratos de la API (voae-giras).
// Los nombres son los de las columnas de la base de datos; `codigoEstado` es el
// código sembrado en Catalogo.tblEstados ("Pendiente", "Correccion"...).
// Se importan desde aquí (`../types/giras`) y no desde `types/index.ts`, que
// conserva los tipos de la interfaz de los demás módulos.

export type CodigoEstadoSolicitudGira =
  | "Borrador"
  | "Pendiente"
  | "Correccion"
  | "Aprobada"
  | "Denegada"
  | "Cancelada"
  | "Expirada";

export type CodigoEstadoInscripcionGira =
  | "Borrador"
  | "Pendiente"
  | "Correccion"
  | "Inscrito"
  | "Rechazada"
  | "Pendiente de reconfirmacion"
  | "No reconfirmada"
  | "Cancelada por gira";

/* ------------------------------ Solicitudes ------------------------------ */

export interface SolicitudGiraResumen {
  idSolicitud: number;
  idEstado: number;
  codigoEstado: CodigoEstadoSolicitudGira;
  nombreEstado: string;
  idJefeMision: number;
  nombreJefeMision: string | null;
  idJefeAprobacion: number;
  nombreJefeAprobacion: string | null;
  idCampus: number;
  nombreCampus: string;
  idTipoAlcance: number | null;
  nombreAlcance: string | null;
  objetivoAcademico: string | null;
  destinoGira: string | null;
  alojamientoGira: string | null;
  fechaSalidaPropuesta: string | null;
  horaSalidaPropuesta: string | null;
  fechaRetornoPropuesta: string | null;
  horaRetornoPropuesta: string | null;
  fechaInicioInscripcion: string | null;
  fechaFinInscripcion: string | null;
  usaTransporteUniversidad: boolean;
  totalAproximadoEstudiantes: number;
  totalAproximadoDocentes: number;
  /** Suma de las líneas de costo; la mantiene un trigger. */
  costos: number;
  fechaEnvio: string | null;
  usuarioRegistro: string;
  fechaRegistro: string;
  idPeriodo: number | null;
  anioPeriodo: number | null;
  numeroPac: number | null;
  /** Nombres de las categorías, separados por coma. */
  categorias: string | null;
  idGira: number | null;
}

export interface DocumentoGira {
  tipoDocumento: string;
  nombre: string | null;
  linkDocumento: string;
}

export interface DictamenSolicitudGira {
  idSolicitudDictamen: number;
  idJefeAprobacion: number;
  nombreJefeAprobacion: string | null;
  idEstado: number;
  codigoEstado: string;
  nombreEstado: string;
  idTipoCancelacion: number | null;
  nombreTipoCancelacion: string | null;
  justificacionDictamen: string | null;
  numeroVersion: number | null;
  fechaDictamen: string;
}

export interface CostoDetalleGira {
  idCostoDetalle: number;
  nombre: string;
  descripcion: string | null;
  total: number;
}

/**
 * Detalle: la cabecera más sus listas. Ojo: aquí `costos` es la lista de
 * líneas de costo (el total de la cabecera se calcula sumando `total`), y
 * `categorias` es la lista de categorías, no el texto del resumen.
 */
export interface SolicitudGiraDetalle extends Omit<SolicitudGiraResumen, "categorias" | "costos"> {
  finalidades: { idTipoFinalidad: number; nombre: string }[];
  facultades: { idFacultad: number; nombre: string }[];
  categorias: { idCategoria: number; nombre: string; idTipoCategoria: number }[];
  financiamientos: { idTipoFinanciamiento: number; nombre: string }[];
  transportes: { idTipoTransporte: number; nombre: string; observacion: string | null }[];
  costos: CostoDetalleGira[];
  docentes: { idDocenteAcompanante: number; idUsuarioAcompanante: number; nombreCompleto: string | null }[];
  documentos: (DocumentoGira & { idSolicitudDocumento: number; fechaRegistro: string })[];
  dictamenes: DictamenSolicitudGira[];
}

/** Cuerpo de POST/PUT /solicitudes. Lo que no se envía no se toca; una lista enviada reemplaza a la anterior. */
export interface CuerpoSolicitudGira {
  idJefeMision?: number;
  idJefeAprobacion?: number;
  idCampus?: number;
  idTipoAlcance?: number | null;
  objetivoAcademico?: string | null;
  destinoGira?: string | null;
  fechaSalidaPropuesta?: string | null;
  horaSalidaPropuesta?: string | null;
  fechaRetornoPropuesta?: string | null;
  horaRetornoPropuesta?: string | null;
  fechaInicioInscripcion?: string | null;
  fechaFinInscripcion?: string | null;
  usaTransporteUniversidad?: boolean;
  alojamientoGira?: string | null;
  totalAproximadoEstudiantes?: number;
  totalAproximadoDocentes?: number;
  finalidades?: number[];
  facultades?: number[];
  categorias?: number[];
  financiamientos?: number[];
  transportes?: { idTipoTransporte: number; observacion?: string | null }[];
  costos?: { nombre: string; descripcion?: string | null; total: number }[];
  docentes?: number[];
  documentos?: DocumentoGira[];
  /** Solo en POST: crea la solicitud ya enviada (Pendiente) en vez de Borrador. */
  enviar?: boolean;
}

export type DecisionSolicitudGira = "Aprobada" | "Denegada" | "Correccion";

/* ----------------------------- Inscripciones ----------------------------- */

export interface InscripcionGiraResumen {
  idInscripcion: number;
  idGira: number;
  destinoGira: string | null;
  idViajero: number;
  nombreViajero: string;
  correoPersona: string | null;
  telefonoPersona: string | null;
  numeroCuenta: string | null;
  carreraEstudiante: string | null;
  idEstado: number;
  codigoEstado: CodigoEstadoInscripcionGira;
  nombreEstado: string;
  idTipoInscripcion: number;
  nombreTipoInscripcion: string;
  esExcepcional: boolean;
  idInscribidorExcepcional: number | null;
  nombreInscribidorExcepcional: string | null;
  motivoExcepcion: string | null;
  observaciones: string | null;
  idJefeMision: number | null;
  tieneAcompanante: boolean;
  fechaEnvio: string | null;
  usuarioRegistro: string;
  fechaRegistro: string;
  idPeriodo: number | null;
  anioPeriodo: number | null;
  numeroPac: number | null;
}

export interface FichaSaludGira {
  idFichaSalud: number;
  esViajeroExterno: boolean;
  idTipoSangre: number | null;
  nombreTipoSangre: string | null;
  alergias: string | null;
  discapacidad: string | null;
  condicionesMedicas: string | null;
  medicamentos: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaParentesco: string | null;
  contactoEmergenciaTelefono: string | null;
}

export interface AcompananteGira {
  idViajeroExterno: number;
  nombre: string;
  fechaNacimiento: string;
  correoViajero: string;
  telefonoViajeroExterno: string | null;
}

export interface InscripcionGiraDetalle extends InscripcionGiraResumen {
  acompanante: AcompananteGira | null;
  fichaSaludEstudiante: FichaSaludGira | null;
  fichaSaludAcompanante: FichaSaludGira | null;
  documentos: (DocumentoGira & { idInscripcionDocumento: number; fechaRegistro: string })[];
  dictamenes: {
    idInscripcionDictamen: number;
    idJefeMision: number;
    nombreJefeMision: string | null;
    idEstado: number;
    codigoEstado: string;
    nombreEstado: string;
    justificacionDictamen: string | null;
    numeroVersion: number | null;
    fechaDictamen: string;
  }[];
}

export interface FichaSaludCuerpo {
  idTipoSangre?: number | null;
  alergias?: string | null;
  discapacidad?: string | null;
  condicionesMedicas?: string | null;
  medicamentos?: string | null;
  contactoEmergenciaNombre?: string | null;
  contactoEmergenciaParentesco?: string | null;
  contactoEmergenciaTelefono?: string | null;
}

/** Cuerpo de POST/PUT /inscripciones. `null` en `acompanante` o en una ficha la quita. */
export interface CuerpoInscripcionGira {
  idGira?: number;
  idViajero?: number;
  numeroCuenta?: string;
  idTipoInscripcion?: number;
  idInscribidorExcepcional?: number | null;
  motivoExcepcion?: string | null;
  observaciones?: string | null;
  acompanante?: {
    nombre: string;
    fechaNacimiento: string;
    correoViajero: string;
    telefonoViajeroExterno?: string | null;
  } | null;
  fichaSaludEstudiante?: FichaSaludCuerpo | null;
  fichaSaludAcompanante?: FichaSaludCuerpo | null;
  documentos?: DocumentoGira[];
  enviar?: boolean;
}

export type DecisionInscripcionGira = "Inscrito" | "Rechazada" | "Correccion";

/* --------------------------------- Giras --------------------------------- */

export interface GiraApi {
  idGira: number;
  idSolicitud: number;
  idEstado: number;
  codigoEstado: string;
  nombreEstado: string;
  idJefeAprobacion: number;
  nombreJefeAprobacion: string | null;
  idJefeMision: number;
  nombreJefeMision: string | null;
  destinoGira: string | null;
  objetivoAcademico: string | null;
  alojamientoGira: string | null;
  idCampus: number;
  nombreCampus: string;
  idTipoAlcance: number | null;
  nombreAlcance: string | null;
  fechaSalidaConfirmada: string | null;
  fechaRetornoConfirmada: string | null;
  horaSalidaPropuesta: string | null;
  horaRetornoPropuesta: string | null;
  fechaInicioInscripcion: string | null;
  fechaFinInscripcion: string | null;
  totalAproximadoEstudiantes: number;
  totalAproximadoDocentes: number;
  costos: number;
  idPeriodo: number | null;
  anioPeriodo: number | null;
  numeroPac: number | null;
  fechaAprobacion: string;
  idTipoCancelacion: number | null;
  idUsuarioCancela: number | null;
  fechaCancelacion: string | null;
  motivoCancelacion: string | null;
  totalInscripciones: number;
  totalInscritos: number;
}

/* ------------------------- Usuarios y catálogos --------------------------- */

/** Quien ocupa un rol de Giras: una persona dentro de una unidad (Giras.tblUsuarioUnidad). */
export interface UsuarioUnidadGira {
  idUsuarioUnidad: number;
  idTipoUnidad: number | null;
  idUnidadFacultadCentro: number;
  idPersona: number;
  nombreCompleto: string;
  correoPersona: string | null;
  telefonoPersona: string | null;
  nombreRol: string;
  nombrePerfil: string;
  numeroCuenta: string | null;
  idCampus: number | null;
  nombreCampus: string | null;
}

/** Un registro de cualquier tabla tipo. `id` y `activo` son alias uniformes que pone la API. */
export interface RegistroCatalogoApi {
  id: number;
  activo: boolean;
  nombre: string;
  descripcion?: string | null;
  [columna: string]: unknown;
}

export type CatalogosApi = Record<string, RegistroCatalogoApi[]>;

export interface EstadoApi {
  idEstado: number;
  codigoEstado: string;
  nombreEstado: string;
}
