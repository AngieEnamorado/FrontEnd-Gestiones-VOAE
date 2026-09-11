import { Navigate } from "react-router-dom";
import { useRolProcad } from "../context/UserContext";

/**
 * Los módulos de gestión de PROCAD son del administrador. Ocultarlos del menú
 * no basta: alguien puede llegar por la URL directa o por un enlace guardado,
 * así que la ruta también se defiende y devuelve a lo único que Vicerrectoría
 * sí consulta.
 */
export default function SoloAdministrador({ children }: { children: React.ReactNode }) {
  const { rol } = useRolProcad();

  if (rol !== "administrador") {
    return <Navigate to="/procad/estadisticas" replace />;
  }

  return <>{children}</>;
}
