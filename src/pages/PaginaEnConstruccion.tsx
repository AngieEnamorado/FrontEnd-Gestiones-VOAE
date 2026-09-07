import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";

interface PaginaEnConstruccionProps {
  titulo: string;
  seccion: string;
}

/**
 * Placeholder genérico. Cada botón del sidebar ya navega a su propia
 * ruta (ver src/router/navigation.ts y App.tsx); lo único que falta
 * es construir el contenido real de cada página, así que por ahora
 * todas comparten esta pantalla de "en construcción".
 */
export default function PaginaEnConstruccion({ titulo, seccion }: PaginaEnConstruccionProps) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
        <HiOutlineWrenchScrewdriver className="h-8 w-8 text-unah-orange" />
      </div>
      <p className="mt-4 text-xs font-bold tracking-wider text-unah-orange">{seccion.toUpperCase()}</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-800">{titulo}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Esta página todavía no tiene contenido: por ahora solo existe la ruta y el
        botón del menú que llega hasta aquí.
      </p>
    </div>
  );
}
