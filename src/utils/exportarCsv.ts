/**
 * Descarga una tabla como archivo que Excel abre de una vez.
 *
 * Es CSV y no `.xlsx` a propósito: un xlsx de verdad obliga a cargar una
 * librería entera —y a que el navegador la descargue— para lo que aquí es una
 * lista de filas sin fórmulas, sin formatos y sin hojas. El CSV pesa lo que
 * pesan los datos y se abre igual con doble clic.
 *
 * Dos detalles que deciden si Excel lo abre bien o lo abre mal:
 *
 * - **Punto y coma en vez de coma.** En la configuración regional de Honduras
 *   —como en el resto del español— la coma es el separador decimal, así que un
 *   CSV separado por comas se abre con todo amontonado en una columna.
 * - **BOM al principio.** Sin él, Excel lee el archivo en la codificación del
 *   sistema y las tildes y las eñes salen rotas.
 */

const SEPARADOR = ";";
const BOM = "﻿";

/** Un campo va entre comillas si lleva algo que rompería la fila. */
function escapar(valor: string): string {
  const limpio = valor.replace(/\r?\n/g, " ").trim();
  return /[";]/.test(limpio) ? `"${limpio.replace(/"/g, '""')}"` : limpio;
}

export function descargarCsv(nombreArchivo: string, cabeceras: string[], filas: string[][]) {
  const contenido = [cabeceras, ...filas]
    .map((fila) => fila.map(escapar).join(SEPARADOR))
    .join("\r\n");

  const blob = new Blob([BOM + contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
