import { HiOutlineCheckCircle, HiOutlineCog6Tooth, HiOutlineEye } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useRolProcad } from "../../context/UserContext";
import { ETIQUETA_ROL_PROCAD } from "../../types";
import type { RolProcad } from "../../types";

interface OpcionModo {
  id: RolProcad;
  /** Un icono por rol: el engranaje gestiona, el ojo consulta. */
  icono: IconType;
  descripcion: string;
  /** Lo que esa persona encuentra en el menú de PROCAD. */
  accesos: string[];
}

const MODOS: OpcionModo[] = [
  {
    id: "administrador",
    icono: HiOutlineCog6Tooth,
    descripcion:
      "Gestiona el programa completo: resuelve solicitudes y expulsiones, valida actividades, mantiene los catálogos y controla quién entra al panel.",
    accesos: ["Estadísticas", "Estudiantes", "Agrupaciones", "Configuración", "Reportes"],
  },
  {
    id: "vicerrector",
    icono: HiOutlineEye,
    descripcion:
      "Solo consulta. Revisa las cifras de participación del programa; la gestión operativa la realiza el administrador de PROCAD.",
    accesos: ["Estadísticas"],
  },
];

/**
 * Elige con qué rol se ve PROCAD.
 *
 * Es una herramienta de demostración, no parte del producto: mientras no haya
 * backend, es la única forma de mostrar la vista de Vicerrectoría. El día que
 * la sesión traiga el rol real, esta página y `cambiarRolProcad` se borran y
 * nada más cambia.
 */
export default function ModoDeVista() {
  const { rol, cambiarRol } = useRolProcad();

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
        <b className="font-semibold text-slate-600">Herramienta de demostración.</b> Sirve para
        enseñar las dos vistas mientras no hay backend. Cuando el sistema de sesión entregue el rol
        real de cada usuario, esta pantalla desaparece.
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {MODOS.map((modo) => {
          const activo = modo.id === rol;
          const Icono = modo.icono;
          return (
            <button
              key={modo.id}
              type="button"
              aria-pressed={activo}
              onClick={() => cambiarRol(modo.id)}
              className={`flex flex-col rounded-2xl border-2 p-5 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-suave active:scale-[0.99] sm:p-6 ${
                activo
                  ? "border-unah-navy bg-white"
                  : "border-transparent bg-white hover:border-slate-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      activo ? "bg-unah-navy text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icono className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-base font-bold text-slate-800">
                    {ETIQUETA_ROL_PROCAD[modo.id]}
                  </span>
                </span>

                {activo ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    En uso
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    Usar este modo
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-500">{modo.descripcion}</p>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Ve en el menú
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {modo.accesos.map((acceso) => (
                  <li
                    key={acceso}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      activo ? "bg-blue-50 text-unah-navy" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {acceso}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}
