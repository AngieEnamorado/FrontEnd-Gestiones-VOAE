// Subida de archivos de Voluntariado a S3.
//
// El archivo va del navegador directo al bucket: la API solo firma la subida
// (POST /archivos/subidas) y devuelve la llave, que después se registra con
// adjuntarASolicitud o agregarFoto. La Lambda nunca recibe el binario.
//
// Si la API desplegada todavía no tiene la ruta (404) o no tiene bucket (501),
// se registra un nombre "prototipo/..." como antes, para que el flujo no se
// rompa mientras no se despliegue.
import { ErrorApi } from "./clienteVoluntariado";
import { voluntariadoApi } from "./voluntariado";

export type ProcesoArchivo = "SOLICITUD_GRUPO" | "ACTIVIDAD" | "COMPROBANTE";

/** Lo mismo que acepta el servidor. Se valida antes para no gastar una firma. */
export const TIPOS_ARCHIVO: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WEBP",
};
export const TAMANIO_MAXIMO_MB = 10;

const CARPETA_PROTOTIPO: Record<ProcesoArchivo, string> = {
  SOLICITUD_GRUPO: "solicitudes",
  ACTIVIDAD: "actividades",
  COMPROBANTE: "actividades",
};

export function validarArchivo(archivo: File): string | null {
  if (!(archivo.type in TIPOS_ARCHIVO)) {
    return `${archivo.name}: tipo no permitido. Se aceptan ${Object.values(TIPOS_ARCHIVO).join(", ")}.`;
  }
  if (archivo.size > TAMANIO_MAXIMO_MB * 1024 * 1024) {
    return `${archivo.name}: pesa más de ${TAMANIO_MAXIMO_MB} MB.`;
  }
  return null;
}

/** Sube el archivo y devuelve la llave que hay que registrar en la API. */
export async function subirArchivo(proceso: ProcesoArchivo, idReferencia: number, archivo: File): Promise<string> {
  const invalido = validarArchivo(archivo);
  if (invalido) throw new ErrorApi(400, invalido);

  let firma;
  try {
    firma = await voluntariadoApi.firmarSubida({
      proceso,
      idReferencia,
      nombreArchivo: archivo.name,
      tipoContenido: archivo.type,
    });
  } catch (e) {
    // 404 de ruta inexistente (API sin desplegar) o 501 (sin bucket). Un 404
    // porque no existe la actividad o la solicitud sí es un error real.
    const sinSoporte = e instanceof ErrorApi &&
      (e.estado === 501 || (e.estado === 404 && e.message.startsWith("No existe la ruta")));
    if (sinSoporte) {
      return `prototipo/${CARPETA_PROTOTIPO[proceso]}/${idReferencia}/${archivo.name}`;
    }
    throw e;
  }

  // El orden importa: S3 exige que el archivo sea el último campo del formulario.
  const formulario = new FormData();
  for (const [clave, valor] of Object.entries(firma.campos)) formulario.append(clave, valor);
  formulario.append("file", archivo);

  let respuesta: Response;
  try {
    respuesta = await fetch(firma.url, { method: "POST", body: formulario });
  } catch {
    throw new ErrorApi(0, "No se pudo subir el archivo. Revisa tu conexión.");
  }
  if (!respuesta.ok) {
    const texto = await respuesta.text();
    const codigo = /<Code>([^<]+)<\/Code>/.exec(texto)?.[1];
    const mensaje =
      codigo === "EntityTooLarge"
        ? `${archivo.name}: pesa más de ${TAMANIO_MAXIMO_MB} MB.`
        : codigo === "AccessDenied" && texto.includes("expired")
          ? "La autorización de subida venció. Intenta de nuevo."
          : `No se pudo subir ${archivo.name} (S3 respondió ${respuesta.status}${codigo ? `: ${codigo}` : ""}).`;
    throw new ErrorApi(respuesta.status, mensaje);
  }
  return firma.llave;
}
