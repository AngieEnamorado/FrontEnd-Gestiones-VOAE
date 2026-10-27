import {
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineServerStack,
} from "react-icons/hi2";
import { procadConectado } from "../../api/clienteProcad";
import { listarGrupos, listarUsuarios, obtenerSalud } from "../../api/procad";
import { useConsulta } from "../../api/useConsulta";

const URL_PROCAD = String(import.meta.env.VITE_API_PROCAD_URL ?? "").trim();

/** La red interna de la universidad; cualquier otra IP (o ninguna) es Azure u otro servidor. */
const esBaseUniversidad = (ip: string | null) => ip?.startsWith("10.8.") ?? false;

const formatoHora = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "medium" })
    : "—";

/**
 * A qué base está llegando PROCAD, comprobado en vivo.
 *
 * Servidor, IP y base los responde la propia base en GET /salud, y los
 * conteos salen de dos lecturas reales: si aquí aparecen, el frontend lee de
 * la base y no de los datos de demostración. Es herramienta de la etapa sin
 * sesión, como el resto de Modo de vista.
 */
export default function TarjetaConexion() {
  const { datos, cargando, error, recargar } = useConsulta(
    async () => {
      const [salud, grupos, usuarios] = await Promise.all([obtenerSalud(), listarGrupos(), listarUsuarios()]);
      return { salud, grupos: grupos.length, usuarios: usuarios.length };
    },
    [],
  );

  if (!procadConectado) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
        <p className="flex items-center gap-2 font-bold">
          <HiOutlineExclamationTriangle className="h-5 w-5" aria-hidden="true" />
          PROCAD usa datos de demostración
        </p>
        <p className="mt-1.5">
          No hay <code className="font-mono text-xs">VITE_API_PROCAD_URL</code>: nada de lo que se haga se guarda en
          una base. Para usar la de la universidad, corra{" "}
          <code className="font-mono text-xs">node infra/probar-universidad.mjs</code> en
          FuncionesLambdaGestionesVOAE.
        </p>
      </section>
    );
  }

  const salud = datos?.salud;
  const universidad = esBaseUniversidad(salud?.ipServidor ?? null);
  const backendLocal = /localhost|127\.0\.0\.1/.test(URL_PROCAD);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-unah-navy">
            <HiOutlineServerStack className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-bold text-slate-800">Conexión con la base</span>
            <span className="block text-xs break-all text-slate-500">
              {backendLocal ? "Backend en esta PC" : "Backend en AWS"} · {URL_PROCAD}
            </span>
          </span>
        </span>

        <button
          type="button"
          onClick={recargar}
          disabled={cargando}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <HiOutlineArrowPath className={`h-3.5 w-3.5 ${cargando ? "animate-spin" : ""}`} aria-hidden="true" />
          {cargando ? "Comprobando…" : "Comprobar de nuevo"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
          <p className="font-bold">No se llegó a la base.</p>
          <p className="mt-1">{error}</p>
          {backendLocal && (
            <p className="mt-1.5 text-red-600">
              El frontend apunta a un backend en esta PC: compruebe que{" "}
              <code className="font-mono text-xs">node infra/probar-universidad.mjs</code> sigue corriendo.
            </p>
          )}
        </div>
      ) : salud ? (
        <>
          <p
            className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
              universidad ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {universidad ? (
              <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <HiOutlineExclamationTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {universidad ? "Base de la universidad" : "No es la base de la universidad"}
          </p>

          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Servidor", `${salud.ipServidor ?? "sin IP"}${salud.servidor ? ` (${salud.servidor})` : ""}`],
                ["Base de datos", salud.base ?? "—"],
                ["Hora en la base", formatoHora(salud.ahoraEnBase)],
                ["Respuesta", `${salud.msConsulta} ms${salud.contenedorFrio ? " · primera conexión" : ""}`],
                ["Grupos leídos", String(datos.grupos)],
                ["Usuarios PROCAD leídos", String(datos.usuarios)],
              ] as const
            ).map(([etiqueta, valor]) => (
              <div key={etiqueta} className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</dt>
                <dd className="mt-0.5 font-semibold break-words text-slate-700 tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Comprobando la conexión…</p>
      )}
    </section>
  );
}
