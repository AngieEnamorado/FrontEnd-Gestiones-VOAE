import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type InformeEconomicoApi, type MovimientoEconomicoApi } from "../../../api/voluntariado";
import { ErrorApi } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { formatoLempiras } from "../../../utils/voluntariado";

// Lo que el coordinador registró de una actividad (resultados, fotos e
// informe económico), para que la VOAE lo revise antes de dictaminar el
// informe trimestral. Solo lectura: el coordinador lo edita desde el portal.
export default function EvidenciaActividad({ idActividad }: { idActividad: number }) {
  const carga = useApi(
    () =>
      Promise.all([
        voluntariadoApi.actividad(idActividad),
        // Una actividad sin informe económico devuelve 404.
        voluntariadoApi.informeEconomico(idActividad).catch((e) => {
          if (e instanceof ErrorApi && e.estado === 404) return null;
          throw e;
        }),
      ]),
    [idActividad],
  );

  return (
    <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
      {carga.datos && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4">
          <section>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Resultados</h4>
            {carga.datos[0].resultadosActividad ? (
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{carga.datos[0].resultadosActividad}</p>
            ) : (
              <p className="mt-1 text-sm text-amber-600">El coordinador no registró resultados.</p>
            )}
          </section>

          <section>
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Fotos de evidencia ({carga.datos[0].fotos.length})
            </h4>
            {carga.datos[0].fotos.length === 0 ? (
              <p className="mt-1 text-sm text-amber-600">Sin fotos de evidencia.</p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {carga.datos[0].fotos.map((foto) =>
                  foto.urlDescarga ? (
                    <a
                      key={foto.idFotoActividad}
                      href={foto.urlDescarga}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200 hover:ring-unah-orange"
                    >
                      <img src={foto.urlDescarga} alt={foto.descripcionFoto ?? "Foto de evidencia"} className="h-full w-full object-cover" />
                    </a>
                  ) : (
                    <div
                      key={foto.idFotoActividad}
                      className="flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-[11px] text-slate-400"
                    >
                      {foto.archivoUrl.split("/").pop()}
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          <InformeEconomico informe={carga.datos[1]} />
        </div>
      )}
    </EstadoCarga>
  );
}

function InformeEconomico({ informe }: { informe: InformeEconomicoApi | null }) {
  if (!informe) {
    return (
      <section>
        <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Informe económico</h4>
        <p className="mt-1 text-sm text-amber-600">El coordinador no registró informe económico.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Informe económico</h4>
      {/* Una actividad conjunta lleva una cuenta por grupo. */}
      {informe.grupos.map((grupo) => {
        const movimientos = informe.movimientos.filter((m) => m.idInformeEconomicoGrupo === grupo.idInformeEconomicoGrupo);
        const suma = (tipo: MovimientoEconomicoApi["tipoMovimiento"]) =>
          movimientos.filter((m) => m.tipoMovimiento === tipo).reduce((t, m) => t + Number(m.montoMovimiento), 0);
        const ingresos = suma("INGRESO");
        const egresos = suma("EGRESO");
        const saldoAnterior = Number(grupo.saldoAnterior);

        return (
          <div key={grupo.idInformeEconomicoGrupo} className="overflow-hidden rounded-xl border border-slate-100">
            {informe.grupos.length > 1 && (
              <p className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">{grupo.nombreGrupo}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-2">Movimiento</th>
                    <th className="px-3 py-2">Responsable</th>
                    <th className="px-3 py-2">Comprobante</th>
                    <th className="px-3 py-2 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movimientos.map((m, i) => (
                    <tr key={m.idMovimientoEconomico ?? i}>
                      <td className="px-3 py-2 text-slate-700">{m.descripcionMovimiento}</td>
                      <td className="px-3 py-2 text-slate-500">{m.responsableMovimiento ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {m.urlComprobante ? (
                          <a href={m.urlComprobante} target="_blank" rel="noreferrer" className="font-semibold text-unah-navy hover:underline">
                            {m.tipoComprobante ?? "Ver"} ↗
                          </a>
                        ) : (
                          (m.tipoComprobante ?? "Sin comprobante")
                        )}
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${m.tipoMovimiento === "INGRESO" ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {m.tipoMovimiento === "INGRESO" ? "+" : "−"} {formatoLempiras(Number(m.montoMovimiento))}
                      </td>
                    </tr>
                  ))}
                  {movimientos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">
                        Sin movimientos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <span>Saldo anterior: {formatoLempiras(saldoAnterior)}</span>
              <span className="text-emerald-600">Ingresos: {formatoLempiras(ingresos)}</span>
              <span className="text-red-600">Egresos: {formatoLempiras(egresos)}</span>
              <span className="font-bold text-slate-700">Saldo final: {formatoLempiras(saldoAnterior + ingresos - egresos)}</span>
            </div>
          </div>
        );
      })}
      {informe.observacionesInformeEconomico && (
        <p className="text-xs text-slate-500">Observaciones: {informe.observacionesInformeEconomico}</p>
      )}
    </section>
  );
}
