import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { useSesionVoluntariado } from "../../../context/SesionVoluntariadoContext";
import { voluntariadoApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import { fechaCorta, iniciales } from "../../../utils/voluntariado";

export default function MiembrosGrupo() {
  const { grupoCoordinado } = useSesionVoluntariado();
  const idGrupo = grupoCoordinado?.idGrupo;
  const carga = useApi(() => (idGrupo ? voluntariadoApi.miembros(idGrupo) : Promise.resolve([])), [idGrupo]);

  return (
    <>
      <HeaderMovilDetalle titulo="Miembros del grupo" subtitulo={grupoCoordinado?.nombreGrupo} />
      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="flex flex-col divide-y divide-slate-100 px-1 py-1">
          {(carga.datos ?? []).map((m) => {
            const nombre = `${m.nombrePersona} ${m.apellidosPersona}`;
            return (
              <div key={m.idMiembroGrupo} className="flex items-center gap-3 px-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
                  {iniciales(nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-bold text-slate-800">{nombre}</p>
                    {m.esFundador && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                        FUNDADOR
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-slate-400">{m.numeroCuenta} · {m.carreraEstudiante}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11.5px] font-semibold text-slate-600">{m.nombreCargo}</p>
                  <p className="text-[10.5px] text-slate-400">Desde {fechaCorta(m.fechaIngreso).slice(0, 4)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </EstadoCarga>
    </>
  );
}
