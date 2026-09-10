import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { actividadPorId, nombresInscritos } from "../../../data/mockActividadesVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { inscripcionesDeActividad, desgloseGenero } from "../../../data/voluntariadoSelectors";

interface EstadoFila {
  seleccionado: boolean;
  asistio: boolean | null;
  horas: string;
}

const HORAS_DEFECTO = "3";

export default function PasarLista() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const navigate = useNavigate();
  const actividad = actividadId ? actividadPorId(actividadId) : undefined;
  const grupo = actividad ? grupoPorId(actividad.grupoId) : undefined;
  const inscritos = useMemo(() => (actividadId ? inscripcionesDeActividad(actividadId) : []), [actividadId]);

  const [estado, setEstado] = useState<Record<string, EstadoFila>>(() =>
    Object.fromEntries(inscritos.map((i) => [i.id, { seleccionado: false, asistio: null, horas: "" }])),
  );
  const [horasMasivo, setHorasMasivo] = useState(HORAS_DEFECTO);

  if (!actividad || !grupo) {
    return (
      <>
        <HeaderMovilDetalle titulo="Pasar lista" />
        <p className="p-6 text-sm text-slate-400">No hay una actividad próxima para pasar lista.</p>
      </>
    );
  }

  function nombreDe(cuenta: string) {
    return grupo!.miembros.find((m) => m.numeroCuenta === cuenta)?.nombre ?? nombresInscritos[cuenta] ?? cuenta;
  }

  function esMiembro(cuenta: string) {
    return grupo!.miembros.some((m) => m.numeroCuenta === cuenta);
  }

  function marcar(id: string, asistio: boolean) {
    setEstado((prev) => ({
      ...prev,
      [id]: { ...prev[id], asistio, horas: asistio ? prev[id].horas || HORAS_DEFECTO : "" },
    }));
  }

  function toggleSeleccion(id: string) {
    setEstado((prev) => ({ ...prev, [id]: { ...prev[id], seleccionado: !prev[id].seleccionado } }));
  }

  function actualizarHoras(id: string, horas: string) {
    setEstado((prev) => ({ ...prev, [id]: { ...prev[id], horas } }));
  }

  const seleccionados = inscritos.filter((i) => estado[i.id]?.seleccionado);

  function aplicarATodos() {
    setEstado((prev) => {
      const copia = { ...prev };
      seleccionados.forEach((i) => {
        copia[i.id] = { ...copia[i.id], asistio: true, horas: horasMasivo, seleccionado: false };
      });
      return copia;
    });
  }

  const asistieronIds = inscritos.filter((i) => estado[i.id]?.asistio).map((i) => i.estudianteCuenta);
  const horasTotales = inscritos.reduce((total, i) => total + (estado[i.id]?.asistio ? Number(estado[i.id].horas) || 0 : 0), 0);
  const { f, m } = desgloseGenero(asistieronIds);

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo={actividad.nombre} subtitulo={`${actividad.fecha} · ${actividad.lugar}`} />

      {seleccionados.length > 0 && (
        <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5">
          <span className="shrink-0 text-[12px] font-bold text-unah-navy">{seleccionados.length} seleccionados</span>
          <input
            type="number"
            min={0}
            step="0.5"
            value={horasMasivo}
            onChange={(e) => setHorasMasivo(e.target.value)}
            className="w-16 shrink-0 rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-[12px]"
          />
          <button
            type="button"
            onClick={aplicarATodos}
            className="ml-auto shrink-0 rounded-lg bg-unah-navy px-3 py-1.5 text-[11.5px] font-semibold text-white"
          >
            Aplicar a todos
          </button>
        </div>
      )}

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-2.5">
          {inscritos.map((i) => {
            const fila = estado[i.id];
            const advertencia = i.tipoParticipante === "voluntario activo" && !esMiembro(i.estudianteCuenta);
            return (
              <div key={i.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={fila.seleccionado}
                    onChange={() => toggleSeleccion(i.id)}
                    className="h-[19px] w-[19px] shrink-0 rounded accent-unah-navy"
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                    {nombreDe(i.estudianteCuenta).split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-slate-800">{nombreDe(i.estudianteCuenta)}</p>
                    <p className="truncate text-[10.5px] text-slate-400">{i.estudianteCuenta} · {i.tipoParticipante}</p>
                  </div>
                </div>

                {advertencia && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2">
                    <HiOutlineExclamationTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <p className="text-[10.5px] font-semibold text-amber-700">
                      Se declaró voluntario activo pero no es miembro del grupo.
                    </p>
                  </div>
                )}

                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex flex-1 overflow-hidden rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => marcar(i.id, true)}
                      className={`flex-1 py-1.5 text-[11.5px] font-semibold ${
                        fila.asistio === true ? "bg-emerald-600 text-white" : "bg-white text-slate-500"
                      }`}
                    >
                      Asistió
                    </button>
                    <button
                      type="button"
                      onClick={() => marcar(i.id, false)}
                      className={`flex-1 py-1.5 text-[11.5px] font-semibold ${
                        fila.asistio === false ? "bg-rose-600 text-white" : "bg-white text-slate-500"
                      }`}
                    >
                      No asistió
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    disabled={fila.asistio !== true}
                    value={fila.horas}
                    onChange={(e) => actualizarHoras(i.id, e.target.value)}
                    placeholder="Horas"
                    className="w-16 shrink-0 rounded-lg border border-slate-200 px-2 py-1.5 text-[12px] disabled:bg-slate-50 disabled:text-slate-300"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Calculado automáticamente</p>
        <div className="mt-1.5 flex items-center justify-between text-[12px] text-slate-600">
          <span><strong className="text-unah-navy">{horasTotales}</strong> horas</span>
          <span><strong className="text-unah-navy">{asistieronIds.length}</strong> asistieron</span>
          <span>F {f} · M {m}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/voluntariado/portal-estudiante/coordinador/evidencia/${actividad.id}`)}
          className="mt-3 w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark"
        >
          Guardar asistencia
        </button>
      </footer>
    </div>
  );
}
