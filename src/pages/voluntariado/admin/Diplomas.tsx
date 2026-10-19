import { useState } from "react";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import { voluntariadoApi, type ParticipacionMiembroApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import RolPruebaAdmin from "../../../components/voluntariado/RolPruebaAdmin";
import { useRolAdminVoluntariado } from "../../../utils/rolAdminVoluntariado";

export default function Diplomas() {
  // Porcentaje y umbral vienen calculados por la API contra la base: el
  // cliente no decide quién es elegible.
  const carga = useApi(() => voluntariadoApi.participacionMiembros(), []);
  const [enCurso, setEnCurso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const umbral = carga.datos?.umbral ?? 0;
  const rol = useRolAdminVoluntariado();
  const filas = (carga.datos?.miembros ?? []).filter((f) => rol.veCampus(f.campus));

  async function emitir(f: ParticipacionMiembroApi) {
    const clave = `${f.idGrupo}-${f.idPersona}`;
    setEnCurso(clave);
    setError(null);
    try {
      await voluntariadoApi.emitirDiploma({
        idGrupo: f.idGrupo,
        idPersona: f.idPersona,
        ventanaDiploma: String(new Date().getFullYear()),
        actividadesGrupo: f.actividadesGrupo,
        actividadesAsistidas: f.actividadesAsistidas,
        porcentajeParticipacion: f.porcentajeParticipacion,
      });
      carga.recargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnCurso(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <RolPruebaAdmin />
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-base font-bold text-slate-800">Diplomas de reconocimiento</h1>
        {carga.datos && <p className="text-xs text-slate-400">Umbral de elegibilidad: {umbral}% de participación</p>}
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Estudiante</th>
                  <th className="px-5 py-3">Grupo</th>
                  <th className="px-5 py-3">Campus</th>
                  <th className="px-5 py-3">% Participación</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filas.map((f) => {
                  const clave = `${f.idGrupo}-${f.idPersona}`;
                  const porcentaje = Math.round(f.porcentajeParticipacion);
                  const elegible = f.porcentajeParticipacion >= umbral;
                  const emitido = f.yaTieneDiploma === 1;
                  return (
                    <tr key={clave} className="transition-colors duration-150 hover:bg-slate-100">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{f.nombre}</td>
                      <td className="px-5 py-3.5 text-slate-600">{f.nombreGrupo}</td>
                      <td className="px-5 py-3.5 text-slate-600">{f.campus}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-[70px] overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${porcentaje}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {porcentaje}% <span className="font-normal text-slate-400">({f.actividadesAsistidas}/{f.actividadesGrupo})</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={!elegible || emitido || enCurso === clave}
                          onClick={() => emitir(f)}
                          className="rounded-lg bg-unah-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-unah-navy-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {emitido ? "Diploma emitido ✓" : "Emitir diploma"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                      No hay miembros activos en ningún grupo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </EstadoCarga>
    </div>
  );
}
