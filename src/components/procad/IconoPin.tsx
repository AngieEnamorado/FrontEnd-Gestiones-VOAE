/**
 * Chincheta, para fijar una columna de la tabla.
 *
 * Va dibujada aquí y no sacada de `react-icons`: el juego que usa la
 * plataforma —Heroicons contorneado— no tiene chincheta, y las alternativas que
 * sí tiene significan otra cosa (un candado es permiso, un marcador es
 * favorito, un alfiler de mapa es un lugar). El trazo copia el del resto:
 * lienzo de 24, grosor 1.5, extremos y uniones redondeados, sin relleno.
 */
export default function IconoPin({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 16.5V22" />
      <path d="M9.5 3.5V9.2c0 .8-.45 1.53-1.17 1.88l-1.9.94A2.1 2.1 0 0 0 5.25 13.9v.85c0 .53.43.95.95.95h11.6c.52 0 .95-.42.95-.95v-.85c0-.8-.45-1.53-1.17-1.88l-1.9-.94A2.1 2.1 0 0 1 14.5 9.2V3.5" />
      <path d="M8 3.5h8" />
    </svg>
  );
}
