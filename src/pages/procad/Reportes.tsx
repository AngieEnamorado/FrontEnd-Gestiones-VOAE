import { useState } from "react";
import LayoutModulo from "./LayoutModulo";
import Auditoria from "./modulos/Auditoria";
import TablaReportes from "./modulos/TablaReportes";

type Pestana = "reportes" | "auditoria";

/**
 * Las dos formas de llevarse los datos fuera del sistema: el reporte que se
 * adjunta a un oficio, y el historial de quién decidió qué.
 */
export default function ReportesProcad() {
  const [activa, setActiva] = useState<Pestana>("reportes");

  return (
    <LayoutModulo
      titulo="Reportes"
      descripcion="Reportes globales por agrupación, campus y período, y el historial completo de las decisiones tomadas en el panel."
      nombre="reportes"
      activa={activa}
      onCambiar={setActiva}
      pestanas={[
        { id: "reportes", label: "Reportes" },
        { id: "auditoria", label: "Auditoría" },
      ]}
    >
      {activa === "reportes" && <TablaReportes />}
      {activa === "auditoria" && <Auditoria />}
    </LayoutModulo>
  );
}
