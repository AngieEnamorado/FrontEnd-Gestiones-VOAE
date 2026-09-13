import { jsPDF } from "jspdf";
import { getFontEmbedCSS, toJpeg } from "html-to-image";
import { ALTO_PIE, MARGEN_X, encabezadoInstitucional, sellarPaginas } from "./exportarPdf";
import { sinLetraDeApartado } from "./nombreDeReporte";

/**
 * El reporte en PDF **con sus gráficas**, no con las cifras en tablas.
 *
 * jsPDF escribe texto y tablas, pero no sabe nada de las gráficas: son SVG y
 * HTML dibujados por el navegador. Así que no se redibujan aquí —serían las 33
 * mantenidas dos veces, y tarde o temprano una diría algo distinto de la otra—
 * sino que se fotografía lo que ya está en pantalla, tarjeta por tarjeta, y
 * cada foto se pega en el documento.
 *
 * Tarjeta por tarjeta y no la página entera: así ninguna gráfica queda partida
 * entre dos hojas, y el documento pagina como un documento y no como un
 * pantallazo largo.
 *
 * El marco —encabezado institucional y pie con quién lo generó— es el mismo que
 * el del reporte de tablas, porque los dos son el mismo reporte.
 */

const COLOR_APARTADO: [number, number, number] = [100, 116, 139];
const COLOR_BULLET: [number, number, number] = [245, 130, 15];
const ESPACIO_TARJETA = 16;

/** Lo que tarda la más lenta de las animaciones de entrada, con holgura. */
const ESPERA_ANIMACION = 1000;

const esperar = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

/**
 * Pasea la página de arriba abajo antes de fotografiar nada.
 *
 * Las tarjetas no dibujan su gráfica hasta que asoman en pantalla —así la
 * animación no se gasta con nadie mirando— y además la dibujan animada. Si se
 * fotografía sin más, lo que sale en el PDF es lo que hubiera en ese instante:
 * las de abajo en blanco y las recién asomadas a medio trazar, que es como la
 * dona salía con una sola porción y las líneas sin color.
 *
 * Así que primero se recorre la página entera para que todas se monten, se
 * espera a que terminen de animar, y recién entonces se fotografían. Al
 * terminar, la página vuelve a donde estaba: para el usuario no pasó nada.
 */
async function asegurarGraficasDibujadas(referencia: HTMLElement) {
  const marco =
    (referencia.closest("main") as HTMLElement | null) ??
    (document.scrollingElement as HTMLElement | null);
  if (!marco) {
    await esperar(ESPERA_ANIMACION);
    return;
  }

  const desdeDonde = marco.scrollTop;
  const paso = Math.max(200, marco.clientHeight * 0.85);

  for (let y = 0; y < marco.scrollHeight; y += paso) {
    marco.scrollTo({ top: y, behavior: "auto" });
    // Dos fotogramas largos: el aviso de «ya asomé» no llega en el mismo.
    await esperar(80);
  }

  marco.scrollTo({ top: desdeDonde, behavior: "auto" });
  await esperar(ESPERA_ANIMACION);
}

/** Un apartado del reporte con las tarjetas que hay que fotografiar. */
export interface ApartadoImprimible {
  titulo: string;
  tarjetas: HTMLElement[];
}

/**
 * La tipografía se incrusta una sola vez y se reparte a todas las fotos: cada
 * `toPng` la resolvería por su cuenta, y son decenas de descargas del mismo
 * archivo. Si el navegador no deja leerla, se sigue sin ella —el PDF sale con
 * la fuente de respaldo, que es mejor que no salir—.
 */
async function tipografiaIncrustada(elemento: HTMLElement): Promise<string | undefined> {
  try {
    return await getFontEmbedCSS(elemento);
  } catch {
    return undefined;
  }
}

/**
 * JPEG y no PNG: el PNG guarda cada píxel tal cual y un reporte de treinta
 * gráficas se iba a más de cien megas, imposible de adjuntar a un correo. Con
 * calidad alta sobre fondo blanco la diferencia no se ve, y el archivo baja a
 * una fracción.
 */
/**
 * Despliega lo que en pantalla está metido en un scroll.
 *
 * Una lista de treinta agrupaciones o una tabla más ancha que su tarjeta se
 * leen en pantalla desplazándolas; en papel no hay dónde desplazar, así que lo
 * que no cabía salía cortado. Antes de la foto se les quita el recorte para que
 * la tarjeta crezca a lo que realmente mide, y después se deja todo como
 * estaba.
 *
 * Solo se tocan los recortes de contenido (`auto` y `scroll`). Los `hidden` se
 * respetan: ahí el recorte es deliberado —los reflejos de las tarjetas de
 * cifras se salen de su caja a propósito— y desplegarlos las arruinaría.
 */
