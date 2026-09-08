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
