import { HiOutlineCheck } from "react-icons/hi2";

/**
 * La casilla que llevan las tarjetas mientras se arma un reporte
 * personalizado. Es la misma en las cifras de encabezado y en las gráficas,
 * para que marcar sea siempre el mismo gesto.
 *
 * No es un `<input>`: quien recibe el clic y el foco es la tarjeta entera
 * —ella declara su `role="checkbox"`—, así que esto solo pinta el estado.
 */
export default function CasillaSeleccion({
  marcada,
  sobreOscuro = false,
}: {
  marcada: boolean;
  /** En la tarjeta navy el borde apagado no se ve: allí va en blanco. */
  sobreOscuro?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border shadow-sm transition-[background-color,border-color,transform] duration-200 ease-suave ${
        marcada
          ? "scale-105 border-unah-orange bg-unah-orange text-white"
          : sobreOscuro
            ? "border-white/50 bg-white/15"
            : "border-slate-300 bg-white"
      }`}
    >
      <HiOutlineCheck
        className={`h-3.5 w-3.5 stroke-[3] transition-[opacity,transform] duration-200 ease-suave ${
          marcada ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      />
    </span>
  );
}
