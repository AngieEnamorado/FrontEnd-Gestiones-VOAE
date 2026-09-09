import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Solicitudes from "./pages/estudiantes/Solicitudes";
import SolicitudesGiras from "./pages/giras/Solicitudes";
import NuevaSolicitudGira from "./pages/giras/NuevaSolicitud";
import DetalleSolicitudGira from "./pages/giras/DetalleSolicitud";
import BorradoresGira from "./pages/giras/Borradores";
import MisGiras from "./pages/giras/MisGiras";
import ResumenGira from "./pages/giras/ResumenGira";
import InscripcionesGira from "./pages/giras/InscripcionesGira";
import Estadisticas from "./pages/giras/Estadisticas";
import PaginaEnConstruccion from "./pages/PaginaEnConstruccion";

// Estructura de rutas de la app. Cada entrada del sidebar
// (src/router/navigation.ts) tiene aquí su contraparte de ruta.
// Solo "Solicitudes" tiene una página construida; el resto son
// marcadores de posición listos para recibir contenido real.
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/estudiantes/solicitudes" replace />} />

        <Route path="/estudiantes">
          <Route index element={<Navigate to="solicitudes" replace />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route
            path="seguimiento"
            element={<PaginaEnConstruccion seccion="Estudiantes" titulo="Seguimiento" />}
          />
          <Route
            path="detalle"
            element={<PaginaEnConstruccion seccion="Estudiantes" titulo="Detalle" />}
          />
          <Route
            path="casos-especiales"
            element={<PaginaEnConstruccion seccion="Estudiantes" titulo="Casos especiales" />}
          />
        </Route>

        <Route path="/giras">
          <Route index element={<Navigate to="mis-giras" replace />} />
          <Route path="mis-giras" element={<MisGiras />} />
          <Route path="mis-giras/:id/resumen" element={<ResumenGira />} />
          <Route path="mis-giras/:id/inscripciones" element={<InscripcionesGira />} />
          <Route path="solicitudes" element={<SolicitudesGiras />} />
          <Route path="solicitudes/nueva" element={<NuevaSolicitudGira />} />
          <Route path="solicitudes/borradores" element={<BorradoresGira />} />
          <Route path="solicitudes/borradores/:borradorId/editar" element={<NuevaSolicitudGira />} />
          <Route path="solicitudes/:id" element={<DetalleSolicitudGira />} />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>
        <Route path="/procad" element={<PaginaEnConstruccion seccion="Procad" titulo="Procad" />} />
        <Route
          path="/voluntariado"
          element={<PaginaEnConstruccion seccion="Voluntariado" titulo="Voluntariado" />}
        />

        <Route path="/pagos" element={<PaginaEnConstruccion seccion="Pagos" titulo="Pagos" />} />
        <Route
          path="/mantenimientos"
          element={<PaginaEnConstruccion seccion="Mantenimientos" titulo="Mantenimientos" />}
        />
        <Route
          path="/seguridad"
          element={<PaginaEnConstruccion seccion="Seguridad" titulo="Seguridad" />}
        />

        <Route path="*" element={<Navigate to="/estudiantes/solicitudes" replace />} />
      </Route>
    </Routes>
  );
}