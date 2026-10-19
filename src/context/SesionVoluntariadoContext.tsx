import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { voluntariadoApi, type PersonaVoluntariadoApi, type ResumenPersonaApi } from "../api/voluntariado";
import { useApi } from "../utils/useApi";
import EstadoCarga from "../components/voluntariado/EstadoCarga";

/**
 * Estudiante "de sesión" del Portal Estudiante.
 *
 * No hay autenticación todavía, así que la persona se elige con un selector
 * de prueba (ver SelectorEstudiantePrueba) y se recuerda en el navegador.
 * Cuando exista sesión real, `idPersona` sale de ahí y el selector se borra;
 * las pantallas no cambian porque solo consumen este contexto.
 */
interface ValorSesion {
  idPersona: number;
  persona: ResumenPersonaApi;
  personasDePrueba: PersonaVoluntariadoApi[];
  cambiarPersona: (idPersona: number) => void;
  /** Vuelve a leer grupos y horas de la persona, p. ej. tras unirse a un grupo. */
  recargarPersona: () => void;
  /** Grupo que coordina, si coordina alguno. */
  grupoCoordinado: ResumenPersonaApi["grupos"][number] | undefined;
}

const SesionVoluntariadoContext = createContext<ValorSesion | null>(null);

const CLAVE_ALMACEN = "voluntariado.idPersonaPrueba";

function leerGuardada(): number | null {
  try {
    const valor = Number(localStorage.getItem(CLAVE_ALMACEN));
    return Number.isInteger(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
}

export function SesionVoluntariadoProvider({ children }: { children: ReactNode }) {
  const personas = useApi(() => voluntariadoApi.personas(), []);
  const [elegida, setElegida] = useState<number | null>(leerGuardada);

  // La lista solo llena el selector de prueba: si ya hay una persona guardada,
  // su resumen se pide de inmediato, sin esperarla. Cuando la lista llega y la
  // guardada ya no existe (p. ej. se limpió la semilla), cae en la primera, que
  // la API ordena con los coordinadores primero.
  const idPersona = useMemo(() => {
    const lista = personas.datos;
    if (!lista) return elegida;
    if (elegida && lista.some((p) => p.idPersona === elegida)) return elegida;
    return lista[0]?.idPersona ?? null;
  }, [personas.datos, elegida]);

  const resumen = useApi(
    () => (idPersona ? voluntariadoApi.persona(idPersona) : Promise.resolve(undefined)),
    [idPersona],
  );

  const cambiarPersona = useCallback((id: number) => {
    setElegida(id);
    try {
      localStorage.setItem(CLAVE_ALMACEN, String(id));
    } catch {
      // Sin almacenamiento (modo privado): la elección dura lo que la pestaña.
    }
  }, []);

  const persona = resumen.datos;
  const valor = useMemo<ValorSesion | null>(
    () =>
      idPersona && persona
        ? {
            idPersona,
            persona,
            personasDePrueba: personas.datos ?? [],
            cambiarPersona,
            recargarPersona: resumen.recargar,
            grupoCoordinado: persona.grupos.find((g) => g.esCoordinador === 1),
          }
        : null,
    [idPersona, persona, personas.datos, cambiarPersona, resumen.recargar],
  );

  if (personas.datos && personas.datos.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-slate-500">
        No hay estudiantes con actividad en Voluntariado. Carga la semilla de prueba
        (pruebas-api/semilla-voluntariado.mjs) o crea un grupo desde el panel.
      </p>
    );
  }

  // Un error del resumen mientras la lista no ha llegado puede ser una persona
  // guardada que ya no existe: se espera a la lista, que elige otra. La lista
  // solo bloquea si falla sin que haya persona que mostrar.
  const esperandoLista = personas.datos === undefined && personas.error === null;
  const error = resumen.error && !esperandoLista ? resumen.error : !persona ? personas.error : null;

  return (
    <EstadoCarga
      cargando={resumen.cargando || (resumen.error !== null && esperandoLista) || (!idPersona && personas.cargando)}
      error={error}
      onReintentar={() => {
        personas.recargar();
        resumen.recargar();
      }}
      listo={valor !== null}
    >
      {valor && <SesionVoluntariadoContext.Provider value={valor}>{children}</SesionVoluntariadoContext.Provider>}
    </EstadoCarga>
  );
}

export function useSesionVoluntariado(): ValorSesion {
  const contexto = useContext(SesionVoluntariadoContext);
  if (!contexto) {
    throw new Error("useSesionVoluntariado debe usarse dentro de <SesionVoluntariadoProvider>");
  }
  return contexto;
}
