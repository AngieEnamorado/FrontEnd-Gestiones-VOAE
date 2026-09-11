import BarrasComparativas from "../../../components/procad/BarrasComparativas";
import DonaCategorias from "../../../components/procad/DonaCategorias";
import EmbudoAcceso from "../../../components/procad/EmbudoAcceso";
import Medidor from "../../../components/procad/Medidor";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import { COLOR_ESTADO, ETIQUETA_ESTADO } from "../../../components/procad/paleta";
import { INDICE_MINIMO } from "../../../data/mockProcadEstadisticas";
import RejillaAnimada from "../../../components/procad/RejillaAnimada";
import type { ContextoSeccion } from "./contexto";
import { aprobacionPorCampus, desgloseEstados, pasosDelRecorrido, razonesDeAcceso } from "./datos";

// D · Acceso al programa. El recorrido completo, desde el estudiante que abre el
// portal hasta el que queda aprobado como integrante.

export default function SeccionD({ ctx }: { ctx: ContextoSeccion }) {
  const pasos = pasosDelRecorrido(ctx);
  const estados = desgloseEstados(ctx);
  const razones = razonesDeAcceso(ctx);

  return (
    <RejillaAnimada className="grid items-start gap-5 lg:grid-cols-2">
      <TarjetaEstadistica
        numero="19"
        titulo="Recorrido de acceso al programa"
        nota="Consultó el portal → cumple el índice → envía solicitud → (a veces) citado a visoría → aprobado. Pase el cursor sobre cada paso para ver su conversión y su caída."
        ancha
      >
        <EmbudoAcceso pasos={pasos} idDestacado="aprobados" />

        <p className="mb-4 mt-6 text-xs font-semibold text-slate-600">
          Desglose de las solicitudes enviadas, por estado:
        </p>
        <DonaCategorias
          unidad="solicitudes"
          porciones={estados.map((e) => ({
            nombre: ETIQUETA_ESTADO[e.estado],
            valor: e.valor,
            color: COLOR_ESTADO[e.estado],
          }))}
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
    </RejillaAnimada>
  );
}
