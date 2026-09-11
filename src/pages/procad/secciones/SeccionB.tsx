import BarrasComparativas from "../../../components/procad/BarrasComparativas";
import Dispersion from "../../../components/procad/Dispersion";
import ListaAviso from "../../../components/procad/ListaAviso";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import type { ContextoSeccion } from "./contexto";
import {
  agrupacionesSinValidar,
  asistenciaPorAgrupacion,
  asistidasPorAgrupacion,
  cumplimientoPorAgrupacion,
  elegibilidadPorAgrupacion,
  puntosElegibilidadCumplimiento,
} from "./datos";

// B · Participación y cumplimiento. Responde cómo asisten y cómo cumplen las
// agrupaciones del filtro, una agrupación por fila.

export default function SeccionB({ ctx }: { ctx: ContextoSeccion }) {
  const { resaltada } = ctx;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <TarjetaEstadistica
        numero="7"
        titulo="Promedio de actividades asistidas por agrupación"
        nota="Asistencias confirmadas ÷ integrantes aprobados."
      >
        <BarrasComparativas filas={asistidasPorAgrupacion(ctx)} modo="conteo" decimales={1} />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="8"
        titulo="Elegibilidad por agrupación"
        nota={
          resaltada
            ? `Resaltando «${resaltada}» — el resto queda de fondo para comparar.`
            : "Porcentaje de integrantes que alcanzan la elegibilidad."
        }
      >
        <BarrasComparativas
          filas={elegibilidadPorAgrupacion(ctx)}
          modo="porcentaje"
          resaltada={resaltada}
        />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="9"
        titulo="Tasa de cumplimiento del mínimo"
        nota="Integrantes que alcanzan el mínimo de actividades exigido."
      >
        <BarrasComparativas filas={cumplimientoPorAgrupacion(ctx)} modo="porcentaje" />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="11"
        titulo="Tasa de asistencia"
        nota="Asistieron ÷ inscritos a actividades validadas."
      >
        <BarrasComparativas filas={asistenciaPorAgrupacion(ctx)} modo="porcentaje" />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="10"
        titulo="Elegibilidad frente a cumplimiento"
        nota="Cada punto es una agrupación. Abajo a la derecha están las que cumplen el índice pero no el mínimo de actividades."
        ancha
      >
        <Dispersion puntos={puntosElegibilidadCumplimiento(ctx)} />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="12"
        titulo="Agrupaciones activas sin actividades validadas"
        nota="Existen y tienen integrantes, pero no han registrado ni una actividad aprobada este período."
        ancha
      >
        <ListaAviso
          elementos={agrupacionesSinValidar(ctx)}
          mensajeTodoBien="Todas las agrupaciones del filtro tienen al menos una actividad validada."
        />
      </TarjetaEstadistica>
    </div>
  );
}
