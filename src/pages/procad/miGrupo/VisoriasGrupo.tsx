import { useMemo, useState } from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import { citarEstudiantes, crearVisoria, listarCatalogos, listarVisoriasDeGrupo, programarVisoria } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import BotonAccion from "../../../components/procad/BotonAccion";
import { Campo, PanelFormulario } from "../../../components/procad/CamposFormulario";
import { CLASE_CAMPO, fechaCorta, hoyIso } from "../../../components/procad/formatoProcad";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import type { GrupoApi, SolicitudApi, VisoriaApi } from "../../../types/procad";
import { explicarErrorDeColumnas } from "./avisosBase";
import type { Ejecutar } from "./ejecutar";

const nombreDe = (s: SolicitudApi) =>
  [s.nombrePersona, s.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${s.numeroCuenta ?? s.idPersona}`;

/**
 * La prueba de ingreso del grupo. Se crea en borrador (solo la ve el
 * director), se cita a quienes tienen la solicitud pendiente y se programa:
 * desde ahí la ven los citados.
 */
export default function VisoriasGrupo({
  grupo,
  idPeriodo,
  solicitudes,
  ejecutar,
}: {
  grupo: GrupoApi;
  idPeriodo: number;
  solicitudes: SolicitudApi[];
  ejecutar: Ejecutar;
}) {
  const visorias = useConsulta(() => listarVisoriasDeGrupo(grupo.idGrupo, idPeriodo), [grupo.idGrupo, idPeriodo]);
  const [creando, setCreando] = useState(false);
  const [citando, setCitando] = useState<number | null>(null);
  const pendientes = solicitudes.filter((s) => s.codigoEstado === "PENDIENTE");
  const lista = useMemo(
    () => [...(visorias.datos ?? [])].sort((a, b) => a.fechaVisoria.localeCompare(b.fechaVisoria)),
    [visorias.datos],
  );

  function programar(v: VisoriaApi) {
    ejecutar(() => programarVisoria(v.idVisoria), `Programó la visoría del ${fechaCorta(v.fechaVisoria)}: ya la ven los citados.`, visorias.recargar);
  }

  return (
    <div className="flex flex-col gap-4">
      {creando ? (
        <FormularioVisoria
          grupo={grupo}
          idPeriodo={idPeriodo}
          ejecutar={ejecutar}
          onCancelar={() => setCreando(false)}
          onGuardada={() => {
            setCreando(false);
            visorias.recargar();
          }}
        />
      ) : (
        !visorias.error && (
        <div>
          <BotonAccion tono="primario" onClick={() => setCreando(true)}>
            <HiOutlinePlus className="h-3.5 w-3.5" />
            Nueva visoría
          </BotonAccion>
        </div>
        )
      )}

      {visorias.error ? (
        <p className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
          {explicarErrorDeColumnas(visorias.error)}
        </p>
      ) : lista.length === 0 ? (
        <p className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
          {visorias.cargando ? "Cargando visorías…" : "No hay visorías del grupo este período."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((v) => (
            <li key={v.idVisoria} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-800">
                    {fechaCorta(v.fechaVisoria)}
                    {v.horaVisoria && <span className="font-medium text-slate-500"> · {v.horaVisoria}</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {v.nombreLugar ?? "Sin lugar asignado"} · {v.citados} {v.citados === 1 ? "citado" : "citados"}
                  </p>
                </div>
                <span className="flex flex-wrap items-center gap-2">
                  <PildoraEstado tono={v.estadoVisoria === "PROGRAMADA" ? "activo" : "inactivo"}>
                    {v.estadoVisoria === "PROGRAMADA" ? "Programada" : "Borrador"}
                  </PildoraEstado>
                  <BotonAccion onClick={() => setCitando(citando === v.idVisoria ? null : v.idVisoria)}>Citar</BotonAccion>
                  {v.estadoVisoria === "BORRADOR" && (
                    <BotonAccion tono="primario" onClick={() => programar(v)}>
                      Programar
                    </BotonAccion>
                  )}
                </span>
              </div>
              {citando === v.idVisoria && (
                <Citar
                  visoria={v}
                  pendientes={pendientes}
                  ejecutar={ejecutar}
                  onListo={() => {
                    setCitando(null);
                    visorias.recargar();
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Citar({
  visoria,
  pendientes,
  ejecutar,
  onListo,
}: {
  visoria: VisoriaApi;
  pendientes: SolicitudApi[];
  ejecutar: Ejecutar;
  onListo: () => void;
}) {
  const [elegidas, setElegidas] = useState<number[]>([]);

  if (pendientes.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">No hay solicitudes pendientes que citar.</p>;
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Citar a quienes esperan respuesta</p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {pendientes.map((s) => (
          <li key={s.idSolicitud}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={elegidas.includes(s.idSolicitud)}
                onChange={(e) =>
                  setElegidas((previas) => (e.target.checked ? [...previas, s.idSolicitud] : previas.filter((x) => x !== s.idSolicitud)))
                }
                className="h-4 w-4 accent-unah-navy"
              />
              {nombreDe(s)}
              <span className="font-mono text-[11px] text-slate-400">{s.numeroCuenta}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end">
        <BotonAccion
          tono="primario"
          onClick={() => {
            if (elegidas.length === 0) return;
            ejecutar(
              () => citarEstudiantes(visoria.idVisoria, elegidas),
              `Citó a ${elegidas.length} ${elegidas.length === 1 ? "estudiante" : "estudiantes"}.`,
              onListo,
            );
          }}
        >
          Citar a {elegidas.length || "…"}
        </BotonAccion>
      </div>
    </div>
  );
}

function FormularioVisoria({
  grupo,
  idPeriodo,
  ejecutar,
  onCancelar,
  onGuardada,
}: {
  grupo: GrupoApi;
  idPeriodo: number;
  ejecutar: Ejecutar;
  onCancelar: () => void;
  onGuardada: () => void;
}) {
  const catalogos = useConsulta(listarCatalogos, []);
  // Solo los lugares de su campus y de su clase de grupo: la base rechaza los demás.
  const lugares = (catalogos.datos?.lugaresVisoria ?? []).filter(
    (l) => l.idCampus === grupo.idCampus && l.idTipoGrupo === grupo.idTipoGrupo,
  );
  const [fecha, setFecha] = useState(hoyIso());
  const [hora, setHora] = useState("");
  const [lugar, setLugar] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    let ok = false;
    await ejecutar(
      async () => {
        await crearVisoria({
          idPeriodo,
          idCampus: grupo.idCampus,
          idGrupo: grupo.idGrupo,
          fechaVisoria: fecha,
          horaVisoria: hora || undefined,
          idLugarVisoria: lugar ? Number(lugar) : undefined,
        });
        ok = true;
      },
      `Creó la visoría del ${fechaCorta(fecha)} en borrador.`,
    );
    setEnviando(false);
    if (ok) onGuardada();
  }

  return (
    <PanelFormulario
      titulo="Nueva visoría"
      descripcion="Queda en borrador: cite a los estudiantes y prográmela cuando esté lista."
      onCancelar={onCancelar}
      onEnviar={enviar}
      enviando={enviando}
      textoEnviar="Crear"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Fecha">
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Hora" opcional>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Lugar" opcional>
          <select value={lugar} onChange={(e) => setLugar(e.target.value)} className={CLASE_CAMPO}>
            <option value="">{catalogos.cargando ? "Cargando…" : "Sin lugar"}</option>
            {lugares.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombreLugar}
              </option>
            ))}
          </select>
        </Campo>
      </div>
    </PanelFormulario>
  );
}
