import { useState } from "react";
import DialogoConfirmacion, { type Dialogo } from "../../components/procad/DialogoConfirmacion";
import LayoutModulo from "./LayoutModulo";
import Condicionados from "./modulos/Condicionados";
import Expulsiones from "./modulos/Expulsiones";
import MatriculaExcepcional from "./modulos/MatriculaExcepcional";
import Solicitudes from "./modulos/Solicitudes";
import Verificacion from "./modulos/Verificacion";
import { useProcad } from "../../context/ProcadContext";

type Pestana =
  | "solicitudes"
  | "condicionados"
  | "expulsiones"
  | "matricula"
  | "verificacion";

/**
 * Todo lo que el administrador resuelve sobre un estudiante: su ingreso, las
 * excepciones, su salida, y los documentos que lo acreditan. Están juntas
 * porque son la misma conversación sobre la misma persona.
 */
export default function EstudiantesProcad() {
  const { pendientes } = useProcad();
  const [activa, setActiva] = useState<Pestana>("solicitudes");
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const listaPendientes: string[] = [];
  if (pendientes.solicitudes > 0) {
    listaPendientes.push(
      `${pendientes.solicitudes} solicitud(es) pendiente(s) de revisión.`,
    );
  }
  if (pendientes.condicionados > 0) {
    listaPendientes.push(
      `${pendientes.condicionados} propuesta(s) de condicionado esperando su autorización.`,
    );
  }
  if (pendientes.expulsiones > 0) {
    listaPendientes.push(`${pendientes.expulsiones} solicitud(es) de expulsión sin resolver.`);
  }

  return (
    <>
      <LayoutModulo
        titulo="Estudiantes"
        descripcion="Resuelva solicitudes de ingreso de cualquier campus, autorice excepciones de talento, y decida sobre expulsiones."
        nombre="estudiantes"
        activa={activa}
        onCambiar={setActiva}
        pendientes={listaPendientes}
        mensajeSinPendientes="No hay casos de estudiantes esperando su decisión."
        pestanas={[
          { id: "solicitudes", label: "Solicitudes", pendientes: pendientes.solicitudes },
          { id: "condicionados", label: "Condicionados", pendientes: pendientes.condicionados },
          { id: "expulsiones", label: "Expulsiones", pendientes: pendientes.expulsiones },
          { id: "matricula", label: "Matrícula excepcional" },
          { id: "verificacion", label: "Verificación" },
        ]}
      >
        {activa === "solicitudes" && <Solicitudes abrirDialogo={setDialogo} />}
        {activa === "condicionados" && <Condicionados abrirDialogo={setDialogo} />}
        {activa === "expulsiones" && <Expulsiones abrirDialogo={setDialogo} />}
        {activa === "matricula" && <MatriculaExcepcional abrirDialogo={setDialogo} />}
        {activa === "verificacion" && <Verificacion />}
      </LayoutModulo>

      <DialogoConfirmacion dialogo={dialogo} onCerrar={() => setDialogo(null)} />
    </>
  );
}
