import { useState } from "react";
import { HiOutlinePencilSquare, HiOutlinePlus } from "react-icons/hi2";
import Interruptor from "../../../components/Interruptor";
import ModalRegistro from "./ModalRegistro";
import type { DatosRegistro, DialogoRegistro } from "./ModalRegistro";
import type { CatalogoGira, IdCatalogoGira, RegistroCatalogo } from "../../../types";

function EstadoRegistro({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

/**
 * Las tablas tipo de Giras: se elige un catálogo y se mantienen sus registros.
 * Los registros viven en la página padre (`onCambiarRegistros`) para que sobrevivan
 * a un cambio de pestaña.
 */
export default function TablasTipo({
  catalogos,
  onCambiarRegistros,
}: {
  catalogos: CatalogoGira[];
  onCambiarRegistros: (catalogo: IdCatalogoGira, registros: RegistroCatalogo[]) => void;
}) {
  const [seleccionado, setSeleccionado] = useState<IdCatalogoGira>(catalogos[0].id);
  const [dialogo, setDialogo] = useState<DialogoRegistro | null>(null);

  const catalogo = catalogos.find((c) => c.id === seleccionado) ?? catalogos[0];
  const activos = catalogo.registros.filter((r) => r.activo).length;

  function guardar(datos: DatosRegistro) {
    const editando = dialogo?.registro;
    if (editando) {
      onCambiarRegistros(
        catalogo.id,
        catalogo.registros.map((r) => (r.id === editando.id ? { ...r, ...datos } : r)),
      );
    } else {
      const siguienteId = catalogo.registros.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      onCambiarRegistros(catalogo.id, [...catalogo.registros, { id: siguienteId, ...datos }]);
    }
    setDialogo(null);
  }

  function alternarActivo(id: number) {
    onCambiarRegistros(
      catalogo.id,
      catalogo.registros.map((r) => (r.id === id ? { ...r, activo: !r.activo } : r)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Selector de catálogo: lista lateral en pantallas anchas, desplegable en las angostas */}
      <div>
        <div className="lg:hidden">
          <label htmlFor="catalogo-giras" className="mb-1.5 block text-xs font-semibold text-slate-500">
            Tabla tipo
          </label>
          <select
            id="catalogo-giras"
            value={seleccionado}
            onChange={(e) => setSeleccionado(e.target.value as IdCatalogoGira)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange"
          >
            {catalogos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <nav
          aria-label="Tablas tipo"
          className="hidden rounded-2xl bg-white p-3 shadow-sm lg:block"
        >
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tablas tipo
          </p>
          <ul className="flex flex-col gap-1">
            {catalogos.map((c) => {
              const activo = c.id === seleccionado;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={activo ? "true" : undefined}
                    onClick={() => setSeleccionado(c.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      activo
                        ? "bg-blue-50 font-bold text-unah-navy"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{c.nombre}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        activo ? "bg-white text-unah-navy" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.registros.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Tabla de mantenimiento */}
      <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{catalogo.nombre}</h2>
            <p className="mt-1 text-sm text-slate-500">{catalogo.descripcion}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">
              {catalogo.registros.length} {catalogo.registros.length === 1 ? "registro" : "registros"}{" "}
              · {activos} {activos === 1 ? "activo" : "activos"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDialogo({})}
            className="flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Agregar nuevo registro
          </button>
        </div>

        <div className="table-scrollbar mt-5 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre / Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalogo.registros.map((registro) => (
                <tr
                  key={registro.id}
                  className="bg-white transition-colors duration-150 hover:bg-slate-100"
                >
                  <td className="px-4 py-4 text-slate-500">{registro.id}</td>
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                      {registro.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p
                      className={`font-medium ${registro.activo ? "text-slate-700" : "text-slate-400"}`}
                    >
                      {registro.nombre}
                    </p>
                    {registro.descripcion && (
                      <p className="mt-0.5 text-xs text-slate-400">{registro.descripcion}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <EstadoRegistro activo={registro.activo} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        title="Editar registro"
                        aria-label={`Editar ${registro.nombre}`}
                        onClick={() => setDialogo({ registro })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                      >
                        <HiOutlinePencilSquare className="h-4 w-4" />
                      </button>
                      <Interruptor
                        encendido={registro.activo}
                        etiqueta={`${registro.activo ? "Desactivar" : "Activar"} ${registro.nombre}`}
                        onCambiar={() => alternarActivo(registro.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {catalogo.registros.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                    Esta tabla aún no tiene registros. Agrega el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ModalRegistro
        dialogo={dialogo}
        catalogo={catalogo}
        onGuardar={guardar}
        onClose={() => setDialogo(null)}
      />
    </div>
  );
}
