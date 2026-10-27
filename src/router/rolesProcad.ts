import type { RolProcad } from "../types";
import { navigationItems } from "./navigation";
import type { NavItem } from "./navigation";

/**
 * Qué puede abrir cada rol de PROCAD, leído de `roles` en `navigation.ts`.
 * El Sidebar, las tarjetas de "Modo de vista" y la guardia de rutas salen de
 * esta misma lista, igual que en Giras (`rolesGira.ts`).
 */
const menuProcad = navigationItems.find((item) => item.id === "procad")?.children ?? [];

export const RUTA_MODO_PROCAD = "/procad/modo";

/** Las páginas de PROCAD que ve `rol`, en el orden del menú. Sin "Modo de vista". */
export function paginasProcad(rol: RolProcad): NavItem[] {
  return menuProcad.filter((pagina) => pagina.path !== RUTA_MODO_PROCAD && (!pagina.roles || pagina.roles.includes(rol)));
}

/** La primera página del rol: a donde se llega al cambiar de rol o con `/procad` a secas. */
export function rutaInicialProcad(rol: RolProcad): string {
  return paginasProcad(rol)[0]?.path ?? RUTA_MODO_PROCAD;
}

/**
 * Si `rol` puede estar en `ruta`. Cuenta lo que cuelga de cada página
 * (`/procad/estadisticas/personalizado` pertenece a `/procad/estadisticas`).
 */
export function puedeAbrirRutaProcad(rol: RolProcad, ruta: string): boolean {
  const permitidas = [RUTA_MODO_PROCAD, ...paginasProcad(rol).map((pagina) => pagina.path)];
  return permitidas.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}
