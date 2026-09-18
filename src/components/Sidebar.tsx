import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi2";
import { navigationItems } from "../router/navigation";
import { useProcad } from "../context/ProcadContext";
import { useRolGira, useRolProcad } from "../context/UserContext";
import logoUnahBlanco from "../assets/Logos/LogoUnahBlanco.png";

interface SidebarProps {
  colapsado: boolean;
}

export default function Sidebar({ colapsado }: SidebarProps) {
  const location = useLocation();
  const { pendientes } = useProcad();
  const { rol } = useRolProcad();
  const { rol: rolGira } = useRolGira();

  // Cuántos casos esperan decisión detrás de cada entrada del menú. Se resuelve
  // aquí y no en `navigation.ts` porque esa lista describe la estructura del
  // menú, no el estado de los datos.
  const contadores: Record<string, number> = {
    procadEstudiantes: pendientes.estudiantes,
    procadAgrupaciones: pendientes.agrupaciones,
  };

  // El grupo que contiene la ruta actual empieza abierto: si alguien entra
  // directo a /procad/estadisticas, el menú tiene que mostrarle dónde está
  // parado, no un submenú cerrado. Si no hay ninguno, abre Estudiantes, que
  // es donde vive la ruta por defecto.
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>(() => {
    const grupoDeLaRuta = navigationItems.find(
      (item) => item.children?.length && location.pathname.startsWith(item.path),
    );
    return { [grupoDeLaRuta?.id ?? "estudiantes"]: true };
  });

  function alternarGrupo(id: string) {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <aside
      className={`flex h-full flex-col overflow-hidden bg-unah-navy text-white transition-[width] duration-300 ease-in-out ${
        colapsado ? "w-0" : "w-72"
      }`}
    >
      {/* Encabezado / marca */}
      <div className="flex items-center justify-center border-b border-white/10 px-4 py-6">
        <img src={logoUnahBlanco} alt="UNAH" className="h-20 w-auto object-contain" />
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="px-3 pb-2 text-center text-[11px] font-semibold tracking-wider text-white/40">
          MENÚ PRINCIPAL
        </p>

        <ul className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const tieneHijos = !!item.children?.length;
            const grupoActivo = location.pathname.startsWith(item.path);
            const abierto = abiertos[item.id] ?? false;

            return (
              <li key={item.id}>
                {tieneHijos ? (
                  <button
                    type="button"
                    onClick={() => alternarGrupo(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-blue-800/40 hover:text-white ${
                      grupoActivo ? "text-white" : "text-white/70"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-colors group-hover:bg-white/15">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    <HiChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${abierto ? "rotate-90" : ""}`}
                    />
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-amber-600 font-bold text-white"
                          : "text-white/70 hover:bg-blue-800/40 hover:text-white"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isActive ? "bg-white/20" : "bg-white/10 group-hover:bg-white/15"
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <HiChevronRight
                          className={`h-4 w-4 shrink-0 ${isActive ? "text-white/70" : "text-white/30"}`}
                        />
                      </>
                    )}
                  </NavLink>
                )}

                {tieneHijos && abierto && (
                  <ul className="mt-1 flex flex-col gap-1">
                    {item
                      .children!.filter(
                        (hijo) =>
                          (!hijo.roles || hijo.roles.includes(rol)) &&
                          (!hijo.rolesGira || hijo.rolesGira.includes(rolGira)),
                      )
                      .map((hijo) => (
                      <li key={hijo.id}>
                        <NavLink
                          to={hijo.path}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-xl py-2 pl-5 pr-3 text-[13px] font-medium transition-colors ${
                              isActive
                                ? "bg-amber-600 font-bold text-white"
                                : "text-white/60 hover:bg-blue-800/40 hover:text-white"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                                  isActive ? "bg-white" : "bg-white/40 group-hover:bg-white/70"
                                }`}
                              />
                              <span className="truncate">{hijo.label}</span>
                              {hijo.contador && contadores[hijo.contador] > 0 && (
                                <span
                                  className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-unah-orange px-1.5 py-0.5 text-[10px] font-bold text-white"
                                  title={`${contadores[hijo.contador]} pendiente(s)`}
                                >
                                  {contadores[hijo.contador]}
                                  <span className="sr-only"> pendientes</span>
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
