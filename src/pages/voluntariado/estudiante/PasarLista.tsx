import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HiOutlineClipboardDocumentCheck, HiOutlineExclamationTriangle } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi, type ActividadDetalleApi, type ParticipacionApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { etiquetaTipoParticipante, fechaCorta, formatoHoras, iniciales } from "../../../utils/voluntariado";

interface EstadoFila {
  seleccionado: boolean;
  asistio: boolean | null;
  horas: string;
}

const HORAS_DEFECTO = "3";
/** Mismo tope que valida voae-voluntariado (MAXIMO_HORAS_PARTICIPACION). */
const HORAS_MAXIMO = 12;

/** Horas validas para quien asistio: un numero mayor que 0 y hasta el tope. */
function horasValidas(texto: string): boolean {
  const horas = Number(texto);
  return texto.trim() !== "" && Number.isFinite(horas) && horas > 0 && horas <= HORAS_MAXIMO;
}

export default function PasarLista() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const idActividad = Number(actividadId);
  const valido = Number.isInteger(idActividad) && idActividad > 0;
  const carga = useApi(
    () =>
      valido
        ? Promise.all([voluntariadoApi.actividad(idActividad), voluntariadoApi.participaciones(idActividad)])
        : Promise.resolve(undefined),
    [idActividad],
  );

  if (!valido || (!carga.cargando && !carga.error && !carga.datos)) {
    return (
      <>
        <HeaderMovilDetalle titulo="Pasar lista" />
        <div className="flex flex-col items-center px-7 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <HiOutlineClipboardDocumentCheck className="h-7 w-7 text-unah-navy" />
          </div>
          <p className="mt-4 text-[15px] font-bold text-slate-800">Tu grupo no tiene actividades aprobadas</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-left text-[12.5px] leading-relaxed text-slate-500">
            <li>Crea la actividad en «Nueva actividad».</li>
            <li>Espera que la VOAE la apruebe.</li>
            <li>Los estudiantes se inscriben en la pestaña Actividades.</li>
            <li>Vuelve aquí para marcar quién asistió.</li>
          </ol>
          <Link
            to="/voluntariado/portal-estudiante/coordinador/actividades/nueva"
            className="mt-6 rounded-xl bg-unah-orange px-6 py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark"
          >
            Crear actividad
          </Link>
        </div>
      </>
    );
  }

  if (!carga.datos) {
    return (
      <>
        <HeaderMovilDetalle titulo="Pasar lista" />
        <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
          {null}
        </EstadoCarga>
      </>
    );
  }

  const [actividad, participaciones] = carga.datos;
  // key: al recargar se reinicia el estado local con lo que quedó guardado.
  return (
    <ListaAsistencia
      key={participaciones.map((p) => `${p.idParticipacion}:${p.codigoEstado}`).join(",")}
      actividad={actividad}
      inscritos={participaciones.filter((p) => p.codigoEstado !== "CANCELADO")}
    />
  );
}

