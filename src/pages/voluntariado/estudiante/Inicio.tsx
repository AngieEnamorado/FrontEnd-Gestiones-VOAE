import { Link } from "react-router-dom";
import { HiOutlineUserGroup, HiOutlineExclamationTriangle } from "react-icons/hi2";
import EncabezadoGradiente from "../../../components/voluntariado/EncabezadoGradiente";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { nombreCampus } from "../../../data/mockCatalogosVoluntariado";
import { actividadesVoluntariado, inscripcionesVoluntariado } from "../../../data/mockActividadesVoluntariado";
import { solicitudesEstudianteVoluntariado } from "../../../data/mockSolicitudesVoluntariado";
import { horasConfirmadasEstudiante } from "../../../data/voluntariadoSelectors";

const HOY = "2026-09-09";

export default function Inicio() {
  const usuario = estudianteActual;
  const grupos = usuario.gruposIds.map((id) => grupoPorId(id)).filter((g) => g !== undefined);
  const horas = horasConfirmadasEstudiante(usuario.numeroCuenta);

  const proximas = inscripcionesVoluntariado
    .filter((i) => i.estudianteCuenta === usuario.numeroCuenta)
    .map((i) => ({ inscripcion: i, actividad: actividadesVoluntariado.find((a) => a.id === i.actividadId) }))
    .filter((r) => r.actividad && r.actividad.fecha >= HOY);

  const solicitudesPendientes = solicitudesEstudianteVoluntariado.filter(
    (s) => s.estudianteCuenta === usuario.numeroCuenta && s.estado === "PENDIENTE",
  );

  if (grupos.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-7 py-12 text-center">
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-blue-50">
          <HiOutlineUserGroup className="h-8 w-8 text-unah-navy" />
        </div>
        <h1 className="mt-5 text-lg font-bold text-slate-800">Aún no perteneces a ningún grupo</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
          Explora los 31 grupos de voluntariado distribuidos en los 10 campus de la UNAH y solicita tu
          incorporación al que más se ajuste a ti.
        </p>
        <Link
          to="/voluntariado/portal-estudiante/grupos"
          className="mt-6 rounded-xl bg-unah-orange px-6 py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark"
        >
          Explorar catálogo de grupos
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <EncabezadoGradiente>
        <p className="text-sm text-white/70">Hola,</p>
        <h1 className="text-xl font-bold">{usuario.nombreCompleto}</h1>
        <p className="mt-1 text-xs text-white/60">{usuario.numeroCuenta} · {usuario.carrera}</p>
      </EncabezadoGradiente>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">HORAS ACUMULADAS</p>
          <p className="mt-1 text-[26px] font-extrabold text-unah-navy">{horas}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">GRUPOS ACTIVOS</p>
          <p className="mt-1 text-[26px] font-extrabold text-unah-orange">{grupos.length}</p>
        </div>
      </div>

      <section className="mt-6 px-4">
        <h2 className="text-sm font-bold text-slate-700">Mis grupos</h2>
        <div className="scrollbar-thin mt-3 flex gap-3 overflow-x-auto pb-1">
          {grupos.map((grupo) => {
            const esCoordinador = grupo.coordinadorCuenta === usuario.numeroCuenta;
            return (
              <Link
                key={grupo.id}
                to={
                  esCoordinador
                    ? "/voluntariado/portal-estudiante/coordinador"
                    : `/voluntariado/portal-estudiante/grupos/${grupo.id}`
                }
                className="w-[176px] shrink-0 rounded-2xl bg-white p-3.5 shadow-sm"
              >
                <LogoGrupo iniciales={grupo.logoIniciales} color={grupo.logoColor} />
                <p className="mt-2 truncate text-[13px] font-bold text-slate-800">{grupo.nombre}</p>
                <p className="truncate text-[11px] text-slate-400">{nombreCampus(grupo.campusId)}</p>
                <p className={`mt-1 text-[11px] font-semibold ${esCoordinador ? "text-unah-orange" : "text-slate-500"}`}>
                  {esCoordinador ? "Eres coordinador ›" : "Miembro"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Próximas actividades</h2>
          <Link to="/voluntariado/portal-estudiante/actividades" className="text-xs font-semibold text-unah-orange">
            Ver todas
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {proximas.length === 0 && (
            <p className="text-[13px] text-slate-400">No tienes actividades próximas.</p>
          )}
          {proximas.map(({ actividad }) => {
            if (!actividad) return null;
            const grupo = grupoPorId(actividad.grupoId);
            const [, mes, dia] = actividad.fecha.split("-");
            return (
              <div key={actividad.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex h-[46px] w-[46px] shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50">
                  <span className="text-[15px] font-extrabold text-unah-navy">{dia}</span>
                  <span className="text-[9px] font-semibold uppercase text-unah-navy/60">{MESES[Number(mes) - 1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-slate-800">{actividad.nombre}</p>
                  <p className="truncate text-[11px] text-slate-400">{grupo?.nombre} · {actividad.lugar}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  Inscrito
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {solicitudesPendientes.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-sm font-bold text-slate-700">Solicitudes pendientes</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {solicitudesPendientes.map((s) => (
              <div key={s.id} className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-bold text-amber-800">{s.titulo}</p>
                  <p className="text-[11px] font-semibold text-amber-600">{s.estado}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
