import { crearCliente } from "./clienteVoluntariado";

const api = crearCliente("VITE_API_VOLUNTARIADO", import.meta.env.VITE_API_VOLUNTARIADO);

// Tablero y estadisticas viven en voae-reporteria. Mientras alguien no tenga
// VITE_API_REPORTERIA en su .env.local se siguen pidiendo a las rutas
// provisionales de voae-voluntariado, que devuelven exactamente lo mismo.
const reporteria = import.meta.env.VITE_API_REPORTERIA
  ? crearCliente("VITE_API_REPORTERIA", `${String(import.meta.env.VITE_API_REPORTERIA).replace(/\/$/, "")}/voluntariado`)
  : api;

// Los tipos reflejan las columnas tal como las devuelve voae-voluntariado.
// Las fechas llegan como ISO ("2026-08-22T00:00:00.000Z"); ver fechaCorta()
// en utils/voluntariado.ts.

export type CodigoEstadoActividad = "SOLICITADA" | "APROBADA" | "EJECUTADA" | "RECHAZADA" | "CANCELADA";
export type CodigoEstadoParticipacion = "INSCRITO" | "ASISTIO" | "NO_ASISTIO" | "CANCELADO";
export type CodigoEstadoInforme = "EN_CAPTURA" | "ENVIADO" | "OBSERVADO" | "ACEPTADO";
export type CodigoEstadoSolicitud = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "DEVUELTA";
export type TipoParticipanteApi = "VOLUNTARIO_ACTIVO" | "ESTUDIANTE_PARTICIPANTE";

export interface RedTematicaApi {
  idRedTematica: number;
  nombreRedTematica: string;
}

export interface TrimestreApi {
  idTrimestre: number;
  anioTrimestre: number;
  numeroTrimestre: number;
  fechaInicioTrimestre: string | null;
  fechaFinTrimestre: string | null;
  fechaLimiteInforme: string | null;
}

export interface CargoApi {
  idCargo: number;
  nombreCargo: string;
  descripcionCargo: string | null;
}

export interface RequisitoApi {
  idRequisitoAdjunto: number;
  procesoRequisito: "SOLICITUD_GRUPO" | "ACTIVIDAD";
  tipoRequisito: string;
  obligatorioRequisito: boolean;
  minimoRequisito: number | null;
  maximoRequisito: number | null;
}

export interface CatalogosApi {
  redes: RedTematicaApi[];
  trimestres: TrimestreApi[];
  cargos: CargoApi[];
  requisitos: RequisitoApi[];
}

export interface GrupoResumenApi {
  idGrupo: number;
  nombreGrupo: string;
  descripcionGrupo: string | null;
  fechaCreacionGrupo: string | null;
  totalMiembros: number;
  campus: string | null;
  idsCampus: string | null;
  redesTematicas: string | null;
  idsRedesTematicas: string | null;
  idPersonaCoordinador: number | null;
  nombreCoordinador: string | null;
  /** URL firmada del logo, de vida corta. Null si no tiene logo o es de prototipo. */
  urlLogo?: string | null;
}

export interface GrupoDetalleApi {
  idGrupo: number;
  nombreGrupo: string;
  descripcionGrupo: string | null;
  fechaCreacionGrupo: string | null;
  misionGrupo: string | null;
  visionGrupo: string | null;
  resenaHistorica: string | null;
  propositoGrupo: string | null;
  logoUrl: string | null;
  /** URL firmada del logo, de vida corta. Null si no hay logo o es de prototipo. */
  urlLogo: string | null;
  redesSociales: string | null;
  totalMiembros: number;
  totalActividades: number;
  horasTotales: number;
  campus: { idCampus: number; nombreCampus: string; codigoCortoCampus: string }[];
  redesTematicas: RedTematicaApi[];
  juntaDirectiva: {
    idPersona: number;
    idCargo: number;
    nombreCargo: string;
    nombrePersona: string;
    apellidosPersona: string;
    correoPersona: string | null;
  }[];
}

export interface CambiosGrupoApi {
  descripcionGrupo?: string | null;
  redesSociales?: string | null;
  logoUrl?: string | null;
  redesTematicas?: number[];
}

export interface MiembroApi {
  idMiembroGrupo: number;
  idPersona: number;
  idCargo: number;
  nombreCargo: string;
  esFundador: boolean;
  fechaIngreso: string;
  nombrePersona: string;
  apellidosPersona: string;
  correoPersona: string | null;
  sexoPersona: "F" | "M" | null;
  numeroCuenta: string | null;
  carreraEstudiante: string | null;
}

