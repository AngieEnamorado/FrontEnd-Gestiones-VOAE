import BotonAccion from "../../../components/procad/BotonAccion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";

/** El calendario de visorías del período: qué grupo prueba aspirantes y cuándo. */
export default function Visorias({ abrirDialogo }: { abrirDialogo: (d: Dialogo) => void }) {
  const { visorias, programarVisoria } = useProcad();

  function confirmar(id: number, grupo: string, fecha: string, hora: string, citados: number) {
    abrirDialogo({
      titulo: `¿Programar la visoría de ${grupo}?`,
      descripcion: `${fecha} · ${hora} · ${citados} citados. Al programarla, los aspirantes citados quedan notificados de la fecha.`,
      confirmar: "Sí, programar",
      tono: "primario",
      onConfirmar: () => programarVisoria(id),
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <TablaDatos
        anchoMinimo="900px"
        columnas={[
          { label: "Agrupación" },
          { label: "Centro" },
          { label: "Fecha" },
          { label: "Hora" },
          { label: "Citados", numerica: true },
          { label: "Estado" },
          { label: "Acciones" },
        ]}
        filas={visorias.map((v) => [
          <span key={`g-${v.id}`} className="font-medium text-slate-700">
            {v.grupo}
          </span>,
          v.centro,
          v.fecha,
          v.hora,
          v.citados,
          <PildoraEstado key={`e-${v.id}`} tono={v.estado === "PROGRAMADA" ? "activo" : "pendiente"}>
            {v.estado === "PROGRAMADA" ? "Programada" : "Borrador"}
          </PildoraEstado>,
          v.estado === "BORRADOR" ? (
            <BotonAccion
              key={`a-${v.id}`}
              tono="primario"
              onClick={() => confirmar(v.id, v.grupo, v.fecha, v.hora, v.citados)}
            >
              Programar
            </BotonAccion>
          ) : (
            <span key={`a-${v.id}`} className="text-xs italic text-slate-400">
              Sin acciones
            </span>
          ),
        ])}
      />
    </div>
  );
}
