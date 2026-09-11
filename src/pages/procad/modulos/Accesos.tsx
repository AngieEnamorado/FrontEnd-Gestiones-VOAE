import BotonAccion from "../../../components/procad/BotonAccion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import type { EstadoPeriodoInscripcion } from "../../../types";

const ETIQUETA_PERIODO: Record<EstadoPeriodoInscripcion, string> = {
  activo: "Activo",
  programado: "Programado",
  cerrado: "Cerrado",
};

const TONO_PERIODO = {
  activo: "activo",
  programado: "pendiente",
  cerrado: "inactivo",
} as const;

/**
 * Quién entra al panel y cuándo se puede inscribir. Un colaborador externo
 * nunca recibe acceso: el administrador actúa en el sistema en su nombre.
 */
export default function Accesos({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { empleados, periodos, alternarAcceso, activarPeriodo, cerrarPeriodo } = useProcad();

  function confirmarActivar(label: string) {
    abrirDialogo({
      titulo: `¿Activar «${label}»?`,
      descripcion:
        "Solo puede haber un período de inscripción activo a la vez, así que el que está activo ahora se cerrará automáticamente.",
      confirmar: "Sí, activar",
      tono: "primario",
      onConfirmar: () => activarPeriodo(label),
    });
  }

  function confirmarCerrar(label: string) {
    abrirDialogo({
      titulo: `¿Cerrar «${label}»?`,
      descripcion: "Dejarán de recibirse solicitudes nuevas para este período.",
      confirmar: "Sí, cerrar",
      tono: "rechazar",
      nota: "Un período cerrado queda cerrado de forma definitiva: no puede volver a activarse.",
      onConfirmar: () => cerrarPeriodo(label),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-bold text-slate-800">Acceso al panel</h3>
        <p className="mb-4 mt-1.5 text-xs leading-relaxed text-slate-500">
          Solo el personal interno entra al panel. Un colaborador externo no tiene contrato con la
          universidad y nunca recibe acceso — el administrador actúa en el sistema en su nombre.
        </p>
        <TablaDatos
          anchoMinimo="900px"
          columnas={[
            { label: "Empleado" },
            { label: "Rol" },
            { label: "Centro" },
            { label: "Tipo" },
            { label: "Acceso" },
            { label: "Acciones" },
          ]}
          filas={empleados.map((e) => [
            <span key={`n-${e.nombre}`} className="font-medium text-slate-700">
              {e.nombre}
            </span>,
            e.rol,
            e.centro,
            <PildoraEstado key={`t-${e.nombre}`} tono={e.esColaboradorExterno ? "pendiente" : "activo"}>
              {e.esColaboradorExterno ? "Externo" : "Interno"}
            </PildoraEstado>,
            <PildoraEstado key={`a-${e.nombre}`} tono={e.acceso ? "activo" : "inactivo"}>
              {e.acceso ? "Concedido" : "Sin acceso"}
            </PildoraEstado>,
            // A un colaborador externo no se le ofrece el botón: la regla no
            // tiene excepciones, así que darle un control que siempre va a
            // negarse sería mentirle al administrador.
            e.esColaboradorExterno ? (
              <span key={`b-${e.nombre}`} className="text-xs italic text-slate-400">
                No aplica — colaborador externo
              </span>
            ) : (
              <BotonAccion
                key={`b-${e.nombre}`}
                tono={e.acceso ? "rechazar" : "aprobar"}
                onClick={() => alternarAcceso(e.nombre)}
              >
                {e.acceso ? "Revocar" : "Otorgar"}
              </BotonAccion>
            ),
          ])}
        />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h3 className="mb-4 text-base font-bold text-slate-800">Períodos de inscripción</h3>
        <TablaDatos
          anchoMinimo="520px"
          columnas={[{ label: "Período" }, { label: "Estado" }, { label: "Acciones" }]}
          filas={periodos.map((p) => [
            <span key={`p-${p.label}`} className="font-medium text-slate-700">
              {p.label}
            </span>,
            <PildoraEstado key={`e-${p.label}`} tono={TONO_PERIODO[p.estado]}>
              {ETIQUETA_PERIODO[p.estado]}
            </PildoraEstado>,
            p.estado === "programado" ? (
              <BotonAccion key={`a-${p.label}`} tono="primario" onClick={() => confirmarActivar(p.label)}>
                Activar
              </BotonAccion>
            ) : p.estado === "activo" ? (
              <BotonAccion key={`a-${p.label}`} tono="rechazar" onClick={() => confirmarCerrar(p.label)}>
                Cerrar período
              </BotonAccion>
            ) : (
              <span key={`a-${p.label}`} className="text-xs italic text-slate-400">
                Cerrado definitivamente
              </span>
            ),
          ])}
        />
      </div>
    </div>
  );
}
