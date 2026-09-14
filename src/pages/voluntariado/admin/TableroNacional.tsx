import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineClock,
} from "react-icons/hi2";
import EstadisticaCard from "../../../components/EstadisticaCard";
import { campus, redesTematicas, nombreCampus } from "../../../data/mockCatalogosVoluntariado";
import { gruposVoluntariado } from "../../../data/mockGruposVoluntariado";
import { actividadesVoluntariado } from "../../../data/mockActividadesVoluntariado";
import { horasTotalesDeGrupo, participantesUnicos } from "../../../data/voluntariadoSelectors";
import { claseBarraColor } from "../../../components/voluntariado/colores";
import type { RolPortalAdministrativo } from "../../../types";

const CAMPUS_ENLACE = "cu";

export default function TableroNacional() {
  const [rol, setRol] = useState<RolPortalAdministrativo>("admin");

  const totalHoras = gruposVoluntariado.reduce((t, g) => t + horasTotalesDeGrupo(g.id), 0);
  const totalParticipantes = participantesUnicos(actividadesVoluntariado.map((a) => a.id));

  const campusVisibles = rol === "enlace" ? campus.filter((c) => c.id === CAMPUS_ENLACE) : campus;

  const filasCampus = campusVisibles.map((c) => {
    const gruposDelCampus = gruposVoluntariado.filter((g) => g.campusId === c.id);
    const horasCampus = gruposDelCampus.reduce((t, g) => t + horasTotalesDeGrupo(g.id), 0);
    return { campus: c, grupos: gruposDelCampus.length, horas: horasCampus };
  });

  const semaforo = campusVisibles.map((c, i) => ({
    campus: c,
    estado: (["Entregado", "Por vencer", "Atrasado"] as const)[i % 3],
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-slate-800">Tablero nacional</h1>
        <button
          type="button"
          onClick={() => setRol((r) => (r === "admin" ? "enlace" : "admin"))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
        >
          Rol de prueba: {rol === "admin" ? "Administrador" : "Enlace VOAE"}
        </button>
      </div>

      {rol === "enlace" && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-[13px] font-semibold text-unah-navy">
          Vista de Enlace VOAE — mostrando únicamente {nombreCampus(CAMPUS_ENLACE)}. Solo lectura.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <EstadisticaCard
          icon={HiOutlineUserGroup}
          label={rol === "enlace" ? "Grupos del campus" : "Grupos"}
          valor={rol === "enlace" ? filasCampus.reduce((t, f) => t + f.grupos, 0) : gruposVoluntariado.length}
          colorFondo="bg-blue-50"
          colorIcono="text-unah-navy"
          colorTexto="text-unah-navy"
        />
        <EstadisticaCard
          icon={HiOutlineCalendarDays}
          label="Actividades"
          valor={actividadesVoluntariado.length}
          colorFondo="bg-orange-50"
          colorIcono="text-unah-orange"
          colorTexto="text-unah-orange-dark"
        />
        <EstadisticaCard
          icon={HiOutlineUsers}
          label="Participantes"
          valor={totalParticipantes}
          colorFondo="bg-emerald-50"
          colorIcono="text-emerald-600"
          colorTexto="text-emerald-700"
        />
        <EstadisticaCard
          icon={HiOutlineClock}
          label="Horas"
          valor={rol === "enlace" ? filasCampus.reduce((t, f) => t + f.horas, 0) : totalHoras}
          colorFondo="bg-violet-50"
          colorIcono="text-violet-600"
          colorTexto="text-violet-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Por red temática</h2>
          <div className="mt-4 flex flex-col gap-3">
            {redesTematicas.map((red) => {
              const horasRed = gruposVoluntariado
                .filter((g) => g.redesIds.includes(red.id))
                .reduce((t, g) => t + horasTotalesDeGrupo(g.id), 0);
              const maximo = Math.max(1, ...redesTematicas.map((r) =>
                gruposVoluntariado.filter((g) => g.redesIds.includes(r.id)).reduce((t, g) => t + horasTotalesDeGrupo(g.id), 0),
              ));
              return (
                <div key={red.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">{red.nombre}</span>
                    <span className="text-slate-400">{horasRed}h</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${claseBarraColor[red.color]}`}
                      style={{ width: `${(horasRed / maximo) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Semáforo de entrega de informes</h2>
          <div className="mt-4 flex flex-col divide-y divide-slate-100">
            {semaforo.map(({ campus: c, estado }) => (
              <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-600">{c.nombre}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      estado === "Entregado" ? "bg-emerald-500" : estado === "Por vencer" ? "bg-amber-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={
                      estado === "Entregado" ? "text-emerald-600" : estado === "Por vencer" ? "text-amber-600" : "text-red-600"
                    }
                  >
                    {estado}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-sm font-bold text-slate-700">Desglose por campus</h2>
          <Link to="/voluntariado/portal-estudiante/inicio" className="text-xs font-semibold text-unah-orange">
            Ver portal estudiante ›
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3">Campus</th>
                <th className="px-5 py-3">Grupos</th>
                <th className="px-5 py-3">Horas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filasCampus.map((fila) => (
                <tr key={fila.campus.id} className="transition-colors duration-150 hover:bg-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-700">{fila.campus.nombre}</td>
                  <td className="px-5 py-3 text-slate-500">{fila.grupos}</td>
                  <td className="px-5 py-3 text-slate-500">{fila.horas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
