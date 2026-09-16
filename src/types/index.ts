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
  /**
   * Qué le toca hacer a esta persona dentro de PROCAD. El administrador
   * gestiona; el vicerrector solo consulta estadísticas. Es un campo aparte de
   * `rol` porque ese es el cargo institucional, texto libre que se muestra, y
   * este decide qué se puede abrir.
   */
  rolProcad: RolProcad;
}

/** Los dos roles de PROCAD que existen dentro de esta plataforma. */
export type RolProcad = "administrador" | "vicerrector";

export const ETIQUETA_ROL_PROCAD: Record<RolProcad, string> = {
  administrador: "Administrador PROCAD",
  vicerrector: "Vicerrectoría",
};

// ===========================================================================
//  PROCAD · Programa de Cultura, Arte y Deporte
// ===========================================================================

export type TipoAgrupacion = "deportivo" | "artistico";

/** Estados que puede tener la solicitud de ingreso a una agrupación. */
export type EstadoSolicitudProcad = "aprobada" | "pendiente" | "observada" | "noCumple";

/**
 * Un período académico de PROCAD. `elegibilidad` y `factor` son los que
 * permiten reconstruir las cifras de períodos anteriores a partir de las del
 * período actual: `factor` escala los conteos y `elegibilidad` los
 * porcentajes. Cuando exista backend, cada período traerá sus propias cifras
 * y estos dos campos desaparecen.
 */
export interface PeriodoProcad {
  id: string;
  label: string;
  elegibilidad: number;
  factor: number;
}

/**
 * Cifras de una agrupación en el período actual. Es la unidad con la que
 * trabajan todas las secciones del panel de estadísticas: se filtra, se suma
 * y se escala, pero nunca se consulta una métrica ya agregada.
 */
export interface AgrupacionProcad {
  nombre: string;
  tipo: TipoAgrupacion;
  centro: string;

  estudiantes: number;
  actividades: number;
  validadas: number;
  inscritos: number;
  asistencias: number;

  elegibilidad: number;
  cumplimiento: number;

  preferencial: number;
  prosene: number;
  expulsiones: number;
  sexoF: number;

  aspirantes: number;
  cumplenIndice: number;
  citados: number;
  solicitudes: Record<EstadoSolicitudProcad, number>;

  /** Estudiantes por carrera, en el mismo orden que `CARRERAS`. */
  carreras: number[];

  /** Excepciones de talento autorizadas este período. */
  condicionados: number;
  /** La dirige alguien sin contrato con la universidad. */
  colaboradorExterno: boolean;
  /** Es una selección multi-campus, no una agrupación de un solo centro. */
  esSeleccion: boolean;

  /** Deporte que practica, si es deportiva. */
  deporte?: string;
  /**
   * Disciplinas que cubre, si es artística. Es una lista porque una misma
   * agrupación puede trabajar varias a la vez (una asociación con áreas de
   * danza y teatro, por ejemplo).
   */
  disciplinas?: string[];
}

export interface FiltrosProcad {
  periodo: string;
  centro: string;
  tipo: TipoAgrupacion | "todos";
  agrupacion: string;
}

/** Fila del resumen por centro regional: varias agrupaciones colapsadas en una. */
export interface ResumenCentro {
  nombre: string;
  grupos: number;
  estudiantes: number;
  actividades: number;
  estudiantesDeportivo: number;
  estudiantesArtistico: number;
  /** `null` cuando el centro no tiene estudiantes y el promedio no existe. */
  elegibilidad: number | null;
}

// --- PROCAD · administración -----------------------------------------------

