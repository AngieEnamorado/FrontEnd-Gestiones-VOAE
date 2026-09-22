import { useId, useState } from "react";
import { mensajeDeError } from "../../api/cliente";

export interface OpcionDictamen {
  valor: string;
  etiqueta: string;
  /** Denegar o devolver a corrección sin explicar por qué no ayuda a nadie: la API lo exige. */
  exigeJustificacion: boolean;
}

interface Props {
  titulo: string;
  descripcion: string;
  opciones: OpcionDictamen[];
  /** Motivos de cancelación entre los que se elige al denegar (solo solicitudes). */
  motivosDeDenegacion?: { id: number; nombre: string }[];
  /** La decisión en la que se ofrecen los motivos. */
  decisionConMotivo?: string;
  /** Registra el dictamen en la API; si lanza, el mensaje se muestra aquí. */
  onConfirmar: (decision: string, justificacion: string | null, idTipoCancelacion: number | null) => Promise<void>;
}

/**
 * La tarjeta del pie de un detalle donde se dictamina. El estado de la
 * solicitud o de la inscripción NO se cambia a mano: se registra un dictamen y
 * es la API la que mueve el estado.
 */
export default function BloqueDictamen({
  titulo,
  descripcion,
  opciones,
  motivosDeDenegacion,
  decisionConMotivo,
  onConfirmar,
}: Props) {
  const idDecision = useId();
  const idJustificacion = useId();
  const idMotivo = useId();

  const [decision, setDecision] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [idMotivoElegido, setIdMotivoElegido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcion = opciones.find((o) => o.valor === decision);
  const textoJustificacion = justificacion.trim();
  const faltaJustificacion = !!opcion?.exigeJustificacion && !textoJustificacion;
  const ofreceMotivo = !!motivosDeDenegacion?.length && decision === decisionConMotivo;

  async function registrar() {
    if (!opcion || faltaJustificacion || enviando) return;
    if (!window.confirm(`¿Registrar el dictamen «${opcion.etiqueta}»? Cambiará el estado y quedará en el historial.`)) {
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar(
        opcion.valor,
        textoJustificacion || null,
        ofreceMotivo && idMotivoElegido ? Number(idMotivoElegido) : null,
      );
      setDecision("");
      setJustificacion("");
      setIdMotivoElegido("");
    } catch (causa) {
      setError(mensajeDeError(causa));
    } finally {
      setEnviando(false);
    }
  }

  const claseCampo =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-slate-800">{titulo}</h2>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>

      <div>
        <label htmlFor={idDecision} className="mb-1.5 block text-xs font-semibold text-slate-500">
          Decisión
        </label>
        <select id={idDecision} value={decision} onChange={(e) => setDecision(e.target.value)} className={claseCampo}>
          <option value="">Elige una decisión…</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {ofreceMotivo && (
        <div>
          <label htmlFor={idMotivo} className="mb-1.5 block text-xs font-semibold text-slate-500">
            Motivo <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <select
            id={idMotivo}
            value={idMotivoElegido}
            onChange={(e) => setIdMotivoElegido(e.target.value)}
            className={claseCampo}
          >
            <option value="">Sin motivo de la lista</option>
            {motivosDeDenegacion?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {opcion && (
        <div>
          <label htmlFor={idJustificacion} className="mb-1.5 block text-xs font-semibold text-slate-500">
            Justificación{" "}
            <span className="font-normal text-slate-400">
              {opcion.exigeJustificacion ? "(obligatoria)" : "(opcional)"}
            </span>
          </label>
          <textarea
            id={idJustificacion}
            rows={3}
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            className={`${claseCampo} resize-none`}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={registrar}
          disabled={!opcion || faltaJustificacion || enviando}
          className="rounded-lg bg-[#003366] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00264d] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#003366]"
        >
          {enviando ? "Registrando…" : "Registrar dictamen"}
        </button>
      </div>
    </section>
  );
}
