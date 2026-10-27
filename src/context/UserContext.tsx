import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { IdentidadProcad, PerfilEstudiante, RolGira, RolProcad, UsuarioActual } from "../types";
import type { UsuarioUnidadGira } from "../types/giras";
import { obtenerUsuarioDeSesion } from "../data/currentUser";
import { fijarUsuarioDeAuditoria } from "../api/cliente";

/** Con quién se actúa en cada rol de Giras: un usuario-unidad real de la base de datos. */
type IdentidadesGira = Partial<Record<RolGira, UsuarioUnidadGira>>;

/** Lo mismo para PROCAD: con qué persona de la base se actúa en cada rol. */
type IdentidadesProcad = Partial<Record<RolProcad, IdentidadProcad>>;

const CLAVE_IDENTIDADES = "voae.giras.identidades";
const CLAVE_IDENTIDADES_PROCAD = "voae.procad.identidades";
/** El rol de PROCAD sí se recuerda: probar que algo quedó en la base obliga a recargar. */
const CLAVE_ROL_PROCAD = "voae.procad.rol";
const ROLES_PROCAD: readonly RolProcad[] = ["administrador", "vicerrector", "director", "estudiante"];

function leerRolProcad(porDefecto: RolProcad): RolProcad {
  try {
    const guardado = localStorage.getItem(CLAVE_ROL_PROCAD) as RolProcad | null;
    return guardado && ROLES_PROCAD.includes(guardado) ? guardado : porDefecto;
  } catch {
    return porDefecto;
  }
}

function leerGuardado<T extends object>(clave: string): T {
  try {
    const texto = localStorage.getItem(clave);
    return texto ? (JSON.parse(texto) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

function guardar(clave: string, valor: object) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento (modo privado): la elección dura lo que dure la pestaña.
  }
}

interface ValorUsuario {
  usuario: UsuarioActual;
  identidades: IdentidadesGira;
  identidadesProcad: IdentidadesProcad;
  /**
   * Cambia el rol de PROCAD de la sesión. Existe solo para poder mostrar la
   * vista de Vicerrectoría mientras no hay backend; cuando la sesión real
   * traiga el rol, esto se elimina junto con el selector del Topbar.
   */
  cambiarRolProcad: (rol: RolProcad) => void;
  /** Igual que `cambiarRolProcad`, pero para el módulo de Giras. */
  cambiarRolGira: (rol: RolGira) => void;
  /** Elige (o quita, con null) con qué usuario de la base se actúa en un rol de Giras. */
  elegirIdentidadGira: (rol: RolGira, usuario: UsuarioUnidadGira | null) => void;
  /** Igual, para PROCAD: con qué persona de la base se actúa en un rol. */
  elegirIdentidadProcad: (rol: RolProcad, persona: IdentidadProcad | null) => void;
}

const UserContext = createContext<ValorUsuario | null>(null);

/**
 * Provee el usuario actual a toda la app.
 * El Topbar (donde se muestra "ER erin.matute") NO tiene el dato
 * quemado: lo consume desde este contexto, que a su vez lo "jala"
 * de `obtenerUsuarioDeSesion` (hoy mock, mañana una llamada real).
 *
 * Giras ya habla con la API, pero todavía no hay sesión: quien usa el sistema
 * elige, en "Modo de vista", con qué usuario de la base actúa en cada rol.
 * Cuando exista la sesión real, `identidades` y `elegirIdentidadGira` se borran.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual>(() => {
    const sesion = obtenerUsuarioDeSesion();
    return { ...sesion, rolProcad: leerRolProcad(sesion.rolProcad) };
  });
  const [identidades, setIdentidades] = useState<IdentidadesGira>(() =>
    leerGuardado<IdentidadesGira>(CLAVE_IDENTIDADES),
  );
  const [identidadesProcad, setIdentidadesProcad] = useState<IdentidadesProcad>(() =>
    leerGuardado<IdentidadesProcad>(CLAVE_IDENTIDADES_PROCAD),
  );

  const identidadActual = identidades[usuario.rolGira];

  // Las columnas de auditoría de la base (usuarioRegistro) guardan a quién se encarna.
  useEffect(() => {
    fijarUsuarioDeAuditoria(identidadActual?.correoPersona ?? identidadActual?.nombreCompleto ?? null);
  }, [identidadActual]);

  const valor = useMemo<ValorUsuario>(
    () => ({
      usuario,
      identidades,
      identidadesProcad,
      cambiarRolProcad: (rolProcad) => {
        try {
          localStorage.setItem(CLAVE_ROL_PROCAD, rolProcad);
        } catch {
          // Sin almacenamiento: el rol dura lo que dure la pestaña.
        }
        setUsuario((previo) => ({ ...previo, rolProcad }));
      },
      cambiarRolGira: (rolGira) => setUsuario((previo) => ({ ...previo, rolGira })),
      elegirIdentidadGira: (rol, elegido) =>
        setIdentidades((previas) => {
          const siguientes = { ...previas };
          if (elegido) siguientes[rol] = elegido;
          else delete siguientes[rol];
          guardar(CLAVE_IDENTIDADES, siguientes);
          return siguientes;
        }),
      elegirIdentidadProcad: (rol, elegida) =>
        setIdentidadesProcad((previas) => {
          const siguientes = { ...previas };
          if (elegida) siguientes[rol] = elegida;
          else delete siguientes[rol];
          guardar(CLAVE_IDENTIDADES_PROCAD, siguientes);
          return siguientes;
        }),
    }),
    [usuario, identidades, identidadesProcad],
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

/**
 * El usuario de la base con el que se actúa en el rol de Giras vigente, o null
 * si todavía no se eligió ninguno. Sus `idUsuarioUnidad` son los ids que la API
 * pide como jefe de misión, jefe de aprobación o viajero.
 */
export function useIdentidadGira(): UsuarioUnidadGira | null {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useIdentidadGira debe usarse dentro de <UserProvider>");
  }
  return contexto.identidades[contexto.usuario.rolGira] ?? null;
}

