// Cliente HTTP de PROCAD: voae-procad, y lo poco que PROCAD le pide a
// voae-catalogo (el período activo).
//
// Sigue el mismo contrato que api/cliente.ts —errores `{ error }` convertidos
// en ErrorApi, un reintento cuando Azure responde 503 por estar despertando—,
// pero en archivo propio para no tocar el cliente de Giras. ErrorApi y
// mensajeDeError se reutilizan de allá, así que las pantallas tratan los
// errores igual en los dos módulos.
//
// Variables en .env.local (git lo ignora):
//   VITE_API_PROCAD_URL     base de voae-procad, p. ej. https://XXXX.execute-api.us-east-1.amazonaws.com/v1/procad
//   VITE_API_CATALOGO_URL   base de voae-catalogo, …/v1/catalogo
//   VITE_PROCAD_ID_PERSONA  idPersona con el que firma el administrador mientras no haya sesión real
//
// Sin VITE_API_PROCAD_URL, PROCAD sigue con sus datos de demostración.
import { ErrorApi } from "./cliente";

const limpiar = (url: unknown) =>
  typeof url === "string" && url.trim() !== "" ? url.trim().replace(/\/+$/, "") : undefined;

const BASE_PROCAD = limpiar(import.meta.env.VITE_API_PROCAD_URL);
const BASE_CATALOGO = limpiar(import.meta.env.VITE_API_CATALOGO_URL);

/** PROCAD lee y escribe en la API solo si está configurada. */
export const procadConectado = BASE_PROCAD !== undefined;

/**
 * Con qué persona firma el administrador (resolver, autorizar, validar…).
 * Los triggers de la base comprueban que tenga el rol ADMINISTRADOR_PROCAD.
 * Lo reemplaza el idPersona de la sesión cuando exista login.
 */
export const idPersonaProcad: number | null = (() => {
  const valor = Number(import.meta.env.VITE_PROCAD_ID_PERSONA);
  return Number.isInteger(valor) && valor > 0 ? valor : null;
})();

/** Quién hace la petición; solo alimenta las columnas de auditoría (`usuarioRegistro`). */
let usuarioDeAuditoria: string | null = null;
export function fijarUsuarioProcad(usuario: string | null) {
  usuarioDeAuditoria = usuario;
}

type ValorConsulta = string | number | boolean | null | undefined;

function armarUrl(base: string, ruta: string, consulta?: Record<string, ValorConsulta>): string {
  const parametros = new URLSearchParams();
  // Como parámetro y no como cabecera: una cabecera propia obliga al navegador a un preflight CORS.
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
  variable: string,
  metodo: "GET" | "POST" | "PUT",
  ruta: string,
  { consulta, cuerpo }: { consulta?: Record<string, ValorConsulta>; cuerpo?: unknown } = {},
  reintentar = metodo === "GET",
): Promise<T> {
  if (!base) {
    throw new ErrorApi(0, `Falta la URL de la API. Define ${variable} en .env.local y reinicia \`npm run dev\`.`);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(armarUrl(base, ruta, consulta), {
      method: metodo,
      headers: cuerpo !== undefined ? { "Content-Type": "application/json" } : {},
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi(0, "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  // La base de Azure se pausa por inactividad: el primer intento tras un rato sin uso da 503.
  if (respuesta.status === 503 && reintentar) {
    await esperar(4000);
    return solicitar<T>(base, variable, metodo, ruta, { consulta, cuerpo }, false);
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
    const error = (datos ?? {}) as { error?: string; detalles?: unknown; message?: string };
    throw new ErrorApi(
      respuesta.status,
      error.error ?? error.message ?? `El servidor respondió ${respuesta.status}.`,
      error.detalles,
    );
  }

  return datos as T;
}

/** voae-procad. `ruta` empieza con "/": `/solicitudes/3`. */
export const apiProcad = {
  get: <T>(ruta: string, consulta?: Record<string, ValorConsulta>) =>
    solicitar<T>(BASE_PROCAD, "VITE_API_PROCAD_URL", "GET", ruta, { consulta }),
  post: <T>(ruta: string, cuerpo?: unknown) =>
    solicitar<T>(BASE_PROCAD, "VITE_API_PROCAD_URL", "POST", ruta, { cuerpo: cuerpo ?? {} }),
  put: <T>(ruta: string, cuerpo: unknown) =>
    solicitar<T>(BASE_PROCAD, "VITE_API_PROCAD_URL", "PUT", ruta, { cuerpo }),
};

/** voae-catalogo, solo lectura. */
export const apiCatalogo = {
  get: <T>(ruta: string, consulta?: Record<string, ValorConsulta>) =>
    solicitar<T>(BASE_CATALOGO, "VITE_API_CATALOGO_URL", "GET", ruta, { consulta }),
};
