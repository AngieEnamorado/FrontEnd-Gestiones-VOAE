// Convierte lo que devuelve voae-procad en los tipos que ya usan las
// pantallas de PROCAD (types/index.ts). Así las pantallas no cambian: solo
// cambia de dónde vienen los datos.
//
// Lo que la base no guarda se deja vacío en vez de inventarlo: la pantalla ya
// sabe mostrar un campo sin declarar.
import { enCorto } from "../utils/fechas";
import type {
  ActividadProcad,
  AgrupacionProcad,
  CondicionadoPendiente,
  EmpleadoProcad,
  EstadoSolicitudProcad,
  ExpulsionPendiente,
  MatriculaExcepcional,
  PeriodoInscripcion,
  SolicitudProcad,
  TipoAgrupacion,
  VisoriaProcad,
} from "../types";
import type {
  AccesoApi,
  ActividadApi,
  CampusApi,
  CatalogosProcadApi,
  CodigoEstadoSolicitud,
  CondicionadoApi,
  DecisionSolicitud,
  ExpulsionApi,
  GrupoApi,
  MatriculaExcepcionalApi,
  PeriodoCatalogoApi,
  SolicitudApi,
  VisoriaApi,
} from "../types/procad";

const ROMANOS = ["", "I", "II", "III"];

/** 2026, 2 → «II-2026», como se escribe el período en todo el panel. */
export const etiquetaPeriodo = (anio: number, numeroPac: number) => `${ROMANOS[numeroPac] ?? numeroPac}-${anio}`;

const nombreCompleto = (nombre: string | null, apellidos: string | null) =>
  [nombre, apellidos].filter(Boolean).join(" ");

/** ISO con hora → «2026-08-19», que es lo que esperan enCorto y la ficha. */
const soloFecha = (fecha: string | null) => (fecha ?? "").slice(0, 10);

const ESTADO_SOLICITUD: Partial<Record<CodigoEstadoSolicitud, EstadoSolicitudProcad>> = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobada",
  OBSERVADO: "observada",
  NO_CUMPLE_REQUISITO: "noCumple",
};

export const DECISION_DE_ESTADO: Record<EstadoSolicitudProcad, DecisionSolicitud | null> = {
  aprobada: "APROBADO",
  observada: "OBSERVADO",
  noCumple: "NO_CUMPLE_REQUISITO",
  pendiente: null,
};

/**
 * Una solicitud de la API a la del panel. Devuelve null para las EXPULSADO:
 * el panel de solicitudes no tiene ese estado, y esos casos ya se ven en
 * Expulsiones.
 */
export function aSolicitud(s: SolicitudApi): SolicitudProcad | null {
  const estado = ESTADO_SOLICITUD[s.codigoEstado];
  if (!estado) return null;

  const texto = s.adjuntos.find((a) => a.tipoAdjunto === "texto")?.contenidoTexto ?? "";
  const archivos = s.adjuntos
    .filter((a) => a.tipoAdjunto !== "texto" && a.urlArchivo)
    .map((a) => (a.urlArchivo as string).split("/").pop() ?? (a.urlArchivo as string));

  return {
    id: s.idSolicitud,
    nombre: nombreCompleto(s.nombrePersona, s.apellidosPersona),
    cuenta: s.numeroCuenta ?? "",
    // La base no guarda el número de identidad.
    identidad: "",
    correo: s.correoPersona ?? "",
    telefono: s.telefonoPersona ?? "",
    sexo: s.sexoPersona ?? "M",
    carrera: s.carreraEstudiante ?? "",
    grupo: s.nombreGrupo,
    tipo: s.tipoGrupo,
    centro: s.nombreCampus,
    periodo: etiquetaPeriodo(s.anioPeriodo, s.numeroPac),
    fechaSolicitud: soloFecha(s.fechaRegistro),
    indiceGlobal: Number(s.indiceGlobal ?? 0),
    matriculaVerificada: Boolean(s.matriculaVerificada),
    contactoEmergencia: {
      nombre: s.contactoEmergenciaNombre ?? "",
      telefono: s.contactoEmergenciaTelefono ?? "",
    },
    posicion: s.nombrePosicion ?? undefined,
    instrumento: s.nombreInstrumento ?? undefined,
    nivelExperiencia: s.nivelExperiencia ?? undefined,
    alergia: s.alergia ?? undefined,
    experiencia: texto || archivos.length > 0 ? { texto, archivos } : undefined,
    indice: Number(s.indicePeriodo ?? 0),
    estado,
  };
}

