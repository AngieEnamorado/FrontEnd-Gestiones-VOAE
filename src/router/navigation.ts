import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineUser,
  HiOutlineCurrencyDollar,
  HiOutlineCog6Tooth,
  HiOutlineLockClosed,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBar,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlineMap,
  HiOutlineTrophy,
  HiOutlineHandRaised,
  HiOutlinePhoto,
  HiOutlinePresentationChartLine,
  HiOutlineUserGroup,
  HiOutlineDocumentChartBar,
  HiOutlineArrowsRightLeft,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import type { RolGira, RolProcad } from "../types";

/**
 * Este archivo es "la idea del routeo": describe qué páginas existirá
 * en la app y qué ruta le correspondería a cada botón del sidebar.
 * El Sidebar solo lee esta lista para dibujar los botones; todavía no
 * se conecta cada uno a una página distinta con contenido propio (eso
 * queda para cuando se construya cada módulo). Por ahora, cada ruta
 * apunta a una página de marcador de posición, excepto Solicitudes.
 */
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: IconType;
  children?: NavItem[];
  /**
   * Clave del contador de pendientes que el Sidebar dibuja junto a la entrada.
   * Solo se declara aquí; de dónde sale el número lo resuelve el Sidebar.
   */
  contador?: "procadEstudiantes" | "procadAgrupaciones";
  /**
   * Roles de PROCAD que pueden ver esta entrada. Omitirlo significa que la ve
   * cualquiera — que es el caso de todo lo que está fuera de PROCAD.
   */
  roles?: RolProcad[];
  /**
   * Roles de Giras que pueden ver esta entrada. Omitirlo significa que la ven
   * todos, que es lo que debe pasar con "Modo de vista": sin él, quien elige un
   * rol sin páginas no tendría cómo volver a cambiarlo.
   */
  rolesGira?: RolGira[];
}

/** La pantalla de demostración para cambiar de rol en Giras. Nunca se oculta. */
export const RUTA_MODO_GIRAS = "/giras/modo";

