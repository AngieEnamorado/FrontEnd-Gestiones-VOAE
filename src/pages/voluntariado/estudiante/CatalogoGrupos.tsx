import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMapPin } from "react-icons/hi2";
import ChipFiltro from "../../../components/voluntariado/ChipFiltro";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { gruposVoluntariado } from "../../../data/mockGruposVoluntariado";
import { campus, redesTematicas, nombreCampus, redPorId } from "../../../data/mockCatalogosVoluntariado";

export default function CatalogoGrupos() {
  const [filtroCampus, setFiltroCampus] = useState<string | null>(null);
  const [filtroRed, setFiltroRed] = useState<string | null>(null);

  const grupos = useMemo(
    () =>
      gruposVoluntariado.filter(
        (g) =>
          (!filtroCampus || g.campusId === filtroCampus) &&
          (!filtroRed || g.redesIds.includes(filtroRed)),
      ),
    [filtroCampus, filtroRed],
  );

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 pb-3 pt-4">
        <h1 className="text-[17px] font-bold text-slate-800">Catálogo de grupos</h1>

        <div className="scrollbar-thin mt-3 flex gap-2 overflow-x-auto pb-1">
          {campus.map((c) => (
            <ChipFiltro
              key={c.id}
              label={c.nombre}
              activo={filtroCampus === c.id}
              onClick={() => setFiltroCampus((prev) => (prev === c.id ? null : c.id))}
              colorActivo="navy"
            />
          ))}
        </div>
        <div className="scrollbar-thin mt-2 flex gap-2 overflow-x-auto pb-1">
          {redesTematicas.map((r) => (
            <ChipFiltro
              key={r.id}
              label={r.nombre}
              activo={filtroRed === r.id}
              onClick={() => setFiltroRed((prev) => (prev === r.id ? null : r.id))}
              colorActivo="orange"
            />
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {grupos.length === 0 && (
          <div className="mt-10 flex flex-col items-center text-center">
            <p className="text-sm text-slate-500">Ningún grupo coincide con los filtros seleccionados.</p>
            <button
              type="button"
              onClick={() => {
                setFiltroCampus(null);
                setFiltroRed(null);
              }}
              className="mt-2 text-sm font-semibold text-unah-orange"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {grupos.map((grupo) => (
          <Link
            key={grupo.id}
            to={`/voluntariado/portal-estudiante/grupos/${grupo.id}`}
            className="rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <LogoGrupo iniciales={grupo.logoIniciales} color={grupo.logoColor} tamano="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-slate-800">{grupo.nombre}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <HiOutlineMapPin className="h-3.5 w-3.5" />
                  {nombreCampus(grupo.campusId)}
                </p>
              </div>
            </div>

            <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">{grupo.descripcion}</p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {grupo.redesIds.map((redId) => {
                const red = redPorId(redId);
                if (!red) return null;
                return (
                  <span
                    key={redId}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${claseChipColor[red.color]}`}
                  >
                    {red.nombre}
                  </span>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-[11px] text-slate-400">{grupo.miembros.length} miembros</span>
              <span className="text-[11px] font-semibold text-unah-orange">Ver más ›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
