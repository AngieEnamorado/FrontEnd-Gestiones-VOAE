import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { NUMEROS_TARJETAS } from "./secciones/catalogoTarjetas";

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
   * Coloca `movida` junto a `destino`. Con `donde` en «auto» el lado lo decide
   * el sentido del movimiento; los espacios vacíos de la rejilla lo mandan
   * explícito, porque un hueco está en un sitio concreto de la fila. El botón
   * «Colocar» no pasa por aquí: devuelve la tarjeta a su sitio original.
   */
  reordenar: (movida: string, destino: string, donde?: "antes" | "despues" | "auto") => void;
  posicionDe: (numero: string) => number;
  /** Apartado que se está viendo: con él se etiqueta cada tarjeta al registrarse. */
  seccionActiva: string;
  ocultas: string[];
  catalogo: TarjetaRegistrada[];
  /**
   * En el reporte personalizado las tarjetas no se quitan ni se arrastran: lo
   * que sale ahí ya se eligió en el armador, y para cambiarlo se vuelve a él.
   */
  soloLectura: boolean;
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
  soloLectura: false,
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
  ocultasIniciales = [],
  soloLectura = false,
  children,
}: {
  seccionActiva: string;
  /**
   * Con qué tarjetas arranca escondidas. El panel no pasa ninguna —empieza
   * completo— y el reporte personalizado pasa todas las que no se eligieron,
   * que es como dibuja una selección con las mismas secciones de siempre.
   */
  ocultasIniciales?: string[];
  soloLectura?: boolean;
  children: React.ReactNode;
}) {
  const [ocultas, setOcultas] = useState<string[]>(ocultasIniciales);
  const [catalogo, setCatalogo] = useState<TarjetaRegistrada[]>([]);
  const [orden, setOrden] = useState<string[]>([]);

  // El catálogo se llena solo, según se van visitando los apartados. No hace
  // falta tenerlo completo de antemano: una tarjeta que nadie ha visto todavía
  // está visible por definición, que es el estado por defecto.
  const registrar = useCallback((tarjeta: TarjetaRegistrada) => {
    // El armador del reporte personalizado elige sobre `catalogoTarjetas.ts`,
    // que es una lista escrita a mano. Si alguien agrega una tarjeta y olvida
    // anotarla allí, no se podría elegir nunca: en desarrollo se avisa aquí.
    if (import.meta.env.DEV && !NUMEROS_TARJETAS.includes(tarjeta.numero)) {
      console.warn(
        `La tarjeta ${tarjeta.numero} («${tarjeta.titulo}») no está en CATALOGO_TARJETAS: no aparecerá en el armador del reporte personalizado.`,
      );
    }

    setCatalogo((previo) =>
      previo.some((t) => t.numero === tarjeta.numero) ? previo : [...previo, tarjeta],
    );
    // El orden arranca siendo el del codigo: cada tarjeta se anota al final
    // segun se dibuja, y solo cambia si alguien la arrastra.
    setOrden((previo) => (previo.includes(tarjeta.numero) ? previo : [...previo, tarjeta.numero]));
  }, []);


  const reordenar = useCallback(
    (movida: string, destino: string, donde: "antes" | "despues" | "auto" = "auto") => {
      if (movida === destino) return;
      setOrden((previo) => {
        const desde = previo.indexOf(movida);
        const hasta = previo.indexOf(destino);
        if (hasta === -1) return previo;

        const sin = previo.filter((n) => n !== movida);
        const i = sin.indexOf(destino);
        // Bajando, la tarjeta queda después de la de destino; subiendo, antes.
        // Es lo que uno espera al soltarla encima de otra: si siempre entrara
        // antes, arrastrarla sobre la de al lado no movería nada.
        //
        // La que vuelve del panel de quitadas es el caso aparte: no venía de
        // ningún sitio del tablero, así que entra en el hueco, delante.
        const bajando = desde !== -1 && !ocultas.includes(movida) && desde < hasta;
        const despues = donde === "auto" ? bajando : donde === "despues";
        const corte = despues ? i + 1 : i;
        return [...sin.slice(0, corte), movida, ...sin.slice(corte)];
      });
    },
    [ocultas],
  );

  const valor = useMemo<ValorVisibilidad>(
    () => ({
      seccionActiva,
      soloLectura,
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
    [seccionActiva, soloLectura, ocultas, catalogo, orden, registrar, reordenar],
  );

  return <ContextoVisibilidad.Provider value={valor}>{children}</ContextoVisibilidad.Provider>;
}