export interface ActividadApi {
  idActividad: number;
  idGrupoOrganizador: number;
  nombreGrupo: string;
  idPeriodo: number;
  idTrimestre: number;
  anioTrimestre: number;
  numeroTrimestre: number;
  codigoEstado: CodigoEstadoActividad;
  nombreEstado: string;
  nombreActividad: string;
  objetivoActividad: string;
  resultadosActividad: string | null;
  fechaActividad: string | null;
  lugarActividad: string | null;
  esConjunta: boolean;
  totalInscritos: number;
  totalAsistentes: number;
  horasTotales: number;
  totalFotos: number;
  campus: string | null;
  coorganizadores: string | null;
  idsCoorganizadores: string | null;
}

export interface ActividadDetalleApi {
  idActividad: number;
  idGrupoOrganizador: number;
  nombreGrupo: string;
  codigoEstado: CodigoEstadoActividad;
  nombreActividad: string;
  objetivoActividad: string;
  resultadosActividad: string | null;
  fechaActividad: string | null;
  lugarActividad: string | null;
  coorganizadores: { idGrupo: number; nombreGrupo: string }[];
  fotos: { idFotoActividad: number; archivoUrl: string; descripcionFoto: string | null; urlDescarga?: string | null }[];
}

export interface ParticipacionApi {
  idParticipacion: number;
  idPersona: number;
  idGrupo: number;
  tipoParticipante: TipoParticipanteApi;
  codigoEstado: CodigoEstadoParticipacion;
  horasParticipacion: number | null;
  validadoComoMiembro: boolean;
  nombre: string;
  sexo: "F" | "M" | null;
  numeroCuenta: string | null;
  carreraEstudiante: string | null;
}

export interface LineaAsistenciaApi {
  idPersona: number;
  idGrupo: number;
  estado: "ASISTIO" | "NO_ASISTIO";
  horas: number | null;
  tipoParticipante: TipoParticipanteApi;
}

export interface SolicitudGrupoResumenApi {
  idSolicitudGrupoNuevo: number;
  nombreGrupo: string;
  nombrePersona: string;
  apellidosPersona: string;
  nombreCampus: string;
  codigoEstado: CodigoEstadoSolicitud;
  fechaSolicitud: string;
  totalFundadores: number;
}

export interface SolicitudGrupoDetalleApi {
  idSolicitudGrupoNuevo: number;
  nombreGrupo: string;
  idCampus: number;
  nombreCampus: string;
  nombrePersona: string;
  apellidosPersona: string;
  codigoEstado: CodigoEstadoSolicitud;
  fechaSolicitud: string;
  resenaHistorica: string | null;
  propositoGrupo: string | null;
  misionGrupo: string | null;
  visionGrupo: string | null;
  motivoResolucion: string | null;
  idGrupoCreado: number | null;
  fundadores: { numeroCuenta: string; matriculaValida: boolean; nombre: string | null; carreraEstudiante: string | null }[];
  juntaDirectiva: { numeroCuenta: string; idCargo: number; nombreCargo: string; nombre: string | null }[];
  actividadesProyectadas: { nombreActividad: string; fechaTentativa: string | null }[];
  adjuntos: { idRequisitoAdjunto: number; tipoRequisito: string; archivoUrl: string; urlDescarga?: string | null }[];
}

export interface NuevaSolicitudGrupoApi {
  idPersonaSolicitante: number;
  idCampus: number;
  nombreGrupo: string;
  fechaCreacionGrupo: string | null;
  resenaHistorica: string | null;
  propositoGrupo: string | null;
  misionGrupo: string | null;
  visionGrupo: string | null;
  fundadores: string[];
  juntaDirectiva: { numeroCuenta: string; idCargo: number }[];
  actividadesProyectadas: { nombreActividad: string; fechaTentativa: string | null }[];
}

export interface SolicitudUnionApi {
  idSolicitudUnion: number;
  idPersona: number;
  codigoEstado: CodigoEstadoSolicitud;
  mensajeSolicitud: string | null;
  fechaSolicitud: string;
  nombrePersona: string;
  apellidosPersona: string;
  numeroCuenta: string | null;
  carreraEstudiante: string | null;
}

