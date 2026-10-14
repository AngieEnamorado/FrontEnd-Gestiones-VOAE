import { useState } from "react";
import { useParams } from "react-router-dom";
import { HiOutlineEnvelope } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import BadgeEstadoVoluntariado from "../../../components/voluntariado/BadgeEstadoVoluntariado";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeGrupo, colorDeRed, fechaCorta, formatoHoras, iniciales } from "../../../utils/voluntariado";

const CARGO_COORDINADOR = 2;

export default function DetalleGrupo() {
  const { id } = useParams<{ id: string }>();
  const idGrupo = Number(id);
  const { idPersona, persona } = useSesionVoluntariado();
  const [enviando, setEnviando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const carga = useApi(
    () =>
      Promise.all([
        voluntariadoApi.grupo(idGrupo),
        voluntariadoApi.actividades({ grupo: idGrupo }),
        voluntariadoApi.solicitudesDePersona(idPersona),
      ]),
    [idGrupo, idPersona],
  );

  if (!carga.datos) {
    return (
      <>
        <HeaderMovilDetalle titulo="Grupo" />
        <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
          {null}
        </EstadoCarga>
      </>
    );
  }

  const [grupo, actividades, solicitudes] = carga.datos;
  const campus = grupo.campus.map((c) => c.nombreCampus).join(", ");
  const yaEsMiembro = persona.grupos.some((g) => g.idGrupo === idGrupo);
  const solicitudPendiente = solicitudes.some(
    (s) => s.tipo === "UNION" && s.idGrupo === idGrupo && s.codigoEstado === "PENDIENTE",
  );
  const coordinador = grupo.juntaDirectiva.find((m) => m.idCargo === CARGO_COORDINADOR);
  const recientes = actividades.slice(0, 3);

  async function solicitarUnion() {
    setEnviando(true);
    setErrorAccion(null);
    try {
      await voluntariadoApi.solicitarUnion(idGrupo, idPersona, null);
      carga.recargar();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo={grupo.nombreGrupo} subtitulo={campus} />

      <div className="scrollbar-thin flex-1 overflow-y-auto pb-24">
        <div className="bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 pb-[46px] pt-5 text-white">
          <LogoGrupo iniciales={iniciales(grupo.nombreGrupo)} color={colorDeGrupo(grupo.idGrupo)} tamano="lg" sobreOscuro url={grupo.urlLogo} />
          <p className="mt-3 text-lg font-bold">{grupo.nombreGrupo}</p>
          <p className="text-xs text-white/60">{campus}</p>
        </div>

        <div className="mx-4 -mt-8 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white p-4 shadow-md">
          <div className="text-center">
            <p className="text-lg font-extrabold text-unah-navy">{grupo.totalMiembros}</p>
            <p className="text-[10px] font-semibold text-slate-400">MIEMBROS</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-unah-navy">{grupo.totalActividades}</p>
            <p className="text-[10px] font-semibold text-slate-400">ACTIVIDADES</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-unah-navy">{formatoHoras(grupo.horasTotales)}</p>
            <p className="text-[10px] font-semibold text-slate-400">HORAS</p>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {grupo.redesTematicas.map((red) => (
              <span
                key={red.idRedTematica}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${claseChipColor[colorDeRed(red.idRedTematica)]}`}
              >
                {red.nombreRedTematica}
              </span>
            ))}
          </div>

          {grupo.misionGrupo && (
            <section className="mt-5">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Misión</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{grupo.misionGrupo}</p>
            </section>
          )}

          <section className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Descripción</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{grupo.descripcionGrupo}</p>
          </section>

          {coordinador && (
            <section className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Coordinador</h2>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                  {iniciales(`${coordinador.nombrePersona} ${coordinador.apellidosPersona}`)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-slate-800">
                    {coordinador.nombrePersona} {coordinador.apellidosPersona}
                  </p>
                  {coordinador.correoPersona && (
                    <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                      <HiOutlineEnvelope className="h-3.5 w-3.5" />
                      {coordinador.correoPersona}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Actividades recientes</h2>
            <div className="mt-1.5 flex flex-col gap-2">
              {recientes.length === 0 && (
                <p className="text-[12.5px] text-slate-400">Este grupo aún no registra actividades.</p>
              )}
              {recientes.map((a) => (
                <div key={a.idActividad} className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-bold text-slate-800">{a.nombreActividad}</p>
                    <p className="text-[11px] text-slate-400">{fechaCorta(a.fechaActividad)}</p>
                  </div>
                  <BadgeEstadoVoluntariado codigo={a.codigoEstado} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        {errorAccion && <p className="mb-2 text-center text-[12px] font-semibold text-red-600">{errorAccion}</p>}
        {yaEsMiembro ? (
          <p className="text-center text-sm font-semibold text-slate-400">Ya eres miembro de este grupo</p>
        ) : solicitudPendiente ? (
          <p className="text-center text-sm font-semibold text-emerald-600">✓ Solicitud enviada, pendiente de respuesta</p>
        ) : (
          <button
            type="button"
            onClick={solicitarUnion}
            disabled={enviando}
            className="w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark disabled:opacity-60"
          >
            {enviando ? "Enviando…" : "Solicitar unirme"}
          </button>
        )}
      </footer>
    </div>
  );
}