export const aCondicionado = (c: CondicionadoApi): CondicionadoPendiente => ({
  id: c.idSolicitud,
  nombre: nombreCompleto(c.nombrePersona, c.apellidosPersona),
  cuenta: c.numeroCuenta ?? "",
  grupo: c.nombreGrupo,
  propone: nombreCompleto(c.nombrePropone, c.apellidosPropone),
  // La propuesta no guarda justificación en la base.
  justificacion: "",
});

export const aExpulsion = (x: ExpulsionApi): ExpulsionPendiente => ({
  id: x.idSolicitudExpulsion,
  nombre: nombreCompleto(x.nombrePersona, x.apellidosPersona),
  cuenta: x.numeroCuenta ?? "",
  grupo: x.nombreGrupo,
  solicita: nombreCompleto(x.nombreSolicita, x.apellidosSolicita),
  motivo: x.nombreMotivoExpulsion,
  detalle: x.detalleMotivo ?? "",
});

export const aMatricula = (m: MatriculaExcepcionalApi): MatriculaExcepcional => ({
  id: m.idMatriculaExcepcional,
  nombre: nombreCompleto(m.nombrePersona, m.apellidosPersona),
  cuenta: m.numeroCuenta ?? "",
  motivo: m.motivoExcepcion,
  periodo: etiquetaPeriodo(m.anioPeriodo, m.numeroPac),
});

/* ------------------------------ Agrupaciones ------------------------------ */

/**
 * Un grupo de la API a la fila de la lista. Las cifras que no salen de la
 * base (elegibilidad, asistencias, preferencial…) son de voae-reporteria, que
 * aún no existe: van en 0 y la lista, conectada, ni siquiera muestra esas
 * columnas. `estudiantes` sí es real: los integrantes APROBADO.
 */
export const aAgrupacion = (g: GrupoApi): AgrupacionProcad => ({
  nombre: g.nombreGrupo,
  tipo: g.tipoGrupo,
  centro: g.nombreCampus,
  estudiantes: g.integrantes,
  actividades: 0,
  validadas: 0,
  inscritos: 0,
  asistencias: 0,
  elegibilidad: 0,
  cumplimiento: 0,
  preferencial: 0,
  prosene: 0,
  expulsiones: 0,
  sexoF: 0,
  aspirantes: 0,
  cumplenIndice: 0,
  citados: 0,
  solicitudes: { aprobada: 0, pendiente: 0, observada: 0, noCumple: 0 },
  carreras: [],
  condicionados: 0,
  colaboradorExterno: false,
  esSeleccion: g.esSeleccion,
  deporte: g.nombreDeporte ?? undefined,
  disciplinas: g.disciplinas.map((d) => d.nombreDisciplina),
});

/**
 * Una actividad de la API a la del panel. La base guarda mucho menos que la
 * tarjeta de la demostración: no hay título, hora, lugar, horas abonadas,
 * justificación ni adjuntos. El título se arma con la descripción (o con el
 * tipo y el grupo), y lo demás queda vacío en vez de inventarlo.
 */
export const aActividad = (x: ActividadApi): ActividadProcad => ({
  id: x.idActividad,
  titulo: x.descripcionActividad?.trim() || `${x.nombreTipoActividad ?? "Actividad"} — ${x.nombreGrupo}`,
  grupo: x.nombreGrupo,
  tipo: x.tipoGrupo,
  centro: x.nombreCampus,
  // La base no sabe quién la reportó, solo qué usuario la registró.
  encargado: { nombre: x.usuarioRegistro, rol: "", correo: "" },
  fecha: enCorto(soloFecha(x.fechaActividad)),
  hora: "",
  lugar: "",
  inscritos: x.inscritos,
  asistentes: x.presentes,
  horas: 0,
  justificacion: "",
  adjuntos: [],
  enviada: enCorto(soloFecha(x.fechaRegistro)),
  estado: x.codigoEstado,
  resolucion: x.fechaValidacion
    ? {
        por: nombreCompleto(x.nombreValidadora, x.apellidosValidadora),
        fecha: enCorto(soloFecha(x.fechaValidacion)),
        motivo: x.observacionValidacion ?? undefined,
      }
    : undefined,
});

