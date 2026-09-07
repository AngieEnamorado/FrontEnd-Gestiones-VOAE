import { HiAcademicCap, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import UserMenu from "./UserMenu";

interface TopbarProps {
  colapsado: boolean;
  onAlternarSidebar: () => void;
}

export default function Topbar({ colapsado, onAlternarSidebar }: TopbarProps) {
  return (
    <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-unah-orange">
          <HiAcademicCap className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800">UNAH</p>
          <p className="text-[11px] font-semibold text-unah-orange">BECAS VOAE</p>
        </div>

        {/* Botón que retrae/expande el sidebar */}
        <button
          type="button"
          onClick={onAlternarSidebar}
          aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {colapsado ? (
            <HiChevronRight className="h-4 w-4" />
          ) : (
            <HiChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <UserMenu />
    </header>
  );
}