/** Una solicitud de ingreso vista desde el panel del administrador. */
export interface SolicitudProcad {
  id: number;
  nombre: string;
  cuenta: string;
  /** Número de identidad; en la ficha va junto al nombre, como en un carnet. */
  identidad: string;
  correo: string;
  telefono: string;
  sexo: "M" | "F";
  carrera: string;
  grupo: string;
  tipo: TipoAgrupacion;
  centro: string;
  /** El período al que se postula, y el día en que lo hizo. */
  periodo: string;
  fechaSolicitud: string;
  /**
   * Índice global de la carrera, distinto del del período: uno dice cómo le fue
   * este trimestre y el otro cómo le ha ido siempre.
   */
  indiceGlobal: number;
  /** Matrícula confirmada contra Registro; sin ella la solicitud no procede. */
  matriculaVerificada: boolean;
  /** Quién responde por el estudiante si algo pasa en una práctica. */
  contactoEmergencia: { nombre: string; telefono: string };
  /**
   * Puesto dentro del equipo. No todas lo tienen: un grupo artístico o un
   * deporte individual —atletismo, ajedrez— no reparte posiciones.
   */
  posicion?: string;
  /** Solo en agrupaciones artísticas, y varía entre integrantes del mismo grupo. */
  instrumento?: string;
  nivelExperiencia?: "Principiante" | "Intermedio" | "Avanzado";
  /** Lo que declaró el estudiante; vacío o sin definir es «no declaró». */
  alergia?: string;
  /** Lo que contó de su trayectoria, con lo que haya adjuntado para probarlo. */
  experiencia?: { texto: string; archivos: string[] };
  indice: number;
  estado: EstadoSolicitudProcad;
}

/**
 * Propuesta de excepción de talento. El entrenador propone y el administrador
 * autoriza: sin esa segunda firma la solicitud no puede quedar aprobada.
 */
export interface CondicionadoPendiente {
  id: number;
  nombre: string;
  cuenta: string;
  grupo: string;
  propone: string;
  justificacion: string;
}

export interface ExpulsionPendiente {
  id: number;
  nombre: string;
  cuenta: string;
  grupo: string;
  solicita: string;
  motivo: string;
  detalle: string;
}

export interface MatriculaExcepcional {
  id: number;
  nombre: string;
  cuenta: string;
  motivo: string;
  periodo: string;
}

export type EstadoActividadProcad =
  | "PENDIENTE_VALIDACION"
  | "VALIDADA"
  /** Devuelta al encargado con lo que debe corregir antes de reenviarla. */
  | "OBSERVADA"
  | "RECHAZADA";

/** Quién cerró una actividad, cuándo y qué le contestó al encargado. */
export interface ResolucionActividad {
  por: string;
  fecha: string;
  /** Lo que se le escribió; al validar puede no haber nada que decir. */
  motivo?: string;
}

/**
 * Una actividad reportada por el encargado de una agrupación.
 *
 * Lleva mucho más de lo que cabe en su tarjeta a propósito: la tarjeta sirve
 * para reconocerla de un vistazo, y el detalle para decidirla. Decidir sin la
 * justificación ni el respaldo es firmar a ciegas.
 */
export interface ActividadProcad {
  id: number;
  titulo: string;
  grupo: string;
  tipo: TipoAgrupacion;
  centro: string;
  /** Quien la reporta. Nunca es el administrador: él solo resuelve. */
  encargado: { nombre: string; rol: string; correo: string };
  /** Cuándo ocurrió, ya escrito como se enseña. */
  fecha: string;
  hora: string;
  lugar: string;
  inscritos: number;
  /** Cuántos de los inscritos se presentaron: lo que de verdad cuenta. */
  asistentes: number;
  /** Horas que se le abonan a cada asistente si la actividad queda validada. */
  horas: number;
  /** Por qué se hizo y qué deja. Es el texto que se lee antes de decidir. */
  justificacion: string;
  adjuntos: string[];
  /** Cuándo la envió el encargado. */
  enviada: string;
  estado: EstadoActividadProcad;
  resolucion?: ResolucionActividad;
}

export type EstadoVisoria = "BORRADOR" | "PROGRAMADA";

/**
 * Una prueba de ingreso: la agrupación cita aspirantes y los ve competir o
 * actuar. En borrador solo existe para el administrador; al programarla, los
 * citados quedan notificados.
 */
export interface VisoriaProcad {
  id: number;
  grupo: string;
  centro: string;
  /**
   * ISO («2026-02-17»), no el texto ya escrito: el calendario tiene que contar
   * días para saber en qué casilla cae, y eso no se hace sobre «17 feb 2026».
   */
  fecha: string;
  hora: string;
  citados: number;
  estado: EstadoVisoria;
}

