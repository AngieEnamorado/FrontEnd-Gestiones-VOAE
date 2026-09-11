import BarrasComparativas from "../../../components/procad/BarrasComparativas";
import EmbudoAcceso from "../../../components/procad/EmbudoAcceso";
import Medidor from "../../../components/procad/Medidor";
import TablaDatos from "../../../components/procad/TablaDatos";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import { COLOR_ESTADO, ETIQUETA_ESTADO } from "../../../components/procad/paleta";
import { INDICE_MINIMO } from "../../../data/mockProcadEstadisticas";
import { muestraPct } from "../../../utils/procadMetricas";
import type { ContextoSeccion } from "./contexto";
import { aprobacionPorCampus, desgloseEstados, pasosDelRecorrido, razonesDeAcceso } from "./datos";

// D · Acceso al programa. El recorrido completo, desde el estudiante que abre el
// portal hasta el que queda aprobado como integrante.

export default function SeccionD({ ctx }: { ctx: ContextoSeccion }) {
  const pasos = pasosDelRecorrido(ctx);
  const estados = desgloseEstados(ctx);
  const razones = razonesDeAcceso(ctx);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <TarjetaEstadistica
        numero="19"
        titulo="Recorrido de acceso al programa"
        nota="Consultó el portal → cumple el índice → envía solicitud → (a veces) citado a visoría → aprobado. Pase el cursor sobre cada paso para ver su conversión y su caída."
        ancha
      >
        <EmbudoAcceso pasos={pasos} idDestacado="aprobados" />

        <p className="mb-3 mt-5 text-xs font-semibold text-slate-600">
          Desglose de las solicitudes enviadas, por estado:
        </p>
        <TablaDatos
          anchoMinimo="420px"
          columnas={[
            { label: "Estado" },
            { label: "Solicitudes", numerica: true },
            { label: "%", numerica: true },
          ]}
          filas={estados.map((e) => [
            <span key={`estado-${e.estado}`} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLOR_ESTADO[e.estado] }}
              />
              {ETIQUETA_ESTADO[e.estado]}
            </span>,
            e.valor,
            muestraPct(e.pct),
          ])}
        />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="20"
        titulo="Tasa de aprobación de solicitudes, por campus"
        nota="Aprobadas ÷ solicitudes enviadas en ese campus."
        ancha
      >
        <BarrasComparativas filas={aprobacionPorCampus(ctx)} modo="porcentaje" />
      </TarjetaEstadistica>

      <TarjetaEstadistica numero="21" titulo="Aspirantes que cumplen el índice mínimo">
        <div className="flex flex-wrap items-center gap-5">
          <Medidor
            pct={razones.pctCumplenIndice}
            etiquetaAccesible="Aspirantes que cumplen el índice mínimo"
          />
          <p className="min-w-[180px] flex-1 text-xs leading-relaxed text-slate-500">
            De {razones.aspirantes} estudiantes que consultaron el portal, los que alcanzan el{" "}
            {INDICE_MINIMO}% y pueden enviar solicitud. El resto solo puede ver el listado de
            agrupaciones.
          </p>
        </div>
      </TarjetaEstadistica>

      <TarjetaEstadistica numero="22" titulo="Cobertura de visorías">
        <div className="flex flex-wrap items-center gap-5">
          <Medidor pct={razones.pctVisorias} etiquetaAccesible="Cobertura de visorías" />
          <p className="min-w-[180px] flex-1 text-xs leading-relaxed text-slate-500">
            Citados a visoría ÷ estudiantes que consultaron el portal. Las agrupaciones que no hacen
            visoría aprueban por requisitos, así que un valor bajo no es por sí mismo un problema.
          </p>
        </div>
      </TarjetaEstadistica>
    </div>
  );
}