export interface InformeResumenApi {
  idInformeTrimestral: number;
  idGrupo: number;
  nombreGrupo: string;
  idTrimestre: number;
  anioTrimestre: number;
  numeroTrimestre: number;
  fechaLimiteInforme: string | null;
  codigoEstado: CodigoEstadoInforme;
  observacionesAdmin: string | null;
  totalActividades: number;
  totalParticipantes: number;
  horasTotales: number;
  campus: string | null;
}

export interface InformeDetalleApi extends Omit<InformeResumenApi, "totalActividades" | "horasTotales" | "campus"> {
  totalParticipantes: number;
  actividades: {
    idActividad: number;
    nombreActividad: string;
    fechaActividad: string | null;
    asistentes: number;
    horas: number;
  }[];
}

export interface MovimientoEconomicoApi {
  idMovimientoEconomico?: number;
  idGrupo?: number;
  tipoMovimiento: "INGRESO" | "EGRESO";
  fechaMovimiento: string | null;
  descripcionMovimiento: string;
  responsableMovimiento: string | null;
  tipoComprobante: string | null;
  montoMovimiento: number;
  /** Llave en S3 de la foto o PDF del comprobante. */
  comprobanteUrl?: string | null;
  /** URL firmada para verlo (solo al leer; vence en 15 min). */
  urlComprobante?: string | null;
}

export interface InformeEconomicoApi {
  idInformeEconomico: number;
  observacionesInformeEconomico: string | null;
  grupos: { idInformeEconomicoGrupo: number; idGrupo: number; nombreGrupo: string; saldoAnterior: number }[];
  movimientos: (MovimientoEconomicoApi & { idInformeEconomicoGrupo: number })[];
}

export interface ParticipacionMiembroApi {
  idGrupo: number;
  nombreGrupo: string;
  idPersona: number;
  nombre: string;
  numeroCuenta: string | null;
  campus: string | null;
  actividadesGrupo: number;
  actividadesAsistidas: number;
  horasConfirmadas: number;
  yaTieneDiploma: number;
  porcentajeParticipacion: number;
}

/** Un diploma ya emitido (GET /diplomas?grupo=). */
export interface DiplomaApi {
  idDiploma: number;
  idPersona: number;
  ventanaDiploma: string;
  actividadesGrupo: number;
  actividadesAsistidas: number;
  porcentajeParticipacion: number;
  emitidoDiploma: boolean;
  fechaEmision: string | null;
  archivoUrl: string | null;
  nombrePersona: string;
  apellidosPersona: string;
  numeroCuenta: string | null;
}

export interface PersonaVoluntariadoApi {
  idPersona: number;
  nombrePersona: string;
  apellidosPersona: string;
  numeroCuenta: string;
  carreraEstudiante: string | null;
  grupos: string | null;
  esCoordinador: number;
}

export interface ResumenPersonaApi {
  idPersona: number;
  nombrePersona: string;
  apellidosPersona: string;
  correoPersona: string | null;
  idCampus: number | null;
  nombreCampus: string | null;
  numeroCuenta: string | null;
  carreraEstudiante: string | null;
  horasConfirmadas: number;
  grupos: {
    idGrupo: number;
    nombreGrupo: string;
    idCargo: number;
    nombreCargo: string;
    esCoordinador: number;
    campus: string | null;
  }[];
}

export interface ParticipacionPersonaApi {
  idParticipacion: number;
  idActividad: number;
  nombreActividad: string;
  fechaActividad: string | null;
  lugarActividad: string | null;
  codigoEstadoActividad: CodigoEstadoActividad;
  idGrupoOrganizador: number;
  nombreGrupoOrganizador: string;
  idGrupo: number;
  nombreGrupo: string;
  codigoEstado: CodigoEstadoParticipacion;
  tipoParticipante: TipoParticipanteApi;
  horasParticipacion: number | null;
}

export interface SolicitudPersonaApi {
  tipo: "UNION" | "GRUPO" | "ACTIVIDAD";
  id: number;
  titulo: string;
  idGrupo: number | null;
  codigoEstado: string;
  nombreEstado: string;
  fecha: string;
  motivo: string | null;
}

export interface TableroApi {
  totales: { grupos: number; actividades: number; participantes: number; horas: number };
  trimestreVigente: { anioTrimestre: number; numeroTrimestre: number; fechaLimiteInforme: string | null } | null;
  porCampus: {
    idCampus: number;
    nombreCampus: string;
    grupos: number;
    participantes: number;
    horas: number;
    informesEntregados: number;
    semaforo: "Entregado" | "Por vencer" | "Atrasado";
  }[];
  porRed: { idRedTematica: number; nombreRedTematica: string; grupos: number; horas: number }[];
}

