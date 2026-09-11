import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineCamera, HiOutlineCheck } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { actividadPorId } from "../../../data/mockActividadesVoluntariado";

const MINIMO_FOTOS = 2;

export default function ResultadosEvidencia() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const navigate = useNavigate();
  const actividad = actividadId ? actividadPorId(actividadId) : undefined;

  const [resultados, setResultados] = useState(actividad?.resultados ?? "");
  const [fotos, setFotos] = useState<boolean[]>(Array.from({ length: 4 }, (_, i) => i < (actividad?.fotosEvidencia ?? 0)));

  if (!actividad) {
    return (
      <>
        <HeaderMovilDetalle titulo="Resultados y evidencia" />
        <p className="p-6 text-sm text-slate-400">Actividad no encontrada.</p>
      </>
    );
  }

  const totalFotos = fotos.filter(Boolean).length;
  const cumpleMinimo = totalFotos >= MINIMO_FOTOS;

  function alternarFoto(indice: number) {
    setFotos((prev) => prev.map((v, i) => (i === indice ? !v : v)));
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Resultados y evidencia" subtitulo={actividad.nombre} />

      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <label className="mb-1.5 block text-[11px] font-bold text-slate-500">Resultados alcanzados</label>
        <textarea
          value={resultados}
          onChange={(e) => setResultados(e.target.value)}
          rows={5}
          placeholder="Describe los resultados de la actividad..."
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:border-unah-orange focus:ring-1 focus:ring-unah-orange"
        />

        <div className="mt-5 flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-500">Fotos de evidencia</p>
          <p className={`text-[11px] font-bold ${cumpleMinimo ? "text-emerald-600" : "text-red-600"}`}>
            {totalFotos}/4 · mín. {MINIMO_FOTOS}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {fotos.map((llena, i) => (
            <button
              key={i}
              type="button"
              onClick={() => alternarFoto(i)}
              className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed ${
                llena ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white"
              }`}
            >
              {llena ? (
                <HiOutlineCheck className="h-6 w-6 text-emerald-600" />
              ) : (
                <HiOutlineCamera className="h-6 w-6 text-slate-300" />
              )}
              <span className={`text-[10.5px] font-semibold ${llena ? "text-emerald-600" : "text-slate-400"}`}>
                {llena ? "Foto agregada" : "Agregar foto"}
              </span>
            </button>
          ))}
        </div>

        {!cumpleMinimo && (
          <p className="mt-2 text-[11px] font-semibold text-red-600">
            Debes agregar al menos {MINIMO_FOTOS} fotos de evidencia.
          </p>
        )}
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          disabled={!cumpleMinimo}
          onClick={() => navigate(`/voluntariado/portal-estudiante/coordinador/informe-economico/${actividad.id}`)}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white ${cumpleMinimo ? "bg-unah-navy" : "bg-slate-300"}`}
        >
          Continuar
        </button>
      </footer>
    </div>
  );
}
