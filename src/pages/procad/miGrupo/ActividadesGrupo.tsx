import { useMemo, useState } from "react";
import { HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import { crearActividad, crearSerie, listarActividadesDeGrupo } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import BarraTabla from "../../../components/procad/BarraTabla";
import BotonAccion from "../../../components/procad/BotonAccion";
import { SinDato } from "../../../components/procad/BotonDecision";
import { Campo, PanelFormulario } from "../../../components/procad/CamposFormulario";
import { columnasDe, descargarTabla, filasDe, type CampoTabla } from "../../../components/procad/camposTabla";
import { CLASE_CAMPO, fechaCorta, hoyIso } from "../../../components/procad/formatoProcad";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useVistaTabla } from "../../../components/procad/vistaTabla";
import type { ActividadApi, CodigoEstadoActividad, GrupoApi } from "../../../types/procad";
import { explicarErrorDeColumnas } from "./avisosBase";
import type { Ejecutar } from "./ejecutar";

const ESTADO: Record<CodigoEstadoActividad, { texto: string; tono: Parameters<typeof PildoraEstado>[0]["tono"] }> = {
  PENDIENTE_VALIDACION: { texto: "Por validar", tono: "pendiente" },
  VALIDADA: { texto: "Validada", tono: "activo" },
  RECHAZADA: { texto: "Rechazada", tono: "negativo" },
};

const CAMPOS: CampoTabla<ActividadApi>[] = [
  {
    label: "Fecha",
    texto: (a) => a.fechaActividad.slice(0, 10),
    celda: (a) => (
      <span className="whitespace-nowrap tabular-nums">
        {fechaCorta(a.fechaActividad)}
        {a.horaActividad && <span className="text-slate-400"> · {a.horaActividad}</span>}
      </span>
    ),
  },
  {
    label: "Actividad",
    texto: (a) => a.tituloActividad ?? a.descripcionActividad ?? "",
    celda: (a) => (
      <span className="block max-w-[320px] whitespace-normal">
        <span className="font-medium text-slate-700">{a.tituloActividad ?? a.nombreTipoActividad ?? "Sin título"}</span>
        {a.idSerie !== null && <span className="ml-1.5 text-xs text-slate-400">(recurrente)</span>}
      </span>
    ),
  },
  { label: "Tipo", texto: (a) => a.nombreTipoActividad ?? "", celda: (a) => a.nombreTipoActividad ?? <SinDato /> },
  {
    label: "Estado",
    texto: (a) => ESTADO[a.codigoEstado].texto,
    celda: (a) => <PildoraEstado tono={ESTADO[a.codigoEstado].tono}>{ESTADO[a.codigoEstado].texto}</PildoraEstado>,
  },
  {
    label: "Asistencia",
    numerica: true,
    texto: (a) => `${a.presentes}/${a.inscritos}`,
    celda: (a) => (a.inscritos === 0 ? <SinDato /> : `${a.presentes} de ${a.inscritos}`),
  },
  {
    label: "Observación",
    texto: (a) => a.observacionValidacion ?? "",
    celda: (a) =>
      a.observacionValidacion ? (
        <span className="block max-w-[280px] whitespace-normal leading-relaxed">{a.observacionValidacion}</span>
      ) : (
        <SinDato />
      ),
  },
];

const COLUMNAS = columnasDe(CAMPOS);

/** 1 = lunes … 7 = domingo, como lo pide tblSeriesActividadesDias. */
const DIAS = [
  { valor: 1, corto: "L", nombre: "lunes" },
  { valor: 2, corto: "M", nombre: "martes" },
  { valor: 3, corto: "X", nombre: "miércoles" },
  { valor: 4, corto: "J", nombre: "jueves" },
  { valor: 5, corto: "V", nombre: "viernes" },
  { valor: 6, corto: "S", nombre: "sábado" },
  { valor: 7, corto: "D", nombre: "domingo" },
];

type Formulario = "ninguno" | "actividad" | "serie";

/**
 * Lo que el grupo hace en el período. El director lo registra —una actividad
 * suelta o un entrenamiento que se repite— y el administrador lo valida: solo
 * sobre lo validado se pasa lista, y solo eso cuenta para la elegibilidad.
 */
