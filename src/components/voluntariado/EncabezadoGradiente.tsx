import type { ReactNode } from "react";

interface EncabezadoGradienteProps {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

// Encabezado con degradado institucional y esquinas inferiores redondeadas,
// reutilizado en Inicio, Detalle de grupo y Panel de coordinador.
export default function EncabezadoGradiente({ eyebrow, children, className = "" }: EncabezadoGradienteProps) {
  return (
    <div className={`rounded-b-[22px] bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 pb-8 pt-6 text-white ${className}`}>
      {eyebrow && (
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/60">{eyebrow}</p>
      )}
      {children}
    </div>
  );
}
