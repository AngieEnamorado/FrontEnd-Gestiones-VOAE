import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type ActividadDetalleApi, type InformeEconomicoApi } from "../../../api/voluntariado";
import { ErrorApi, mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";

interface FilaMovimiento {
  clave: number;
  tipo: "INGRESO" | "EGRESO";
  descripcion: string;
  monto: number;
  responsable: string;
  tipoComprobante: string;
}

const COMPROBANTES = ["Factura", "Recibo", "Transferencia"];

let contador = 0;
const nuevaClave = () => ++contador;

export default function InformeEconomico() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const idActividad = Number(actividadId);
  const carga = useApi(
    () =>
      Promise.all([
        voluntariadoApi.actividad(idActividad),
        // Una actividad sin informe económico todavía devuelve 404: se empieza en blanco.
        voluntariadoApi.informeEconomico(idActividad).catch((e) => {
          if (e instanceof ErrorApi && e.estado === 404) return null;
          throw e;
        }),
      ]),
    [idActividad],
  );

  if (!carga.datos) {
    return (
      <>
        <HeaderMovilDetalle titulo="Informe económico" />
        <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
          {null}
        </EstadoCarga>
      </>
    );
  }

  const [actividad, informe] = carga.datos;
  return <Formulario actividad={actividad} informe={informe} />;
}

