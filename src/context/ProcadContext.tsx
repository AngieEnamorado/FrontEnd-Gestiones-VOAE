import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AvisoFlotante from "../components/procad/AvisoFlotante";
import { mensajeDeError } from "../api/cliente";
import { fijarUsuarioProcad, idPersonaProcad, procadConectado } from "../api/clienteProcad";
import * as apiProcad from "../api/procad";
import {
  aActividad,
  aAgrupacion,
  aCondicionado,
  aEmpleados,
  aExpulsion,
  aMatricula,
  aPeriodos,
  aSolicitud,
  aVisoria,
  DECISION_DE_ESTADO,
} from "../api/adaptadoresProcad";
import type { PeriodoApi } from "../types/procad";
import { enCorto } from "../utils/fechas";
import { useUsuarioActual } from "./UserContext";
import {
  actividadesProcad,
  auditoriaProcad,
  condicionadosPendientes,
  empleadosProcad,
  expulsionesPendientes,
  matriculasExcepcionales,
  periodosInscripcion,
  solicitudesProcad,
  usuariosProcad,
  visoriasProcad,
} from "../data/mockProcadAdmin";
import { albumesGaleria } from "../data/mockProcadGaleria";
import { agrupacionesProcad } from "../data/mockProcadEstadisticas";
import type {
  ActividadProcad,
  AgrupacionProcad,
  AlbumGaleria,
  DatosAlbumSuelto,
  CondicionadoPendiente,
  EmpleadoProcad,
  EstadoActividadProcad,
  EstadoSolicitudProcad,
  ExpulsionPendiente,
  FotoGaleria,
  MatriculaExcepcional,
  PeriodoInscripcion,
  RegistroAuditoria,
  SolicitudProcad,
  UsuarioProcad,
  VisoriaProcad,
} from "../types";

/**
 * Estado del panel de administración de PROCAD.
 *
 * Vive en un contexto y no dentro de cada página porque las decisiones se
 * cruzan entre módulos: autorizar un condicionado cambia el contador que el
 * sidebar muestra junto a "Estudiantes", y resolver una expulsión aparece en
 * Auditoría. Cuando exista backend, cada acción de aquí pasa a ser una
 * llamada a la API y los componentes no cambian.
 */

export interface PendientesProcad {
  solicitudes: number;
  condicionados: number;
  expulsiones: number;
  actividades: number;
  visorias: number;
  /** Lo que le toca al módulo de Estudiantes. */
  estudiantes: number;
  /** Lo que le toca al módulo de Agrupaciones. */
  agrupaciones: number;
  total: number;
}

interface ValorProcad {
  /**
   * La lista del módulo Agrupaciones. Conectada a la API trae solo lo que la
   * base guarda; las cifras de estadística siguen en el panel de Estadísticas.
   */
  agrupaciones: AgrupacionProcad[];
  solicitudes: SolicitudProcad[];
  condicionados: CondicionadoPendiente[];
  expulsiones: ExpulsionPendiente[];
  matriculas: MatriculaExcepcional[];
  actividades: ActividadProcad[];
  visorias: VisoriaProcad[];
  /** Un álbum por actividad; las actividades sin fotos no tienen álbum. */
  albumes: AlbumGaleria[];
  empleados: EmpleadoProcad[];
  usuarios: UsuarioProcad[];
  periodos: PeriodoInscripcion[];
  auditoria: RegistroAuditoria[];
  pendientes: PendientesProcad;

  /** Mensaje de confirmación de la última acción, o `null` si no hay ninguno. */
  aviso: string | null;
  descartarAviso: () => void;

  resolverSolicitud: (id: number, estado: EstadoSolicitudProcad, motivo?: string) => void;
  /** El motivo solo se pide al rechazar; autorizar no necesita explicación. */
  resolverCondicionado: (id: number, autorizar: boolean, motivo?: string) => void;
  resolverExpulsion: (id: number, aprobar: boolean, motivo?: string) => void;
  otorgarMatricula: (datos: { nombre: string; cuenta: string; motivo: string }) => void;
  resolverActividad: (id: number, estado: EstadoActividadProcad, motivo?: string) => void;
  programarVisoria: (id: number) => void;

