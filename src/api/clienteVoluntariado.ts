// Cliente HTTP de voae-voluntariado y voae-catalogo. Giras usa su propio
// cliente (cliente.ts). Las URLs salen de .env.local (VITE_API_*).

export class ErrorApi extends Error {
  readonly estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }

  /** 503: la base serverless de Azure estaba en pausa y se está reanudando (~70 s). */
  get baseDespertando(): boolean {
    return this.estado === 503;
  }
}

// Sin sesión real todavía: esto solo alimenta las columnas usuarioRegistro.
const USUARIO_REGISTRO = "prototipo-frontend";

function baseDe(variable: string, valor: string | undefined): string {
  if (!valor) {
    throw new ErrorApi(0, `Falta ${variable} en .env.local. Reinicia \`npm run dev\` después de crearlo.`);
  }
  return valor.replace(/\/$/, "");
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

async function llamar<T>(
  base: string,
  ruta: string,
  metodo: string,
  cuerpo?: unknown,
  reintentar = metodo === "GET",
): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: { "Content-Type": "application/json", "X-Voae-Usuario": USUARIO_REGISTRO },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    // Un 503 de API Gateway por throttling llega sin cabeceras CORS y el
    // navegador lo reporta como fallo de red: se reintenta igual que un 503.
    if (reintentar) {
      await esperar(2000);
      return llamar<T>(base, ruta, metodo, cuerpo, false);
    }
    throw new ErrorApi(0, "No se pudo contactar la API. Revisa tu conexión.");
  }

  // 503: la base de Azure despertando, o Lambda rechazando por el límite de
  // concurrencia de la cuenta. Se reintenta una vez.
  if (respuesta.status === 503 && reintentar) {
    await esperar(2000);
    return llamar<T>(base, ruta, metodo, cuerpo, false);
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : undefined;

  if (!respuesta.ok) {
    // Los mensajes 4xx vienen de los triggers o de la validación y ya están
    // redactados para el usuario: se muestran tal cual.
    const mensaje = datos?.error ?? `Error ${respuesta.status}`;
    throw new ErrorApi(respuesta.status, mensaje);
  }
  return datos as T;
}

export function crearCliente(variable: string, valor: string | undefined) {
  return {
    get: <T>(ruta: string) => llamar<T>(baseDe(variable, valor), ruta, "GET"),
    post: <T>(ruta: string, cuerpo?: unknown) => llamar<T>(baseDe(variable, valor), ruta, "POST", cuerpo ?? {}),
    put: <T>(ruta: string, cuerpo?: unknown) => llamar<T>(baseDe(variable, valor), ruta, "PUT", cuerpo ?? {}),
    delete: <T>(ruta: string) => llamar<T>(baseDe(variable, valor), ruta, "DELETE"),
  };
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) {
    if (error.baseDespertando) {
      return "La base de datos se está despertando (tarda cerca de un minuto después de un rato sin uso). Reintenta en unos segundos.";
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
