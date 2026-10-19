import { Link } from "react-router-dom";
import {
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineUsers,
  HiOutlineClock,
} from "react-icons/hi2";
import EstadisticaCard from "../../../components/EstadisticaCard";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { claseBarraColor } from "../../../components/voluntariado/colores";
import { voluntariadoApi } from "../../../api/voluntariado";
import { useApi } from "../../../utils/useApi";
import RolPruebaAdmin from "../../../components/voluntariado/RolPruebaAdmin";
import { useRolAdminVoluntariado } from "../../../utils/rolAdminVoluntariado";
import { colorDeRed, fechaCorta, formatoHoras, nombreTrimestre } from "../../../utils/voluntariado";

export default function TableroNacional() {
  const rol = useRolAdminVoluntariado();
  const carga = useApi(() => voluntariadoApi.tablero(), []);
  const tablero = carga.datos;

  const campusVisibles = (tablero?.porCampus ?? []).filter(
    (c) => rol.veIdCampus(c.idCampus),
  );
  const suma = (campo: "grupos" | "participantes" | "horas") => campusVisibles.reduce((t, c) => t + c[campo], 0);
  const { esEnlace } = rol;
  const maximoRed = Math.max(1, ...(tablero?.porRed ?? []).map((r) => r.horas));

  return (
    <div className="flex flex-col gap-5">
      <RolPruebaAdmin />
      <h1 className="text-base font-bold text-slate-800">{esEnlace ? `Tablero · ${rol.nombreCampus}` : "Tablero nacional"}</h1>

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={tablero !== undefined}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <EstadisticaCard
          icon={HiOutlineUserGroup}
          label={esEnlace ? "Grupos del campus" : "Grupos"}
          valor={esEnlace ? suma("grupos") : tablero?.totales.grupos ?? 0}
          colorFondo="bg-blue-50"
          colorIcono="text-unah-navy"
          colorTexto="text-unah-navy"
        />
        <EstadisticaCard
          icon={HiOutlineCalendarDays}
          label={esEnlace ? "Actividades (nacional)" : "Actividades"}
          valor={tablero?.totales.actividades ?? 0}
          colorFondo="bg-orange-50"
          colorIcono="text-unah-orange"
          colorTexto="text-unah-orange-dark"
        />
        <EstadisticaCard
          icon={HiOutlineUsers}
          label="Participantes"
          valor={esEnlace ? suma("participantes") : tablero?.totales.participantes ?? 0}
          colorFondo="bg-emerald-50"
          colorIcono="text-emerald-600"
          colorTexto="text-emerald-700"
        />
        <EstadisticaCard
          icon={HiOutlineClock}
          label="Horas"
          valor={formatoHoras(esEnlace ? suma("horas") : tablero?.totales.horas ?? 0)}
          colorFondo="bg-violet-50"
          colorIcono="text-violet-600"
          colorTexto="text-violet-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Por red temática{esEnlace && " (nacional)"}</h2>
          <div className="mt-4 flex flex-col gap-3">
            {(tablero?.porRed ?? []).map((red) => (
              <div key={red.idRedTematica}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">{red.nombreRedTematica}</span>
                  <span className="text-slate-400">{formatoHoras(red.horas)}h</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${claseBarraColor[colorDeRed(red.idRedTematica)]}`}
                    style={{ width: `${(red.horas / maximoRed) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">Semáforo de entrega de informes</h2>
          {tablero?.trimestreVigente && (
            <p className="mt-0.5 text-xs text-slate-400">
              {nombreTrimestre(tablero.trimestreVigente)} · vence {fechaCorta(tablero.trimestreVigente.fechaLimiteInforme)}
            </p>
          )}
          <div className="mt-4 flex flex-col divide-y divide-slate-100">
            {campusVisibles.map(({ idCampus, nombreCampus, semaforo: estado }) => (
              <div key={idCampus} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-600">{nombreCampus}</span>
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
              {campusVisibles.map((fila) => (
                <tr key={fila.idCampus} className="transition-colors duration-150 hover:bg-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-700">{fila.nombreCampus}</td>
                  <td className="px-5 py-3 text-slate-500">{fila.grupos}</td>
                  <td className="px-5 py-3 text-slate-500">{formatoHoras(fila.horas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </EstadoCarga>
    </div>
  );
}
