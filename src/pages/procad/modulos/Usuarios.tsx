import BotonAccion from "../../../components/procad/BotonAccion";
import PildoraEstado from "../../../components/procad/PildoraEstado";
import TablaDatos from "../../../components/procad/TablaDatos";
import { useProcad } from "../../../context/ProcadContext";

/** Cuentas y roles de quienes usan la plataforma. */
export default function Usuarios() {
  const { usuarios, alternarUsuario } = useProcad();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <TablaDatos
        anchoMinimo="820px"
        columnas={[
          { label: "Usuario" },
          { label: "Correo" },
          { label: "Rol" },
          { label: "Estado" },
          { label: "Acciones" },
        ]}
        filas={usuarios.map((u) => [
          <span key={`n-${u.correo}`} className="font-medium text-slate-700">
            {u.nombre}
          </span>,
          <span key={`c-${u.correo}`} className="text-xs">
            {u.correo}
          </span>,
          u.rol,
          <PildoraEstado key={`e-${u.correo}`} tono={u.estado === "activo" ? "activo" : "inactivo"}>
            {u.estado === "activo" ? "Activa" : "Desactivada"}
          </PildoraEstado>,
          <BotonAccion
            key={`b-${u.correo}`}
            tono={u.estado === "activo" ? "rechazar" : "aprobar"}
            onClick={() => alternarUsuario(u.correo)}
          >
            {u.estado === "activo" ? "Desactivar" : "Reactivar"}
          </BotonAccion>,
        ])}
      />

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        El rol de Administrador PROCAD solo puede asignarse a una persona con perfil institucional
        de docente activo.
      </p>
    </div>
  );
}
