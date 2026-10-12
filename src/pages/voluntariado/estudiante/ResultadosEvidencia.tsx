import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineCamera, HiOutlineCheck } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type ActividadDetalleApi, type RequisitoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";

export default function ResultadosEvidencia() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const idActividad = Number(actividadId);
  const carga = useApi(
    () => Promise.all([voluntariadoApi.actividad(idActividad), voluntariadoApi.catalogos()]),
    [idActividad],
  );

  if (!carga.datos) {
    return (
      <>
        <HeaderMovilDetalle titulo="Resultados y evidencia" />
        <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
          {null}
        </EstadoCarga>
      </>
    );
  }

  const [actividad, catalogos] = carga.datos;
  const requisito = catalogos.requisitos.find((r) => r.procesoRequisito === "ACTIVIDAD");
  return <Formulario actividad={actividad} requisito={requisito} onFotoAgregada={carga.recargar} />;
}

function Formulario({
  actividad,
  requisito,
  onFotoAgregada,
}: {
  actividad: ActividadDetalleApi;
  requisito: RequisitoApi | undefined;
  onFotoAgregada: () => void;
}) {
  const navigate = useNavigate();
  const minimo = requisito?.minimoRequisito ?? 2;
  const maximo = requisito?.maximoRequisito ?? 4;
  const [resultados, setResultados] = useState(actividad.resultadosActividad ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalFotos = actividad.fotos.length;
  const cumpleMinimo = totalFotos >= minimo;

  // Todavía no hay subida a S3 (URL prefirmada): se registra el nombre del
  // archivo como referencia para que el flujo y el conteo funcionen.
  async function agregarFoto(archivo: File | undefined) {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      await voluntariadoApi.agregarFoto(
        actividad.idActividad,
        `prototipo/actividades/${actividad.idActividad}/${archivo.name}`,
        requisito?.idRequisitoAdjunto ?? null,
      );
      onFotoAgregada();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setSubiendo(false);
    }
  }

  async function continuar() {
    setGuardando(true);
    setError(null);
    try {
      if (resultados.trim()) await voluntariadoApi.guardarResultados(actividad.idActividad, resultados.trim());
      navigate(`/voluntariado/portal-estudiante/coordinador/informe-economico/${actividad.idActividad}`);
    } catch (e) {
      setError(mensajeDeError(e));
      setGuardando(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Resultados y evidencia" subtitulo={actividad.nombreActividad} />

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
            {totalFotos}/{maximo} · mín. {minimo}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {Array.from({ length: Math.max(maximo, totalFotos) }, (_, i) => {
            const foto = actividad.fotos[i];
            if (foto) {
              return (
                <div
                  key={foto.idFotoActividad}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50 p-2"
                >
                  <HiOutlineCheck className="h-6 w-6 text-emerald-600" />
                  <span className="w-full truncate text-center text-[10.5px] font-semibold text-emerald-600">
                    {foto.archivoUrl.split("/").pop()}
                  </span>
                </div>
              );
            }
            return (
              <label
                key={`vacia-${i}`}
                className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-300 bg-white ${
                  subiendo ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <HiOutlineCamera className="h-6 w-6 text-slate-300" />
                <span className="text-[10.5px] font-semibold text-slate-400">{subiendo ? "Agregando…" : "Agregar foto"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => agregarFoto(e.target.files?.[0])}
                />
              </label>
            );
          })}
        </div>

        {!cumpleMinimo && (
          <p className="mt-2 text-[11px] font-semibold text-red-600">
            Debes agregar al menos {minimo} fotos de evidencia.
          </p>
        )}
        {error && <p className="mt-2 rounded-lg bg-red-50 p-2 text-[12px] font-semibold text-red-600">{error}</p>}
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
        <button
          type="button"
          disabled={!cumpleMinimo || guardando}
          onClick={continuar}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white ${cumpleMinimo ? "bg-unah-navy" : "bg-slate-300"}`}
        >
          {guardando ? "Guardando…" : "Continuar"}
        </button>
      </footer>
    </div>
  );
}
