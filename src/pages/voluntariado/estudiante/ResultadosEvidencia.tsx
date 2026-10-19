import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineCamera, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type ActividadDetalleApi, type RequisitoApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { subirArchivo } from "../../../api/archivosVoluntariado";
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
  return <Formulario actividad={actividad} requisito={requisito} onFotosCambiadas={carga.recargar} />;
}

function Formulario({
  actividad,
  requisito,
  onFotosCambiadas,
}: {
  actividad: ActividadDetalleApi;
  requisito: RequisitoApi | undefined;
  onFotosCambiadas: () => void;
}) {
  const navigate = useNavigate();
  const minimo = requisito?.minimoRequisito ?? 2;
  const maximo = requisito?.maximoRequisito ?? 4;
  const [resultados, setResultados] = useState(actividad.resultadosActividad ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  // Foto que pide confirmación antes de quitarse, y la que se está quitando.
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [quitando, setQuitando] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalFotos = actividad.fotos.length;
  const cumpleMinimo = totalFotos >= minimo;

  // La foto va directo a S3 con una subida firmada; después se registra la
  // llave del objeto como evidencia de la actividad.
  async function agregarFoto(archivo: File | undefined) {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const llave = await subirArchivo("ACTIVIDAD", actividad.idActividad, archivo);
      await voluntariadoApi.agregarFoto(actividad.idActividad, llave, requisito?.idRequisitoAdjunto ?? null);
      onFotosCambiadas();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setSubiendo(false);
    }
  }

  async function quitarFoto(idFoto: number) {
    setQuitando(idFoto);
    setError(null);
    try {
      await voluntariadoApi.quitarFoto(actividad.idActividad, idFoto);
      setConfirmando(null);
      onFotosCambiadas();
    } catch (e) {
      setConfirmando(null);
      setError(mensajeDeError(e));
    } finally {
      setQuitando(null);
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
                  className="relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50 p-2"
                >
                  {foto.urlDescarga ? (
                    <img
                      src={foto.urlDescarga}
                      alt={foto.descripcionFoto ?? "Foto de evidencia"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <HiOutlineCheck className="h-6 w-6 text-emerald-600" />
                  )}
                  <span
                    className={`w-full truncate text-center text-[10.5px] font-semibold ${
                      foto.urlDescarga ? "absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-white" : "text-emerald-600"
                    }`}
                  >
                    {foto.archivoUrl.split("/").pop()}
                  </span>
                  {confirmando === foto.idFotoActividad ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/70 p-2">
                      <p className="text-center text-[11.5px] font-semibold text-white">¿Quitar esta foto?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void quitarFoto(foto.idFotoActividad)}
                          disabled={quitando !== null}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
                        >
                          {quitando === foto.idFotoActividad ? "Quitando…" : "Quitar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmando(null)}
                          disabled={quitando !== null}
                          className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmando(foto.idFotoActividad)}
                      aria-label="Quitar foto"
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow hover:bg-red-50 hover:text-red-600"
                    >
                      <HiOutlineXMark className="h-4 w-4" />
                    </button>
                  )}
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
                  accept="image/png,image/jpeg,image/webp"
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
