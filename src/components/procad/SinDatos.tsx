/** Lo que ve una tarjeta cuando el filtro no deja nada que mostrar. */
export default function SinDatos({ mensaje = "Sin datos para este filtro." }: { mensaje?: string }) {
  return <p className="py-6 text-center text-sm italic text-slate-400">{mensaje}</p>;
}
