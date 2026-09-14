import { useLayoutEffect, useRef, useState } from "react";
import IconoPin from "./IconoPin";
import SinDatos from "./SinDatos";
import PersonalizarTabla from "./PersonalizarTabla";
import { useVistaTabla, type VistaTabla } from "./vistaTabla";

export interface ColumnaTabla {
  label: string;
  /** Alinea a la derecha y usa cifras tabulares: así los números se comparan en columna. */
  numerica?: boolean;
  /**
   * Centra la columna. Es para las que solo llevan un botón o un icono: un
   * cuadro de 32px pegado al borde izquierdo de una columna ancha se lee como
   * si se hubiera caído de su sitio.
   */
  centrada?: boolean;
  /**
   * Arranca oculta, hasta que alguien la encienda en «Personalizar vista». Es
   * para el dato que a veces hace falta y casi siempre estorba: así la tabla
   * puede ofrecerlo sin que la vista de todos los días llegue a diez columnas.
   * Solo cuenta la primera vez; después manda lo que cada quien haya guardado.
   */
  ocultaAlInicio?: boolean;
}

interface TablaDatosProps {
  columnas: ColumnaTabla[];
  filas: React.ReactNode[][];
  anchoMinimo?: string;
  /**
   * Enciende el panel de «Personalizar vista» y da la clave con la que se
   * recuerda la elección. Va tabla por tabla —no una para todo el módulo—
   * porque las columnas de cada una son suyas: `estudiantes:solicitudes`.
   *
   * Sin esta prop la tabla se dibuja como se declaró, que es lo que quieren las
   * tablas de un reporte: ahí lo que se ve tiene que ser lo que se imprime.
   */
  personalizar?: string;
  /**
   * La vista ya creada por quien llama, para poner el botón de columnas donde
   * quiera —la barra de filtros, por ejemplo— en vez de encima de la tabla.
   * Con esto, `TablaDatos` dibuja pero no manda.
   */
  vista?: VistaTabla;
}

/**
 * La tabla de PROCAD. Además de ser una forma de mostrar datos por sí sola, es
 * el respaldo accesible de los gráficos: todo valor que un color insinúa está
 * escrito en alguna tabla.
 *
 * La franja del encabezado es navy: es la marca de la casa y lo que hace que
 * una tabla se reconozca como de esta plataforma a media pantalla de distancia.
 * El aire de la tabla se ganó por otro lado —filas más altas, líneas más finas,
 * una caja menos y los botones de acción en gris hasta que se les acerca el
 * cursor—, no apagando la franja.
 */