/**
 * Una visoría de la API a la del calendario. La base no liga la visoría a un
 * grupo ni tiene estado de borrador: se muestra el lugar donde el calendario
 * pondría el grupo, y todas figuran programadas porque existen desde que se crean.
 */
export const aVisoria = (v: VisoriaApi): VisoriaProcad => ({
  id: v.idVisoria,
  grupo: [v.nombreLugar, v.nombreAula].filter(Boolean).join(" · ") || "Lugar sin definir",
  centro: v.nombreCampus,
  fecha: soloFecha(v.fechaVisoria),
  hora: v.horaVisoria ?? "",
  citados: v.citados,
  estado: "PROGRAMADA",
});

/* ------------------------------ Configuración ----------------------------- */

/**
 * Los accesos de la API vienen por persona y grupo; el panel los muestra por
 * persona. `idPorNombre` es para poder actuar sobre ella: el panel identifica
 * al empleado por su nombre.
 */
export function aEmpleados(accesos: AccesoApi[]): {
  empleados: EmpleadoProcad[];
  idPorNombre: Map<string, number>;
} {
  const porPersona = new Map<number, AccesoApi[]>();
  for (const acceso of accesos) {
    porPersona.set(acceso.idPersona, [...(porPersona.get(acceso.idPersona) ?? []), acceso]);
  }

  const idPorNombre = new Map<string, number>();
  const empleados = [...porPersona.entries()].map(([idPersona, filas]): EmpleadoProcad => {
    const nombre = nombreCompleto(filas[0].nombrePersona, filas[0].apellidosPersona);
    idPorNombre.set(nombre, idPersona);
    const externo = filas.some((f) => f.esColaboradorExterno);
    return {
      nombre,
      rol: externo ? "Colaborador externo" : "Director",
      centro: [...new Set(filas.map((f) => f.nombreCampus))].join(" · "),
      grupos: filas.map((f) => f.nombreGrupo),
      acceso: filas.some((f) => f.activo),
      esColaboradorExterno: externo,
    };
  });

  return { empleados: empleados.sort((x, y) => x.nombre.localeCompare(y.nombre)), idPorNombre };
}

/**
 * Los períodos de Catálogo, vistos como períodos de inscripción. El activo es
 * el que Catálogo da por vigente; los demás están cerrados si ya terminaron o
 * Catálogo los desactivó, y programados si todavía no llegan.
 */
export function aPeriodos(periodos: PeriodoCatalogoApi[], idActivo: number | null): PeriodoInscripcion[] {
  const hoy = new Date().toISOString().slice(0, 10);
  return periodos.map((p) => ({
    label: etiquetaPeriodo(p.anioPeriodo, p.numeroPac),
    estado:
      p.idPeriodo === idActivo
        ? "activo"
        : !p.estadoPeriodo || (p.fechaFinPeriodo !== null && soloFecha(p.fechaFinPeriodo) < hoy)
          ? "cerrado"
          : "programado",
  }));
}

/** «artes plasticas» → «Artes plasticas»: la base guarda los nombres en minúscula. */
const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export interface ReferenciasProcad {
  centros: string[];
  /** Tal como las guarda la base, para poder contar qué grupos las usan. */
  disciplinas: string[];
  tipos: Record<TipoAgrupacion, string[]>;
  motivos: string[];
}

/** Lo que muestra la pantalla de Catálogos, sacado de voae-procad y de voae-catalogo. */
export function aReferencias(catalogos: CatalogosProcadApi, campus: CampusApi[]): ReferenciasProcad {
  const tipoDeGrupo = new Map(catalogos.tiposGrupo.map((t) => [t.idTipoGrupo, t.nombreTipoGrupo]));
  const tiposDe = (tipo: TipoAgrupacion) =>
    catalogos.tiposActividad
      .filter((t) => tipoDeGrupo.get(t.idTipoGrupo) === tipo)
      .map((t) => conMayuscula(t.nombreTipoActividad));
  return {
    centros: campus.filter((c) => c.estadoCampus).map((c) => c.nombreCampus),
    disciplinas: catalogos.disciplinas.map((d) => d.nombreDisciplina),
    tipos: { deportivo: tiposDe("deportivo"), artistico: tiposDe("artistico") },
    motivos: catalogos.motivosExpulsion.map((m) => m.nombreMotivoExpulsion),
  };
}
