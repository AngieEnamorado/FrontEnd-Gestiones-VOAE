import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMapPin } from "react-icons/hi2";
import ChipFiltro from "../../../components/voluntariado/ChipFiltro";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { voluntariadoApi } from "../../../api/voluntariado";
import { catalogoApi } from "../../../api/catalogo";
import { useApi } from "../../../utils/useApi";
import { colorDeGrupo, colorDeRed, iniciales, listaDeIds } from "../../../utils/voluntariado";

export default function CatalogoGrupos() {
  const [filtroCampus, setFiltroCampus] = useState<number | null>(null);
  const [filtroRed, setFiltroRed] = useState<number | null>(null);
  const carga = useApi(
    () => Promise.all([voluntariadoApi.grupos(), voluntariadoApi.catalogos(), catalogoApi.campus()]),
    [],
  );
  const [todos, catalogos, campus] = carga.datos ?? [[], undefined, []];

  // Solo los campus que tienen algún grupo: los demás darían un filtro vacío.
  const campusConGrupos = useMemo(() => {
    const ids = new Set(todos.flatMap((g) => listaDeIds(g.idsCampus)));
    return campus.filter((c) => ids.has(c.idCampus));
  }, [todos, campus]);

  const grupos = todos.filter(
    (g) =>
      (!filtroCampus || listaDeIds(g.idsCampus).includes(filtroCampus)) &&
      (!filtroRed || listaDeIds(g.idsRedesTematicas).includes(filtroRed)),
  );
  const redes = catalogos?.redes ?? [];

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 pb-3 pt-4">
        <h1 className="text-[17px] font-bold text-slate-800">Catálogo de grupos</h1>

        <div className="scrollbar-thin mt-3 flex gap-2 overflow-x-auto pb-1">
          {campusConGrupos.map((c) => (
            <ChipFiltro
              key={c.idCampus}
              label={c.codigoCortoCampus}
              activo={filtroCampus === c.idCampus}
              onClick={() => setFiltroCampus((prev) => (prev === c.idCampus ? null : c.idCampus))}
              colorActivo="navy"
            />
          ))}
        </div>
        <div className="scrollbar-thin mt-2 flex gap-2 overflow-x-auto pb-1">
          {redes.map((r) => (
            <ChipFiltro
              key={r.idRedTematica}
              label={r.nombreRedTematica}
              activo={filtroRed === r.idRedTematica}
              onClick={() => setFiltroRed((prev) => (prev === r.idRedTematica ? null : r.idRedTematica))}
              colorActivo="orange"
            />
          ))}
        </div>
      </header>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
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
              key={grupo.idGrupo}
              to={`/voluntariado/portal-estudiante/grupos/${grupo.idGrupo}`}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <LogoGrupo iniciales={iniciales(grupo.nombreGrupo)} color={colorDeGrupo(grupo.idGrupo)} tamano="lg" url={grupo.urlLogo} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-slate-800">{grupo.nombreGrupo}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <HiOutlineMapPin className="h-3.5 w-3.5" />
                    {grupo.campus}
                  </p>
                </div>
              </div>

              <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">{grupo.descripcionGrupo}</p>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {listaDeIds(grupo.idsRedesTematicas).map((idRed) => {
                  const red = redes.find((r) => r.idRedTematica === idRed);
                  if (!red) return null;
                  return (
                    <span
                      key={idRed}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${claseChipColor[colorDeRed(idRed)]}`}
                    >
                      {red.nombreRedTematica}
                    </span>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span className="text-[11px] text-slate-400">{grupo.totalMiembros} miembros</span>
                <span className="text-[11px] font-semibold text-unah-orange">Ver más ›</span>
              </div>
            </Link>
          ))}
        </div>
      </EstadoCarga>
    </div>
  );
}
