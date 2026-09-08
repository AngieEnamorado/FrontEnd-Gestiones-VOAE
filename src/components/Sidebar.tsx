import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi2";
import { navigationItems } from "../router/navigation";
import logoUnahBlanco from "../assets/Logos/LogoUnahBlanco.png";

interface SidebarProps {
  colapsado: boolean;
}

export default function Sidebar({ colapsado }: SidebarProps) {
  const location = useLocation();

  // El submenú de "Estudiantes" empieza abierto porque la ruta activa
  // por defecto (Solicitudes) vive dentro de él.
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    estudiantes: true,
  });

  function alternarGrupo(id: string) {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <aside
      className={`flex h-full flex-col bg-unah-navy text-white transition-[width] duration-200 ease-in-out ${
        colapsado ? "w-[76px]" : "w-72"
      }`}
    >
      {/* Encabezado / marca */}
      <div className="flex items-center justify-center border-b border-white/10 px-4 py-6">
        <img
          src={logoUnahBlanco}
          alt="UNAH"
          className={`object-contain transition-all ${colapsado ? "h-9 w-9" : "h-20 w-auto"}`}
        />
      </div>

      {/* Menú */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {!colapsado && (
          <p className="px-3 pb-2 text-center text-[11px] font-semibold tracking-wider text-white/40">
            MENÚ PRINCIPAL
          </p>
        )}

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
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-unah-orange/20 hover:text-white ${
                      grupoActivo ? "text-white" : "text-white/70"
                    } ${colapsado ? "justify-center" : "justify-between"}`}
                    title={colapsado ? item.label : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      {!colapsado && <span className="truncate">{item.label}</span>}
                    </span>
                    {!colapsado && (
                      <HiChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          abierto ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    title={colapsado ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        colapsado ? "justify-center" : "justify-between"
                      } ${
                        isActive
                          ? "bg-unah-orange text-white"
                          : "text-white/70 hover:bg-unah-orange/20 hover:text-white"
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      {!colapsado && <span className="truncate">{item.label}</span>}
                    </span>
                    {!colapsado && <HiChevronRight className="h-4 w-4 shrink-0 text-white/30" />}
                  </NavLink>
                )}

                {tieneHijos && abierto && !colapsado && (
                  <ul className="mt-1 flex flex-col gap-1">
                    {item.children!.map((hijo) => (
                      <li key={hijo.id}>
                        <NavLink
                          to={hijo.path}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg py-2 pl-5 pr-3 text-[13px] font-medium transition-colors ${
                              isActive
                                ? "bg-unah-orange text-white"
                                : "text-white/60 hover:bg-unah-orange/20 hover:text-white"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                  isActive ? "bg-white" : "bg-white/40"
                                }`}
                              />
                              <span className="truncate">{hijo.label}</span>
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