export const navigationItems: NavItem[] = [
  {
    id: "estudiantes",
    label: "Estudiantes",
    path: "/estudiantes",
    icon: HiOutlineUser,
    children: [
      {
        id: "solicitudes",
        label: "Solicitudes",
        path: "/estudiantes/solicitudes",
        icon: HiOutlineClipboardDocumentList,
      },
      {
        id: "seguimiento",
        label: "Seguimiento",
        path: "/estudiantes/seguimiento",
        icon: HiOutlineChartBar,
      },
      {
        id: "detalle",
        label: "Detalle",
        path: "/estudiantes/detalle",
        icon: HiOutlineDocumentMagnifyingGlass,
      },
      {
        id: "casos-especiales",
        label: "Casos especiales",
        path: "/estudiantes/casos-especiales",
        icon: HiOutlineExclamationTriangle,
      },
    ],
  },
  {
    id: "giras",
    label: "Giras",
    path: "/giras",
    icon: HiOutlineMapPin,
    // El orden de esta lista es el orden del menú y también el de "primera
    // página del rol" (ver `rutaInicialGira`): por eso Solicitudes e
    // Inscripciones van antes que Mis giras.
    children: [
      {
        id: "solicitudes",
        label: "Solicitudes",
        path: "/giras/solicitudes",
        icon: HiOutlineClipboardDocumentList,
        rolesGira: ["jefe-mision", "jefe-aprobacion"],
      },
      {
        id: "inscripciones",
        label: "Inscripciones",
        path: "/giras/inscripciones",
        icon: HiOutlineClipboardDocumentCheck,
        rolesGira: ["estudiante"],
      },
      {
        id: "mis-giras",
        label: "Mis giras",
        path: "/giras/mis-giras",
        icon: HiOutlineMap,
        rolesGira: ["jefe-mision", "jefe-aprobacion", "estudiante"],
      },
      {
        id: "estadisticas",
        label: "Estadísticas",
        path: "/giras/estadisticas",
        icon: HiOutlinePresentationChartLine,
        rolesGira: ["vicerrectoria", "jefe-mision", "jefe-aprobacion"],
      },
      {
        id: "configuracion",
        label: "Configuraciones",
        path: "/giras/configuracion",
        icon: HiOutlineAdjustmentsHorizontal,
        rolesGira: ["administrador"],
      },
      {
        id: "modo",
        label: "Modo de vista",
        path: RUTA_MODO_GIRAS,
        icon: HiOutlineArrowsRightLeft,
      },
    ],
  },
  {
    id: "procad",
    label: "PROCAD",
    path: "/procad",
    icon: HiOutlineTrophy,
    children: [
      {
        id: "estadisticas",
        label: "Estadísticas",
        path: "/procad/estadisticas",
        icon: HiOutlinePresentationChartLine,
      },
      {
        id: "estudiantes",
        label: "Estudiantes",
        path: "/procad/estudiantes",
        icon: HiOutlineUser,
        contador: "procadEstudiantes",
        roles: ["administrador"],
      },
      {
        id: "agrupaciones",
        label: "Agrupaciones",
        path: "/procad/agrupaciones",
        icon: HiOutlineUserGroup,
        contador: "procadAgrupaciones",
        roles: ["administrador"],
      },
      {
        id: "galeria",
        label: "Galería",
        path: "/procad/galeria",
        icon: HiOutlinePhoto,
        roles: ["administrador"],
      },
      {
        id: "configuracion",
        label: "Configuración",
        path: "/procad/configuracion",
        icon: HiOutlineCog6Tooth,
        roles: ["administrador"],
      },
      {
        id: "reportes",
        label: "Reportes",
        path: "/procad/reportes",
        icon: HiOutlineDocumentChartBar,
        roles: ["administrador"],
      },
      {
        id: "modo",
        label: "Modo de vista",
        path: "/procad/modo",
        icon: HiOutlineArrowsRightLeft,
      },
    ],
  },
  {
    id: "voluntariado",
    label: "Voluntariado",
    path: "/voluntariado",
    icon: HiOutlineHandRaised,
    children: [
      {
        id: "voluntariado-tablero",
        label: "Tablero nacional",
        path: "/voluntariado/tablero",
        icon: HiOutlineChartBar,
      },
      {
        id: "voluntariado-estadisticas",
        label: "Estadísticas",
        path: "/voluntariado/estadisticas",
        icon: HiOutlinePresentationChartLine,
      },
      {
        id: "voluntariado-solicitudes-grupos",
        label: "Solicitudes de grupos",
        path: "/voluntariado/solicitudes-grupos",
        icon: HiOutlineClipboardDocumentList,
      },
      {
        id: "voluntariado-actividades",
        label: "Aprobación de actividades",
        path: "/voluntariado/actividades/aprobacion",
        icon: HiOutlineMap,
      },
      {
        id: "voluntariado-informes",
        label: "Informes trimestrales",
        path: "/voluntariado/informes",
        icon: HiOutlineDocumentMagnifyingGlass,
      },
      {
        id: "voluntariado-grupos",
        label: "Gestión de grupos",
        path: "/voluntariado/grupos",
        icon: HiOutlineUser,
      },
      {
        id: "voluntariado-diplomas",
        label: "Diplomas",
        path: "/voluntariado/diplomas",
        icon: HiOutlineHandRaised,
      },
      {
        id: "voluntariado-catalogos",
        label: "Catálogos",
        path: "/voluntariado/catalogos",
        icon: HiOutlineCog6Tooth,
      },
    ],
  },
  {
    id: "pagos",
    label: "Pagos",
    path: "/pagos",
    icon: HiOutlineCurrencyDollar,
  },
  {
    id: "mantenimientos",
    label: "Mantenimientos",
    path: "/mantenimientos",
    icon: HiOutlineCog6Tooth,
  },
  {
    id: "seguridad",
    label: "Seguridad",
    path: "/seguridad",
    icon: HiOutlineLockClosed,
  },
];