export default function ActividadesGrupo({
  grupo,
  idPeriodo,
  ejecutar,
}: {
  grupo: GrupoApi;
  idPeriodo: number;
  ejecutar: Ejecutar;
}) {
  const actividades = useConsulta(() => listarActividadesDeGrupo(grupo.idGrupo, idPeriodo), [grupo.idGrupo, idPeriodo]);
  const [formulario, setFormulario] = useState<Formulario>("ninguno");
  const vista = useVistaTabla("mi-grupo:actividades", COLUMNAS);
  const filas = useMemo(
    () => [...(actividades.datos ?? [])].sort((a, b) => b.fechaActividad.localeCompare(a.fechaActividad)),
    [actividades.datos],
  );
  const porValidar = filas.filter((a) => a.codigoEstado === "PENDIENTE_VALIDACION").length;

  const alGuardar = () => {
    setFormulario("ninguno");
    actividades.recargar();
  };

  return (
    <div className="flex flex-col gap-4">
      {formulario === "actividad" && (
        <FormularioActividad grupo={grupo} idPeriodo={idPeriodo} ejecutar={ejecutar} onCancelar={() => setFormulario("ninguno")} onGuardada={alGuardar} />
      )}
      {formulario === "serie" && (
        <FormularioSerie grupo={grupo} idPeriodo={idPeriodo} ejecutar={ejecutar} onCancelar={() => setFormulario("ninguno")} onGuardada={alGuardar} />
      )}

      <BarraTabla
        conteo={
          actividades.cargando && !actividades.datos
            ? "Cargando…"
            : `${filas.length} ${filas.length === 1 ? "actividad" : "actividades"}${porValidar ? ` · ${porValidar} por validar` : ""}`
        }
        vista={vista}
        hayFilas={filas.length > 0}
        onDescargar={() => descargarTabla("actividades-grupo-procad", CAMPOS, vista, filas, "Actividades")}
      >
        {/* Sin las columnas en la base, registrar fallaría igual que la lista. */}
        {!actividades.error && formulario === "ninguno" && (
          <>
            <BotonAccion tono="primario" onClick={() => setFormulario("actividad")}>
              <HiOutlinePlus className="h-3.5 w-3.5" />
              Registrar actividad
            </BotonAccion>
            <BotonAccion onClick={() => setFormulario("serie")}>
              <HiOutlineArrowPath className="h-3.5 w-3.5" />
              Entrenamiento recurrente
            </BotonAccion>
          </>
        )}
      </BarraTabla>

      {actividades.error ? (
        <p className="rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
          {explicarErrorDeColumnas(actividades.error)}
        </p>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <TablaDatos vista={vista} anchoMinimo="900px" columnas={COLUMNAS} filas={filasDe(CAMPOS, filas, undefined)} />
          {!actividades.cargando && filas.length === 0 && (
            <p className="mt-4 text-xs text-slate-500">
              Aún no hay actividades este período. Lo que registre aquí lo valida el administrador; después podrá
              pasar lista.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FormularioActividad({
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
  const [v, setV] = useState({
    fecha: hoyIso(),
    tipo: "",
    titulo: "",
    hora: "",
    lugar: "",
    horas: "",
    descripcion: "",
    justificacion: "",
  });
  const [faltaTitulo, setFaltaTitulo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const cambiar = (campo: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((previo) => ({ ...previo, [campo]: e.target.value }));

  async function enviar() {
    if (!v.titulo.trim()) {
      setFaltaTitulo(true);
      return;
    }
    setEnviando(true);
    let ok = false;
    await ejecutar(
      async (idPersona) => {
        await crearActividad({
          idGrupo: grupo.idGrupo,
          idPeriodo,
          fechaActividad: v.fecha,
          idTipoActividad: v.tipo ? Number(v.tipo) : undefined,
          tituloActividad: v.titulo.trim(),
          horaActividad: v.hora || undefined,
          lugarActividad: v.lugar.trim() || undefined,
          horasAbonadas: v.horas ? Number(v.horas) : undefined,
          descripcionActividad: v.descripcion.trim() || undefined,
          justificacionActividad: v.justificacion.trim() || undefined,
          idPersonaReporta: idPersona,
        });
        ok = true;
      },
      `Registró «${v.titulo.trim()}». Queda por validar.`,
    );
    setEnviando(false);
    if (ok) onGuardada();
  }

  return (
    <PanelFormulario
      titulo="Registrar actividad"
      descripcion="Una presentación, un partido, un ensayo abierto. El administrador la valida leyendo lo que escriba aquí."
      onCancelar={onCancelar}
      onEnviar={enviar}
      enviando={enviando}
      textoEnviar="Registrar"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Título" error={faltaTitulo ? "Póngale un nombre: es como el administrador la reconoce." : null}>
          <input
            type="text"
            value={v.titulo}
            autoFocus
            onChange={(e) => {
              cambiar("titulo")(e);
              setFaltaTitulo(false);
            }}
            maxLength={150}
            placeholder="Ej. Amistoso contra la selección de la UPNFM"
            className={`${CLASE_CAMPO} ${faltaTitulo ? "border-rose-400" : ""}`}
          />
        </Campo>
        <Campo etiqueta="Tipo" opcional>
          <select value={v.tipo} onChange={cambiar("tipo")} className={CLASE_CAMPO}>
            <option value="">Sin tipo</option>
            {grupo.tiposActividad.map((t) => (
              <option key={t.idTipoActividad} value={t.idTipoActividad}>
                {t.nombreTipoActividad}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Campo etiqueta="Fecha">
          <input type="date" value={v.fecha} onChange={cambiar("fecha")} required className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Hora" opcional>
          <input type="time" value={v.hora} onChange={cambiar("hora")} className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Lugar" opcional className="sm:col-span-1">
          <input type="text" value={v.lugar} onChange={cambiar("lugar")} maxLength={150} className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Horas abonadas" opcional ayuda="Lo que suma a cada asistente.">
          <input type="number" min={0} max={999.9} step={0.5} value={v.horas} onChange={cambiar("horas")} className={CLASE_CAMPO} />
        </Campo>
      </div>
      <Campo etiqueta="Justificación" opcional ayuda="Por qué se hizo y qué deja. Es lo primero que lee quien valida.">
        <textarea value={v.justificacion} onChange={cambiar("justificacion")} rows={3} maxLength={1000} className={`${CLASE_CAMPO} resize-y`} />
      </Campo>
    </PanelFormulario>
  );
}

function FormularioSerie({
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
  const [inicio, setInicio] = useState(hoyIso());
  const [fin, setFin] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [dias, setDias] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!fin) return setError("Falta la fecha en que termina.");
    if (fin < inicio) return setError("La fecha final no puede ser antes de la inicial.");
    if (dias.length === 0) return setError("Elija al menos un día de la semana.");
    setError(null);
    setEnviando(true);
    let ok = false;
    await ejecutar(
      async () => {
        await crearSerie({
          idGrupo: grupo.idGrupo,
          idPeriodo,
          idTipoActividad: tipo ? Number(tipo) : undefined,
          fechaInicioSerie: inicio,
          fechaFinSerie: fin,
          horaSerie: hora || undefined,
          descripcionSerie: descripcion.trim() || undefined,
          diasSemana: [...dias].sort(),
        });
        ok = true;
      },
      "Agendó el entrenamiento recurrente: se creó una actividad por cada día.",
    );
    setEnviando(false);
    if (ok) onGuardada();
  }

  return (
    <PanelFormulario
      titulo="Entrenamiento recurrente"
      descripcion="Se crea una actividad por cada día marcado entre las dos fechas. Cada una se valida por separado."
      onCancelar={onCancelar}
      onEnviar={enviar}
      enviando={enviando}
      textoEnviar="Agendar"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <Campo etiqueta="Desde">
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} required className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Hasta">
          <input type="date" value={fin} min={inicio} onChange={(e) => setFin(e.target.value)} className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Hora" opcional>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className={CLASE_CAMPO} />
        </Campo>
        <Campo etiqueta="Tipo" opcional>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={CLASE_CAMPO}>
            <option value="">Sin tipo</option>
            {grupo.tiposActividad.map((t) => (
              <option key={t.idTipoActividad} value={t.idTipoActividad}>
                {t.nombreTipoActividad}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <fieldset>
        <legend className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Días</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {DIAS.map((d) => {
            const activo = dias.includes(d.valor);
            return (
              <button
                key={d.valor}
                type="button"
                aria-pressed={activo}
                aria-label={d.nombre}
                title={d.nombre}
                onClick={() => setDias((previos) => (activo ? previos.filter((x) => x !== d.valor) : [...previos, d.valor]))}
                className={`h-9 w-9 rounded-lg border text-xs font-bold transition-colors duration-150 ${
                  activo ? "border-unah-navy bg-unah-navy text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {d.corto}
              </button>
            );
          })}
        </div>
      </fieldset>
      <Campo etiqueta="Descripción" opcional error={error}>
        <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={300} placeholder="Ej. Entrenamiento de pretemporada" className={CLASE_CAMPO} />
      </Campo>
    </PanelFormulario>
  );
}
