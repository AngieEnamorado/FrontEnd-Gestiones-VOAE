import { useCallback, useState } from "react";
import { procadConectado } from "../../api/clienteProcad";
import { mensajeDeError } from "../../api/cliente";
import { etiquetaPeriodo } from "../../api/adaptadoresProcad";
import { listarAccesosDePersona, listarSolicitudesDeGrupo, obtenerGrupo, obtenerPeriodoActivo } from "../../api/procad";
import { useConsulta } from "../../api/useConsulta";
import SinIdentidad from "../../components/giras/SinIdentidad";
import AvisoFlotante from "../../components/procad/AvisoFlotante";
import DialogoConfirmacion, { type Dialogo } from "../../components/procad/DialogoConfirmacion";
import { useIdentidadProcad } from "../../context/UserContext";
import { RUTA_MODO_PROCAD } from "../../router/rolesProcad";
import type { IdentidadProcad } from "../../types";
import type { AccesoApi, GrupoApi, PeriodoApi } from "../../types/procad";
import LayoutModulo from "./LayoutModulo";
import ActividadesGrupo from "./miGrupo/ActividadesGrupo";
import ConfiguracionGrupo from "./miGrupo/ConfiguracionGrupo";
import ElegibilidadGrupo from "./miGrupo/ElegibilidadGrupo";
import IntegrantesGrupo from "./miGrupo/IntegrantesGrupo";
import PasarLista from "./miGrupo/PasarLista";
import SolicitudesGrupo from "./miGrupo/SolicitudesGrupo";
import VisoriasGrupo from "./miGrupo/VisoriasGrupo";
import type { Ejecutar } from "./miGrupo/ejecutar";

type Pestana =
  | "solicitudes"
  | "integrantes"
  | "actividades"
  | "asistencia"
  | "visorias"
  | "configuracion"
  | "elegibilidad";

/** El director siempre existe en la base: su idPersona es lo que firma. */
type Director = IdentidadProcad & { idPersona: number };

function Encabezado({ descripcion }: { descripcion: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold tracking-wider text-unah-orange">PROCAD</p>
      <h1 className="text-2xl font-bold break-words text-slate-800 sm:text-3xl">Mi grupo</h1>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{descripcion}</p>
    </div>
  );
}

function Aviso({ children, tono = "info" }: { children: React.ReactNode; tono?: "info" | "error" }) {
  return (
    <p
      className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
        tono === "error" ? "bg-rose-50 text-rose-700" : "bg-white text-slate-500 shadow-sm"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * La mesa de trabajo del director o entrenador: un grupo a la vez, con lo que
 * ese grupo tiene en el período activo. Todo lo que hace aquí lo firma la
 * persona elegida en "Modo de vista", y los triggers de la base comprueban que
 * de verdad dirija el grupo.
 */
export default function MiGrupoProcad() {
  const identidad = useIdentidadProcad();

  if (!procadConectado) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion="El trabajo del director sobre su grupo." />
        <Aviso>
          Esta vista trabaja solo con la base de datos: hace falta VITE_API_PROCAD_URL en .env.local.
        </Aviso>
      </div>
    );
  }

  if (!identidad || identidad.idPersona === null) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion="El trabajo del director sobre su grupo." />
        <SinIdentidad rol="Director / Entrenador" ruta={RUTA_MODO_PROCAD} />
      </div>
    );
  }

  // La `key` reinicia todo al cambiar de persona: los grupos de otra no deben quedar a la vista.
  return <GruposDe key={identidad.idPersona} identidad={{ ...identidad, idPersona: identidad.idPersona }} />;
}

function GruposDe({ identidad }: { identidad: Director }) {
  const accesos = useConsulta(() => listarAccesosDePersona(identidad.idPersona), [identidad.idPersona]);
  const periodo = useConsulta(obtenerPeriodoActivo, []);
  const [idGrupo, setIdGrupo] = useState<number | null>(null);

  const grupos = (accesos.datos ?? []).filter((a) => a.activo);
  const descripcion = `Actúa como ${identidad.nombreCompleto}.`;

  if (accesos.cargando || periodo.cargando) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion={descripcion} />
        <Aviso>Cargando sus grupos…</Aviso>
      </div>
    );
  }

  if (accesos.error || periodo.error) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion={descripcion} />
        <Aviso tono="error">{accesos.error ?? periodo.error}</Aviso>
      </div>
    );
  }

  if (grupos.length === 0 || !periodo.datos) {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado descripcion={descripcion} />
        <Aviso>
          {grupos.length === 0
            ? "Esta persona no tiene acceso vigente a ningún grupo. El administrador lo otorga en Configuración → Accesos."
            : "No hay un período académico activo: sin él no hay solicitudes ni integrantes que mostrar."}
        </Aviso>
      </div>
    );
  }

  const grupo = grupos.find((g) => g.idGrupo === idGrupo) ?? grupos[0]!;

  return (
    <PanelGrupo
      key={grupo.idGrupo}
      grupo={grupo}
      grupos={grupos}
      onCambiarGrupo={setIdGrupo}
      periodo={periodo.datos}
      identidad={identidad}
    />
  );
}

