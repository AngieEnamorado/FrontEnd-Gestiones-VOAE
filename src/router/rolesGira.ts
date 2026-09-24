import type { RolGira } from "../types";
import { navigationItems, RUTA_MODO_GIRAS } from "./navigation";
import type { NavItem } from "./navigation";

/**
 * Qué puede abrir cada rol de Giras, leído de `rolesGira` en `navigation.ts`.
 * Las tarjetas de "Modo de vista", el Sidebar y el guard de rutas salen de esta
 * misma lista, así que no pueden contradecirse.
 */
const menuGiras = navigationItems.find((item) => item.id === "giras")?.children ?? [];

/** Las páginas de Giras que ve `rol`, en el orden del menú. Sin "Modo de vista". */
export function paginasGira(rol: RolGira): NavItem[] {
  return menuGiras.filter((pagina) => pagina.rolesGira?.includes(rol));
}

/**
 * A dónde llevar a quien acaba de cambiar de rol: su primera página. Un rol sin
 * páginas (el administrador, por ahora) se queda en "Modo de vista", que es lo
 * único que puede abrir.
 */
export function rutaInicialGira(rol: RolGira): string {
  return paginasGira(rol)[0]?.path ?? RUTA_MODO_GIRAS;
}

/**
 * Rutas que cuelgan de una página que el rol sí ve, pero que ese rol no abre.
 * El estudiante tiene Mis giras, pero no el roster de inscritos de cada gira
 * (`.../inscripciones`) ni el alta excepcional que cuelga de él
 * (`.../inscripciones/nueva`, el botón "Inscripción Excepcional" que solo usa
 * el jefe de misión). Sí abre el detalle de una inscripción
 * (`.../inscripciones/:id`): es el "Ver detalles" de su propio historial, y
 * esa página verifica por su cuenta que la inscripción sea suya.
 */
const RUTAS_VEDADAS: Partial<Record<RolGira, RegExp[]>> = {
  estudiante: [/^\/giras\/mis-giras\/[^/]+\/inscripciones(\/nueva)?\/?$/],
};

/**
 * Si `rol` puede estar en `ruta`. Cuenta también lo que cuelga de cada página
 * (`/giras/mis-giras/3/resumen` pertenece a `/giras/mis-giras`), porque esas
 * rutas de detalle no son entradas del menú.
 */
export function puedeAbrirRutaGira(rol: RolGira, ruta: string): boolean {
  if (RUTAS_VEDADAS[rol]?.some((patron) => patron.test(ruta))) return false;

  const permitidas = [RUTA_MODO_GIRAS, ...paginasGira(rol).map((pagina) => pagina.path)];
  return permitidas.some((base) => ruta === base || ruta.startsWith(`${base}/`));
}