/**
 * Empleado vinculado a una o varias agrupaciones. Un colaborador externo no
 * tiene contrato con la universidad y nunca recibe acceso al panel: el
 * administrador actúa en el sistema en su nombre.
 */
export interface EmpleadoProcad {
  nombre: string;
  rol: string;
  centro: string;
  grupos: string[];
  acceso: boolean;
  esColaboradorExterno: boolean;
}

export interface UsuarioProcad {
  nombre: string;
  correo: string;
  rol: string;
  estado: "activo" | "inactivo";
}

export type EstadoPeriodoInscripcion = "activo" | "programado" | "cerrado";

export interface PeriodoInscripcion {
  label: string;
  estado: EstadoPeriodoInscripcion;
}

export interface RegistroAuditoria {
  fecha: string;
  actor: string;
  accion: string;
  detalle: string;
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

// Un registro individual de actividad de voluntariado para el dashboard de
// Estadísticas de Voluntariado. Igual que RegistroGiraAnalitica: una fila
// "plana" pensada para agregarse en gráficos y KPIs, independiente de los
// mocks operativos (grupos/actividades) que alimentan el resto del módulo.
export interface RegistroVoluntariadoAnalitica {
  id: string;
  fecha: string;
  año: number;
  periodo: string;
  campus: string;
  red: RedTematica["id"];
  grupo: string;
  estado: EstadoSolicitud;
  participantes: number;
  horas: number;
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

/**
 * Una foto de la galería de agrupaciones. `span` es cuántas de las seis
 * columnas del mosaico ocupa: el ritmo irregular es lo que hace que una
 * cuadrícula de fotos se lea como un álbum y no como un catálogo.
 */
export interface FotoGaleria {
  id: string;
  /**
   * De dónde sale la imagen: el identificador en el CDN de archivo, o una URL
   * entera —`blob:`, `data:`, `https:`— cuando la subió el administrador.
   * `urlFoto` distingue las dos formas.
   */
  imagen: string;
  /** Qué se ve, para quien no puede verla. */
  alt: string;
  span: 2 | 3 | 4 | 6;
}

/**
 * Las fotos de un evento, de una de dos procedencias.
 *
 * Casi siempre el evento es una actividad reportada por un encargado, y
 * entonces el álbum no guarda ni título ni fecha: son de la actividad, y
 * copiarlos aquí era abrir la puerta a que un día dijeran cosas distintas.
 * Una actividad tiene como mucho un álbum, y su primera foto es la portada de
 * su tarjeta.
 *
 * Pero no todo lo que la universidad fotografía pasó por Actividades —una
 * premiación, una visita, el aniversario del programa—, así que un álbum
 * también puede existir por su cuenta. Ese sí lleva sus propios datos, porque
 * no hay de dónde sacarlos.
 */
export type AlbumGaleria = AlbumDeActividad | AlbumSuelto;

export interface AlbumDeActividad {
  id: string;
  origen: "actividad";
  actividadId: number;
  fotos: FotoGaleria[];
}

export interface AlbumSuelto {
  id: string;
  origen: "suelto";
  titulo: string;
  /** La agrupación, si el evento es de una; vacío si es del programa entero. */
  grupo: string;
  tipo: TipoAgrupacion;
  centro: string;
  /** ISO. */
  fecha: string;
  fotos: FotoGaleria[];
}

/** Lo que hace falta para abrir un álbum suelto; lo que el formulario pide. */
export type DatosAlbumSuelto = Omit<AlbumSuelto, "id" | "origen" | "fotos">;

/**
 * Un álbum con sus datos ya resueltos —vengan de su actividad o de él mismo—,
 * que es como se mira. Se arma con `unirAlbumes` y nunca se guarda así.
 */
export interface AlbumVisible {
  id: string;
  origen: "actividad" | "suelto";
  /** Solo si sale de una actividad; es lo que permite volver a ella. */
  actividadId?: number;
  actividad: string;
  grupo: string;
  tipo: TipoAgrupacion;
  centro: string;
  /** ISO, para poder ordenar y formatear sin volver a interpretar el texto. */
  fecha: string;
  fotos: FotoGaleria[];
}
