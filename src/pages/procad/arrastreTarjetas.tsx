import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useVisibilidadTarjetas } from "./visibilidadTarjetas";

/**
 * El arrastre de tarjetas del panel de estadísticas, en un solo sitio.
 *
 * Hay dos formas de arrastrar y las dos tenían que sentirse igual: devolver una
 * tarjeta quitada desde el panel lateral, y mover una que ya está en el tablero
 * para reordenarla. Comparten el hueco marcado con «¡Suéltala aquí!», los
 * espacios vacíos de la rejilla como destino y el desplazamiento automático de
 * la página, así que viven aquí y no repetidos en cada componente.
 */

type Punto = { x: number; y: number };
type Caja = { top: number; left: number; width: number; height: number };
type EventoDeArrastre = MouseEvent | TouchEvent | PointerEvent;

/** Franja del borde donde el arrastre empieza a desplazar la página. */
const ZONA_BORDE = 130;
/** Lo que hay que sostener la tarjeta en el borde antes de que la página se mueva. */
const ESPERA_BORDE = 550;
const VELOCIDAD_MINIMA = 2;
const VELOCIDAD_EXTRA = 6;
/** Cuánto se puede soltar de lejos de una tarjeta y que aun así cuente. */
const ALCANCE = 170;
/** Lo que hay que recorrer para que pulsar pase a ser arrastrar. */
const UMBRAL = 5;
/** Lo que tarda una tarjeta en deslizarse a su nuevo sitio, con holgura. */
const ASENTARSE = 500;

/**
 * Dónde va a quedar la tarjeta: junto a cuál y de qué lado. `auto` deja que lo
 * decida el sentido del movimiento —bajando, después; subiendo, antes—, y es lo
 * que se usa al soltar encima de otra tarjeta. Los espacios vacíos sí mandan el
 * lado, porque un hueco está en un sitio concreto de la fila.
 */
export interface Colocacion {
  numero: string;
  donde: "antes" | "despues" | "auto";
}

/** Un espacio vacío de la rejilla, listo para recibir una tarjeta. */
interface Hueco {
  clave: string;
  caja: Caja;
  /** La tarjeta que lo antecede; `null` si el hueco abre la rejilla. */
  tras: string | null;
}

interface ValorArrastre {
  /** Número de la tarjeta en vuelo, o `null` si no hay ninguna. */
  arrastrando: string | null;
  /**
   * Toma una tarjeta: la del tablero o la ficha de una quitada. Lo agarrado se
   * queda donde está, con su contorno punteado —moverlo de verdad no sirve: una
   * tarjeta mide media pantalla, y cualquier cosa arrastrada se despega del
   * cursor en cuanto la página se desplaza— y con el puntero viaja su rótulo,
   * también punteado, para que se vea el traslado.
   *
   * `alSoltar` es para quien necesita hacer algo más que reordenar: el panel de
   * quitadas, que además tiene que devolver la tarjeta al tablero.
   */
  tomar: (
    tarjeta: { numero: string; titulo: string },
    evento: React.PointerEvent,
    alSoltar?: (destino: Colocacion | null) => void,
  ) => void;
}

const sinArrastre: ValorArrastre = {
  arrastrando: null,
  tomar: () => {},
};

/**
 * El valor por defecto no hace nada: así una tarjeta dibujada fuera del panel
 * —en el reporte personalizado, por ejemplo— sigue funcionando sin arrastre en
 * vez de reventar.
 */
const ContextoArrastre = createContext<ValorArrastre>(sinArrastre);

export function useArrastreTarjetas() {
  return useContext(ContextoArrastre);
}

/** El punto del puntero, venga de ratón, lápiz o dedo. */
function puntoDe(evento: EventoDeArrastre): Punto | null {
  if ("clientX" in evento) return { x: evento.clientX, y: evento.clientY };
  const toque = evento.changedTouches?.[0];
  return toque ? { x: toque.clientX, y: toque.clientY } : null;
}

const deRect = (r: DOMRect): Caja => ({
  top: r.top,
  left: r.left,
  width: r.width,
  height: r.height,
});

/** Distancia del punto a la caja; cero si cayó dentro. */
function distancia(caja: DOMRect, punto: Punto): number {
  const dx = Math.max(caja.left - punto.x, 0, punto.x - caja.right);
  const dy = Math.max(caja.top - punto.y, 0, punto.y - caja.bottom);
  return Math.hypot(dx, dy);
}