function desplegarRecortes(tarjeta: HTMLElement): Map<HTMLElement, string> {
  const original = new Map<HTMLElement, string>();
  let creceALoAncho = false;

  for (const el of [tarjeta, ...tarjeta.querySelectorAll<HTMLElement>("*")]) {
    const estilo = getComputedStyle(el);
    const recortaX = estilo.overflowX === "auto" || estilo.overflowX === "scroll";
    const recortaY = estilo.overflowY === "auto" || estilo.overflowY === "scroll";
    if (!recortaX && !recortaY) continue;

    const sobraAncho = el.scrollWidth > el.clientWidth + 1;
    const sobraAlto = el.scrollHeight > el.clientHeight + 1;
    if (!sobraAncho && !sobraAlto) continue;

    if (!original.has(el)) original.set(el, el.style.cssText);
    el.style.overflow = "visible";
    el.style.maxHeight = "none";
    if (sobraAncho) creceALoAncho = true;
  }

  // Si lo que sobraba era ancho, la tarjeta también tiene que ensancharse: si
  // no, la tabla se saldría de su propio fondo blanco y la foto la cortaría
  // igual, solo que sin barra de desplazamiento.
  if (creceALoAncho) {
    if (!original.has(tarjeta)) original.set(tarjeta, tarjeta.style.cssText);
    tarjeta.style.width = "max-content";
    tarjeta.style.maxWidth = "none";
  }

  return original;
}

function restaurarRecortes(original: Map<HTMLElement, string>) {
  for (const [el, cssText] of original) el.style.cssText = cssText;
}

async function fotografiar(elemento: HTMLElement, fontEmbedCSS?: string): Promise<string> {
  return toJpeg(elemento, {
    quality: 0.94,
    fontEmbedCSS,
    skipFonts: fontEmbedCSS === undefined,
    // El doble de píxeles que en pantalla: en papel, una captura a 1x se ve
    // borrosa en cuanto el texto es pequeño.
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    // Las tarjetas se dibujan con su propio ancho de pantalla; si el navegador
    // está angosto, la foto sale angosta. Se fija el ancho real del elemento
    // para que la proporción no dependa del tamaño de la ventana.
    width: elemento.offsetWidth,
    height: elemento.offsetHeight,
  });
}

export async function generarPdfDeGraficas(
  categoria: string,
  titulo: string,
  subtitulo: string,
  apartados: ApartadoImprimible[],
  nombreArchivo: string,
  /** Se llama tras cada foto: un reporte largo tarda, y hay que contarlo. */
  onProgreso?: (hechas: number, total: number) => void,
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const anchoUtil = anchoPagina - MARGEN_X * 2;
  const alturaTope = altoPagina - ALTO_PIE;

  const total = apartados.reduce((suma, a) => suma + a.tarjetas.length, 0);
  let hechas = 0;

  const primera = apartados[0]?.tarjetas[0];
  if (primera) await asegurarGraficasDibujadas(primera);
  const tipografia = primera ? await tipografiaIncrustada(primera) : undefined;

  let y = encabezadoInstitucional(doc, categoria, titulo);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_APARTADO);
  doc.text(subtitulo, MARGEN_X, y);
  y += 20;

  for (const apartado of apartados) {
    if (y + 60 > alturaTope) {
      doc.addPage();
      y = 50;
    }

    doc.setFillColor(...COLOR_BULLET);
    doc.circle(MARGEN_X + 2, y - 3, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_APARTADO);
    doc.text(sinLetraDeApartado(apartado.titulo), MARGEN_X + 10, y);
    y += 14;

    for (const tarjeta of apartado.tarjetas) {
      const recortes = desplegarRecortes(tarjeta);
      // Medidas y foto se toman con la tarjeta ya desplegada, y recién
      // entonces vuelve a su tamaño de pantalla.
      const ancho0 = tarjeta.offsetWidth;
      const alto0 = tarjeta.offsetHeight;
      const imagen = await fotografiar(tarjeta, tipografia);
      restaurarRecortes(recortes);

      const proporcion = alto0 / ancho0;
      let ancho = anchoUtil;
      let alto = ancho * proporcion;

      // Una tarjeta más alta que la hoja se reduce hasta caber: preferible
      // pequeña y entera que partida en dos páginas.
      const altoMaximo = alturaTope - 50;
      if (alto > altoMaximo) {
        alto = altoMaximo;
        ancho = alto / proporcion;
      }

      if (y + alto > alturaTope) {
        doc.addPage();
        y = 50;
      }

      doc.addImage(imagen, "JPEG", MARGEN_X, y, ancho, alto, undefined, "FAST");
      y += alto + ESPACIO_TARJETA;

      hechas += 1;
      onProgreso?.(hechas, total);
      // Un respiro entre fotos: sin él, el navegador no repinta y el aviso de
      // avance se queda congelado en la primera cifra hasta el final.
      await esperar(0);
    }

    y += 6;
  }

  sellarPaginas(doc);
  doc.save(nombreArchivo);
}
