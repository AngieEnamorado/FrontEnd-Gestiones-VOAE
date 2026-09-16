import { useCallback, useMemo, useState } from "react";
import type { ColumnaTabla } from "./TablaDatos";

/**
 * Qué columnas ve cada quien en una tabla, y en qué orden.
 *
 * A diferencia de las tarjetas del panel de estadísticas —que a propósito
 * vuelven completas al recargar, porque quitarlas es para despejar el momento—,
 * aquí la elección se guarda: una tabla de trabajo es de quien la usa, y volver
 * a esconder las mismas seis columnas cada mañana no es configurar nada, es
 * repetir. Se guarda en el navegador de cada persona; cuando haya sesión de
 * verdad este es el punto donde pasaría a guardarse con el usuario.
 *
 * La columna se identifica por su rótulo, que es único dentro de cada tabla y
 * además es lo que la persona ve; un `id` aparte solo sería una segunda
 * verdad que mantener.
 */

const PREFIJO = "procad:tabla:";

interface Guardado {
  orden: string[];
  ocultas: string[];
}

function leer(clave: string): Guardado | null {
  try {
    const crudo = localStorage.getItem(PREFIJO + clave);
    if (!crudo) return null;
    const valor = JSON.parse(crudo) as Partial<Guardado>;
    if (!Array.isArray(valor.orden) || !Array.isArray(valor.ocultas)) return null;
    // Lo que se guarda son las columnas y su orden. Lo que esté fijado no: es
    // una ayuda para revisar algo largo en este momento, no una preferencia.
    return { orden: valor.orden.map(String), ocultas: valor.ocultas.map(String) };
  } catch {
    // Sin permiso de almacenamiento —ventana privada, datos bloqueados— la
    // tabla sale completa, que es un buen sitio donde empezar.
    return null;
  }
}

function guardar(clave: string, valor: Guardado) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // Si no se puede guardar, la vista sigue funcionando en esta visita.
  }
}

export interface ColumnaVista {
  label: string;
  oculta: boolean;
  /** Su sitio en la lista original; con él se recorta cada fila. */
  indice: number;
}

export interface VistaTabla {
  /** Las columnas que se dibujan, ya ordenadas. */
  visibles: ColumnaTabla[];
  /** De qué celda de la fila original sale cada columna visible. */
  indices: number[];
  /** Cuántas de las visibles, contando desde la izquierda, van fijadas. */
  cuantasFijadas: number;
  /** Todas, en el orden actual, para el panel de personalizar. */
  todas: ColumnaVista[];
  ocultas: number;
  /**
   * Cuántas apagó la persona, sin contar las que la tabla ya traía apagadas.
   * Es lo que se anuncia en el botón: decir «3 columnas ocultas» a quien no ha
   * tocado nada sería acusarlo de algo que no hizo.
   */
  ocultasPorLaPersona: number;
  alternar: (label: string) => void;
  mostrarTodas: () => void;
  ocultarTodas: () => void;
  reordenar: (movida: string, destino: string) => void;
  /**
   * Congela desde la primera columna hasta esta, como el «inmovilizar paneles»
   * de Excel: al deslizar, todas las de la izquierda se quedan a la vista.
   *
   * No mueve nada de sitio —el orden es el que se eligió— y por eso fija un
   * bloque desde el borde y no columnas sueltas: una columna del medio pegada a
   * la izquierda tendría que saltarse las que tiene delante. Pulsar la misma
   * suelta el bloque.
   */
  fijar: (label: string) => void;
  /** Vuelve a las columnas y al orden con los que la tabla viene escrita. */
  restablecer: () => void;
}

