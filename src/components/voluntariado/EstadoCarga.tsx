import type { ReactNode } from "react";

interface EstadoCargaProps {
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
  /** Hay datos que pintar: con esto el spinner no tapa una recarga en segundo plano. */
  listo: boolean;
  children: ReactNode;
}

// Envoltorio de las pantallas que leen de la API: spinner la primera vez,
// mensaje con reintento si falla, y el contenido cuando hay datos.
export default function EstadoCarga({ cargando, error, onReintentar, listo, children }: EstadoCargaProps) {
  if (error && !listo) {
    return (
      <div className="m-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
        <p className="text-[13px] font-semibold text-red-700">{error}</p>
        <button
          type="button"
          onClick={onReintentar}
          className="mt-3 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-100"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (cargando && !listo) {
    return (
      <div className="flex items-center justify-center gap-2.5 p-10 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-unah-orange" />
        Cargando…
      </div>
    );
  }

  return <>{children}</>;
}
