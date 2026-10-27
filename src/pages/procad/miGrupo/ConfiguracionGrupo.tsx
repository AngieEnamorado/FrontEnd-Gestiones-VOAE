import { useState } from "react";
import { guardarConfiguracionGrupo, listarConfiguracionGrupo } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import { Campo, PanelFormulario } from "../../../components/procad/CamposFormulario";
import { CLASE_CAMPO } from "../../../components/procad/formatoProcad";
import type { ConfiguracionGrupoApi, GrupoApi } from "../../../types/procad";
import type { Ejecutar } from "./ejecutar";

/**
 * La regla con la que se decide, al cerrar el período, quién del grupo es
 * elegible para la matrícula preferencial. Un grupo deportivo se mide por el
 * porcentaje de entrenamientos a los que asistió; uno artístico, por cuántas
 * actividades hizo. La base rechaza mezclar las dos.
 */
export default function ConfiguracionGrupo({
  grupo,
  idPeriodo,
  ejecutar,
}: {
  grupo: GrupoApi;
  idPeriodo: number;
  ejecutar: Ejecutar;
}) {
  const consulta = useConsulta(() => listarConfiguracionGrupo(grupo.idGrupo, idPeriodo), [grupo.idGrupo, idPeriodo]);

  if (consulta.error) return <p className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{consulta.error}</p>;
  if (consulta.cargando && !consulta.datos) {
    return <p className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">Cargando configuración…</p>;
  }

  const actual = consulta.datos?.[0] ?? null;
  // La `key` vuelve a llenar el formulario con lo guardado después de cada cambio.
  return (
    <Formulario
      key={actual ? `${actual.idConfiguracion}-${actual.minimoActividades}-${actual.porcentajeMinimoEntrenamientos}` : "nueva"}
      grupo={grupo}
      idPeriodo={idPeriodo}
      actual={actual}
      ejecutar={ejecutar}
      onGuardada={consulta.recargar}
    />
  );
}

function Formulario({
  grupo,
  idPeriodo,
  actual,
  ejecutar,
  onGuardada,
}: {
  grupo: GrupoApi;
  idPeriodo: number;
  actual: ConfiguracionGrupoApi | null;
  ejecutar: Ejecutar;
  onGuardada: () => void;
}) {
  const deportivo = grupo.tipoGrupo === "deportivo";
  const [porcentaje, setPorcentaje] = useState(String(actual?.porcentajeMinimoEntrenamientos ?? ""));
  const [minimo, setMinimo] = useState(String(actual?.minimoActividades ?? ""));
  const [porMes, setPorMes] = useState(String(actual?.minimoActividadesPorMes ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    const valor = Number(deportivo ? porcentaje : minimo);
    if (!Number.isInteger(valor) || valor < 1 || (deportivo && valor > 100)) {
      setError(deportivo ? "Un porcentaje entero entre 1 y 100." : "Un número entero de 1 en adelante.");
      return;
    }
    setError(null);
    setEnviando(true);
    await ejecutar(
      () =>
        guardarConfiguracionGrupo({
          idGrupo: grupo.idGrupo,
          idPeriodo,
          ...(deportivo
            ? { porcentajeMinimoEntrenamientos: valor }
            : { minimoActividades: valor, minimoActividadesPorMes: porMes ? Number(porMes) : undefined }),
        }),
      "Guardó la regla de elegibilidad del período.",
      onGuardada,
    );
    setEnviando(false);
  }

  return (
    <PanelFormulario
      titulo={actual ? "Regla de elegibilidad del período" : "Este período aún no tiene regla"}
      descripcion={
        deportivo
          ? "Al cerrar el período, entra a la lista preferencial quien haya asistido al menos a este porcentaje de los entrenamientos validados."
          : "Al cerrar el período, entra a la lista preferencial quien haya participado al menos en esta cantidad de actividades validadas."
      }
      onEnviar={enviar}
      enviando={enviando}
      textoEnviar="Guardar"
    >
      {deportivo ? (
        <Campo etiqueta="Asistencia mínima a entrenamientos (%)" error={error} className="max-w-xs">
          <input type="number" min={1} max={100} value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} className={CLASE_CAMPO} />
        </Campo>
      ) : (
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <Campo etiqueta="Actividades mínimas en el período" error={error}>
            <input type="number" min={1} value={minimo} onChange={(e) => setMinimo(e.target.value)} className={CLASE_CAMPO} />
          </Campo>
          <Campo etiqueta="Mínimo por mes" opcional ayuda="Ej. 2 = al menos dos al mes.">
            <input type="number" min={1} value={porMes} onChange={(e) => setPorMes(e.target.value)} className={CLASE_CAMPO} />
          </Campo>
        </div>
      )}
    </PanelFormulario>
  );
}
