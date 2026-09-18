import { useNavigate } from "react-router-dom";
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCog6Tooth,
  HiOutlineEye,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useRolGira } from "../../context/UserContext";
import { paginasGira, rutaInicialGira } from "../../router/rolesGira";
import { ETIQUETA_ROL_GIRA } from "../../types";
import type { RolGira } from "../../types";

interface OpcionModo {
  id: RolGira;
  icono: IconType;
  descripcion: string;
}

// Las páginas que ve cada rol no se repiten aquí: se leen de `rolesGira` en
// navigation.ts, de modo que la tarjeta y el menú nunca puedan decir cosas
// distintas.
const MODOS: OpcionModo[] = [
  {
    id: "vicerrectoria",
    icono: HiOutlineEye,
    descripcion:
      "Solo consulta. Revisa estadísticas y cifras globales de todo el sistema con acceso a filtros generales.",
  },
  {
    id: "jefe-mision",
    icono: HiOutlineBriefcase,
    descripcion:
      "Gestiona las giras a su cargo, crea solicitudes de giras y consulta métricas asociadas.",
  },
  {
    id: "jefe-aprobacion",
    icono: HiOutlineClipboardDocumentCheck,
    descripcion:
      "Dictamina, aprueba o rechaza solicitudes enviadas a su unidad y monitorea giras.",
  },
  {
    id: "estudiante",
    icono: HiOutlineAcademicCap,
    descripcion:
      "Inscripción a giras académicas disponibles y consulta del estado de sus giras inscritas.",
  },
  {
    id: "administrador",
    icono: HiOutlineCog6Tooth,
    descripcion: "Control total del sistema y parametrización de catálogos.",
  },
];

/**
 * Elige con qué rol se ve Giras.
 *
 * Es una herramienta de demostración, no parte del producto: mientras no haya
 * backend, es la única forma de mostrar las vistas de cada rol. El día que la
 * sesión traiga el rol real, esta página, `cambiarRolGira`, `AccesoGiras` y el
 * campo `rolesGira` del menú se borran y nada más cambia.
 */
export default function ModoDeVista() {
  const { rol, cambiarRol } = useRolGira();
  const navegar = useNavigate();

  function usarModo(nuevoRol: RolGira) {
    cambiarRol(nuevoRol);
    // El menú ya se reconstruye solo con el rol nuevo; aquí se lleva a la
    // persona a lo primero que ese rol puede abrir.
    navegar(rutaInicialGira(nuevoRol));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wider text-amber-600">GIRAS</p>
        <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">Modo de vista</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
          Elija con qué rol quiere ver el sistema. El menú de la izquierda se reconstruye al
          instante con lo que esa persona puede abrir.
        </p>
      </div>

      <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-slate-500">
        <b className="font-semibold text-slate-600">Herramienta de demostración.</b> Sirve para
        enseñar las distintas vistas mientras no hay backend. Cuando el sistema de sesión entregue
        el rol real de cada usuario, esta pantalla desaparece.
      </p>

      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODOS.map((modo) => {
          const activo = modo.id === rol;
          const Icono = modo.icono;
          const etiqueta = ETIQUETA_ROL_GIRA[modo.id];
          const paginas = paginasGira(modo.id);

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
                {paginas.length > 0 ? (
                  paginas.map((pagina) => (
                    <li
                      key={pagina.id}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        activo ? "bg-blue-50 text-unah-navy" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {pagina.label}
                    </li>
                  ))
                ) : (
                  <li className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-400">
                    Sin páginas disponibles aún
                  </li>
                )}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
