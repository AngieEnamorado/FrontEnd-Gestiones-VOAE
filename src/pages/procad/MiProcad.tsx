import { useCallback, useState } from "react";
import { procadConectado } from "../../api/clienteProcad";
import { etiquetaPeriodo } from "../../api/adaptadoresProcad";
import { listarGrupos, obtenerEstudiante, obtenerPeriodoActivo } from "../../api/procad";
import { useConsulta } from "../../api/useConsulta";
import SinIdentidad from "../../components/giras/SinIdentidad";
import AvisoFlotante from "../../components/procad/AvisoFlotante";
import BotonAccion from "../../components/procad/BotonAccion";
import { fechaCorta } from "../../components/procad/formatoProcad";
import PildoraEstado from "../../components/procad/PildoraEstado";
import { useIdentidadProcad } from "../../context/UserContext";
import { RUTA_MODO_PROCAD } from "../../router/rolesProcad";
import type { CodigoEstadoSolicitud, EstudianteApi, GrupoApi, PeriodoApi, SolicitudEstudianteApi } from "../../types/procad";
import LayoutModulo from "./LayoutModulo";
import FormularioSolicitud from "./miProcad/FormularioSolicitud";

type Pestana = "inicio" | "agrupaciones" | "datos";

/** Los estados que cuentan como "ya tienes una solicitud este período" (tgrSolicitudesUnaActivaPorPeriodo). */
const ACTIVAS: CodigoEstadoSolicitud[] = ["PENDIENTE", "OBSERVADO", "APROBADO", "EXPULSADO"];

const TONO: Record<CodigoEstadoSolicitud, Parameters<typeof PildoraEstado>[0]["tono"]> = {
  PENDIENTE: "pendiente",
  OBSERVADO: "info",
  APROBADO: "activo",
  NO_CUMPLE_REQUISITO: "negativo",
  EXPULSADO: "negativo",
};

function Encabezado({ descripcion }: { descripcion: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
      <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">Mi PROCAD</h1>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{descripcion}</p>
    </div>
  );
}

