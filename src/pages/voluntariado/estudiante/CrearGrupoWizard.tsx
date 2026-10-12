import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineCheck, HiOutlineXMark, HiOutlinePlus, HiOutlineExclamationTriangle } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi, type RequisitoApi } from "../../../api/voluntariado";
import { catalogoApi } from "../../../api/catalogo";
import { ErrorApi, mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";
const claseLabel = "mb-1.5 block text-[11px] font-bold text-slate-500";

const CARGO_MIEMBRO = 1;

const NOMBRE_REQUISITO: Record<string, { label: string; formato: string; accept: string }> = {
  ESTATUTOS: { label: "Estatutos", formato: "PDF", accept: "application/pdf" },
  LOGO: { label: "Logo del grupo", formato: "PNG/JPG", accept: "image/*" },
  ACTA: { label: "Acta de junta", formato: "PDF", accept: "application/pdf" },
};

interface Fundador {
  numeroCuenta: string;
  nombre: string;
  carrera: string;
}

interface ActividadProyectada {
  id: string;
  nombre: string;
  mes: string;
}

let contador = 0;
function generarId() {
  contador += 1;
  return `wiz-${contador}`;
}

export default function CrearGrupoWizard() {
  const navigate = useNavigate();
  const { idPersona, persona } = useSesionVoluntariado();
  const catalogos = useApi(() => Promise.all([catalogoApi.campus(), voluntariadoApi.catalogos()]), []);
  const [campus, cat] = catalogos.datos ?? [[], undefined];
  const cargos = (cat?.cargos ?? []).filter((c) => c.idCargo !== CARGO_MIEMBRO);
  const requisitos = (cat?.requisitos ?? []).filter((r) => r.procesoRequisito === "SOLICITUD_GRUPO");

  const [paso, setPaso] = useState(0);

  const [nombre, setNombre] = useState("");
  const [campusId, setCampusId] = useState(persona.idCampus ? String(persona.idCampus) : "");
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [reseña, setReseña] = useState("");
  const [proposito, setProposito] = useState("");
  const [mision, setMision] = useState("");
  const [vision, setVision] = useState("");

  // Cuenta por idCargo. El solicitante arranca como coordinador.
  const [junta, setJunta] = useState<Record<number, string>>(() => ({ 2: persona.numeroCuenta ?? "" }));

  const [cuentaFundador, setCuentaFundador] = useState("");
  const [errorFundador, setErrorFundador] = useState("");
  const [validando, setValidando] = useState(false);
  const [fundadores, setFundadores] = useState<Fundador[]>([]);

  const [actividades, setActividades] = useState<ActividadProyectada[]>([]);

  // Archivo elegido por requisito. Todavía no se suben a S3: se registra el
  // nombre como referencia para que la VOAE vea qué se adjuntó.
  const [archivos, setArchivos] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const documentosCompletos = requisitos.every((r) => !r.obligatorioRequisito || archivos[r.idRequisitoAdjunto]);
  const esUltimoPaso = paso === 4;
  const datosCompletos = nombre.trim() !== "" && campusId !== "";

  function actualizarJunta(idCargo: number, numeroCuenta: string) {
    setJunta((prev) => ({ ...prev, [idCargo]: numeroCuenta }));
  }

  async function validarFundador() {
    setErrorFundador("");
    const cuenta = cuentaFundador.trim();
    if (fundadores.some((f) => f.numeroCuenta === cuenta)) {
      setErrorFundador("Ese número de cuenta ya fue agregado.");
      return;
    }
    setValidando(true);
    try {
      const estudiante = await catalogoApi.estudiantePorCuenta(cuenta);
      setFundadores((prev) => [
        ...prev,
        {
          numeroCuenta: cuenta,
          nombre: `${estudiante.nombrePersona} ${estudiante.apellidosPersona}`,
          carrera: estudiante.carreraEstudiante ?? "",
        },
      ]);
      setCuentaFundador("");
    } catch (e) {
      setErrorFundador(
        e instanceof ErrorApi && e.estado === 404 ? "No se encontró esa matrícula en Registro." : mensajeDeError(e),
      );
    } finally {
      setValidando(false);
    }
  }

  function quitarFundador(cuenta: string) {
    setFundadores((prev) => prev.filter((f) => f.numeroCuenta !== cuenta));
  }

  function agregarActividad() {
    setActividades((prev) => [...prev, { id: generarId(), nombre: "", mes: "" }]);
  }

  function actualizarActividad(id: string, campo: "nombre" | "mes", valor: string) {
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));
  }

  function quitarActividad(id: string) {
    setActividades((prev) => prev.filter((a) => a.id !== id));
  }

  async function enviar() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const solicitud = await voluntariadoApi.crearSolicitudGrupo({
        idPersonaSolicitante: idPersona,
        idCampus: Number(campusId),
        nombreGrupo: nombre.trim(),
        fechaCreacionGrupo: fechaCreacion || null,
        resenaHistorica: reseña || null,
        propositoGrupo: proposito || null,
        misionGrupo: mision || null,
        visionGrupo: vision || null,
        fundadores: fundadores.map((f) => f.numeroCuenta),
        juntaDirectiva: Object.entries(junta)
          .filter(([, cuenta]) => cuenta.trim())
          .map(([idCargo, cuenta]) => ({ idCargo: Number(idCargo), numeroCuenta: cuenta.trim() })),
        actividadesProyectadas: actividades
          .filter((a) => a.nombre.trim())
          .map((a) => ({ nombreActividad: a.nombre.trim(), fechaTentativa: a.mes ? `${a.mes}-01` : null })),
      });
      for (const [idRequisito, archivo] of Object.entries(archivos)) {
        await voluntariadoApi.adjuntarASolicitud(
          solicitud.idSolicitudGrupoNuevo,
          Number(idRequisito),
          `prototipo/solicitudes/${solicitud.idSolicitudGrupoNuevo}/${archivo}`,
        );
      }
      navigate("/voluntariado/portal-estudiante/solicitudes");
    } catch (e) {
      setErrorEnvio(mensajeDeError(e));
      setEnviando(false);
    }
  }

  function siguiente() {
    if (esUltimoPaso) {
      if (documentosCompletos) void enviar();
      return;
    }
    setPaso((p) => Math.min(p + 1, 4));
  }

  const tituloPaso = ["Datos del grupo", "Junta directiva propuesta", "Miembros fundadores", "Proyección de actividades", "Documentos"][paso];

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Crear grupo" />

      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 pb-3 pt-2">
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-[5px] flex-1 rounded-full ${i <= paso ? "bg-unah-navy" : "bg-slate-200"}`} />
          ))}
        </div>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Paso {paso + 1} de 5
        </p>
        <p className="text-[13px] font-bold text-slate-800">{tituloPaso}</p>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <EstadoCarga cargando={catalogos.cargando} error={catalogos.error} onReintentar={catalogos.recargar} listo={catalogos.datos !== undefined}>
        {paso === 0 && (
          <div className="flex flex-col gap-3.5">
            <div>
              <label className={claseLabel}>Nombre del grupo</label>
              <input className={claseInput} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Manos que Ayudan" />
            </div>
            <div>
              <label className={claseLabel}>Campus</label>
              <select className={claseInput} value={campusId} onChange={(e) => setCampusId(e.target.value)}>
                <option value="" disabled>Selecciona un campus</option>
                {campus.map((c) => <option key={c.idCampus} value={c.idCampus}>{c.nombreCampus}</option>)}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-400">La VOAE asigna las redes temáticas al aprobar la solicitud.</p>
            </div>
            <div>
              <label className={claseLabel}>Fecha de creación</label>
              <input type="date" className={claseInput} value={fechaCreacion} onChange={(e) => setFechaCreacion(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Reseña histórica</label>
              <textarea className={`${claseInput} resize-none`} rows={3} value={reseña} onChange={(e) => setReseña(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Propósito</label>
              <textarea className={`${claseInput} resize-none`} rows={2} value={proposito} onChange={(e) => setProposito(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Misión</label>
              <textarea className={`${claseInput} resize-none`} rows={2} value={mision} onChange={(e) => setMision(e.target.value)} />
            </div>
            <div>
              <label className={claseLabel}>Visión</label>
              <textarea className={`${claseInput} resize-none`} rows={2} value={vision} onChange={(e) => setVision(e.target.value)} />
            </div>
          </div>
        )}

        {paso === 1 && (
          <div className="flex flex-col gap-3">
            {cargos.map((cargo) => (
              <div key={cargo.idCargo}>
                <label className={claseLabel}>{cargo.nombreCargo}</label>
                <input
                  className={claseInput}
                  placeholder="Número de cuenta"
                  value={junta[cargo.idCargo] ?? ""}
                  onChange={(e) => actualizarJunta(cargo.idCargo, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {paso === 2 && (
          <div>
            <label className={claseLabel}>Número de cuenta</label>
            <div className="flex gap-2">
              <input
                className={claseInput}
                value={cuentaFundador}
                onChange={(e) => setCuentaFundador(e.target.value)}
                placeholder="Ej. 20191000123"
              />
              <button
                type="button"
                onClick={validarFundador}
                disabled={!cuentaFundador || validando}
                className="shrink-0 rounded-lg bg-unah-navy px-4 text-[13px] font-semibold text-white disabled:opacity-40"
              >
                {validando ? "…" : "Validar"}
              </button>
            </div>
            {errorFundador && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{errorFundador}</p>}

            <div className="mt-4 flex flex-col gap-2">
              {fundadores.map((f) => (
                <div key={f.numeroCuenta} className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <HiOutlineCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-slate-800">{f.nombre}</p>
                    <p className="truncate text-[11px] text-slate-500">{f.numeroCuenta} · {f.carrera}</p>
                  </div>
                  <button type="button" onClick={() => quitarFundador(f.numeroCuenta)} aria-label="Quitar">
                    <HiOutlineXMark className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-unah-navy p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Total de fundadores</p>
              <p className="text-2xl font-extrabold">{fundadores.length}</p>
              <p className="mt-1 text-[10.5px] text-white/60">
                Este número se calcula automáticamente — no se digita.
              </p>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <div className="flex flex-col gap-2.5">
              {actividades.map((a) => (
                <div key={a.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3">
                  <input
                    className={claseInput}
                    placeholder="Nombre de la actividad"
                    value={a.nombre}
                    onChange={(e) => actualizarActividad(a.id, "nombre", e.target.value)}
                  />
                  <input
                    type="month"
                    className={`${claseInput} w-36 shrink-0`}
                    value={a.mes}
                    onChange={(e) => actualizarActividad(a.id, "mes", e.target.value)}
                  />
                  <button type="button" onClick={() => quitarActividad(a.id)} aria-label="Quitar">
                    <HiOutlineXMark className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={agregarActividad}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 text-[12.5px] font-semibold text-slate-500"
            >
              <HiOutlinePlus className="h-4 w-4" />
              Agregar actividad
            </button>
          </div>
        )}

        {paso === 4 && (
          <div className="flex flex-col gap-3">
            {requisitos.map((r) => (
              <FilaDocumento
                key={r.idRequisitoAdjunto}
                requisito={r}
                archivo={archivos[r.idRequisitoAdjunto]}
                onChange={(archivo) => setArchivos((prev) => ({ ...prev, [r.idRequisitoAdjunto]: archivo }))}
              />
            ))}

            {!documentosCompletos && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-[12px] font-semibold text-red-700">Faltan documentos obligatorios para enviar la solicitud.</p>
              </div>
            )}
            {errorEnvio && (
              <p className="rounded-xl bg-red-50 p-3 text-[12px] font-semibold text-red-700">{errorEnvio}</p>
            )}
          </div>
        )}
        </EstadoCarga>
      </div>

      <footer className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white p-4">
        {paso > 0 && (
          <button
            type="button"
            onClick={() => setPaso((p) => p - 1)}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          onClick={siguiente}
          disabled={(esUltimoPaso && !documentosCompletos) || (paso === 0 && !datosCompletos) || enviando}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:bg-slate-300 ${
            esUltimoPaso ? "bg-emerald-600" : "bg-unah-navy"
          }`}
        >
          {enviando ? "Enviando…" : esUltimoPaso ? "Enviar solicitud" : "Continuar"}
        </button>
      </footer>
    </div>
  );
}

function FilaDocumento({
  requisito,
  archivo,
  onChange,
}: {
  requisito: RequisitoApi;
  archivo: string | undefined;
  onChange: (archivo: string) => void;
}) {
  const info = NOMBRE_REQUISITO[requisito.tipoRequisito] ?? {
    label: requisito.tipoRequisito,
    formato: "",
    accept: "*/*",
  };
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-slate-800">
          {info.label} {requisito.obligatorioRequisito && <span className="text-red-500">*</span>}
        </p>
        <p className="truncate text-[11px] text-slate-400">{archivo ?? info.formato}</p>
      </div>
      <span
        className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
          archivo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {archivo ? "✓ Adjunto" : "Elegir"}
      </span>
      <input
        type="file"
        accept={info.accept}
        className="hidden"
        onChange={(e) => {
          const elegido = e.target.files?.[0];
          if (elegido) onChange(elegido.name);
        }}
      />
    </label>
  );
}
