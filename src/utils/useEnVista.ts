import { useEffect, useRef, useState } from "react";

/**
 * Avisa cuando el elemento entra en pantalla, y se queda en `true` para
 * siempre.
 *
 * Sirve para no gastar la animación en algo que nadie está viendo: un gráfico
 * al pie de la página se dibujaba mientras el usuario seguía arriba, y para
 * cuando bajaba ya estaba quieto.
 *
 * Dispara una sola vez a propósito. Si volviera a animar cada vez que el
 * elemento reaparece, subir y bajar la página sería un desfile de gráficos
 * rearmándose.
 */
export function useEnVista<T extends Element>(): [React.RefObject<T | null>, boolean] {
  const referencia = useRef<T>(null);
  const [enVista, setEnVista] = useState(false);

  useEffect(() => {
    const elemento = referencia.current;
    // Sin soporte del navegador se da por visto: mejor animar de más que
    // dejar un gráfico en blanco.
    if (!elemento || typeof IntersectionObserver === "undefined") {
      setEnVista(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setEnVista(true);
        observador.disconnect();
      },
      // Se dispara en cuanto el elemento asoma 60px por encima del borde
      // inferior. Va con margen y no con `threshold` porque un porcentaje
      // falla con elementos más altos que la pantalla: el 15% de una rejilla
      // muy larga no cabe en el viewport y no se cumpliría nunca.
      { rootMargin: "0px 0px -60px 0px", threshold: 0 },
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return [referencia, enVista];
}
