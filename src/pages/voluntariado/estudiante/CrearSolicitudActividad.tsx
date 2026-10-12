import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { catalogoApi } from "../../../api/catalogo";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { fechaCorta, nombrePac, nombreTrimestre, trimestreDeFecha } from "../../../utils/voluntariado";

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";
const claseLabel = "mb-1.5 block text-[11px] font-bold text-slate-500";

export default function CrearSolicitudActividad() {
  const navigate = useNavigate();
  const { grupoCoordinado } = useSesionVoluntariado();
  const carga = useApi(
    () => Promise.all([voluntariadoApi.grupos(), voluntariadoApi.catalogos(), catalogoApi.periodos()]),
    [],
  );
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [idPeriodoElegido, setIdPeriodoElegido] = useState("");
  const [esConjunta, setEsConjunta] = useState(false);
  const [grupoCoorganizador, setGrupoCoorganizador] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [grupos, catalogos, periodos] = carga.datos ?? [[], undefined, []];
  // El trimestre del informe se deduce de la fecha; el periodo académico se
  // propone igual, pero el coordinador puede cambiarlo.
  const trimestre = fecha && catalogos ? trimestreDeFecha(catalogos.trimestres, fecha) : undefined;
  const periodoSugerido = periodos.find(
    (p) => fecha && fechaCorta(p.fechaInicioPeriodo) <= fecha && fecha <= fechaCorta(p.fechaFinPeriodo),
  );
  const idPeriodo = idPeriodoElegido || (periodoSugerido ? String(periodoSugerido.idPeriodo) : "");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!grupoCoordinado) return;
    if (!trimestre) {
      setError("No hay un trimestre registrado para esa fecha. Pide a la VOAE que lo agregue en Catálogos.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await voluntariadoApi.crearActividad({
        idGrupoOrganizador: grupoCoordinado.idGrupo,
        idPeriodo: Number(idPeriodo),
        idTrimestre: trimestre.idTrimestre,
        nombreActividad: nombre,
        objetivoActividad: objetivo,
        fechaActividad: fecha,
        lugarActividad: lugar,
        coorganizadores: esConjunta && grupoCoorganizador ? [Number(grupoCoorganizador)] : [],
      });
      navigate("/voluntariado/portal-estudiante/coordinador");
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  }

  return (
    <>
      <HeaderMovilDetalle titulo="Nueva actividad" subtitulo={grupoCoordinado?.nombreGrupo} />
      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <form onSubmit={enviar} className="flex flex-col gap-3.5 px-4 py-4">
          <div>
            <label className={claseLabel}>Nombre de la actividad</label>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className={claseInput} placeholder="Ej. Jornada de reforestación" />
          </div>
          <div>
            <label className={claseLabel}>Objetivo / descripción</label>
            <textarea required rows={3} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} className={`${claseInput} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={claseLabel}>Fecha</label>
              <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className={claseInput} />
            </div>
            <div>
              <label className={claseLabel}>Lugar</label>
              <input required value={lugar} onChange={(e) => setLugar(e.target.value)} className={claseInput} placeholder="Ej. Ciudad Universitaria" />
            </div>
          </div>
          <div>
            <label className={claseLabel}>Período académico</label>
            <select required className={claseInput} value={idPeriodo} onChange={(e) => setIdPeriodoElegido(e.target.value)}>
              <option value="" disabled>Selecciona un período</option>
              {periodos.map((p) => (
                <option key={p.idPeriodo} value={p.idPeriodo}>{nombrePac(p.anioPeriodo, p.numeroPac)}</option>
              ))}
            </select>
            {trimestre && (
              <p className="mt-1.5 text-[11px] text-slate-400">Se reportará en el informe del {nombreTrimestre(trimestre)}.</p>
            )}
          </div>

          <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={esConjunta}
              onChange={(e) => setEsConjunta(e.target.checked)}
              className="h-4 w-4 accent-unah-orange"
            />
            <span className="text-[12.5px] font-semibold text-slate-600">Marcar como actividad conjunta</span>
          </label>

          {esConjunta && (
            <div>
              <label className={claseLabel}>Grupo co-organizador</label>
              <select
                required
                className={claseInput}
                value={grupoCoorganizador}
                onChange={(e) => setGrupoCoorganizador(e.target.value)}
              >
                <option value="" disabled>Selecciona un grupo</option>
                {grupos.filter((g) => g.idGrupo !== grupoCoordinado?.idGrupo).map((g) => (
                  <option key={g.idGrupo} value={g.idGrupo}>{g.nombreGrupo}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 p-2.5 text-[12px] font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={enviando || !grupoCoordinado}
            className="mt-2 w-full rounded-xl bg-unah-navy py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {enviando ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>
      </EstadoCarga>
    </>
  );
}
