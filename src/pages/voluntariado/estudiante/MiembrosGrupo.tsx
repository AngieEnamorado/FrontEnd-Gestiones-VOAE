import HeaderMovilDetalle from "../../../components/voluntariado/HeaderMovilDetalle";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import { grupoCoordinadoPor } from "../../../data/voluntariadoSelectors";

export default function MiembrosGrupo() {
  const grupo = grupoCoordinadoPor(estudianteActual.numeroCuenta);

  return (
    <>
      <HeaderMovilDetalle titulo="Miembros del grupo" subtitulo={grupo?.nombre} />
      <div className="flex flex-col divide-y divide-slate-100 px-1 py-1">
        {grupo?.miembros.map((m) => (
          <div key={m.numeroCuenta} className="flex items-center gap-3 px-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-unah-navy">
              {m.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-bold text-slate-800">{m.nombre}</p>
                {m.esFundador && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                    FUNDADOR
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-slate-400">{m.numeroCuenta} · {m.carrera}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11.5px] font-semibold text-slate-600">{m.cargo}</p>
              <p className="text-[10.5px] text-slate-400">Desde {m.anioIngreso}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
