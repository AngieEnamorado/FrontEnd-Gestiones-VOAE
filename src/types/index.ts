// Tipos centrales de la app de Becas VOAE.
// Mantenerlos aquí facilita reutilizarlos entre páginas cuando cada
// ruta del sidebar tenga su propia vista conectada a datos reales.

export type EstadoSolicitud =
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA"
  | "EN REVISIÓN"
  | "ESPERA INF. SOCIAL";

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

export interface DocumentoInscripcion {
  tipo: string;
  nombre: string;
  enlace: string;
}

export interface ContactoEmergencia {
  nombre: string;
  parentesco: string;
  telefono: string;
}

export interface FichaSalud {
  tipoSangre?: string;
  alergias?: string;
  condicionesMedicas?: string;
  discapacidad?: string;
  medicamentos?: string;
  contactoEmergencia?: ContactoEmergencia;
}

export interface AcompananteExterno {
  nombreCompleto: string;
  fechaNacimiento: string;
  correo: string;
  telefono: string;
}

export interface Inscripcion {
  id: string;
  nombreEstudiante: string;
  estado: EstadoSolicitud;
  fecha: string;
  periodo: string;

  // Datos del estudiante — vienen de su expediente universitario.
  numeroCuenta?: string;
  carreraFacultad?: string;
  correoInstitucional?: string;
  telefonoContacto?: string;

  // Inscripción excepcional: alguien más (p. ej. la jefa de misión) inscribió
  // al estudiante en su nombre y debe justificarlo.
  esExcepcional?: boolean;
  inscritoPor?: string;
  motivoExcepcion?: string;

  // Acompañante externo: persona ajena a la universidad que viaja con el estudiante.
  tieneAcompanante?: boolean;
  acompanante?: AcompananteExterno;

  // Fichas de salud, propia y del acompañante externo (si aplica).
  fichaSaludEstudiante?: FichaSalud;
  fichaSaludAcompanante?: FichaSalud;

  // Documentos de respaldo adjuntados por el estudiante.
  documentos?: DocumentoInscripcion[];

  // Notas u observaciones generales registradas por el estudiante.
  observaciones?: string;
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
