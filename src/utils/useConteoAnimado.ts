import { useEffect, useRef, useState } from "react";

/** Se consulta una vez: la preferencia no cambia a media sesión. */
function prefiereMenosMovimiento(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Lleva un número desde lo que hay en pantalla hasta su nuevo valor, al
 * aparecer y cada vez que cambia.
 *
 * En un panel de cifras es lo que más lo separa de una tabla: el número llega,
 * no estaba ahí desde siempre. Si el sistema pide menos movimiento, devuelve el
 * valor final de una vez; con `activo` en falso, se queda esperando.
 *
 * El punto de partida sale de lo que se está mostrando, no de un registro del
 * valor anterior: con StrictMode el efecto corre dos veces al montar, y un
 * registro quedaría creyendo que la cifra ya llegó cuando en pantalla sigue
 * en cero.
 */
export function useConteoAnimado(valor: number, activo = true, duracion = 700): number {
  // `useState` perezoso, no `useRef`: se calcula una sola vez y sin leer una
  // referencia durante el render.
  const [reducido] = useState(prefiereMenosMovimiento);
  const [mostrado, setMostrado] = useState(0);
  const enPantalla = useRef(0);

  useEffect(() => {
    // Sin `activo` la cifra espera: se cuenta cuando alguien la está viendo.
    if (reducido || !activo) return;

    const desde = enPantalla.current;
    if (desde === valor) return;

    const inicio = performance.now();

    function aplicar(v: number) {
      enPantalla.current = v;
      setMostrado(v);
    }

    let cuadro = requestAnimationFrame(function paso(ahora: number) {
      const avance = Math.min(1, (ahora - inicio) / duracion);
      // Salida exponencial: arranca rápido y frena al final, que es como se
      // lee natural un contador.
      const suavizado = 1 - Math.pow(1 - avance, 3);
      aplicar(desde + (valor - desde) * suavizado);
      if (avance < 1) cuadro = requestAnimationFrame(paso);
    });

    return () => cancelAnimationFrame(cuadro);
  }, [valor, activo, duracion, reducido]);

  return reducido ? valor : mostrado;
}
