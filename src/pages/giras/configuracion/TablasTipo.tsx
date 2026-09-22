import { useState } from "react";
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import Interruptor from "../../../components/Interruptor";
import {
  actualizarRegistroCatalogo,
  crearRegistroCatalogo,
  eliminarRegistroCatalogo,
  listarCatalogo,
} from "../../../api/giras";
import { mensajeDeError } from "../../../api/cliente";
import { useConsulta } from "../../../api/useConsulta";
import type { RegistroCatalogoApi } from "../../../types/giras";
import ModalRegistro from "./ModalRegistro";
import type { DialogoRegistro } from "./ModalRegistro";
import { APLICA_A, TABLAS_TIPO, type DefinicionTablaTipo } from "./catalogosGira";

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
 * El panel de una tabla tipo: sus registros, cargados de la API, y las acciones
 * sobre ellos. Se monta con `key` = slug, así que al cambiar de tabla arranca
 * limpio y nunca se ven filas de la tabla anterior.
 */
function PanelTabla({ tabla }: { tabla: DefinicionTablaTipo }) {
  const [dialogo, setDialogo] = useState<DialogoRegistro | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const { datos, cargando, error, recargar } = useConsulta(() => listarCatalogo(tabla.slug, true), [tabla.slug]);
  const registros: RegistroCatalogoApi[] = datos ?? [];
  const activos = registros.filter((r) => r.activo).length;

  async function guardar(valores: Record<string, unknown>) {
    const editando = dialogo?.registro;
    if (editando) await actualizarRegistroCatalogo(tabla.slug, editando.id, valores);
    else await crearRegistroCatalogo(tabla.slug, valores);
    setDialogo(null);
    recargar();
  }

  async function alternarActivo(registro: RegistroCatalogoApi) {
    setErrorAccion(null);
    try {
      await actualizarRegistroCatalogo(tabla.slug, registro.id, { activo: !registro.activo });
      recargar();
    } catch (causa) {
      setErrorAccion(mensajeDeError(causa));
    }
  }

  async function eliminar(registro: RegistroCatalogoApi) {
    if (!window.confirm(`¿Eliminar «${registro.nombre}»? Esta acción no se puede deshacer.`)) return;
    setErrorAccion(null);
    try {
      await eliminarRegistroCatalogo(tabla.slug, registro.id);
      recargar();
    } catch (causa) {
      // Un registro en uso vuelve como 409 con la explicación.
      setErrorAccion(mensajeDeError(causa));
    }
  }

  return (
    <>
      <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{tabla.nombre}</h2>
            <p className="mt-1 text-sm text-slate-500">{tabla.descripcion}</p>
            {!cargando && !error && (
              <p className="mt-2 text-xs font-medium text-slate-400">
                {registros.length} {registros.length === 1 ? "registro" : "registros"}
                {tabla.conEstado && (
                  <>
                    {" "}
                    · {activos} {activos === 1 ? "activo" : "activos"}
                  </>
                )}
              </p>
            )}
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

        {errorAccion && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {errorAccion}
          </p>
        )}

        <div className="table-scrollbar mt-5 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre{tabla.conDescripcion ? " / Descripción" : ""}</th>
                {tabla.conEstado && <th className="px-4 py-3">Estado</th>}
                <th className="px-4 py-3 text-center">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((registro) => {
                const aplicaA = APLICA_A.find((a) => a.valor === registro["aplicaA"]);
                return (
                  <tr key={registro.id} className="bg-white transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-4 py-4 text-slate-500">{registro.id}</td>
                    <td className="px-4 py-4">
                      <p className={`font-medium ${registro.activo ? "text-slate-700" : "text-slate-400"}`}>
                        {registro.nombre}
                      </p>
                      {registro.descripcion && (
                        <p className="mt-0.5 text-xs text-slate-400">{registro.descripcion}</p>
                      )}
                      {aplicaA && <p className="mt-0.5 text-xs text-slate-400">Se usa en: {aplicaA.etiqueta}</p>}
                      {registro["requiereMotivo"] === true && (
                        <p className="mt-0.5 text-xs text-slate-400">Exige motivo</p>
                      )}
                    </td>
                    {tabla.conEstado && (
                      <td className="px-4 py-4">
                        <EstadoRegistro activo={registro.activo} />
                      </td>
                    )}
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
                        {tabla.conEstado && (
                          <Interruptor
                            encendido={registro.activo}
                            etiqueta={`${registro.activo ? "Desactivar" : "Activar"} ${registro.nombre}`}
                            onCambiar={() => alternarActivo(registro)}
                          />
                        )}
                        <button
                          type="button"
                          title="Eliminar registro"
                          aria-label={`Eliminar ${registro.nombre}`}
                          onClick={() => eliminar(registro)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {cargando && registros.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                    Cargando…
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm font-medium text-rose-600">
                    {error}
                  </td>
                </tr>
              )}

              {!cargando && !error && registros.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
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
        tabla={tabla}
        onGuardar={guardar}
        onClose={() => setDialogo(null)}
      />
    </>
  );
}

/** Las tablas tipo de Giras: se elige un catálogo y se mantienen sus registros directamente en la API. */
export default function TablasTipo() {
  const [seleccionado, setSeleccionado] = useState(TABLAS_TIPO[0].slug);
  const tabla = TABLAS_TIPO.find((t) => t.slug === seleccionado) ?? TABLAS_TIPO[0];

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
            onChange={(e) => setSeleccionado(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-unah-orange"
          >
            {TABLAS_TIPO.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <nav aria-label="Tablas tipo" className="hidden rounded-2xl bg-white p-3 shadow-sm lg:block">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tablas tipo
          </p>
          <ul className="flex flex-col gap-1">
            {TABLAS_TIPO.map((t) => {
              const activo = t.slug === seleccionado;
              return (
                <li key={t.slug}>
                  <button
                    type="button"
                    aria-current={activo ? "true" : undefined}
                    onClick={() => setSeleccionado(t.slug)}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      activo ? "bg-blue-50 font-bold text-unah-navy" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{t.nombre}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <PanelTabla key={tabla.slug} tabla={tabla} />
    </div>
  );
}
