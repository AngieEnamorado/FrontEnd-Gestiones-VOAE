import { HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";

interface ListaAvisoProps {
  /** Si está vacío, la tarjeta dice que no hay nada que atender. */
  elementos: string[];
  mensajeTodoBien: string;
  /** `aviso` pide atención; `neutro` solo informa. */
  tono?: "aviso" | "neutro";
}

/**
 * Lista de casos que requieren lectura, no comparación: no hay magnitud que
 * graficar, solo a quién hay que mirar. Cuando no hay ninguno, eso también es
 * una respuesta y se dice explícitamente.
 */
export default function ListaAviso({
  elementos,
  mensajeTodoBien,
  tono = "aviso",
}: ListaAvisoProps) {
  if (elementos.length === 0) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-[13px] text-emerald-800">
        <HiOutlineCheckCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        {mensajeTodoBien}
      </p>
    );
  }

  const estilo =
    tono === "aviso"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <ul className="flex flex-col gap-2">
      {elementos.map((texto) => (
        <li
          key={texto}
          className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] ${estilo}`}
        >
          {tono === "aviso" && (
            <HiOutlineExclamationTriangle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{texto}</span>
        </li>
      ))}
    </ul>
  );
}
