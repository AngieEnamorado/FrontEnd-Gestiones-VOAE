import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";

/**
 * Lo que este módulo tiene sin resolver, arriba del contenido. Cada módulo
 * muestra solo sus propios pendientes: el contador del sidebar ya avisa de los
 * demás, y repetir la lista completa en cada pantalla la vuelve invisible.
 *
 * El color dice el estado antes que el texto: ámbar cuando hay trabajo
 * esperando, verde cuando no queda nada.
 */
export default function CajaPendientes({
  pendientes,
  mensajeVacio,
}: {
  pendientes: string[];
  mensajeVacio: string;
}) {
  if (pendientes.length === 0) {
    return (
      <p className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
        <HiOutlineCheckCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        {mensajeVacio}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="flex items-center gap-2 text-[13px] font-bold text-amber-900">
        <HiOutlineExclamationTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Pendientes que requieren su atención
      </p>
      <ul className="mt-2 flex flex-col gap-1 pl-6">
        {pendientes.map((p) => (
          <li key={p} className="list-disc text-[13px] text-amber-900">
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
