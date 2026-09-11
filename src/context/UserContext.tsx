import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { RolProcad, UsuarioActual } from "../types";
import { obtenerUsuarioDeSesion } from "../data/currentUser";

interface ValorUsuario {
  usuario: UsuarioActual;
  /**
   * Cambia el rol de PROCAD de la sesión. Existe solo para poder mostrar la
   * vista de Vicerrectoría mientras no hay backend; cuando la sesión real
   * traiga el rol, esto se elimina junto con el selector del Topbar.
   */
  cambiarRolProcad: (rol: RolProcad) => void;
}

const UserContext = createContext<ValorUsuario | null>(null);

/**
 * Provee el usuario actual a toda la app.
 * El Topbar (donde se muestra "ER erin.matute") NO tiene el dato
 * quemado: lo consume desde este contexto, que a su vez lo "jala"
 * de `obtenerUsuarioDeSesion` (hoy mock, mañana una llamada real).
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual>(() => obtenerUsuarioDeSesion());

  const valor = useMemo<ValorUsuario>(
    () => ({
      usuario,
      cambiarRolProcad: (rolProcad) => setUsuario((previo) => ({ ...previo, rolProcad })),
    }),
    [usuario],
  );

  return <UserContext.Provider value={valor}>{children}</UserContext.Provider>;
}

export function useUsuarioActual(): UsuarioActual {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useUsuarioActual debe usarse dentro de <UserProvider>");
  }
  return contexto.usuario;
}

/** El rol de PROCAD de la sesión, junto con la forma de cambiarlo. */
export function useRolProcad(): { rol: RolProcad; cambiarRol: (rol: RolProcad) => void } {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useRolProcad debe usarse dentro de <UserProvider>");
  }
  return { rol: contexto.usuario.rolProcad, cambiarRol: contexto.cambiarRolProcad };
}
