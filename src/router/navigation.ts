import {
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
  HiOutlinePresentationChartLine,
  HiOutlineUserGroup,
  HiOutlineDocumentChartBar,
  HiOutlineArrowsRightLeft,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import type { RolProcad } from "../types";

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
}

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
    children: [
      {
        id: "mis-giras",
        label: "Mis giras",
        path: "/giras/mis-giras",
        icon: HiOutlineMap,
      },
      {
        id: "solicitudes",
        label: "Solicitudes",
        path: "/giras/solicitudes",
        icon: HiOutlineClipboardDocumentList,
      },
      {
        id: "estadisticas",
        label: "Estadísticas",
        path: "/giras/estadisticas",
        icon: HiOutlinePresentationChartLine,
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