import { useState } from "react";
import LogoGrupo from "../../../components/voluntariado/LogoGrupo";
import EstadoCarga from "../../../components/voluntariado/EstadoCarga";
import EditarGrupoModal from "./EditarGrupoModal";
import { claseChipColor } from "../../../components/voluntariado/colores";
import { voluntariadoApi, type GrupoResumenApi } from "../../../api/voluntariado";
import { mensajeDeError } from "../../../api/clienteVoluntariado";
import { useApi } from "../../../utils/useApi";
import { colorDeGrupo, colorDeRed, iniciales, listaDeIds } from "../../../utils/voluntariado";

export default function GestionGrupos() {
  const carga = useApi(() => Promise.all([voluntariadoApi.grupos(), voluntariadoApi.catalogos()]), []);
  const [grupos, catalogos] = carga.datos ?? [[], undefined];
  const [reasignando, setReasignando] = useState<number | null>(null);
  const [editando, setEditando] = useState<GrupoResumenApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reasignar(idGrupo: number, idPersona: number) {
    setError(null);
    try {
      await voluntariadoApi.reasignarCoordinador(idGrupo, idPersona);
      carga.recargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setReasignando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-base font-bold text-slate-800">Gestión de grupos</h1>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}

      <EstadoCarga cargando={carga.cargando} error={carga.error} onReintentar={carga.recargar} listo={carga.datos !== undefined}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Grupo</th>
                  <th className="px-5 py-3">Campus</th>
                  <th className="px-5 py-3">Coordinador</th>
                  <th className="px-5 py-3">Redes temáticas</th>
                  <th className="px-5 py-3">Miembros</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grupos.map((grupo) => (
                  <tr key={grupo.idGrupo} className="transition-colors duration-150 hover:bg-slate-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <LogoGrupo iniciales={iniciales(grupo.nombreGrupo)} color={colorDeGrupo(grupo.idGrupo)} tamano="sm" />
                        <span className="font-semibold text-slate-800">{grupo.nombreGrupo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{grupo.campus}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {reasignando === grupo.idGrupo ? (
                        <SelectorCoordinador
                          grupo={grupo}
                          onElegir={(idPersona) => reasignar(grupo.idGrupo, idPersona)}
                          onCancelar={() => setReasignando(null)}
                        />
                      ) : (
                        grupo.nombreCoordinador ?? <span className="text-amber-600">Sin coordinador</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {listaDeIds(grupo.idsRedesTematicas).map((idRed) => (
                          <span key={idRed} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${claseChipColor[colorDeRed(idRed)]}`}>
                            {catalogos?.redes.find((r) => r.idRedTematica === idRed)?.nombreRedTematica}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{grupo.totalMiembros}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditando(grupo)}
                          className="text-xs font-semibold text-unah-navy hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setReasignando(grupo.idGrupo)}
                          className="text-xs font-semibold text-unah-orange hover:underline"
                        >
                          Reasignar ›
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </EstadoCarga>

      <EditarGrupoModal
        item={editando}
        redes={catalogos?.redes ?? []}
        onClose={() => setEditando(null)}
        onGuardado={carga.recargar}
      />
    </div>
  );
}

// Carga los miembros solo al abrir el selector: la tabla no los necesita.
function SelectorCoordinador({
  grupo,
  onElegir,
  onCancelar,
}: {
  grupo: GrupoResumenApi;
  onElegir: (idPersona: number) => void;
  onCancelar: () => void;
}) {
  const miembros = useApi(() => voluntariadoApi.miembros(grupo.idGrupo), [grupo.idGrupo]);
  if (!miembros.datos) return <span className="text-xs text-slate-400">Cargando miembros…</span>;

  return (
    <select
      autoFocus
      value={grupo.idPersonaCoordinador ?? ""}
      onChange={(e) => onElegir(Number(e.target.value))}
      onBlur={onCancelar}
      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
    >
      <option value="" disabled>Elegir miembro</option>
      {miembros.datos.map((m) => (
        <option key={m.idPersona} value={m.idPersona}>
          {m.nombrePersona} {m.apellidosPersona}
        </option>
      ))}
    </select>
  );
}
