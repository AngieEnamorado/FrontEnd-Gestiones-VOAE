import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { HiOutlineEnvelope } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import EstadoBadge from "../../../components/EstadoBadge";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { nombreCampus, redPorId } from "../../../data/mockCatalogosVoluntariado";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { actividadesDeGrupo, horasTotalesDeGrupo } from "../../../data/voluntariadoSelectors";

export default function DetalleGrupo() {
  const { id } = useParams<{ id: string }>();
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const grupo = id ? grupoPorId(id) : undefined;

  const actividadesRecientes = useMemo(
    () => (grupo ? [...actividadesDeGrupo(grupo.id)].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, 3) : []),
    [grupo],
  );

  if (!grupo) {
    return (
      <>
        <HeaderMovilDetalle titulo="Grupo no encontrado" />
        <p className="p-6 text-sm text-slate-400">Este grupo ya no está disponible.</p>
      </>
    );
  }

  const yaEsMiembro = estudianteActual.gruposIds.includes(grupo.id);
  const coordinador = grupo.miembros.find((m) => m.numeroCuenta === grupo.coordinadorCuenta);
  const horas = horasTotalesDeGrupo(grupo.id);

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo={grupo.nombre} subtitulo={nombreCampus(grupo.campusId)} />

      <div className="scrollbar-thin flex-1 overflow-y-auto pb-24">
        <div className="bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 pb-[46px] pt-5 text-white">
          <LogoGrupo iniciales={grupo.logoIniciales} color={grupo.logoColor} tamano="lg" sobreOscuro />
          <p className="mt-3 text-lg font-bold">{grupo.nombre}</p>
          <p className="text-xs text-white/60">{nombreCampus(grupo.campusId)}</p>
        </div>

        <div className="mx-4 -mt-8 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-white p-4 shadow-md">
          <div className="text-center">
            <p className="text-lg font-extrabold text-unah-navy">{grupo.miembros.length}</p>
            <p className="text-[10px] font-semibold text-slate-400">MIEMBROS</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-unah-navy">{actividadesDeGrupo(grupo.id).length}</p>
            <p className="text-[10px] font-semibold text-slate-400">ACTIVIDADES</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-unah-navy">{horas}</p>
            <p className="text-[10px] font-semibold text-slate-400">HORAS</p>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="flex flex-wrap gap-1.5">
            {grupo.redesIds.map((redId) => {
              const red = redPorId(redId);
              if (!red) return null;
              return (
                <span key={redId} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${claseChipColor[red.color]}`}>
                  {red.nombre}
                </span>
              );
            })}
          </div>

          <section className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Misión</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{grupo.mision}</p>
          </section>

          <section className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Descripción</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{grupo.descripcion}</p>
          </section>

          {coordinador && (
            <section className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Coordinador</h2>
              <div className="mt-1.5 flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                  {coordinador.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-slate-800">{coordinador.nombre}</p>
                  <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                    <HiOutlineEnvelope className="h-3.5 w-3.5" />
                    {grupo.coordinadorCuenta}@unah.hn
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Actividades recientes</h2>
            <div className="mt-1.5 flex flex-col gap-2">
              {actividadesRecientes.length === 0 && (
                <p className="text-[12.5px] text-slate-400">Este grupo aún no registra actividades.</p>
              )}
              {actividadesRecientes.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-bold text-slate-800">{a.nombre}</p>
                    <p className="text-[11px] text-slate-400">{a.fecha}</p>
                  </div>
                  <EstadoBadge estado={a.estado} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        {yaEsMiembro ? (
          <p className="text-center text-sm font-semibold text-slate-400">Ya eres miembro de este grupo</p>
        ) : solicitudEnviada ? (
          <p className="text-center text-sm font-semibold text-emerald-600">✓ Solicitud enviada</p>
        ) : (
          <button
            type="button"
            onClick={() => setSolicitudEnviada(true)}
            className="w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark"
          >
            Solicitar unirme
          </button>
        )}
      </footer>
    </div>
  );
}
