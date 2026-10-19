import { useSyncExternalStore } from "react";

/**
 * Rol de prueba del panel administrativo de Voluntariado.
 *
 * No hay sesión todavía: quien usa el panel elige si actúa como
 * Administrador (ve todo el país) o como Enlace VOAE de un campus (ve y
 * dictamina solo lo de su campus). Se recuerda en el navegador y lo leen
 * todas las pantallas del admin. Cuando exista sesión real, rol y campus salen
 * de ella y el selector se borra; las pantallas no cambian.
 *
 * Ojo: es un filtro de pantalla, no seguridad. La API no sabe quién llama.
 */
export interface RolAdmin {
  rol: "admin" | "enlace";
  idCampus: number;
  nombreCampus: string;
}

const CLAVE = "voluntariado.rolAdminPrueba";
const POR_DEFECTO: RolAdmin = { rol: "admin", idCampus: 1, nombreCampus: "Ciudad Universitaria" };

function leer(): RolAdmin {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Partial<RolAdmin> | null;
    if (
      guardado &&
      (guardado.rol === "admin" || guardado.rol === "enlace") &&
      Number.isInteger(guardado.idCampus) &&
      typeof guardado.nombreCampus === "string"
    ) {
      return guardado as RolAdmin;
    }
  } catch {
    // Sin almacenamiento o dato dañado: se usa el de por defecto.
  }
  return POR_DEFECTO;
}

let actual = leer();
const suscriptores = new Set<() => void>();

export function fijarRolAdmin(nuevo: RolAdmin): void {
  actual = nuevo;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    // Modo privado: la elección dura lo que la pestaña.
  }
  suscriptores.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  suscriptores.add(avisar);
  return () => suscriptores.delete(avisar);
}

/** Separa "Ciudad Universitaria, Centro Universitario Regional Norte" en nombres. */
const nombres = (texto: string | null | undefined) => (texto ?? "").split(",").map((n) => n.trim()).filter(Boolean);

export function useRolAdminVoluntariado() {
  const rol = useSyncExternalStore(suscribir, () => actual);
  const esEnlace = rol.rol === "enlace";
  return {
    ...rol,
    esEnlace,
    /** Si el registro, por nombre(s) de campus, le toca a quien usa el panel. */
    veCampus: (campus: string | null | undefined) => !esEnlace || nombres(campus).includes(rol.nombreCampus),
    /** Igual, por id de campus. */
    veIdCampus: (idCampus: number | null | undefined) => !esEnlace || idCampus === rol.idCampus,
    /** Igual, por la lista "1,3" que trae un grupo que opera en varios campus. */
    veIdsCampus: (ids: string | null | undefined) =>
      !esEnlace || (ids ?? "").split(",").map(Number).includes(rol.idCampus),
  };
}
