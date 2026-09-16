/**
 * Descarga una tabla como libro de Excel (`.xlsx`) de verdad.
 *
 * Antes se bajaba un CSV con el nombre de Excel. Se abría, sí, pero no *era*
 * una hoja: sin encabezado marcado, sin filtros, sin anchos, y con Excel
 * preguntando por el separador cada vez que la configuración regional no
 * coincidía. Lo que se adjunta a un oficio tiene que abrirse y verse ya hecho.
 *
 * Está escrito a mano y sin librería a propósito. Un `.xlsx` es un zip con
 * cinco archivos XML dentro; guardándolos sin comprimir —Excel los acepta
 * igual— todo el formato cabe en este archivo, y la alternativa era cargar
 * media librería de hojas de cálculo para escribir una lista de filas sin
 * fórmulas.
 */

/** El azul de la casa para la franja del encabezado, en el formato de Excel. */
const NAVY = "FF003875";

// ── El zip ────────────────────────────────────────────────────────────────

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let bit = 0; bit < 8; bit += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[i] = c >>> 0;
  }
  return tabla;
})();

/**
 * Los bytes de un archivo. El `ArrayBuffer` explícito no es adorno de tipos:
 * `TextEncoder` promete un búfer que también podría ser compartido, y `Blob`
 * solo acepta de los normales.
 */
type Bytes = Uint8Array<ArrayBuffer>;

/** Texto a bytes UTF-8, que es como van todas las partes de un `.xlsx`. */
function aBytes(contenido: string): Bytes {
  return new TextEncoder().encode(contenido) as Bytes;
}

