import { useState } from "react";
import { HiOutlineCalendarDays, HiOutlineMapPin } from "react-icons/hi2";
import { actividadesVoluntariado } from "../../../data/mockActividadesVoluntariado";
import { inscripcionesDeActividad } from "../../../data/voluntariadoSelectors";
import { grupoPorId } from "../../../data/mockGruposVoluntariado";
import { estudianteActual } from "../../../data/mockEstudianteVoluntariado";
import type { TipoParticipante } from "../../../types";

const HOY = "2026-09-09";

export default function ActividadesDisponibles() {
  const cuenta = estudianteActual.numeroCuenta;
  const disponibles = actividadesVoluntariado.filter((a) => a.estado === "APROBADA" && a.fecha >= HOY);

  const [inscripcionesLocales, setInscripcionesLocales] = useState<Record<string, TipoParticipante>>(() => {
    const iniciales: Record<string, TipoParticipante> = {};
    disponibles.forEach((a) => {
      const propia = inscripcionesDeActividad(a.id).find((i) => i.estudianteCuenta === cuenta);
      if (propia) iniciales[a.id] = propia.tipoParticipante;
    });
    return iniciales;
  });

  function inscribirse(actividadId: string, grupoId: string) {
    const grupo = grupoPorId(grupoId);
    const esMiembro = grupo?.miembros.some((m) => m.numeroCuenta === cuenta) ?? false;
    setInscripcionesLocales((prev) => ({ ...prev, [actividadId]: esMiembro ? "voluntario activo" : "participante" }));
  }

  function cancelar(actividadId: string) {
    setInscripcionesLocales((prev) => {
      const copia = { ...prev };
      delete copia[actividadId];
      return copia;
    });
  }

  return (
    <div className="px-4 py-4">
      <h1 className="text-[17px] font-bold text-slate-800">Actividades disponibles</h1>

      <div className="mt-4 flex flex-col gap-3">
        {disponibles.map((actividad) => {
          const grupo = grupoPorId(actividad.grupoId);
          const cupoOcupado = inscripcionesDeActividad(actividad.id).length;
          const inscrito = inscripcionesLocales[actividad.id];

          return (
            <div key={actividad.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13.5px] font-bold text-slate-800">{actividad.nombre}</p>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10.5px] font-bold text-unah-navy">
                  {cupoOcupado}/{actividad.cupo}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">{grupo?.nombre}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{actividad.objetivo}</p>

              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-slate-500">
                <span className="flex items-center gap-1">
                  <HiOutlineCalendarDays className="h-3.5 w-3.5" />
                  {actividad.fecha}
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineMapPin className="h-3.5 w-3.5" />
                  {actividad.lugar}
                </span>
              </div>

              {inscrito ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <p className="text-[12px] font-semibold text-emerald-700">✓ Inscrito como {inscrito}</p>
                  <button
                    type="button"
                    onClick={() => cancelar(actividad.id)}
                    className="text-[12px] font-semibold text-rose-600"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inscribirse(actividad.id, actividad.grupoId)}
                  className="mt-3 w-full rounded-xl bg-unah-navy py-2.5 text-[13px] font-semibold text-white"
                >
                  Inscribirme
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
