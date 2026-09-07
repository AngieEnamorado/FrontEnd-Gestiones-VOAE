import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { useUsuarioActual } from "../context/UserContext";

/**
 * Muestra el usuario de la sesión. El dato NO está escrito aquí: se
 * "jala" desde el UserContext (que a su vez lo trae de
 * data/currentUser.ts), así que cambiar la fuente de datos en un solo
 * lugar actualiza lo que se ve en todo el topbar.
 */
export default function UserMenu() {
  const usuario = useUsuarioActual();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 transition-colors hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-unah-orange text-xs font-bold text-white">
          {usuario.iniciales}
        </span>
        <span className="text-sm font-medium text-slate-700">{usuario.nombreUsuario}</span>
        <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`} />
      </button>

      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-800">{usuario.nombreCompleto}</p>
            <p className="truncate text-xs text-slate-500">{usuario.correo}</p>
            <p className="mt-1 truncate text-xs font-medium text-unah-orange">{usuario.rol}</p>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
          >
            Mi perfil
          </button>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
