import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import AvisoFlotante from "../components/procad/AvisoFlotante";
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
import type {
  ActividadProcad,
  CondicionadoPendiente,
  EmpleadoProcad,
  EstadoActividadProcad,
  EstadoSolicitudProcad,
  ExpulsionPendiente,
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
  solicitudes: SolicitudProcad[];
  condicionados: CondicionadoPendiente[];
  expulsiones: ExpulsionPendiente[];
  matriculas: MatriculaExcepcional[];
  actividades: ActividadProcad[];
  visorias: VisoriaProcad[];
  empleados: EmpleadoProcad[];
  usuarios: UsuarioProcad[];
  periodos: PeriodoInscripcion[];
  auditoria: RegistroAuditoria[];
  pendientes: PendientesProcad;

  /** Mensaje de confirmación de la última acción, o `null` si no hay ninguno. */
  aviso: string | null;
  descartarAviso: () => void;

  resolverSolicitud: (id: number, estado: EstadoSolicitudProcad, motivo?: string) => void;
  resolverCondicionado: (id: number, autorizar: boolean) => void;
  resolverExpulsion: (id: number, aprobar: boolean) => void;
  otorgarMatricula: (datos: { nombre: string; cuenta: string; motivo: string }) => void;
  resolverActividad: (id: number, estado: EstadoActividadProcad) => void;
  programarVisoria: (id: number) => void;
  alternarAcceso: (nombre: string) => void;
  activarPeriodo: (label: string) => void;
  cerrarPeriodo: (label: string) => void;
  alternarUsuario: (correo: string) => void;
}

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

  const [solicitudes, setSolicitudes] = useState<SolicitudProcad[]>(() => [...solicitudesProcad]);
  const [condicionados, setCondicionados] = useState<CondicionadoPendiente[]>(() => [
    ...condicionadosPendientes,
  ]);
  const [expulsiones, setExpulsiones] = useState<ExpulsionPendiente[]>(() => [
    ...expulsionesPendientes,
  ]);
  const [matriculas, setMatriculas] = useState<MatriculaExcepcional[]>(() => [
    ...matriculasExcepcionales,
  ]);
  const [actividades, setActividades] = useState<ActividadProcad[]>(() => [...actividadesProcad]);
  const [visorias, setVisorias] = useState<VisoriaProcad[]>(() => [...visoriasProcad]);
  const [empleados, setEmpleados] = useState<EmpleadoProcad[]>(() => [...empleadosProcad]);
  const [usuarios, setUsuarios] = useState<UsuarioProcad[]>(() => [...usuariosProcad]);
  const [periodos, setPeriodos] = useState<PeriodoInscripcion[]>(() => [...periodosInscripcion]);
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

  const resolverSolicitud = useCallback(
    (id: number, estado: EstadoSolicitudProcad, motivo?: string) => {
      setSolicitudes((previas) => previas.map((s) => (s.id === id ? { ...s, estado } : s)));
      const solicitud = solicitudes.find((s) => s.id === id);
      if (!solicitud) return;
      const verbo =
        estado === "aprobada" ? "Aprobó" : estado === "observada" ? "Observó" : "Marcó sin requisito";
      registrar(
        `Solicitud de ${solicitud.nombre} actualizada.`,
        `${verbo} solicitud`,
        `${solicitud.nombre} — ${solicitud.grupo}${motivo ? ` · ${motivo}` : ""}`,
      );
    },
    [solicitudes, registrar],
  );

  const resolverCondicionado = useCallback(
    (id: number, autorizar: boolean) => {
      const caso = condicionados.find((c) => c.id === id);
      if (!caso) return;
      setCondicionados((previos) => previos.filter((c) => c.id !== id));
      // Autorizar completa la doble firma: la solicitud del estudiante queda
      // aprobada sin pasar otra vez por el encargado.
      if (autorizar) {
        setSolicitudes((previas) =>
          previas.map((s) => (s.cuenta === caso.cuenta ? { ...s, estado: "aprobada" } : s)),
        );
      }
      registrar(
        autorizar ? `Condicionado autorizado: ${caso.nombre}.` : `Propuesta rechazada: ${caso.nombre}.`,
        autorizar ? "Autorizó condicionado" : "Rechazó condicionado",
        `${caso.nombre} — ${caso.grupo}`,
      );
    },
    [condicionados, registrar],
  );

  const resolverExpulsion = useCallback(
    (id: number, aprobar: boolean) => {
      const caso = expulsiones.find((x) => x.id === id);
      if (!caso) return;
      setExpulsiones((previas) => previas.filter((x) => x.id !== id));
      registrar(
        aprobar ? `Expulsión aprobada: ${caso.nombre}.` : `Expulsión rechazada: ${caso.nombre}.`,
        "Resolvió expulsión",
        `${aprobar ? "Aprobada" : "Rechazada"} — ${caso.nombre}, ${caso.grupo}`,
      );
    },
    [expulsiones, registrar],
  );

  const otorgarMatricula = useCallback(
    (datos: { nombre: string; cuenta: string; motivo: string }) => {
      setMatriculas((previas) => [
        ...previas,
        { id: Date.now(), periodo: "II-2026", ...datos },
      ]);
      registrar(
        `Matrícula excepcional otorgada a ${datos.nombre}.`,
        "Otorgó matrícula excepcional",
        `${datos.nombre} — ${datos.motivo}`,
      );
    },
    [registrar],
  );

  const resolverActividad = useCallback(
    (id: number, estado: EstadoActividadProcad) => {
      const actividad = actividades.find((a) => a.id === id);
      if (!actividad) return;
      setActividades((previas) => previas.map((a) => (a.id === id ? { ...a, estado } : a)));
      registrar(
        `Actividad «${actividad.titulo}» ${estado === "VALIDADA" ? "validada" : "rechazada"}.`,
        estado === "VALIDADA" ? "Validó actividad" : "Rechazó actividad",
        `${actividad.titulo} — ${actividad.grupo}`,
      );
    },
    [actividades, registrar],
  );

  const programarVisoria = useCallback(
    (id: number) => {
      const visoria = visorias.find((v) => v.id === id);
      if (!visoria) return;
      setVisorias((previas) =>
        previas.map((v) => (v.id === id ? { ...v, estado: "PROGRAMADA" } : v)),
      );
      registrar(
        `Visoría de ${visoria.grupo} programada.`,
        "Programó visoría",
        `${visoria.grupo} — ${visoria.fecha}, ${visoria.hora}`,
      );
    },
    [visorias, registrar],
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
      setEmpleados((previos) =>
        previos.map((e) => (e.nombre === nombre ? { ...e, acceso: concedido } : e)),
      );
      registrar(
        concedido ? `Acceso otorgado a ${nombre}.` : `Acceso revocado a ${nombre}.`,
        concedido ? "Otorgó acceso al panel" : "Revocó acceso al panel",
        nombre,
      );
    },
    [empleados, registrar],
  );

  const activarPeriodo = useCallback(
    (label: string) => {
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
      solicitudes,
      condicionados,
      expulsiones,
      matriculas,
      actividades,
      visorias,
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
      alternarAcceso,
      activarPeriodo,
      cerrarPeriodo,
      alternarUsuario,
    }),
    [
      solicitudes,
      condicionados,
      expulsiones,
      matriculas,
      actividades,
      visorias,
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
