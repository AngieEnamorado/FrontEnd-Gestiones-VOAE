import { catalogoApi } from "../../api/catalogo";
import { useApi } from "../../utils/useApi";
import { fijarRolAdmin, useRolAdminVoluntariado } from "../../utils/rolAdminVoluntariado";

// Herramienta de demo mientras no hay sesión real: actuar como Administrador
// (todo el país) o como Enlace VOAE de un campus. Va arriba de cada pantalla
// del panel administrativo; se borra cuando la sesión traiga rol y campus.
export default function RolPruebaAdmin() {
  const rol = useRolAdminVoluntariado();
  const campus = useApi(() => catalogoApi.campus(), []);

  function elegirCampus(idCampus: number) {
    const elegido = campus.datos?.find((c) => c.idCampus === idCampus);
    if (elegido) fijarRolAdmin({ rol: "enlace", idCampus, nombreCampus: elegido.nombreCampus });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Prueba</span>
      <select
        aria-label="Rol de prueba"
        value={rol.rol}
        onChange={(e) =>
          fijarRolAdmin({
            rol: e.target.value === "enlace" ? "enlace" : "admin",
            idCampus: rol.idCampus,
            nombreCampus: rol.nombreCampus,
          })
        }
        className="rounded-md border border-amber-200 bg-white px-2 py-1 text-xs text-slate-700"
      >
        <option value="admin">Administrador · todo el país</option>
        <option value="enlace">Enlace VOAE · un campus</option>
      </select>
      {rol.esEnlace && (
        <>
          <select
            aria-label="Campus del enlace"
            value={rol.idCampus}
            onChange={(e) => elegirCampus(Number(e.target.value))}
            className="min-w-0 max-w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-xs text-slate-700"
          >
            {/* Mientras llega el catálogo, el campus guardado. */}
            {!campus.datos && <option value={rol.idCampus}>{rol.nombreCampus}</option>}
            {campus.datos?.map((c) => (
              <option key={c.idCampus} value={c.idCampus}>
                {c.nombreCampus}
              </option>
            ))}
          </select>
          <span className="text-xs font-semibold text-amber-800">Solo ves y dictaminas lo de este campus.</span>
        </>
      )}
    </div>
  );
}
