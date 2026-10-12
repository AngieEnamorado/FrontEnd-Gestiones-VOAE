import { Link, useNavigate } from "react-router-dom";
import { HiOutlineExclamationTriangle, HiOutlineUserGroup, HiOutlinePlus, HiOutlineClipboardDocumentCheck, HiOutlineCamera } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import BadgeEstadoInforme from "../../../components/voluntariado/BadgeEstadoInforme";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { estadoInforme, fechaCorta, formatoHoras } from "../../../utils/voluntariado";

const MINIMO_FOTOS = 2;

export default function PanelCoordinador() {
  const navigate = useNavigate();
  const { grupoCoordinado } = useSesionVoluntariado();
  const idGrupo = grupoCoordinado?.idGrupo;

  const carga = useApi(
    () =>
      idGrupo
        ? Promise.all([
            voluntariadoApi.grupo(idGrupo),
            voluntariadoApi.miembros(idGrupo),
            voluntariadoApi.actividades({ grupo: idGrupo }),
            voluntariadoApi.informes({ grupo: idGrupo }),
            voluntariadoApi.solicitudesUnion(idGrupo, "PENDIENTE"),
          ])
        : Promise.resolve(undefined),
    [idGrupo],
  );

  if (!grupoCoordinado) {
    return (
      <>
        <HeaderMovilDetalle titulo="Panel de coordinador" />
        <p className="p-6 text-sm text-slate-400">No coordinas ningún grupo actualmente.</p>
      </>
    );
  }

  if (!carga.datos) {
    return (
      <>
        <HeaderMovilDetalle titulo="Panel de coordinador" subtitulo={grupoCoordinado.nombreGrupo} />
        <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
          {null}
        </EstadoCarga>
      </>
    );
  }

  const [grupo, miembros, actividades, informes, solicitudesPendientes] = carga.datos;
  const f = miembros.filter((mi) => mi.sexoPersona === "F").length;
  const m = miembros.filter((mi) => mi.sexoPersona === "M").length;
  const totalGenero = f + m || 1;

  // El informe que el coordinador tiene que atender: el que está en captura
  // o el que le devolvieron con observaciones.
  const informe = informes.find((i) => i.codigoEstado === "EN_CAPTURA" || i.codigoEstado === "OBSERVADO");

  const sinEvidencia = actividades.filter((a) => a.codigoEstado === "EJECUTADA" && a.totalFotos < MINIMO_FOTOS);
  const proximaActividad = actividades
    .filter((a) => a.codigoEstado === "APROBADA" && a.idGrupoOrganizador === grupo.idGrupo)
    .sort((a, b) => (fechaCorta(a.fechaActividad) < fechaCorta(b.fechaActividad) ? -1 : 1))[0];

  return (
    <div className="pb-6">
      <div className="rounded-b-[22px] bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 pb-6 pt-5 text-white">
        <button className="mb-2 text-xs text-white/70" onClick={() => navigate(-1)} type="button">‹ Volver</button>
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">Panel de coordinador</p>
        <h1 className="text-lg font-bold">{grupo.nombreGrupo}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <TarjetaKpi label="Horas totales" valor={formatoHoras(grupo.horasTotales)} />
        <TarjetaKpi label="Actividades" valor={grupo.totalActividades} />
        <TarjetaKpi label="Miembros activos" valor={grupo.totalMiembros} />
        <div className="rounded-2xl bg-white p-3.5 shadow-sm">
          <p className="text-[10.5px] font-semibold text-slate-400">POR GÉNERO</p>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
            <span className="bg-unah-navy" style={{ width: `${(f / totalGenero) * 100}%` }} />
            <span className="bg-unah-orange" style={{ width: `${(m / totalGenero) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500">F {f} · M {m}</p>
        </div>
      </div>

      {informe && (
        <Link
          to={`/voluntariado/portal-estudiante/coordinador/informe-trimestral/${grupo.idGrupo}`}
          className="mx-4 mt-3 block rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-slate-800">Informe del trimestre</p>
            <BadgeEstadoInforme estado={estadoInforme(informe.codigoEstado)} />
          </div>
          {informe.fechaLimiteInforme && (
            <p className="mt-1 text-[11.5px] font-semibold text-red-600">Fecha límite: {fechaCorta(informe.fechaLimiteInforme)}</p>
          )}
        </Link>
      )}

      <div className="mt-3 flex flex-col gap-2.5 px-4">
        {solicitudesPendientes.length > 0 && (
          <Link
            to="/voluntariado/portal-estudiante/coordinador/solicitudes"
            className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5"
          >
            <HiOutlineExclamationTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[12.5px] font-semibold text-amber-800">
              {solicitudesPendientes.length} solicitudes de unión pendientes
            </p>
          </Link>
        )}
        {sinEvidencia.length > 0 && (
          <Link
            to={`/voluntariado/portal-estudiante/coordinador/evidencia/${sinEvidencia[0].idActividad}`}
            className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5"
          >
            <HiOutlineCamera className="h-4 w-4 shrink-0 text-red-600" />
            <p className="text-[12.5px] font-semibold text-red-700">
              {sinEvidencia.length} actividades sin fotos de evidencia
            </p>
          </Link>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 px-4">
        <BotonAccion to="/voluntariado/portal-estudiante/coordinador/miembros" label="Miembros" icon={HiOutlineUserGroup} />
        <BotonAccion to="/voluntariado/portal-estudiante/coordinador/actividades/nueva" label="Nueva actividad" icon={HiOutlinePlus} />
        <BotonAccion
          to={`/voluntariado/portal-estudiante/coordinador/pasar-lista/${proximaActividad?.idActividad ?? "ninguna"}`}
          label="Pasar lista"
          icon={HiOutlineClipboardDocumentCheck}
          destacado
        />
        <BotonAccion
          to={`/voluntariado/portal-estudiante/coordinador/informe-trimestral/${grupo.idGrupo}`}
          label="Informe trimestral"
          icon={HiOutlineClipboardDocumentCheck}
        />
      </div>
    </div>
  );
}

function TarjetaKpi({ label, valor }: { label: string; valor: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-sm">
      <p className="text-[10.5px] font-semibold text-slate-400">{label.toUpperCase()}</p>
      <p className="mt-1 text-[21px] font-extrabold text-unah-navy">{valor}</p>
    </div>
  );
}

function BotonAccion({
  to,
  label,
  icon: Icon,
  destacado,
}: {
  to: string;
  label: string;
  icon: typeof HiOutlineUserGroup;
  destacado?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center shadow-sm ${
        destacado ? "bg-unah-orange text-white" : "bg-white text-slate-700"
      }`}
    >
      <Icon className={`h-5 w-5 ${destacado ? "text-white" : "text-unah-navy"}`} />
      <span className="text-[12px] font-semibold">{label}</span>
    </Link>
  );
}