const dentro = (caja: Caja, punto: Punto) =>
  punto.x >= caja.left &&
  punto.x <= caja.left + caja.width &&
  punto.y >= caja.top &&
  punto.y <= caja.top + caja.height;

/**
 * Los espacios vacíos de la rejilla.
 *
 * La rejilla es de dos columnas y hay tarjetas que ocupan las dos, así que en
 * cuanto se reordena algo quedan celdas en blanco. Son sitio legítimo donde
 * poner una tarjeta —de hecho es donde uno la quiere poner—, pero como no hay
 * ningún elemento ahí, soltarlas no apuntaba a nada. Aquí se calculan a partir
 * de las columnas declaradas y de las filas que ocupan las tarjetas, y se
 * dibujan punteadas mientras dura el arrastre.
 */
function calcularHuecos(): Hueco[] {
  const contenedores = new Set<HTMLElement>();
  for (const el of document.querySelectorAll<HTMLElement>("[data-tarjeta]")) {
    if (el.parentElement) contenedores.add(el.parentElement);
  }

  const huecos: Hueco[] = [];

  for (const contenedor of contenedores) {
    const estilo = getComputedStyle(contenedor);
    if (estilo.display !== "grid") continue;

    const anchos = estilo.gridTemplateColumns
      .split(" ")
      .map((v) => Number.parseFloat(v))
      .filter((n) => !Number.isNaN(n));
    // Con una sola columna no hay celdas en blanco que llenar: las tarjetas van
    // una debajo de otra y entre ellas solo está la separación.
    if (anchos.length < 2) continue;

    const separacion = Number.parseFloat(estilo.columnGap) || 0;
    const marco = contenedor.getBoundingClientRect();

    const columnas: { x: number; ancho: number }[] = [];
    let x = marco.left;
    for (const ancho of anchos) {
      columnas.push({ x, ancho });
      x += ancho + separacion;
    }

    const cartas = [...contenedor.children]
      .map((el) => ({ el: el as HTMLElement, caja: el.getBoundingClientRect() }))
      .filter((c) => c.el.dataset.tarjeta);
    if (cartas.length === 0) continue;

    // Las filas salen de dónde arrancan las tarjetas, no de la rejilla: así una
    // fila alta y una baja se miden cada una por lo suyo.
    const filas: { top: number; alto: number }[] = [];
    for (const carta of cartas) {
      const fila = filas.find((f) => Math.abs(f.top - carta.caja.top) < 4);
      if (fila) fila.alto = Math.max(fila.alto, carta.caja.height);
      else filas.push({ top: carta.caja.top, alto: carta.caja.height });
    }
    filas.sort((a, b) => a.top - b.top);

    /** En el orden en que se leen: de arriba abajo y de izquierda a derecha. */
    const enOrden = [...cartas].sort(
      (a, b) => a.caja.top - b.caja.top || a.caja.left - b.caja.left,
    );

    for (const fila of filas) {
      for (const columna of columnas) {
        const ocupada = cartas.some(
          (c) =>
            c.caja.left < columna.x + columna.ancho - 2 &&
            c.caja.right > columna.x + 2 &&
            c.caja.top < fila.top + fila.alto - 2 &&
            c.caja.bottom > fila.top + 2,
        );
        if (ocupada) continue;

        const previas = enOrden.filter(
          (c) =>
            c.caja.top < fila.top - 2 ||
            (Math.abs(c.caja.top - fila.top) < 4 && c.caja.left < columna.x),
        );

        huecos.push({
          clave: `${Math.round(columna.x)}:${Math.round(fila.top)}`,
          caja: { top: fila.top, left: columna.x, width: columna.ancho, height: fila.alto },
          tras: previas.length > 0 ? (previas[previas.length - 1].el.dataset.tarjeta ?? null) : null,
        });
      }
    }
  }

  return huecos;
}

/** Lo que hay bajo el puntero: un hueco de la rejilla o una tarjeta. */
interface Apunte {
  clave: string;
  caja: Caja;
  colocacion: Colocacion;
}

