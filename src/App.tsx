import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import MobileShell from "./layouts/MobileShell";
import Solicitudes from "./pages/estudiantes/Solicitudes";
import SolicitudesGiras from "./pages/giras/Solicitudes";
import NuevaSolicitudGira from "./pages/giras/NuevaSolicitud";
import DetalleSolicitudGira from "./pages/giras/DetalleSolicitud";
import BorradoresGira from "./pages/giras/Borradores";
import MisGiras from "./pages/giras/MisGiras";
import ResumenGira from "./pages/giras/ResumenGira";
import InscripcionesGira from "./pages/giras/InscripcionesGira";
import DetalleInscripcion from "./pages/giras/DetalleInscripcion";
import Inscripciones from "./pages/giras/Inscripciones";
import NuevaInscripcion from "./pages/giras/NuevaInscripcion";
import BorradoresInscripcion from "./pages/giras/BorradoresInscripcion";
import Estadisticas from "./pages/giras/Estadisticas";
import EstadisticasProcad from "./pages/procad/Estadisticas";
import ReportePersonalizado from "./pages/procad/ReportePersonalizado";
import EstudiantesProcad from "./pages/procad/Estudiantes";
import AgrupacionesProcad from "./pages/procad/Agrupaciones";
import GaleriaProcad from "./pages/procad/Galeria";
import ConfiguracionProcad from "./pages/procad/Configuracion";
import ReportesProcad from "./pages/procad/Reportes";
import ModoDeVista from "./pages/procad/ModoDeVista";
import ModoDeVistaGiras from "./pages/giras/ModoDeVista";
import ConfiguracionGiras from "./pages/giras/Configuracion";
import SoloAdministrador from "./router/SoloAdministrador";
import AccesoGiras from "./router/AccesoGiras";
import PaginaEnConstruccion from "./pages/PaginaEnConstruccion";

import TableroNacional from "./pages/voluntariado/admin/TableroNacional";
import SolicitudesGruposLista from "./pages/voluntariado/admin/SolicitudesGruposLista";
import SolicitudGrupoDetalle from "./pages/voluntariado/admin/SolicitudGrupoDetalle";
import AprobacionActividades from "./pages/voluntariado/admin/AprobacionActividades";
import InformesLista from "./pages/voluntariado/admin/InformesLista";
import InformeDetalleAdmin from "./pages/voluntariado/admin/InformeDetalle";
import GestionGrupos from "./pages/voluntariado/admin/GestionGrupos";
import Diplomas from "./pages/voluntariado/admin/Diplomas";
import Catalogos from "./pages/voluntariado/admin/Catalogos";
import EstadisticasVoluntariado from "./pages/voluntariado/admin/Estadisticas";

import Inicio from "./pages/voluntariado/estudiante/Inicio";
import CatalogoGrupos from "./pages/voluntariado/estudiante/CatalogoGrupos";
import DetalleGrupo from "./pages/voluntariado/estudiante/DetalleGrupo";
import CrearGrupoWizard from "./pages/voluntariado/estudiante/CrearGrupoWizard";
import ActividadesDisponibles from "./pages/voluntariado/estudiante/ActividadesDisponibles";
import MiHistorial from "./pages/voluntariado/estudiante/MiHistorial";
import MisSolicitudes from "./pages/voluntariado/estudiante/MisSolicitudes";
import PanelCoordinador from "./pages/voluntariado/estudiante/PanelCoordinador";
import SolicitudesPendientes from "./pages/voluntariado/estudiante/SolicitudesPendientes";
import MiembrosGrupo from "./pages/voluntariado/estudiante/MiembrosGrupo";
import CrearSolicitudActividad from "./pages/voluntariado/estudiante/CrearSolicitudActividad";
import PasarLista from "./pages/voluntariado/estudiante/PasarLista";
import ResultadosEvidencia from "./pages/voluntariado/estudiante/ResultadosEvidencia";
import InformeEconomico from "./pages/voluntariado/estudiante/InformeEconomico";
import InformeTrimestralEstudiante from "./pages/voluntariado/estudiante/InformeTrimestral";

