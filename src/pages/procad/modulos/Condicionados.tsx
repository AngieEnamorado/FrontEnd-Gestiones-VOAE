import BotonAccion from "../../../components/procad/BotonAccion";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";

/**
 * Excepción de talento: un encargado propone a un estudiante cuyo índice no
 * alcanza el mínimo. El administrador es la segunda firma — sin ella la
 * solicitud no puede quedar aprobada.
 */
export default function Condicionados({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { condicionados, resolverCondicionado } = useProcad();

  function confirmar(id: number, nombre: string, propone: string, autorizar: boolean) {
    abrirDialogo({
      titulo: autorizar
        ? `¿Autorizar a ${nombre} como condicionado?`
        : `¿Rechazar la propuesta para ${nombre}?`,
      descripcion: autorizar
        ? `Propuesto por ${propone}. Al autorizar, su solicitud queda aprobada con la doble firma completa.`
        : `Propuesto por ${propone}. La propuesta no procede y la solicitud sigue su curso normal.`,
      confirmar: autorizar ? "Sí, autorizar" : "Sí, rechazar",
      tono: autorizar ? "aprobar" : "rechazar",
      nota: "Usted queda registrado como la segunda firma de esta decisión.",
      onConfirmar: () => resolverCondicionado(id, autorizar),
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <TablaDatos
        anchoMinimo="900px"
        columnas={[
          { label: "Estudiante" },
          { label: "Cuenta" },
          { label: "Agrupación" },
          { label: "Propuesto por" },
          { label: "Justificación" },
          { label: "Acciones" },
        ]}
        filas={condicionados.map((c) => [
          <span key={`n-${c.id}`} className="font-medium text-slate-700">
            {c.nombre}
          </span>,
          <span key={`c-${c.id}`} className="font-mono text-xs">
            {c.cuenta}
          </span>,
          c.grupo,
          c.propone,
          <span key={`j-${c.id}`} className="block max-w-[280px] whitespace-normal leading-relaxed">
            {c.justificacion}
          </span>,
          <span key={`a-${c.id}`} className="flex flex-wrap gap-1.5">
            <BotonAccion
              tono="aprobar"
              onClick={() => confirmar(c.id, c.nombre, c.propone, true)}
            >
              Autorizar
            </BotonAccion>
            <BotonAccion
              tono="rechazar"
              onClick={() => confirmar(c.id, c.nombre, c.propone, false)}
            >
              Rechazar
            </BotonAccion>
          </span>,
        ])}
      />
      {condicionados.length === 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Cuando un encargado proponga una excepción de talento, aparecerá aquí esperando su firma.
        </p>
      )}
    </div>
  );
}