/**
 * A dónde apunta un punto: primero los espacios vacíos, luego la tarjeta que
 * tiene debajo, y si no hay ninguna, la más cercana dentro de un palmo.
 *
 * Lo último no es un lujo. Entre tarjeta y tarjeta hay separación y a los lados
 * márgenes; soltar ahí —que es lo que pasa la mitad de las veces— no hacía nada
 * y la tarjeta se quedaba donde estaba, que tras el desplazamiento automático
 * era fuera de la pantalla.
 */
function apuntar(punto: Punto, excepto: string, huecos: Hueco[]): Apunte | null {
  const hueco = huecos.find((h) => dentro(h.caja, punto));
  if (hueco) {
    const primera = document.querySelector<HTMLElement>("[data-tarjeta]")?.dataset.tarjeta;
    // Un hueco que abre la rejilla no tiene tarjeta detrás: se coloca delante
    // de la primera.
    const colocacion: Colocacion | null = hueco.tras
      ? { numero: hueco.tras, donde: "despues" }
      : primera
        ? { numero: primera, donde: "antes" }
        : null;
    if (colocacion) return { clave: `hueco:${hueco.clave}`, caja: hueco.caja, colocacion };
  }

  const encima = document.elementsFromPoint(punto.x, punto.y);

  const debajo = encima
    .map((el) => (el as HTMLElement).closest?.("[data-tarjeta]") as HTMLElement | null)
    .find((el) => el && el.dataset.tarjeta !== excepto);
  if (debajo?.dataset.tarjeta) {
    return {
      clave: debajo.dataset.tarjeta,
      caja: deRect(debajo.getBoundingClientRect()),
      colocacion: { numero: debajo.dataset.tarjeta, donde: "auto" },
    };
  }

  // Sobre el panel de quitadas no hay destino: el tablero sigue ahí detrás, y
  // la tarjeta más cercana por geometría sería una que ni se está viendo.
  if (encima.some((el) => (el as HTMLElement).closest?.("[data-panel-quitadas]"))) return null;

  let cerca: HTMLElement | null = null;
  let menor = Infinity;
  for (const el of document.querySelectorAll<HTMLElement>("[data-tarjeta]")) {
    if (el.dataset.tarjeta === excepto) continue;
    const d = distancia(el.getBoundingClientRect(), punto);
    if (d < menor) {
      menor = d;
      cerca = el;
    }
  }
  if (!cerca || menor > ALCANCE || !cerca.dataset.tarjeta) return null;

  return {
    clave: cerca.dataset.tarjeta,
    caja: deRect(cerca.getBoundingClientRect()),
    colocacion: { numero: cerca.dataset.tarjeta, donde: "auto" },
  };
}

/**
 * Tras soltar, la tarjeta movida se trae a la vista. Con el desplazamiento
 * automático el tablero puede haber corrido varias pantallas, y lo último que
 * tiene que preguntarse quien la movió es dónde quedó.
 *
 * Se espera a que la rejilla se recoloque: la tarjeta no salta a su hueco, se
 * desliza, y mirar antes de tiempo apuntaba al sitio que estaba dejando.
 */
