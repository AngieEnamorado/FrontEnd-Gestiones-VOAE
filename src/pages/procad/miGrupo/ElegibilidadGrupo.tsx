import { etiquetaPeriodo } from "../../../api/adaptadoresProcad";
import {
  enviarListaPreferencial,
  generarListaPreferencial,
  listarListasPreferenciales,
  listarPeriodos,
  obtenerListaPreferencial,
} from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import AvatarIniciales from "../../../components/procad/AvatarIniciales";
import BotonAccion from "../../../components/procad/BotonAccion";
import { SinDato } from "../../../components/procad/BotonDecision";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { fechaCorta } from "../../../components/procad/formatoProcad";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import type { GrupoApi, ListaPreferencialApi, PeriodoApi } from "../../../types/procad";
import type { Ejecutar } from "./ejecutar";

/**
 * La lista preferencial: quiénes del grupo ganaron matrícula preferencial para
 * el período siguiente. La base decide quién es elegible (con la regla de
 * Configuración y las asistencias validadas); el director toma la foto y la
 * envía a Registro. Una vez enviada ya no cambia.
 */
export default function ElegibilidadGrupo({
  grupo,
  periodo,
  ejecutar,
  abrirDialogo,
}: {
  grupo: GrupoApi;
  periodo: PeriodoApi;
  ejecutar: Ejecutar;
  abrirDialogo: (d: Dialogo) => void;
}) {
  const listas = useConsulta(() => listarListasPreferenciales(grupo.idGrupo), [grupo.idGrupo]);
  const periodos = useConsulta(listarPeriodos, []);

  const deEstePeriodo = (listas.datos ?? []).find((l) => l.idPeriodoEvaluado === periodo.idPeriodo) ?? null;
  // La lista se aplica en el primer período que empieza después del evaluado.
  const siguiente =
    (periodos.datos ?? [])
      .filter((p) => p.estadoPeriodo && p.fechaInicioPeriodo && periodo.fechaInicioPeriodo && p.fechaInicioPeriodo > periodo.fechaInicioPeriodo)
      .sort((a, b) => (a.fechaInicioPeriodo ?? "").localeCompare(b.fechaInicioPeriodo ?? ""))[0] ?? null;
  const evaluado = etiquetaPeriodo(periodo.anioPeriodo, periodo.numeroPac);

  function generar() {
    if (!siguiente) return;
    const aplica = etiquetaPeriodo(siguiente.anioPeriodo, siguiente.numeroPac);
    abrirDialogo({
      titulo: `¿Generar la lista de ${evaluado}?`,
      descripcion: `Toma los elegibles de hoy según la regla de Configuración y las asistencias validadas. Se aplica en ${aplica}.`,
      confirmar: "Sí, generar",
      tono: "primario",
      nota: "Hay una sola lista por grupo y período. Revísela antes de enviarla: una vez enviada a Registro ya no cambia.",
      onConfirmar: () =>
        ejecutar(
          () =>
            generarListaPreferencial({
              idGrupo: grupo.idGrupo,
              idPeriodoEvaluado: periodo.idPeriodo,
              idPeriodoAplicacion: siguiente.idPeriodo,
            }),
          `Generó la lista preferencial de ${evaluado}.`,
          listas.recargar,
        ),
    });
  }

  function enviar(lista: ListaPreferencialApi) {
    abrirDialogo({
      titulo: "¿Enviar la lista a Registro?",
      descripcion: `${lista.cantidadElegibles} ${lista.cantidadElegibles === 1 ? "estudiante tendrá" : "estudiantes tendrán"} matrícula preferencial en ${etiquetaPeriodo(lista.anioAplicacion, lista.pacAplicacion)}.`,
      confirmar: "Sí, enviar",
      tono: "aprobar",
      nota: "Después de enviarla no se puede modificar.",
      onConfirmar: () => ejecutar(() => enviarListaPreferencial(lista.idLista), "Envió la lista preferencial a Registro.", listas.recargar),
    });
  }

  if (listas.error) return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{listas.error}</p>;
  if (listas.cargando && !listas.datos) {
    return <p className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">Cargando…</p>;
  }

  if (!deEstePeriodo) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-slate-800">Lista preferencial de {evaluado}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
          Todavía no se ha generado. Lo normal es hacerlo al cerrar el período, cuando ya estén validadas todas las
          actividades y pasadas las listas.
        </p>
        <div className="mt-4">
          {siguiente ? (
            <BotonAccion tono="primario" onClick={generar}>
              Generar lista
            </BotonAccion>
          ) : (
            <p className="text-xs text-amber-700">
              {periodos.cargando ? "Buscando el período siguiente…" : "No hay un período siguiente registrado en el catálogo: sin él no hay dónde aplicar la lista."}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <DetalleLista key={`${deEstePeriodo.idLista}-${deEstePeriodo.codigoEstado}`} lista={deEstePeriodo} onEnviar={enviar} />;
}

function DetalleLista({ lista, onEnviar }: { lista: ListaPreferencialApi; onEnviar: (l: ListaPreferencialApi) => void }) {
  const detalle = useConsulta(() => obtenerListaPreferencial(lista.idLista), [lista.idLista]);
  const enviada = lista.codigoEstado === "ENVIADA";

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Lista de {etiquetaPeriodo(lista.anioEvaluado, lista.pacEvaluado)} · se aplica en{" "}
            {etiquetaPeriodo(lista.anioAplicacion, lista.pacAplicacion)}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {lista.cantidadElegibles} {lista.cantidadElegibles === 1 ? "elegible" : "elegibles"} · generada el{" "}
            {fechaCorta(lista.fechaGeneracion)}
            {lista.fechaEnvio && ` · enviada el ${fechaCorta(lista.fechaEnvio)}`}
          </p>
        </div>
        <span className="flex items-center gap-2">
          <PildoraEstado tono={enviada ? "activo" : "pendiente"}>{enviada ? "Enviada" : "Sin enviar"}</PildoraEstado>
          {!enviada && (
            <BotonAccion tono="aprobar" onClick={() => onEnviar(lista)}>
              Enviar a Registro
            </BotonAccion>
          )}
        </span>
      </div>
      <ul className="divide-y divide-slate-100 px-5 py-3 sm:px-6">
        {(detalle.datos?.detalles ?? []).map((d) => {
          const nombre = [d.nombrePersona, d.apellidosPersona].filter(Boolean).join(" ") || `Cuenta ${d.numeroCuenta ?? ""}`;
          return (
            <li key={d.idListaDetalle} className="flex flex-wrap items-center gap-3 py-3">
              <AvatarIniciales nombre={nombre} />
              <span className="min-w-[220px] flex-1">
                <span className="block text-sm font-medium text-slate-700">{nombre}</span>
                <span className="block text-xs text-slate-400">{d.carreraEstudiante ?? ""}</span>
              </span>
              <span className="font-mono text-xs text-slate-500">{d.numeroCuenta}</span>
              <span className="w-32 text-right text-sm tabular-nums text-slate-600">
                {d.actividadesAsistidas === null ? <SinDato /> : `${d.actividadesAsistidas} asistencias`}
              </span>
            </li>
          );
        })}
        {!detalle.cargando && (detalle.datos?.detalles ?? []).length === 0 && (
          <li className="py-4 text-sm text-slate-500">Nadie del grupo cumplió la regla en este período.</li>
        )}
      </ul>
    </div>
  );
}
