import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiAcademicCap,
  HiOutlineListBullet,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import SinIdentidad from "../../components/giras/SinIdentidad";
import {
  actualizarSolicitud,
  crearSolicitud,
  enviarSolicitud,
  listarTodosLosCatalogos,
  listarUsuarios,
  obtenerSolicitud,
} from "../../api/giras";
import { ErrorApi, mensajeDeError } from "../../api/cliente";
import { useConsulta } from "../../api/useConsulta";
import { useIdentidadGira, useRolGira } from "../../context/UserContext";
import type { SolicitudGiraDetalle, UsuarioUnidadGira } from "../../types/giras";
import { cuerpoDesde, formularioDesde, formularioVacio, type FormularioSolicitud } from "./nuevaSolicitud/formulario";
import {
  PasoAlcance,
  PasoDatosGenerales,
  PasoPersonas,
  type OpcionesFormulario,
} from "./nuevaSolicitud/PasosDatos";
import { PasoDocumentos, PasoFinanciamiento, PasoTransporte } from "./nuevaSolicitud/PasosLogistica";

interface Paso {
  id: string;
  label: string;
  icon: IconType;
}

const pasos: Paso[] = [
  { id: "datos-generales", label: "Datos generales", icon: HiAcademicCap },
  { id: "alcance-academico", label: "Alcance académico", icon: HiOutlineListBullet },
  { id: "personas", label: "Personas", icon: HiOutlineUserGroup },
  { id: "transporte", label: "Transporte", icon: HiOutlineTruck },
  { id: "financiamiento", label: "Financiamiento", icon: HiOutlineBanknotes },
  { id: "documentos", label: "Documentos", icon: HiOutlineDocumentText },
];

/** Cómo se llama en pantalla cada dato que la API puede pedir antes de enviar. */
const ETIQUETA_FALTANTE: Record<string, string> = {
  idTipoAlcance: "Alcance del viaje",
  destinoGira: "Destino",
  objetivoAcademico: "Objetivo académico",
  fechaSalidaPropuesta: "Fecha de salida",
  fechaRetornoPropuesta: "Fecha de retorno",
};

function mensajeDeEnvio(causa: unknown): string {
  if (causa instanceof ErrorApi && causa.estado === 400) {
    const faltantes = (causa.detalles as { faltantes?: string[] } | undefined)?.faltantes;
    if (faltantes?.length) {
      return `Para enviar la solicitud completa: ${faltantes.map((f) => ETIQUETA_FALTANTE[f] ?? f).join(", ")}.`;
    }
  }
  return mensajeDeError(causa);
}

function AnilloProgreso({ porcentaje }: { porcentaje: number }) {
  const radio = 30;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;

  return (
    <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={radio} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <circle
          cx="38"
          cy="38"
          r={radio}
          stroke="#f5820f"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-700">{porcentaje}%</span>
    </div>
  );
}

