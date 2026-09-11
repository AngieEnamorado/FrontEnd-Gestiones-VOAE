interface EntradaLeyenda {
  color: string;
  label: string;
}

/**
 * La leyenda es el canal confiable de identidad: con dos o más series siempre
 * está presente, para que nadie tenga que adivinar un color.
 */
export default function Leyenda({ entradas }: { entradas: EntradaLeyenda[] }) {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
      {entradas.map((e) => (
        <li key={e.label} className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: e.color }}
          />
          {e.label}
        </li>
      ))}
    </ul>
  );
}
