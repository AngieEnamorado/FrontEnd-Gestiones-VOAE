// Los registros "planos" que alimentan el dashboard de Estadísticas de Giras.
//
// Salen de voae-reporteria (/giras/registros) en una sola petición. Si
// VITE_API_REPORTERIA no está en .env.local se arman como antes: pidiendo el
// detalle de cada solicitud enviada, con un costo que crece con su cantidad.
// En los dos caminos, una solicitud con varias facultades o finalidades cuenta
// con la primera por nombre, para que siga siendo una sola gira en los totales.
import { apiReporteria } from "./cliente";
import { listarSolicitudes, obtenerSolicitud } from "./giras";
import { etiquetaPeriodo } from "../utils/girasFormato";

export interface RegistroAnalitico {
  id: string;
  /** «2026-09-14», para agrupar por mes. */
  fecha: string;
  año: number | null;
  /** «I Periodo», «II Periodo»… o «Sin período». */
  periodo: string;
  campus: string;
  facultad: string;
  finalidad: string;
  alcance: string;
  /** Código de estado de la solicitud: «Aprobada», «Pendiente»… */
  estado: string;
  destino: string;
  estudiantes: number;
  costo: number;
}

const SIN_PERIODO = "Sin período";

/** Fila tal como la devuelve /giras/registros. */
interface RegistroGiraApi {
  idSolicitud: number;
  fecha: string;
  anioPeriodo: number | null;
  numeroPac: number | null;
  campus: string;
  facultad: string | null;
  finalidad: string | null;
  alcance: string | null;
  estado: string;
  destino: string | null;
  estudiantes: number;
  costo: number;
}

/** «II Periodo 2026» → «II Periodo»: el año ya es otro filtro. */
function periodoSinAnio(anio: number | null, numeroPac: number | null): string {
  const periodo = etiquetaPeriodo(anio, numeroPac);
  return periodo === "—" ? SIN_PERIODO : periodo.replace(/\s\d{4}$/, "");
}

export async function cargarRegistrosAnaliticos(): Promise<RegistroAnalitico[]> {
  if (apiReporteria) {
    const filas = await apiReporteria.get<RegistroGiraApi[]>("/giras/registros");
    return filas.map((f) => ({
      id: `SOL-${f.idSolicitud}`,
      fecha: f.fecha.slice(0, 10),
      año: f.anioPeriodo,
      periodo: periodoSinAnio(f.anioPeriodo, f.numeroPac),
      campus: f.campus,
      facultad: f.facultad ?? "Sin facultad",
      finalidad: f.finalidad ?? "Sin finalidad",
      alcance: f.alcance ?? "Sin alcance",
      estado: f.estado,
      destino: f.destino ?? "Sin destino",
      estudiantes: f.estudiantes,
      costo: Number(f.costo),
    }));
  }

  const solicitudes = await listarSolicitudes({ excluirBorradores: true });
  const detalles = await Promise.all(solicitudes.map((s) => obtenerSolicitud(s.idSolicitud)));

  return solicitudes.map((s, indice) => {
    const detalle = detalles[indice];
    return {
      id: `SOL-${s.idSolicitud}`,
      fecha: (s.fechaSalidaPropuesta ?? s.fechaRegistro).slice(0, 10),
      año: s.anioPeriodo,
      periodo: periodoSinAnio(s.anioPeriodo, s.numeroPac),
      campus: s.nombreCampus,
      facultad: detalle?.facultades[0]?.nombre ?? "Sin facultad",
      finalidad: detalle?.finalidades[0]?.nombre ?? "Sin finalidad",
      alcance: s.nombreAlcance ?? "Sin alcance",
      estado: s.codigoEstado,
      destino: s.destinoGira ?? "Sin destino",
      estudiantes: s.totalAproximadoEstudiantes,
      costo: s.costos,
    };
  });
}
