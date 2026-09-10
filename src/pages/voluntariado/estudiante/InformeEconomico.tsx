import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { actividadPorId } from "../../../data/mockActividadesVoluntariado";
import { informesTrimestrales } from "../../../data/mockInformesVoluntariado";
import type { MovimientoEconomico } from "../../../types";

let contador = 0;
function generarId() {
  contador += 1;
  return `mov-nuevo-${contador}`;
}

export default function InformeEconomico() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const navigate = useNavigate();
  const actividad = actividadId ? actividadPorId(actividadId) : undefined;
  const informe = actividad ? informesTrimestrales.find((i) => i.grupoId === actividad.grupoId) : undefined;

  const [movimientos, setMovimientos] = useState<MovimientoEconomico[]>(informe?.movimientos ?? []);

  if (!actividad || !informe) {
    return (
      <>
        <HeaderMovilDetalle titulo="Informe económico" />
        <p className="p-6 text-sm text-slate-400">No hay un informe trimestral en captura para este grupo.</p>
      </>
    );
  }

  function agregarMovimiento(tipo: "ingreso" | "egreso") {
    setMovimientos((prev) => [
      ...prev,
      { id: generarId(), descripcion: "", monto: 0, tipo, responsable: "", tipoComprobante: "" },
    ]);
  }

  function actualizarMovimiento(id: string, campo: keyof MovimientoEconomico, valor: string | number) {
    setMovimientos((prev) => prev.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)));
  }

  function quitarMovimiento(id: string) {
    setMovimientos((prev) => prev.filter((m) => m.id !== id));
  }

  const ingresos = movimientos.filter((m) => m.tipo === "ingreso").reduce((t, m) => t + m.monto, 0);
  const egresos = movimientos.filter((m) => m.tipo === "egreso").reduce((t, m) => t + m.monto, 0);
  const saldoFinal = informe.saldoAnterior + ingresos - egresos;

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Informe económico" subtitulo={actividad.nombre} />

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
          <span className="text-[12px] text-slate-500">Saldo anterior</span>
          <span className="text-[13px] font-bold text-slate-800">L. {informe.saldoAnterior.toFixed(2)}</span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {movimientos.map((m) => (
            <div key={m.id} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <input
                  value={m.descripcion}
                  onChange={(e) => actualizarMovimiento(m.id, "descripcion", e.target.value)}
                  placeholder="Descripción"
                  className="min-w-0 flex-1 border-b border-slate-100 pb-1 text-[12.5px] font-semibold text-slate-700 outline-none"
                />
                <button type="button" onClick={() => quitarMovimiento(m.id)} aria-label="Quitar">
                  <HiOutlineTrash className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[13px] font-bold ${m.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}`}>
                  {m.tipo === "ingreso" ? "+" : "−"}
                </span>
                <input
                  type="number"
                  value={m.monto || ""}
                  onChange={(e) => actualizarMovimiento(m.id, "monto", Number(e.target.value))}
                  placeholder="0.00"
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-[12px]"
                />
                <input
                  value={m.responsable}
                  onChange={(e) => actualizarMovimiento(m.id, "responsable", e.target.value)}
                  placeholder="Responsable"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[11.5px]"
                />
              </div>
              <p className="mt-1 text-[10.5px] text-slate-400">{m.tipoComprobante || "Sin comprobante"}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => agregarMovimiento("ingreso")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 py-2.5 text-[12px] font-semibold text-emerald-600"
          >
            <HiOutlinePlus className="h-4 w-4" /> Ingreso
          </button>
          <button
            type="button"
            onClick={() => agregarMovimiento("egreso")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-rose-300 py-2.5 text-[12px] font-semibold text-rose-600"
          >
            <HiOutlinePlus className="h-4 w-4" /> Egreso
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-gradient-to-br from-unah-navy to-unah-navy-light p-4 text-white">
          <p className="text-[10.5px] font-bold uppercase tracking-wide text-white/60">
            Saldo final · calculado automáticamente
          </p>
          <p className="mt-1 text-[26px] font-extrabold">L. {saldoFinal.toFixed(2)}</p>
          <p className="mt-1 text-[11px] text-white/60">
            {informe.saldoAnterior.toFixed(2)} + {ingresos.toFixed(2)} − {egresos.toFixed(2)}
          </p>
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(`/voluntariado/portal-estudiante/coordinador/informe-trimestral/${actividad.grupoId}`)}
          className="w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark"
        >
          Guardar
        </button>
      </footer>
    </div>
  );
}
