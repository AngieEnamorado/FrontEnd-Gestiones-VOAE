import { useRef, useState } from "react";
import ParametrosSistema from "./configuracion/ParametrosSistema";
import TablasTipo from "./configuracion/TablasTipo";

type Pestana = "tablas" | "parametros";

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: "tablas", label: "Configuraciones" },
  { id: "parametros", label: "Parámetros del Sistema" },
];

/**
 * Configuración de Giras para el administrador: las tablas tipo que alimentan
 * los formularios y los parámetros globales del módulo. Todo se lee y se guarda
 * en la API; cada pestaña carga lo suyo al abrirse.
 */
export default function ConfiguracionGiras() {
  const [pestana, setPestana] = useState<Pestana>("tablas");
  const botones = useRef<Record<Pestana, HTMLButtonElement | null>>({ tablas: null, parametros: null });

  // Un tablist se recorre con las flechas: una pulsación de Tab llega al grupo y
  // las flechas mueven entre pestañas.
  function alPulsarTecla(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const actual = PESTANAS.findIndex((p) => p.id === pestana);
    const paso = e.key === "ArrowRight" ? 1 : -1;
    const siguiente = PESTANAS[(actual + paso + PESTANAS.length) % PESTANAS.length];
    setPestana(siguiente.id);
    botones.current[siguiente.id]?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-bold tracking-wider text-amber-600">ADMINISTRACIÓN</p>
        <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">Configuraciones</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
          Administra las tablas tipo, catálogos de referencia y parámetros generales de
          configuración de las giras.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Áreas de configuración"
        onKeyDown={alPulsarTecla}
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm"
      >
        {PESTANAS.map((p) => {
          const activa = p.id === pestana;
          return (
            <button
              key={p.id}
              ref={(el) => {
                botones.current[p.id] = el;
              }}
              type="button"
              role="tab"
              id={`config-giras-${p.id}`}
              aria-selected={activa}
              aria-controls="config-giras-panel"
              tabIndex={activa ? 0 : -1}
              onClick={() => setPestana(p.id)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                activa ? "bg-[#003366] text-white" : "text-slate-500 hover:bg-slate-50 hover:text-[#003366]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="config-giras-panel"
        aria-labelledby={`config-giras-${pestana}`}
      >
        {pestana === "tablas" ? (
          <TablasTipo />
        ) : (
          <ParametrosSistema />
        )}
      </div>
    </div>
  );
}
