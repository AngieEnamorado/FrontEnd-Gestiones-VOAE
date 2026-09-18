import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi2";
import FichaSolicitudGira from "../../components/FichaSolicitudGira";
import { useRolGira } from "../../context/UserContext";
import { solicitudesGiras } from "../../data/mockGirasSolicitudes";
import { misGiras } from "../../data/mockMisGiras";
import type { EstadoSolicitud } from "../../types";

const todasLasGiras = [...solicitudesGiras, ...misGiras];

export default function DetalleSolicitud() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { rol } = useRolGira();

  const solicitud = useMemo(() => todasLasGiras.find((s) => s.id === id), [id]);
  const [estadoActual, setEstadoActual] = useState<EstadoSolicitud>(
    () => solicitud?.estado ?? "PENDIENTE",
  );

  function regresarASolicitudes() {
    navigate("/giras/solicitudes");
  }

  if (!solicitud) {
    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={regresarASolicitudes}
          className="flex items-center gap-1.5 self-start rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
        >
          <HiChevronLeft className="h-4 w-4" />
          Regresar
        </button>
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No se encontró la solicitud solicitada.
        </div>
      </div>
    );
  }

  // Los dos roles que llegan aquí ven la misma ficha de solo lectura. Solo el
  // jefe de aprobación dictamina: para él la ficha suma el selector de estado.
  return (
    <FichaSolicitudGira
      solicitud={solicitud}
      onRegresar={regresarASolicitudes}
      cambioDeEstado={
        rol === "jefe-aprobacion" ? { estado: estadoActual, onCambiar: setEstadoActual } : undefined
      }
    />
  );
}
