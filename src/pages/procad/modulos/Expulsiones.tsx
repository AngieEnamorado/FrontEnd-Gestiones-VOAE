import BotonAccion from "../../../components/procad/BotonAccion";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";

/**
 * Solo el administrador resuelve una expulsión, y la decisión queda en firme:
 * no hay apelación. Por eso el diálogo lo dice antes de confirmar.
 */
export default function Expulsiones({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { expulsiones, resolverExpulsion } = useProcad();

  function confirmar(id: number, nombre: string, motivo: string, aprobar: boolean) {
    abrirDialogo({
      titulo: aprobar ? `¿Aprobar la expulsión de ${nombre}?` : `¿Rechazar la expulsión de ${nombre}?`,
      descripcion: aprobar
        ? `Motivo: ${motivo}. Su solicitud pasará a Expulsado de inmediato.`
        : `Motivo: ${motivo}. La solicitud de expulsión queda cerrada, sin aplicarse.`,
      confirmar: aprobar ? "Sí, aprobar" : "Sí, rechazar",
      tono: aprobar ? "rechazar" : "aprobar",
      nota: "Esta decisión no admite apelación.",
      onConfirmar: () => resolverExpulsion(id, aprobar),
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <TablaDatos
        anchoMinimo="1000px"
        columnas={[
          { label: "Estudiante" },
          { label: "Cuenta" },
          { label: "Agrupación" },
          { label: "Solicitada por" },
          { label: "Motivo" },
          { label: "Detalle" },
          { label: "Acciones" },
        ]}
        filas={expulsiones.map((x) => [
          <span key={`n-${x.id}`} className="font-medium text-slate-700">
            {x.nombre}
          </span>,
          <span key={`c-${x.id}`} className="font-mono text-xs">
            {x.cuenta}
          </span>,
          x.grupo,
          x.solicita,
          x.motivo,
          <span key={`d-${x.id}`} className="block max-w-[240px] whitespace-normal leading-relaxed">
            {x.detalle}
          </span>,
          <span key={`a-${x.id}`} className="flex flex-wrap gap-1.5">
            <BotonAccion tono="rechazar" onClick={() => confirmar(x.id, x.nombre, x.motivo, true)}>
              Aprobar
            </BotonAccion>
            <BotonAccion tono="neutro" onClick={() => confirmar(x.id, x.nombre, x.motivo, false)}>
              Rechazar
            </BotonAccion>
          </span>,
        ])}
      />
      {expulsiones.length === 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Las solicitudes de expulsión que envíen los encargados aparecerán aquí sin resolver.
        </p>
      )}
    </div>
  );
}