export default function TablaDatos({
  columnas,
  filas,
  anchoMinimo = "560px",
  personalizar,
  vista: vistaExterna,
}: TablaDatosProps) {
  const propia = useVistaTabla(vistaExterna ? undefined : personalizar, columnas);
  const vista = vistaExterna ?? propia;
  const personalizable = Boolean(vistaExterna || personalizar);

  // Sin personalizar, la tabla es la de siempre: las columnas declaradas, en su
  // orden, y cada celda en el sitio en que la escribió quien la llamó.
  const visibles = personalizable ? vista.visibles : columnas;
  const indices = personalizable ? vista.indices : columnas.map((_, i) => i);
  const fijadas = personalizable ? vista.cuantasFijadas : 0;

  // El bloque congelado se queda pegado a la izquierda mientras el resto se
  // desliza por debajo. Dónde para cada columna lo decide el ancho de las que
  // tiene delante, y esos anchos los reparte el navegador: hay que medirlos del
  // encabezado ya dibujado, no calcularlos.
  const contenedor = useRef<HTMLDivElement>(null);
  const cabeceras = useRef<(HTMLTableCellElement | null)[]>([]);
  const [medidas, setMedidas] = useState<{ desplazamientos: number[]; tope: number }>({
    desplazamientos: [],
    tope: 0,
  });

  useLayoutEffect(() => {
    function medir() {
      const anchos = visibles.map((_, j) => cabeceras.current[j]?.offsetWidth ?? 0);
      const desplazamientos: number[] = [];
      let acumulado = 0;
      for (const ancho of anchos) {
        desplazamientos.push(acumulado);
        acumulado += ancho;
      }

      // Hasta dónde tiene sentido congelar: pasada la mitad de lo que se ve, ya
      // no quedaría nada que deslizar y la tabla se volvería un muro.
      const permitido = (contenedor.current?.clientWidth ?? 0) * 0.55;
      let tope = 0;
      while (tope < anchos.length && desplazamientos[tope] + anchos[tope] <= permitido) tope += 1;

      setMedidas((previo) =>
        previo.tope === tope &&
        previo.desplazamientos.length === desplazamientos.length &&
        previo.desplazamientos.every((v, i) => v === desplazamientos[i])
          ? previo
          : { desplazamientos, tope },
      );
    }

    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [visibles, filas]);

  const barra = personalizar && !vistaExterna ? (
    <div className="mb-3 flex justify-end">
      <PersonalizarTabla vista={vista} />
    </div>
  ) : null;

  if (filas.length === 0) {
    return (
      <>
        {barra}
        <SinDatos />
      </>
    );
  }

  if (visibles.length === 0) {
    return (
      <>
        {barra}
        <div className="rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
          <p className="text-sm font-bold text-slate-700">Ocultaste todas las columnas</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
            Los {filas.length} registros siguen ahí; solo no queda ninguna columna con la que
            enseñarlos.
          </p>
          <button
            type="button"
            onClick={vista.mostrarTodas}
            className="mt-4 rounded-full bg-unah-navy px-4 py-2 text-[13px] font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98]"
          >
            Mostrar todas
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {barra}
      {/* Sin borde propio: la tabla ya vive dentro de una tarjeta blanca, y una
        caja dentro de otra es la capa que sobra. */}
      <div ref={contenedor} className="table-scrollbar overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm" style={{ minWidth: anchoMinimo }}>
          <thead>
            <tr className="bg-unah-navy text-[11px] font-semibold uppercase tracking-wide text-white">
              {visibles.map((c, j) => (
                <th
                  key={c.label}
                  ref={(el) => {
                    cabeceras.current[j] = el;
                  }}
                  scope="col"
                  style={j < fijadas ? { left: medidas.desplazamientos[j] ?? 0 } : undefined}
                  className={`whitespace-nowrap bg-unah-navy px-4 py-3 ${
                    c.numerica ? "text-right" : c.centrada ? "text-center" : ""
                  } ${j < fijadas ? "sticky z-20" : ""} ${
                    j === fijadas - 1 ? "shadow-[10px_0_14px_-10px_rgba(15,23,42,0.45)]" : ""
                  }`}
                >
                  {/* La chincheta va en la cabecera y no solo en el panel: fijar
                      una columna es algo que se piensa mirando la tabla, no
                      abriendo un menú. Aparece al acercarse; la ya fijada se
                      queda a la vista en naranja. */}
                  <span
                    className={`group/th inline-flex items-center gap-1.5 ${
                      c.numerica ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* En una columna centrada la chincheta desplaza el rótulo:
                        ocupa sitio a la derecha aunque esté invisible, así que
                        el texto queda medio botón a la izquierda del centro y
                        deja de coincidir con lo que hay debajo —el botón de
                        decisión, que sí va centrado—. Un hueco igual al otro
                        lado devuelve el rótulo a su eje. */}
                    {personalizable && c.centrada && <span aria-hidden="true" className="w-5" />}
                    {c.label}
                    {personalizable && (
                      <button
                        type="button"
                        onClick={() => vista.fijar(c.label)}
                        disabled={j >= medidas.tope && j >= fijadas}
                        aria-pressed={j < fijadas}
                        title={
                          j === fijadas - 1
                            ? "Soltar: la tabla vuelve a deslizarse entera"
                            : j >= medidas.tope
                              ? "No cabe congelar hasta aquí: no quedaría nada que deslizar"
                              : `Congelar de la primera columna hasta «${c.label}»`
                        }
                        aria-label={`Congelar hasta la columna ${c.label}`}
                        className={`flex h-5 w-5 items-center justify-center rounded transition-[opacity,color,background-color] duration-150 disabled:cursor-not-allowed ${
                          j < fijadas
                            ? "text-unah-orange"
                            : "text-white/45 opacity-0 hover:bg-white/10 hover:text-white focus-visible:opacity-100 disabled:hover:bg-transparent group-hover/th:opacity-100"
                        }`}
                      >
                        <IconoPin className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map((fila, i) => (
              // El resaltado al pasar el cursor no es adorno: en una tabla de
              // diez columnas es lo que mantiene unida la fila que se está
              // leyendo cuando la vista viaja hasta el otro extremo.
              <tr key={i} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                {indices.map((indice, j) => (
                  <td
                    key={j}
                    // `bg-inherit` y no `bg-white`: la celda fijada tapa lo que
                    // pasa por debajo, pero hereda el fondo de la fila, así que
                    // el resaltado al pasar el cursor la sigue alcanzando.
                    className={`bg-inherit px-4 py-3.5 text-slate-600 ${
                      visibles[j]?.numerica
                        ? "text-right"
                        : visibles[j]?.centrada
                          ? "text-center"
                          : ""
                    } ${j < fijadas ? "sticky z-10" : ""} ${
                      j === fijadas - 1 ? "shadow-[9px_0_12px_-9px_rgba(15,23,42,0.14)]" : ""
                    }`}
                    style={{
                      ...(visibles[j]?.numerica ? { fontVariantNumeric: "tabular-nums" } : {}),
                      ...(j < fijadas ? { left: medidas.desplazamientos[j] ?? 0 } : {}),
                    }}
                  >
                    {fila[indice]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