function ListaAsistencia({ actividad, inscritos }: { actividad: ActividadDetalleApi; inscritos: ParticipacionApi[] }) {
  const navigate = useNavigate();
  const { idPersona } = useSesionVoluntariado();
  const [estado, setEstado] = useState<Record<number, EstadoFila>>(() =>
    Object.fromEntries(
      inscritos.map((i) => [
        i.idParticipacion,
        {
          seleccionado: false,
          asistio: i.codigoEstado === "ASISTIO" ? true : i.codigoEstado === "NO_ASISTIO" ? false : null,
          horas: i.horasParticipacion ? String(i.horasParticipacion) : "",
        },
      ]),
    ),
  );
  const [horasMasivo, setHorasMasivo] = useState(HORAS_DEFECTO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function marcar(id: number, asistio: boolean) {
    setEstado((prev) => ({
      ...prev,
      [id]: { ...prev[id], asistio, horas: asistio ? prev[id].horas || HORAS_DEFECTO : "" },
    }));
  }

  function toggleSeleccion(id: number) {
    setEstado((prev) => ({ ...prev, [id]: { ...prev[id], seleccionado: !prev[id].seleccionado } }));
  }

  function actualizarHoras(id: number, horas: string) {
    setEstado((prev) => ({ ...prev, [id]: { ...prev[id], horas } }));
  }

  const seleccionados = inscritos.filter((i) => estado[i.idParticipacion]?.seleccionado);

  function aplicarATodos() {
    if (!horasValidas(horasMasivo)) {
      setError(`Las horas deben ser más de 0 y hasta ${HORAS_MAXIMO} por persona.`);
      return;
    }
    setError(null);
    setEstado((prev) => {
      const copia = { ...prev };
      seleccionados.forEach((i) => {
        copia[i.idParticipacion] = { ...copia[i.idParticipacion], asistio: true, horas: horasMasivo, seleccionado: false };
      });
      return copia;
    });
  }

  const asistieron = inscritos.filter((i) => estado[i.idParticipacion]?.asistio);
  const horasTotales = asistieron.reduce((total, i) => total + (Number(estado[i.idParticipacion].horas) || 0), 0);
  const f = asistieron.filter((i) => i.sexo === "F").length;
  const m = asistieron.filter((i) => i.sexo === "M").length;
  const marcados = inscritos.filter((i) => estado[i.idParticipacion]?.asistio !== null);

  const conHorasInvalidas = asistieron.filter((i) => !horasValidas(estado[i.idParticipacion].horas));

  async function guardar() {
    // La API valida lo mismo; aquí se frena antes para señalar la fila.
    if (conHorasInvalidas.length > 0) {
      setError(
        `Revisa las horas de ${conHorasInvalidas.length === 1 ? "1 persona" : `${conHorasInvalidas.length} personas`}: ` +
          `deben ser más de 0 y hasta ${HORAS_MAXIMO} por actividad.`,
      );
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await voluntariadoApi.pasarLista(
        actividad.idActividad,
        marcados.map((i) => {
          const fila = estado[i.idParticipacion];
          return {
            idPersona: i.idPersona,
            idGrupo: i.idGrupo,
            estado: fila.asistio ? "ASISTIO" : "NO_ASISTIO",
            horas: fila.asistio && fila.horas ? Number(fila.horas) : null,
            tipoParticipante: i.tipoParticipante,
          };
        }),
        idPersona,
      );
      navigate(`/voluntariado/portal-estudiante/coordinador/evidencia/${actividad.idActividad}`);
    } catch (e) {
      setError(mensajeDeError(e));
      setGuardando(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle
        titulo={actividad.nombreActividad}
        subtitulo={`${fechaCorta(actividad.fechaActividad)} · ${actividad.lugarActividad ?? ""}`}
      />

      {seleccionados.length > 0 && (
        <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5">
          <span className="shrink-0 text-[12px] font-bold text-unah-navy">{seleccionados.length} seleccionados</span>
          <input
            type="number"
            min={0.5}
            max={HORAS_MAXIMO}
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
          {inscritos.length === 0 && (
            <p className="text-sm text-slate-400">Nadie se ha inscrito todavía en esta actividad.</p>
          )}
          {inscritos.map((i) => {
            const fila = estado[i.idParticipacion];
            const advertencia = i.tipoParticipante === "VOLUNTARIO_ACTIVO" && !i.validadoComoMiembro;
            const horasMal = fila.asistio === true && !horasValidas(fila.horas);
            return (
              <div key={i.idParticipacion} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={fila.seleccionado}
                    onChange={() => toggleSeleccion(i.idParticipacion)}
                    className="h-[19px] w-[19px] shrink-0 rounded accent-unah-navy"
                  />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                    {iniciales(i.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-slate-800">{i.nombre}</p>
                    <p className="truncate text-[10.5px] text-slate-400">
                      {i.numeroCuenta} · {etiquetaTipoParticipante[i.tipoParticipante]}
                    </p>
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
                      onClick={() => marcar(i.idParticipacion, true)}
                      className={`flex-1 py-1.5 text-[11.5px] font-semibold ${
                        fila.asistio === true ? "bg-emerald-600 text-white" : "bg-white text-slate-500"
                      }`}
                    >
                      Asistió
                    </button>
                    <button
                      type="button"
                      onClick={() => marcar(i.idParticipacion, false)}
                      className={`flex-1 py-1.5 text-[11.5px] font-semibold ${
                        fila.asistio === false ? "bg-rose-600 text-white" : "bg-white text-slate-500"
                      }`}
                    >
                      No asistió
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0.5}
                    max={HORAS_MAXIMO}
                    step="0.5"
                    disabled={fila.asistio !== true}
                    value={fila.horas}
                    onChange={(e) => actualizarHoras(i.idParticipacion, e.target.value)}
                    placeholder="Horas"
                    aria-invalid={horasMal}
                    className={`w-16 shrink-0 rounded-lg border px-2 py-1.5 text-[12px] disabled:bg-slate-50 disabled:text-slate-300 ${
                      horasMal ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200"
                    }`}
                  />
                </div>
                {horasMal && (
                  <p className="mt-1 text-right text-[10.5px] font-semibold text-red-600">
                    Entre 0.5 y {HORAS_MAXIMO} horas
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Calculado automáticamente</p>
        <div className="mt-1.5 flex items-center justify-between text-[12px] text-slate-600">
          <span><strong className="text-unah-navy">{formatoHoras(horasTotales)}</strong> horas</span>
          <span><strong className="text-unah-navy">{asistieron.length}</strong> asistieron</span>
          <span>F {f} · M {m}</span>
        </div>
        {error && <p className="mt-2 rounded-lg bg-red-50 p-2 text-[12px] font-semibold text-red-600">{error}</p>}
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || marcados.length === 0}
          className="mt-3 w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar asistencia"}
        </button>
      </footer>
    </div>
  );
}
