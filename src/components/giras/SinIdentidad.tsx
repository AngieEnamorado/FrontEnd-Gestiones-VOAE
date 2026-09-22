import { Link } from "react-router-dom";
import { RUTA_MODO_GIRAS } from "../../router/navigation";

/**
 * Lo que se ve en lugar de una pantalla cuando el rol necesita saber con qué
 * usuario de la base se actúa y todavía no se eligió. Se borra junto con
 * "Modo de vista" cuando exista la sesión real.
 */
export default function SinIdentidad({ rol }: { rol: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">Falta elegir con qué usuario actúas</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Para trabajar como <b className="font-semibold text-slate-700">{rol}</b> hay que decir qué
        persona de la base de datos eres. Se elige en «Modo de vista».
      </p>
      <Link
        to={RUTA_MODO_GIRAS}
        className="mt-5 inline-flex rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
      >
        Ir a Modo de vista
      </Link>
    </div>
  );
}
