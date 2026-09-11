/**
 * Globo de detalle para las marcas que dibujamos a mano (barras apiladas,
 * embudo). Los gráficos de Recharts traen el suyo.
 *
 * Aparece con hover y también con foco de teclado, y nunca es la única forma
 * de leer un valor: la cifra vive además en la etiqueta directa o en la tabla
 * de la misma tarjeta.
 */
export default function Globo({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-slate-800 px-2.5 py-1.5 text-left text-[11px] leading-snug text-white shadow-lg group-hover/marca:block group-focus-visible/marca:block"
    >
      <span className="block font-bold">{titulo}</span>
      <span className="block text-slate-300">{detalle}</span>
    </span>
  );
}