// Estructura de rutas de la app. Cada entrada del sidebar
// (src/router/navigation.ts) tiene aquí su contraparte de ruta.
// El Portal Estudiante de Voluntariado es la excepción: es una audiencia
// distinta (estudiantes, no staff VOAE) y por eso vive fuera de
// <MainLayout>, con su propio shell móvil (ver MobileShell) — no aparece
// en el sidebar, se llega por un enlace desde el Tablero nacional.
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

        {/* AccesoGiras hace de guardia y de índice: `/giras` a secas no es una
            página, así que lo manda a la primera que le toca al rol activo. */}
        <Route path="/giras" element={<AccesoGiras />}>
          <Route path="modo" element={<ModoDeVistaGiras />} />
          <Route path="configuracion" element={<ConfiguracionGiras />} />
          <Route path="mis-giras" element={<MisGiras />} />
          <Route path="mis-giras/:id/resumen" element={<ResumenGira />} />
          <Route path="mis-giras/:id/inscripciones" element={<InscripcionesGira />} />
          <Route path="mis-giras/:id/inscripciones/nueva" element={<NuevaInscripcion />} />
          <Route
            path="mis-giras/:id/inscripciones/:inscripcionId"
            element={<DetalleInscripcion />}
          />
          <Route path="solicitudes" element={<SolicitudesGiras />} />
          <Route path="solicitudes/nueva" element={<NuevaSolicitudGira />} />
          <Route path="solicitudes/borradores" element={<BorradoresGira />} />
          <Route path="solicitudes/borradores/:borradorId/editar" element={<NuevaSolicitudGira />} />
          <Route path="solicitudes/:id" element={<DetalleSolicitudGira />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="inscripciones/nueva" element={<NuevaInscripcion />} />
          <Route path="inscripciones/borradores" element={<BorradoresInscripcion />} />
          <Route
            path="inscripciones/borradores/:borradorId/editar"
            element={<NuevaInscripcion />}
          />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>
        <Route path="/procad">
          <Route index element={<Navigate to="estadisticas" replace />} />
          <Route path="estadisticas" element={<EstadisticasProcad />} />
          {/* El reporte personalizado se arma desde el panel y lleva su
              selección en la URL, así que no es una entrada del sidebar. */}
          <Route path="estadisticas/personalizado" element={<ReportePersonalizado />} />
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
            path="galeria"
            element={
              <SoloAdministrador>
                <GaleriaProcad />
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

        <Route path="/voluntariado">
          <Route index element={<Navigate to="tablero" replace />} />
          <Route path="tablero" element={<TableroNacional />} />
          <Route path="estadisticas" element={<EstadisticasVoluntariado />} />
          <Route path="solicitudes-grupos" element={<SolicitudesGruposLista />} />
          <Route path="solicitudes-grupos/:id" element={<SolicitudGrupoDetalle />} />
          <Route path="actividades/aprobacion" element={<AprobacionActividades />} />
          <Route path="informes" element={<InformesLista />} />
          <Route path="informes/:id" element={<InformeDetalleAdmin />} />
          <Route path="grupos" element={<GestionGrupos />} />
          <Route path="diplomas" element={<Diplomas />} />
          <Route path="catalogos" element={<Catalogos />} />
        </Route>

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

      <Route path="/voluntariado/portal-estudiante" element={<MobileShell />}>
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="grupos" element={<CatalogoGrupos />} />
        <Route path="grupos/nuevo" element={<CrearGrupoWizard />} />
        <Route path="grupos/:id" element={<DetalleGrupo />} />
        <Route path="actividades" element={<ActividadesDisponibles />} />
        <Route path="historial" element={<MiHistorial />} />
        <Route path="solicitudes" element={<MisSolicitudes />} />
        <Route path="coordinador" element={<PanelCoordinador />} />
        <Route path="coordinador/solicitudes" element={<SolicitudesPendientes />} />
        <Route path="coordinador/miembros" element={<MiembrosGrupo />} />
        <Route path="coordinador/actividades/nueva" element={<CrearSolicitudActividad />} />
        <Route path="coordinador/pasar-lista/:actividadId" element={<PasarLista />} />
        <Route path="coordinador/evidencia/:actividadId" element={<ResultadosEvidencia />} />
        <Route path="coordinador/informe-economico/:actividadId" element={<InformeEconomico />} />
        <Route path="coordinador/informe-trimestral/:grupoId" element={<InformeTrimestralEstudiante />} />
      </Route>
    </Routes>
  );
}
