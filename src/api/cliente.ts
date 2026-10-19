// Cliente HTTP mínimo para las APIs de VOAE (API Gateway + Lambda).
// Todas las respuestas de error de las funciones tienen la forma
// `{ error: string, detalles?: unknown }`; aquí se convierten en `ErrorApi`.

const BASE_GIRAS = (import.meta.env.VITE_API_GIRAS_URL as string | undefined)?.replace(/\/+$/, "");

export class ErrorApi extends Error {
  /** Código HTTP, o 0 si ni siquiera hubo respuesta (sin red, CORS, URL mal escrita). */
  estado: number;
  detalles?: unknown;

  constructor(estado: number, mensaje: string, detalles?: unknown) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.detalles = detalles;
  }
}

/**
 * Quién hace la petición. Las funciones lo guardan en las columnas de
 * auditoría (`usuarioRegistro`); no autoriza nada. Lo fija el UserContext.
 *
 * Viaja como parámetro `usuarioRegistro` de la URL y no como cabecera
 * `X-Voae-Usuario`: una cabecera propia obliga al navegador a un preflight CORS,
 * y la API Gateway creada desde la consola solo admite `Content-Type`, así que
 * rechazaría toda petición que la llevara.
 */
let usuarioDeAuditoria: string | null = null;
export function fijarUsuarioDeAuditoria(usuario: string | null) {
  usuarioDeAuditoria = usuario;
}

type ValorConsulta = string | number | boolean | null | undefined;

interface OpcionesPeticion {
  consulta?: Record<string, ValorConsulta>;
  cuerpo?: unknown;
}

function armarUrl(base: string, ruta: string, consulta?: Record<string, ValorConsulta>): string {
  const parametros = new URLSearchParams();
  if (usuarioDeAuditoria) parametros.set("usuarioRegistro", usuarioDeAuditoria);
  for (const [clave, valor] of Object.entries(consulta ?? {})) {
    if (valor !== undefined && valor !== null && valor !== "") parametros.set(clave, String(valor));
  }
  const texto = parametros.toString();
  return `${base}${ruta}${texto ? `?${texto}` : ""}`;
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

async function solicitar<T>(
  base: string | undefined,
  metodo: "GET" | "POST" | "PUT" | "DELETE",
  ruta: string,
  { consulta, cuerpo }: OpcionesPeticion = {},
  reintentar = metodo === "GET",
): Promise<T> {
  if (!base) {
    throw new ErrorApi(0, "Falta la URL de la API. Define VITE_API_GIRAS_URL en .env.local y reinicia `npm run dev`.");
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(armarUrl(base, ruta, consulta), {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi(0, "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  // La base de Azure se pausa por inactividad y tarda en despertar: el primer
  // intento tras un rato sin uso devuelve 503. Se reintenta una vez.
  if (respuesta.status === 503 && reintentar) {
    await esperar(4000);
    return solicitar<T>(base, metodo, ruta, { consulta, cuerpo }, false);
  }

  if (respuesta.status === 204) return undefined as T;

  const texto = await respuesta.text();
  let datos: unknown = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    const cuerpoError = (datos ?? {}) as { error?: string; detalles?: unknown; message?: string };
    throw new ErrorApi(
      respuesta.status,
      cuerpoError.error ?? cuerpoError.message ?? `El servidor respondió ${respuesta.status}.`,
      cuerpoError.detalles,
    );
  }

  return datos as T;
}

/** Los cuatro verbos contra la API de Giras. `ruta` empieza con "/": `/solicitudes/3`. */
export const apiGiras = {
  get: <T>(ruta: string, consulta?: Record<string, ValorConsulta>) =>
    solicitar<T>(BASE_GIRAS, "GET", ruta, { consulta }),
  post: <T>(ruta: string, cuerpo?: unknown) => solicitar<T>(BASE_GIRAS, "POST", ruta, { cuerpo: cuerpo ?? {} }),
  put: <T>(ruta: string, cuerpo: unknown) => solicitar<T>(BASE_GIRAS, "PUT", ruta, { cuerpo }),
  delete: (ruta: string) => solicitar<void>(BASE_GIRAS, "DELETE", ruta),
};

/** Mensaje legible para mostrar al usuario a partir de cualquier error capturado. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) {
    if (error.estado === 503) {
      return "El sistema está despertando. Espera unos segundos e inténtalo de nuevo.";
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
