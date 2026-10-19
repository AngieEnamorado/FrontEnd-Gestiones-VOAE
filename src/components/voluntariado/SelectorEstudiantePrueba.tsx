import { useNavigate } from "react-router-dom";
import { useSesionVoluntariado } from "../../context/SesionVoluntariadoContext";

// Herramienta de demo mientras no hay sesión real: permite ver el portal como
// coordinador, como miembro o como estudiante sin grupo. Se borra, junto con
// cambiarPersona, cuando la sesión traiga la persona.
export default function SelectorEstudiantePrueba() {
  const { idPersona, persona, personasDePrueba, cambiarPersona } = useSesionVoluntariado();
  const navigate = useNavigate();

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-1.5">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-700">Prueba</span>
      <select
        value={idPersona}
        onChange={(e) => {
          cambiarPersona(Number(e.target.value));
          navigate("/voluntariado/portal-estudiante/inicio");
        }}
        className="min-w-0 flex-1 truncate rounded-md border border-amber-200 bg-white px-2 py-1 text-[11.5px] text-slate-700"
      >
        {/* La lista llega después del resumen: mientras tanto, la persona actual. */}
        {personasDePrueba.length === 0 && (
          <option value={idPersona}>
            {persona.nombrePersona} {persona.apellidosPersona}
          </option>
        )}
        {personasDePrueba.map((p) => (
          <option key={p.idPersona} value={p.idPersona}>
            {p.nombrePersona} {p.apellidosPersona}
            {p.esCoordinador ? " · coordinador" : p.grupos ? " · miembro" : " · sin grupo"}
          </option>
        ))}
      </select>
    </div>
  );
}