  /**
   * Añade fotos a una actividad —creando su álbum si aún no lo tenía— o a un
   * álbum que ya existe, suelto o no.
   */
  agregarFotos: (destino: DestinoFotos, fotos: Omit<FotoGaleria, "id">[]) => void;
  /** Abre un álbum que no cuelga de ninguna actividad; devuelve su id. */
  crearAlbumSuelto: (datos: DatosAlbumSuelto) => string;
  editarAlbumSuelto: (albumId: string, datos: DatosAlbumSuelto) => void;
  eliminarAlbum: (albumId: string) => void;
  quitarFoto: (albumId: string, fotoId: string) => void;
  /** La pone primera, que es lo que la vuelve portada del álbum. */
  ponerDePortada: (albumId: string, fotoId: string) => void;
  describirFoto: (albumId: string, fotoId: string, alt: string) => void;
  /** Cuántas columnas ocupa en el mosaico. */
  redimensionarFoto: (albumId: string, fotoId: string, span: FotoGaleria["span"]) => void;

  alternarAcceso: (nombre: string) => void;
  activarPeriodo: (label: string) => void;
  cerrarPeriodo: (label: string) => void;
  alternarUsuario: (correo: string) => void;
}

/**
 * A dónde van unas fotos que se suben: a una actividad (que puede no tener
 * álbum todavía) o a un álbum que ya existe.
 */
export type DestinoFotos = { actividadId: number } | { albumId: string };

const ProcadContext = createContext<ValorProcad | null>(null);

