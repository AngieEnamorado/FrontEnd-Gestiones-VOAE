import { Outlet, useLocation } from "react-router-dom";
import TabBarMovil from "../components/voluntariado/TabBarMovil";

const BASE = "/voluntariado/portal-estudiante";
const RUTAS_RAIZ = [`${BASE}/inicio`, `${BASE}/grupos`, `${BASE}/actividades`, `${BASE}/historial`, `${BASE}/solicitudes`];

/**
 * Shell del Portal Estudiante: ancho fijo tipo móvil, sin el Sidebar/Topbar
 * de escritorio (audiencia distinta a la del resto de la app). El mockup
 * original envuelve esto en un marco de iPhone (`ios-frame.jsx`) que el
 * propio handoff pide descartar — aquí es simplemente una columna centrada.
 */
export default function MobileShell() {
  const location = useLocation();
  const esRaiz = RUTAS_RAIZ.includes(location.pathname);

  return (
    <div className="flex min-h-screen justify-center bg-slate-200 py-0 sm:py-6">
      <div className="flex h-screen w-full max-w-[430px] flex-col bg-slate-100 sm:h-[860px] sm:rounded-[32px] sm:shadow-xl sm:ring-1 sm:ring-slate-300">
        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <Outlet />
        </main>
        {esRaiz && <TabBarMovil />}
      </div>
    </div>
  );
}
