import type { InformeTrimestral } from "../types";

export const informesTrimestrales: InformeTrimestral[] = [
  {
    id: "inf-manos-t2",
    trimestreId: "2026-t2",
    grupoId: "manos-que-ayudan",
    estado: "EN CAPTURA",
    saldoAnterior: 850,
    movimientos: [
      { id: "mov-1", descripcion: "Aporte institucional VOAE", monto: 900, tipo: "ingreso", responsable: "Ana Sofía Martínez", tipoComprobante: "Transferencia" },
      { id: "mov-2", descripcion: "Materiales didácticos tutorías", monto: 535, tipo: "egreso", responsable: "Jorge Pineda", tipoComprobante: "Factura" },
    ],
    actividadesIds: ["act-tutorias-marzo", "act-feria-salud-mayo"],
  },
  {
    id: "inf-eco-t2",
    trimestreId: "2026-t2",
    grupoId: "ecounah",
    estado: "ENVIADO",
    saldoAnterior: 400,
    movimientos: [
      { id: "mov-3", descripcion: "Donación vivero municipal", monto: 300, tipo: "ingreso", responsable: "Luis Mejía", tipoComprobante: "Recibo" },
      { id: "mov-4", descripcion: "Transporte de plantones", monto: 180, tipo: "egreso", responsable: "Paola Ferrufino", tipoComprobante: "Factura" },
    ],
    actividadesIds: ["act-reforestacion-abril", "act-reciclaje-junio"],
  },
  {
    id: "inf-brigada-t2",
    trimestreId: "2026-t2",
    grupoId: "brigada-de-salud",
    estado: "OBSERVADO",
    observaciones:
      "Falta adjuntar el comprobante del egreso de medicamentos y detallar el número de pacientes atendidos por jornada.",
    saldoAnterior: 1200,
    movimientos: [
      { id: "mov-5", descripcion: "Donación laboratorio local", monto: 600, tipo: "ingreso", responsable: "Gabriela Cáceres", tipoComprobante: "Recibo" },
      { id: "mov-6", descripcion: "Compra de medicamentos básicos", monto: 740, tipo: "egreso", responsable: "Alexander Cálix", tipoComprobante: "Factura" },
    ],
    actividadesIds: ["act-feria-salud-mayo"],
  },
];

export function informePorId(id: string): InformeTrimestral | undefined {
  return informesTrimestrales.find((i) => i.id === id);
}
