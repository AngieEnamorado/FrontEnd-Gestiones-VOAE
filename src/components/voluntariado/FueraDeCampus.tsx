import { Link } from "react-router-dom";
import RolPruebaAdmin from "./RolPruebaAdmin";

// Lo que ve un Enlace VOAE al abrir (p. ej. por URL directa) un registro de
// otro campus: ni el detalle ni los botones de dictamen.
export default function FueraDeCampus({ campus, volverA, textoVolver }: { campus: string; volverA: string; textoVolver: string }) {
  return (
    <div className="flex flex-col gap-4">
      <RolPruebaAdmin />
      <Link to={volverA} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
        ‹ {textoVolver}
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-700">Este registro es de otro campus</p>
        <p className="mt-1 text-sm text-slate-500">Como Enlace VOAE de {campus} solo puedes ver y dictaminar lo de tu campus.</p>
      </div>
    </div>
  );
}
