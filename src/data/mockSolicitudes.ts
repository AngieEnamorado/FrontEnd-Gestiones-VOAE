import type { EstadisticaSolicitudes, Solicitud } from "../types";

// Datos de ejemplo para poblar la tabla de "Solicitudes" y las tarjetas
// de resumen, replicando el caso visto en el sistema real de Becas VOAE.
export const solicitudes: Solicitud[] = [
  {
    id: 1,
    numeroCuenta: "9311280",
    nombreEstudiante: "VLADIMIR HUMBERTO PINEDA AGUILAR",
    becaSolicitada: "EXCELENCIA ACADEMICA CATEGORIA A",
    becaAprobada: null,
    carrera: "INGENIERIA ELECTRICA INDUSTRIAL",
    centro: "CIUDAD UNIVERSITARIA",
    categoria: "Beca Académica UNAH",
    tipoBeca: "academica",
    estado: "PENDIENTE",
  },
];

// Totales del panel superior. En una app conectada a datos reales estos
// valores vendrían agregados desde el backend; aquí quedan fijos para
// coincidir con la captura de referencia.
export const estadisticasSolicitudes: EstadisticaSolicitudes[] = [
  { key: "total", label: "Total", valor: 7622 },
  { key: "aprobadas", label: "Aprobadas", valor: 1860 },
  { key: "pendientes", label: "Pendientes", valor: 5158 },
  { key: "en-revision", label: "En revisión", valor: 83 },
  { key: "espera-social", label: "Espera Inf. Social", valor: 347 },
  { key: "rechazadas", label: "Rechazadas", valor: 174 },
];
