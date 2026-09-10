import { useNavigate } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi2";
import type { ReactNode } from "react";

interface HeaderMovilDetalleProps {
  titulo: string;
  subtitulo?: string;
  acciones?: ReactNode;
}

// Encabezado sticky de las pantallas de detalle del portal estudiante
// (todas menos las 5 raíces con tab bar): botón "‹" que hace pop de la pila
// de navegación (aquí, simplemente navigate(-1)).
export default function HeaderMovilDetalle({ titulo, subtitulo, acciones }: HeaderMovilDetalleProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3.5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Volver"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        <HiChevronLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-bold text-slate-800">{titulo}</h1>
        {subtitulo && <p className="truncate text-[11px] text-slate-400">{subtitulo}</p>}
      </div>
      {acciones}
    </header>
  );
}
