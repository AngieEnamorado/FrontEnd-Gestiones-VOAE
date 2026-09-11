import BotonAccion from "../../../components/procad/BotonAccion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";
import type { EstadoActividadProcad } from "../../../types";

const ETIQUETA: Record<EstadoActividadProcad, string> = {
  PENDIENTE_VALIDACION: "Pendiente de validar",
  VALIDADA: "Validada",
  RECHAZADA: "Rechazada",
};

const TONO = {
  PENDIENTE_VALIDACION: "pendiente",
  VALIDADA: "activo",
  RECHAZADA: "negativo",
} as const;

/**
 * Las actividades que reportan los encargados. Solo las validadas cuentan para
 * la elegibilidad del estudiante, así que validar aquí mueve las cifras de
 * todo el programa.
 */
export default function Actividades({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { actividades, resolverActividad } = useProcad();

  function confirmar(id: number, titulo: string, grupo: string, estado: EstadoActividadProcad) {
    const valida = estado === "VALIDADA";
    abrirDialogo({
      titulo: valida ? `¿Validar «${titulo}»?` : `¿Rechazar «${titulo}»?`,
      descripcion: valida
        ? `Agrupación: ${grupo}. Al validarla, la asistencia de esta actividad empieza a contar para la elegibilidad de sus integrantes.`
        : `Agrupación: ${grupo}. Al rechazarla, no cuenta para la elegibilidad de nadie.`,
      confirmar: "Sí, confirmar",
      tono: valida ? "aprobar" : "rechazar",
      onConfirmar: () => resolverActividad(id, estado),
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <TablaDatos
        anchoMinimo="900px"
        columnas={[
          { label: "Actividad" },
          { label: "Agrupación" },
          { label: "Fecha" },
          { label: "Inscritos", numerica: true },
          { label: "Estado" },
          { label: "Acciones" },
        ]}
        filas={actividades.map((a) => [
          <span key={`t-${a.id}`} className="font-medium text-slate-700">
            {a.titulo}
          </span>,
          a.grupo,
          a.fecha,
          a.inscritos,
          <PildoraEstado key={`e-${a.id}`} tono={TONO[a.estado]}>
            {ETIQUETA[a.estado]}
          </PildoraEstado>,
          a.estado === "PENDIENTE_VALIDACION" ? (
            <span key={`a-${a.id}`} className="flex flex-wrap gap-1.5">
              <BotonAccion
                tono="aprobar"
                onClick={() => confirmar(a.id, a.titulo, a.grupo, "VALIDADA")}
              >
                Validar
              </BotonAccion>
              <BotonAccion
                tono="rechazar"
                onClick={() => confirmar(a.id, a.titulo, a.grupo, "RECHAZADA")}
              >
                Rechazar
              </BotonAccion>
            </span>
          ) : (
            <span key={`a-${a.id}`} className="text-xs italic text-slate-400">
              Ya resuelta
            </span>
          ),
        ])}
      />
    </div>
  );
}