/** Todas las identidades elegidas y la forma de cambiarlas; lo usa "Modo de vista". */
export function useIdentidadesGira(): {
  identidades: IdentidadesGira;
  elegir: (rol: RolGira, usuario: UsuarioUnidadGira | null) => void;
} {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useIdentidadesGira debe usarse dentro de <UserProvider>");
  }
  return { identidades: contexto.identidades, elegir: contexto.elegirIdentidadGira };
}

/** El estudiante con el que se actúa (rol Estudiante), o null si no se eligió. */
export function useEstudianteActual(): PerfilEstudiante | null {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useEstudianteActual debe usarse dentro de <UserProvider>");
  }
  const estudiante = contexto.identidades.estudiante;
  if (!estudiante?.numeroCuenta) return null;
  return { nombreCompleto: estudiante.nombreCompleto, numeroCuenta: estudiante.numeroCuenta };
}

/** El rol de PROCAD de la sesión, junto con la forma de cambiarlo. */
export function useRolProcad(): { rol: RolProcad; cambiarRol: (rol: RolProcad) => void } {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useRolProcad debe usarse dentro de <UserProvider>");
  }
  return { rol: contexto.usuario.rolProcad, cambiarRol: contexto.cambiarRolProcad };
}

/**
 * La persona de la base con la que se actúa en el rol de PROCAD vigente, o
 * null si no se eligió. Hoy solo el director la necesita: el administrador
 * firma con VITE_PROCAD_ID_PERSONA.
 */
export function useIdentidadProcad(): IdentidadProcad | null {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useIdentidadProcad debe usarse dentro de <UserProvider>");
  }
  return contexto.identidadesProcad[contexto.usuario.rolProcad] ?? null;
}

/** Las identidades de PROCAD elegidas y la forma de cambiarlas; lo usa "Modo de vista". */
export function useIdentidadesProcad(): {
  identidades: IdentidadesProcad;
  elegir: (rol: RolProcad, persona: IdentidadProcad | null) => void;
} {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useIdentidadesProcad debe usarse dentro de <UserProvider>");
  }
  return { identidades: contexto.identidadesProcad, elegir: contexto.elegirIdentidadProcad };
}

/** El rol con el que se ve Giras, junto con la forma de cambiarlo. */
export function useRolGira(): { rol: RolGira; cambiarRol: (rol: RolGira) => void } {
  const contexto = useContext(UserContext);
  if (!contexto) {
    throw new Error("useRolGira debe usarse dentro de <UserProvider>");
  }
  return { rol: contexto.usuario.rolGira, cambiarRol: contexto.cambiarRolGira };
}