function PanelGrupo({
  grupo,
  grupos,
  onCambiarGrupo,
  periodo,
  identidad,
}: {
  grupo: AccesoApi;
  grupos: AccesoApi[];
  onCambiarGrupo: (id: number) => void;
  periodo: PeriodoApi;
  identidad: Director;
}) {
  const [activa, setActiva] = useState<Pestana>("solicitudes");
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [aviso, setAviso] = useState<{ mensaje: string; tono: "exito" | "error" } | null>(null);
  const descartarAviso = useCallback(() => setAviso(null), []);

  // Las solicitudes viven aquí y no en su pestaña: el contador de pendientes
  // de la pestaña y de la caja de arriba las necesita aunque no esté abierta.
  const solicitudes = useConsulta(
    () => listarSolicitudesDeGrupo(grupo.idGrupo, periodo.idPeriodo),
    [grupo.idGrupo, periodo.idPeriodo],
  );
  const pendientes = (solicitudes.datos ?? []).filter((s) => s.codigoEstado === "PENDIENTE").length;
  const recargarSolicitudes = solicitudes.recargar;
  // El tipo, el campus y los tipos de actividad del grupo: el acceso no los trae.
  const detalle = useConsulta(() => obtenerGrupo(grupo.idGrupo), [grupo.idGrupo]);

  /**
   * Corre una acción con la persona que firma. Si la base la rechaza —un
   * trigger que no la deja pasar, por ejemplo— el aviso muestra su motivo.
   * En los dos casos se vuelve a leer: la base puede cambiar más de lo pedido.
   */
  const ejecutar: Ejecutar = useCallback(
    async (accion, mensajeExito, recargarTambien) => {
      try {
        await accion(identidad.idPersona);
        setAviso({ mensaje: mensajeExito, tono: "exito" });
      } catch (error) {
        setAviso({ mensaje: mensajeDeError(error), tono: "error" });
      } finally {
        recargarSolicitudes();
        recargarTambien?.();
      }
    },
    [identidad.idPersona, recargarSolicitudes],
  );

  const selector =
    grupos.length > 1 ? (
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Grupo</span>
        <select
          value={grupo.idGrupo}
          onChange={(e) => onCambiarGrupo(Number(e.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-unah-orange"
        >
          {grupos.map((g) => (
            <option key={g.idGrupo} value={g.idGrupo}>
              {g.nombreGrupo}
            </option>
          ))}
        </select>
      </label>
    ) : undefined;

  return (
    <>
      <LayoutModulo
        titulo={grupo.nombreGrupo}
        descripcion={`${grupo.nombreCampus} · período ${etiquetaPeriodo(periodo.anioPeriodo, periodo.numeroPac)} · actúa como ${identidad.nombreCompleto}.`}
        accion={selector}
        nombre="mi-grupo"
        activa={activa}
        onCambiar={setActiva}
        pendientes={pendientes > 0 ? [`${pendientes} solicitud(es) de ingreso esperando su decisión.`] : []}
        mensajeSinPendientes="No hay solicitudes de ingreso esperando su decisión."
        pestanas={[
          { id: "solicitudes", label: "Solicitudes", pendientes },
          { id: "integrantes", label: "Integrantes" },
          { id: "actividades", label: "Actividades" },
          { id: "asistencia", label: "Pasar lista" },
          { id: "visorias", label: "Visorías" },
          { id: "configuracion", label: "Configuración" },
          { id: "elegibilidad", label: "Elegibilidad" },
        ]}
      >
        {activa === "solicitudes" && (
          <SolicitudesGrupo
            idGrupo={grupo.idGrupo}
            idPeriodo={periodo.idPeriodo}
            consulta={solicitudes}
            ejecutar={ejecutar}
            abrirDialogo={setDialogo}
          />
        )}
        {activa === "integrantes" && (
          <IntegrantesGrupo
            idGrupo={grupo.idGrupo}
            idPeriodo={periodo.idPeriodo}
            ejecutar={ejecutar}
            abrirDialogo={setDialogo}
          />
        )}
        {activa !== "solicitudes" && activa !== "integrantes" && (
          <ConDetalle detalle={detalle}>
            {(g) => (
              <>
                {activa === "actividades" && <ActividadesGrupo grupo={g} idPeriodo={periodo.idPeriodo} ejecutar={ejecutar} />}
                {activa === "asistencia" && <PasarLista grupo={g} idPeriodo={periodo.idPeriodo} ejecutar={ejecutar} />}
                {activa === "visorias" && (
                  <VisoriasGrupo grupo={g} idPeriodo={periodo.idPeriodo} solicitudes={solicitudes.datos ?? []} ejecutar={ejecutar} />
                )}
                {activa === "configuracion" && <ConfiguracionGrupo grupo={g} idPeriodo={periodo.idPeriodo} ejecutar={ejecutar} />}
                {activa === "elegibilidad" && (
                  <ElegibilidadGrupo grupo={g} periodo={periodo} ejecutar={ejecutar} abrirDialogo={setDialogo} />
                )}
              </>
            )}
          </ConDetalle>
        )}
      </LayoutModulo>

      <DialogoConfirmacion dialogo={dialogo} onCerrar={() => setDialogo(null)} />
      <AvisoFlotante mensaje={aviso?.mensaje ?? null} tono={aviso?.tono} onDescartar={descartarAviso} />
    </>
  );
}

/** Las pestañas que necesitan el detalle del grupo esperan a tenerlo. */
function ConDetalle({
  detalle,
  children,
}: {
  detalle: { datos: GrupoApi | null; cargando: boolean; error: string | null };
  children: (grupo: GrupoApi) => React.ReactNode;
}) {
  if (detalle.error) return <Aviso tono="error">{detalle.error}</Aviso>;
  if (!detalle.datos) return <Aviso>Cargando el grupo…</Aviso>;
  return <>{children(detalle.datos)}</>;
}
