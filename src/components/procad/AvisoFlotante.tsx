import { useEffect } from "react";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi2";

/**
 * Confirmación de que una acción se aplicó. Aparece abajo, se va sola, y no
 * roba el foco: la acción ya ocurrió, no hay nada que decidir.
 */
export default function AvisoFlotante({
  mensaje,
  onDescartar,
  tono = "exito",
}: {
  mensaje: string | null;
  onDescartar: () => void;
  /** Un error se queda más tiempo y no lleva la palomita verde de "hecho". */
  tono?: "exito" | "error";
}) {
  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(onDescartar, tono === "error" ? 6500 : 3200);
    return () => clearTimeout(temporizador);
  }, [mensaje, onDescartar, tono]);

  if (!mensaje) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-xl"
      style={{ animation: "aviso-entra 220ms cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {tono === "error" ? (
        <HiOutlineExclamationCircle className="h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
      ) : (
        <HiOutlineCheckCircle className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
      )}
      {mensaje}
    </div>
  );
}
