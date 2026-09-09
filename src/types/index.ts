// Tipos centrales de la app de Becas VOAE.
// Mantenerlos aquí facilita reutilizarlos entre páginas cuando cada
// ruta del sidebar tenga su propia vista conectada a datos reales.

export type EstadoSolicitud =
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA"
  | "EN REVISIÓN"
  | "ESPERA INF. SOCIAL"
  | "DEVUELTA";

export type TipoBeca = "academica" | "bienestar";

export interface Solicitud {
  id: number;
  numeroCuenta: string;
  nombreEstudiante: string;
  becaSolicitada: string;
  becaAprobada: string | null;
  carrera: string;
  centro: string;
  categoria: string;
  tipoBeca: TipoBeca;
  estado: EstadoSolicitud;
}

export type AlcanceViaje = "Local" | "Nacional" | "Internacional";

export type FinalidadGira = "Académica" | "Social" | "Deportiva" | "Cultural" | "Recreativa";

export type OrigenFondos = "Institucional" | "Aporte de viajeros" | "Mixto" | "Externo";

export interface DocenteAcompanante {
  nombre: string;
  rol: string;
}

export interface LineaCosto {
  concepto: string;
  detalle: string;
  monto: number;
}

export interface SolicitudGira {
  id: string;
  estudiante: string;
  docente: string;
  destino: string;
  categoria: string;
  centro: string;
  periodo: string;
  fecha: string;
  estado: EstadoSolicitud;
  descripcion: string;

  // Datos generales — resto del formulario de la gira. Opcionales porque no
  // todo mock de gira/solicitud tiene el detalle completo capturado.
  alcanceViaje?: AlcanceViaje;
  alojamiento?: string;

  // Fechas y horarios
  horaSalida?: string;
  fechaRetorno?: string;
  horaRetorno?: string;
  aperturaInscripciones?: string;
  cierreInscripciones?: string;

  // Alcance académico
  carrerasParticipantes?: string[];
  facultadesParticipantes?: string[];
  finalidadesGira?: FinalidadGira[];

  // Personas
  jefeAprobacion?: string;
  estudiantesAproximados?: number;
  docentesAproximados?: number;
  docentesAcompanantes?: DocenteAcompanante[];

  // Transporte
  utilizaTransporteUniversidad?: boolean;
  mediosTransporte?: string[];
  observacionesTraslado?: string;

  // Financiamiento y costos
  origenFondos?: OrigenFondos[];
  desgloseCostos?: LineaCosto[];
}

// Un registro individual de gira para el dashboard de Estadísticas de Giras.
// A diferencia de SolicitudGira (una solicitud puntual con su propio detalle),
// esto es una fila "plana" pensada para agregarse en gráficos y KPIs.
export interface RegistroGiraAnalitica {
  id: string;
  fecha: string;
  año: number;
  periodo: string;
  campus: string;
  facultad: string;
  carrera: string;
  destino: string;
  finalidad: FinalidadGira;
  alcance: AlcanceViaje;
  estado: EstadoSolicitud;
  estudiantes: number;
  costo: number;
}

// Un borrador de solicitud de gira: mismos campos que SolicitudGira, pero
// todos opcionales salvo el id, porque el usuario puede guardarlo a medio
// llenar y completarlo después desde el formulario de Nueva Solicitud.
export type BorradorGira = { id: string } & Partial<Omit<SolicitudGira, "id">>;

export interface Inscripcion {
  id: string;
  nombreEstudiante: string;
  estado: EstadoSolicitud;
  fecha: string;
  periodo: string;
}

export interface EstadisticaSolicitudes {
  key: string;
  label: string;
  valor: number;
}

export interface UsuarioActual {
  nombreCompleto: string;
  nombreUsuario: string;
  correo: string;
  rol: string;
  iniciales: string;
}

// ───────────────────────────────────────────────────────────
// Voluntariado
// ───────────────────────────────────────────────────────────

export type RolPortalEstudiante = "coordinador" | "miembro";
export type RolPortalAdministrativo = "admin" | "enlace";

export interface Campus {
  id: string;
  nombre: string;
}

export interface RedTematica {
  id: string;
  nombre: string;
  color: "amber" | "emerald" | "violet" | "blue" | "rose";
}

export interface Trimestre {
  id: string;
  nombre: string;
  fechaLimite: string;
}

export type CargoJuntaDirectiva =
  | "Presidente"
  | "Vicepresidente"
  | "Secretario"
  | "Tesorero"
  | "Fiscal"
  | "Vocal";

export interface MiembroJuntaDirectiva {
  cargo: CargoJuntaDirectiva;
  numeroCuenta: string;
  nombre: string;
}

export interface MiembroGrupo {
  numeroCuenta: string;
  nombre: string;
  carrera: string;
  cargo: CargoJuntaDirectiva | "Voluntario";
  anioIngreso: number;
  esFundador: boolean;
}

export type TipoParticipante = "voluntario activo" | "participante";

export interface GrupoVoluntariado {
  id: string;
  nombre: string;
  campusId: string;
  redesIds: string[];
  logoIniciales: string;
  logoColor: "amber" | "emerald" | "violet" | "navy" | "rose";
  campoAccion: string;
  descripcion: string;
  mision: string;
  vision: string;
  reseñaHistorica: string;
  coordinadorCuenta: string;
  juntaDirectiva: MiembroJuntaDirectiva[];
  miembros: MiembroGrupo[];
  estado: EstadoSolicitud;
  motivoDecision?: string;
  documentos: {
    estatutos: boolean;
    logo: boolean;
    actaJunta: boolean;
  };
  // Solo aplica mientras el grupo está en trámite (estado distinto de APROBADA):
  // quién lo propuso y cuándo. Una vez aprobado, el grupo pasa a operar normal.
  solicitanteCuenta?: string;
  fechaSolicitud?: string;
}

export interface ActividadVoluntariado {
  id: string;
  nombre: string;
  objetivo: string;
  grupoId: string;
  esConjunta: boolean;
  grupoCoorganizadorId?: string;
  fecha: string;
  lugar: string;
  cupo: number;
  periodoAcademico: string;
  estado: EstadoSolicitud;
  fotosEvidencia: number;
  resultados?: string;
}

export interface InscripcionActividadVoluntariado {
  id: string;
  actividadId: string;
  estudianteCuenta: string;
  tipoParticipante: TipoParticipante;
}

export interface RegistroAsistenciaVoluntariado {
  inscripcionId: string;
  asistio: boolean;
  horas: number;
}

export interface MovimientoEconomico {
  id: string;
  descripcion: string;
  monto: number;
  tipo: "ingreso" | "egreso";
  responsable: string;
  tipoComprobante: string;
}

export type EstadoInformeTrimestral = "EN CAPTURA" | "ENVIADO" | "OBSERVADO" | "ACEPTADO";

export interface InformeTrimestral {
  id: string;
  trimestreId: string;
  grupoId: string;
  estado: EstadoInformeTrimestral;
  observaciones?: string;
  saldoAnterior: number;
  movimientos: MovimientoEconomico[];
  actividadesIds: string[];
}

export interface SolicitudVoluntariado {
  id: string;
  tipo: "creacion de grupo" | "union a grupo" | "actividad";
  titulo: string;
  estudianteCuenta: string;
  grupoId?: string;
  estado: EstadoSolicitud;
  fecha: string;
  motivoDecision?: string;
}

export interface EstudianteVoluntariado {
  numeroCuenta: string;
  nombreCompleto: string;
  carrera: string;
  correo: string;
  iniciales: string;
  gruposIds: string[];
  horasAcumuladas: number;
}
