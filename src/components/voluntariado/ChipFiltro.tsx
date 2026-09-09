interface ChipFiltroProps {
  label: string;
  activo: boolean;
  onClick: () => void;
  colorActivo?: "navy" | "orange";
}

// Chip toggle idéntico en comportamiento al patrón de "activo = relleno,
// inactivo = borde"; tocar el chip activo lo desactiva.
export default function ChipFiltro({ label, activo, onClick, colorActivo = "navy" }: ChipFiltroProps) {
  const claseActiva =
    colorActivo === "navy" ? "bg-unah-navy text-white" : "bg-unah-orange text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        activo ? `${claseActiva} border-transparent` : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
