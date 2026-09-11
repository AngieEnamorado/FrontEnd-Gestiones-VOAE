import { HiOutlinePlus } from "react-icons/hi2";
import BotonAccion from "../../../components/procad/BotonAccion";
import TablaDatos from "../../../components/procad/TablaDatos";
import type { Dialogo } from "../../../components/procad/DialogoConfirmacion";
import { useProcad } from "../../../context/ProcadContext";

/**
 * Elegibilidad por participar en algo puntual de VOAE sin pertenecer a ninguna
 * agrupación. Basta una firma: no hay criterio deportivo ni artístico de un
 * encargado que contrastar primero, como sí ocurre con el condicionado.
 */
export default function MatriculaExcepcional({
  abrirDialogo,
}: {
  abrirDialogo: (d: Dialogo) => void;
}) {
  const { matriculas, otorgarMatricula } = useProcad();

  function abrirFormulario() {
    abrirDialogo({
      titulo: "Otorgar matrícula excepcional",
      descripcion: "Sin pertenecer a ningún grupo — solo requiere su firma.",
      confirmar: "Otorgar",
      tono: "primario",
      campos: [
        { id: "nombre", label: "Nombre del estudiante" },
        { id: "cuenta", label: "Número de cuenta" },
        {
          id: "motivo",
          label: "Motivo",
          multilinea: true,
          marcador: "Ej. Apoyo en la organización de un evento institucional.",
        },
      ],
      onConfirmar: (valores) =>
        otorgarMatricula({
          nombre: valores.nombre.trim(),
          cuenta: valores.cuenta.trim(),
          motivo: valores.motivo.trim(),
        }),
    });
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex justify-end">
        <BotonAccion tono="primario" onClick={abrirFormulario}>
          <HiOutlinePlus className="h-3.5 w-3.5" />
          Otorgar matrícula excepcional
        </BotonAccion>
      </div>

      <TablaDatos
        anchoMinimo="760px"
        columnas={[
          { label: "Estudiante" },
          { label: "Cuenta" },
          { label: "Motivo" },
          { label: "Período" },
        ]}
        filas={matriculas.map((m) => [
          <span key={`n-${m.id}`} className="font-medium text-slate-700">
            {m.nombre}
          </span>,
          <span key={`c-${m.id}`} className="font-mono text-xs">
            {m.cuenta}
          </span>,
          <span key={`m-${m.id}`} className="block max-w-[340px] whitespace-normal leading-relaxed">
            {m.motivo}
          </span>,
          m.periodo,
        ])}
      />
    </div>
  );
}
