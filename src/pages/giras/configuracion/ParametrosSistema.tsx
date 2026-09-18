import { useEffect, useId, useState } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import Interruptor from "../../../components/Interruptor";
import { categoriasParametros } from "../../../data/mockCatalogosGiras";
import type { ParametroSistema, ValorParametro } from "../../../types";

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lo que el valor escrito tiene de incorrecto para este parámetro; vacío si está bien. */
function validar(parametro: ParametroSistema, texto: string): string {
  if (parametro.tipo === "numero") {
    if (texto.trim() === "" || !/^-?\d+$/.test(texto.trim())) return "Escribe un número entero.";
    const n = Number(texto);
    const { min, max, unidad } = parametro;
    if (min !== undefined && n < min) return `El mínimo es ${min}${unidad ? ` ${unidad}` : ""}.`;
    if (max !== undefined && n > max) return `El máximo es ${max}${unidad ? ` ${unidad}` : ""}.`;
  }
  if (parametro.tipo === "texto") {
    if (!texto.trim()) return "El valor no puede quedar vacío.";
    if (parametro.formato === "correo" && !FORMATO_CORREO.test(texto.trim())) {
      return "Escribe un correo válido, como nombre@unah.hn.";
    }
  }
  return "";
}

function TarjetaParametro({
  parametro,
  onGuardar,
}: {
  parametro: ParametroSistema;
  onGuardar: (clave: string, valor: ValorParametro) => void;
}) {
  const idValor = useId();
  const idError = useId();

  // Lo que se está escribiendo. Los números y el texto se editan como texto y se
  // convierten al guardar; el booleano se edita tal cual.
  const [texto, setTexto] = useState(String(parametro.valor));
  const [encendido, setEncendido] = useState(parametro.valor === true);
  const [guardado, setGuardado] = useState(false);

  // El aviso "Guardado" se quita solo.
  useEffect(() => {
    if (!guardado) return;
    const espera = setTimeout(() => setGuardado(false), 2500);
    return () => clearTimeout(espera);
  }, [guardado]);

  const esBooleano = parametro.tipo === "booleano";
  const error = esBooleano ? "" : validar(parametro, texto);
  const sinCambios = esBooleano
    ? encendido === (parametro.valor === true)
    : texto.trim() === String(parametro.valor);

  function guardar() {
    if (error || sinCambios) return;
    if (esBooleano) {
      onGuardar(parametro.clave, encendido);
    } else if (parametro.tipo === "numero") {
      const numero = Number(texto);
      onGuardar(parametro.clave, numero);
      setTexto(String(numero));
    } else {
      onGuardar(parametro.clave, texto.trim());
      setTexto(texto.trim());
    }
    setGuardado(true);
  }

  return (
    <article className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">{parametro.etiqueta}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{parametro.descripcion}</p>

      <div className="mt-5">
        {esBooleano ? (
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                encendido ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {encendido ? "Activado" : "Desactivado"}
            </span>
            <Interruptor
              encendido={encendido}
              etiqueta={parametro.etiqueta}
              onCambiar={() => setEncendido((v) => !v)}
            />
          </div>
        ) : (
          <>
            <label htmlFor={idValor} className="mb-1.5 block text-xs font-semibold text-slate-500">
              Valor actual
            </label>
            <div className="relative">
              <input
                id={idValor}
                type={parametro.tipo === "numero" ? "number" : "text"}
                inputMode={parametro.tipo === "numero" ? "numeric" : undefined}
                min={parametro.min}
                max={parametro.max}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? idError : undefined}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange ${
                  parametro.unidad ? "pr-24" : ""
                } ${error ? "border-rose-300" : "border-slate-200"}`}
              />
              {parametro.unidad && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  {parametro.unidad}
                </span>
              )}
            </div>
            {error && (
              <p id={idError} className="mt-1.5 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span role="status" className="min-h-[24px]">
          {guardado && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <HiOutlineCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Guardado
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={guardar}
          disabled={sinCambios || !!error}
          className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#003366]"
        >
          Guardar cambios
        </button>
      </div>
    </article>
  );
}

/** Los parámetros globales de Giras, agrupados por categoría, cada uno con su propio "Guardar cambios". */
export default function ParametrosSistema({
  parametros,
  onGuardar,
}: {
  parametros: ParametroSistema[];
  onGuardar: (clave: string, valor: ValorParametro) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {categoriasParametros.map((categoria) => {
        const deLaCategoria = parametros.filter((p) => p.categoria === categoria.id);
        if (deLaCategoria.length === 0) return null;
        return (
          <section key={categoria.id} aria-labelledby={`categoria-${categoria.id}`}>
            <h2 id={`categoria-${categoria.id}`} className="text-base font-bold text-slate-800">
              {categoria.titulo}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{categoria.descripcion}</p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {deLaCategoria.map((parametro) => (
                <TarjetaParametro key={parametro.clave} parametro={parametro} onGuardar={onGuardar} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