export function traerALaVista(numero: string) {
  setTimeout(() => {
    document
      .querySelector(`[data-tarjeta="${numero}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, ASENTARSE);
}

export function ProveedorArrastre({ children }: { children: React.ReactNode }) {
  const { reordenar } = useVisibilidadTarjetas();
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [destino, setDestino] = useState<Apunte | null>(null);
  const [huecos, setHuecos] = useState<Hueco[]>([]);
  /** El rótulo que acompaña al puntero mientras se mueve una tarjeta. */
  const [enTraslado, setEnTraslado] = useState<{ titulo: string; punto: Punto } | null>(null);

  const puntero = useRef<Punto | null>(null);
  const enVuelo = useRef<string | null>(null);
  const cuadro = useRef<number | null>(null);
  const huecosRef = useRef<Hueco[]>([]);
  /** Desde cuándo el puntero lleva sostenido contra el mismo borde. */
  const borde = useRef({ direccion: 0, desde: 0 });

  /** Se recalculan tras cada desplazamiento: sus cajas son de la ventana. */
  const revisarHuecos = useCallback(() => {
    const nuevos = calcularHuecos();
    const antes = huecosRef.current;
    const igual =
      antes.length === nuevos.length &&
      antes.every(
        (h, i) =>
          h.clave === nuevos[i].clave &&
          Math.round(h.caja.top) === Math.round(nuevos[i].caja.top),
      );
    if (igual) return;
    huecosRef.current = nuevos;
    setHuecos(nuevos);
  }, []);

  const marcar = useCallback((numero: string, punto: Punto) => {
    const apunte = apuntar(punto, numero, huecosRef.current);
    setDestino((previo) => {
      if (!apunte) return previo ? null : previo;
      return previo?.clave === apunte.clave &&
        Math.round(previo.caja.top) === Math.round(apunte.caja.top) &&
        Math.round(previo.caja.left) === Math.round(apunte.caja.left)
        ? previo
        : apunte;
    });
  }, []);

  /**
   * Con una tarjeta en vuelo, sostenerla contra el borde desplaza la página.
   *
   * Sin esto el único destino posible es lo que ya se ve, y el tablero mide
   * varias pantallas. Se espera medio segundo antes de arrancar para que pasar
   * por el borde de camino a otro sitio no lo dispare sin querer.
   */
  const bucle = useCallback(
    // Con nombre para poder pedirse el siguiente cuadro a sí misma.
    function paso(ahora: number) {
      const marco = document.querySelector("main");
      const punto = puntero.current;

      if (marco && punto) {
        const caja = marco.getBoundingClientRect();
        let direccion = 0;
        let hondura = 0;
        if (punto.y > caja.bottom - ZONA_BORDE) {
          direccion = 1;
          hondura = (punto.y - (caja.bottom - ZONA_BORDE)) / ZONA_BORDE;
        } else if (punto.y < caja.top + ZONA_BORDE) {
          direccion = -1;
          hondura = (caja.top + ZONA_BORDE - punto.y) / ZONA_BORDE;
        }

        if (direccion !== borde.current.direccion) borde.current = { direccion, desde: ahora };

        if (direccion !== 0 && ahora - borde.current.desde > ESPERA_BORDE) {
          const antes = marco.scrollTop;
          marco.scrollTop +=
            direccion * (VELOCIDAD_MINIMA + Math.min(1, hondura) * VELOCIDAD_EXTRA);
          // La página se movió debajo del puntero: ni los huecos ni lo marcado
          // están ya donde estaban, así que se vuelve a mirar.
          if (marco.scrollTop !== antes && enVuelo.current) {
            revisarHuecos();
            marcar(enVuelo.current, punto);
          }
        }
      }

      cuadro.current = requestAnimationFrame(paso);
    },
    [marcar, revisarHuecos],
  );

  const arrancar = useCallback(
    (numero: string) => {
      enVuelo.current = numero;
      borde.current = { direccion: 0, desde: 0 };
      setArrastrando(numero);
      revisarHuecos();
      if (cuadro.current === null) cuadro.current = requestAnimationFrame(bucle);
    },
    [bucle, revisarHuecos],
  );

  const parar = useCallback(() => {
    enVuelo.current = null;
    puntero.current = null;
    huecosRef.current = [];
    setArrastrando(null);
    setDestino(null);
    setHuecos([]);
    if (cuadro.current !== null) {
      cancelAnimationFrame(cuadro.current);
      cuadro.current = null;
    }
  }, []);

  // Si se sale de la página con una tarjeta en vuelo, el bucle no se queda vivo.
  useEffect(
    () => () => {
      if (cuadro.current !== null) cancelAnimationFrame(cuadro.current);
    },
    [],
  );

  const tomar = useCallback(
    (
      tarjeta: { numero: string; titulo: string },
      evento: React.PointerEvent,
      alSoltar?: (destino: Colocacion | null) => void,
    ) => {
      // Los botones de dentro —«Colocar», la × de la tarjeta— siguen siendo
      // botones: agarrar se agarra del resto.
      if ((evento.target as HTMLElement).closest("button[data-no-arrastra]")) return;

      const salida = { x: evento.clientX, y: evento.clientY };
      let empezado = false;

      function alMover(e: PointerEvent) {
        const donde = { x: e.clientX, y: e.clientY };

        // Un pulsar y soltar en el sitio es un clic, no un arrastre. Hasta que
        // el puntero no recorre unos píxeles no se levanta nada; si no, elegir
        // «Colocar» abriría un traslado de un cuadro de duración.
        if (!empezado) {
          if (Math.hypot(donde.x - salida.x, donde.y - salida.y) < UMBRAL) return;
          empezado = true;
          e.preventDefault();
          puntero.current = donde;
          arrancar(tarjeta.numero);
          setEnTraslado({ titulo: tarjeta.titulo, punto: donde });
        }

        puntero.current = donde;
        setEnTraslado((previo) => (previo ? { ...previo, punto: donde } : previo));
        marcar(tarjeta.numero, donde);
      }

      function alLevantar(e: PointerEvent) {
        window.removeEventListener("pointermove", alMover);
        window.removeEventListener("pointerup", alLevantar);
        window.removeEventListener("pointercancel", alLevantar);
        if (!empezado) return;

        const punto = puntoDe(e) ?? puntero.current;
        const sobre = punto ? (apuntar(punto, tarjeta.numero, huecosRef.current)?.colocacion ?? null) : null;

        setEnTraslado(null);
        parar();

        if (alSoltar) alSoltar(sobre);
        else if (sobre) reordenar(tarjeta.numero, sobre.numero, sobre.donde);
        // Aunque no haya cambiado de sitio: si se soltó en el vacío hay que
        // enseñar dónde sigue estando, no dejarla perdida fuera de pantalla.
        traerALaVista(tarjeta.numero);
      }

      window.addEventListener("pointermove", alMover);
      window.addEventListener("pointerup", alLevantar);
      window.addEventListener("pointercancel", alLevantar);
    },
    [arrancar, marcar, parar, reordenar],
  );

  return (
    <ContextoArrastre.Provider value={{ arrastrando, tomar }}>
      {children}

      {/* Los espacios vacíos de la rejilla, punteados mientras dura el
          arrastre: son sitio donde soltar, y hasta que no se dibujan no hay
          forma de saberlo. En gris y apagados; el que está bajo el puntero se
          pinta aparte, encima de este. */}
      {arrastrando &&
        huecos.map((hueco) => (
          <div
            key={hueco.clave}
            aria-hidden="true"
            style={{
              top: hueco.caja.top,
              left: hueco.caja.left,
              width: hueco.caja.width,
              height: hueco.caja.height,
            }}
            className="pointer-events-none fixed z-[34] rounded-2xl border-2 border-dashed border-slate-300"
          />
        ))}

      {/* El sitio que recibiría la tarjeta. Por debajo del panel lateral (z-40)
          para no taparlo, y por encima de su velo (z-30) para verse a través. */}
      {arrastrando && destino && (
        <div
          key={destino.clave}
          aria-hidden="true"
          style={{
            top: destino.caja.top,
            left: destino.caja.left,
            width: destino.caja.width,
            height: destino.caja.height,
          }}
          className="pointer-events-none fixed z-[35] flex items-start justify-center rounded-2xl border-2 border-dashed border-unah-navy/50 bg-unah-navy/5"
        >
          {/* Arriba y no al centro: al centro está el puntero, y lo que se
              arrastra taparía el rótulo justo cuando hay que leerlo. */}
          <span className="mt-5 rounded-full bg-unah-navy px-4 py-1.5 text-[13px] font-bold text-white shadow-lg shadow-slate-900/25">
            ¡Suéltala aquí!
          </span>
        </div>
      )}

      {/* Lo que viaja con el puntero: no una tarjeta en miniatura —eso parecía
          otra cosa— sino el rótulo de la que se está moviendo, con el mismo
          borde punteado del hueco. Ladeado y translúcido, para que se lea como
          algo levantado y de paso deje ver lo que hay debajo. */}
      {enTraslado && (
        <div
          aria-hidden="true"
          style={{ top: enTraslado.punto.y, left: enTraslado.punto.x }}
          className="pointer-events-none fixed z-[60] max-w-[320px] -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-2xl border-2 border-dashed border-unah-navy bg-white/90 px-4 py-3 shadow-2xl shadow-slate-900/25 backdrop-blur-sm"
        >
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-unah-orange"
            />
            <span className="truncate text-sm font-bold text-slate-800">
              {enTraslado.titulo}
            </span>
          </span>
        </div>
      )}
    </ContextoArrastre.Provider>
  );
}
