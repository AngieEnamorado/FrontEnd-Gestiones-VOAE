// Tailwind (JIT) no puede generar clases construidas con template literals
// (`bg-${color}-100`), así que cada color válido queda mapeado a su clase
// completa y literal aquí — se reutiliza en cualquier chip/badge por color.
export const claseChipColor: Record<"amber" | "emerald" | "violet" | "blue" | "rose", string> = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
  blue: "bg-blue-100 text-blue-700",
  rose: "bg-rose-100 text-rose-700",
};

export const claseBarraColor: Record<"amber" | "emerald" | "violet" | "blue" | "rose", string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  rose: "bg-rose-500",
};
