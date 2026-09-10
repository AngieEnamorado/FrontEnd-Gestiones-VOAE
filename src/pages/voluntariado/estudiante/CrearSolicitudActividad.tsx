import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { gruposVoluntariado } from "../../../data/mockGruposVoluntariado";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { grupoCoordinadoPor } from "../../../data/voluntariadoSelectors";

const claseInput =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-unah-orange focus:ring-1 focus:ring-unah-orange";
const claseLabel = "mb-1.5 block text-[11px] font-bold text-slate-500";

export default function CrearSolicitudActividad() {
  const navigate = useNavigate();
  const grupo = grupoCoordinadoPor(estudianteActual.numeroCuenta);
  const [esConjunta, setEsConjunta] = useState(false);
  const [grupoCoorganizador, setGrupoCoorganizador] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    navigate("/voluntariado/portal-estudiante/coordinador");
  }

  return (
    <>
      <HeaderMovilDetalle titulo="Nueva actividad" subtitulo={grupo?.nombre} />
      <form onSubmit={enviar} className="flex flex-col gap-3.5 px-4 py-4">
        <div>
          <label className={claseLabel}>Nombre de la actividad</label>
          <input required className={claseInput} placeholder="Ej. Jornada de reforestación" />
        </div>
        <div>
          <label className={claseLabel}>Objetivo / descripción</label>
          <textarea required rows={3} className={`${claseInput} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={claseLabel}>Fecha</label>
            <input type="date" required className={claseInput} />
          </div>
          <div>
            <label className={claseLabel}>Lugar</label>
            <input required className={claseInput} placeholder="Ej. Ciudad Universitaria" />
          </div>
        </div>
        <div>
          <label className={claseLabel}>Período académico</label>
          <select required className={claseInput} defaultValue="">
            <option value="" disabled>Selecciona un período</option>
            <option>I Periodo 2026</option>
            <option>II Periodo 2026</option>
          </select>
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
              className={claseInput}
              value={grupoCoorganizador}
              onChange={(e) => setGrupoCoorganizador(e.target.value)}
            >
              <option value="" disabled>Selecciona un grupo</option>
              {gruposVoluntariado.filter((g) => g.id !== grupo?.id).map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="mt-2 w-full rounded-xl bg-unah-navy py-3 text-sm font-semibold text-white">
          Enviar solicitud
        </button>
      </form>
    </>
  );
}
