import { useState } from "react";
import DialogoConfirmacion, { type Dialogo } from "../../components/procad/DialogoConfirmacion";
import LayoutModulo from "./LayoutModulo";
import Accesos from "./modulos/Accesos";
import Catalogos from "./modulos/Catalogos";
import Usuarios from "./modulos/Usuarios";

type Pestana = "catalogos" | "usuarios" | "accesos";

/**
 * Lo que define las reglas del programa antes de que nadie se inscriba: qué
 * existe, quién entra y cuándo se puede.
 */
export default function ConfiguracionProcad() {
  const [activa, setActiva] = useState<Pestana>("catalogos");
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  return (
    <>
      <LayoutModulo
        titulo="Configuración"
        descripcion="Catálogos institucionales, cuentas de la plataforma, y el control de quién accede al panel y durante qué período se reciben solicitudes."
        nombre="configuracion"
        activa={activa}
        onCambiar={setActiva}
        pestanas={[
          { id: "catalogos", label: "Catálogos" },
          { id: "usuarios", label: "Usuarios" },
          { id: "accesos", label: "Accesos y períodos" },
        ]}
      >
        {activa === "catalogos" && <Catalogos />}
        {activa === "usuarios" && <Usuarios />}
        {activa === "accesos" && <Accesos abrirDialogo={setDialogo} />}
      </LayoutModulo>

      <DialogoConfirmacion dialogo={dialogo} onCerrar={() => setDialogo(null)} />
    </>
  );
}
