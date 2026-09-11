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
import DetalleInscripcion from "./pages/giras/DetalleInscripcion";
import Estadisticas from "./pages/giras/Estadisticas";
import EstadisticasProcad from "./pages/procad/Estadisticas";
import EstudiantesProcad from "./pages/procad/Estudiantes";
import AgrupacionesProcad from "./pages/procad/Agrupaciones";
import ConfiguracionProcad from "./pages/procad/Configuracion";
import ReportesProcad from "./pages/procad/Reportes";
import ModoDeVista from "./pages/procad/ModoDeVista";
import SoloAdministrador from "./router/SoloAdministrador";
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
          <Route
            path="mis-giras/:id/inscripciones/:inscripcionId"
            element={<DetalleInscripcion />}
          />
          <Route path="solicitudes" element={<SolicitudesGiras />} />
          <Route path="solicitudes/nueva" element={<NuevaSolicitudGira />} />
          <Route path="solicitudes/borradores" element={<BorradoresGira />} />
          <Route path="solicitudes/borradores/:borradorId/editar" element={<NuevaSolicitudGira />} />
          <Route path="solicitudes/:id" element={<DetalleSolicitudGira />} />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>
        <Route path="/procad">
          <Route index element={<Navigate to="estadisticas" replace />} />
          <Route path="estadisticas" element={<EstadisticasProcad />} />
          <Route
            path="estudiantes"
            element={
              <SoloAdministrador>
                <EstudiantesProcad />
              </SoloAdministrador>
            }
          />
          <Route
            path="agrupaciones"
            element={
              <SoloAdministrador>
                <AgrupacionesProcad />
              </SoloAdministrador>
            }
          />
          <Route
            path="configuracion"
            element={
              <SoloAdministrador>
                <ConfiguracionProcad />
              </SoloAdministrador>
            }
          />
          <Route
            path="reportes"
            element={
              <SoloAdministrador>
                <ReportesProcad />
              </SoloAdministrador>
            }
          />
          <Route path="modo" element={<ModoDeVista />} />
        </Route>
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