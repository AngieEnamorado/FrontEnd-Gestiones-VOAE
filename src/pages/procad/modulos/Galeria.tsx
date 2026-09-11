/** Todavía sin definir: se muestra tal cual para no prometer lo que no existe. */
export default function Galeria() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-slate-800">
        Galería de actividades
        <span className="ml-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 align-middle text-[9.5px] font-bold uppercase tracking-wide text-slate-500">
          Próximamente
        </span>
      </h3>
      <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-[13px] leading-relaxed text-slate-500">
        Todavía no está definido cómo se cargarán y organizarán las fotografías por agrupación y
        período. En cuanto se confirme el flujo —quién sube, con qué permisos, y si pasa por
        validación— esta sección mostrará la galería real.
      </p>
    </div>
  );
}
