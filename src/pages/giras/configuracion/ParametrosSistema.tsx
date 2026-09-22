import { useEffect, useId, useState } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";
import { actualizarRegistroCatalogo, listarCatalogo } from "../../../api/giras";
import { mensajeDeError } from "../../../api/cliente";
import { useConsulta } from "../../../api/useConsulta";
import type { RegistroCatalogoApi } from "../../../types/giras";

/** El valor de un parámetro es un entero >= 0 (Giras.tblParametros.valorParametro). */
function validar(texto: string): string {
  if (texto.trim() === "" || !/^\d+$/.test(texto.trim())) return "Escribe un número entero, cero o mayor.";
  return "";
}

function TarjetaParametro({
  parametro,
  onGuardado,
}: {
  parametro: RegistroCatalogoApi;
  onGuardado: () => void;
}) {
  const idValor = useId();
  const idError = useId();

  const valorActual = String(parametro["valorParametro"] ?? "");
  const [texto, setTexto] = useState(valorActual);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  // El aviso "Guardado" se quita solo.
  useEffect(() => {
    if (!guardado) return;
    const espera = setTimeout(() => setGuardado(false), 2500);
    return () => clearTimeout(espera);
  }, [guardado]);

  const error = validar(texto);
  const sinCambios = texto.trim() === valorActual;

  async function guardar() {
    if (error || sinCambios || guardando) return;
    setGuardando(true);
    setErrorApi(null);
    try {
      await actualizarRegistroCatalogo("parametros", parametro.id, { valorParametro: Number(texto) });
      setGuardado(true);
      onGuardado();
    } catch (causa) {
      setErrorApi(mensajeDeError(causa));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <article className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-800">{parametro.descripcion || parametro.nombre}</h3>
      <p className="mt-1 font-mono text-xs text-slate-400">{parametro.nombre}</p>

      <div className="mt-5">
        <label htmlFor={idValor} className="mb-1.5 block text-xs font-semibold text-slate-500">
          Valor actual
        </label>
        <input
          id={idValor}
          type="number"
          inputMode="numeric"
          min={0}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? idError : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange ${
            error ? "border-rose-300" : "border-slate-200"
          }`}
        />
        {error && (
          <p id={idError} className="mt-1.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        {errorApi && <p className="mt-1.5 text-xs font-medium text-rose-600">{errorApi}</p>}
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
          disabled={sinCambios || !!error || guardando}
          className="rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#003366]"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </article>
  );
}

/** Los parámetros globales de Giras (Giras.tblParametros), cada uno con su propio "Guardar cambios". */
export default function ParametrosSistema() {
  const { datos: parametros, cargando, error, recargar } = useConsulta(() => listarCatalogo("parametros", true), []);

  if (cargando && !parametros) {
    return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">Cargando parámetros…</p>;
  }
  if (error) {
    return (
      <p role="alert" className="rounded-2xl bg-white p-6 text-sm font-medium text-rose-600 shadow-sm">
        {error}
      </p>
    );
  }
  if (!parametros || parametros.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
        No hay parámetros registrados en la base de datos.
      </p>
    );
  }

  return (
    <section aria-labelledby="titulo-parametros">
      <h2 id="titulo-parametros" className="text-base font-bold text-slate-800">
        Parámetros de giras
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">Reglas para solicitar y organizar una gira.</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {parametros.map((parametro) => (
          // La clave incluye el valor: si cambia en la base, la tarjeta se monta de nuevo con él.
          <TarjetaParametro key={parametro.id + ":" + String(parametro["valorParametro"])} parametro={parametro} onGuardado={recargar} />
        ))}
      </div>
    </section>
  );
}