function Formulario({
  inicial,
  solicitud,
  opciones,
  jefeMision,
}: {
  inicial: FormularioSolicitud;
  /** La solicitud que se edita (borrador o en corrección); undefined si es nueva. */
  solicitud?: SolicitudGiraDetalle;
  opciones: OpcionesFormulario;
  jefeMision: UsuarioUnidadGira;
}) {
  const navigate = useNavigate();
  const [f, setF] = useState<FormularioSolicitud>(inicial);
  const [pasoActivo, setPasoActivo] = useState(0);
  const [mostrarConfirmacionEnvio, setMostrarConfirmacionEnvio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inicioFormularioRef = useRef<HTMLDivElement>(null);

  const enCorreccion = solicitud?.codigoEstado === "Correccion";
  const porcentaje = Math.round(((pasoActivo + 1) / pasos.length) * 100);
  const esUltimoPaso = pasoActivo === pasos.length - 1;
  const observacionDelDictamen = enCorreccion ? solicitud?.dictamenes[0]?.justificacionDictamen : null;

  useEffect(() => {
    inicioFormularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pasoActivo]);

  function cambiar(parcial: Partial<FormularioSolicitud>) {
    setF((previo) => ({ ...previo, ...parcial }));
  }

  /** Guarda (POST o PUT) y, si `enviar`, la manda a dictamen. */
  async function guardar(enviar: boolean) {
    setError(null);
    // La base exige estos dos aunque sea un borrador (columnas NOT NULL sin valor por defecto).
    if (!f.idCampus || !f.idJefeAprobacion) {
      setMostrarConfirmacionEnvio(false);
      setError("Para guardar, elige al menos el campus que organiza y el jefe de aprobación.");
      return;
    }

    setGuardando(true);
    try {
      const cuerpo = cuerpoDesde(f, jefeMision.idUsuarioUnidad);
      if (solicitud) {
        await actualizarSolicitud(solicitud.idSolicitud, cuerpo);
        if (enviar) await enviarSolicitud(solicitud.idSolicitud);
      } else {
        await crearSolicitud({ ...cuerpo, enviar });
      }
      navigate(enviar || enCorreccion ? "/giras/solicitudes" : "/giras/solicitudes/borradores");
    } catch (causa) {
      setMostrarConfirmacionEnvio(false);
      setError(mensajeDeEnvio(causa));
    } finally {
      setGuardando(false);
    }
  }

  function regresar() {
    navigate(solicitud && !enCorreccion ? "/giras/solicitudes/borradores" : "/giras/solicitudes");
  }

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
        {/* Encabezado */}
        <div>
          <button
            type="button"
            onClick={regresar}
            className="flex items-center gap-1.5 rounded-lg bg-unah-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
          >
            <HiChevronLeft className="h-4 w-4" />
            Regresar
          </button>

          <div className="mt-4">
            <p className="text-xs font-bold tracking-wider text-unah-orange">GIRAS</p>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              {enCorreccion ? "Corregir Solicitud" : solicitud ? "Editar Borrador" : "Nueva Solicitud"}
            </h1>
            {solicitud && <p className="mt-1 text-sm text-slate-400">SOL-{solicitud.idSolicitud}</p>}
          </div>
        </div>

        {observacionDelDictamen && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <p className="text-sm font-bold text-violet-800">El jefe de aprobación pidió correcciones</p>
            <p className="mt-1 text-sm leading-relaxed text-violet-700">{observacionDelDictamen}</p>
          </div>
        )}

        {/* Stepper */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-start overflow-x-auto">
              {pasos.map((paso, indice) => {
                const Icon = paso.icon;
                const activo = indice === pasoActivo;
                const completado = indice < pasoActivo;
                const esUltimo = indice === pasos.length - 1;
                return (
                  <div key={paso.id} className={`flex items-start ${esUltimo ? "" : "flex-1"}`}>
                    <button
                      type="button"
                      onClick={() => setPasoActivo(indice)}
                      className="flex w-[92px] shrink-0 flex-col items-center gap-2 text-center"
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                          activo || completado ? "bg-unah-orange text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-tight ${
                          activo ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {paso.label}
                      </span>
                    </button>

                    {!esUltimo && (
                      <div className={`mt-5 h-px flex-1 ${completado ? "bg-unah-orange" : "bg-slate-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center self-center">
              <AnilloProgreso porcentaje={porcentaje} />
              <p className="mt-2 text-xs font-medium text-slate-400">
                Paso {pasoActivo + 1} de {pasos.length}
              </p>
            </div>
          </div>
        </div>

        <div ref={inicioFormularioRef} />

        {pasoActivo === 0 && <PasoDatosGenerales f={f} cambiar={cambiar} op={opciones} />}
        {pasoActivo === 1 && <PasoAlcance f={f} cambiar={cambiar} op={opciones} />}
        {pasoActivo === 2 && <PasoPersonas f={f} cambiar={cambiar} op={opciones} />}
        {pasoActivo === 3 && <PasoTransporte f={f} cambiar={cambiar} op={opciones} />}
        {pasoActivo === 4 && <PasoFinanciamiento f={f} cambiar={cambiar} op={opciones} />}
        {pasoActivo === 5 && <PasoDocumentos f={f} cambiar={cambiar} />}

        {error && (
          <p role="alert" className="rounded-2xl bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {pasoActivo > 0 && (
              <button
                type="button"
                onClick={() => setPasoActivo(pasoActivo - 1)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <HiChevronLeft className="h-4 w-4" />
                Anterior
              </button>
            )}
            <p className="text-xs text-slate-400 sm:max-w-xs">
              Al enviarla queda en manos del jefe de aprobación y ya no podrás editarla.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => guardar(false)}
              disabled={guardando}
              className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-unah-navy transition-colors hover:bg-slate-200 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : enCorreccion ? "Guardar cambios" : "Guardar borrador"}
            </button>
            {esUltimoPaso ? (
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEnvio(true)}
                disabled={guardando}
                className="rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark disabled:opacity-60"
              >
                {enCorreccion ? "Reenviar solicitud" : "Enviar solicitud"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPasoActivo((actual) => Math.min(actual + 1, pasos.length - 1))}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-unah-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-unah-navy-dark"
              >
                Siguiente
                <HiChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {mostrarConfirmacionEnvio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setMostrarConfirmacionEnvio(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#1E293B]">¿Estás seguro de que quieres enviar la solicitud?</h2>
            <p className="mt-3 text-sm text-slate-500">
              Una vez enviada, la solicitud pasará a revisión del jefe de aprobación y no podrás realizarle cambios ni
              modificaciones.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEnvio(false)}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => guardar(true)}
                disabled={guardando}
                className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                {guardando ? "Enviando…" : "Sí, enviar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Carga lo que el formulario ofrece (tablas tipo, jefes, docentes) y, si se
 * edita un borrador, la solicitud; con todo listo monta el formulario ya
 * inicializado. La ruta con `:borradorId` sirve para editar un borrador y
 * también para corregir una solicitud que el jefe de aprobación devolvió.
 */
export default function NuevaSolicitud() {
  const { borradorId } = useParams();
  const { rol } = useRolGira();
  const identidad = useIdentidadGira();

  const catalogos = useConsulta(() => listarTodosLosCatalogos(), []);
  const jefes = useConsulta(() => listarUsuarios({ rol: "jefe-aprobacion" }), []);
  const docentes = useConsulta(() => listarUsuarios({ docentes: true }), []);
  const todosLosUsuarios = useConsulta(() => listarUsuarios(), []);
  const idSolicitud = borradorId ? Number(borradorId) : null;
  const solicitud = useConsulta(
    () => (idSolicitud === null ? Promise.resolve(null) : obtenerSolicitud(idSolicitud)),
    [idSolicitud],
  );

  const opciones = useMemo<OpcionesFormulario | null>(() => {
    if (!catalogos.datos || !jefes.datos || !docentes.datos || !todosLosUsuarios.datos) return null;
    const c = catalogos.datos;
    const maxParametro = (c["parametros"] ?? []).find((p) => p.nombre === "maxDocentesPorGira");

    // Los campus disponibles son los de las unidades que ya tienen usuarios en la base.
    const campus = new Map<number, string>();
    for (const u of todosLosUsuarios.datos) {
      if (u.idCampus !== null && u.nombreCampus) campus.set(u.idCampus, u.nombreCampus);
    }

    return {
      campus: [...campus].map(([id, nombre]) => ({ id, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre)),
      alcances: c["alcance"] ?? [],
      carreras: c["carreras"] ?? [],
      facultades: c["facultades"] ?? [],
      finalidades: c["finalidades"] ?? [],
      transportes: c["transporte"] ?? [],
      financiamientos: c["financiamiento"] ?? [],
      jefesAprobacion: jefes.datos,
      docentes: docentes.datos,
      maxDocentes: maxParametro ? Number(maxParametro["valorParametro"]) : 2,
      nombreJefeMision: identidad?.nombreCompleto ?? "",
    };
  }, [catalogos.datos, jefes.datos, docentes.datos, todosLosUsuarios.datos, identidad]);

  if (rol !== "jefe-mision" || !identidad) return <SinIdentidad rol="Jefe de misión" />;

  const error = catalogos.error ?? jefes.error ?? docentes.error ?? todosLosUsuarios.error ?? solicitud.error;
  if (error) {
    return <p className="rounded-2xl bg-white p-6 text-sm font-medium text-rose-600 shadow-sm">{error}</p>;
  }
  const esperandoSolicitud = idSolicitud !== null && solicitud.datos === null;
  if (!opciones || esperandoSolicitud) {
    return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">Cargando formulario…</p>;
  }

  const editando = solicitud.datos ?? undefined;
  return (
    <Formulario
      key={editando?.idSolicitud ?? "nueva"}
      inicial={editando ? formularioDesde(editando) : formularioVacio(identidad.idCampus)}
      solicitud={editando}
      opciones={opciones}
      jefeMision={identidad}
    />
  );
}
