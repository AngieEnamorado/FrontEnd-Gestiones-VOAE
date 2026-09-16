import { useLayoutEffect, useRef, useState } from "react";

/**
 * El subrayado que se desliza bajo la pestaña activa.
 *
 * Se mide del botón real en vez de dibujarse dentro de él: uno solo que se
 * desplaza se lee como un objeto que viaja, mientras que un borde por botón
 * solo puede aparecer y desaparecer.
 *
 * Vive aquí y no dentro de `PestanasModulo` porque hay dos tiras de pestañas en
 * PROCAD —la de los módulos y la de las secciones de estadísticas— y el
 * subrayado tiene que comportarse igual en las dos. Cuando estaba escrito dos
 * veces, se descentraba en una y no en la otra.
 *
 * Lo que lo descentraba: medir solo al cambiar de pestaña y al cambiar el
 * tamaño de la ventana. Una tira centrada mueve *todos* sus botones cada vez
 * que su contenedor cambia de ancho —al plegar el menú lateral, al aparecer la
 * barra de desplazamiento, al cargar las tarjetas de arriba—, y ninguna de esas
 * cosas es un `resize` de ventana. El `ResizeObserver` mira el contenedor y
 * cada botón, que es donde de verdad pasa.
 *
 * Se mide la caja del *contenido* del botón, no el botón entero: la barra tiene
 * que empezar donde empieza la palabra y acabar donde acaba, no catorce píxeles
 * antes y catorce después. Con el relleno dentro parecía descolocada hacia la
 * izquierda en las pestañas largas.
 */
export function useIndicadorPestanas(activa: string, cantidad: number) {
  const contenedor = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicador, setIndicador] = useState({ x: 0, y: 0, ancho: 0 });

  useLayoutEffect(() => {
    function medir() {
      const boton = refs.current[activa];
      if (!boton) return;
      const estilo = getComputedStyle(boton);
      const izquierda = parseFloat(estilo.paddingLeft);
      const derecha = parseFloat(estilo.paddingRight);
      const x = boton.offsetLeft + izquierda;
      const y = boton.offsetTop + boton.offsetHeight - 2;
      const ancho = boton.clientWidth - izquierda - derecha;
      // Solo se guarda lo que cambió: el observador dispara con cada reajuste
      // y un `setState` incondicional lo volvería un bucle.
      setIndicador((previo) =>
        previo.x === x && previo.y === y && previo.ancho === ancho ? previo : { x, y, ancho },
      );
    }

    medir();
    // Y otra vez cuando la tipografía esté lista: con la fuente de respaldo los
    // rótulos miden otra cosa, y la barra se quedaba donde estaba el botón
    // antes del cambio de fuente —descentrada hasta que algo la movía—.
    document.fonts?.ready.then(medir);

    const observador = new ResizeObserver(medir);
    if (contenedor.current) observador.observe(contenedor.current);
    for (const boton of Object.values(refs.current)) {
      if (boton) observador.observe(boton);
    }
    window.addEventListener("resize", medir);

    return () => {
      observador.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [activa, cantidad]);

  /** Lista para pegar en el `style` de la barra. */
  const estilo = {
    width: `${indicador.ancho}px`,
    transform: `translate3d(${indicador.x}px, ${indicador.y}px, 0)`,
  };

  return { contenedor, refs, estilo };
}

/**
 * Las clases de la barra.
 *
 * El ancho es el ancho de verdad y no una barra de 1px estirada con `scaleX`,
 * que es lo que hacía antes. Estirar deforma también el redondeo: el radio se
 * calcula sobre la caja sin escalar —medio píxel— y al multiplicarlo por
 * ciento y pico se convierte en una elipse larguísima, así que la barra dejaba
 * de ser una barra y pasaba a ser una lente que se afila decenas de píxeles
 * antes de sus extremos. De ahí venía la sensación de que no cuadraba con la
 * palabra: los bordes no estaban donde parecían estar.
 *
 * Animar el ancho cuesta un reflujo por fotograma, pero de un solo elemento
 * colocado en absoluto, que no empuja a nadie.
 */
export const CLASE_INDICADOR =
  "pointer-events-none absolute left-0 top-0 h-0.5 rounded-full bg-unah-orange transition-[transform,width] duration-[280ms] ease-mueve";
