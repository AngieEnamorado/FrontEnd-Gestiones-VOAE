import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PerfilEstudiante, RolGira, RolProcad, UsuarioActual } from "../types";
import { obtenerEstudianteDeSesion, obtenerUsuarioDeSesion } from "../data/currentUser";

interface ValorUsuario {
  usuario: UsuarioActual;
  /** El estudiante detrás de la vista de Estudiante; ver `obtenerEstudianteDeSesion`. */
  estudiante: PerfilEstudiante;
  /**
   * Cambia el rol de PROCAD de la sesión. Existe solo para poder mostrar la
   * vista de Vicerrectoría mientras no hay backend; cuando la sesión real
   * traiga el rol, esto se elimina junto con el selector del Topbar.
   */
  cambiarRolProcad: (rol: RolProcad) => void;
  /** Igual que `cambiarRolProcad`, pero para el módulo de Giras. */
  cambiarRolGira: (rol: RolGira) => void;
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
  const [estudiante] = useState<PerfilEstudiante>(() => obtenerEstudianteDeSesion());

  const valor = useMemo<ValorUsuario>(
    () => ({
      usuario,
      estudiante,
      cambiarRolProcad: (rolProcad) => setUsuario((previo) => ({ ...previo, rolProcad })),
      cambiarRolGira: (rolGira) => setUsuario((previo) => ({ ...previo, rolGira })),
    }),
    [usuario, estudiante],
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

/** El estudiante de la sesión, para filtrar lo que solo a él le corresponde. */
export function useEstudianteActual(): PerfilEstudiante {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useEstudianteActual debe usarse dentro de <UserProvider>");
  }
  return contexto.estudiante;
}

/** El rol de PROCAD de la sesión, junto con la forma de cambiarlo. */
export function useRolProcad(): { rol: RolProcad; cambiarRol: (rol: RolProcad) => void } {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useRolProcad debe usarse dentro de <UserProvider>");
  }
  return { rol: contexto.usuario.rolProcad, cambiarRol: contexto.cambiarRolProcad };
}

/** El rol con el que se ve Giras, junto con la forma de cambiarlo. */
export function useRolGira(): { rol: RolGira; cambiarRol: (rol: RolGira) => void } {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useRolGira debe usarse dentro de <UserProvider>");
  }
  return { rol: contexto.usuario.rolGira, cambiarRol: contexto.cambiarRolGira };
}
