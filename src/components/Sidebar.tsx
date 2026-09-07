import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HiChevronDown } from "react-icons/hi2";
import { HiAcademicCap } from "react-icons/hi2";
import { navigationItems } from "../router/navigation";

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
      <div className="flex h-[70px] items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
          <HiAcademicCap className="h-5 w-5 text-unah-navy" />
        </div>
        {!colapsado && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold tracking-wide text-white">UNAH</p>
            <p className="truncate text-[11px] font-semibold tracking-wide text-unah-orange">
              BECAS VOAE
            </p>
          </div>
        )}
      </div>

      {/* Menú */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
        {!colapsado && (
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-white/40">
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
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      grupoActivo
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    } ${colapsado ? "justify-center" : "justify-between"}`}
                    title={colapsado ? item.label : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      {!colapsado && <span className="truncate">{item.label}</span>}
                    </span>
                    {!colapsado && (
                      <HiChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          abierto ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path}
                    title={colapsado ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        colapsado ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-unah-orange text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!colapsado && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )}

                {tieneHijos && abierto && !colapsado && (
                  <ul className="mt-1 flex flex-col gap-1 border-l border-white/10 pl-4">
                    {item.children!.map((hijo) => (
                      <li key={hijo.id}>
                        <NavLink
                          to={hijo.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                              isActive
                                ? "bg-unah-orange text-white"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          <span className="truncate">{hijo.label}</span>
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
