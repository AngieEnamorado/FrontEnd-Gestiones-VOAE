import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import type { IconType } from "react-icons";

const BASE = "/voluntariado/portal-estudiante";

const tabs: { to: string; label: string; icon: IconType }[] = [
  { to: `${BASE}/inicio`, label: "Inicio", icon: HiOutlineHome },
  { to: `${BASE}/grupos`, label: "Grupos", icon: HiOutlineUserGroup },
  { to: `${BASE}/actividades`, label: "Actividades", icon: HiOutlineCalendarDays },
  { to: `${BASE}/historial`, label: "Historial", icon: HiOutlineClock },
  { to: `${BASE}/solicitudes`, label: "Solicitudes", icon: HiOutlineClipboardDocumentList },
];

export default function TabBarMovil() {
  return (
    <nav className="flex shrink-0 items-stretch border-t border-slate-200 bg-white px-1 pb-5 pt-2">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[10px] font-semibold ${
              isActive ? "text-unah-navy" : "text-slate-400"
            }`
          }
        >
          <Icon className="h-[22px] w-[22px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
