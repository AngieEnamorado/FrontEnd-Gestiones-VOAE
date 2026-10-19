import { useState } from "react";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi, type ParticipacionMiembroApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeGrupo, fechaCorta, formatoHoras } from "../../../utils/voluntariado";
import { descargarDiploma } from "../../../utils/diplomaVoluntariado";

const barraColor: Record<string, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  navy: "bg-unah-navy",
  rose: "bg-rose-500",
};

export default function MiHistorial() {
  const { idPersona, persona } = useSesionVoluntariado();
  const [descargando, setDescargando] = useState<number | null>(null);
  const [errorDiploma, setErrorDiploma] = useState<string | null>(null);
  const carga = useApi(
    () => Promise.all([voluntariadoApi.participacionesDePersona(idPersona), voluntariadoApi.participacionMiembros()]),
    [idPersona],
  );
  const [participaciones, diplomas] = carga.datos ?? [[], { umbral: 0, miembros: [] }];

  // El historial son las participaciones ya confirmadas; las inscripciones
  // vigentes aparecen en Inicio y en Actividades.
  const historial = participaciones.filter((p) => p.codigoEstado === "ASISTIO" || p.codigoEstado === "NO_ASISTIO");
  const horas = historial.reduce((total, p) => total + (p.codigoEstado === "ASISTIO" ? p.horasParticipacion ?? 0 : 0), 0);
  // El porcentaje y el umbral los calcula la API: el cliente no decide quién es elegible.
  const porGrupo = diplomas.miembros.filter((m) => m.idPersona === idPersona);

  // Los datos del diploma (fecha, período, folio) se piden al descargar: la
  // lista de participación solo dice si ya existe.
  async function descargar(g: ParticipacionMiembroApi) {
    setDescargando(g.idGrupo);
    setErrorDiploma(null);
    try {
      const diploma = (await voluntariadoApi.diplomasDeGrupo(g.idGrupo)).find((d) => d.idPersona === idPersona);
      if (!diploma) throw new Error("No se encontró el diploma emitido. Reintenta en unos segundos.");
      await descargarDiploma({
        idDiploma: diploma.idDiploma,
        nombreCompleto: `${persona.nombrePersona} ${persona.apellidosPersona}`,
        numeroCuenta: persona.numeroCuenta ?? diploma.numeroCuenta,
        nombreGrupo: g.nombreGrupo,
        campus: g.campus,
        ventana: diploma.ventanaDiploma,
        porcentaje: diploma.porcentajeParticipacion,
        actividadesAsistidas: diploma.actividadesAsistidas,
        actividadesGrupo: diploma.actividadesGrupo,
        fechaEmision: diploma.fechaEmision,
      });
    } catch (e) {
      setErrorDiploma(mensajeDeError(e));
    } finally {
      setDescargando(null);
    }
  }

  return (
    <div className="pb-6">
      <div className="bg-gradient-to-br from-unah-navy to-unah-navy-light px-5 py-7 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Horas totales</p>
        <p className="mt-1 text-[34px] font-extrabold leading-none">{formatoHoras(horas)}</p>
      </div>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="flex flex-col gap-3 px-4 pt-4">
          {errorDiploma && (
            <p className="rounded-xl bg-red-50 p-3 text-[12px] font-semibold text-red-600">{errorDiploma}</p>
          )}
          {porGrupo.map((g) => {
            const elegible = g.porcentajeParticipacion >= diplomas.umbral;
            const emitido = g.yaTieneDiploma === 1;
            return (
              <div
                key={g.idGrupo}
                className={`rounded-2xl border p-3.5 ${emitido ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
              >
                <p className={`text-[12px] font-bold ${emitido ? "text-emerald-800" : "text-amber-800"}`}>{g.nombreGrupo}</p>
                <p className={`mt-0.5 text-[20px] font-extrabold ${emitido ? "text-emerald-700" : "text-amber-700"}`}>
                  {Math.round(g.porcentajeParticipacion)}%
                </p>
                <p className={`text-[11px] ${emitido ? "text-emerald-700" : "text-amber-600"}`}>
                  {g.actividadesAsistidas} de {g.actividadesGrupo} actividades ejecutadas.{" "}
                  {emitido
                    ? "🎓 La VOAE ya emitió tu diploma."
                    : elegible
                      ? "✓ Elegible a diploma; la VOAE lo emite desde su panel."
                      : `Necesitas ${diplomas.umbral}% de participación para ser elegible a diploma.`}
                </p>
                {emitido && (
                  <button
                    type="button"
                    onClick={() => descargar(g)}
                    disabled={descargando !== null}
                    className="mt-2.5 w-full rounded-xl bg-emerald-600 py-2.5 text-[12.5px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {descargando === g.idGrupo ? "Generando diploma…" : "Descargar diploma (PDF)"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2.5 px-4">
          {historial.length === 0 && (
            <p className="text-[13px] text-slate-400">Aún no tienes asistencias confirmadas.</p>
          )}
          {historial.map((p) => {
            const asistio = p.codigoEstado === "ASISTIO";
            return (
              <div key={p.idParticipacion} className="flex overflow-hidden rounded-2xl bg-white shadow-sm">
                <span className={`w-1.5 shrink-0 ${barraColor[colorDeGrupo(p.idGrupo)]}`} />
                <div className="flex flex-1 items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-slate-800">{p.nombreActividad}</p>
                    <p className="truncate text-[11px] text-slate-400">{p.nombreGrupo} · {fechaCorta(p.fechaActividad)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-extrabold text-unah-navy">{formatoHoras(p.horasParticipacion ?? 0)}h</p>
                    <p className={`text-[10.5px] font-semibold ${asistio ? "text-emerald-600" : "text-rose-600"}`}>
                      {asistio ? "Confirmada" : "No asistió"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </EstadoCarga>
    </div>
  );
}
