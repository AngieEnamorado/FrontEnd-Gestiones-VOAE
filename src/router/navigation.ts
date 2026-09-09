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
  HiOutlineBookOpen,
  HiOutlineHandRaised,
  HiOutlinePresentationChartLine,
} from "react-icons/hi2";
import type { IconType } from "react-icons";

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
    label: "Procad",
    path: "/procad",
    icon: HiOutlineBookOpen,
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