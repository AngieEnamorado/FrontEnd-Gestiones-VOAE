import { crearCliente } from "./clienteVoluntariado";

const api = crearCliente("VITE_API_CATALOGO", import.meta.env.VITE_API_CATALOGO);

export interface CampusApi {
  idCampus: number;
  nombreCampus: string;
  codigoCortoCampus: string;
}

export interface PeriodoApi {
  idPeriodo: number;
  anioPeriodo: number;
  numeroPac: number;
  fechaInicioPeriodo: string | null;
  fechaFinPeriodo: string | null;
}

export interface EstudianteApi {
  idPersona: number;
  numeroCuenta: string;
  nombrePersona: string;
  apellidosPersona: string;
  carreraEstudiante: string | null;
}

export const catalogoApi = {
  campus: () => api.get<CampusApi[]>("/campus"),
  periodos: () => api.get<PeriodoApi[]>("/periodos"),
  estudiantePorCuenta: (numeroCuenta: string) =>
    api.get<EstudianteApi>(`/estudiantes/${encodeURIComponent(numeroCuenta)}`),
};
