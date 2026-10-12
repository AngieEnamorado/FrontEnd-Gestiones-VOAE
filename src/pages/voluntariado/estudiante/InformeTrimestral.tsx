import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type ActividadApi, type InformeResumenApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { hoyIso } from "../../../utils/fechas";
import { estadoInforme, fechaCorta, formatoHoras, nombreTrimestre, trimestreDeFecha } from "../../../utils/voluntariado";
import type { EstadoInformeTrimestral } from "../../../types";

const ETAPAS: EstadoInformeTrimestral[] = ["EN CAPTURA", "ENVIADO", "OBSERVADO", "ACEPTADO"];

export default function InformeTrimestral() {
  const { grupoId } = useParams<{ grupoId: string }>();
  const idGrupo = Number(grupoId);
  const [accion, setAccion] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const carga = useApi(
    () =>
      Promise.all([
        voluntariadoApi.grupo(idGrupo),
        voluntariadoApi.informes({ grupo: idGrupo }),
        voluntariadoApi.actividades({ grupo: idGrupo }),
        voluntariadoApi.catalogos(),
      ]),
    [idGrupo],
  );

  if (!carga.datos) {
    return (
      <>
        <HeaderMovilDetalle titulo="Informe trimestral" />
        <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={false}>
          {null}
        </EstadoCarga>
      </>
    );
  }

  const [grupo, informes, actividades, catalogos] = carga.datos;
  // El que se está trabajando; si no hay, el más reciente (la API los ordena así).
  const informe = informes.find((i) => i.codigoEstado === "EN_CAPTURA" || i.codigoEstado === "OBSERVADO") ?? informes[0];
  const vigente = trimestreDeFecha(catalogos.trimestres, hoyIso());
  const puedeIniciar = vigente && !informes.some((i) => i.idTrimestre === vigente.idTrimestre);

  async function iniciar() {
    if (!vigente) return;
    setAccion(true);
    setErrorAccion(null);
    try {
      await voluntariadoApi.crearInforme(idGrupo, vigente.idTrimestre);
      carga.recargar();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      setAccion(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Informe trimestral" subtitulo={grupo.nombreGrupo} />
      {errorAccion && <p className="mx-4 mt-3 rounded-lg bg-red-50 p-2.5 text-[12px] font-semibold text-red-600">{errorAccion}</p>}

      {puedeIniciar && (
        <div className="mx-4 mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center">
          <p className="text-[12.5px] text-slate-500">Aún no has iniciado el informe del {nombreTrimestre(vigente)}.</p>
          <button
            type="button"
            onClick={iniciar}
            disabled={accion}
            className="mt-3 rounded-xl bg-unah-navy px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            Iniciar informe
          </button>
        </div>
      )}

      {informe ? (
        <DetalleInforme
          key={informe.idInformeTrimestral}
          informe={informe}
          actividadesDelGrupo={actividades}
          onCambio={carga.recargar}
        />
      ) : (
        !puedeIniciar && <p className="p-6 text-sm text-slate-400">Este grupo no tiene un informe trimestral en curso.</p>
      )}
    </div>
  );
}

function DetalleInforme({
  informe,
  actividadesDelGrupo,
  onCambio,
}: {
  informe: InformeResumenApi;
  actividadesDelGrupo: ActividadApi[];
  onCambio: () => void;
}) {
  const detalle = useApi(() => voluntariadoApi.informe(informe.idInformeTrimestral), [informe.idInformeTrimestral]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editable = informe.codigoEstado === "EN_CAPTURA" || informe.codigoEstado === "OBSERVADO";

  // El informe se arma solo con las actividades ejecutadas del trimestre: se
  // sincroniza al abrirlo mientras siga editable, nunca se elige a mano.
  const esperadas = actividadesDelGrupo
    .filter((a) => a.codigoEstado === "EJECUTADA" && a.idTrimestre === informe.idTrimestre)
    .map((a) => a.idActividad)
    .sort((a, b) => a - b);
  const guardadas = (detalle.datos?.actividades ?? []).map((a) => a.idActividad).sort((a, b) => a - b);
  const clavesEsperadas = esperadas.join(",");
  const desincronizado = editable && detalle.datos !== undefined && clavesEsperadas !== guardadas.join(",");
  const recargarDetalle = detalle.recargar;

  useEffect(() => {
    if (!desincronizado) return;
    const ids = clavesEsperadas ? clavesEsperadas.split(",").map(Number) : [];
    voluntariadoApi
      .fijarActividadesDeInforme(informe.idInformeTrimestral, ids)
      .then(recargarDetalle)
      .catch((e) => setError(mensajeDeError(e)));
  }, [desincronizado, clavesEsperadas, informe.idInformeTrimestral, recargarDetalle]);

  async function enviar() {
    setEnviando(true);
    setError(null);
    try {
      await voluntariadoApi.enviarInforme(informe.idInformeTrimestral);
      onCambio();
    } catch (e) {
      setError(mensajeDeError(e));
      setEnviando(false);
    }
  }

  const estado = estadoInforme(informe.codigoEstado);
  const indiceEtapa = ETAPAS.indexOf(estado);
  const actividades = detalle.datos?.actividades ?? [];
  const horas = actividades.reduce((t, a) => t + a.horas, 0);

  return (
    <>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
        <div className="flex gap-1.5">
          {ETAPAS.map((etapa, i) => (
            <div key={etapa} className="flex-1">
              <span className={`block h-[5px] rounded-full ${i <= indiceEtapa ? "bg-violet-500" : "bg-slate-200"}`} />
              <p className={`mt-1 text-[9px] font-semibold ${i <= indiceEtapa ? "text-violet-600" : "text-slate-400"}`}>
                {etapa}
              </p>
            </div>
          ))}
        </div>

        <EstadoCarga cargando={detalle.cargando} error={detalle.error} onReintentar={detalle.recargar} listo={detalle.datos !== undefined}>
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[13px] font-bold text-slate-800">{nombreTrimestre(informe)} · {informe.nombreGrupo}</p>
            {informe.fechaLimiteInforme && (
              <p className="mt-0.5 text-[11px] text-slate-400">Fecha límite: {fechaCorta(informe.fechaLimiteInforme)}</p>
            )}
            <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div>
                <p className="text-[17px] font-extrabold text-unah-navy">{actividades.length}</p>
                <p className="text-[9.5px] font-semibold text-slate-400">ACTIVIDADES</p>
              </div>
              <div>
                <p className="text-[17px] font-extrabold text-unah-navy">{detalle.datos?.totalParticipantes ?? 0}</p>
                <p className="text-[9.5px] font-semibold text-slate-400">PARTICIPANTES</p>
              </div>
              <div>
                <p className="text-[17px] font-extrabold text-unah-navy">{formatoHoras(horas)}</p>
                <p className="text-[9.5px] font-semibold text-slate-400">HORAS</p>
              </div>
            </div>
            <p className="mt-3 text-[10.5px] text-slate-400">
              Generado automáticamente a partir de las actividades ejecutadas — no se redacta a mano.
            </p>
          </div>

          {informe.codigoEstado === "OBSERVADO" && informe.observacionesAdmin && (
            <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">Observaciones del administrador</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-violet-800">“{informe.observacionesAdmin}”</p>
            </div>
          )}

          <div className="mt-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Actividades incluidas</h2>
            <div className="mt-2 flex flex-col gap-2">
              {actividades.length === 0 && (
                <p className="text-[12.5px] text-slate-400">Todavía no hay actividades ejecutadas en este trimestre.</p>
              )}
              {actividades.map((a) => (
                <div key={a.idActividad} className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 shadow-sm">
                  <p className="truncate text-[12.5px] font-semibold text-slate-700">{a.nombreActividad}</p>
                  <p className="shrink-0 text-[11px] text-slate-400">{fechaCorta(a.fechaActividad)}</p>
                </div>
              ))}
            </div>
          </div>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-[12px] font-semibold text-red-600">{error}</p>}
        </EstadoCarga>
      </div>

      {editable && (
        <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || desincronizado}
            className="w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark disabled:opacity-60"
          >
            {enviando ? "Enviando…" : informe.codigoEstado === "OBSERVADO" ? "Corregir y reenviar" : "Enviar informe"}
          </button>
        </footer>
      )}
    </>
  );
}
