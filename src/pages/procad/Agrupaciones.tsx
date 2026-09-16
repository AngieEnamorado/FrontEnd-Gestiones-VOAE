import { useState } from "react";
import DialogoConfirmacion, { type Dialogo } from "../../components/procad/DialogoConfirmacion";
import LayoutModulo from "./LayoutModulo";
import Actividades from "./modulos/Actividades";
import ListaAgrupaciones from "./modulos/ListaAgrupaciones";
import Visorias from "./modulos/Visorias";
import { useProcad } from "../../context/ProcadContext";

type Pestana = "agrupaciones" | "actividades" | "visorias";

/**
 * La vida de las agrupaciones: quiénes son, qué hicieron y a quién van a
 * probar. Validar una actividad aquí cambia las cifras de elegibilidad que
 * muestra el panel de estadísticas.
 */
export default function AgrupacionesProcad() {
  const { pendientes } = useProcad();
  const [activa, setActiva] = useState<Pestana>("agrupaciones");
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const listaPendientes: string[] = [];
  if (pendientes.actividades > 0) {
    listaPendientes.push(`${pendientes.actividades} actividad(es) pendiente(s) de validar.`);
  }
  if (pendientes.visorias > 0) {
    listaPendientes.push(`${pendientes.visorias} visoría(s) en borrador, sin programar.`);
  }

  return (
    <>
      <LayoutModulo
        titulo="Agrupaciones"
        descripcion="El catálogo de agrupaciones activas, las actividades que reportan sus encargados y el calendario de visorías del período."
        nombre="agrupaciones"
        activa={activa}
        onCambiar={setActiva}
        pendientes={listaPendientes}
        mensajeSinPendientes="No hay actividades ni visorías esperando su decisión."
        pestanas={[
          { id: "agrupaciones", label: "Agrupaciones" },
          { id: "actividades", label: "Actividades", pendientes: pendientes.actividades },
          { id: "visorias", label: "Visorías", pendientes: pendientes.visorias },
        ]}
      >
        {activa === "agrupaciones" && <ListaAgrupaciones />}
        {activa === "actividades" && <Actividades abrirDialogo={setDialogo} />}
        {activa === "visorias" && <Visorias abrirDialogo={setDialogo} />}
      </LayoutModulo>

      <DialogoConfirmacion dialogo={dialogo} onCerrar={() => setDialogo(null)} />
    </>
  );
}
