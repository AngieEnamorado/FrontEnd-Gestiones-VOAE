import { useNavigate, useParams } from "react-router-dom";
import { HiChevronLeft } from "react-icons/hi2";
import FichaSolicitudGira from "../../components/FichaSolicitudGira";
import BloqueDictamen, { type OpcionDictamen } from "../../components/giras/BloqueDictamen";
import SinIdentidad from "../../components/giras/SinIdentidad";
import { dictaminarSolicitud, listarCatalogo, obtenerSolicitud } from "../../api/giras";
import { useConsulta } from "../../api/useConsulta";
import { useIdentidadGira, useRolGira } from "../../context/UserContext";
import type { DecisionSolicitudGira } from "../../types/giras";

const OPCIONES: OpcionDictamen[] = [
  { valor: "Aprobada", etiqueta: "Aprobar", exigeJustificacion: false },
  { valor: "Correccion", etiqueta: "Devolver a corrección", exigeJustificacion: true },
  { valor: "Denegada", etiqueta: "Denegar", exigeJustificacion: true },
];

function Regresar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 self-start rounded-lg bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
    >
      <HiChevronLeft className="h-4 w-4" />
      Regresar
    </button>
  );
}

export default function DetalleSolicitud() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { rol } = useRolGira();
  const identidad = useIdentidadGira();

  const idSolicitud = Number(id);
  const { datos: solicitud, cargando, error, recargar } = useConsulta(
    () => obtenerSolicitud(idSolicitud),
    [idSolicitud],
  );
  // Los motivos de denegación se piden solo si quien mira puede denegar.
  const puedeDictaminar = rol === "jefe-aprobacion";
  const { datos: motivos } = useConsulta(
    () => (puedeDictaminar ? listarCatalogo("cancelacion") : Promise.resolve([])),
    [puedeDictaminar],
  );

  function regresarASolicitudes() {
    navigate("/giras/solicitudes");
  }

  if (cargando && !solicitud) {
    return (
      <div className="flex flex-col gap-6">
        <Regresar onClick={regresarASolicitudes} />
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Cargando solicitud…</div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex flex-col gap-6">
        <Regresar onClick={regresarASolicitudes} />
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          {error ?? "No se encontró la solicitud solicitada."}
        </div>
      </div>
    );
  }

  async function dictaminar(decision: string, justificacion: string | null, idTipoCancelacion: number | null) {
    if (!identidad) return;
    await dictaminarSolicitud(idSolicitud, {
      idJefeAprobacion: identidad.idUsuarioUnidad,
      decision: decision as DecisionSolicitudGira,
      justificacion,
      idTipoCancelacion,
    });
    recargar();
  }

  // Los dos roles que llegan aquí ven la misma ficha de solo lectura. Solo el
  // jefe de aprobación dictamina, y solo lo que está pendiente de dictamen.
  let pie;
  if (puedeDictaminar) {
    if (!identidad) pie = <SinIdentidad rol="Jefe de aprobación" />;
    else if (solicitud.codigoEstado === "Pendiente") {
      pie = (
        <BloqueDictamen
          titulo="Dictamen de la solicitud"
          descripcion="Al registrarlo cambia el estado de la solicitud. Si la apruebas, se crea la gira."
          opciones={OPCIONES}
          motivosDeDenegacion={(motivos ?? [])
            .filter((m) => m["aplicaA"] === "SOLICITUD" || m["aplicaA"] === "AMBAS")
            .map((m) => ({ id: m.id, nombre: m.nombre }))}
          decisionConMotivo="Denegada"
          onConfirmar={dictaminar}
        />
      );
    }
  }

  // El jefe de misión solo puede intervenir cuando se la devolvieron a corrección.
  if (rol === "jefe-mision" && solicitud.codigoEstado === "Correccion") {
    pie = (
      <section className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-violet-800">La solicitud fue devuelta a corrección</h2>
          <p className="mt-1 text-sm text-violet-700">Corrígela y vuelve a enviarla al jefe de aprobación.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/giras/solicitudes/borradores/${solicitud.idSolicitud}/editar`)}
          className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00264d]"
        >
          Corregir y reenviar
        </button>
      </section>
    );
  }

  return <FichaSolicitudGira solicitud={solicitud} onRegresar={regresarASolicitudes} pie={pie} />;
}
