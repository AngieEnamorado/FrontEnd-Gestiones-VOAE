import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import { formatearMonto } from "../../../utils/girasFormato";
import { claseInput, claseLabel, idLocal, type FormularioSolicitud } from "./formulario";
import { CasillasDeCatalogo, SeccionFormulario, type PropiedadesPaso } from "./PasosDatos";

const claseBotonAgregar =
  "flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-slate-50";
const claseBotonQuitar = "flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100";

export function PasoTransporte({ f, cambiar, op }: PropiedadesPaso) {
  function alternarMedio(idTipoTransporte: number) {
    const elegido = f.transportes.some((t) => t.idTipoTransporte === idTipoTransporte);
    cambiar({
      transportes: elegido
        ? f.transportes.filter((t) => t.idTipoTransporte !== idTipoTransporte)
        : [...f.transportes, { idTipoTransporte, observacion: "" }],
    });
  }

  function cambiarObservacion(idTipoTransporte: number, observacion: string) {
    cambiar({
      transportes: f.transportes.map((t) => (t.idTipoTransporte === idTipoTransporte ? { ...t, observacion } : t)),
    });
  }

  return (
    <SeccionFormulario numero={4} titulo="Transporte" id="transporte">
      <label className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={f.usaTransporteUniversidad}
          onChange={(e) => cambiar({ usaTransporteUniversidad: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
        />
        Solicito transporte de la universidad
      </label>

      <p className={`${claseLabel} mt-5`}>Medios de transporte</p>
      {op.transportes.length === 0 && (
        <p className="text-sm text-slate-400">No hay tipos de transporte registrados.</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {op.transportes.map((medio) => (
          <label key={medio.id} className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={f.transportes.some((t) => t.idTipoTransporte === medio.id)}
              onChange={() => alternarMedio(medio.id)}
              className="h-4 w-4 rounded border-slate-300 accent-unah-orange"
            />
            {medio.nombre}
          </label>
        ))}
      </div>

      {f.transportes.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <p className={claseLabel}>Observaciones del traslado</p>
          {f.transportes.map((t) => (
            <div key={t.idTipoTransporte}>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                {op.transportes.find((m) => m.id === t.idTipoTransporte)?.nombre ?? "Medio de transporte"}
              </label>
              <input
                type="text"
                maxLength={300}
                placeholder="Detalles adicionales sobre este medio..."
                value={t.observacion}
                onChange={(e) => cambiarObservacion(t.idTipoTransporte, e.target.value)}
                className={claseInput}
              />
            </div>
          ))}
        </div>
      )}
    </SeccionFormulario>
  );
}

export function PasoFinanciamiento({ f, cambiar, op }: PropiedadesPaso) {
  const total = f.costos.reduce((suma, c) => suma + (parseFloat(c.total) || 0), 0);

  function cambiarCosto(id: string, campo: "nombre" | "descripcion" | "total", valor: string) {
    cambiar({ costos: f.costos.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)) });
  }

  return (
    <SeccionFormulario numero={5} titulo="Financiamiento" id="financiamiento">
      <div>
        <p className={claseLabel}>Origen de fondos</p>
        <div className="flex flex-wrap gap-4">
          <CasillasDeCatalogo
            registros={op.financiamientos}
            elegidos={f.financiamientos}
            onCambiar={(financiamientos) => cambiar({ financiamientos })}
            vacio="No hay tipos de financiamiento registrados."
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className={claseLabel}>Desglose de costos</p>
          <button
            type="button"
            onClick={() => cambiar({ costos: [...f.costos, { id: idLocal(), nombre: "", descripcion: "", total: "" }] })}
            className={claseBotonAgregar}
          >
            <HiOutlinePlus className="h-3.5 w-3.5" />
            Agregar línea de costo
          </button>
        </div>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Detalle</th>
                <th className="px-4 py-3">Monto (L)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {f.costos.map((costo) => (
                <tr key={costo.id} className="transition-colors duration-150 hover:bg-slate-100">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      maxLength={120}
                      placeholder="Ej. Transporte"
                      value={costo.nombre}
                      onChange={(e) => cambiarCosto(costo.id, "nombre", e.target.value)}
                      className={claseInput}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      maxLength={300}
                      placeholder="Ej. Bus ida y vuelta"
                      value={costo.descripcion}
                      onChange={(e) => cambiarCosto(costo.id, "descripcion", e.target.value)}
                      className={claseInput}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={costo.total}
                      onChange={(e) => cambiarCosto(costo.id, "total", e.target.value)}
                      className={claseInput}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      title="Quitar línea"
                      onClick={() => cambiar({ costos: f.costos.filter((c) => c.id !== costo.id) })}
                      className={claseBotonQuitar}
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {f.costos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                    Aún no se han agregado líneas de costo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-right text-sm font-bold text-slate-800">Total: L {formatearMonto(total)}</p>
      </div>
    </SeccionFormulario>
  );
}

export function PasoDocumentos({ f, cambiar }: Pick<PropiedadesPaso, "f" | "cambiar">) {
  function cambiarDocumento(
    id: string,
    campo: keyof Omit<FormularioSolicitud["documentos"][number], "id">,
    valor: string,
  ) {
    cambiar({ documentos: f.documentos.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)) });
  }

  return (
    <SeccionFormulario numero={6} titulo="Documentos" id="documentos">
      <div className="flex items-center justify-between">
        <p className={claseLabel}>Documentos de respaldo</p>
        <button
          type="button"
          onClick={() =>
            cambiar({ documentos: [...f.documentos, { id: idLocal(), tipoDocumento: "", nombre: "", linkDocumento: "" }] })
          }
          className={claseBotonAgregar}
        >
          <HiOutlinePlus className="h-3.5 w-3.5" />
          Agregar documento
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="bg-unah-navy text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Enlace / URL</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {f.documentos.map((documento) => (
              <tr key={documento.id} className="transition-colors duration-150 hover:bg-slate-100">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="Ej. Carta aval"
                    value={documento.tipoDocumento}
                    onChange={(e) => cambiarDocumento(documento.id, "tipoDocumento", e.target.value)}
                    className={claseInput}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="Ej. carta_aval_gira.pdf"
                    value={documento.nombre}
                    onChange={(e) => cambiarDocumento(documento.id, "nombre", e.target.value)}
                    className={claseInput}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    maxLength={400}
                    placeholder="https://..."
                    value={documento.linkDocumento}
                    onChange={(e) => cambiarDocumento(documento.id, "linkDocumento", e.target.value)}
                    className={claseInput}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    title="Quitar documento"
                    onClick={() => cambiar({ documentos: f.documentos.filter((d) => d.id !== documento.id) })}
                    className={claseBotonQuitar}
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {f.documentos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-400">
                  Aún no se han agregado documentos de respaldo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SeccionFormulario>
  );
}
