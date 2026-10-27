import { useState } from "react";
import { mensajeDeError } from "../../../api/cliente";
import { corregirSolicitud, crearSolicitud, listarCatalogos } from "../../../api/procad";
import { useConsulta } from "../../../api/useConsulta";
import { Campo, PanelFormulario } from "../../../components/procad/CamposFormulario";
import { CLASE_CAMPO } from "../../../components/procad/formatoProcad";
import type { EstudianteApi, GrupoApi, NivelExperiencia, SolicitudEstudianteApi } from "../../../types/procad";

const NIVELES: NivelExperiencia[] = ["Principiante", "Intermedio", "Avanzado"];

/**
 * La solicitud de ingreso a un grupo, o su corrección si se la observaron.
 * Los datos personales y académicos no se piden: la base los lee de Registro.
 * Aquí va solo lo que Registro no sabe —contacto de emergencia, posición o
 * instrumento, la experiencia— y la aceptación del reglamento.
 */
export default function FormularioSolicitud({
  estudiante,
  grupo,
  idPeriodo,
  corrige,
  onCancelar,
  onEnviada,
}: {
  estudiante: EstudianteApi;
  grupo: GrupoApi;
  idPeriodo: number;
  /** La solicitud observada que se corrige; sin ella, es una solicitud nueva. */
  corrige: SolicitudEstudianteApi | null;
  onCancelar: () => void;
  onEnviada: (mensaje: string) => void;
}) {
  const catalogos = useConsulta(listarCatalogos, []);
  const deportivo = grupo.tipoGrupo === "deportivo";
  const posiciones = (catalogos.datos?.posiciones ?? []).filter((p) => p.idDeporte === grupo.idDeporte);
  const instrumentos = catalogos.datos?.instrumentos ?? [];

  const [v, setV] = useState({
    contactoNombre: corrige?.contactoEmergenciaNombre ?? "",
    contactoTelefono: corrige?.contactoEmergenciaTelefono ?? "",
    posicion: corrige?.idPosicion ? String(corrige.idPosicion) : "",
    instrumento: corrige?.idInstrumento ? String(corrige.idInstrumento) : "",
    nivel: corrige?.nivelExperiencia ?? "",
    alergia: corrige?.alergia ?? "",
    experiencia: corrige?.experiencia ?? "",
    reglamento: false,
  });
  const [faltan, setFaltan] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const cambiar = (campo: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((previo) => ({ ...previo, [campo]: e.target.value }));

  async function enviar() {
    const sinLlenar = [
      !v.contactoNombre.trim() && "contactoNombre",
      !v.contactoTelefono.trim() && "contactoTelefono",
      !v.reglamento && "reglamento",
    ].filter((x): x is string => Boolean(x));
    setFaltan(sinLlenar);
    if (sinLlenar.length > 0) return;

    const cuerpo = {
      numeroCuenta: estudiante.numeroCuenta,
      contactoEmergenciaNombre: v.contactoNombre.trim(),
      contactoEmergenciaTelefono: v.contactoTelefono.trim(),
      aceptoReglamento: true as const,
      idPosicion: deportivo && v.posicion ? Number(v.posicion) : undefined,
      idInstrumento: !deportivo && v.instrumento ? Number(v.instrumento) : undefined,
      nivelExperiencia: (v.nivel || undefined) as NivelExperiencia | undefined,
      alergia: v.alergia.trim() || undefined,
      experiencia: v.experiencia.trim() || undefined,
    };

    setEnviando(true);
    setError(null);
    try {
      if (corrige) {
        await corregirSolicitud(corrige.idSolicitud, cuerpo);
        onEnviada(`Reenviaste tu solicitud a ${grupo.nombreGrupo}. Vuelve a revisión.`);
      } else {
        await crearSolicitud({ ...cuerpo, idGrupo: grupo.idGrupo, idPeriodo });
        onEnviada(`Enviaste tu solicitud a ${grupo.nombreGrupo}.`);
      }
    } catch (causa) {
      // El motivo lo da la base: otro campus, la categoría del grupo, ya tienes una activa…
      setError(mensajeDeError(causa));
    } finally {
      setEnviando(false);
    }
  }

  const falta = (campo: string) => (faltan.includes(campo) ? "Este dato es obligatorio." : null);

  return (
    <PanelFormulario
      titulo={corrige ? `Corregir tu solicitud a ${grupo.nombreGrupo}` : `Solicitud para ${grupo.nombreGrupo}`}
      descripcion={
        corrige
          ? "Cambia lo que te pidieron y reenvíala. El director la vuelve a revisar."
          : "Tu nombre, carrera e índice ya los tenemos de Registro. Completa lo demás."
      }
      onCancelar={onCancelar}
      onEnviar={enviar}
      enviando={enviando}
      textoEnviar={corrige ? "Reenviar solicitud" : "Enviar solicitud"}
    >
      {corrige?.ultimaObservacion && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
          <b className="font-semibold">Lo que te pidieron corregir:</b> {corrige.ultimaObservacion}
        </p>
      )}

      {!estudiante.cumpleIndiceMinimo && (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
          Tu índice del período ({estudiante.indicePeriodo ?? "sin dato"}%) no alcanza el mínimo ({estudiante.indiceMinimo}%).
          Puedes enviarla igual: si el director ve tu talento, te propone como condicionado.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {deportivo ? (
          <Campo etiqueta="Posición" opcional>
            <select value={v.posicion} onChange={cambiar("posicion")} className={CLASE_CAMPO}>
              <option value="">{catalogos.cargando ? "Cargando…" : "Sin preferencia"}</option>
              {posiciones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombrePosicion}
                </option>
              ))}
            </select>
          </Campo>
        ) : (
          <Campo etiqueta="Instrumento" opcional>
            <select value={v.instrumento} onChange={cambiar("instrumento")} className={CLASE_CAMPO}>
              <option value="">{catalogos.cargando ? "Cargando…" : "Ninguno"}</option>
              {instrumentos.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombreInstrumento}
                </option>
              ))}
            </select>
          </Campo>
        )}
        <Campo etiqueta="Nivel de experiencia" opcional>
          <select value={v.nivel} onChange={cambiar("nivel")} className={CLASE_CAMPO}>
            <option value="">Sin indicar</option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo etiqueta="Tu experiencia" opcional ayuda="Dónde has jugado o actuado, desde cuándo, logros. Es lo primero que lee el director.">
        <textarea value={v.experiencia} onChange={cambiar("experiencia")} rows={4} maxLength={4000} className={`${CLASE_CAMPO} resize-y`} />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Contacto de emergencia" error={falta("contactoNombre")}>
          <input type="text" value={v.contactoNombre} onChange={cambiar("contactoNombre")} maxLength={150} placeholder="Nombre completo" className={`${CLASE_CAMPO} ${falta("contactoNombre") ? "border-rose-400" : ""}`} />
        </Campo>
        <Campo etiqueta="Su teléfono" error={falta("contactoTelefono")}>
          <input type="tel" value={v.contactoTelefono} onChange={cambiar("contactoTelefono")} maxLength={30} placeholder="9999-9999" className={`${CLASE_CAMPO} ${falta("contactoTelefono") ? "border-rose-400" : ""}`} />
        </Campo>
        <Campo etiqueta="Alergias" opcional>
          <input type="text" value={v.alergia} onChange={cambiar("alergia")} maxLength={300} className={CLASE_CAMPO} />
        </Campo>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={v.reglamento}
          onChange={(e) => setV((previo) => ({ ...previo, reglamento: e.target.checked }))}
          className="mt-0.5 h-4 w-4 accent-unah-navy"
        />
        <span>
          Leí y acepto el reglamento de PROCAD y de la agrupación.
          {faltan.includes("reglamento") && (
            <span className="block text-xs font-semibold text-rose-600">Sin aceptarlo no se puede enviar.</span>
          )}
        </span>
      </label>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
    </PanelFormulario>
  );
}
