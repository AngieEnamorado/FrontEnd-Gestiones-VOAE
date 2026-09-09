import type { GrupoVoluntariado } from "../../types";

const coloresPorFondo: Record<GrupoVoluntariado["logoColor"], string> = {
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
  navy: "bg-blue-50 text-unah-navy",
  rose: "bg-rose-100 text-rose-700",
};

interface LogoGrupoProps {
  iniciales: string;
  color: GrupoVoluntariado["logoColor"];
  tamano?: "sm" | "md" | "lg";
  sobreOscuro?: boolean;
}

const tamanos = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

// Monograma de iniciales — fallback hasta que el grupo suba su logo real.
export default function LogoGrupo({ iniciales, color, tamano = "md", sobreOscuro = false }: LogoGrupoProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${tamanos[tamano]} ${
        sobreOscuro ? "bg-white/15 text-white" : coloresPorFondo[color]
      }`}
    >
      {iniciales}
    </span>
  );
}
