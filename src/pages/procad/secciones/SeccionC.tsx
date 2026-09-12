import BarraApilada from "../../../components/procad/BarraApilada";
import BarraEnCelda from "../../../components/procad/BarraEnCelda";
import BarrasComparativas from "../../../components/procad/BarrasComparativas";
import Leyenda from "../../../components/procad/Leyenda";
import SinDatos from "../../../components/procad/SinDatos";
import TablaDatos from "../../../components/procad/TablaDatos";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import { COLOR_TIPO, ETIQUETA_TIPO } from "../../../components/procad/paleta";
import RejillaAnimada from "../../../components/procad/RejillaAnimada";
import type { ContextoSeccion } from "./contexto";
import {
  actividadesPorCentro,
  distribucionPorTipo,
  estudiantesPorAgrupacion,
  gruposPorCentro,
} from "./datos";

// C · Cobertura territorial. Dónde está el programa y cómo se reparte entre los
// centros regionales.

const LEYENDA_TIPOS = [
  { color: COLOR_TIPO.deportivo, label: ETIQUETA_TIPO.deportivo },
  { color: COLOR_TIPO.artistico, label: ETIQUETA_TIPO.artistico },
];

export default function SeccionC({ ctx }: { ctx: ContextoSeccion }) {
  const { centros } = ctx;
  const distribucion = distribucionPorTipo(ctx);

  return (
    <RejillaAnimada className="grid gap-5 lg:grid-cols-2">
      <TarjetaEstadistica numero="13" titulo="Estudiantes por agrupación">
        <BarrasComparativas filas={estudiantesPorAgrupacion(ctx)} modo="conteo" />
      </TarjetaEstadistica>

      <TarjetaEstadistica numero="14" titulo="Grupos por centro regional">
        <BarrasComparativas filas={gruposPorCentro(ctx)} modo="conteo" />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="15"
        titulo="Actividades por centro regional"
        nota="Solo actividades validadas."
      >
        <BarrasComparativas filas={actividadesPorCentro(ctx)} modo="conteo" />
      </TarjetaEstadistica>

      <TarjetaEstadistica numero="18" titulo="Distribución deportivo frente a artístico">
        <Leyenda entradas={LEYENDA_TIPOS} />
        <BarraApilada
          alta
          total={distribucion.total}
          segmentos={[
            {
              valor: distribucion.estudiantesDeportivo,
              color: COLOR_TIPO.deportivo,
              label: ETIQUETA_TIPO.deportivo,
            },
            {
              valor: distribucion.estudiantesArtistico,
              color: COLOR_TIPO.artistico,
              label: ETIQUETA_TIPO.artistico,
            },
          ]}
        />
        <p className="mt-3.5 text-xs text-slate-500">
          {distribucion.gruposDeportivo} agrupaciones deportivas ·{" "}
          {distribucion.gruposArtistico} artísticas
        </p>
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="16"
        titulo="Composición de estudiantes por centro"
        nota="Qué tan equilibrado está cada campus entre lo deportivo y lo artístico."
        ancha
      >
        <Leyenda entradas={LEYENDA_TIPOS} />
        {centros.length === 0 ? (
          <SinDatos />
        ) : (
          <ul className="flex flex-col gap-3.5">
            {centros.map((c) => (
              <li key={c.nombre}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] text-slate-600">{c.nombre}</span>
                  <span
                    className="shrink-0 text-xs font-bold text-slate-500"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {c.estudiantes}
                  </span>
                </div>
                <div className="mt-1.5">
                  <BarraApilada
                    total={c.estudiantes}
                    segmentos={[
                      {
                        valor: c.estudiantesDeportivo,
                        color: COLOR_TIPO.deportivo,
                        label: `${ETIQUETA_TIPO.deportivo} · ${c.nombre}`,
                      },
                      {
                        valor: c.estudiantesArtistico,
                        color: COLOR_TIPO.artistico,
                        label: `${ETIQUETA_TIPO.artistico} · ${c.nombre}`,
                      },
                    ]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </TarjetaEstadistica>

      <TarjetaEstadistica numero="17" titulo="Resumen por centro" ancha>
        <TablaDatos
          anchoMinimo="640px"
          columnas={[
            { label: "Centro regional" },
            { label: "Grupos", numerica: true },
            { label: "Estudiantes", numerica: true },
            { label: "Actividades", numerica: true },
            { label: "% elegibilidad", numerica: true },
          ]}
          filas={centros.map((c) => [
            c.nombre,
            c.grupos,
            c.estudiantes,
            c.actividades,
            <BarraEnCelda key={`elegibilidad-${c.nombre}`} pct={c.elegibilidad} />,
          ])}
        />
      </TarjetaEstadistica>
    </RejillaAnimada>
  );
}
