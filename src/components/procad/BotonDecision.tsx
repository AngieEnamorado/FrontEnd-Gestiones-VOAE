const TONOS = {
  aprobar: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100",
  observar: "border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100",
  rechazar: "border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 hover:bg-rose-100",
  // Para lo que se hace pero no se aprueba ni se rechaza —programar una
  // visoría, por ejemplo—: es una acción, no un veredicto, así que va en el
  // color de la casa y no en el semáforo.
  primario:
    "border-unah-navy/15 bg-unah-navy/5 text-unah-navy hover:border-unah-navy/30 hover:bg-unah-navy/10",
} as const;

/**
 * Una decisión, en su columna y con su color.
 *
 * Es solo el icono porque el rótulo ya está en la cabecera de la columna:
 * escribir «Aprobar» cuarenta veces debajo de un encabezado que dice «Aprobar»
 * no informa a nadie. El color va desde el principio y no solo al pasar el
 * cursor: aprobar y rechazar no se distinguen por su icono a la velocidad a la
 * que se recorre una tabla, y equivocarse de columna aquí cuesta caro.
 */
export default function BotonDecision({
  tono,
  etiqueta,
  onClick,
  children,
}: {
  tono: keyof typeof TONOS;
  etiqueta: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    // El envoltorio centra: el botón es un bloque flex, así que el `text-center`
    // de la celda no lo alcanza.
    <span className="flex justify-center">
      <button
        type="button"
        onClick={onClick}
        title={etiqueta}
        aria-label={etiqueta}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-[background-color,border-color,transform] duration-150 ease-suave active:scale-95 ${TONOS[tono]}`}
      >
        {children}
      </button>
    </span>
  );
}

/** El hueco de una acción que ya no aplica porque el caso está resuelto. */
export function SinAccion({ razon = "Ya resuelta" }: { razon?: string }) {
  return (
    <span className="text-slate-300" title={razon}>
      —
    </span>
  );
}

/** Un dato que no aplica a este caso; no es lo mismo que estar vacío. */
export function SinDato() {
  return <span className="text-slate-300">—</span>;
}
