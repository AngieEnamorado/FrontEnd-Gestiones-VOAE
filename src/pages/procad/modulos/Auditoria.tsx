import TablaDatos from "../../../components/procad/TablaDatos";
import { useProcad } from "../../../context/ProcadContext";

/**
 * Quién hizo qué y cuándo. Cada decisión que se toma en los demás módulos se
 * anota aquí en el momento, con el nombre de quien la tomó.
 */
export default function Auditoria() {
  const { auditoria } = useProcad();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <TablaDatos
        anchoMinimo="760px"
        columnas={[
          { label: "Fecha" },
          { label: "Actor" },
          { label: "Acción" },
          { label: "Detalle" },
        ]}
        filas={auditoria.map((r, i) => [
          <span key={`f-${i}`} className="whitespace-nowrap text-xs">
            {r.fecha}
          </span>,
          r.actor,
          <span key={`a-${i}`} className="font-medium text-slate-700">
            {r.accion}
          </span>,
          <span key={`d-${i}`} className="block max-w-[360px] whitespace-normal">
            {r.detalle}
          </span>,
        ])}
      />
    </div>
  );
}
