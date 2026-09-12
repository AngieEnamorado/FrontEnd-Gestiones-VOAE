import { createContext, useCallback, useContext, useMemo, useState } from "react";

/** Una tarjeta que se dibujó alguna vez, con el apartado donde vive. */
export interface TarjetaRegistrada {
  numero: string;
  titulo: string;
  seccion: string;
}

interface ValorVisibilidad {
  /**
   * Orden de las tarjetas, por numero: el del codigo, que es el de la
   * especificacion. Sirve para que una tarjeta devuelta caiga en su sitio de
   * siempre y no al final de la rejilla.
   */
  orden: string[];
  /**
   * Deja `movida` justo delante de `destino`. Solo lo usa el panel lateral: al
   * soltar un widget sobre una tarjeta, se coloca en ese hueco. El boton
   * «Colocar» no pasa por aqui, porque devuelve la tarjeta a su sitio original.
   */
  reordenar: (movida: string, destino: string) => void;
  posicionDe: (numero: string) => number;
  /** Apartado que se está viendo: con él se etiqueta cada tarjeta al registrarse. */
  seccionActiva: string;
  ocultas: string[];
  catalogo: TarjetaRegistrada[];
  registrar: (tarjeta: TarjetaRegistrada) => void;
  ocultar: (numero: string) => void;
  mostrar: (numero: string) => void;
  mostrarTodas: () => void;
  estaOculta: (numero: string) => boolean;
}

/**
 * Qué tarjetas se están viendo en el panel de estadísticas.
 *
 * El estado vive aquí, en la página, y no en `localStorage` ni en el contexto
 * global de PROCAD: es deliberado que al recargar o al volver a entrar
 * reaparezcan todas. Quitar una tarjeta sirve para despejar la pantalla en el
 * momento —o para exportar un PDF con solo lo que interesa—, no para
 * configurarse una vista propia; el reporte oficial siempre vuelve a estar
 * completo por defecto.
 *
 * El valor por defecto no hace nada, para que una tarjeta usada fuera de esta
 * página siga funcionando en vez de reventar.
 */
const ContextoVisibilidad = createContext<ValorVisibilidad>({
  orden: [],
  reordenar: () => {},
  posicionDe: () => 0,
  seccionActiva: "",
  ocultas: [],
  catalogo: [],
  registrar: () => {},
  ocultar: () => {},
  mostrar: () => {},
  mostrarTodas: () => {},
  estaOculta: () => false,
});

export function useVisibilidadTarjetas() {
  return useContext(ContextoVisibilidad);
}

export function ProveedorVisibilidad({
  seccionActiva,
  children,
}: {
  seccionActiva: string;
  children: React.ReactNode;
}) {
  const [ocultas, setOcultas] = useState<string[]>([]);
  const [catalogo, setCatalogo] = useState<TarjetaRegistrada[]>([]);
  const [orden, setOrden] = useState<string[]>([]);

  // El catálogo se llena solo, según se van visitando los apartados. No hace
  // falta tenerlo completo de antemano: una tarjeta que nadie ha visto todavía
  // está visible por definición, que es el estado por defecto.
  const registrar = useCallback((tarjeta: TarjetaRegistrada) => {
    setCatalogo((previo) =>
      previo.some((t) => t.numero === tarjeta.numero) ? previo : [...previo, tarjeta],
    );
    // El orden arranca siendo el del codigo: cada tarjeta se anota al final
    // segun se dibuja, y solo cambia si alguien la arrastra.
    setOrden((previo) => (previo.includes(tarjeta.numero) ? previo : [...previo, tarjeta.numero]));
  }, []);


  const reordenar = useCallback((movida: string, destino: string) => {
    if (movida === destino) return;
    setOrden((previo) => {
      const sin = previo.filter((n) => n !== movida);
      const i = sin.indexOf(destino);
      if (i === -1) return previo;
      return [...sin.slice(0, i), movida, ...sin.slice(i)];
    });
  }, []);

  const valor = useMemo<ValorVisibilidad>(
    () => ({
      seccionActiva,
      ocultas,
      catalogo,
      orden,
      registrar,
      reordenar,
      posicionDe: (numero) => {
        const i = orden.indexOf(numero);
        return i === -1 ? 999 : i;
      },
      ocultar: (numero) => setOcultas((previo) => [...previo, numero]),
      mostrar: (numero) => setOcultas((previo) => previo.filter((n) => n !== numero)),
      mostrarTodas: () => setOcultas([]),
      estaOculta: (numero) => ocultas.includes(numero),
    }),
    [seccionActiva, ocultas, catalogo, orden, registrar, reordenar],
  );

  return <ContextoVisibilidad.Provider value={valor}>{children}</ContextoVisibilidad.Provider>;
}
