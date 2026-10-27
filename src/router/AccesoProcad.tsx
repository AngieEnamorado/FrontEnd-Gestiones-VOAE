import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRolProcad } from "../context/UserContext";
import { puedeAbrirRutaProcad, rutaInicialProcad } from "./rolesProcad";

/**
 * Envuelve todas las rutas de `/procad`. Ocultar una página del menú no basta:
 * alguien puede llegar por la URL directa o un enlace guardado, así que aquí
 * se comprueba la ruta contra el rol y, si no le toca, se le devuelve a su
 * primera página. También resuelve `/procad` a secas, que no es una página.
 */
export default function AccesoProcad() {
  const { rol } = useRolProcad();
  const { pathname } = useLocation();

  if (!puedeAbrirRutaProcad(rol, pathname)) {
    return <Navigate to={rutaInicialProcad(rol)} replace />;
  }

  return <Outlet />;
}
