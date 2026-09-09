import { useParams } from "react-router-dom";
import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { informesTrimestrales } from "../../../data/mockInformesVoluntariado";
import { trimestres } from "../../../data/mockCatalogosVoluntariado";
import { actividadPorId } from "../../../data/mockActividadesVoluntariado";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { horasTotalesDeGrupo, participantesUnicos } from "../../../data/voluntariadoSelectors";
import type { EstadoInformeTrimestral } from "../../../types";

const ETAPAS: EstadoInformeTrimestral[] = ["EN CAPTURA", "ENVIADO", "OBSERVADO", "ACEPTADO"];

export default function InformeTrimestral() {
  const { grupoId } = useParams<{ grupoId: string }>();
  const grupo = grupoId ? grupoPorId(grupoId) : undefined;
  const informe = grupoId ? informesTrimestrales.find((i) => i.grupoId === grupoId) : undefined;

  if (!grupo || !informe) {
    return (
      <>
        <HeaderMovilDetalle titulo="Informe trimestral" />
        <p className="p-6 text-sm text-slate-400">Este grupo no tiene un informe trimestral en curso.</p>
      </>
    );
  }

  const trimestre = trimestres.find((t) => t.id === informe.trimestreId);
  const actividades = informe.actividadesIds.map((id) => actividadPorId(id)).filter((a) => a !== undefined);
  const horas = horasTotalesDeGrupo(grupo.id);
  const participantes = participantesUnicos(informe.actividadesIds);
  const indiceEtapa = ETAPAS.indexOf(informe.estado);

  return (
    <div className="flex h-full flex-col">
      <HeaderMovilDetalle titulo="Informe trimestral" subtitulo={grupo.nombre} />

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

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-[13px] font-bold text-slate-800">{trimestre?.nombre} · {grupo.nombre}</p>
          <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div>
              <p className="text-[17px] font-extrabold text-unah-navy">{actividades.length}</p>
              <p className="text-[9.5px] font-semibold text-slate-400">ACTIVIDADES</p>
            </div>
            <div>
              <p className="text-[17px] font-extrabold text-unah-navy">{participantes}</p>
              <p className="text-[9.5px] font-semibold text-slate-400">PARTICIPANTES</p>
            </div>
            <div>
              <p className="text-[17px] font-extrabold text-unah-navy">{horas}</p>
              <p className="text-[9.5px] font-semibold text-slate-400">HORAS</p>
            </div>
          </div>
          <p className="mt-3 text-[10.5px] text-slate-400">
            Generado automáticamente a partir de las actividades ejecutadas — no se redacta a mano.
          </p>
        </div>

        {informe.estado === "OBSERVADO" && informe.observaciones && (
          <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600">Observaciones del administrador</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-violet-800">“{informe.observaciones}”</p>
          </div>
        )}

        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Actividades incluidas</h2>
          <div className="mt-2 flex flex-col gap-2">
            {actividades.map((a) => (
              <div key={a!.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <p className="truncate text-[12.5px] font-semibold text-slate-700">{a!.nombre}</p>
                <p className="shrink-0 text-[11px] text-slate-400">{a!.fecha}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(informe.estado === "EN CAPTURA" || informe.estado === "OBSERVADO") && (
        <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
          <button type="button" className="w-full rounded-xl bg-unah-orange py-3 text-sm font-semibold text-white hover:bg-unah-orange-dark">
            {informe.estado === "OBSERVADO" ? "Corregir y reenviar" : "Enviar informe"}
          </button>
        </footer>
      )}
    </div>
  );
}
