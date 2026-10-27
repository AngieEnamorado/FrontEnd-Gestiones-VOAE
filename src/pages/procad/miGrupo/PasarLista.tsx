import { useMemo, useState } from "react";
import { listarActividadesDeGrupo, listarAsistencia, listarIntegrantes, registrarAsistencia } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import { Campo } from "../../../components/procad/CamposFormulario";
import { CLASE_CAMPO, fechaCorta } from "../../../components/procad/formatoProcad";
import type { ActividadApi, GrupoApi } from "../../../types/procad";
import { explicarErrorDeColumnas } from "./avisosBase";
import type { Ejecutar } from "./ejecutar";

type Marca = "presente" | "ausente" | "excusado";

const OPCIONES: { id: Marca; texto: string; activo: string }[] = [
  { id: "presente", texto: "Presente", activo: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  { id: "ausente", texto: "Ausente", activo: "border-rose-300 bg-rose-50 text-rose-700" },
  { id: "excusado", texto: "Excusado", activo: "border-amber-300 bg-amber-50 text-amber-700" },
];

const nombreDe = (a: ActividadApi) => `${fechaCorta(a.fechaActividad)} · ${a.tituloActividad ?? a.nombreTipoActividad ?? "Actividad"}`;

/**
 * El pase de lista de una actividad validada: la base no deja marcar
 * asistencia sobre lo que el administrador no ha validado. Se marca a todo el
 * grupo de una vez; quien falta con excusa la deja escrita.
 */
export default function PasarLista({
  grupo,
  idPeriodo,
  ejecutar,
}: {
  grupo: GrupoApi;
  idPeriodo: number;
  ejecutar: Ejecutar;
}) {
  const actividades = useConsulta(() => listarActividadesDeGrupo(grupo.idGrupo, idPeriodo), [grupo.idGrupo, idPeriodo]);
  const validadas = useMemo(
    () =>
      (actividades.datos ?? [])
        .filter((a) => a.codigoEstado === "VALIDADA")
        .sort((a, b) => b.fechaActividad.localeCompare(a.fechaActividad)),
    [actividades.datos],
  );
  const [idActividad, setIdActividad] = useState<number | null>(null);
  const elegida = validadas.find((a) => a.idActividad === idActividad) ?? validadas[0] ?? null;

  if (actividades.error) {
    return (
      <p className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
        {explicarErrorDeColumnas(actividades.error)}
      </p>
    );
  }

  if (actividades.cargando && !actividades.datos) {
    return <p className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">Cargando actividades…</p>;
  }

  if (!elegida) {
    return (
      <p className="rounded-2xl bg-white px-5 py-4 text-sm leading-relaxed text-slate-500 shadow-sm">
        No hay actividades validadas este período. Registre una en la pestaña Actividades; cuando el administrador la
        valide, aparece aquí para pasar lista.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Campo etiqueta="Actividad" className="max-w-md">
        <select value={elegida.idActividad} onChange={(e) => setIdActividad(Number(e.target.value))} className={CLASE_CAMPO}>
          {validadas.map((a) => (
            <option key={a.idActividad} value={a.idActividad}>
              {nombreDe(a)}
            </option>
          ))}
        </select>
      </Campo>
      <Lista key={elegida.idActividad} actividad={elegida} grupo={grupo} idPeriodo={idPeriodo} ejecutar={ejecutar} />
    </div>
  );
}

function Lista({
  actividad,
  grupo,
  idPeriodo,
  ejecutar,
}: {
  actividad: ActividadApi;
  grupo: GrupoApi;
  idPeriodo: number;
  ejecutar: Ejecutar;
}) {
  const integrantes = useConsulta(() => listarIntegrantes(grupo.idGrupo, idPeriodo), [grupo.idGrupo, idPeriodo]);
  const asistencia = useConsulta(() => listarAsistencia(actividad.idActividad), [actividad.idActividad]);
  // Lo que cambió el director en esta pantalla; lo demás se lee de la base.
  const [cambios, setCambios] = useState<Record<number, { marca: Marca; excusa: string }>>({});
  const [faltanExcusas, setFaltanExcusas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const filas = useMemo(() => {
    const guardadas = new Map((asistencia.datos?.asistencias ?? []).map((a) => [a.idSolicitud, a]));
    return (integrantes.datos?.integrantes ?? []).map((i) => {
      const previa = guardadas.get(i.idSolicitud);
      const marcaGuardada: Marca | null =
        previa?.asistio === true ? "presente" : previa?.esExcusado ? "excusado" : previa?.asistio === false ? "ausente" : null;
      const cambio = cambios[i.idSolicitud];
      return {
        idSolicitud: i.idSolicitud,
        nombre: [i.nombrePersona, i.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${i.numeroCuenta ?? ""}`,
        numeroCuenta: i.numeroCuenta,
        marca: cambio?.marca ?? marcaGuardada,
        excusa: cambio?.excusa ?? previa?.justificacionExcusa ?? "",
        guardada: marcaGuardada !== null,
      };
    });
  }, [integrantes.datos, asistencia.datos, cambios]);

  const sinMarcar = filas.filter((f) => f.marca === null).length;
  const yaPasada = filas.length > 0 && filas.every((f) => f.guardada);

  function marcar(idSolicitud: number, marca: Marca, excusa?: string) {
    setCambios((previos) => {
      const actual = filas.find((f) => f.idSolicitud === idSolicitud);
      return { ...previos, [idSolicitud]: { marca, excusa: excusa ?? actual?.excusa ?? "" } };
    });
  }

  async function guardar() {
    const marcadas = filas.filter((f) => f.marca !== null);
    if (marcadas.some((f) => f.marca === "excusado" && !f.excusa.trim())) {
      setFaltanExcusas(true);
      return;
    }
    setFaltanExcusas(false);
    setEnviando(true);
    await ejecutar(
      (idPersona) =>
        registrarAsistencia(
          actividad.idActividad,
          marcadas.map((f) => ({
            idSolicitud: f.idSolicitud,
            asistio: f.marca === "presente",
            esExcusado: f.marca === "excusado",
            justificacionExcusa: f.marca === "excusado" ? f.excusa.trim() : undefined,
            // Quien pasa lista es quien acepta la excusa.
            idPersonaValidaExcusa: f.marca === "excusado" ? idPersona : undefined,
          })),
        ),
      `Guardó la lista de ${nombreDe(actividad)}.`,
      () => {
        setCambios({});
        asistencia.recargar();
      },
    );
    setEnviando(false);
  }

  if (integrantes.error || asistencia.error) {
    return (
      <p className="rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-800">
        {explicarErrorDeColumnas(integrantes.error ?? asistencia.error ?? "")}
      </p>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <p className="text-sm text-slate-500">
          {filas.length} integrantes
          {sinMarcar > 0 ? ` · ${sinMarcar} sin marcar` : ""}
          {yaPasada && Object.keys(cambios).length === 0 ? " · lista ya guardada" : ""}
        </p>
        <button
          type="button"
          onClick={() => setCambios(Object.fromEntries(filas.map((f) => [f.idSolicitud, { marca: "presente" as Marca, excusa: "" }])))}
          className="text-xs font-semibold text-unah-navy hover:underline"
        >
          Marcar a todos presentes
        </button>
      </div>

      <ul className="divide-y divide-slate-100 px-5 py-2 sm:px-6">
        {filas.map((f) => (
          <li key={f.idSolicitud} className="flex flex-wrap items-center gap-3 py-3">
            <span className="flex min-w-[240px] flex-1 items-center gap-2.5">
              <AvatarIniciales nombre={f.nombre} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-700">{f.nombre}</span>
                <span className="block font-mono text-[11px] text-slate-400">{f.numeroCuenta}</span>
              </span>
            </span>
            <span role="radiogroup" aria-label={`Asistencia de ${f.nombre}`} className="flex gap-1.5">
              {OPCIONES.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={f.marca === o.id}
                  onClick={() => marcar(f.idSolicitud, o.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                    f.marca === o.id ? o.activo : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {o.texto}
                </button>
              ))}
            </span>
            {f.marca === "excusado" && (
              <input
                type="text"
                value={f.excusa}
                onChange={(e) => marcar(f.idSolicitud, "excusado", e.target.value)}
                placeholder="Motivo de la excusa"
                aria-label={`Motivo de la excusa de ${f.nombre}`}
                maxLength={300}
                className={`${CLASE_CAMPO} mt-0 basis-full sm:basis-64 ${faltanExcusas && !f.excusa.trim() ? "border-rose-400" : ""}`}
              />
            )}
          </li>
        ))}
        {!integrantes.cargando && filas.length === 0 && (
          <li className="py-4 text-sm text-slate-500">El grupo no tiene integrantes este período.</li>
        )}
      </ul>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
        {faltanExcusas && <span className="text-xs font-semibold text-rose-600">Cada excusado necesita su motivo.</span>}
        <button
          type="button"
          onClick={guardar}
          disabled={enviando || filas.every((f) => f.marca === null)}
          className="rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-suave hover:bg-unah-navy-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar lista"}
        </button>
      </div>
    </div>
  );
}
