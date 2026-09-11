import BarraApilada from "../../../components/procad/BarraApilada";
import BarrasComparativas from "../../../components/procad/BarrasComparativas";
import CifraDestacada from "../../../components/procad/CifraDestacada";
import Leyenda from "../../../components/procad/Leyenda";
import Medidor from "../../../components/procad/Medidor";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import { COLOR_TIPO } from "../../../components/procad/paleta";
import { muestraPct } from "../../../utils/procadMetricas";
import type { ContextoSeccion } from "./contexto";
import { equidadYPermanencia, participacionPorCarrera } from "./datos";

// E · Equidad y permanencia. Quién participa y quién se queda.

// Reusa el par categórico ya validado: son dos grupos sin orden natural, igual
// que deportivo y artístico, no una escala de magnitud.
const COLOR_MUJERES = COLOR_TIPO.deportivo;
const COLOR_HOMBRES = COLOR_TIPO.artistico;

export default function SeccionE({ ctx }: { ctx: ContextoSeccion }) {
  const e = equidadYPermanencia(ctx);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <TarjetaEstadistica numero="23" titulo="Participación por sexo">
        <Leyenda
          entradas={[
            { color: COLOR_MUJERES, label: "Mujeres" },
            { color: COLOR_HOMBRES, label: "Hombres" },
          ]}
        />
        <BarraApilada
          alta
          total={e.estudiantes}
          segmentos={[
            { valor: e.mujeres, color: COLOR_MUJERES, label: "Mujeres" },
            { valor: e.hombres, color: COLOR_HOMBRES, label: "Hombres" },
          ]}
        />
        <p className="mt-3.5 text-xs text-slate-500">
          {muestraPct(e.pctMujeres)} mujeres · {muestraPct(e.pctHombres)} hombres
        </p>
      </TarjetaEstadistica>

      <TarjetaEstadistica numero="25" titulo="Retención">
        <div className="flex flex-wrap items-center gap-5">
          <Medidor pct={e.retencion} etiquetaAccesible="Retención de integrantes" />
          <p className="min-w-[180px] flex-1 text-xs leading-relaxed text-slate-500">
            {e.expulsiones} expulsiones aprobadas sobre {e.estudiantes} integrantes. Cuenta solo las
            que el administrador llegó a autorizar, no las que el entrenador solicitó.
          </p>
        </div>
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="24"
        titulo="Participación por carrera"
        nota="De qué carreras vienen los integrantes aprobados."
        ancha
      >
        <BarrasComparativas filas={participacionPorCarrera(ctx)} modo="conteo" />
      </TarjetaEstadistica>

      <TarjetaEstadistica
        numero="26"
        titulo="Estudiantes PROSENE dentro de los elegibles"
        nota="Beneficiarios PROSENE, elegibles aunque no alcancen el mínimo de actividades."
        ancha
      >
        <CifraDestacada
          valor={String(e.prosene)}
          nota={`Son el ${muestraPct(e.pctProsene)} de los integrantes del filtro.`}
        >
          <BarrasComparativas
            filas={[{ nombre: "PROSENE sobre el total de integrantes", valor: e.pctProsene }]}
            modo="porcentaje"
            semantica="neutra"
          />
        </CifraDestacada>
      </TarjetaEstadistica>
    </div>
  );
}
