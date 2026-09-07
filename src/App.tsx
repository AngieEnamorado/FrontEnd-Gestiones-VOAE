import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Solicitudes from "./pages/estudiantes/Solicitudes";
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

        <Route path="/giras" element={<PaginaEnConstruccion seccion="Giras" titulo="Giras" />} />
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