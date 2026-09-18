import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRolGira } from "../context/UserContext";
import { puedeAbrirRutaGira, rutaInicialGira } from "./rolesGira";

/**
 * Envuelve todas las rutas de `/giras`. Ocultar una página del menú no basta:
 * alguien llega por una URL directa o un enlace guardado, así que aquí se
 * comprueba la ruta contra el rol y, si no le toca, se le devuelve a su
 * primera página. También resuelve `/giras` a secas, que no es una página.
 */
export default function AccesoGiras() {
  const { rol } = useRolGira();
  const { pathname } = useLocation();

  if (!puedeAbrirRutaGira(rol, pathname)) {
    return <Navigate to={rutaInicialGira(rol)} replace />;
  }

  return <Outlet />;
}
