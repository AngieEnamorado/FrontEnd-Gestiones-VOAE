import CifraDestacada from "../../../components/procad/CifraDestacada";
import ListaAviso from "../../../components/procad/ListaAviso";
import TablaDatos from "../../../components/procad/TablaDatos";
import TarjetaEstadistica from "../../../components/procad/TarjetaEstadistica";
import { MATRICULA_EXCEPCIONAL_TOTAL } from "../../../data/mockProcadEstadisticas";
import { escalarConteo } from "../../../utils/procadMetricas";
import RejillaAnimada from "../../../components/procad/RejillaAnimada";
import { useVisibilidadTarjetas } from "../visibilidadTarjetas";
import type { ContextoSeccion } from "./contexto";
import { casosEspeciales } from "./datos";

// G · Casos especiales. Las vías por las que alguien entra o se queda en el
// programa sin pasar por el camino normal.

function MiniCifra({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p
        className="text-2xl font-extrabold leading-none text-unah-navy"
        style={{ fontVariantNumeric: "proportional-nums" }}
      >
        {valor}
      </p>
      <p className="mt-2 text-xs font-semibold leading-snug text-slate-500">{etiqueta}</p>
    </div>
  );
}

export default function SeccionG({ ctx }: { ctx: ContextoSeccion }) {
  const { indicePeriodo } = ctx;
  const { condicionados, conCondicionados, externos, selecciones } = casosEspeciales(ctx);
  const { soloLectura } = useVisibilidadTarjetas();

  return (
    <div className="flex flex-col gap-5">
      {/* La fila de cifras resume el apartado entero, así que solo tiene
          sentido cuando el apartado está entero: en el reporte personalizado,
          donde puede haber una sola tarjeta elegida, no va. */}
      {!soloLectura && (
        <RejillaAnimada className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniCifra valor={condicionados} etiqueta="Condicionados por excepción de talento" />
          <MiniCifra valor={externos.length} etiqueta="Agrupaciones con colaborador externo" />
          <MiniCifra
            valor={MATRICULA_EXCEPCIONAL_TOTAL}
            etiqueta="Matrículas excepcionales otorgadas"
          />
          <MiniCifra valor={selecciones.length} etiqueta="Selecciones multi-campus activas" />
        </RejillaAnimada>
      )}

      <RejillaAnimada className="grid gap-5 lg:grid-cols-2">
        <TarjetaEstadistica
          numero="29"
          titulo="Agrupaciones con condicionados este período"
          nota="Cada condicionado quedó registrado con doble firma: el entrenador que lo propuso y el administrador que lo autorizó."
          ancha
        >
          <ListaAviso
            elementos={conCondicionados.map(
              (a) =>
                `${a.nombre} — ${escalarConteo(a.condicionados, indicePeriodo)} condicionado(s) este período`,
            )}
            mensajeTodoBien="Ninguna agrupación del filtro tiene condicionados activos."
          />
        </TarjetaEstadistica>

        <TarjetaEstadistica
          numero="30"
          titulo="Agrupaciones con colaborador externo"
          nota="Un colaborador externo no entra a la plataforma — el administrador actúa en el sistema por él."
          ancha
        >
          <ListaAviso
            tono="neutro"
            elementos={externos.map((a) => `${a.nombre} — dirigida por un colaborador externo`)}
            mensajeTodoBien="Ninguna agrupación del filtro depende de un colaborador externo."
          />
        </TarjetaEstadistica>

        <TarjetaEstadistica
          numero="31"
          titulo="Selecciones multi-campus"
          nota="Una selección reúne integrantes ya aprobados en su grupo de origen, sin importar el campus y sin crear una solicitud nueva."
          ancha
        >
          <TablaDatos
            anchoMinimo="520px"
            columnas={[
              { label: "Selección" },
              { label: "Campus administrativo" },
              { label: "Convocados", numerica: true },
            ]}
            filas={selecciones.map((s) => [
              s.nombre,
              s.centro,
              escalarConteo(s.estudiantes, indicePeriodo),
            ])}
          />
        </TarjetaEstadistica>

        <TarjetaEstadistica numero="32" titulo="Matrícula excepcional">
          <CifraDestacada
            valor={String(MATRICULA_EXCEPCIONAL_TOTAL)}
            nota="Elegibilidad otorgada por participar en algo puntual de VOAE, sin pertenecer a ninguna agrupación. No entra en los cálculos de elegibilidad de las secciones B a F, porque no depende de una agrupación."
          />
        </TarjetaEstadistica>

        <TarjetaEstadistica
          numero="33"
          titulo="Seguimiento a egresados del programa"
          etiqueta={
            <span className="ml-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 align-middle text-[9.5px] font-bold uppercase tracking-wide text-slate-500">
              Próximamente
            </span>
          }
        >
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3.5 text-[13px] leading-relaxed text-slate-500">
            Todavía no está definido cómo VOAE dará seguimiento a los estudiantes que egresan
            habiendo participado en PROCAD. En cuanto se confirme el formulario, esta tarjeta
            mostrará sus resultados agregados.
          </p>
        </TarjetaEstadistica>
      </RejillaAnimada>
    </div>
  );
}
