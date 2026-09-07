import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { UsuarioActual } from "../types";
import { obtenerUsuarioDeSesion } from "../data/currentUser";

const UserContext = createContext<UsuarioActual | null>(null);

/**
 * Provee el usuario actual a toda la app.
 * El Topbar (donde se muestra "ER erin.matute") NO tiene el dato
 * quemado: lo consume desde este contexto, que a su vez lo "jala"
 * de `obtenerUsuarioDeSesion` (hoy mock, mañana una llamada real).
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const usuario = useMemo(() => obtenerUsuarioDeSesion(), []);

  return <UserContext.Provider value={usuario}>{children}</UserContext.Provider>;
}

export function useUsuarioActual(): UsuarioActual {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useUsuarioActual debe usarse dentro de <UserProvider>");
  }
  return contexto;
}