export interface FilaEstadisticaApi {
  idActividad: number;
  fecha: string;
  anioPeriodo: number;
  numeroPac: number;
  campus: string | null;
  idRedTematica: number | null;
  grupo: string;
  estado: CodigoEstadoActividad;
  nombreEstado: string;
  participantes: number;
  horas: number;
}

const consulta = (parametros: Record<string, string | number | null | undefined>) => {
  const pares = Object.entries(parametros).filter(([, v]) => v !== null && v !== undefined && v !== "");
  return pares.length === 0 ? "" : "?" + new URLSearchParams(pares.map(([k, v]) => [k, String(v)])).toString();
};

/** Respuesta de POST /archivos/subidas: a dónde y con qué campos subir a S3. */
export interface SubidaFirmadaApi {
  llave: string;
  url: string;
  campos: Record<string, string>;
  tamanioMaximo: number;
  expiraEnSegundos: number;
}

export const voluntariadoApi = {
  catalogos: () => api.get<CatalogosApi>("/catalogos"),
  crearRed: (nombreRedTematica: string) => api.post("/redes", { nombreRedTematica }),
  actualizarRed: (id: number, nombreRedTematica: string) => api.put(`/redes/${id}`, { nombreRedTematica }),
  crearTrimestre: (datos: Omit<TrimestreApi, "idTrimestre">) => api.post("/trimestres", datos),
  actualizarTrimestre: (id: number, datos: Partial<TrimestreApi>) => api.put(`/trimestres/${id}`, datos),

  grupos: (filtros: { campus?: number | null; red?: number | null } = {}) =>
    api.get<GrupoResumenApi[]>(`/grupos${consulta(filtros)}`),
  grupo: (id: number) => api.get<GrupoDetalleApi>(`/grupos/${id}`),
  miembros: (idGrupo: number) => api.get<MiembroApi[]>(`/grupos/${idGrupo}/miembros`),
  reasignarCoordinador: (idGrupo: number, idPersona: number) =>
    api.put(`/grupos/${idGrupo}/coordinador`, { idPersona }),
  /** Solo viaja lo que cambió. El nombre no se edita: el servidor lo rechaza. */
  editarGrupo: (idGrupo: number, cambios: CambiosGrupoApi) =>
    api.put<GrupoDetalleApi>(`/grupos/${idGrupo}`, cambios),

  solicitudesGrupos: () => api.get<SolicitudGrupoResumenApi[]>("/solicitudes-grupos"),
  solicitudGrupo: (id: number) => api.get<SolicitudGrupoDetalleApi>(`/solicitudes-grupos/${id}`),
  crearSolicitudGrupo: (datos: NuevaSolicitudGrupoApi) =>
    api.post<SolicitudGrupoDetalleApi>("/solicitudes-grupos", datos),
  adjuntarASolicitud: (id: number, idRequisitoAdjunto: number, archivoUrl: string) =>
    api.post(`/solicitudes-grupos/${id}/adjuntos`, { idRequisitoAdjunto, archivoUrl }),
  resolverSolicitudGrupo: (id: number, estado: "APROBADA" | "RECHAZADA" | "DEVUELTA", motivo: string | null, redesTematicas: number[]) =>
    api.post<{ idGrupoCreado: number | null; cuentasSinPersona: string[] }>(
      `/solicitudes-grupos/${id}/resolucion`, { estado, motivo, redesTematicas }),

  solicitudesUnion: (idGrupo: number, estado?: CodigoEstadoSolicitud) =>
    api.get<SolicitudUnionApi[]>(`/grupos/${idGrupo}/solicitudes-union${consulta({ estado })}`),
  solicitarUnion: (idGrupo: number, idPersona: number, mensaje: string | null) =>
    api.post(`/grupos/${idGrupo}/solicitudes-union`, { idPersona, mensaje }),
  resolverUnion: (id: number, estado: "APROBADA" | "RECHAZADA", idPersonaResuelve: number) =>
    api.post(`/solicitudes-union/${id}/resolucion`, { estado, idPersonaResuelve }),

  actividades: (filtros: { grupo?: number; estado?: CodigoEstadoActividad; trimestre?: number } = {}) =>
    api.get<ActividadApi[]>(`/actividades${consulta(filtros)}`),
  actividad: (id: number) => api.get<ActividadDetalleApi>(`/actividades/${id}`),
  crearActividad: (datos: {
    idGrupoOrganizador: number;
    idPeriodo: number;
    idTrimestre: number;
    nombreActividad: string;
    objetivoActividad: string;
    fechaActividad: string;
    lugarActividad: string;
    coorganizadores: number[];
  }) => api.post<ActividadDetalleApi>("/actividades", datos),
  resolverActividad: (id: number, estado: "APROBADA" | "RECHAZADA") =>
    api.post(`/actividades/${id}/aprobacion`, { estado }),
  guardarResultados: (id: number, resultados: string) => api.put(`/actividades/${id}/resultados`, { resultados }),
  firmarSubida: (datos: { proceso: "SOLICITUD_GRUPO" | "ACTIVIDAD" | "COMPROBANTE" | "GRUPO"; idReferencia: number; nombreArchivo: string; tipoContenido: string }) =>
    api.post<SubidaFirmadaApi>("/archivos/subidas", datos),
  agregarFoto: (id: number, archivoUrl: string, idRequisitoAdjunto: number | null) =>
    api.post(`/actividades/${id}/fotos`, { archivoUrl, idRequisitoAdjunto }),
  participaciones: (idActividad: number) => api.get<ParticipacionApi[]>(`/actividades/${idActividad}/participaciones`),
  pasarLista: (idActividad: number, participaciones: LineaAsistenciaApi[], idPersonaConfirma: number) =>
    api.post(`/actividades/${idActividad}/asistencia`, { participaciones, idPersonaConfirma }),
  inscribirse: (idActividad: number, idPersona: number) =>
    api.post<{ tipoParticipante: TipoParticipanteApi }>(`/actividades/${idActividad}/inscripciones`, { idPersona }),
  cancelarInscripcion: (idActividad: number, idPersona: number) =>
    api.delete(`/actividades/${idActividad}/inscripciones/${idPersona}`),

  informeEconomico: (idActividad: number) => api.get<InformeEconomicoApi>(`/actividades/${idActividad}/economico`),
  guardarInformeEconomico: (
    idActividad: number,
    datos: { saldosAnteriores: Record<number, number>; movimientos: MovimientoEconomicoApi[]; observaciones: string | null },
  ) => api.put(`/actividades/${idActividad}/economico`, datos),

  informes: (filtros: { grupo?: number; trimestre?: number } = {}) =>
    api.get<InformeResumenApi[]>(`/informes${consulta(filtros)}`),
  informe: (id: number) => api.get<InformeDetalleApi>(`/informes/${id}`),
  crearInforme: (idGrupo: number, idTrimestre: number) =>
    api.post<{ idInformeTrimestral: number }>("/informes", { idGrupo, idTrimestre }),
  fijarActividadesDeInforme: (id: number, actividades: number[]) => api.put(`/informes/${id}`, { actividades }),
  enviarInforme: (id: number) => api.post(`/informes/${id}/envio`),
  dictaminarInforme: (id: number, estado: "ACEPTADO" | "OBSERVADO", observaciones: string | null) =>
    api.post(`/informes/${id}/dictamen`, { estado, observaciones }),

  participacionMiembros: () =>
    api.get<{ umbral: number; miembros: ParticipacionMiembroApi[] }>("/diplomas/participacion"),
  diplomasDeGrupo: (idGrupo: number) => api.get<DiplomaApi[]>(`/diplomas?grupo=${idGrupo}`),
  emitirDiploma: (datos: {
    idGrupo: number;
    idPersona: number;
    ventanaDiploma: string;
    actividadesGrupo: number;
    actividadesAsistidas: number;
    porcentajeParticipacion: number;
  }) => api.post("/diplomas", datos),

  personas: () => api.get<PersonaVoluntariadoApi[]>("/personas"),
  persona: (id: number) => api.get<ResumenPersonaApi>(`/personas/${id}`),
  participacionesDePersona: (id: number) => api.get<ParticipacionPersonaApi[]>(`/personas/${id}/participaciones`),
  solicitudesDePersona: (id: number) => api.get<SolicitudPersonaApi[]>(`/personas/${id}/solicitudes`),

  tablero: () => reporteria.get<TableroApi>("/tablero"),
  estadisticas: () => reporteria.get<FilaEstadisticaApi[]>("/estadisticas"),
};
