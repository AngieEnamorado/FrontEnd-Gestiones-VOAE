/**
 * Un interruptor de encendido/apagado, con el rol `switch` que un lector de
 * pantalla anuncia como tal. `etiqueta` dice qué se enciende o apaga.
 */
export default function Interruptor({
  encendido,
  etiqueta,
  onCambiar,
}: {
  encendido: boolean;
  etiqueta: string;
  onCambiar: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={encendido}
      aria-label={etiqueta}
      onClick={onCambiar}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ease-suave ${
        encendido ? "bg-unah-navy" : "bg-slate-300"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ease-suave ${
          encendido ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