function Formulario({ actividad, informe }: { actividad: ActividadDetalleApi; informe: InformeEconomicoApi | null }) {
  const navigate = useNavigate();
  // Las cuentas se llevan por grupo; aquí se capturan las del grupo organizador.
  const idGrupo = actividad.idGrupoOrganizador;
  const cuentaGrupo = informe?.grupos.find((g) => g.idGrupo === idGrupo);

  const [saldoAnterior, setSaldoAnterior] = useState(cuentaGrupo?.saldoAnterior ?? 0);
  const [movimientos, setMovimientos] = useState<FilaMovimiento[]>(() =>
    (informe?.movimientos ?? [])
      .filter((m) => m.idInformeEconomicoGrupo === cuentaGrupo?.idInformeEconomicoGrupo)
      .map((m) => ({
        clave: nuevaClave(),
        tipo: m.tipoMovimiento,
        descripcion: m.descripcionMovimiento,
        monto: m.montoMovimiento,
        responsable: m.responsableMovimiento ?? "",
        tipoComprobante: m.tipoComprobante ?? "",
      })),
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Se marca en rojo lo que falta solo después de intentar guardar, no mientras se escribe.
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  function agregarMovimiento(tipo: FilaMovimiento["tipo"]) {
    setMovimientos((prev) => [
      ...prev,
      { clave: nuevaClave(), tipo, descripcion: "", monto: 0, responsable: "", tipoComprobante: "" },
    ]);
  }

  function actualizarMovimiento(clave: number, campo: keyof FilaMovimiento, valor: string | number) {
    setMovimientos((prev) => prev.map((m) => (m.clave === clave ? { ...m, [campo]: valor } : m)));
  }

  function quitarMovimiento(clave: number) {
    setMovimientos((prev) => prev.filter((m) => m.clave !== clave));
  }

  const ingresos = movimientos.filter((m) => m.tipo === "INGRESO").reduce((t, m) => t + m.monto, 0);
  const egresos = movimientos.filter((m) => m.tipo === "EGRESO").reduce((t, m) => t + m.monto, 0);
  const saldoFinal = saldoAnterior + ingresos - egresos;

  // Una fila que se agregó y nunca se llenó no es un error: se descarta al guardar.
  const filaVacia = (m: FilaMovimiento) => !m.descripcion.trim() && !m.monto && !m.responsable.trim();
  const faltaDescripcion = (m: FilaMovimiento) => !filaVacia(m) && !m.descripcion.trim();
  const faltaMonto = (m: FilaMovimiento) => !filaVacia(m) && !(m.monto > 0);

  async function guardar() {
    setIntentoGuardar(true);
    const aGuardar = movimientos.filter((m) => !filaVacia(m));
    const incompletos = aGuardar.filter((m) => faltaDescripcion(m) || faltaMonto(m)).length;
    if (incompletos > 0) {
      setError(
        incompletos === 1
          ? "Un movimiento no tiene descripción o monto. Complétalo o quítalo con el ícono de basura."
          : `${incompletos} movimientos no tienen descripción o monto. Complétalos o quítalos con el ícono de basura.`,
      );
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await voluntariadoApi.guardarInformeEconomico(actividad.idActividad, {
        saldosAnteriores: { [idGrupo]: saldoAnterior },
        observaciones: informe?.observacionesInformeEconomico ?? null,
        movimientos: aGuardar.map((m) => ({
          idGrupo,
          tipoMovimiento: m.tipo,
          fechaMovimiento: null,
          descripcionMovimiento: m.descripcion.trim(),
          responsableMovimiento: m.responsable || null,
          tipoComprobante: m.tipoComprobante || null,
          montoMovimiento: m.monto,
        })),
      });
      navigate(`/voluntariado/portal-estudiante/coordinador/informe-trimestral/${idGrupo}`);
    } catch (e) {
      setError(mensajeDeError(e));
      setGuardando(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Informe económico" subtitulo={actividad.nombreActividad} />

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
          <span className="text-[12px] text-slate-500">Saldo anterior</span>
          <span className="flex items-center gap-1 text-[13px] font-bold text-slate-800">
            L.
            <input
              type="number"
              step="0.01"
              value={saldoAnterior || ""}
              onChange={(e) => setSaldoAnterior(Number(e.target.value))}
              placeholder="0.00"
              className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-[12.5px]"
            />
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {movimientos.map((m) => (
            <div key={m.clave} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <input
                  value={m.descripcion}
                  onChange={(e) => actualizarMovimiento(m.clave, "descripcion", e.target.value)}
                  placeholder={
                    intentoGuardar && faltaDescripcion(m) ? "Falta la descripción" : "Descripción (ej. Compra de víveres)"
                  }
                  className={`min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-[12.5px] font-semibold text-slate-700 outline-none focus:border-unah-orange ${
                    intentoGuardar && faltaDescripcion(m) ? "border-red-400 placeholder:text-red-400" : "border-slate-200"
                  }`}
                />
                <button type="button" onClick={() => quitarMovimiento(m.clave)} aria-label="Quitar">
                  <HiOutlineTrash className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[13px] font-bold ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-rose-600"}`}>
                  {m.tipo === "INGRESO" ? "+" : "−"}
                </span>
                <input
                  type="number"
                  value={m.monto || ""}
                  onChange={(e) => actualizarMovimiento(m.clave, "monto", Number(e.target.value))}
                  placeholder="0.00"
                  className={`w-20 rounded-lg border px-2 py-1 text-[12px] ${
                    intentoGuardar && faltaMonto(m) ? "border-red-400" : "border-slate-200"
                  }`}
                />
                <input
                  value={m.responsable}
                  onChange={(e) => actualizarMovimiento(m.clave, "responsable", e.target.value)}
                  placeholder="Responsable"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[11.5px]"
                />
              </div>
              <select
                value={m.tipoComprobante}
                onChange={(e) => actualizarMovimiento(m.clave, "tipoComprobante", e.target.value)}
                className="mt-1.5 rounded-md border border-slate-100 bg-white px-1.5 py-0.5 text-[10.5px] text-slate-500"
              >
                <option value="">Sin comprobante</option>
                {COMPROBANTES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => agregarMovimiento("INGRESO")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 py-2.5 text-[12px] font-semibold text-emerald-600"
          >
            <HiOutlinePlus className="h-4 w-4" /> Ingreso
          </button>
          <button
            type="button"
            onClick={() => agregarMovimiento("EGRESO")}
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
            {saldoAnterior.toFixed(2)} + {ingresos.toFixed(2)} − {egresos.toFixed(2)}
          </p>
        </div>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-[12px] font-semibold text-red-600">{error}</p>}
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </footer>
    </div>
  );
}