function crc32(datos: Bytes): number {
  let c = 0xffffffff;
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

interface Archivo {
  nombre: string;
  datos: Bytes;
}

/**
 * Un zip con los archivos guardados tal cual (método «store»). Sin comprimir
 * el libro pesa lo que pesa su XML —unas decenas de kilobytes para una tabla
 * de trabajo—, y a cambio no hace falta un compresor.
 */
function empaquetarZip(archivos: Archivo[]): Blob {
  const locales: Bytes[] = [];
  const central: Bytes[] = [];
  let posicion = 0;

  for (const archivo of archivos) {
    const nombre = aBytes(archivo.nombre);
    const suma = crc32(archivo.datos);

    const cabecera = new DataView(new ArrayBuffer(30));
    cabecera.setUint32(0, 0x04034b50, true);
    cabecera.setUint16(4, 20, true); // versión necesaria
    cabecera.setUint16(6, 0x0800, true); // nombres en UTF-8
    cabecera.setUint16(8, 0, true); // sin comprimir
    cabecera.setUint16(10, 0, true); // hora
    cabecera.setUint16(12, 0x2821, true); // fecha: 1 de enero de 2000
    cabecera.setUint32(14, suma, true);
    cabecera.setUint32(18, archivo.datos.length, true);
    cabecera.setUint32(22, archivo.datos.length, true);
    cabecera.setUint16(26, nombre.length, true);
    cabecera.setUint16(28, 0, true); // sin campo extra

    const entrada = new DataView(new ArrayBuffer(46));
    entrada.setUint32(0, 0x02014b50, true);
    entrada.setUint16(4, 20, true); // versión de quien lo escribió
    entrada.setUint16(6, 20, true);
    entrada.setUint16(8, 0x0800, true);
    entrada.setUint16(10, 0, true);
    entrada.setUint16(12, 0, true);
    entrada.setUint16(14, 0x2821, true);
    entrada.setUint32(16, suma, true);
    entrada.setUint32(20, archivo.datos.length, true);
    entrada.setUint32(24, archivo.datos.length, true);
    entrada.setUint16(28, nombre.length, true);
    entrada.setUint16(30, 0, true);
    entrada.setUint16(32, 0, true);
    entrada.setUint16(34, 0, true);
    entrada.setUint16(36, 0, true);
    entrada.setUint32(38, 0, true);
    entrada.setUint32(42, posicion, true);

    locales.push(new Uint8Array(cabecera.buffer), nombre, archivo.datos);
    central.push(new Uint8Array(entrada.buffer), nombre);
    posicion += 30 + nombre.length + archivo.datos.length;
  }

  const tamanoCentral = central.reduce((total, parte) => total + parte.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(4, 0, true);
  fin.setUint16(6, 0, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamanoCentral, true);
  fin.setUint32(16, posicion, true);
  fin.setUint16(20, 0, true);

  return new Blob([...locales, ...central, new Uint8Array(fin.buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ── La hoja ───────────────────────────────────────────────────────────────

/** 0 → A, 25 → Z, 26 → AA: el nombre de la columna en Excel. */
function letraColumna(indice: number): string {
  let n = indice;
  let letras = "";
  do {
    letras = String.fromCharCode(65 + (n % 26)) + letras;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return letras;
}

function escapar(texto: string): string {
  return texto
    // Un salto de línea dentro de una celda solo se ve si la celda tiene el
    // ajuste de texto puesto; sin él, Excel enseña la primera línea y esconde
    // el resto. Se vuelve un espacio, como en la tabla de la pantalla.
    .replace(/\r?\n/g, " ")
    // Los caracteres de control rompen el XML y no se ven; fuera antes de nada.
    .replace(/[\p{Cc}]/gu, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Lo que parece un número entra como número, para que Excel pueda sumarlo. Un
 * «87%» o una cuenta que empieza por cero se quedan como texto: convertirlos
 * cambiaría lo que dice la celda.
 *
 * El tope de nueve dígitos no es capricho de Excel sino de esta plataforma:
 * las tiras largas de dígitos que salen en estas tablas son números de cuenta,
 * de identidad o de teléfono. Como número, Excel les quita los ceros de
 * delante y a partir de cierto ancho los enseña en notación científica —una
 * cuenta que sale como «2,02E+10» en un oficio es un error—.
 */
function esNumero(valor: string): boolean {
  return /^-?\d{1,9}(\.\d+)?$/.test(valor) && !/^-?0\d/.test(valor);
}

function celda(referencia: string, valor: string, cabecera: boolean): string {
  const estilo = cabecera ? ' s="1"' : "";
  if (!cabecera && esNumero(valor)) {
    return `<c r="${referencia}"${estilo}><v>${valor}</v></c>`;
  }
  if (valor === "") return `<c r="${referencia}"${estilo}/>`;
  return `<c r="${referencia}"${estilo} t="inlineStr"><is><t xml:space="preserve">${escapar(
    valor,
  )}</t></is></c>`;
}

/**
 * Ancho de cada columna, del contenido más largo que lleva. Sin esto Excel
 * abre con todo a 8 caracteres y la mitad de la tabla sale como `#####`.
 */
function anchos(cabeceras: string[], filas: string[][]): string {
  const columnas = cabeceras.map((cabecera, i) => {
    const largo = filas.reduce((mayor, fila) => Math.max(mayor, (fila[i] ?? "").length), cabecera.length);
    return Math.min(Math.max(largo + 3, 10), 60);
  });
  return `<cols>${columnas
    .map((ancho, i) => `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"/>`)
    .join("")}</cols>`;
}

function hoja(cabeceras: string[], filas: string[][]): string {
  const filasXml = [cabeceras, ...filas]
    .map(
      (fila, y) =>
        `<row r="${y + 1}">${cabeceras
          .map((_, x) => celda(`${letraColumna(x)}${y + 1}`, fila[x] ?? "", y === 0))
          .join("")}</row>`,
    )
    .join("");

  const ultima = `${letraColumna(cabeceras.length - 1)}${filas.length + 1}`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${ultima}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${anchos(
    cabeceras,
    filas,
  )}<sheetData>${filasXml}</sheetData><autoFilter ref="A1:${ultima}"/></worksheet>`;
}

/** El estilo 1 es la franja del encabezado: negrita, blanco sobre navy. */
const ESTILOS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="${NAVY}"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf></cellXfs></styleSheet>`;

const TIPOS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

const RELACIONES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

const RELACIONES_LIBRO = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

/** El nombre de una pestaña de Excel: 31 caracteres y sin `:\/?*[]`. */
function nombreDeHoja(nombre: string): string {
  const limpio = nombre.replace(/[\\/?*[\]:]/g, " ").trim();
  return limpio.slice(0, 31) || "Datos";
}

function libro(titulo: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapar(
    nombreDeHoja(titulo),
  )}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
}

/**
 * Descarga las filas como libro de Excel.
 *
 * @param nombreArchivo Sin extensión; se le añade la fecha y el `.xlsx`.
 * @param titulo Cómo se llama la pestaña dentro del libro.
 */
export function descargarExcel(
  nombreArchivo: string,
  cabeceras: string[],
  filas: string[][],
  titulo = "Datos",
) {
  const blob = empaquetarZip([
    { nombre: "[Content_Types].xml", datos: aBytes(TIPOS) },
    { nombre: "_rels/.rels", datos: aBytes(RELACIONES) },
    { nombre: "xl/workbook.xml", datos: aBytes(libro(titulo)) },
    { nombre: "xl/_rels/workbook.xml.rels", datos: aBytes(RELACIONES_LIBRO) },
    { nombre: "xl/styles.xml", datos: aBytes(ESTILOS) },
    { nombre: "xl/worksheets/sheet1.xml", datos: aBytes(hoja(cabeceras, filas)) },
  ]);

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}