function Caja({ children, tono = "neutro" }: { children: React.ReactNode; tono?: "neutro" | "error" }) {
  return (
    <p className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${tono === "error" ? "bg-rose-50 text-rose-700" : "bg-white text-slate-500 shadow-sm"}`}>
      {children}
    </p>
  );
}

/**
 * El panel del estudiante: en qué va su solicitud, las agrupaciones de su
 * campus a las que puede pedir entrar, y sus datos tal como los tiene
 * Registro. Actúa con el número de cuenta elegido en "Modo de vista".
 */
export default function MiProcad() {
  const identidad = useIdentidadProcad();
  const cuenta = identidad?.numeroCuenta;

  if (!procadConectado) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion="Tu participación en las agrupaciones de PROCAD." />
        <Caja>Esta vista trabaja solo con la base de datos: hace falta VITE_API_PROCAD_URL en .env.local.</Caja>
      </div>
    );
  }

  if (!cuenta) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion="Tu participación en las agrupaciones de PROCAD." />
        <SinIdentidad rol="Estudiante" ruta={RUTA_MODO_PROCAD} />
      </div>
    );
  }

  return <PanelEstudiante key={cuenta} cuenta={cuenta} />;
}

function PanelEstudiante({ cuenta }: { cuenta: string }) {
  const estudiante = useConsulta(() => obtenerEstudiante(cuenta), [cuenta]);
  const periodo = useConsulta(obtenerPeriodoActivo, []);
  const idPeriodo = periodo.datos?.idPeriodo;
  const grupos = useConsulta(() => (idPeriodo ? listarGrupos(idPeriodo) : Promise.resolve([])), [idPeriodo]);
  const [activa, setActiva] = useState<Pestana>("inicio");
  const [formulario, setFormulario] = useState<{ grupo: GrupoApi; corrige: SolicitudEstudianteApi | null } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const descartarAviso = useCallback(() => setAviso(null), []);

  if (estudiante.error || periodo.error) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion={`Cuenta ${cuenta}.`} />
        <Caja tono="error">{estudiante.error ?? periodo.error}</Caja>
      </div>
    );
  }
  if (!estudiante.datos || !periodo.datos) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion={`Cuenta ${cuenta}.`} />
        <Caja>Cargando tus datos de Registro…</Caja>
      </div>
    );
  }

  const e = estudiante.datos;
  const p = periodo.datos;
  const nombre = [e.nombrePersona, e.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${cuenta}`;
  const delPeriodo = e.solicitudes.filter((s) => s.idPeriodo === p.idPeriodo);
  const activaDelPeriodo = delPeriodo.find((s) => ACTIVAS.includes(s.codigoEstado)) ?? null;
  const grupoDe = (idGrupo: number) => (grupos.datos ?? []).find((g) => g.idGrupo === idGrupo) ?? null;

  function abrirFormulario(grupo: GrupoApi, corrige: SolicitudEstudianteApi | null) {
    setFormulario({ grupo, corrige });
  }

  return (
    <>
      <LayoutModulo
        titulo="Mi PROCAD"
        descripcion={`${nombre} · cuenta ${cuenta} · ${e.nombreCampus ?? "sin campus"} · período ${etiquetaPeriodo(p.anioPeriodo, p.numeroPac)}.`}
        nombre="mi-procad"
        activa={activa}
        onCambiar={(id) => {
          setFormulario(null);
          setActiva(id);
        }}
        pestanas={[
          { id: "inicio", label: "Inicio" },
          { id: "agrupaciones", label: "Agrupaciones" },
          { id: "datos", label: "Mis datos" },
        ]}
      >
        {formulario ? (
          <FormularioSolicitud
            estudiante={e}
            grupo={formulario.grupo}
            idPeriodo={p.idPeriodo}
            corrige={formulario.corrige}
            onCancelar={() => setFormulario(null)}
            onEnviada={(mensaje) => {
              setFormulario(null);
              setAviso(mensaje);
              setActiva("inicio");
              estudiante.recargar();
            }}
          />
        ) : (
          <>
            {activa === "inicio" && (
              <Inicio
                estudiante={e}
                activa={activaDelPeriodo}
                historial={e.solicitudes}
                grupoDe={grupoDe}
                onCorregir={(s, g) => abrirFormulario(g, s)}
                onVerAgrupaciones={() => setActiva("agrupaciones")}
              />
            )}
            {activa === "agrupaciones" && (
              <Agrupaciones
                estudiante={e}
                grupos={grupos.datos ?? []}
                cargando={grupos.cargando}
                bloqueo={activaDelPeriodo}
                onSolicitar={(g) => abrirFormulario(g, null)}
              />
            )}
            {activa === "datos" && <MisDatos estudiante={e} periodo={p} />}
          </>
        )}
      </LayoutModulo>
      <AvisoFlotante mensaje={aviso} onDescartar={descartarAviso} />
    </>
  );
}

/* --------------------------------- Inicio -------------------------------- */

function Inicio({
  estudiante,
  activa,
  historial,
  grupoDe,
  onCorregir,
  onVerAgrupaciones,
}: {
  estudiante: EstudianteApi;
  activa: SolicitudEstudianteApi | null;
  historial: SolicitudEstudianteApi[];
  grupoDe: (idGrupo: number) => GrupoApi | null;
  onCorregir: (s: SolicitudEstudianteApi, g: GrupoApi) => void;
  onVerAgrupaciones: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <EstadoActual estudiante={estudiante} activa={activa} grupoDe={grupoDe} onCorregir={onCorregir} onVerAgrupaciones={onVerAgrupaciones} />

      {historial.length > 0 && (
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-800">Tus solicitudes</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {historial.map((s) => (
              <li key={s.idSolicitud} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-700">{s.nombreGrupo}</span>
                  <span className="block text-xs text-slate-400">
                    {etiquetaPeriodo(s.anioPeriodo, s.numeroPac)} · enviada el {fechaCorta(s.fechaInscripcion)}
                  </span>
                </span>
                <PildoraEstado tono={TONO[s.codigoEstado]}>{s.nombreEstado}</PildoraEstado>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EstadoActual({
  estudiante,
  activa,
  grupoDe,
  onCorregir,
  onVerAgrupaciones,
}: {
  estudiante: EstudianteApi;
  activa: SolicitudEstudianteApi | null;
  grupoDe: (idGrupo: number) => GrupoApi | null;
  onCorregir: (s: SolicitudEstudianteApi, g: GrupoApi) => void;
  onVerAgrupaciones: () => void;
}) {
  const tarjeta = (titulo: string, cuerpo: React.ReactNode, tono: "neutro" | "exito" | "aviso" | "alerta", accion?: React.ReactNode) => {
    const fondo = {
      neutro: "bg-white",
      exito: "bg-emerald-50",
      aviso: "bg-amber-50",
      alerta: "bg-rose-50",
    }[tono];
    const texto = { neutro: "text-slate-800", exito: "text-emerald-900", aviso: "text-amber-900", alerta: "text-rose-900" }[tono];
    return (
      <section className={`rounded-2xl p-5 shadow-sm sm:p-6 ${fondo}`}>
        <h2 className={`text-lg font-bold ${texto}`}>{titulo}</h2>
        <div className={`mt-1.5 max-w-3xl text-sm leading-relaxed ${texto} opacity-80`}>{cuerpo}</div>
        {accion && <div className="mt-4">{accion}</div>}
      </section>
    );
  };

  if (!activa) {
    return tarjeta(
      "Todavía no perteneces a ninguna agrupación este período",
      "Mira las agrupaciones de tu campus y pide entrar a la que te interese. Solo puedes tener una solicitud activa a la vez.",
      "neutro",
      <BotonAccion tono="primario" onClick={onVerAgrupaciones}>
        Ver agrupaciones
      </BotonAccion>,
    );
  }

  const grupo = activa.nombreGrupo;
  switch (activa.codigoEstado) {
    case "PENDIENTE":
      return tarjeta(
        `Tu solicitud a ${grupo} está en revisión`,
        <>
          La está revisando el director del grupo; puede citarte a una visoría.
          {!activa.cumpleIndiceMinimo &&
            (activa.esCondicionado
              ? " Ya te autorizaron como condicionado: falta que el director la apruebe."
              : activa.condicionadoPropuesto
                ? " El director te propuso como condicionado; falta la firma del administrador."
                : ` Tu índice no alcanza el ${estudiante.indiceMinimo}%: solo puede entrar como condicionado, si el director lo propone.`)}
        </>,
        "aviso",
      );
    case "OBSERVADO": {
      const g = grupoDe(activa.idGrupo);
      return tarjeta(
        `Tu solicitud a ${grupo} fue observada`,
        <>
          Te piden corregir algo antes de decidir.
          {activa.ultimaObservacion && (
            <span className="mt-2 block rounded-xl bg-white/70 px-3.5 py-2.5 font-medium">«{activa.ultimaObservacion}»</span>
          )}
        </>,
        "aviso",
        g && (
          <BotonAccion tono="primario" onClick={() => onCorregir(activa, g)}>
            Corregir y reenviar
          </BotonAccion>
        ),
      );
    }
    case "APROBADO":
      return tarjeta(
        `Eres integrante de ${grupo}`,
        <>
          {activa.esEquipo ? "Estás en el equipo que compite." : "Ya formas parte del grupo este período."}
          {activa.esCondicionado && " Entraste como condicionado por tu talento."} Tu asistencia a las actividades
          validadas cuenta para la matrícula preferencial.
        </>,
        "exito",
      );
    case "EXPULSADO":
      return tarjeta(`Fuiste separado(a) de ${grupo}`, "Este período ya no puedes pedir entrar a otro grupo.", "alerta");
    default:
      return tarjeta(`Tu solicitud a ${grupo} no fue aprobada`, activa.ultimaObservacion ?? "", "alerta");
  }
}

/* ------------------------------ Agrupaciones ------------------------------ */

function Agrupaciones({
  estudiante,
  grupos,
  cargando,
  bloqueo,
  onSolicitar,
}: {
  estudiante: EstudianteApi;
  grupos: GrupoApi[];
  cargando: boolean;
  bloqueo: SolicitudEstudianteApi | null;
  onSolicitar: (g: GrupoApi) => void;
}) {
  const genero = (estudiante.genero ?? "").toLowerCase();
  // Solo las de su campus y de su categoría: spCrearSolicitud rechaza las demás.
  const abiertas = grupos.filter(
    (g) =>
      g.activo &&
      !g.esSeleccion &&
      g.idCampus === estudiante.idCampus &&
      (g.categoriaSexo === "mixto" || g.categoriaSexo === genero),
  );

  if (cargando && grupos.length === 0) return <Caja>Cargando agrupaciones…</Caja>;
  if (abiertas.length === 0) {
    return <Caja>No hay agrupaciones abiertas para ti en {estudiante.nombreCampus ?? "tu campus"} este período.</Caja>;
  }

  return (
    <div className="flex flex-col gap-4">
      {bloqueo && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ya tienes una solicitud activa en {bloqueo.nombreGrupo}: solo se puede tener una a la vez.
        </p>
      )}
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {abiertas.map((g) => {
          const detalle =
            g.tipoGrupo === "deportivo"
              ? g.nombreDeporte
              : g.disciplinas.map((d) => d.nombreDisciplina).join(", ") || null;
          return (
            <li key={g.idGrupo} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
              <span className="flex flex-wrap items-center gap-2">
                <PildoraEstado tono="info">{g.tipoGrupo === "deportivo" ? "Deportivo" : "Artístico"}</PildoraEstado>
                {g.categoriaSexo !== "mixto" && <span className="text-xs font-semibold capitalize text-slate-400">{g.categoriaSexo}</span>}
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-800">{g.nombreGrupo}</h3>
              <p className="mt-1 text-sm capitalize text-slate-500">{detalle ?? " "}</p>
              <p className="mt-1 text-xs text-slate-400">
                {g.integrantes} {g.integrantes === 1 ? "integrante" : "integrantes"} este período
              </p>
              <div className="mt-auto pt-4">
                <BotonAccion tono={bloqueo ? "neutro" : "primario"} onClick={() => !bloqueo && onSolicitar(g)} title={bloqueo ? "Ya tienes una solicitud activa" : undefined}>
                  {bloqueo?.idGrupo === g.idGrupo ? "Tu solicitud está aquí" : "Solicitar ingreso"}
                </BotonAccion>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------- Mis datos ------------------------------- */

function MisDatos({ estudiante: e, periodo }: { estudiante: EstudianteApi; periodo: PeriodoApi }) {
  const datos: [string, string][] = [
    ["Nombre", [e.nombrePersona, e.apellidosPersona].filter(Boolean).join(" ") || "—"],
    ["Número de cuenta", e.numeroCuenta],
    ["Carrera", e.carrera ?? "—"],
    ["Campus", e.nombreCampus ?? "—"],
    ["Correo institucional", e.correoInstitucional ?? "—"],
    ["Teléfono", e.telefono ?? "—"],
    [`Índice del período (${etiquetaPeriodo(periodo.anioPeriodo, periodo.numeroPac)})`, e.indicePeriodo === null ? "Sin dato" : `${e.indicePeriodo}%`],
    ["Índice global", e.indiceGlobal === null ? "Sin dato" : `${e.indiceGlobal}%`],
    ["Matrícula", e.matriculado ? "Matriculado este período" : "Sin matrícula vigente"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className={`rounded-xl px-4 py-3 text-sm ${e.cumpleIndiceMinimo ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
        {e.cumpleIndiceMinimo
          ? `Tu índice del período cumple el mínimo requerido (≥ ${e.indiceMinimo}%).`
          : `Tu índice del período no alcanza el mínimo requerido (≥ ${e.indiceMinimo}%). Puedes entrar como condicionado.`}
        {!e.matriculado && " Sin matrícula vigente no te pueden aprobar."}
      </p>
      <dl className="grid gap-x-8 gap-y-4 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</dt>
            <dd className="mt-0.5 break-words text-sm font-semibold text-slate-700">{valor}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-slate-400">Estos datos vienen de Registro. Si algo no es correcto, se corrige allá, no aquí.</p>
    </div>
  );
}
