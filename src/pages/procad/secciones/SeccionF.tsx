import LineaTendencia from "../../../components/procad/LineaTendencia";
import SinDatos from "../../../components/procad/SinDatos";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import type { ContextoSeccion } from "./contexto";
import { ETIQUETAS_PERIODO, ETIQUETAS_PERIODO_CORTAS, seriesDeTendencia } from "./datos";

// F · Tendencia. Cómo evolucionó el filtro actual entre períodos.

export default function SeccionF({ ctx }: { ctx: ContextoSeccion }) {
  const { datos, indicePeriodo } = ctx;

  if (datos.length === 0) {
    return (
      <div className="grid gap-5">
        <TarjetaEstadistica numero="27" titulo="Evolución del porcentaje de elegibilidad" ancha>
          <SinDatos />
        </TarjetaEstadistica>
      </div>
    );
  }

  const series = seriesDeTendencia(ctx);

  return (
    <div className="grid gap-5">
      <TarjetaEstadistica
        numero="27"
        titulo="Evolución del porcentaje de elegibilidad entre períodos"
        nota="El punto marcado es el período seleccionado en los filtros."
        ancha
      >
        <LineaTendencia
          serie={series.elegibilidad}
          etiquetas={ETIQUETAS_PERIODO_CORTAS}
          etiquetasLargas={ETIQUETAS_PERIODO}
          indiceActivo={indicePeriodo}
          esPorcentaje
          ariaLabel="Evolución del porcentaje de elegibilidad entre períodos"
        />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="28"
        titulo="Evolución de estudiantes inscritos y actividades"
        nota="Dos escalas distintas, dos gráficos: superponerlas en un eje doble sugeriría una relación que los datos no afirman."
        ancha
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-500">Estudiantes inscritos</p>
            <LineaTendencia
              serie={series.estudiantes}
              etiquetas={ETIQUETAS_PERIODO_CORTAS}
              etiquetasLargas={ETIQUETAS_PERIODO}
              indiceActivo={indicePeriodo}
              unidad="estudiantes"
              alto={200}
              ariaLabel="Evolución de estudiantes inscritos"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-bold text-slate-500">Actividades validadas</p>
            <LineaTendencia
              serie={series.actividades}
              etiquetas={ETIQUETAS_PERIODO_CORTAS}
              etiquetasLargas={ETIQUETAS_PERIODO}
              indiceActivo={indicePeriodo}
              unidad="actividades"
              alto={200}
              ariaLabel="Evolución de actividades validadas"
            />
          </div>
        </div>
      </TarjetaEstadistica>
    </div>
  );
}