function marcaDeTiempo(): string {
  return new Date().toLocaleString("es-HN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProcadProvider({ children }: { children: ReactNode }) {
  const usuario = useUsuarioActual();

  // Conectado a voae-procad, lo del módulo Estudiantes arranca vacío y se llena desde la API.
  const [solicitudes, setSolicitudes] = useState<SolicitudProcad[]>(() =>
    procadConectado ? [] : [...solicitudesProcad],
  );
  const [condicionados, setCondicionados] = useState<CondicionadoPendiente[]>(() =>
    procadConectado ? [] : [...condicionadosPendientes],
  );
  const [expulsiones, setExpulsiones] = useState<ExpulsionPendiente[]>(() =>
    procadConectado ? [] : [...expulsionesPendientes],
  );
  const [matriculas, setMatriculas] = useState<MatriculaExcepcional[]>(() =>
    procadConectado ? [] : [...matriculasExcepcionales],
  );
  const [agrupaciones, setAgrupaciones] = useState<AgrupacionProcad[]>(() =>
    procadConectado ? [] : agrupacionesProcad,
  );
  const [actividades, setActividades] = useState<ActividadProcad[]>(() =>
    procadConectado ? [] : [...actividadesProcad],
  );
  const [visorias, setVisorias] = useState<VisoriaProcad[]>(() =>
    procadConectado ? [] : [...visoriasProcad],
  );
  // La galería no tiene tablas en la base. Conectado, los álbumes de actividad
  // de la demostración apuntarían a actividades reales que comparten el id, así
  // que solo quedan los sueltos.
  const [albumes, setAlbumes] = useState<AlbumGaleria[]>(() =>
    albumesGaleria
      .filter((a) => !procadConectado || a.origen === "suelto")
      .map((a) => ({ ...a })),
  );
  const [empleados, setEmpleados] = useState<EmpleadoProcad[]>(() =>
    procadConectado ? [] : [...empleadosProcad],
  );
  /** Conectado: con qué idPersona se actúa sobre cada empleado de la lista. */
  const idEmpleado = useRef(new Map<string, number>());
  const [usuarios, setUsuarios] = useState<UsuarioProcad[]>(() => [...usuariosProcad]);
  const [periodos, setPeriodos] = useState<PeriodoInscripcion[]>(() =>
    procadConectado ? [] : [...periodosInscripcion],
  );
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>(() => [...auditoriaProcad]);
  const [aviso, setAviso] = useState<string | null>(null);

  const descartarAviso = useCallback(() => setAviso(null), []);

  /**
   * Toda acción deja rastro: confirma en pantalla y se anota en Auditoría. El
   * módulo de Auditoría promete "quién hizo qué y cuándo", así que tiene que
   * enterarse de lo que pasa en los demás.
   */
  const registrar = useCallback(
    (mensaje: string, accion: string, detalle: string) => {
      setAviso(mensaje);
      setAuditoria((previa) => [
        { fecha: marcaDeTiempo(), actor: usuario.nombreCompleto, accion, detalle },
        ...previa,
      ]);
    },
    [usuario.nombreCompleto],
  );

  // ── Conexión con voae-procad ──────────────────────────────────────────────
  //
  // Con VITE_API_PROCAD_URL en .env.local, el módulo Estudiantes (solicitudes,
  // condicionados, expulsiones y matrículas excepcionales) lee de la API y sus
  // acciones la llaman. Después de cada acción se vuelve a leer: los triggers
  // de la base pueden cambiar más de lo que la pantalla pidió (aprobar a un
  // condicionado, expulsar a un integrante…). Sin URL, todo sigue con los datos
  // de demostración. Los demás módulos todavía usan los mocks.

  const [periodoActivo, setPeriodoActivo] = useState<PeriodoApi | null>(null);

  useEffect(() => {
    fijarUsuarioProcad(usuario.correo || usuario.nombreCompleto);
  }, [usuario.correo, usuario.nombreCompleto]);

  const cargarEstudiantes = useCallback(async () => {
    const [sol, cond, exp, mat] = await Promise.all([
      apiProcad.listarSolicitudes(),
      apiProcad.listarCondicionadosPropuestos(),
      apiProcad.listarExpulsiones("PENDIENTE"),
      apiProcad.listarMatriculasExcepcionales(),
    ]);
    setSolicitudes(sol.map(aSolicitud).filter((s): s is SolicitudProcad => s !== null));
    setCondicionados(cond.map(aCondicionado));
    setExpulsiones(exp.map(aExpulsion));
    setMatriculas(mat.map(aMatricula));
  }, []);

  /** Agrupaciones, actividades y visorías. Los integrantes se cuentan en el período activo. */
  const cargarAgrupaciones = useCallback(async (periodo: number | undefined) => {
    const [grupos, acts, vis] = await Promise.all([
      apiProcad.listarGrupos(periodo),
      apiProcad.listarActividades(),
      apiProcad.listarVisorias(),
    ]);
    setAgrupaciones(grupos.map(aAgrupacion));
    setActividades(acts.map(aActividad));
    setVisorias(vis.map(aVisoria));
  }, []);

  /** Accesos al panel y períodos (estos últimos, de Catálogo y solo para leer). */
  const cargarConfiguracion = useCallback(async (idActivo: number | null) => {
    const [accesos, lista] = await Promise.all([apiProcad.listarAccesos(), apiProcad.listarPeriodos()]);
    const { empleados: deApi, idPorNombre } = aEmpleados(accesos);
    idEmpleado.current = idPorNombre;
    setEmpleados(deApi);
    setPeriodos(aPeriodos(lista, idActivo));
  }, []);

  const recargar = useCallback(
    () =>
      Promise.all([
        cargarEstudiantes(),
        cargarAgrupaciones(periodoActivo?.idPeriodo),
        cargarConfiguracion(periodoActivo?.idPeriodo ?? null),
      ]),
    [cargarEstudiantes, cargarAgrupaciones, cargarConfiguracion, periodoActivo],
  );

  useEffect(() => {
    if (!procadConectado) return;
    cargarEstudiantes().catch((error: unknown) =>
      setAviso(`No se pudieron cargar los datos de PROCAD: ${mensajeDeError(error)}`),
    );
    apiProcad
      .obtenerPeriodoActivo()
      .then(setPeriodoActivo)
      .catch(() => setPeriodoActivo(null));
  }, [cargarEstudiantes]);

  // Se vuelve a pedir cuando llega el período activo: cuenta sus integrantes y lo marca en la lista.
  useEffect(() => {
    if (!procadConectado) return;
    cargarAgrupaciones(periodoActivo?.idPeriodo).catch((error: unknown) =>
      setAviso(`No se pudieron cargar las agrupaciones: ${mensajeDeError(error)}`),
    );
    cargarConfiguracion(periodoActivo?.idPeriodo ?? null).catch((error: unknown) =>
      setAviso(`No se pudieron cargar los accesos y períodos: ${mensajeDeError(error)}`),
    );
  }, [cargarAgrupaciones, cargarConfiguracion, periodoActivo]);

  /**
   * Corre una acción contra la API con la persona que firma. Si sale bien se
   * anota como cualquier otra; si falla, el aviso muestra el motivo que dio la
   * base (el mensaje del trigger que la rechazó, por ejemplo) y no se anota.
   * En los dos casos se vuelve a leer, para que la pantalla muestre lo que de
   * verdad quedó.
   */
  const conApi = useCallback(
    async (accion: (idPersona: number) => Promise<unknown>, anotar: () => void) => {
      if (idPersonaProcad === null) {
        setAviso("Falta VITE_PROCAD_ID_PERSONA en .env.local: la base necesita saber quién firma.");
        return;
      }
      try {
        await accion(idPersonaProcad);
        anotar();
      } catch (error) {
        setAviso(mensajeDeError(error));
      } finally {
        await recargar().catch(() => {});
      }
    },
    [recargar],
  );

  const resolverSolicitud = useCallback(
    (id: number, estado: EstadoSolicitudProcad, motivo?: string) => {
      const solicitud = solicitudes.find((s) => s.id === id);
      if (!solicitud) return;
      const verbo =
        estado === "aprobada" ? "Aprobó" : estado === "observada" ? "Observó" : "Marcó sin requisito";
      const anotar = () =>
        registrar(
          `Solicitud de ${solicitud.nombre} actualizada.`,
          `${verbo} solicitud`,
          `${solicitud.nombre} — ${solicitud.grupo}${motivo ? ` · ${motivo}` : ""}`,
        );

      if (procadConectado) {
        const decision = DECISION_DE_ESTADO[estado];
        if (!decision) {
          setAviso("Una solicitud resuelta no vuelve a pendiente.");
          return;
        }
        void conApi(
          (idPersona) => apiProcad.resolverSolicitud(id, { decision, idPersona, observacion: motivo }),
          anotar,
        );
        return;
      }

      setSolicitudes((previas) => previas.map((s) => (s.id === id ? { ...s, estado } : s)));
      anotar();
    },
    [solicitudes, registrar, conApi],
  );

  const resolverCondicionado = useCallback(
    (id: number, autorizar: boolean, motivo?: string) => {
      const caso = condicionados.find((c) => c.id === id);
      if (!caso) return;
      const anotar = () =>
        registrar(
          autorizar ? `Condicionado autorizado: ${caso.nombre}.` : `Propuesta rechazada: ${caso.nombre}.`,
          autorizar ? "Autorizó condicionado" : "Rechazó condicionado",
          // El motivo del rechazo va al registro: es lo que le queda al encargado
          // —y a quien audite— para saber por qué no procedió.
          `${caso.nombre} — ${caso.grupo}${motivo ? ` · ${motivo}` : ""}`,
        );

      if (procadConectado) {
        void conApi(async (idPersona) => {
          if (!autorizar) return apiProcad.rechazarCondicionado(id, { idPersona, motivo });
          await apiProcad.autorizarCondicionado(id, idPersona);
          // Con la doble firma completa, la solicitud queda aprobada sin volver
          // al encargado, igual que en la demostración.
          return apiProcad.resolverSolicitud(id, { decision: "APROBADO", idPersona });
        }, anotar);
        return;
      }

      setCondicionados((previos) => previos.filter((c) => c.id !== id));
      // Autorizar completa la doble firma: la solicitud del estudiante queda
      // aprobada sin pasar otra vez por el encargado.
      if (autorizar) {
        setSolicitudes((previas) =>
          previas.map((s) => (s.cuenta === caso.cuenta ? { ...s, estado: "aprobada" } : s)),
        );
      }
      anotar();
    },
    [condicionados, registrar, conApi],
  );

  const resolverExpulsion = useCallback(
    (id: number, aprobar: boolean, motivo?: string) => {
      const caso = expulsiones.find((x) => x.id === id);
      if (!caso) return;
      const anotar = () =>
        registrar(
          aprobar ? `Expulsión aprobada: ${caso.nombre}.` : `Expulsión rechazada: ${caso.nombre}.`,
          "Resolvió expulsión",
          `${aprobar ? "Aprobada" : "Rechazada"} — ${caso.nombre}, ${caso.grupo}${
            motivo ? ` · ${motivo}` : ""
          }`,
        );

      if (procadConectado) {
        void conApi(
          (idPersona) =>
            apiProcad.resolverExpulsion(id, {
              decision: aprobar ? "APROBADA" : "RECHAZADA",
              idPersonaResuelve: idPersona,
              observacion: motivo,
            }),
          anotar,
        );
        return;
      }

      setExpulsiones((previas) => previas.filter((x) => x.id !== id));
      anotar();
    },
    [expulsiones, registrar, conApi],
  );

  const otorgarMatricula = useCallback(
    (datos: { nombre: string; cuenta: string; motivo: string }) => {
      const anotar = () =>
        registrar(
          `Matrícula excepcional otorgada a ${datos.nombre}.`,
          "Otorgó matrícula excepcional",
          `${datos.nombre} — ${datos.motivo}`,
        );

      if (procadConectado) {
        // La matrícula es para el período vigente, que decide Catálogo.
        if (!periodoActivo) {
          setAviso("No hay un período activo en Catálogo: no se puede otorgar la matrícula.");
          return;
        }
        void conApi(
          (idPersona) =>
            apiProcad.crearMatriculaExcepcional({
              numeroCuenta: datos.cuenta,
              idPeriodo: periodoActivo.idPeriodo,
              motivoExcepcion: datos.motivo,
              idPersonaAutoriza: idPersona,
            }),
          anotar,
        );
        return;
      }

      setMatriculas((previas) => [
        ...previas,
        { id: Date.now(), periodo: "II-2026", ...datos },
      ]);
      anotar();
    },
    [registrar, conApi, periodoActivo],
  );

  const resolverActividad = useCallback(
    (id: number, estado: EstadoActividadProcad, motivo?: string) => {
      const actividad = actividades.find((a) => a.id === id);
      if (!actividad) return;
      const participio = {
        PENDIENTE_VALIDACION: "devuelta a revisión",
        VALIDADA: "validada",
        OBSERVADA: "observada",
        RECHAZADA: "rechazada",
      }[estado];
      const accion = {
        PENDIENTE_VALIDACION: "Reabrió actividad",
        VALIDADA: "Validó actividad",
        OBSERVADA: "Observó actividad",
        RECHAZADA: "Rechazó actividad",
      }[estado];
      const anotar = () =>
        registrar(
          `Actividad «${actividad.titulo}» ${participio}.`,
          accion,
          `${actividad.titulo} — ${actividad.grupo}${motivo ? ` · ${motivo}` : ""}`,
        );

      if (procadConectado) {
        if (estado !== "VALIDADA" && estado !== "RECHAZADA") {
          setAviso(
            estado === "OBSERVADA"
              ? "La base todavía no tiene el estado «observada»: por ahora solo se puede validar o rechazar."
              : "La base todavía no permite reabrir una actividad ya resuelta.",
          );
          return;
        }
        void conApi(
          (idPersona) =>
            apiProcad.validarActividad(id, {
              decision: estado,
              idPersonaValidadora: idPersona,
              observacion: motivo,
            }),
          anotar,
        );
        return;
      }

      // La resolución se guarda en la actividad, no solo en Auditoría: quien
      // abra el detalle dentro de un mes tiene que ver quién decidió y qué
      // contestó sin salir a buscarlo en otra pantalla.
      const resolucion = { por: usuario.nombreCompleto, fecha: marcaDeTiempo(), motivo };
      setActividades((previas) =>
        previas.map((a) => (a.id === id ? { ...a, estado, resolucion } : a)),
      );
      anotar();
    },
    [actividades, registrar, usuario.nombreCompleto, conApi],
  );

  const programarVisoria = useCallback(
    (id: number) => {
      const visoria = visorias.find((v) => v.id === id);
      if (!visoria) return;
      if (procadConectado) {
        setAviso("En la base una visoría existe desde que se crea: no hay borradores que programar.");
        return;
      }
      setVisorias((previas) =>
        previas.map((v) => (v.id === id ? { ...v, estado: "PROGRAMADA" } : v)),
      );
      registrar(
        `Visoría de ${visoria.grupo} programada.`,
        "Programó visoría",
        `${visoria.grupo} — ${enCorto(visoria.fecha)}, ${visoria.hora}`,
      );
    },
    [visorias, registrar],
  );

  // ── Galería ───────────────────────────────────────────────────────────────
  //
  // Las fotos viven en el estado y no en el archivo de datos porque aquí sí se
  // escribe: el administrador sube y quita, y la portada de la tarjeta de la
  // actividad cambia en ese mismo momento. Mientras no exista el servidor, lo
  // que sube es un `blob:` de esta sesión y se pierde al recargar; la pantalla
  // lo dice, para que nadie lo descubra por las malas.

  /**
   * Aplica un cambio a las fotos de un álbum.
   *
   * Si el álbum de una actividad se queda sin fotos, desaparece: la actividad
   * sigue estando en la lista y vuelve a mostrarse «sin fotos», así que el
   * álbum vacío no representaría nada. Un álbum suelto, en cambio, se queda
   * aunque se vacíe —es la única prueba de que existe— y solo se va cuando lo
   * borran a mano.
   */
  const cambiarFotos = useCallback(
    (albumId: string, cambio: (fotos: FotoGaleria[]) => FotoGaleria[]) => {
      setAlbumes((previos) =>
        previos
          .map((a) => (a.id === albumId ? { ...a, fotos: cambio(a.fotos) } : a))
          .filter((a) => a.origen === "suelto" || a.fotos.length > 0),
      );
    },
    [],
  );

  /** Cómo se llama un álbum en el registro, venga de donde venga. */
  const nombreDeAlbum = useCallback(
    (albumId: string) => {
      const album = albumes.find((a) => a.id === albumId);
      if (!album) return "Álbum";
      if (album.origen === "suelto") return album.titulo;
      return actividades.find((a) => a.id === album.actividadId)?.titulo ?? "Álbum";
    },
    [albumes, actividades],
  );

  /** Ids que no se repiten aunque se suban dos tandas en el mismo milisegundo. */
  const contador = useRef(0);
  const nuevoId = useCallback((prefijo: string) => {
    contador.current += 1;
    return `${prefijo}-${Date.now()}-${contador.current}`;
  }, []);

  const crearAlbumSuelto = useCallback(
    (datos: DatosAlbumSuelto) => {
      const id = nuevoId("alb");
      setAlbumes((previos) => [...previos, { id, origen: "suelto", ...datos, fotos: [] }]);
      registrar(
        `Álbum «${datos.titulo}» creado.`,
        "Creó un álbum suelto",
        `${datos.titulo} — ${datos.centro}`,
      );
      return id;
    },
    [nuevoId, registrar],
  );

  const editarAlbumSuelto = useCallback(
    (albumId: string, datos: DatosAlbumSuelto) => {
      setAlbumes((previos) =>
        previos.map((a) => (a.id === albumId && a.origen === "suelto" ? { ...a, ...datos } : a)),
      );
      registrar(`Álbum «${datos.titulo}» actualizado.`, "Editó un álbum suelto", datos.titulo);
    },
    [registrar],
  );

  const eliminarAlbum = useCallback(
    (albumId: string) => {
      const nombre = nombreDeAlbum(albumId);
      setAlbumes((previos) => previos.filter((a) => a.id !== albumId));
      registrar(`Álbum «${nombre}» eliminado.`, "Eliminó un álbum suelto", nombre);
    },
    [nombreDeAlbum, registrar],
  );

  const agregarFotos = useCallback(
    (destino: DestinoFotos, nuevas: Omit<FotoGaleria, "id">[]) => {
      if (nuevas.length === 0) return;
      const fotos = nuevas.map((foto) => ({ ...foto, id: nuevoId("f") }));
      let nombre = "";

      setAlbumes((previos) => {
        // A un álbum que ya existe —suelto o de actividad— se le añaden y ya.
        const existente =
          "albumId" in destino
            ? previos.find((a) => a.id === destino.albumId)
            : previos.find(
                (a) => a.origen === "actividad" && a.actividadId === destino.actividadId,
              );

        if (existente) {
          return previos.map((a) => (a.id === existente.id ? { ...a, fotos: [...a.fotos, ...fotos] } : a));
        }
        // Solo aquí nace un álbum solo: la actividad recibe su primera foto.
        if ("actividadId" in destino) {
          return [
            ...previos,
            {
              id: `alb-${destino.actividadId}`,
              origen: "actividad" as const,
              actividadId: destino.actividadId,
              fotos,
            },
          ];
        }
        return previos;
      });

      if ("actividadId" in destino) {
        nombre = actividades.find((a) => a.id === destino.actividadId)?.titulo ?? "la actividad";
      } else {
        nombre = nombreDeAlbum(destino.albumId);
      }

      registrar(
        nuevas.length === 1
          ? "Foto agregada a la galería."
          : `${nuevas.length} fotos agregadas a la galería.`,
        "Subió fotos a la galería",
        `${nombre} — ${nuevas.length} ${nuevas.length === 1 ? "foto" : "fotos"}`,
      );
    },
    [actividades, nombreDeAlbum, nuevoId, registrar],
  );

  const quitarFoto = useCallback(
    (albumId: string, fotoId: string) => {
      const nombre = nombreDeAlbum(albumId);
      cambiarFotos(albumId, (fotos) => fotos.filter((f) => f.id !== fotoId));
      registrar("Foto quitada de la galería.", "Quitó una foto de la galería", nombre);
    },
    [cambiarFotos, nombreDeAlbum, registrar],
  );

  const ponerDePortada = useCallback(
    (albumId: string, fotoId: string) => {
      cambiarFotos(albumId, (fotos) => {
        const elegida = fotos.find((f) => f.id === fotoId);
        if (!elegida) return fotos;
        return [elegida, ...fotos.filter((f) => f.id !== fotoId)];
      });
      registrar("Portada cambiada.", "Cambió la portada de un álbum", nombreDeAlbum(albumId));
    },
    [cambiarFotos, nombreDeAlbum, registrar],
  );

  // Describir y redimensionar no avisan ni se anotan: se hacen mirando la foto,
  // muchas veces seguidas, y un aviso flotante por cada letra escrita sería
  // ruido. Lo que cambian tampoco decide nada sobre nadie.
  const describirFoto = useCallback(
    (albumId: string, fotoId: string, alt: string) => {
      cambiarFotos(albumId, (fotos) => fotos.map((f) => (f.id === fotoId ? { ...f, alt } : f)));
    },
    [cambiarFotos],
  );

  const redimensionarFoto = useCallback(
    (albumId: string, fotoId: string, span: FotoGaleria["span"]) => {
      cambiarFotos(albumId, (fotos) => fotos.map((f) => (f.id === fotoId ? { ...f, span } : f)));
    },
    [cambiarFotos],
  );

  const alternarAcceso = useCallback(
    (nombre: string) => {
      const empleado = empleados.find((e) => e.nombre === nombre);
      if (!empleado) return;
      // La regla no admite excepciones: un colaborador externo no entra al
      // panel. La interfaz ni siquiera ofrece el botón, pero la regla vive
      // aquí para que no dependa de que la pantalla se acuerde de aplicarla.
      if (empleado.esColaboradorExterno) {
        setAviso(`${nombre} es colaborador externo: no puede recibir acceso al panel.`);
        return;
      }
      const concedido = !empleado.acceso;
      const anotar = () =>
        registrar(
          concedido ? `Acceso otorgado a ${nombre}.` : `Acceso revocado a ${nombre}.`,
          concedido ? "Otorgó acceso al panel" : "Revocó acceso al panel",
          nombre,
        );

      if (procadConectado) {
        const idPersona = idEmpleado.current.get(nombre);
        if (idPersona === undefined) return;
        void conApi(() => apiProcad.cambiarAccesoPersona(idPersona, concedido), anotar);
        return;
      }

      setEmpleados((previos) =>
        previos.map((e) => (e.nombre === nombre ? { ...e, acceso: concedido } : e)),
      );
      anotar();
    },
    [empleados, registrar, conApi],
  );

  const activarPeriodo = useCallback(
    (label: string) => {
      if (procadConectado) {
        // Los períodos son de Catálogo y cambiarlos cambia el período activo de
        // todo el sistema (Giras y Voluntariado incluidos): PROCAD no los toca.
        setAviso("Los períodos los administra Catálogo: PROCAD solo los consulta.");
        return;
      }
      // Solo un período activo a la vez: activar uno cierra el que estaba.
      setPeriodos((previos) =>
        previos.map((p) => {
          if (p.label === label) return { ...p, estado: "activo" };
          return p.estado === "activo" ? { ...p, estado: "cerrado" } : p;
        }),
      );
      registrar(`Período «${label}» activado.`, "Activó período", label);
    },
    [registrar],
  );

  const cerrarPeriodo = useCallback(
    (label: string) => {
      if (procadConectado) {
        // Los períodos son de Catálogo y cambiarlos cambia el período activo de
        // todo el sistema (Giras y Voluntariado incluidos): PROCAD no los toca.
        setAviso("Los períodos los administra Catálogo: PROCAD solo los consulta.");
        return;
      }
      setPeriodos((previos) =>
        previos.map((p) => (p.label === label ? { ...p, estado: "cerrado" } : p)),
      );
      registrar(`Período «${label}» cerrado.`, "Cerró período", label);
    },
    [registrar],
  );

  const alternarUsuario = useCallback(
    (correo: string) => {
      const cuenta = usuarios.find((u) => u.correo === correo);
      if (!cuenta) return;
      const activo = cuenta.estado !== "activo";
      setUsuarios((previos) =>
        previos.map((u) => (u.correo === correo ? { ...u, estado: activo ? "activo" : "inactivo" } : u)),
      );
      registrar(
        `Usuario ${activo ? "reactivado" : "desactivado"}: ${cuenta.nombre}.`,
        activo ? "Reactivó usuario" : "Desactivó usuario",
        `${cuenta.nombre} — ${cuenta.correo}`,
      );
    },
    [usuarios, registrar],
  );

  const pendientes = useMemo<PendientesProcad>(() => {
    const solicitudesPendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
    const actividadesPendientes = actividades.filter(
      (a) => a.estado === "PENDIENTE_VALIDACION",
    ).length;
    const visoriasBorrador = visorias.filter((v) => v.estado === "BORRADOR").length;

    const estudiantes = solicitudesPendientes + condicionados.length + expulsiones.length;
    const agrupaciones = actividadesPendientes + visoriasBorrador;

    return {
      solicitudes: solicitudesPendientes,
      condicionados: condicionados.length,
      expulsiones: expulsiones.length,
      actividades: actividadesPendientes,
      visorias: visoriasBorrador,
      estudiantes,
      agrupaciones,
      total: estudiantes + agrupaciones,
    };
  }, [solicitudes, condicionados, expulsiones, actividades, visorias]);

  const valor = useMemo<ValorProcad>(
    () => ({
      agrupaciones,
      solicitudes,
      condicionados,
      expulsiones,
      matriculas,
      actividades,
      visorias,
      albumes,
      empleados,
      usuarios,
      periodos,
      auditoria,
      pendientes,
      aviso,
      descartarAviso,
      resolverSolicitud,
      resolverCondicionado,
      resolverExpulsion,
      otorgarMatricula,
      resolverActividad,
      programarVisoria,
      agregarFotos,
      crearAlbumSuelto,
      editarAlbumSuelto,
      eliminarAlbum,
      quitarFoto,
      ponerDePortada,
      describirFoto,
      redimensionarFoto,
      alternarAcceso,
      activarPeriodo,
      cerrarPeriodo,
      alternarUsuario,
    }),
    [
      agrupaciones,
      solicitudes,
      condicionados,
      expulsiones,
      matriculas,
      actividades,
      visorias,
      albumes,
      empleados,
      usuarios,
      periodos,
      auditoria,
      pendientes,
      aviso,
      descartarAviso,
      resolverSolicitud,
      resolverCondicionado,
      resolverExpulsion,
      otorgarMatricula,
      resolverActividad,
      programarVisoria,
      agregarFotos,
      crearAlbumSuelto,
      editarAlbumSuelto,
      eliminarAlbum,
      quitarFoto,
      ponerDePortada,
      describirFoto,
      redimensionarFoto,
      alternarAcceso,
      activarPeriodo,
      cerrarPeriodo,
      alternarUsuario,
    ],
  );

  return (
    <ProcadContext.Provider value={valor}>
      {children}
      {/* El aviso vive aquí y no en cada página: cualquier acción, desde
          cualquier módulo, confirma igual y en el mismo lugar. */}
      <AvisoFlotante mensaje={aviso} onDescartar={descartarAviso} />
    </ProcadContext.Provider>
  );
}

export function useProcad(): ValorProcad {
  const contexto = useContext(ProcadContext);
  if (!contexto) {
    throw new Error("useProcad debe usarse dentro de <ProcadProvider>");
  }
  return contexto;
}
