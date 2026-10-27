import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineCog6Tooth,
  HiOutlineEye,
  HiOutlineFlag,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { procadConectado } from "../../api/clienteProcad";
import { mensajeDeError } from "../../api/cliente";
import { listarAccesos, listarUsuarios, obtenerEstudiante } from "../../api/procad";
import { useConsulta } from "../../api/useConsulta";
import TarjetaConexion from "../../components/procad/TarjetaConexion";
import { useIdentidadesProcad, useRolProcad } from "../../context/UserContext";
import { paginasProcad, rutaInicialProcad } from "../../router/rolesProcad";
import { ETIQUETA_ROL_PROCAD } from "../../types";
import type { RolProcad } from "../../types";

/** Qué rol de la base (Catalogo.tblRoles) tiene que tener la persona para actuar en cada rol. */
const ROL_BASE: Partial<Record<RolProcad, string>> = {
  director: "DIRECTOR",
};

/**
 * "Actuar como": con qué persona de la base se hace todo lo que ese rol
 * firma (el director que resuelve, propone o pide una expulsión). Sale de la
 * API —quienes tienen el rol en la base, con los grupos que dirigen—, no de
 * datos escritos aquí.
 */
function SelectorIdentidad({ rol }: { rol: RolProcad }) {
  const idSelector = useId();
  const rolBase = ROL_BASE[rol];
  const { identidades, elegir } = useIdentidadesProcad();
  const { datos, cargando, error } = useConsulta(async () => {
    if (!rolBase || !procadConectado) return [];
    const [usuarios, accesos] = await Promise.all([listarUsuarios(), listarAccesos()]);
    return usuarios
      .filter((u) => u.activo && u.roles.split(",").map((r) => r.trim()).includes(rolBase))
      .map((u) => ({
        idPersona: u.idPersona,
        nombreCompleto: [u.nombrePersona, u.apellidosPersona].filter(Boolean).join(" ") || `Persona ${u.idPersona}`,
        correo: u.correoPersona,
        grupos: accesos.filter((a) => a.idPersona === u.idPersona && a.activo).map((a) => a.nombreGrupo),
      }));
  }, [rolBase]);

  if (!rolBase) return null;
  const elegido = identidades[rol];
  const personas = datos ?? [];

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <label htmlFor={idSelector} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        Actuar como
      </label>
      <select
        id={idSelector}
        value={elegido?.idPersona ?? ""}
        disabled={!procadConectado || cargando || !!error}
        onChange={(e) => {
          const persona = personas.find((p) => p.idPersona === Number(e.target.value));
          elegir(rol, persona ? { idPersona: persona.idPersona, nombreCompleto: persona.nombreCompleto, correo: persona.correo } : null);
        }}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-unah-orange disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{cargando ? "Cargando personas…" : "Sin elegir"}</option>
        {personas.map((p) => (
          <option key={p.idPersona} value={p.idPersona}>
            {p.nombreCompleto}
            {p.grupos.length > 0 ? ` · ${p.grupos.join(", ")}` : " · sin grupo asignado"}
          </option>
        ))}
      </select>
      {!procadConectado && (
        <p className="mt-1.5 text-xs font-medium text-amber-700">
          Este rol trabaja solo con la base: hace falta VITE_API_PROCAD_URL.
        </p>
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      {procadConectado && !cargando && !error && personas.length === 0 && (
        <p className="mt-1.5 text-xs font-medium text-amber-700">
          No hay personas con este rol en la base. Hay que cargarlas primero (ver
          sql/semilla_pruebas_procad.sql en el backend).
        </p>
      )}
    </div>
  );
}

/**
 * El estudiante no se elige de una lista: se escribe cualquier número de
 * cuenta real y se busca en Registro. Así se prueba el caso de verdad, el de
 * quien entra por primera vez y todavía no existe en la base.
 */
function SelectorEstudiante() {
  const idCampo = useId();
  const { identidades, elegir } = useIdentidadesProcad();
  const elegido = identidades.estudiante;
  const [cuenta, setCuenta] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buscar() {
    const texto = cuenta.trim();
    if (!texto) return;
    setBuscando(true);
    setError(null);
    try {
      const e = await obtenerEstudiante(texto);
      elegir("estudiante", {
        idPersona: e.idPersona,
        nombreCompleto: [e.nombrePersona, e.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${texto}`,
        correo: e.correoInstitucional,
        numeroCuenta: e.numeroCuenta,
      });
      setCuenta("");
    } catch (causa) {
      setError(mensajeDeError(causa));
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <label htmlFor={idCampo} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        Actuar como
      </label>
      {elegido && (
        <p className="mb-2 text-sm text-slate-700">
          <b className="font-semibold">{elegido.nombreCompleto}</b>
          <span className="font-mono text-xs text-slate-400"> · {elegido.numeroCuenta}</span>
        </p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          buscar();
        }}
      >
        <input
          id={idCampo}
          type="text"
          inputMode="numeric"
          value={cuenta}
          disabled={!procadConectado || buscando}
          onChange={(e) => setCuenta(e.target.value)}
          placeholder={elegido ? "Otra cuenta" : "Ej. 20221003506"}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700 outline-none focus:border-unah-orange disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!procadConectado || buscando || !cuenta.trim()}
          className="rounded-lg border border-unah-navy bg-unah-navy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-unah-navy-dark disabled:opacity-50"
        >
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      {!procadConectado && (
        <p className="mt-1.5 text-xs font-medium text-amber-700">Este rol trabaja solo con la base: hace falta VITE_API_PROCAD_URL.</p>
      )}
    </div>
  );
}

interface OpcionModo {
  id: RolProcad;
  icono: IconType;
  descripcion: string;
}

// Lo que ve cada rol no se repite aquí: se lee de `roles` en navigation.ts,
// así la tarjeta y el menú no pueden decir cosas distintas.
const MODOS: OpcionModo[] = [
  {
    id: "administrador",
    icono: HiOutlineCog6Tooth,
    descripcion:
      "Gestiona el programa completo: resuelve solicitudes y expulsiones, valida actividades, mantiene los catálogos y controla quién entra al panel.",
  },
  {
    id: "vicerrector",
    icono: HiOutlineEye,
    descripcion:
      "Solo consulta. Revisa las cifras de participación del programa; la gestión operativa la realiza el administrador de PROCAD.",
  },
  {
    id: "director",
    icono: HiOutlineFlag,
    descripcion:
      "Dirige uno o más grupos: decide las solicitudes de ingreso, propone condicionados, arma el equipo y pide expulsiones, que luego firma el administrador.",
  },
  {
    id: "estudiante",
    icono: HiOutlineAcademicCap,
    descripcion:
      "Busca una agrupación de su campus, pide entrar, corrige su solicitud si se la observan y sigue en qué va.",
  },
];

/**
 * Elige con qué rol se ve PROCAD y, en los roles que firman, con qué persona
 * de la base se actúa.
 *
 * Es una herramienta de demostración, no parte del producto. El día que la
 * sesión traiga el rol y la persona reales, esta página, `cambiarRolProcad`,
 * `elegirIdentidadProcad`, `AccesoProcad` y el campo `roles` del menú se
 * borran y nada más cambia.
 */
export default function ModoDeVista() {
  const { rol, cambiarRol } = useRolProcad();
  const navegar = useNavigate();

  function usarModo(nuevoRol: RolProcad) {
    cambiarRol(nuevoRol);
    navegar(rutaInicialProcad(nuevoRol));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
        <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">Modo de vista</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
          Elija con qué rol quiere ver PROCAD. El menú de la izquierda se reconstruye al instante
          con lo que esa persona puede abrir.
        </p>
      </div>

      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-[13px] leading-relaxed text-slate-500">
        <b className="font-semibold text-slate-600">Herramienta de demostración.</b> Sirve para ver
        las vistas de cada rol y elegir con qué persona de la base se actúa mientras no hay sesión.
        Cuando el sistema de sesión entregue el rol y la persona reales, esta pantalla desaparece.
      </p>

      <TarjetaConexion />

      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODOS.map((modo) => {
          const activo = modo.id === rol;
          const Icono = modo.icono;
          const etiqueta = ETIQUETA_ROL_PROCAD[modo.id];
          const paginas = paginasProcad(modo.id);

          return (
            <article
              key={modo.id}
              aria-current={activo ? "true" : undefined}
              className={`flex flex-col rounded-2xl border-2 bg-white p-5 shadow-sm transition-[border-color,box-shadow] duration-200 ease-suave sm:p-6 ${
                activo ? "border-unah-navy" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      activo ? "bg-unah-navy text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icono className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="text-base font-bold text-slate-800">{etiqueta}</h2>
                </span>

                {activo ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    En uso
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Usar el modo ${etiqueta}`}
                    onClick={() => usarModo(modo.id)}
                    className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-unah-navy hover:bg-unah-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unah-navy active:scale-[0.97]"
                  >
                    Usar este modo
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-500">{modo.descripcion}</p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Ve en el menú
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {paginas.map((pagina) => (
                  <li
                    key={pagina.id}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      activo ? "bg-blue-50 text-unah-navy" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {pagina.label}
                  </li>
                ))}
              </ul>

              {modo.id === "estudiante" ? <SelectorEstudiante /> : <SelectorIdentidad rol={modo.id} />}
            </article>
          );
        })}
      </div>
    </div>
  );
}