export function useVistaTabla(clave: string | undefined, columnas: ColumnaTabla[]): VistaTabla {
  const declaradas = useMemo(() => columnas.map((c) => c.label), [columnas]);

  const [guardado, setGuardado] = useState<Guardado>(() => {
    const inicial: Guardado = {
      orden: [],
      ocultas: columnas.filter((c) => c.ocultaAlInicio).map((c) => c.label),
    };
    return clave ? (leer(clave) ?? inicial) : inicial;
  });

  // Lo guardado se reconcilia con lo que la tabla declara hoy, y se hace al
  // dibujar y no en un efecto: es una derivación, no una sincronización con
  // nada de fuera. Se respeta el orden conocido, las columnas nuevas entran al
  // final y las que ya no existen se olvidan; así, si a una tabla se le añade
  // una columna, nadie se queda sin verla por haber guardado la vista antes.
  const orden = useMemo(() => {
    const conocidas = guardado.orden.filter((l) => declaradas.includes(l));
    return [...conocidas, ...declaradas.filter((l) => !conocidas.includes(l))];
  }, [guardado.orden, declaradas]);

  const ocultas = useMemo(
    () => guardado.ocultas.filter((l) => declaradas.includes(l)),
    [guardado.ocultas, declaradas],
  );

  /**
   * Hasta qué columna llega el bloque congelado, contando desde la izquierda.
   * Vive solo en memoria: al recargar, la tabla vuelve a deslizarse entera.
   */
  const [hastaDonde, setHastaDonde] = useState(0);

  const aplicar = useCallback(
    (siguiente: Guardado) => {
      setGuardado(siguiente);
      if (clave) guardar(clave, siguiente);
    },
    [clave],
  );

  const alternar = useCallback(
    (label: string) => {
      aplicar({
        orden,
        ocultas: ocultas.includes(label)
          ? ocultas.filter((l) => l !== label)
          : [...ocultas, label],
      });
    },
    [aplicar, orden, ocultas],
  );

  const mostrarTodas = useCallback(() => aplicar({ orden, ocultas: [] }), [aplicar, orden]);

  const ocultarTodas = useCallback(() => {
    setHastaDonde(0);
    aplicar({ orden, ocultas: declaradas });
  }, [aplicar, orden, declaradas]);

  const restablecer = useCallback(() => {
    setHastaDonde(0);
    aplicar({
      orden: declaradas,
      ocultas: columnas.filter((c) => c.ocultaAlInicio).map((c) => c.label),
    });
  }, [aplicar, declaradas, columnas]);

  const reordenar = useCallback(
    (movida: string, destino: string) => {
      if (movida === destino) return;
      const desde = orden.indexOf(movida);
      const hasta = orden.indexOf(destino);
      if (desde === -1 || hasta === -1) return;

      const sin = orden.filter((l) => l !== movida);
      const i = sin.indexOf(destino);
      // Bajando queda debajo de la de destino, subiendo encima: igual que el
      // arrastre de las tarjetas, para que el gesto se sienta el mismo.
      const corte = desde < hasta ? i + 1 : i;
      aplicar({ orden: [...sin.slice(0, corte), movida, ...sin.slice(corte)], ocultas });
    },
    [aplicar, orden, ocultas],
  );

  const enOrden = useMemo(
    () =>
      orden
        .map((label) => ({
          label,
          oculta: ocultas.includes(label),
          indice: declaradas.indexOf(label),
        }))
        .filter((c) => c.indice !== -1),
    [orden, ocultas, declaradas],
  );

  const mostradas = useMemo(() => enOrden.filter((c) => !c.oculta), [enOrden]);

  // Si se apagan columnas, el bloque congelado no puede pasarse del final.
  const cuantasFijadas = Math.min(hastaDonde, mostradas.length);

  const todas: ColumnaVista[] = enOrden;

  const fijar = useCallback(
    (label: string) => {
      // Solo se llama desde el encabezado de la tabla, así que la columna
      // siempre se está viendo; una que no se ve no tiene chincheta que pulsar.
      const visible = mostradas.findIndex((c) => c.label === label);
      if (visible === -1) return;
      // Pulsar la última del bloque lo suelta; cualquier otra mueve la línea.
      setHastaDonde((previo) => (previo === visible + 1 ? 0 : visible + 1));
    },
    [mostradas],
  );

  const deSalida = useMemo(
    () => columnas.filter((c) => c.ocultaAlInicio).map((c) => c.label),
    [columnas],
  );

  return {
    visibles: mostradas.map((c) => columnas[c.indice]),
    indices: mostradas.map((c) => c.indice),
    cuantasFijadas,
    todas,
    ocultas: todas.length - mostradas.length,
    ocultasPorLaPersona: ocultas.filter((l) => !deSalida.includes(l)).length,
    alternar,
    mostrarTodas,
    ocultarTodas,
    reordenar,
    fijar,
    restablecer,
  };
}
