import { Link } from "react-router-dom";
import { HiOutlineUserGroup, HiOutlineExclamationTriangle } from "react-icons/hi2";
import EncabezadoGradiente from "../../../components/voluntariado/EncabezadoGradiente";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { hoyIso } from "../../../utils/fechas";
import { colorDeGrupo, fechaCorta, formatoHoras, iniciales } from "../../../utils/voluntariado";

export default function Inicio() {
  const { idPersona, persona } = useSesionVoluntariado();
  const datos = useApi(
    () => Promise.all([voluntariadoApi.participacionesDePersona(idPersona), voluntariadoApi.solicitudesDePersona(idPersona)]),
    [idPersona],
  );
  const [participaciones, solicitudes] = datos.datos ?? [[], []];
  const hoy = hoyIso();

  const proximas = participaciones.filter(
    (p) => p.codigoEstado === "INSCRITO" && fechaCorta(p.fechaActividad) >= hoy,
  );
  const solicitudesPendientes = solicitudes.filter(
    (s) => s.tipo !== "ACTIVIDAD" && s.codigoEstado === "PENDIENTE",
  );
  const nombreCompleto = `${persona.nombrePersona} ${persona.apellidosPersona}`;

  if (persona.grupos.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-7 py-12 text-center">
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-blue-50">
          <HiOutlineUserGroup className="h-8 w-8 text-unah-navy" />
        </div>
        <h1 className="mt-5 text-lg font-bold text-slate-800">Aún no perteneces a ningún grupo</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
          Explora los grupos de voluntariado de los campus de la UNAH y solicita tu incorporación al que más se
          ajuste a ti.
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
        <h1 className="text-xl font-bold">{nombreCompleto}</h1>
        <p className="mt-1 text-xs text-white/60">{persona.numeroCuenta} · {persona.carreraEstudiante}</p>
      </EncabezadoGradiente>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">HORAS ACUMULADAS</p>
          <p className="mt-1 text-[26px] font-extrabold text-unah-navy">{formatoHoras(persona.horasConfirmadas)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">GRUPOS ACTIVOS</p>
          <p className="mt-1 text-[26px] font-extrabold text-unah-orange">{persona.grupos.length}</p>
        </div>
      </div>

      <section className="mt-6 px-4">
        <h2 className="text-sm font-bold text-slate-700">Mis grupos</h2>
        <div className="scrollbar-thin mt-3 flex gap-3 overflow-x-auto pb-1">
          {persona.grupos.map((grupo) => {
            const esCoordinador = grupo.esCoordinador === 1;
            return (
              <Link
                key={grupo.idGrupo}
                to={
                  esCoordinador
                    ? "/voluntariado/portal-estudiante/coordinador"
                    : `/voluntariado/portal-estudiante/grupos/${grupo.idGrupo}`
                }
                className="w-[176px] shrink-0 rounded-2xl bg-white p-3.5 shadow-sm"
              >
                <LogoGrupo iniciales={iniciales(grupo.nombreGrupo)} color={colorDeGrupo(grupo.idGrupo)} />
                <p className="mt-2 truncate text-[13px] font-bold text-slate-800">{grupo.nombreGrupo}</p>
                <p className="truncate text-[11px] text-slate-400">{grupo.campus}</p>
                <p className={`mt-1 text-[11px] font-semibold ${esCoordinador ? "text-unah-orange" : "text-slate-500"}`}>
                  {esCoordinador ? "Eres coordinador ›" : grupo.nombreCargo}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <EstadoCarga cargando={datos.cargando} error={datos.error} onReintentar={datos.recargar} listo={datos.datos !== undefined}>
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
            {proximas.map((p) => {
              const [, mes, dia] = fechaCorta(p.fechaActividad).split("-");
              return (
                <div key={p.idParticipacion} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                  <div className="flex h-[46px] w-[46px] shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50">
                    <span className="text-[15px] font-extrabold text-unah-navy">{dia}</span>
                    <span className="text-[9px] font-semibold uppercase text-unah-navy/60">{MESES[Number(mes) - 1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-slate-800">{p.nombreActividad}</p>
                    <p className="truncate text-[11px] text-slate-400">{p.nombreGrupoOrganizador} · {p.lugarActividad}</p>
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
                <div key={`${s.tipo}-${s.id}`} className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                  <HiOutlineExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-bold text-amber-800">{s.titulo}</p>
                    <p className="text-[11px] font-semibold text-amber-600">{s.codigoEstado}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </EstadoCarga>
    </div>
  );
}

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
