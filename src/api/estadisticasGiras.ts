// Los registros "planos" que alimentan el dashboard de Estadísticas de Giras,
// armados a partir de las solicitudes reales.
//
// Es un arreglo provisional: lo correcto es que el servidor entregue los datos
// ya agregados (voae-reporteria, todavía sin implementar). Mientras tanto se
// pide el detalle de cada solicitud enviada, así que el costo crece con su
// cantidad. Una solicitud puede tener varias facultades o finalidades; aquí
// cuenta con la primera, para que cada solicitud siga siendo una sola gira en
// los totales.
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

export async function cargarRegistrosAnaliticos(): Promise<RegistroAnalitico[]> {
  const solicitudes = await listarSolicitudes({ excluirBorradores: true });
  const detalles = await Promise.all(solicitudes.map((s) => obtenerSolicitud(s.idSolicitud)));

  return solicitudes.map((s, indice) => {
    const detalle = detalles[indice];
    const periodo = etiquetaPeriodo(s.anioPeriodo, s.numeroPac);
    return {
      id: `SOL-${s.idSolicitud}`,
      fecha: (s.fechaSalidaPropuesta ?? s.fechaRegistro).slice(0, 10),
      año: s.anioPeriodo,
      // «II Periodo 2026» → «II Periodo»: el año ya es otro filtro.
      periodo: periodo === "—" ? SIN_PERIODO : periodo.replace(/\s\d{4}$/, ""),
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
